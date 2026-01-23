import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme, Platform, BackHandler, AppState, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NativeBaseProvider } from 'native-base';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../src/store';
import theme from '../src/constants/theme';
import { AlertCustom } from '../src/components/common';
import VersionCheckService from '../src/services/VersionCheckService';
import UpdateModal from '../src/components/UpdateModal';
import MasterDataProgress from '../src/components/common/MasterDataProgress';
import { PermissionService } from '../src/services/permissions';
import { downloadSpecificData } from '../src/store/slices/downloadSlice';
import database from '../src/database/SQLiteService';


// Polyfill for BackHandler removeEventListener (deprecated in RN 0.65+)
if (BackHandler && !BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventName, handler) => {
    const subscription = BackHandler.addEventListener(eventName, handler);
    return subscription?.remove?.();
  };
}

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const userAuth = useSelector(state => state.auth)?.user || {};
  const authToken = useSelector(state => state.auth)?.token;
  const segments = useSegments();

  const [masterDataLoaded, setMasterDataLoaded] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);

  // Master data loading progress states
  const [showMasterProgress, setShowMasterProgress] = useState(false);
  const [masterProgress, setMasterProgress] = useState(0);
  const [currentMasterStep, setCurrentMasterStep] = useState('');
  const [syncedCount, setSyncedCount] = useState(0);
  const [activeQueue, setActiveQueue] = useState(false);

  // Check if current route is login page
  const isLoginPage = segments[0] === 'login';
  
  // Debug segments
  console.log('[AppContent] Current segments:', segments, 'isLoginPage:', isLoginPage);

  /**
   * Download master data to SQLite for offline support
   * Flow: API → SQLite (local database) → AsyncStorage (fallback)
   */
  const downloadMasterDataToSQLite = async (forceRefresh = false) => {
    // Prevent duplicate calls
    if (isLoadingMasterData || masterDataLoaded || activeQueue) {
      console.log('⏸️ Master data already loading or loaded, skipping...');
      return false;
    }

    // Check if user is authenticated
    const token = await AsyncStorage.getItem('@token');
    if (!token) {
      console.log('⏸️ User not authenticated, skipping master data download');
      return false;
    }

    // Check if data is still fresh (less than 1 hour old)
    const lastFetchStr = await AsyncStorage.getItem('@masterDataLastFetch');
    const lastFetch = lastFetchStr ? parseInt(lastFetchStr, 10) : 0;
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    console.log('📊 Last fetch timestamp:', lastFetch ? new Date(lastFetch).toISOString() : 'never');
    console.log('📊 Time since last fetch:', lastFetch ? Math.floor((now - lastFetch) / (60 * 1000)) + ' minutes' : 'N/A');

    if (!forceRefresh && lastFetch && (now - lastFetch < ONE_HOUR)) {
      const minutesAgo = Math.floor((now - lastFetch) / (60 * 1000));
      console.log(`✅ SQLite data still fresh (synced ${minutesAgo} minutes ago), skipping...`);
      setMasterDataLoaded(true);
      return true;
    }
    
    console.log('🔄 Data needs refresh, proceeding with download...');

    // Set loading flag
    setIsLoadingMasterData(true);
    setActiveQueue(true);

    // Get usertype for conditional data loading
    let usertype = userAuth?.usertype;
    if (!usertype) {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          usertype = parsedUser?.usertype;
        }
      } catch (error) {
        console.error('Error reading user from AsyncStorage:', error);
      }
    }

    console.log('🔄 Starting master data download to SQLite...');
    console.log('👤 User type:', usertype || 'unknown');

    // Initialize SQLite database
    try {
      await database.ensureInitialized();
      console.log('✅ SQLite database ready');
    } catch (dbError) {
      console.error('❌ SQLite initialization failed:', dbError);
    }

    // Show progress bar
    console.log('🎯 Showing progress bar...');
    setShowMasterProgress(true);
    setMasterProgress(0);
    setSyncedCount(0);

    try {
      // Define data types to download with display names
      const dataTypes = [
        { key: 'gudang', name: 'Gudang', icon: '🏠' },
        { key: 'penyewa', name: 'Penyewa', icon: '🏢' },
        { key: 'karyawan', name: 'Karyawan', icon: '👥' },
        { key: 'shift', name: 'Shift Kerja', icon: '🕐' },
        { key: 'kegiatanpit', name: 'Kegiatan Pit', icon: '⛏️' },
        { key: 'lokasipit', name: 'Lokasi Pit', icon: '📍' },
        { key: 'oprdrv', name: 'Operator/Driver', icon: '🚛' },
        { key: 'equipment', name: 'Equipment', icon: '🔧' },
      ];

      // Add additional data for non-pengawas users
      const isPengawas = usertype?.toLowerCase() === 'pengawas';
      if (!isPengawas) {
        dataTypes.push(
          { key: 'barang', name: 'Barang', icon: '📦' },
          { key: 'pemasok', name: 'Pemasok', icon: '🛒' }
        );
      }

      const totalSteps = dataTypes.length;
      let successCount = 0;
      let totalSynced = 0;

      // Download each data type sequentially
      for (let i = 0; i < dataTypes.length; i++) {
        const dataType = dataTypes[i];
        
        // Update progress UI - Phase 1: Downloading from API
        setCurrentMasterStep(`${dataType.icon} Mengunduh ${dataType.name}...`);
        
        console.log(`📥 [${i + 1}/${totalSteps}] Downloading ${dataType.name}...`);

        try {
          // Use downloadSpecificData which handles: API → SQLite → AsyncStorage
          const result = await dispatch(downloadSpecificData(dataType.key)).unwrap();
          
          // Update progress UI - Phase 2: Synced to SQLite
          setCurrentMasterStep(`${dataType.icon} ${dataType.name} tersimpan (${result.count} data)`);
          
          successCount++;
          totalSynced += result.count || 0;
          setSyncedCount(totalSynced);
          
          console.log(`✅ [${i + 1}/${totalSteps}] ${dataType.name}: ${result.count} items synced to SQLite`);
        } catch (error) {
          console.error(`❌ [${i + 1}/${totalSteps}] Failed to download ${dataType.name}:`, error);
          setCurrentMasterStep(`⚠️ ${dataType.name} gagal diunduh`);
        }

        // Update progress percentage
        const progressValue = ((i + 1) / totalSteps) * 100;
        setMasterProgress(progressValue);
      }

      console.log(`✅ Master data download completed: ${successCount}/${totalSteps} successful, ${totalSynced} total items`);

      // Save timestamp
      await AsyncStorage.setItem('@masterDataLastFetch', Date.now().toString());

      // Show completion message briefly
      setCurrentMasterStep(`✅ Selesai! ${totalSynced} data tersimpan offline`);

      // Hide progress bar after delay
      setTimeout(() => {
        setShowMasterProgress(false);
        setMasterDataLoaded(true);
        setIsLoadingMasterData(false);
        setActiveQueue(false);
      }, 1500);

      return true;
    } catch (error) {
      console.error('❌ Error downloading master data:', error);
      setCurrentMasterStep('❌ Gagal mengunduh data');
      setTimeout(() => {
        setShowMasterProgress(false);
        setIsLoadingMasterData(false);
        setActiveQueue(false);
      }, 2000);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAndDownloadData = async () => {
      if (!isMounted || masterDataLoaded || activeQueue) return;

      const token = authToken || await AsyncStorage.getItem('@token');
      if (!token) return;

      await downloadMasterDataToSQLite();
    };

    checkAndDownloadData();

    return () => {
      isMounted = false;
    };
  }, [authToken, masterDataLoaded, activeQueue]);

  return (
    <View style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="checklog" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <AlertCustom />
        <StatusBar style="auto" />
      </ThemeProvider>

      {/* Master Data Progress Bar - Tampil di atas Bottom Tab Navigator, tapi tidak di login page */}
      {/* Debug: showMasterProgress={showMasterProgress}, isLoginPage={isLoginPage} */}
      <MasterDataProgress
        visible={showMasterProgress && !isLoginPage}
        progress={masterProgress}
        currentStep={currentMasterStep}
        syncedCount={syncedCount}
      />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
    'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Abel-Regular': require('../assets/fonts/Abel-Regular.ttf'),
  });

  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Version check function
  const checkForAppUpdate = async () => {
    try {
      console.log('🔍 ===== VERSION CHECK START (employeemkg) =====');
      const versionInfo = await VersionCheckService.checkForUpdate();

      console.log('🔍 Version Info Received:', versionInfo);

      if (versionInfo && versionInfo.updateAvailable) {
        console.log('✅ Update available! Showing modal...');
        console.log('📦 Update Info:', JSON.stringify(versionInfo, null, 2));
        console.log('🔍 forceUpdate value:', versionInfo.forceUpdate);
        console.log('🔍 forceUpdate type:', typeof versionInfo.forceUpdate);

        setUpdateInfo(versionInfo);
        setShowUpdateModal(true);
        console.log('✅ Modal state set: showUpdateModal = true');
      } else {
        console.log('✅ App is up to date (no update needed)');
        console.log('📊 versionInfo:', versionInfo);
      }
      console.log('🔍 ===== VERSION CHECK END =====');
    } catch (error) {
      console.error('❌ Version check failed:', error);
    }
  };

  const handleUpdate = () => {
    console.log('🔘 User tapped UPDATE button');
    const storeUrl = updateInfo?.storeUrl || (
      Platform.OS === 'ios'
        ? 'https://testflight.apple.com/join/a1eSpfb3'
        : 'https://play.google.com/store/apps/details?id=com.employeemkg'
    );

    console.log('🔗 Opening URL:', storeUrl);
    VersionCheckService.openStore(storeUrl);
  };

  const handleLater = () => {
    console.log('🔘 User tapped SKIP button');

    if (!updateInfo?.forceUpdate) {
      console.log('✅ Closing update modal (optional update)');
      setShowUpdateModal(false);
    } else {
      console.log('❌ Cannot close modal (force update required)');
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        let uniqueId;
        if (Platform.OS === 'android') {
          uniqueId = Application.androidId;
        } else {
          uniqueId = await Application.getIosIdForVendorAsync();
        }

        if (uniqueId) {
          await AsyncStorage.setItem('@DEVICESID', uniqueId);
          console.log('Device UUID set:', uniqueId);
        }

        // Request all permissions on app startup
        console.log('🔐 Requesting app permissions...');
        const permissions = await PermissionService.requestAllPermissions();
        console.log('📊 Permissions status:', permissions);

        // Check if critical permissions are granted
        const criticalGranted = await PermissionService.areCriticalPermissionsGranted();
        if (!criticalGranted) {
          console.warn('⚠️ Some critical permissions were not granted. App features may be limited.');
        }

        // Only sync time with server if user is authenticated (has token)
        // server-times endpoint requires authentication
        // We'll let individual components handle time sync when needed
        console.log('⏰ Skipping server time sync - will sync when user logs in');

        // Check for app update after initialization
        await checkForAppUpdate();
      } catch (error) {
        console.error('Error setting device UUID:', error);
      }
    };

    initializeApp();
  }, []);

  // Check for updates when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active, checking for updates...');
        await checkForAppUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const config = {
    suppressColorAccessibilityWarning: true,
  };

  return (
    <Provider store={store}>
      <NativeBaseProvider theme={theme} config={config} isSSR={false}>
        <AppContent />
        <UpdateModal
          visible={showUpdateModal}
          updateInfo={updateInfo}
          onUpdate={handleUpdate}
          onLater={handleLater}
        />
      </NativeBaseProvider>
    </Provider>
  );
}
