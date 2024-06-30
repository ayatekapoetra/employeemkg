import { TextInput, View } from 'react-native'
import React from 'react'
import AppScreen from '../../components/AppScreen'
import { useDispatch, useSelector } from 'react-redux'
import { VStack, Text, Center, HStack, Button, Image } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { Lock, UserOctagon } from 'iconsax-react-native'

const NotificationApps = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Notifikasi"} onBack={true} onThemes={true} onNotification={true} />
                <VStack m={3} flex={1}>
                    <Center flex={1} justifyContent={"center"}>
                        <Image 
                            alt='...' 
                            source={require('../../../assets/images/under-development.png')} 
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

export default NotificationApps