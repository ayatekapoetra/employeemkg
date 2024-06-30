import React from 'react'
import AppScreen from './AppScreen'
import HeaderScreen from './HeaderScreen'
import { VStack, Text, Image, Center } from 'native-base'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'

const UnderDevelopmentScreen = () => {
    const mode = useSelector(state => state.themes.value)
    return (
        <AppScreen>
            <HeaderScreen title={"Segera Hadir"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
            <VStack h={"full"}>
                <VStack flex={1} justifyContent={'flex-start'}>
                    <Center py={10} justifyContent={"center"}>
                        <Text 
                            fontFamily={'Abel-Regular'}
                            fontSize={'3xl'}
                            color={appcolor.teks[mode][1]}>
                            Masih proses pengerjaan
                        </Text>
                        <Text
                            mt={-3}
                            fontFamily={'Abel-Regular'}
                            fontSize={'xl'}
                            color={appcolor.teks[mode][1]}>
                            fitur ini akan segera hadir
                        </Text>
                        <Image 
                            alt='...' 
                            source={require('../../assets/images/under-development.png')} 
                            resizeMode="contain" 
                            style={{width: "100%", height: 300}}/>
                        <Text 
                            fontSize={16}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][3]}>
                            Fitur Under Development
                        </Text>
                    </Center>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default UnderDevelopmentScreen