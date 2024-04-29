import { Dimensions } from 'react-native'
import { VStack, Text, HStack, Image, Center, Button } from 'native-base'
import { useSelector } from 'react-redux'
import React from 'react'
import appcolor from '../common/colorMode'

const { width, height } = Dimensions.get("screen")

const NoData = ( { title, subtitle, xheight, onRefresh } ) => {
    const mode = useSelector(state => state.themes.value)
    return (
        <VStack h={`${xheight||height}px`} bg={appcolor.container[mode]}>
            <Center>
                <Image source={require('../../assets/images/empty-box.png')} alt='No-data' style={{height: 400, width: width}}/>
                {
                    title &&
                    <Text 
                        fontSize={20}
                        fontFamily={"Poppins-SemiBold"}
                        color={appcolor.teks[mode][1]}>
                        { title }
                    </Text>
                }
                {
                    subtitle &&
                    <Text 
                        textAlign={"center"}
                        fontSize={15}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][2]}>
                        { subtitle }
                    </Text>
                }
                {
                    onRefresh &&
                    <Button onPress={onRefresh} variant={"ghost"}>Refresh</Button>
                }
            </Center>
        </VStack>
    )
}

export default NoData