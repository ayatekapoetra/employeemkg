import { RefreshControl, TouchableOpacity, Dimensions } from 'react-native'
import { Center, Button, Text, VStack, HStack, Image, ScrollView } from 'native-base'
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

const { width, height } = Dimensions.get("screen")

const HomeScreen = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const { user, loading } = useSelector(state => state.auth)
    const [ colorTheme, setColorTheme ] = useState(themes.value) 
    const [ refresh, setRefresh ] = useState(loading) 

    useEffect(() => {
        initialScheme()
    }, [themes])

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
                        {
                            user?.karyawan?.nama ?
                            <Text 
                                fontSize={25} 
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
                        <VStack space={5} mt={3} flex={1}>
                            <HStack space={4} flex={1} justifyContent={"space-around"}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Checklog-Absensi")}>
                                    <VStack flex={1} h={"150px"} alignItems={"center"} justifyContent={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[colorTheme][2]} borderStyle={"dashed"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/finger-mechine.png')} 
                                            resizeMode="contain"
                                            style={{width: 100, height: 100}}/>
                                        <Text color={appcolor.teks[colorTheme][2]} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Checklog</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate('Riwayat-Absensi')}>
                                    <VStack flex={1} h={"150px"} alignItems={"center"} justifyContent={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[colorTheme][2]} borderStyle={"dashed"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/calendar-bell.png')} 
                                            resizeMode="contain"
                                            style={{width: 100, height: 100}}/>
                                        <Text color={appcolor.teks[colorTheme][2]} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Riwayat Bulanan</Text>
                                    </VStack>
                                </TouchableOpacity>
                            </HStack>
                            
                            <HStack space={4} flex={1} justifyContent={"space-around"}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Permintaan")}>
                                    <VStack flex={1} h={"150px"} alignItems={"center"} justifyContent={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[colorTheme][2]} borderStyle={"dashed"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/schedules.png')} 
                                            resizeMode="contain"
                                            style={{width: 90, height: 90}}/>
                                        <Text color={appcolor.teks[colorTheme][2]} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Request Absensi</Text>
                                    </VStack>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Perintah-Lembur")}>
                                    <VStack flex={1} h={"150px"} alignItems={"center"} justifyContent={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[colorTheme][2]} borderStyle={"dashed"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/spl.png')} 
                                            resizeMode="contain"
                                            style={{width: "100%", height: 85}}/>
                                        <Text color={appcolor.teks[colorTheme][2]} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Form Lembur</Text>
                                    </VStack>
                                </TouchableOpacity>
                            </HStack>

                            <HStack space={4} flex={1} justifyContent={"space-around"}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Absensi-Tulis")}>
                                    <VStack flex={1} h={"150px"} alignItems={"center"} justifyContent={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[colorTheme][2]} borderStyle={"dashed"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/absen-tulis.png')} 
                                            resizeMode="contain"
                                            style={{width: 90, height: 95}}/>
                                        <Text color={appcolor.teks[colorTheme][2]} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Absensi Tulis</Text>
                                    </VStack>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Approval")}>
                                    <VStack flex={1} h={"150px"} alignItems={"center"} justifyContent={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[colorTheme][2]} borderStyle={"dashed"}>
                                        <Image 
                                            alt='...' 
                                            source={require('../../assets/images/approval-ico.png')} 
                                            resizeMode="contain"
                                            style={{width: "100%", height: 85, marginBottom: 10}}/>
                                        <Text pt={1} textAlign={'center'} lineHeight={'xs'} color={appcolor.teks[colorTheme][2]} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Approval Pengawas</Text>
                                    </VStack>
                                </TouchableOpacity>
                            </HStack>
                        </VStack>
                        <VStack>
                            <Center my={3}>
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