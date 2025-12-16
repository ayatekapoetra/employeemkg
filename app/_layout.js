import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme, Platform, BackHandler, AppState } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { NativeBaseProvider } from 'native-base';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../src/store';
import theme from '../src/constants/theme';
import { AlertCustom } from '../src/components/common';
import VersionCheckService from '../src/services/VersionCheckService';
import UpdateModal from '../src/components/UpdateModal';
import { getBarang } from '../src/store/slices/barangSlice';
import { getGudang } from '../src/store/slices/gudangSlice';
import { getKaryawan } from '../src/store/slices/karyawanSlice';
import { getPemasok } from '../src/store/slices/pemasokSlice';
import { getPenyewa } from '../src/store/slices/penyewaSlice';
import { getShift } from '../src/store/slices/shiftSlice';


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

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        console.log('📥 Loading master data...');
        await Promise.all([
          dispatch(getBarang()),
          dispatch(getGudang()),
          dispatch(getKaryawan()),
          dispatch(getPemasok()),
          dispatch(getPenyewa()),
          dispatch(getShift()),
        ]);
        console.log('✅ Master data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading master data:', error);
      }
    };

    loadMasterData();
  }, [dispatch]);

  return (
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
