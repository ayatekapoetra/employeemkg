import { View } from 'react-native'
import React, { useEffect } from 'react'
import { VStack, Text, HStack, Image, Spinner } from 'native-base'
import { MYICON } from '../../../../assets/images'

const CardStep = ( { loading, color, title, total, price, ico } ) => {
    
    return (
        <VStack p={2} h={'120px'} flex={1} bg={color} rounded={'md'}>
            <VStack flex={2}>
                <Text 
                    color={"#FFF"} 
                    fontFamily={'Poppins'} 
                    fontWeight={'semibold'} 
                    lineHeight={'xs'}>
                        {title}
                </Text>
                <HStack alignItems={'center'} justifyContent={'space-between'}>
                    <Image source={MYICON[ico]} alt='...' size={'xs'}/>
                    {
                        loading ?
                        <Spinner size="lg" color="#FFF" />
                        :
                        <Text 
                            color={'#FFF'}
                            fontSize={44}
                            fontWeight={'bold'}
                            fontFamily={'Dosis'}>
                            {total}
                        </Text>
                    }
                </HStack>
            </VStack>
            <VStack flex={1} mt={-1}>
                <Text 
                    color={"#FFF"} 
                    fontFamily={'Abel-Regular'} 
                    fontWeight={'semibold'} 
                    lineHeight={'xs'}>
                        Price :
                </Text>
                <Text 
                    color={"#FFF"} 
                    fontSize={'md'}
                    fontFamily={'Dosis'} 
                    fontWeight={'bold'} 
                    lineHeight={'xs'}>
                       Rp. {price},-
                </Text>
            </VStack>
        </VStack>
    )
}

export default CardStep