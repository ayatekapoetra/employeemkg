import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { HStack, VStack, Text, Divider, useNativeBase, Center } from 'native-base'
import { ArrowRight2, ColorSwatch, MonitorMobbile, Convert, DirectNotification, Logout, Profile, Scan, ShieldSecurity, Stickynote, House2, Civic, Calendar2 } from 'iconsax-react-native'
import { applyTheme } from '../../redux/themeSlice'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../redux/authSlice'
import themeManager from '../../common/themeScheme'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

const SettingPage = () => {
    const dispatch = useDispatch()
    const route = useNavigation()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes).value

    useEffect(() => {
        initialScheme()
    }, [mode])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        dispatch(applyTheme(initMode))
    }

    const actionHandle = (val) => {
        console.log(val);
        try {
            if(val.access){
                if(val.access.includes(user.usertype)){
                    route.navigate(val.uri)
                }else{
                    alert('Anda tidak memiliki akses ke menu ini...')
                }
            }else{
                route.navigate(val.uri)
            }
        } catch (error) {
            alert("Maaf, Fitur ini dalam pengembangan...")
        }

    }

    const onUserLogout = async () => {
        const keys = (await AsyncStorage.getAllKeys()).filter( f => f != "@DEVICESID")
        try {
          await AsyncStorage.multiRemove(keys)
        } catch(e) {
          console.log(e);
        }
        
        dispatch(login.fulfilled({
                data: {
                    type: "",
                    token: null
                },
                user: null
            })
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Pengaturan & Informasi"} onThemes={true} onNotification={true}/>
                <Divider/>
                <VStack flex={1}>
                    {
                        array.map( item => {
                            return (
                                <TouchableOpacity onPress={() => actionHandle(item)} key={item.key}>
                                    <HStack 
                                        p={3}
                                        alignItems={"center"} 
                                        justifyContent={"space-between"}
                                        borderBottomWidth={1}
                                        borderBottomColor={appcolor.line[mode][1]}>
                                        <HStack space={2} alignItems={"center"}>
                                            {item.grpIcon}
                                            <Text 
                                                fontWeight={500}
                                                fontFamily={"Poppins-SemiBold"}
                                                color={appcolor.teks[mode][1]}>
                                                {item.title}
                                            </Text>
                                        </HStack>
                                        <ArrowRight2 size="12" color="#d9e3f0" variant="Outline"/>
                                    </HStack>
                                </TouchableOpacity>
                            )
                        })
                    }
                </VStack>
                <Center mb={5}>
                    <Text fontWeight={300} fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][1]}>
                        Mobile Attendances Aplication
                    </Text>
                    <Text fontWeight={700} fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][1]}>
                        Makkuraga Group
                    </Text>
                    <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>version 1.0.1</Text>
                </Center>
                <VStack>
                    <TouchableOpacity onPress={onUserLogout}>
                        <HStack 
                            p={3}
                            bg={"error.500"}
                            alignItems={"center"} 
                            justifyContent={"space-between"}
                            borderBottomWidth={1}
                            borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={"center"}>
                                <Logout size="28" color="#FFF" variant="Bulk"/>
                                <Text 
                                    fontWeight={500}
                                    fontFamily={"Poppins-SemiBold"}
                                    color={"#FFF"}>
                                    Keluar
                                </Text>
                            </HStack>
                            <ArrowRight2 size="12" color="#FFF" variant="Outline"/>
                        </HStack>
                    </TouchableOpacity>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default SettingPage

const array = [
    {
        key: 1, 
        title: "Profile Saya", 
        icon: "circle-user",
        access: '',
        uri: "Profile",
        grpIcon: <Profile size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 2, 
        title: "Keamanan Akun", 
        icon: "lock",
        access: '',
        uri: "Keamanan-Akun",
        grpIcon: <ShieldSecurity size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 3, 
        title: "Notifikasi", 
        icon: "bell",
        access: '',
        uri: "notifikasi-screen",
        grpIcon: <DirectNotification size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 4, 
        title: "Absensi Bulanan", 
        icon: "bell",
        access: '',
        uri: "riwayat-absensi-screen",
        grpIcon: <Calendar2 size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 5, 
        title: "Internal Memo", 
        icon: "bullhorn",
        access: '',
        uri: "internal-memo-screen",
        grpIcon: <Stickynote size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 6, 
        title: "Gagal Kirim", 
        icon: "satellite-dish",
        access: '',
        uri: "unsending-screen",
        grpIcon: <Convert size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 7, 
        title: "Reset UUID Devices", 
        icon: "clock-rotate-left",
        access: ["developer", "administartor", "hrd"],
        uri: "Reset-User-Devices",
        grpIcon: <MonitorMobbile size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 8, 
        title: "Ubah Lingkup Kerja", 
        icon: "palette",
        access: '',
        uri: "lingkup-kerja-screen",
        grpIcon: <House2 size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 9, 
        title: "Izin Aplikasi", 
        icon: "power-off",
        access: '',
        uri: "izin-aplikasi-screen",
        grpIcon: <Civic size="28" color="#787b83" variant="Bulk"/>
    },
]