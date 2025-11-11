import React, { useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, Dimensions, Platform } from 'react-native';
import { VStack, Text, Center, HStack, Button, Image, ScrollView, Box } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { Scan, Location, Map1 } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { getDistance } from 'geolib';
import { LocationService } from '../../../services';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../components/common';
import CameraScreen from '../components/CameraScreen';
import { applyAlert } from '../../../store/slices/alertSlice';

moment.locale('id');

const { width } = Dimensions.get('screen');

let MapView, Circle, Marker, PROVIDER_GOOGLE;
let hasMapSupport = false;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Circle = maps.Circle;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  hasMapSupport = true;
} catch (e) {
  console.log('Maps not available in Expo Go, using placeholder');
}

const lokasiAbsensi = [
  {
    site_id: 1,
    nama: 'Office Main',
    latitude: -5.145109,
    longitude: 119.44856182,
    radius: 100,
  },
];

export default function ChecklogScreen() {
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes).value;
  const { user } = useSelector(state => state.auth);

  const [openKamera, setOpenKamera] = useState({ visible: false, metode: '' });
  const [photo, setPhoto] = useState(null);
  const [jarak, setJarak] = useState({ jarak: 100, site: '', checkpoint: '', latitude: 0, longitude: 0 });
  const [currentClock, setCurrentClock] = useState(moment().format('HH:mm:ss'));
  const [myLocation, setMyLocation] = useState(null);
  const [fakeGPS, setFakeGPS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogmasuk, setLogmasuk] = useState(true);
  const [isLogpulang, setLogpulang] = useState(false);
  const [checklogPin, setChecklogPin] = useState(lokasiAbsensi);
  const [location, setLocation] = useState({
    latitude: -5.145109,
    longitude: 119.44856182,
  });

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const backgroundColor = mode === 'dark' ? '#2f313e' : '#F5F5F5';
  const iconColor = mode === 'dark' ? '#9a8f90' : '#b31e02';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentClock(moment().format('HH:mm:ss'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    try {
      console.log('Requesting location...');
      const coords = await LocationService.getCurrentLocation();
      console.log('Location received:', coords);
      
      setMyLocation(coords);
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      calculateDistance(coords);
      setLoading(false);
    } catch (error) {
      console.log('Location error:', error);
      setLoading(false);
      
      setMyLocation({
        latitude: -5.145109,
        longitude: 119.44856182,
      });
      
      dispatch(
        applyAlert({
          show: true,
          status: 'warning',
          title: 'Peringatan',
          subtitle: 'Tidak dapat mengakses lokasi GPS. Menggunakan lokasi default.',
        })
      );
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

    dispatch(
      applyAlert({
        show: true,
        status: 'success',
        title: 'Berhasil',
        subtitle: `Check-${openKamera.metode === 'in' ? 'in' : 'out'} berhasil`,
      })
    );

    if (openKamera.metode === 'in') {
      setLogmasuk(false);
      setLogpulang(true);
    } else {
      setLogpulang(false);
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
        onCapture={handlePhotoCapture}
        onClose={() => setOpenKamera({ visible: false, metode: '' })}
      />
    );
  }

  if (loading) {
    return (
      <AppScreen>
        <LoadingHauler />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <VStack h="full">
        <HeaderScreen title="Checklog Kehadiran" onBack onThemes onNotification />
        
        <Center py={2}>
          <Text fontSize="sm" fontFamily="Quicksand-Light" color={textColor}>
            {moment().format('dddd, DD MMMM YYYY')}
          </Text>
          <Text fontSize="5xl" lineHeight="xs" fontFamily="Quicksand-Bold" color={textColor}>
            {currentClock}
          </Text>
        </Center>

        {!openKamera.visible && (
          <VStack>
            {!fakeGPS && (
              <HStack space={2} mx={3} alignItems="center" justifyContent="space-around">
                {isLogmasuk ? (
                  <TouchableOpacity onPress={selfyLogmasukHandle} style={{ flex: 1 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg="#d1fae5"
                      rounded="md"
                      shadow={2}
                    >
                      <Scan size="32" color={textColor} variant="Bulk" />
                      <Text fontWeight="semibold" fontFamily="Quicksand-SemiBold">
                        Checklog Masuk
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={{ maxWidth: 170 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg="muted.100"
                      rounded="md"
                      shadow={2}
                    >
                      <Scan size="32" color={iconColor} variant="Bulk" />
                      <Text fontWeight="600" fontFamily="Poppins-SemiBold" color={iconColor}>
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
                      bg="#fecdd3"
                      rounded="md"
                      shadow={2}
                    >
                      <Scan size="32" color={textColor} variant="Bulk" />
                      <Text fontWeight="semibold" fontFamily="Quicksand-SemiBold">
                        Checklog Pulang
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={{ maxWidth: 170 }}>
                    <HStack
                      p={2}
                      space={1}
                      alignItems="center"
                      bg="muted.100"
                      rounded="md"
                      shadow={2}
                    >
                      <Scan size="32" color={iconColor} variant="Bulk" />
                      <Text fontWeight="600" fontFamily="Poppins-SemiBold" color={iconColor}>
                        Riwayat Pulang
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                )}
              </HStack>
            )}

            <VStack my={2} justifyContent="center" alignItems="center">
              {jarak.jarak < 10 && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#10b981">
                  Anda berada pada radius checklog {jarak.jarak.toFixed(0)} meter
                </Text>
              )}
              {jarak.jarak >= 10 && jarak.jarak <= 100 && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#f59e0b">
                  Anda berada pada radius checklog {jarak.jarak.toFixed(0)} meter
                </Text>
              )}
              {jarak.jarak > 100 && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444">
                  Anda berada pada radius checklog {jarak.jarak.toFixed(0)} meter
                </Text>
              )}
            </VStack>
          </VStack>
        )}

        <VStack flex={1} bg="amber.100">
          <Center flex={1}>
            {loading ? (
              <Box w="full" h="full" bg={mode === 'dark' ? '#3a3c4a' : '#e5e7eb'}>
                <Center flex={1}>
                  <LoadingHauler />
                  <Text fontSize="sm" fontFamily="Poppins-Light" color={textColor} mt={4}>
                    Mengambil lokasi GPS...
                  </Text>
                </Center>
              </Box>
            ) : hasMapSupport && myLocation ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ width: width, height: '100%' }}
                showsMyLocationButton={true}
                showsUserLocation={true}
                region={{
                  ...location,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }}
              >
                {checklogPin?.map((m, idx) => (
                  <React.Fragment key={idx}>
                    <Circle
                      strokeWidth={1}
                      strokeColor="red"
                      fillColor="rgba(239, 68, 68, 0.1)"
                      center={{ latitude: m.latitude, longitude: m.longitude }}
                      radius={100}
                    />
                    <Marker
                      title={`Titik Checklog ${m.nama}`}
                      description="Radius checklog untuk absensi"
                      coordinate={{
                        latitude: parseFloat(m.latitude),
                        longitude: parseFloat(m.longitude),
                      }}
                    >
                      <Image
                        alt="Pin"
                        source={require('../../../../assets/images/finger-mechine.png')}
                        style={{ height: 25, width: 30 }}
                      />
                    </Marker>
                  </React.Fragment>
                ))}
                <Marker
                  title="Lokasi Saya..."
                  description="Posisi anda saat ini"
                  coordinate={myLocation}
                >
                  <Image
                    alt="My Location"
                    source={require('../../../../assets/images/engineer-standing.png')}
                    style={{ height: 65, width: 20 }}
                  />
                </Marker>
              </MapView>
            ) : (
              <Box w="full" h="full" bg={mode === 'dark' ? '#3a3c4a' : '#e5e7eb'}>
                <Center flex={1} p={4}>
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
                      📍 Maps hanya tersedia di native build
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={iconColor} textAlign="center" mt={1}>
                      Jalankan: npx expo prebuild
                    </Text>
                  </Box>
                </Center>
              </Box>
            )}
          </Center>
        </VStack>
      </VStack>
    </AppScreen>
  );
}
