import { TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { Center, Button, Text, VStack, HStack, Image } from 'native-base'
import { Sun1, Moon, UserSquare, Lock } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react'
import themeManager from '../../common/themeScheme';

const LoginPage = () => {
    const [ visibleImg, setVisibleImg ] = useState(false)
    const [ colorScheme, setColorScheme ] = useState('dark')
    const [ userAuth, setUserAuth ] = useState({username: "", password: ""})

    useEffect(() => {
        initialScheme()
    }, [colorScheme])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        setColorScheme(initMode)
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

    console.log(userAuth);

    return (
        <VStack h={"full"} bg={colorScheme === 'dark'?"#2f313e":"#F5F5F5"}>
            <HStack px={2} py={3} h={"90px"} justifyContent={"flex-end"} alignItems={"flex-end"}>
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
                <VStack px={5} py={5} mx={5} rounded={"md"}>
                    <Text color={colorScheme === 'dark'?"muted.50":"#1f2125"} fontFamily={"Poppins-Regular"} fontWeight={600}>Username :</Text>
                    <HStack 
                        px={2} 
                        mt={1} 
                        mb={3} 
                        space={2} 
                        h={"40px"} 
                        bg={colorScheme === 'dark'?"#2f313e":"#F5F5F5"} 
                        alignItems={"center"} 
                        rounded={"md"} 
                        borderWidth={"1"} 
                        borderColor={colorScheme === 'dark'?"#727377":"#2f313e"}>
                        <UserSquare size="25" color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"} variant="Bold"/>
                        <TextInput 
                            placeholder='masukkan username anda...'
                            placeholderTextColor={"#727377"}
                            onFocus={() => setVisibleImg(true)}
                            onBlur={() => setVisibleImg(!visibleImg)}
                            onChangeText={(teks) => setUserAuth({...userAuth, username: teks})}
                            style={{flex: 1, color: colorScheme === 'dark'?"#F5F5F5":"#1f2125", textTransform: "uppercase"}}/>
                    </HStack>
                    <Text color={colorScheme === 'dark'?"muted.50":"#1f2125"} fontFamily={"Poppins-Regular"} fontWeight={600}>Password :</Text>
                    <HStack 
                        px={2} 
                        mt={1} 
                        mb={3} 
                        space={2} 
                        h={"40px"} 
                        bg={colorScheme === 'dark'?"#2f313e":"#F5F5F5"} 
                        alignItems={"center"} 
                        rounded={"md"} 
                        borderWidth={"1"} 
                        borderColor={colorScheme === 'dark'?"#727377":"#2f313e"}>
                        <Lock size="25" color={colorScheme === 'dark'?"#F5F5F5":"#2f313e"} variant="Bold"/>
                        <TextInput 
                            placeholder='masukkan password anda...'
                            placeholderTextColor={"#727377"}
                            onFocus={() => setVisibleImg(true)}
                            onBlur={() => setVisibleImg(!visibleImg)}
                            secureTextEntry={true}
                            onChangeText={(teks) => setUserAuth({...userAuth, password: teks})}
                            style={{flex: 1, color: colorScheme === 'dark'?"#F5F5F5":"#1f2125", textTransform: "lowercase"}}/>
                    </HStack>
                    <Button variant={"solid"} bg={"#2297ff"} rounded={"md"}>Login</Button>
                </VStack>
            </VStack>
            <Image alt='...' source={require('../../../assets/images/background.png')} style={{width: "100%", height: 170}}/>
        </VStack>
    )
}

export default LoginPage

// 252833
// ffce1f