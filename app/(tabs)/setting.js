import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { VStack, Text, Center, HStack, Divider, ScrollView } from 'native-base';
import { AppScreen, HeaderScreen } from '../../src/components/common';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight2, Profile, Whatsapp, ShieldSecurity, DriverRefresh, Calendar2, Stickynote, Convert, MonitorMobbile, House2, Civic, Logout } from 'iconsax-react-native';
import { logout } from '../../src/store/slices/authSlice';
import { saveTheme } from '../../src/store/slices/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import OTA_VERSION, { OTA_CHANNEL_MARKER } from '../../src/constants/otaVersion';

export default function SettingScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const mode = useSelector(state => state.themes).value;

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const backgroundColor = mode === 'dark' ? '#2f313e' : '#F5F5F5';
  const lineColor = mode === 'dark' ? '#3a3c4a' : '#e5e7eb';

  const actionHandle = (val) => {
    console.log(val);
    try {
      if (val.access) {
        if (val.access.includes(user?.usertype)) {
          if (val.uri === 'Profile') {
            router.push('/setting/profile');
          } else if (val.uri === 'Pairing') {
            router.push('/setting/pairing');
          } else if (val.uri === 'Keamanan-Akun') {
            router.push('/setting/security');
          } else if (val.uri === 'izin-aplikasi-screen') {
            router.push('/setting/permissions');
          } else if (val.uri === 'notifikasi-screen') {
            router.push('/setting/notifications');
          } else if (val.uri === 'download-data-screen') {
            router.push('/setting/download-data-screen');
          } else if (val.uri === 'riwayat-absensi-screen') {
            router.push('/setting/attendance-history');
          } else if (val.uri === 'internal-memo-screen') {
            router.push('/setting/internal-memo');
          } else if (val.uri === 'unsending-screen') {
            router.push('/setting/failed-send');
          } else if (val.uri === 'Reset-User-Devices') {
            router.push('/setting/reset-devices');
          } else if (val.uri === 'lingkup-kerja-screen') {
            router.push('/setting/change-workspace');
          } else {
            router.push({
              pathname: '/setting/coming-soon',
              params: { feature: val.title }
            });
          }
        } else {
          alert('Anda tidak memiliki akses ke menu ini...');
        }
      } else {
        if (val.uri === 'Profile') {
          router.push('/setting/profile');
        } else if (val.uri === 'Pairing') {
          router.push('/setting/pairing');
        } else if (val.uri === 'Keamanan-Akun') {
          router.push('/setting/security');
        } else if (val.uri === 'izin-aplikasi-screen') {
          router.push('/setting/permissions');
        } else if (val.uri === 'notifikasi-screen') {
          router.push('/setting/notifications');
        } else if (val.uri === 'download-data-screen') {
          router.push('/setting/download-data-screen');
        } else if (val.uri === 'riwayat-absensi-screen') {
          router.push('/setting/attendance-history');
        } else if (val.uri === 'internal-memo-screen') {
          router.push('/setting/internal-memo');
        } else if (val.uri === 'unsending-screen') {
          router.push('/setting/failed-send');
        } else if (val.uri === 'Reset-User-Devices') {
          router.push('/setting/reset-devices');
        } else if (val.uri === 'lingkup-kerja-screen') {
          router.push('/setting/change-workspace');
        } else {
          router.push({
            pathname: '/setting/coming-soon',
            params: { feature: val.title }
          });
        }
      }
    } catch (error) {
      alert('Maaf, Fitur ini dalam pengembangan...');
    }
  };

  const onUserLogout = async () => {
    console.log('Logging out...');
    const keys = (await AsyncStorage.getAllKeys()).filter(f => f !== '@DEVICESID');
    try {
      await AsyncStorage.multiRemove(keys);
      console.log('AsyncStorage cleared');
    } catch (e) {
      console.error('Error clearing storage:', e);
    }

    dispatch(logout());
    console.log('User logged out');
    router.replace('/login');
  };

  const settingMenus = [
    {
      key: 1,
      title: 'Profile Saya',
      access: '',
      uri: 'Profile',
      grpIcon: <Profile size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 2,
      title: 'Hubungkan Whatapps',
      access: '',
      uri: 'Pairing',
      grpIcon: <Whatsapp size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 3,
      title: 'Keamanan Akun',
      access: '',
      uri: 'Keamanan-Akun',
      grpIcon: <ShieldSecurity size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 4,
      title: 'Download Data Options',
      access: '',
      uri: 'download-data-screen',
      // grpIcon: <Text fontSize={24}>📥</Text>,
      grpIcon: <DriverRefresh size={28} color="#787b83" variant="Bulk"/>,
    },
    {
      key: 5,
      title: 'Absensi Bulanan',
      access: '',
      uri: 'riwayat-absensi-screen',
      grpIcon: <Calendar2 size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 6,
      title: 'Internal Memo',
      access: '',
      uri: 'internal-memo-screen',
      grpIcon: <Stickynote size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 7,
      title: 'Gagal Kirim',
      access: '',
      uri: 'unsending-screen',
      grpIcon: <Convert size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 8,
      title: 'Reset UUID Devices',
      access: ['developer', 'administrator', 'hrd'],
      uri: 'Reset-User-Devices',
      grpIcon: <MonitorMobbile size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 9,
      title: 'Ubah Lingkup Kerja',
      access: '',
      uri: 'lingkup-kerja-screen',
      grpIcon: <House2 size="28" color="#787b83" variant="Bulk" />,
    },
    {
      key: 10,
      title: 'Izin Aplikasi',
      access: '',
      uri: 'izin-aplikasi-screen',
      grpIcon: <Civic size="28" color="#787b83" variant="Bulk" />,
    },
  ];

  return (
    <AppScreen>
      <VStack h="full">
        <HeaderScreen title="Pengaturan & Informasi" onThemes onNotification />
        <Divider />
        <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }}>
          <VStack>
            {settingMenus.map(item => {
              return (
                <TouchableOpacity onPress={() => actionHandle(item)} key={item.key}>
                  <HStack
                    p={3}
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottomWidth={1}
                    borderBottomColor={lineColor}
                  >
                    <HStack space={2} alignItems="center">
                      {item.grpIcon}
                      <Text fontWeight={500} fontFamily="Poppins-SemiBold" color={textColor}>
                        {item.title}
                      </Text>
                    </HStack>
                    <ArrowRight2 size="12" color="#d9e3f0" variant="Outline" />
                  </HStack>
                </TouchableOpacity>
              );
            })}
            <Center my={5} px={3}>
              <Text fontWeight={300} fontFamily="Poppins-Regular" color={textColor} textAlign="center">
                Mobile Attendances Aplication
              </Text>
              <Text fontWeight={700} fontFamily="Poppins-Regular" color={textColor} textAlign="center">
                Makkuraga Group
              </Text>
              <Text fontFamily="Poppins-Regular" color={mode === 'dark' ? '#9a8f90' : '#b31e02'} textAlign="center">
                version {Constants.expoConfig?.version || '1.0.0'}
              </Text>
              <Text fontFamily="Poppins-Regular" color={textColor} textAlign="center">
                {OTA_VERSION}
              </Text>
              <Text fontFamily="Poppins-Regular" color={subtitleColor} textAlign="center">
                Channel {OTA_CHANNEL_MARKER}
              </Text>
            </Center>
          </VStack>
        </ScrollView>
        <VStack>
          <TouchableOpacity onPress={onUserLogout}>
                <HStack
                  p={3}
                  bg="error.500"
                  alignItems="center"
                  justifyContent="space-between"
                  borderBottomWidth={1}
                  borderBottomColor={lineColor}
                >
                  <HStack space={2} alignItems="center">
                    <Logout size="28" color="#FFF" variant="Bulk" />
                    <Text fontWeight={500} fontFamily="Poppins-SemiBold" color="#FFF">
                      Keluar
                    </Text>
                  </HStack>
                  <ArrowRight2 size="12" color="#FFF" variant="Outline" />
                </HStack>
          </TouchableOpacity>
        </VStack>
      </VStack>
    </AppScreen>
  );
}
