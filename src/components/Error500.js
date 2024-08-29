import { Dimensions } from 'react-native'
import React from 'react'
import { VStack, Text, Image, Center } from 'native-base'
import appcolor from '../common/colorMode'
import { useSelector } from 'react-redux'

const { width } = Dimensions.get('screen')

const Error500 = () => {
    const mode = useSelector(state => state.themes.value)
  return (
        <VStack flex={1}>
            <Center>
                <Image 
                    source={require('../../assets/images/err500.png')} 
                    alt='Error Server' 
                    resizeMode='contain' 
                    style={{width: width, height: '70%'}}/>
                <Text 
                    fontSize={20}
                    fontFamily={'Poppins-Regular'}
                    color={appcolor.teks[mode][1]}>
                    Internal Server Error
                </Text>
            </Center>
        </VStack>
  )
}

export default Error500