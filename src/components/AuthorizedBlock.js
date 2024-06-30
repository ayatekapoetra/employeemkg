import React from 'react'
import AppScreen from './AppScreen'
import HeaderScreen from './HeaderScreen'
import { VStack, Text, Image, Center, HStack, Flex } from 'native-base'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'
import { useRoute } from '@react-navigation/native'
import { ScrollView } from 'react-native'

const AuthorizedBlockScreen = () => {
    const { params } = useRoute()
    const mode = useSelector(state => state.themes.value)

    console.log(params);
    return (
        <AppScreen>
            <HeaderScreen title={"Akses ditolak"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
            <VStack h={"full"}>
                <ScrollView>
                    <VStack flex={1} justifyContent={'flex-start'}>
                        <Center py={5} justifyContent={"center"}>
                            <Text 
                                fontFamily={'Abel-Regular'}
                                fontSize={'3xl'}
                                color={appcolor.teks[mode][1]}>
                                Maaf anda tidak memiliki izin
                            </Text>
                            <Text
                                mt={-3}
                                fontFamily={'Abel-Regular'}
                                fontSize={'xl'}
                                color={appcolor.teks[mode][1]}>
                                untuk mengakses fitur ini
                            </Text>
                            
                            <Image 
                                alt='...' 
                                source={require('../../assets/images/unathorized.png')} 
                                resizeMode="contain" 
                                style={{width: "100%", height: 300}}/>
                            <Text 
                                fontSize={16}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][3]}>
                                Permission authorized only
                            </Text>
                            {
                                params &&
                                <Flex mx={3} w={'lg'}>
                                    {
                                        params.map( (teks, i) => (
                                            <Text
                                                key={i}
                                                textAlign={'center'}
                                                fontFamily={'Abel-Regular'}
                                                fontSize={'md'}
                                                color={appcolor.teks[mode][4]}>
                                                { teks },
                                            </Text>

                                        ))
                                    }
                                </Flex>
                            }
                        </Center>
                    </VStack>
                </ScrollView>
            </VStack>
        </AppScreen>
    )
}

export default AuthorizedBlockScreen