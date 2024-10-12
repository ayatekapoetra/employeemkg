import { TouchableOpacity } from 'react-native'
import React from 'react'
import { VStack, Text, HStack, Center, Stack } from 'native-base'
import appcolor from '../../../common/colorMode'
import moment from 'moment'

const RenderItemList = ( { mode } ) => {
    return (
        <TouchableOpacity>
            <VStack mb={3}>
                <VStack>
                    <Text color={appcolor.teks[mode][2]} fontFamily={'Dosis'} fontWeight={'semibold'}>
                        C01A1M00B012-00001
                    </Text>
                    <Text color={appcolor.teks[mode][1]} fontFamily={'Poppins'} fontWeight={'bold'} fontSize={'lg'} lineHeight={'xs'}>
                        Common Rail Fuel Injector 320GC 449-3315 perkins
                    </Text>
                    <Text color={appcolor.teks[mode][1]} fontFamily={'Teko'}>
                        NUMPART: 449-3315
                    </Text>
                </VStack>
                <HStack position={'relative'} space={1} alignItems={'center'} justifyContent={'space-between'}>
                    <VStack flex={1} bg={'amber.100'} justifyContent={'center'} alignItems={'center'} rounded={'md'}>
                        <Text fontFamily={'Quicksand'} fontWeight={'bold'} fontSize={16}>Pickup</Text>
                        <Text fontFamily={'Abel-Regular'} lineHeight={'xs'}>{moment().format('dddd')}</Text>
                        <Text>{moment().format('DD/MM/YYYY')}</Text>
                        <Stack position={'absolute'} right={'-15px'} bg={appcolor.container[mode]} w={6} h={6} rounded={'full'}/>
                    </VStack>
                    <VStack flex={1} bg={'indigo.100'} justifyContent={'center'} alignItems={'center'} rounded={'md'}>
                        <Text fontFamily={'Quicksand'} fontWeight={'bold'} fontSize={16}>Delivery</Text>
                        <Text fontFamily={'Abel-Regular'} lineHeight={'xs'}>{moment().format('dddd')}</Text>
                        <Text>{moment().format('DD/MM/YYYY')}</Text>
                        <Stack position={'absolute'} right={'-15px'} bg={appcolor.container[mode]} w={6} h={6} rounded={'full'}/>
                    </VStack>
                    <VStack flex={1} bg={'error.100'} justifyContent={'center'} alignItems={'center'} rounded={'md'}>
                        <Text fontFamily={'Quicksand'} fontWeight={'bold'} fontSize={16}>Transit</Text>
                        <Text fontFamily={'Abel-Regular'} lineHeight={'xs'}>{moment().format('dddd')}</Text>
                        <Text>{moment().format('DD/MM/YYYY')}</Text>
                        <Stack position={'absolute'} right={'-15px'} bg={appcolor.container[mode]} w={6} h={6} rounded={'full'}/>
                    </VStack>
                    <VStack flex={1} bg={'success.100'} justifyContent={'center'} alignItems={'center'} rounded={'md'}>
                        <Text fontFamily={'Quicksand'} fontWeight={'bold'} fontSize={16}>Received</Text>
                        <Text fontFamily={'Abel-Regular'} lineHeight={'xs'}>{moment().format('dddd')}</Text>
                        <Text>{moment().format('DD/MM/YYYY')}</Text>
                        <Stack position={'absolute'} right={'-15px'} bg={appcolor.container[mode]} w={6} h={6} rounded={'full'}/>
                    </VStack>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}

export default RenderItemList