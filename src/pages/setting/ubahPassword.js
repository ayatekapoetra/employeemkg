import { TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { useDispatch, useSelector } from 'react-redux'
import { VStack, Text, Center, HStack, Button } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { Lock, UserOctagon } from 'iconsax-react-native'
import apiFetch from '../../helpers/ApiFetch'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login } from '../../redux/authSlice'

const UbahPassword = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ data, setData ] = useState({retypePass: "", newPass: ""})

    const onHandleGantiPassword = async () => {
        if((data.newPass).length < 5){
            Alert.alert("Perhatian", "Password baru anda harus lebih dari \n5 karakter...")
            return
        }

        if(!data.newPass){
            Alert.alert("Perhatian", "Password baru belum terinput...")
            return
        }

        if(data.retypePass != data.newPass){
            Alert.alert("Perhatian", "Password baru pertama dan password baru kedua tidak sama")
            return
        }

        if(data.retypePass === data.newPass){
            
            try {
                const resp = await apiFetch.post("update-password", data)
                console.log(resp);
                if(!resp.data.diagnostic.error){
                    onUserLogout()
                }
            } catch (error) {
                console.log(error);
                Alert.alert("Err", "Terjadi kesalahan data server...")
            }
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
                <HeaderScreen title={"Ubah Password"} onBack={true} onThemes={true} onNotification={true} />
                <VStack m={3} flex={1}>
                    <VStack mt={2}>
                        <Text mb={1} fontWeight={700} fontFamily={"Quicksand-Regular"} color={appcolor.teks[mode][1]}>username:</Text>
                        <HStack 
                            p={2}
                            alignItems={"center"} 
                            borderWidth={1}
                            rounded={"md"}
                            borderColor={appcolor.line[mode][1]}
                            justifyContent={"space-between"}>
                            <Text fontSize={18} fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][1]}>{user?.username}</Text>
                            <UserOctagon size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                        </HStack>
                    </VStack>
                    <VStack mt={2}>
                        <Text mb={1} fontWeight={700} fontFamily={"Quicksand-Regular"} color={appcolor.teks[mode][1]}>password:</Text>
                        <HStack 
                            p={2}
                            alignItems={"center"} 
                            borderWidth={1}
                            rounded={"md"}
                            borderColor={appcolor.line[mode][1]}
                            justifyContent={"space-between"}>
                            <TextInput 
                                secureTextEntry={true}
                                placeholder='Input password baru anda..'
                                placeholderTextColor={"#c4c4c4"}
                                onChangeText={(teks) => setData({...data, newPass: teks})}
                                style={{flex: 1, color: appcolor.teks[mode][1]}}/>
                            <Lock size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                        </HStack>
                    </VStack>
                    <VStack mt={2}>
                        <Text mb={1} fontWeight={700} fontFamily={"Quicksand-Regular"} color={appcolor.teks[mode][1]}>retype password:</Text>
                        <HStack 
                            p={2}
                            alignItems={"center"} 
                            borderWidth={1}
                            rounded={"md"}
                            borderColor={appcolor.line[mode][1]}
                            justifyContent={"space-between"}>
                            <TextInput 
                                placeholder='Input ulang password baru anda..'
                                placeholderTextColor={"#c4c4c4"}
                                secureTextEntry={true}
                                onChangeText={(teks) => setData({...data, retypePass: teks})}
                                style={{flex: 1, color: appcolor.teks[mode][1]}}/>
                            <Lock size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                        </HStack>
                    </VStack>
                </VStack>
                <Button m={3} onPress={onHandleGantiPassword}>Ganti Password</Button>
            </VStack>
        </AppScreen>
    )
}

export default UbahPassword