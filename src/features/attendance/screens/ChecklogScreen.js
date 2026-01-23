import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';
import { Location, Scan } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Platform, Image as RNImage, TouchableOpacity, View, Alert, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ExpoLocation from 'expo-location';
import { PermissionService } from '../../../services/permissions';
import lokasiAbsenData from '../../../../assets/json/lokasiAbsen.json';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../components/common';
import { COLORS } from '../../../constants/colors';
import { LocationService } from '../../../services';
import { applyAlert } from '../../../store/slices/alertSlice';
import { checkIn, checkOut } from '../../../store/slices/checklogSlice';
import { getKoordinatChecklog } from '../../../store/slices/koordinatChecklogSlice';
import CameraScreen from '../components/CameraScreen';
import timeSync from '../../../utils/timeSync';

moment.locale('id');

const { width } = Dimensions.get('screen');

let MapView = null;
let Circle = null;
let Marker = null;
let PROVIDER_GOOGLE = null;
let hasMapSupport = false;
let mapLoadError = null;

// Add delay for Android to prevent crash during map loading
const loadMaps = () => {
  try {
    console.log('🗺️ Loading react-native-maps...');
    const RNMaps = require('react-native-maps');

    // Check if RNMaps is properly loaded
    if (!RNMaps) {
      throw new Error('react-native-maps returned null/undefined');
    }

    MapView = RNMaps.default || RNMaps;
    Circle = RNMaps.Circle;
    Marker = RNMaps.Marker;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;

    // Validate all required components
    if (!MapView) {
      throw new Error('MapView component not found');
    }
    if (!Circle) {
      throw new Error('Circle component not found');
    }
    if (!Marker) {
      throw new Error('Marker component not found');
    }

    hasMapSupport = true;
    console.log('✅ Maps loaded successfully');
    console.log('MapView:', typeof MapView);
    console.log('Circle:', typeof Circle);
    console.log('Marker:', typeof Marker);
  } catch (error) {
    console.error('❌ Maps failed to load:', error.message);
    console.error('Full error:', error);
    mapLoadError = error.message;
    hasMapSupport = false;
    MapView = null;
    Circle = null;
    Marker = null;
  }
};

// Map module will be loaded after mount via useEffect

const lokasiAbsensi = lokasiAbsenData.RECORDS.map(item => ({
  site_id: parseInt(item.id),
  nama: item.nama,
  latitude: parseFloat(item.latitude),
  longitude: parseFloat(item.longitude),
  radius: item.radius || 100,
  aktif: item.aktif,
})).filter(item => item.aktif === 'Y');

