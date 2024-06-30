import React from 'react'
import AppScreen from './AppScreen'
import HeaderScreen from './HeaderScreen'
import { VStack, Text, Image, Center } from 'native-base'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'

const OverloadScreen = () => {
    const mode = useSelector(state => state.themes.value)
    return (
        <AppScreen>
            <VStack h={"full"}>
                <VStack flex={1} justifyContent={'flex-start'}>
                    <Center py={10} justifyContent={"center"}>
                        <Text 
                            fontFamily={'Abel-Regular'}
                            fontSize={'3xl'}
                            color={appcolor.teks[mode][1]}>
                            Data Overload
                        </Text>
                        <Text
                            mt={-3}
                            fontFamily={'Abel-Regular'}
                            fontSize={'xl'}
                            color={appcolor.teks[mode][1]}>
                            ditemukan lebih dari 10.000 rows data
                        </Text>
                        <Image 
                            alt='...' 
                            source={require('../../assets/images/system-overload.png')} 
                            resizeMode="contain" 
                            style={{width: "100%", height: 300}}/>
                        <Text 
                            fontSize={16}
                            textAlign={'center'}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][3]}>
                            Gunakan filter untuk menentukan data yang lebig spesifik
                        </Text>
                    </Center>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default OverloadScreen