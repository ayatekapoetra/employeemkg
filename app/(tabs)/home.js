import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import { VStack, Text, Center, ScrollView, HStack, Image } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { SecurityUser } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../src/components/common';

moment.locale('id');

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const themes = useSelector(state => state.themes);
  const { user, loading } = useSelector(state => state.auth);
  const [colorTheme, setColorTheme] = useState(themes.value);
  const [refresh, setRefresh] = useState(loading);

  useEffect(() => {
    setColorTheme(themes.value);
  }, [themes]);

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

            <VStack space={5} mt={3} flex={1}>
              <HStack space={4} flex={1} justifyContent="space-around">
                <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/checklog')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Checklog"
                      source={require('../../assets/images/mesin-finger.png')}
                      resizeMode="stretch"
                      style={{ width: 40, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Checklog
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to Tire Usage')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Tire Usage"
                      source={require('../../assets/images/ban02-ico.png')}
                      resizeMode="stretch"
                      style={{ width: 40, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      {`Tire Usage\nForm`}
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to Request')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Request Absensi"
                      source={require('../../assets/images/schedules.png')}
                      resizeMode="stretch"
                      style={{ width: 45, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Request Absensi
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to Absen Tulis')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Absen Tulis"
                      source={require('../../assets/images/absen-tulis.png')}
                      resizeMode="contain"
                      style={{ width: 40, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Absen Tulis Crew
                    </Text>
                  </VStack>
                </TouchableOpacity>
              </HStack>
            </VStack>

            <VStack space={5} mt={3} flex={1}>
              <HStack space={4} flex={1} justifyContent="space-around">
                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to SPL')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="SPL"
                      source={require('../../assets/images/spl.png')}
                      resizeMode="contain"
                      style={{ width: 70, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Surat Perintah Lembur
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to Approval')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Approval"
                      source={require('../../assets/images/user-list.png')}
                      resizeMode="stretch"
                      style={{ width: 40, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Approval Pengawas
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to Penugasan')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Penugasan"
                      source={require('../../assets/images/toak.png')}
                      resizeMode="contain"
                      style={{ width: 40, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Penugasan Karyawan
                    </Text>
                  </VStack>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => console.log('Navigate to Standby')}>
                  <VStack flex={1} h="80px" w="75px" alignItems="center" justifyContent="center" rounded="md">
                    <Image
                      alt="Standby Equipment"
                      source={require('../../assets/images/standby1.png')}
                      resizeMode="contain"
                      style={{ width: 40, height: 40 }}
                    />
                    <Text color={iconColor} mt={1} lineHeight="xs" fontFamily="Abel-Regular" textAlign="center" fontSize={12} fontWeight={300}>
                      Standby Equipment
                    </Text>
                  </VStack>
                </TouchableOpacity>
              </HStack>
            </VStack>

            <VStack mt={8} mb={3}>
              <Center mb={3}>
                <Text fontSize={16} fontFamily="Poppins-Regular" fontWeight={400} color={textColor}>
                  Attendances Score Chart
                </Text>
                <Text fontSize={12} fontFamily="Poppins-Light" fontWeight={300} color={textColor}>
                  Periode {moment().add(-1, 'month').format('MMMM YYYY')}
                </Text>
              </Center>
              <Center>
                <Text fontSize={14} fontFamily="Poppins-Light" color={iconColor}>
                  Chart coming soon...
                </Text>
              </Center>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </AppScreen>
  );
}