function ChecklogScreen() {
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { user } = useSelector(state => state.auth) || {};

  const [openKamera, setOpenKamera] = useState({ visible: false, metode: '' });
  const [photo, setPhoto] = useState(null);
  const [jarak, setJarak] = useState({ jarak: 100, site: '', checkpoint: '', latitude: 0, longitude: 0 });
  const [currentClock, setCurrentClock] = useState(null); // Will use server time
  const [myLocation, setMyLocation] = useState(null);
  const [fakeGPS, setFakeGPS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogmasuk, setLogmasuk] = useState(false);
  const [isLogpulang, setLogpulang] = useState(false);
  const [checklogPin, setChecklogPin] = useState(lokasiAbsensi);
  const [location, setLocation] = useState({
    latitude: -5.145109,
    longitude: 119.44856182,
  });

  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(pulseAnimation);
    };

    pulseAnimation();
    return () => pulseAnim.stopAnimation();
  }, [pulseAnim]);

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const iconColor = mode === 'dark' ? COLORS.ico.dark[2] : COLORS.ico.light[2];

  useEffect(() => {
    // Server Time Sync & Clock Update
    const initTimeSync = async () => {
      // Only sync with server if user is authenticated (has token)
      const token = await AsyncStorage.getItem('@token');
      if (token) {
        await timeSync.syncWithServer();
        timeSync.startAutoSync(10); // Sync every 10 minutes
      } else {
        console.log('⏰ User not logged in, using local device time');
        timeSync.useLocalTime(); // Use local time immediately
      }
    };

    initTimeSync();

    // Update clock every second using server time (with automatic fallback to local time)
    const interval = setInterval(() => {
      const currentTime = timeSync.getCurrentTime();
      setCurrentClock(currentTime);
    }, 1000);

    return () => {
      clearInterval(interval);
      timeSync.stopAutoSync();
    };
  }, []);

  // Fetch koordinat checklog on mount - only if authenticated
  useEffect(() => {
    const fetchKoordinat = async () => {
      const token = await AsyncStorage.getItem('@token');
      if (token) {
        console.log('📍 Fetching koordinat checklog...');
        dispatch(getKoordinatChecklog());
      } else {
        console.log('⏭️ Skipping koordinat fetch - user not logged in');
      }
    };

    fetchKoordinat();
  }, [dispatch]);

  useEffect(() => {
    console.log('Mounting ChecklogScreen...');
    let isMounted = true;

    const initializeData = async () => {
      try {
        if (isMounted) {
          // Load maps first
          loadMaps();

          // Wait a bit for maps to load
          await new Promise(resolve => setTimeout(resolve, 500));

          await getDataInitial();

          // Then get location with additional delay
          setTimeout(() => {
            if (isMounted) getLocation();
          }, 1000);
        }
      } catch (error) {
        console.error('Mount error:', error);
        if (isMounted) {
          dispatch(
            applyAlert({
              show: true,
              status: 'error',
              title: 'Initialization Error',
              subtitle: 'Failed to initialize attendance screen. Please restart the app.',
            })
          );
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getLocation = async () => {
    console.log('🌍 getLocation called');
    setLoading(true);
    try {
      console.log('📍 Getting location...');

      // Add delay to prevent immediate crash on Android
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check if location permission is already granted (requested on app startup)
      console.log('🔍 Checking location permission status...');
      const hasPermission = await PermissionService.checkLocation();

      if (!hasPermission) {
        throw new Error('Location permission is required for attendance check-in/out. Please grant permission in app settings and restart the app.');
      }

      console.log('✅ Location permission granted');

      // Check if location services are enabled
      const enabled = await ExpoLocation.hasServicesEnabledAsync();
      if (!enabled) {
        throw new Error('Location services are disabled. Please enable them in your device settings.');
      }

      console.log('✅ Location services enabled');

      // Get location with Fake GPS Detection
      const current = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      // ============================================
      // FAKE GPS DETECTION
      // ============================================
      if (current?.mocked) {
        console.warn('⚠️ Fake GPS detected!');
        setFakeGPS(true);
        setLoading(false);

        Alert.alert(
          'System Detect Fake GPS',
          'Anda tidak diperbolehkan menggunakan fitur ini dengan lokasi tiruan. System akan memberikan notifikasi ke Team HRD dan menyimpan lokasi tiruan anda.',
          [{ text: 'OK', onPress: () => setFakeGPS(false) }]
        );
        return;
      }

      console.log('✅ Location verified (not mocked):', current.coords);

      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy,
      };

      console.log('✅ Location received:', coords);

      if (coords && coords.latitude && coords.longitude) {
        setMyLocation(coords);
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        calculateDistance(coords);
        console.log('✅ Location set successfully:', {
          lat: coords.latitude,
          lon: coords.longitude
        });
      } else {
        throw new Error('Invalid coordinates received');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Location error:', error.message);
      console.error('Error details:', error);
      setLoading(false);

      const defaultLocation = {
        latitude: -5.145160066718947,
        longitude: 119.44856202229857,
        accuracy: 5,
      };

      console.log('⚠️ Using default location (Kopi Kebun):', defaultLocation);

      setMyLocation(defaultLocation);
      setLocation(defaultLocation);
      calculateDistance(defaultLocation);

      // Show appropriate error message based on error type
      let subtitle = 'Tidak dapat mengakses GPS. Menggunakan lokasi default.';
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        subtitle = 'Izin lokasi diperlukan untuk absensi. Silakan buka Settings dan grant izin lokasi.';
      } else if (error.message.includes('Location services') || error.message.includes('disabled')) {
        subtitle = 'Layanan lokasi dimatikan. Silakan aktifkan di Settings device Anda.';
      } else if (Platform.OS === 'ios') {
        subtitle = 'Simulator: Set lokasi via Features → Location → Custom Location';
      }

      dispatch(
        applyAlert({
          show: true,
          status: 'warning',
          title: 'Lokasi GPS',
          subtitle: subtitle,
        })
      );
    }
  };

  const getDataInitial = async () => {
    try {
      const cachedLocations = await AsyncStorage.getItem('@lokasi-absensi');
      if (cachedLocations) {
        const locations = JSON.parse(cachedLocations);
        setChecklogPin(locations);
      } else {
        console.log('Using default locations from JSON');
      }

      setLogmasuk(true);
      setLogpulang(true);
      console.log('Initial data set');
    } catch (error) {
      console.error('getDataInitial error:', error);
    }
  };

  const calculateDistance = (coords) => {
    const arr = checklogPin
      .map(m => {
        const distance = getDistance(
          { latitude: m.latitude, longitude: m.longitude },
          { latitude: coords.latitude, longitude: coords.longitude }
        );

        return {
          jarak: distance,
          site: m.site_id,
          checkpoint: m.nama,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      })
      .sort((a, b) => a.jarak - b.jarak);

    setJarak(arr[0]);
  };

  const selfyLogmasukHandle = () => {
    if (jarak.jarak >= 100) {
      dispatch(
        applyAlert({
          show: true,
          status: 'warning',
          title: 'Peringatan',
          subtitle: 'Anda tidak berada pada radius lokasi absensi',
        })
      );
      return;
    }
    setOpenKamera({ visible: true, metode: 'in' });
  };

  const selfyLogpulangHandle = () => {
    if (jarak.jarak >= 100) {
      dispatch(
        applyAlert({
          show: true,
          status: 'warning',
          title: 'Peringatan',
          subtitle: 'Anda tidak berada pada radius lokasi absensi',
        })
      );
      return;
    }
    setOpenKamera({ visible: true, metode: 'out' });
  };

  const handlePhotoCapture = async (capturedPhoto) => {
    console.log('Photo captured:', capturedPhoto);
    setPhoto(capturedPhoto);
    setOpenKamera({ visible: false, metode: '' });
    setLoading(true);

    try {
      const checklogData = {
        latitude: jarak.latitude,
        longitude: jarak.longitude,
        jarak: jarak.jarak,
        photo: capturedPhoto,
      };

      let resultAction;
      if (openKamera.metode === 'in') {
        resultAction = await dispatch(checkIn(checklogData));
        setLogmasuk(false);
        setLogpulang(true);
      } else {
        resultAction = await dispatch(checkOut(checklogData));
        setLogpulang(false);
      }

      setLoading(false);

      const result = resultAction.payload;
      const diagnostic = result?.diagnostic;

      if (diagnostic && diagnostic.message) {
        console.log('Using diagnostic message:', diagnostic.message);
        dispatch(
          applyAlert({
            show: true,
            status: diagnostic.error ? 'warning' : 'success',
            title: diagnostic.error ? 'Perhatian' : 'Berhasil',
            subtitle: diagnostic.message,
            duration: 5000,
          })
        );
      } else {
        console.log('No diagnostic, using default message');
        dispatch(
          applyAlert({
            show: true,
            status: 'success',
            title: 'Berhasil',
            subtitle: `Check-${openKamera.metode === 'in' ? 'in' : 'out'} berhasil`,
            duration: 3000,
          })
        );
      }

      await getDataInitial();
    } catch (error) {
      console.error('Checklog error:', error);
      setLoading(false);

      dispatch(
        applyAlert({
          show: true,
          status: 'error',
          title: 'Gagal',
          subtitle: error || `Check-${openKamera.metode === 'in' ? 'in' : 'out'} gagal`,
        })
      );
    }
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} meter`;
  };

  if (openKamera.visible) {
    return (
      <CameraScreen
        metode={openKamera.metode}
        onCapture={handlePhotoCapture}
        onClose={() => setOpenKamera({ visible: false, metode: '' })}
      />
    );
  }

  if (loading) {
    console.log('Showing loading...');
    return (
      <AppScreen>
        <LoadingHauler />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <VStack h="full">
        <HeaderScreen title="Checklog Kehadiran" showBack onThemes onNotification />

        <Center bg={backgroundColor}>
          <Text fontSize={20} fontFamily="Quicksand-Light" color={textColor}>
            {currentClock ? moment(currentClock).format('dddd, DD MMMM YYYY') : moment().format('dddd, DD MMMM YYYY')}
          </Text>
          <Text lineHeight="xs" fontSize={45} fontFamily="Quicksand-Bold" color={textColor}>
            {currentClock ? moment(currentClock).format('HH:mm:ss') : 'Memuat...'}
          </Text>
        </Center>

        {!openKamera.visible && (
          <VStack bg={backgroundColor}>
            {!fakeGPS && (
              <HStack space={2} mx={3} alignItems="center" justifyContent="space-around">
                {isLogmasuk ? (
                  <TouchableOpacity onPress={selfyLogmasukHandle} style={{ flex: 1 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg={mode === 'dark' ? COLORS.box.dark : COLORS.box.light}
                      borderWidth={2}
                      borderColor={mode === 'dark' ? COLORS.line.dark[4] : COLORS.line.light[4]}
                      rounded="md"
                      shadow={2}
                    >
                      <Scan size="32" color={mode === 'dark' ? COLORS.ico.dark[4] : COLORS.ico.light[4]} variant="Bulk" />
                      <Text fontWeight="semibold" fontFamily="Quicksand-SemiBold" color={textColor}>
                        Checklog Masuk
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => console.log('Navigate to Riwayat')} style={{ flex: 1 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg={mode === 'dark' ? COLORS.box.dark : COLORS.box.light}
                      borderWidth={2}
                      borderColor={mode === 'dark' ? COLORS.line.dark[1] : COLORS.line.light[1]}
                      rounded="md"
                      shadow={2}
                      opacity={0.6}
                    >
                      <Scan size="32" color={iconColor} variant="Bulk" />
                      <Text fontWeight="600" fontFamily="Poppins-SemiBold" color={mode === 'dark' ? COLORS.teks.dark[2] : COLORS.teks.light[2]}>
                        Riwayat Masuk
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                )}

                {isLogpulang ? (
                  <TouchableOpacity onPress={selfyLogpulangHandle} style={{ flex: 1 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg={mode === 'dark' ? COLORS.box.dark : COLORS.box.light}
                      borderWidth={2}
                      borderColor={mode === 'dark' ? COLORS.line.dark[3] : COLORS.line.light[3]}
                      rounded="md"
                      shadow={2}
                    >
                      <Scan size="32" color={mode === 'dark' ? COLORS.teks.dark[5] : COLORS.teks.light[5]} variant="Bulk" />
                      <Text fontWeight="semibold" fontFamily="Quicksand-SemiBold" color={textColor}>
                        Checklog Pulang
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => console.log('Navigate to Riwayat')} style={{ flex: 1 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg={mode === 'dark' ? COLORS.box.dark : COLORS.box.light}
                      borderWidth={2}
                      borderColor={mode === 'dark' ? COLORS.line.dark[1] : COLORS.line.light[1]}
                      rounded="md"
                      shadow={2}
                      opacity={0.6}
                    >
                      <Scan size="32" color={iconColor} variant="Bulk" />
                      <Text fontWeight="600" fontFamily="Poppins-SemiBold" color={mode === 'dark' ? COLORS.teks.dark[2] : COLORS.teks.light[2]}>
                        Riwayat Pulang
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                )}
              </HStack>
            )}

            <VStack my={2} justifyContent="center" alignItems="center">
              {jarak.jarak < 10 && (
                <Text fontSize={12} fontWeight="300" fontFamily="Poppins-Light" color="#10b981">
                  Anda berada pada radius checklog {jarak.jarak.toFixed(0)} meter
                </Text>
              )}
              {jarak.jarak >= 10 && jarak.jarak <= 100 && (
                <Text fontSize={12} fontWeight="300" fontFamily="Poppins-Light" color="#f59e0b">
                  Anda berada pada radius checklog {jarak.jarak.toFixed(0)} meter
                </Text>
              )}
              {jarak.jarak > 100 && (
                <Text fontSize={12} fontWeight="300" fontFamily="Poppins-Light" color="#ef4444">
                  Anda berada pada radius checklog {jarak.jarak.toFixed(0)} meter
                </Text>
              )}
            </VStack>
          </VStack>
        )}

        <VStack flex={1}>
          {myLocation && hasMapSupport && MapView && Circle && Marker && location?.latitude && location?.longitude && (
            <Center
              flex={1}
              bg={mode === 'dark' ? 'linear-gradient-to-b from-gray-900 via-gray-800 to-gray-900' : 'linear-gradient-to-b from-blue-50 via-blue-100 to-blue-50'}
              p={6}
            >
              {/* Animated Location Icon with Pulse Effect */}
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.25)',
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.8],
                        }),
                      },
                    ],
                    opacity: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 0],
                    }),
                  }}
                />
                <Location size={48} color={jarak.jarak < 100 ? '#10b981' : '#ef4444'} variant="Bulk" />
              </Box>

              {/* Title */}
              <Text fontSize="2xl" fontFamily="Poppins-Bold" color={textColor} mt={5} textAlign="center">
                Lokasi Presisi
              </Text>

              {/* Location Name Badge */}
              {jarak.checkpoint && (
                <Box
                  style={{
                    marginTop: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                    borderRadius: 24,
                    borderWidth: 1.5,
                    borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(59, 130, 246, 0.3)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    shadowColor: mode === 'dark' ? '#6366f1' : '#3b82f6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: mode === 'dark' ? '#6366f1' : '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Text fontSize={10} color="white" fontWeight="bold">
                      📍
                    </Text>
                  </Box>
                  <Text fontSize="sm" fontFamily="Poppins-SemiBold" color={mode === 'dark' ? '#a5b4fc' : '#3b82f6'}>
                    {jarak.checkpoint}
                  </Text>
                </Box>
              )}

              {/* Status Badge */}
              <Box
                style={{
                  marginTop: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: jarak.jarak < 100
                    ? mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                    : mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: jarak.jarak < 100 ? '#10b981' : '#ef4444',
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: jarak.jarak < 100 ? '#10b981' : '#ef4444',
                    marginRight: 8,
                  }}
                />
                <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={jarak.jarak < 100 ? '#10b981' : '#ef4444'}>
                  {jarak.jarak < 100 ? 'Dalam Radius' : 'Di Luar Radius'}
                </Text>
              </Box>

              {/* Location Details Card */}
              <Box
                style={{
                  marginTop: 20,
                  padding: 16,
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  width: '100%',
                  maxWidth: 320,
                  backdropBlur: 'blur',
                }}
              >
                <VStack space={3}>
                  {/* Latitude */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text fontSize={12}>📍</Text>
                      </Box>
                      <Text fontSize="xs" color={iconColor} fontFamily="Poppins-Medium">
                        Latitude
                      </Text>
                    </HStack>
                    <Text
                      fontSize="xs"
                      fontFamily="Quicksand-Bold"
                      color={textColor}
                      style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
                    >
                      {myLocation.latitude.toFixed(6)}
                    </Text>
                  </HStack>

                  {/* Longitude */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text fontSize={12}>🌐</Text>
                      </Box>
                      <Text fontSize="xs" color={iconColor} fontFamily="Poppins-Medium">
                        Longitude
                      </Text>
                    </HStack>
                    <Text
                      fontSize="xs"
                      fontFamily="Quicksand-Bold"
                      color={textColor}
                      style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
                    >
                      {myLocation.longitude.toFixed(6)}
                    </Text>
                  </HStack>

                  {/* Distance */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: jarak.jarak < 100
                            ? mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                            : mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text fontSize={12}>📏</Text>
                      </Box>
                      <Text fontSize="xs" color={iconColor} fontFamily="Poppins-Medium">
                        Jarak
                      </Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                      <Text
                        fontSize="lg"
                        fontFamily="Quicksand-Bold"
                        color={jarak.jarak < 100 ? '#10b981' : '#ef4444'}
                      >
                        {jarak.jarak.toFixed(0)}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={jarak.jarak < 100 ? '#10b981' : '#ef4444'}
                        fontFamily="Poppins-SemiBold"
                      >
                        m
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Accuracy Info */}
              {myLocation.accuracy && (
                <Text
                  fontSize="xs"
                  color={iconColor}
                  fontFamily="Poppins-Light"
                  style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}
                >
                  Akurasi: ±{Math.round(myLocation.accuracy)} meter
                </Text>
              )}
            </Center>
          )}
        </VStack>
      </VStack>
    </AppScreen>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ChecklogScreen Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppScreen>
          <VStack flex={1} justifyContent="center" alignItems="center" p={4}>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color="red.500" mb={2}>
              Error Loading Map
            </Text>
            <Text fontSize="sm" fontFamily="Poppins-Light" textAlign="center" mb={4}>
              {this.state.error?.message || 'Unknown error occurred'}
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color="gray.500" textAlign="center">
              Possible causes:{'\n'}
              • Google Maps API key not configured{'\n'}
              • Location permissions denied{'\n'}
              • Network connection issue
            </Text>
          </VStack>
        </AppScreen>
      );
    }

    return this.props.children;
  }
}

export default function ChecklogScreenWrapper() {
  return (
    <ErrorBoundary>
      <ChecklogScreen />
    </ErrorBoundary>
  );
}
