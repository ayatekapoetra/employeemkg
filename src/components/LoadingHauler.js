import { Dimensions } from 'react-native'
import React from 'react'
import { VStack, Text, Center } from 'native-base'
import LottieView from 'lottie-react-native';
import appcolor from '../common/colorMode';
import { useSelector } from 'react-redux';

const { height } = Dimensions.get("screen")

const LoadingHauler = () => {
    const mode = useSelector(state => state.themes).value
    return (
        <VStack h={"full"} mx={5}>
            <Center mt={5}>
                <LottieView source={require('../../assets/lottie/hauler.json')} autoPlay loop style={{height: height * .4, width: "100%"}} />
                <Text 
                    fontSize={"xl"}
                    fontWeight={"semibold"}
                    fontFamily={"Quicksand-Semibold"}
                    color={appcolor.teks[mode][1]}>
                    Mohon tunggu sejenak
                </Text>
                <Text 
                    fontSize={"md"}
                    fontWeight={"light"}
                    fontFamily={"Poppins-Regular"}
                    color={appcolor.teks[mode][1]}>
                    Sistem sedang melakukan prosesing data...
                </Text>
            </Center>
        </VStack>
    )
}

export default LoadingHauler