import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { HStack, VStack, Text, Divider, useNativeBase } from 'native-base'
import { ArrowRight2, ColorSwatch, Convert, DirectNotification, Logout, Profile, Scan, ShieldSecurity, Stickynote } from 'iconsax-react-native'
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
        if(val.key == 8){
            onUserLogout()
        }else{
            route.navigate(val.uri)
        }

    }

    const onUserLogout =async () => {
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
        uri: "Profile",
        grpIcon: <Profile size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 2, 
        title: "Keamanan Akun", 
        icon: "lock",
        uri: "keamanan-akun-screen",
        grpIcon: <ShieldSecurity size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 3, 
        title: "Notifikasi", 
        icon: "bell",
        uri: "notifikasi-screen",
        grpIcon: <DirectNotification size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 4, 
        title: "Internal Memo", 
        icon: "bullhorn",
        uri: "internal-memo-screen",
        grpIcon: <Stickynote size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 5, 
        title: "Gagal Kirim", 
        icon: "satellite-dish",
        uri: "unsending-screen",
        grpIcon: <Convert size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 6, 
        title: "Riwayat Kehadiran", 
        icon: "clock-rotate-left",
        uri: "riwayat-kehadiran-screen",
        grpIcon: <Scan size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 7, 
        title: "Ganti Thema", 
        icon: "palette",
        uri: "",
        grpIcon: <ColorSwatch size="28" color="#787b83" variant="Bulk"/>
    },
    {
        key: 8, 
        title: "Keluar", 
        icon: "power-off",
        uri: "#logout",
        grpIcon: <Logout size="28" color="#787b83" variant="Bulk"/>
    },
]