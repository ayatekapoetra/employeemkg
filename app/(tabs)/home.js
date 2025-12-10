import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import { SecurityUser } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Center, HStack, Image, ScrollView, Text, VStack } from 'native-base';
import { useCallback, useEffect, useState } from 'react';
import { ImageBackground, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../src/components/common';
import { COLORS } from '../../src/constants/colors';
import { getEquipment } from '../../src/store/slices/equipmentSlice';
import { getOprDrv } from '../../src/store/slices/oprdrvSlice';
import { getLokasiPit } from '../../src/store/slices/lokasiPitSlice';
import { getKegiatanPit } from '../../src/store/slices/kegiatanPitSlice';

moment.locale('id');

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const themes = useSelector(state => state.themes);
  const { user, loading } = useSelector(state => state.auth);
  const [colorTheme, setColorTheme] = useState(themes.value);
  const [refresh, setRefresh] = useState(loading);
  const mode = useSelector(state => state.themes)?.value || 'light';

  useEffect(() => {
    setColorTheme(themes.value);
  }, [themes]);

  useEffect(() => {
    initDataRedux();
  }, []);

  const initDataRedux = async () => {
    console.log('Fetching initial data for cache...');
    dispatch(getOprDrv());
    dispatch(getEquipment());
    dispatch(getLokasiPit());
    const kegiatanResult = await dispatch(getKegiatanPit());
    console.log('Kegiatan Pit Dispatch Result:', kegiatanResult);
  };

  const onRefreshHandle = useCallback(() => {
    setRefresh(true);
    setTimeout(() => setRefresh(false), 3 * 1000);
  }, []);

  if (refresh) {
    return (
      <AppScreen>
        <LoadingHauler />
      </AppScreen>
    );
  }

  const textColor = colorTheme === 'dark' ? '#F5F5F5' : '#2f313e';
  const backgroundColor = colorTheme === 'dark' ? '#2f313e' : '#F5F5F5';
  const iconColor = colorTheme === 'dark' ? '#9a8f90' : '#b31e02';
  const cardBg = colorTheme === 'dark' ? '#3a3c4a' : '#ffffff';
  const cardBorder = colorTheme === 'dark' ? '#5e5f6cff' : '#e5e7eb';
  const cardShadow = colorTheme === 'dark' ? '#1a1b24' : '#d1d5db';

  return (
    <AppScreen>
      <ScrollView
        h="full"
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefreshHandle} />}
        bg={backgroundColor}
      >
        <VStack flex={1}>
          <HeaderScreen title="Home" onThemes onNotification />
          <VStack px={3} flex={1}>
            <VStack>
              <ImageBackground
                source={require('../../assets/images/bg-home.png')}
                resizeMode="cover"
                style={{ height: 200, width: 'auto', justifyContent: 'flex-start', padding: 16 }}
              >
                <HStack space={1}>
                  <SecurityUser size="32" color={textColor} variant="Bulk" />
                  <VStack>
                    {user?.karyawan?.nama ? (
                      <Text
                        fontSize={20}
                        lineHeight="xs"
                        fontFamily="Quicksand-SemiBold"
                        fontWeight={700}
                        color={textColor}
                      >
                        {user?.karyawan?.nama}
                      </Text>
                    ) : (
                      <Text lineHeight="xs" color={iconColor}>
                        - data anda tidak terhubung dengan data karyawan -
                      </Text>
                    )}
                    <Text
                      fontSize={16}
                      fontFamily="Quicksand-Light"
                      fontWeight={300}
                      lineHeight="xs"
                      color={textColor}
                    >
                      {user?.usertype || 'Guest'}
                    </Text>
                  </VStack>
                </HStack>
              </ImageBackground>
            </VStack>

            <VStack space={3} mt={5}>
              <HStack space={3} justifyContent="space-between">
                <Link href="/checklog" asChild style={{ flex: 1, aspectRatio: 1 }}>
                  <TouchableOpacity>
                    <VStack
                      bg={cardBg}
                      p={4}
                      rounded="xl"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={1}
                      borderColor={cardBorder}
                      shadow={2}
                      flex={1}
                      style={{
                        shadowColor: cardShadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        aspectRatio: 1,
                      }}
                    >
                      <VStack
                        bg={colorTheme === 'dark' ? '#5e5f6cff' : '#fef3e2'}
                        p={3}
                        rounded="full"
                        mb={2}
                      >
                        <Image
                          alt="Checklog"
                          source={require('../../assets/images/mesin-finger.png')}
                          resizeMode="contain"
                          style={{ width: 38, height: 38 }}
                        />
                      </VStack>
                      <Text
                        color={textColor}
                        textAlign="center"
                        fontSize={11}
                        fontFamily="Quicksand-SemiBold"
                        numberOfLines={2}
                      >
                        Checklog{'\n'}Kehadiran Karyawan
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity style={{ flex: 1, aspectRatio: 1 }} onPress={() => console.log('Navigate to Request')}>
                  <VStack
                    bg={cardBg}
                    p={4}
                    rounded="xl"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor={cardBorder}
                    shadow={2}
                    flex={1}
                    style={{
                      shadowColor: cardShadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      aspectRatio: 1,
                    }}
                  >
                    <VStack
                      bg={colorTheme === 'dark' ? '#5e5f6cff' : '#fef3e2'}
                      p={3}
                      rounded="full"
                      mb={2}
                    >
                      <Image
                        alt="Request Absensi"
                        source={require('../../assets/images/schedules.png')}
                        resizeMode="contain"
                        style={{ width: 38, height: 38 }}
                      />
                    </VStack>
                    <Text
                      color={textColor}
                      textAlign="center"
                      fontSize={11}
                      fontFamily="Quicksand-SemiBold"
                      numberOfLines={2}
                    >
                      Request{'\n'}Absensi Karyawan
                    </Text>
                  </VStack>
                </TouchableOpacity>
              </HStack>

              <HStack space={3} justifyContent="space-between">
                <TouchableOpacity style={{ flex: 1, aspectRatio: 1 }} onPress={() => router.push('/approval')}>
                  <VStack
                    bg={cardBg}
                    p={4}
                    rounded="xl"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor={cardBorder}
                    shadow={2}
                    flex={1}
                    style={{
                      shadowColor: cardShadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      aspectRatio: 1,
                    }}
                  >
                    <VStack
                      bg={colorTheme === 'dark' ? '#5e5f6cff' : '#fef3e2'}
                      p={3}
                      rounded="full"
                      mb={2}
                    >
                      <Image
                        alt="Approval"
                        source={require('../../assets/images/user-list.png')}
                        resizeMode="contain"
                        style={{ width: 38, height: 38 }}
                      />
                    </VStack>
                    <Text
                      color={textColor}
                      textAlign="center"
                      fontSize={11}
                      fontFamily="Quicksand-SemiBold"
                      numberOfLines={2}
                    >
                      Approval{'\n'}Management
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1, aspectRatio: 1 }} onPress={() => router.push('/penugasan')}>
                  <VStack
                    bg={cardBg}
                    p={4}
                    rounded="xl"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor={cardBorder}
                    shadow={2}
                    flex={1}
                    style={{
                      shadowColor: cardShadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      aspectRatio: 1,
                    }}
                  >
                    <VStack
                      bg={colorTheme === 'dark' ? '#5e5f6cff' : '#fef3e2'}
                      p={3}
                      rounded="full"
                      mb={2}
                    >
                      <Image
                        alt="Penugasan"
                        source={require('../../assets/images/excavator.png')}
                        resizeMode="contain"
                        style={{ width: 38, height: 38 }}
                      />
                    </VStack>
                    <Text
                      color={textColor}
                      textAlign="center"
                      fontSize={11}
                      fontFamily="Quicksand-SemiBold"
                      numberOfLines={2}
                    >
                      Penugasan{'\n'}Equipment Harian
                    </Text>
                  </VStack>
                </TouchableOpacity>
              </HStack>
            </VStack>

            <VStack mt={8} mb={3}>
              <Center mb={3}>
                <Text fontSize={16} fontFamily="Poppins-Regular" fontWeight={400} color={COLORS.teks[mode][2]}>
                  Aplikasi Makkuraga Group
                </Text>
                <Text fontSize={12} fontFamily="Poppins-Light" fontWeight={300} color={COLORS.teks[mode][2]}>
                  Versi {Constants.expoConfig?.version || '1.0.0'}
                </Text>
              </Center>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </AppScreen>
  );
}
