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

// Map components disabled (react-native-maps removed)
const MapView = null;
const Circle = null;
const Marker = null;
const PROVIDER_GOOGLE = null;
const hasMapSupport = false;
const mapLoadError = 'react-native-maps not installed';

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
    console.log('Mounting ChecklogScreen (maps disabled)...');
    let isMounted = true;

    const initializeData = async () => {
      try {
        if (isMounted) {
          // Skip map loading because react-native-maps is removed
          await getDataInitial();

          // Then get location with slight delay
          setTimeout(() => {
            if (isMounted) getLocation();
          }, 500);
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
          {myLocation && (
            <Center
              flex={1}
              bg={mode === 'dark' ? '#0b1224' : '#eef2ff'}
              p={6}
            >
              {/* Animated Location Icon with Pulse Effect */}
              <Box
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)',
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
                      outputRange: [0.6, 0],
                    }),
                  }}
                />
                <Location size={52} color={jarak.jarak < 100 ? '#10b981' : '#ef4444'} variant="Bulk" />
              </Box>

              <Text fontSize="2xl" fontFamily="Poppins-Bold" color={textColor} mt={5} textAlign="center">
                Lokasi Presisi
              </Text>

              {jarak.checkpoint && (
                <Box
                  style={{
                    marginTop: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                >
                  <Text fontSize={14} style={{ marginRight: 8 }}>📍</Text>
                  <Text fontSize="sm" fontFamily="Poppins-SemiBold" color={mode === 'dark' ? '#bfdbfe' : '#1d4ed8'}>
                    {jarak.checkpoint}
                  </Text>
                </Box>
              )}

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

              <Box
                style={{
                  marginTop: 18,
                  padding: 16,
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  width: '100%',
                  maxWidth: 360,
                }}
              >
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Text fontSize={12}>📍</Text>
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

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Text fontSize={12}>🌐</Text>
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

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Text fontSize={12}>📏</Text>
                      <Text fontSize="xs" color={iconColor} fontFamily="Poppins-Medium">
                        Jarak ke titik absensi
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

                  {myLocation.accuracy && (
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space={2} alignItems="center">
                        <Text fontSize={12}>🎯</Text>
                        <Text fontSize="xs" color={iconColor} fontFamily="Poppins-Medium">
                          Akurasi GPS
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color={iconColor} fontFamily="Poppins-SemiBold">
                        ±{Math.round(myLocation.accuracy)} m
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
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
