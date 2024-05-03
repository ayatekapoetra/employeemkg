import { TouchableOpacity, TextInput, View, Platform } from 'react-native'
import { Center, Button, Text, VStack, HStack, Image } from 'native-base'
import { Sun1, Moon, UserSquare, Lock, SecurityUser, CloseCircle } from 'iconsax-react-native';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/authSlice';
import { getUniqueId } from 'react-native-device-info';
import themeManager from '../../common/themeScheme';
import appcolor from '../../common/colorMode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = () => {
    const dispatch = useDispatch()
    const { error, loading } = useSelector(state => state.auth)
    const [ visibleImg, setVisibleImg ] = useState(false)
    const [ colorScheme, setColorScheme ] = useState('dark')
    const [ errors, setErrors ] = useState(error)
    const [ userAuth, setUserAuth ] = useState({username: "", password: ""})

    const usernameReff = useRef()
    const passwordReff = useRef()

    useEffect(() => {
        initialScheme()
    }, [colorScheme])

    useEffect(() => {
        getUniqueId().then( async (uniqueId) => {
          await AsyncStorage.setItem("@DEVICESID", uniqueId)
        });
        
    }, [])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        setColorScheme(initMode)

        const uuid = await AsyncStorage.getItem("@DEVICESID")
        console.log("UUID ", uuid);
    }

    const handleChangeScheme = async () => {
        const initMode = await themeManager.get()
        if(initMode === 'dark'){
            await themeManager.set("light")
            setColorScheme('light')
        }else{
            await themeManager.set("dark")
            setColorScheme('dark')
        }
    }

    const loginUserHandle = () => {
        console.log(userAuth);
        
        if (!userAuth.username) {
            setErrors("Username anda belum terisi...")
            usernameReff.current.focus()
            return
        }

        if (userAuth.username.length <= 2) {
            setErrors("Username anda harus lebih dari 2 karakter...")
            usernameReff.current.focus()
            return
        }

        if (!userAuth.password) {
            setErrors("Kata kunci (password) anda belum terisi...")
            passwordReff.current.focus()
            return
        }

        if (userAuth.password.length <= 5) {
            setErrors("Kata kunci anda harus lebih dari 5 karakter...")
            passwordReff.current.focus()
            return
        }

        dispatch(login(userAuth))
        setErrors(error)
    }

    return (
        <VStack h={"full"} bg={colorScheme === 'dark'?"#2f313e":"#F5F5F5"}>
            <HStack px={2} py={3} h={"70px"} justifyContent={"flex-end"} alignItems={"flex-end"}>
                <TouchableOpacity onPress={handleChangeScheme}>
                    <HStack space={1} alignItems={"center"}>
                        {
                            colorScheme === 'dark' ?
                            <Sun1 size="25" color={"#efb539"} variant="Bold"/>
                            :
                            <Moon size="25" color={"#4f4c46"} variant="Bold"/>
                        }
                        <Text color={colorScheme != 'dark'?"#1F2937":"#F5F5F5"}>Mode {colorScheme != 'dark'?"Dark":"Light"}</Text>
                    </HStack>
                </TouchableOpacity>
            </HStack>
            <VStack flex={1}>
                <VStack>
                    <Center px={5}>
                        <Text fontWeight={700} fontFamily={"Poppins-Bold"} fontSize={32} color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"}>Login Area</Text>
                        <Text fontWeight={300} fontFamily={"Poppins-Light"} fontSize={12} color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"}>
                            Aplikasi ini khusus digunakan oleh karyawan
                        </Text>
                        <Text fontWeight={500} fontFamily={"Poppins-SemiBold"} fontSize={12} color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"}>
                            MAKKURAGA GROUP
                        </Text>
                        {!visibleImg && <Image alt='...' source={require('../../../assets/images/padlock.png')} size={"2xl"}/>}
                    </Center>
                </VStack>
                {
                    errors &&
                    <HStack mt={2} mx={7} px={3} py={1} bg={"error.100"} rounded={"xs"}>
                        <Text textAlign={"justify"} color={appcolor.teks[colorScheme][5]}>{errors}</Text>
                        <TouchableOpacity onPress={() => setErrors(null)} style={{position: "absolute", top: -15, right: -12, backgroundColor: "#f47373", borderRadius: 20}}>
                            <CloseCircle size="26" color="#d9e3f0" variant="Bulk"/>
                        </TouchableOpacity>
                    </HStack>
                }
                <VStack px={5} py={5} mx={5} rounded={"md"}>
                    <Text color={colorScheme === 'dark'?"muted.50":"#1f2125"} fontFamily={"Poppins-Regular"} fontWeight={600}>Username :</Text>
                    <HStack 
                        px={2} 
                        mt={1} 
                        mb={3} 
                        space={2} 
                        h={"50px"} 
                        bg={colorScheme === 'dark'?"#2f313e":"#F5F5F5"} 
                        alignItems={"center"} 
                        rounded={"md"} 
                        borderWidth={"1"} 
                        borderColor={colorScheme === 'dark'?"#727377":"#2f313e"}>
                        <UserSquare size="25" color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"} variant="Bold"/>
                        <TextInput 
                            ref={usernameReff}
                            placeholder='masukkan username anda...'
                            placeholderTextColor={"#727377"}
                            onFocus={() => {
                                setVisibleImg(true)
                            }}
                            onBlur={() => setVisibleImg(!visibleImg)}
                            onChangeText={(teks) => setUserAuth({...userAuth, username: teks})}
                            onSubmitEditing={() => passwordReff.current.focus()}
                            style={{flex: 1, color: colorScheme === 'dark'?"#F5F5F5":"#1f2125", textTransform: "uppercase", fontFamily: "Poppins-Regular", fontSize: 18}}/>
                    </HStack>
                    <Text color={colorScheme === 'dark'?"muted.50":"#1f2125"} fontFamily={"Poppins-Regular"} fontWeight={600}>Password :</Text>
                    <HStack 
                        px={2} 
                        mt={1} 
                        mb={3} 
                        space={2} 
                        h={"50px"} 
                        bg={colorScheme === 'dark'?"#2f313e":"#F5F5F5"} 
                        alignItems={"center"} 
                        rounded={"md"} 
                        borderWidth={"1"} 
                        borderColor={colorScheme === 'dark'?"#727377":"#2f313e"}>
                        <Lock size="25" color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"} variant="Bold"/>
                        <TextInput 
                            ref={passwordReff}
                            placeholder='masukkan password anda...'
                            placeholderTextColor={"#727377"}
                            onFocus={() => {
                                setVisibleImg(true)
                            }}
                            onBlur={() => setVisibleImg(!visibleImg)}
                            secureTextEntry={true}
                            onChangeText={(teks) => setUserAuth({...userAuth, password: teks})}
                            onSubmitEditing={loginUserHandle}
                            style={{flex: 1, color: colorScheme === 'dark'?"#F5F5F5":"#1f2125", textTransform: "lowercase", fontFamily: "Poppins-Regular", fontSize: 18}}/>
                    </HStack>
                    
                    <Button mt={3} onPress={loginUserHandle} variant={"solid"} bg={"#2297ff"} rounded={"md"}>
                        <HStack space={2} alignItems={"center"}>
                            <SecurityUser size="28" color="#FFF" variant="Bulk"/>
                            <Text 
                                color={"#FFF"}
                                fontSize={16}
                                fontWeight={"semibold"}
                                fontFamily={"Poppins-Regular"}>
                                Login
                            </Text>
                        </HStack>
                    </Button>
                </VStack>
            </VStack>
            <Image zIndex={1} alt='...' source={require('../../../assets/images/background.png')} style={{width: "100%", height: 120}}/>
        </VStack>
    )
}

export default LoginPage

// 252833
// ffce1f