import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';
import { Location, Scan } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, Image as RNImage, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import lokasiAbsenData from '../../../../assets/json/lokasiAbsen.json';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../components/common';
import { COLORS } from '../../../constants/colors';
import { LocationService } from '../../../services';
import { applyAlert } from '../../../store/slices/alertSlice';
import { checkIn, checkOut } from '../../../store/slices/checklogSlice';
import CameraScreen from '../components/CameraScreen';

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
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default || RNMaps;
    Circle = RNMaps.Circle;
    Marker = RNMaps.Marker;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
    
    if (MapView && Circle && Marker) {
      hasMapSupport = true;
      console.log('✅ Maps loaded successfully');
    } else {
      console.warn('⚠️ Maps components incomplete');
      mapLoadError = 'Maps components not properly loaded';
    }
  } catch (error) {
    console.error('❌ Maps failed to load:', error.message);
    mapLoadError = error.message;
    hasMapSupport = false;
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
  const [currentClock, setCurrentClock] = useState(moment().format('HH:mm:ss'));
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

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const iconColor = mode === 'dark' ? COLORS.ico.dark[2] : COLORS.ico.light[2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentClock(moment().format('HH:mm:ss'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('Mounting ChecklogScreen...');
    let isMounted = true;

    // Load react-native-maps after mount to avoid SSR/require timing issues
    const loadMapModule = () => {
      try {
        const RNMaps = require('react-native-maps');
        MapView = RNMaps.default || RNMaps;
        Circle = RNMaps.Circle;
        Marker = RNMaps.Marker;
        PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
        if (MapView && Circle && Marker) {
          hasMapSupport = true;
        }
      } catch (e) {
        console.error('Load map module failed:', e.message);
      }
    };

    const initializeData = async () => {
      try {
        if (isMounted) {
          loadMapModule();
          await getDataInitial();
          setTimeout(() => {
            if (isMounted) getLocation();
          }, 800);
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
      console.log('📍 Requesting location permission and position...');
      
      // Add delay to prevent immediate crash on Android
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Location timeout after 20s')), 20000)
      );
      
      const locationPromise = LocationService.getCurrentLocation();
      const coords = await Promise.race([locationPromise, timeoutPromise]);
      
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
      
      dispatch(
        applyAlert({
          show: true,
          status: 'warning',
          title: 'Lokasi GPS',
          subtitle: Platform.OS === 'ios' 
            ? 'Simulator: Set lokasi via Features → Location → Custom Location'
            : 'Tidak dapat mengakses GPS. Menggunakan lokasi default.',
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
            {moment().format('dddd, DD MMMM YYYY')}
          </Text>
          <Text lineHeight="xs" fontSize={45} fontFamily="Quicksand-Bold" color={textColor}>
            {currentClock}
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
          {myLocation && hasMapSupport && MapView && location?.latitude && location?.longitude ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              showsUserLocation
              showsMyLocationButton
              moveOnMarkerPress={false}
              toolbarEnabled={false}
            
              // Add error handling for MapView
              onError={(error) => {
                console.error('MapView error:', error);
                dispatch(
                  applyAlert({
                    show: true,
                    status: 'error',
                    title: 'Map Error',
                    subtitle: 'Failed to load map. Please try again.',
                  })
                );
              }}
              // Add loading state for MapView
              onMapReady={() => {
                console.log('✅ MapView is ready');
              }}
            >
                {checklogPin?.map(m => {
                  const lat = parseFloat(m.latitude);
                  const lng = parseFloat(m.longitude);
                  
                  if (isNaN(lat) || isNaN(lng)) {
                    console.warn('Invalid coordinates for checkpoint:', m.nama);
                    return null;
                  }
                  
                  return (
                    <View key={m.site_id}>
                      <Circle
                        strokeWidth={1}
                        strokeColor="red"
                        fillColor="rgba(239, 68, 68, 0.1)"
                        center={{ latitude: lat, longitude: lng }}
                        radius={100}
                      />
                      <Marker
                        title={`Titik Checklog ${m.nama}`}
                        description="Radius checklog untuk absensi"
                        coordinate={{ latitude: lat, longitude: lng }}
                      >
                        <RNImage
                          source={require('../../../../assets/images/finger-mechine.png')}
                          style={{ height: 25, width: 30 }}
                          resizeMode="contain"
                        />
                      </Marker>
                    </View>
                  );
                })}
                {myLocation && myLocation.latitude && myLocation.longitude && (
                  <Marker
                    title="Lokasi Saya..."
                    description="Posisi anda saat ini"
                    coordinate={{
                      latitude: myLocation.latitude,
                      longitude: myLocation.longitude,
                    }}
                  >
                    <RNImage
                      source={require('../../../../assets/images/engineer-standing.png')}
                      style={{ height: 65, width: 20 }}
                      resizeMode="contain"
                    />
                  </Marker>
                )}
            </MapView>
          ) : (
            <Center flex={1} bg={mode === 'dark' ? '#3a3c4a' : '#e5e7eb'} p={4}>
                  <Location size={80} color={iconColor} variant="Bulk" />
                  <Text fontSize="lg" fontFamily="Poppins-SemiBold" color={textColor} mt={4} textAlign="center">
                    Lokasi Anda
                  </Text>
                  {myLocation && (
                    <VStack space={2} mt={4} alignItems="center">
                      <HStack space={2} alignItems="center">
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={iconColor}>
                          Latitude:
                        </Text>
                        <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                          {myLocation.latitude.toFixed(6)}
                        </Text>
                      </HStack>
                      <HStack space={2} alignItems="center">
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={iconColor}>
                          Longitude:
                        </Text>
                        <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                          {myLocation.longitude.toFixed(6)}
                        </Text>
                      </HStack>
                      <HStack space={2} alignItems="center" mt={2}>
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={iconColor}>
                          Jarak ke Office:
                        </Text>
                        <Text fontSize="sm" fontFamily="Quicksand-Bold" color={jarak.jarak < 100 ? '#10b981' : '#ef4444'}>
                          {jarak.jarak.toFixed(0)} meter
                        </Text>
                      </HStack>
                    </VStack>
                  )}
              <Box mt={6} bg={mode === 'dark' ? '#2f313e' : '#ffffff'} p={4} rounded="lg" maxW="90%">
                <Text fontSize="xs" fontFamily="Poppins-Light" color={iconColor} textAlign="center">
                  {!hasMapSupport ? '📍 Maps sedang dimuat...' : '📍 Mengambil lokasi...'}
                </Text>
                {!hasMapSupport && (
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={iconColor} textAlign="center" mt={1}>
                    Rebuild app: npx expo run:android
                  </Text>
                )}
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
