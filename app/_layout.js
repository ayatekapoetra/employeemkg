import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme, Platform, BackHandler, AppState, View, DeviceEventEmitter } from 'react-native';
import * as Updates from 'expo-updates';
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

import { loadMasterDataAfterLogin, loadSQLiteToReduxAfterSync } from '../src/store/slices/authSlice';

// OTA version marker for tracking
import OTA_VERSION from '../src/constants/otaVersion';
const otaMarker = OTA_VERSION;


// Polyfill for BackHandler removeEventListener (deprecated in RN 0.65+)
if (BackHandler && !BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventName, handler) => {
    const subscription = BackHandler.addEventListener(eventName, handler);
    return subscription?.remove?.();
  };
}

// Initialize splash screen with error handling
SplashScreen.preventAutoHideAsync().catch(error => {
  console.log('SplashScreen preventAutoHideAsync error (safe to ignore):', error.message);
});

function AppContent() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const userAuth = useSelector(state => state.auth)?.user || {};
  const authToken = useSelector(state => state.auth)?.token;
  const segments = useSegments();

  // Log OTA marker for debugging
  console.log('🚀 OTA Marker:', otaMarker);

  const [masterDataLoaded, setMasterDataLoaded] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);

  // Master data loading progress states
  const [showMasterProgress, setShowMasterProgress] = useState(false);
  const [masterProgress, setMasterProgress] = useState(0);
  const [currentMasterStep, setCurrentMasterStep] = useState('');
  const [syncedCount, setSyncedCount] = useState(0);
  const [activeQueue, setActiveQueue] = useState(false);
  const [autoSyncDisabled, setAutoSyncDisabled] = useState(true); // Default TRUE - disable auto-sync by default
  const [autoSyncInitialized, setAutoSyncInitialized] = useState(false); // Track if we've loaded the flag

  // Check if current route is login page
  const isLoginPage = segments[0] === 'login';

  // Debug segments
  console.log('[AppContent] Current segments:', segments, 'isLoginPage:', isLoginPage);

  // OTA auto-check on foreground (silent fetch + immediate reload)
  useEffect(() => {
    let isChecking = false;

    const checkAndUpdate = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        console.log('[OTA] Checking for updates...', { otaMarker });
        const res = await Updates.checkForUpdateAsync();
        console.log('[OTA] Check result:', res);
        
        if (res.isAvailable) {
          console.log('[OTA] Update available, downloading...');
          const fetchResult = await Updates.fetchUpdateAsync();
          console.log('[OTA] Fetch result:', fetchResult);
          
          await Updates.reloadAsync();
          console.log('[OTA] App reloaded');
        }
      } catch (e) {
        console.error('[OTA] Check/fetch failed:', e?.message || e);
      } finally {
        isChecking = false;
      }
    };

    // Run once on mount
    checkAndUpdate();

    // Re-run when app returns to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkAndUpdate();
    });

    return () => sub?.remove?.();
  }, []);



  /**
   * Download master data to SQLite for offline support
   * Flow: API → SQLite (local database) → AsyncStorage (fallback) → Redux (on completion)
   */
  const downloadMasterDataToSQLite = async (forceRefresh = false) => {
    // Prevent duplicate calls
    if (isLoadingMasterData || activeQueue) {
      console.log('⏸️ Master data already loading, skipping...');
      return false;
    }

    // Never block UI; assume data is “loaded” while background sync runs
    setMasterDataLoaded(true);

    if (!forceRefresh && autoSyncDisabled) {
      console.log('⏸️ Auto-sync disabled, skipping automatic master data download.');
      return false;
    }

    // Check if user is authenticated
    const token = await AsyncStorage.getItem('@token');
    if (!token) {
      console.log('⏸️ User not authenticated, skipping master data download');
      return false;
    }

    console.log('🔄 Data needs refresh, proceeding with download (background)...');

    // Background flags: do not set loading to true to avoid spinner lock
    setIsLoadingMasterData(false);
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

    // Show progress bar (non-blocking for UI)
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

      // Load data from SQLite to Redux after download completes
      console.log('🔄 Loading data from SQLite to Redux after sync...');
      try {
        await dispatch(loadSQLiteToReduxAfterSync()).unwrap();
        console.log('✅ Successfully loaded SQLite data to Redux');
      } catch (error) {
        console.error('❌ Error loading SQLite to Redux:', error);
        // Fallback to old method if new method fails
        try {
          console.log('🔄 Fallback: Loading master data directly...');
          await dispatch(loadMasterDataAfterLogin()).unwrap();
          console.log('✅ Fallback loading completed');
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }

      // Hide progress bar after delay
      setTimeout(() => {
        setShowMasterProgress(false);
        setMasterDataLoaded(true);
        setAutoSyncDisabled(true);
        setIsLoadingMasterData(false);
        setActiveQueue(false);
        AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'true');
      }, 200);

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

  // Load auto-sync flag on mount - check if we've already synced after login
  useEffect(() => {
    const loadAutoSyncFlag = async () => {
      try {
        const storedFlag = await AsyncStorage.getItem('@masterDataAutoSyncDisabled');
        const lastFetch = await AsyncStorage.getItem('@masterDataLastFetch');
        
        console.log('[AppContent] Loading auto-sync flags:', {
          storedFlag,
          lastFetch,
          hasLastFetch: !!lastFetch,
        });

        // If we have a last fetch timestamp, it means we've already synced before
        // So we should disable auto-sync
        if (lastFetch) {
          setAutoSyncDisabled(true);
          console.log('[AppContent] Found last fetch timestamp - auto-sync DISABLED');
        } else if (storedFlag === 'true') {
          setAutoSyncDisabled(true);
          console.log('[AppContent] Stored flag is true - auto-sync DISABLED');
        } else if (storedFlag === 'false') {
          // Explicitly set to false (after login)
          setAutoSyncDisabled(false);
          console.log('[AppContent] Stored flag is false - auto-sync ENABLED (after login)');
        } else {
          // No last fetch and no stored flag = fresh install or after logout
          // Keep auto-sync disabled by default, only enable on login
          setAutoSyncDisabled(true);
          console.log('[AppContent] No last fetch and no flag - auto-sync DISABLED (default)');
        }
        
        setAutoSyncInitialized(true);
      } catch (error) {
        console.error('[AppContent] Error loading auto-sync flag:', error);
        setAutoSyncDisabled(true); // Default to disabled on error
        setAutoSyncInitialized(true);
      }
    };
    loadAutoSyncFlag();
  }, []);

  // Watch for login success - load master data directly using Redux thunks
  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (authToken) {
        console.log('[AppContent] ✅ User logged in, loading master data...');
        
        try {
          // Load master data directly using Redux thunks
          const result = await dispatch(loadMasterDataAfterLogin()).unwrap();
          console.log('[AppContent] ✅ Master data loaded successfully:', result);
          
          // Also set auto-sync flag for background downloads
          const storedFlag = await AsyncStorage.getItem('@masterDataAutoSyncDisabled');
          if (storedFlag === 'false') {
            console.log('[AppContent] ✅ Auto-sync enabled by login, background download will start');
            setAutoSyncDisabled(false);
            setMasterDataLoaded(false);
          } else {
            console.log('[AppContent] ✅ Setting master data as loaded');
            setMasterDataLoaded(true);
          }
          
        } catch (error) {
          console.error('[AppContent] ❌ Error loading master data:', error);
          
          // Fallback to loading master data again
          try {
            console.log('[AppContent] 🔄 Fallback: Retrying master data load...');
            await dispatch(loadMasterDataAfterLogin()).unwrap();
            console.log('[AppContent] ✅ Fallback loading completed successfully');
          } catch (fallbackError) {
            console.error('[AppContent] ❌ Fallback loading also failed:', fallbackError);
          }
        }
      }
    };
    handleLoginSuccess();
  }, [authToken]);

  const downloadMasterDataToSQLiteRef = useRef(downloadMasterDataToSQLite);
  useEffect(() => {
    downloadMasterDataToSQLiteRef.current = downloadMasterDataToSQLite;
  }, [downloadMasterDataToSQLite]);

  // Listen for manual trigger from DownloadDataScreen or after login
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('masterDataAutoSyncReset', async () => {
      console.log('♻️ Manual reset auto-sync requested from DownloadDataScreen');
      console.log('♻️ This will trigger progress bar to show');
      setMasterDataLoaded(false);
      setAutoSyncDisabled(false);
      await AsyncStorage.removeItem('@masterDataLastFetch');
      await AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'false');
      downloadMasterDataToSQLiteRef.current?.(true);
    });

    return () => subscription.remove();
  }, []);

  // Only auto-download if explicitly enabled (for background syncing)
  useEffect(() => {
    let isMounted = true;

    const checkAndDownloadData = async () => {
      // Don't run until we've loaded the auto-sync flag
      if (!autoSyncInitialized) {
        console.log('[AppContent] Auto-sync not initialized yet, skipping...');
        return;
      }

      if (!isMounted || masterDataLoaded || activeQueue || autoSyncDisabled) {
        console.log('[AppContent] Skipping background auto-download:', {
          isMounted,
          masterDataLoaded,
          activeQueue,
          autoSyncDisabled,
        });
        return;
      }

      const token = authToken || await AsyncStorage.getItem('@token');
      if (!token) {
        console.log('[AppContent] No token found, skipping background auto-download');
        return;
      }

      console.log('[AppContent] Starting background master data sync (SQLite/AsyncStorage backup)');
      await downloadMasterDataToSQLite();
    };

    checkAndDownloadData();

    return () => {
      isMounted = false;
    };
  }, [authToken, masterDataLoaded, activeQueue, autoSyncDisabled, autoSyncInitialized]);

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
          uniqueId = Application.getAndroidId();
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
      // Add a delay to ensure splash screen is properly registered and app is ready
      const timer = setTimeout(async () => {
        try {
          // Check if splash screen is visible before hiding
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden successfully');
        } catch (error) {
          console.log('SplashScreen hide error (safe to ignore):', error.message);
        }
      }, 1000); // Increase delay to 1000ms
      
      return () => clearTimeout(timer);
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
