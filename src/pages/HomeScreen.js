import { RefreshControl, TouchableOpacity, Dimensions, ImageBackground } from 'react-native'
import { Center, Button, Text, VStack, HStack, Image, ScrollView, Divider } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import themeManager from '../common/themeScheme'
import AppScreen from '../components/AppScreen';
import HomeDonutChart from '../components/HomeDonutChart';
import { useDispatch, useSelector } from 'react-redux';
import { applyTheme } from '../redux/themeSlice';
import { useNavigation } from '@react-navigation/native';
import HeaderScreen from '../components/HeaderScreen';
import 'moment/locale/id'
import appcolor from '../common/colorMode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyAlert } from '../redux/alertSlice';
import AlertCustom from '../components/AlertCustom';
import LoadingHauler from '../components/LoadingHauler';
import moment from 'moment';
import { getPenyewa } from '../redux/penyewaSlice';
import { getLokasiPit } from '../redux/lokasiPitSlice';
import { getKegiatanPit } from '../redux/kegiatanPitSlice';
import { getEquipment } from '../redux/equipmentSlice';
import { getGudang } from '../redux/gudangSlice';
import { getBarang } from '../redux/barangSlice';
import { getBarangRack } from '../redux/barangRackSlice';
import { getEvent } from '../redux/eventSlice';

const { width, height } = Dimensions.get("screen")

const HomeScreen = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const { user, loading } = useSelector(state => state.auth)
    const [ colorTheme, setColorTheme ] = useState(themes.value) 
    const [ refresh, setRefresh ] = useState(loading) 

    console.log('user', user);

    useEffect(() => {
        initialScheme()
    }, [themes])

    useEffect(() => {
        initDataRedux()
    }, [])

    const initDataRedux = () => {
        dispatch(getPenyewa())
        dispatch(getLokasiPit())
        dispatch(getKegiatanPit())
        dispatch(getBarangRack())
        dispatch(getEquipment())
        dispatch(getGudang())
        dispatch(getBarang())
        dispatch(getEvent())
    }

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        dispatch(applyTheme(initMode))
        setColorTheme(initMode)

        const device = await AsyncStorage.getItem("@DEVICESID")
        console.log(device);

        if(!user.karyawan){
            dispatch(applyAlert({
                show: true, 
                status: "error", 
                title: "Peringatan", 
                subtitle: "User anda tidak tehubung dengan data karyawan anda, segera hubungi admin HRD di lokasi anda..."
            }))
        }

        if(!user.karyawan.pin){
            dispatch(applyAlert({
                show: true, 
                status: "warning", 
                title: "Peringatan", 
                subtitle: "User anda tidak tehubung dengan pin mesin fingerprint..."
            }))
        }
    }

    const onRefreshHandle = useCallback(() => {
        setRefresh(true)
        setTimeout(() => setRefresh(false), 3 * 1000);
    })

    if(refresh){
        return(
            <AppScreen>
                <LoadingHauler/>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <ScrollView 
                h={"full"} 
                refreshControl={ <RefreshControl refreshing={refresh} onRefresh={onRefreshHandle} />}
                bg={colorTheme === 'dark'?"#2f313e":"#F5F5F5"}>
                <VStack flex={1}>
                    <HeaderScreen title={"Home"} onThemes={true} onNotification={true}/>
                    
                    <VStack px={3} flex={1}>
                        
                        <VStack>
                            <ImageBackground source={require('../../assets/images/bg-home.png')} resizeMode="cover" style={{height: 200, width: 'auto'}}>
                            {
                                user?.karyawan?.nama ?
                                <Text 
                                    fontSize={20} 
                                    fontFamily={"Quicksand-SemiBold"} 
                                    fontWeight={700} 
                                    color={colorTheme != 'dark'?"#2f313e":"#F5F5F5"}>
                                    { user?.karyawan?.nama }
                                </Text>
                                :
                                <Text color={appcolor.teks[colorTheme][3]}>
                                    - data anda tidak terhubung dengan data karyawan -
                                </Text>
                            }
                            <Text 
                                fontSize={16} 
                                fontFamily={"Quicksand-Light"} 
                                fontWeight={300} 
                                color={colorTheme != 'dark'?"#2f313e":"#F5F5F5"}>
                                { user?.usertype }
                            </Text>
                            </ImageBackground>
                        </VStack>
                        <VStack space={5} mt={3} flex={1}>
                            <HStack space={4} flex={1} justifyContent={"space-around"}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Checklog-Absensi")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/finger-2.png')} 
                                            // source={require('../../assets/images/finger-mechine.png')} 
                                            resizeMode="stretch"
                                            style={{width: 50, height: 55}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Checklog</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Riwayat-Absensi")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/calendar-bell-2.png')} 
                                            resizeMode="stretch"
                                            style={{width: 40, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Kehadiran Bulanan</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Permintaan")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/schedules.png')} 
                                            resizeMode="stretch"
                                            style={{width: 45, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Request Absensi</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Absensi-Tulis")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/absen-tulis.png')} 
                                            resizeMode="contain"
                                            style={{width: 40, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Absen Tulis Crew</Text>
                                    </VStack>
                                </TouchableOpacity>
                            </HStack>
                        </VStack>
                        <VStack space={5} mt={3} flex={1}>
                            <HStack space={4} flex={1} justifyContent={"space-around"}>
                                <TouchableOpacity onPress={() => route.navigate("Perintah-Lembur")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/spl.png')} 
                                            resizeMode="contain"
                                            style={{width: 70, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Surat Perintah Lembur</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => route.navigate("Approval")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/user-list.png')} 
                                            resizeMode="stretch"
                                            style={{width: 40, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Approval Pengawas</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => route.navigate("Delegasi-Tugas")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/toak.png')} 
                                            resizeMode="contain"
                                            style={{width: 40, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Penugasan Karyawan</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => route.navigate("Daily-Event")}>
                                    <VStack flex={1} h={"80px"} w={'75px'} alignItems={"center"} justifyContent={"center"} rounded={"md"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/standby1.png')} 
                                            resizeMode="contain"
                                            style={{width: 40, height: 40}}/>
                                        <Text color={appcolor.teks[colorTheme][1]} mt={1} lineHeight={"xs"} fontFamily={"Abel-Regular"} textAlign={'center'} fontSize={12} fontWeight={300}>Standby Equipment</Text>
                                    </VStack>
                                </TouchableOpacity>
                            </HStack>
                        </VStack>
                        <VStack>
                            <Center mb={3} mt={8}>
                                <Text 
                                    fontSize={16} 
                                    fontFamily={"Poppins-Regular"} 
                                    fontWeight={400} 
                                    color={colorTheme != 'dark'?"#2f313e":"#F5F5F5"}>
                                    Attendances Score Chart
                                </Text>
                                <Text 
                                    fontSize={12} 
                                    fontFamily={"Poppins-Light"} 
                                    fontWeight={300} 
                                    color={colorTheme != 'dark'?"#2f313e":"#F5F5F5"}>
                                    Periode { moment().add(-1, "month").format("MMMM YYYY") }
                                </Text>
                            </Center>
                            <HomeDonutChart/>
                        </VStack>
                    </VStack>
                </VStack>
            </ScrollView>
        </AppScreen>
    )
}

export default HomeScreen