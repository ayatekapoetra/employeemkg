import { TouchableOpacity } from 'react-native'
import { Center, Button, Text, VStack, HStack, Image, ScrollView } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Sun1, Moon, Notification } from 'iconsax-react-native';
import themeManager from '../common/themeScheme'
import AppScreen from '../components/AppScreen';
import HomeDonutChart from '../components/HomeDonutChart';
import { useDispatch, useSelector } from 'react-redux';
import { applyTheme } from '../redux/themeSlice';
import { useNavigation } from '@react-navigation/native';
import HeaderScreen from '../components/HeaderScreen';
import moment from 'moment'
import 'moment/locale/id'

const HomeScreen = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const [ colorTheme, setColorTheme ] = useState(themes.value) 

    useEffect(() => {
        initialScheme()
    }, [themes])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        dispatch(applyTheme(initMode))
        setColorTheme(initMode)
    }

    return (
        <AppScreen>
            <ScrollView h={"full"} bg={colorTheme === 'dark'?"#2f313e":"#F5F5F5"}>
                <VStack flex={1}>
                    <HeaderScreen title={"Home"} onThemes={true} onNotification={true}/>
                    <VStack px={3} flex={1}>
                        <Text 
                            fontSize={25} 
                            fontFamily={"Quicksand-SemiBold"} 
                            fontWeight={700} 
                            color={colorTheme != 'dark'?"#2f313e":"#F5F5F5"}>
                            Ayat Ekapoetra
                        </Text>

                        <Text 
                            fontSize={16} 
                            fontFamily={"Quicksand-Light"} 
                            fontWeight={300} 
                            color={colorTheme != 'dark'?"#2f313e":"#F5F5F5"}>
                            Developer System
                        </Text>

                        <HStack my={3} space={3} h={"170px"}>
                            <TouchableOpacity style={{flex: 2}} onPress={() => route.navigate("Checklog-Absensi")}>
                                <VStack bg={"#2297ff"} flex={1} rounded={"lg"} justifyContent={"center"} shadow={5} borderWidth={1} borderColor={"#ddd"}>
                                    <Center>
                                        <Image alt='...' source={require('../../assets/images/finger-mechine.png')} resizeMode="contain" size={"md"}/>
                                        <Text color={"#F5F5F5"} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Checklog</Text>
                                        <Text color={"#F5F5F5"} fontFamily={"Poppins-SemiBold"} fontSize={14} fontWeight={600}>Kehadiran</Text>
                                    </Center>
                                </VStack>
                            </TouchableOpacity>
                            <VStack space={3} flex={3}>
                                {/* "#4cb404" */}
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate('Riwayat-Absensi')}>
                                    <HStack p={2} flex={1} bg={"#2cd998"} rounded={"lg"} shadow={5} borderWidth={1} borderColor={"#ddd"} alignItems={"center"} justifyContent={"space-between"}>
                                        <VStack>
                                            <Text color={"#F5F5F5"} fontFamily={"Poppins-SemiBold"} fontSize={18} fontWeight={600}>
                                                Informasi
                                            </Text>
                                            <Text lineHeight={"xs"} color={"#F5F5F5"} fontFamily={"Poppins-Light"} fontSize={14} fontWeight={400}>
                                                Attendances
                                            </Text>
                                        </VStack>
                                        <Image alt='...' source={require('../../assets/images/calendar-bell.png')} resizeMode="contain" size={"md"}/>
                                    </HStack>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate("Permintaan")}>
                                    <HStack p={2} flex={1} bg={"#ffcd20"} rounded={"lg"} shadow={5} borderWidth={1} borderColor={"#ddd"} alignItems={"center"} justifyContent={"space-between"}>
                                        <VStack>
                                            <Text color={"#F5F5F5"} fontFamily={"Poppins-SemiBold"} fontSize={18} fontWeight={600}>
                                                Permintaan
                                            </Text>
                                            <Text lineHeight={"xs"} color={"#F5F5F5"} fontFamily={"Poppins-Light"} fontSize={14} fontWeight={400}>
                                                Attendances
                                            </Text>
                                        </VStack>
                                        <Image alt='...' source={require('../../assets/images/employee.png')} resizeMode="contain" size={"sm"}/>
                                    </HStack>
                                </TouchableOpacity>
                            </VStack>
                        </HStack>
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
                                    Periode Februari 2024
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