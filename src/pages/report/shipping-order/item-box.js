import { View } from 'react-native'
import React from 'react'
import { HStack, VStack, Text } from 'native-base'
import appcolor from '../../../common/colorMode'

const RenderItemBox = ( { item, mode } ) => {
    return (
        <VStack position={'relative'} flex={1} pt={3} mb={3} bg={item.bgColor} h={'200px'} rounded={'md'}>
            <HStack position={'absolute'} bg={appcolor.container[mode]} w={'150px'} roundedBottomRight={'2xl'}>
                <Text color={appcolor.teks[mode][1]} fontFamily={'Poppins'} fontWeight={'bold'} fontSize={'xl'}>
                    {item.nmgudang}
                </Text>
            </HStack>
            <HStack mt={5} px={2} space={2} justifyContent={'space-between'} borderBottomWidth={.5} borderBottomColor={"#DDD"}>
                <HStack flex={2}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Jemput</Text>
                </HStack>
                <HStack flex={1} justifyContent={'flex-end'}>
                    <Text textAlign={'right'} color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>20 Pcs</Text>
                </HStack>
                <HStack flex={3} justifyContent={'flex-end'}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Rp. 1.000.000.000,-</Text>
                </HStack>
            </HStack>
            <HStack px={2} space={2} justifyContent={'space-between'} borderBottomWidth={.5} borderBottomColor={"#DDD"}>
                <HStack flex={2}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Terkirim</Text>
                </HStack>
                <HStack flex={1} justifyContent={'flex-end'}>
                    <Text textAlign={'right'} color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>20 Pcs</Text>
                </HStack>
                <HStack flex={3} justifyContent={'flex-end'}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Rp. 1.000.000.000,-</Text>
                </HStack>
            </HStack>
            <HStack px={2} space={2} justifyContent={'space-between'} borderBottomWidth={.5} borderBottomColor={"#DDD"}>
                <HStack flex={2}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Transit</Text>
                </HStack>
                <HStack flex={1} justifyContent={'flex-end'}>
                    <Text textAlign={'right'} color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>20 Pcs</Text>
                </HStack>
                <HStack flex={3} justifyContent={'flex-end'}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Rp. 1.000.000.000,-</Text>
                </HStack>
            </HStack>
            <HStack px={2} space={2} justifyContent={'space-between'} borderBottomWidth={.5} borderBottomColor={"#DDD"}>
                <HStack flex={2}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Tiba</Text>
                </HStack>
                <HStack flex={1} justifyContent={'flex-end'}>
                    <Text textAlign={'right'} color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>20 Pcs</Text>
                </HStack>
                <HStack flex={3} justifyContent={'flex-end'}>
                    <Text color={'#FFF'} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Rp. 1.000.000.000,-</Text>
                </HStack>
            </HStack>
            <VStack mx={'2px'} mb={'2px'} p={2} flex={1} bg={item.fooColor} roundedBottom={'md'}>
                <HStack flex={1} w={'full'}>
                    <HStack flex={1}>
                        <Text color={item.bgColor} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Persediaan</Text>
                    </HStack>
                    <HStack flex={3} justifyContent={'flex-end'}>
                        <Text color={item.bgColor} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Rp. 1.000.000.000,-</Text>
                    </HStack>
                </HStack>
                <HStack flex={1} w={'full'}>
                    <HStack flex={1}>
                        <Text color={item.bgColor} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Pemakaian</Text>
                    </HStack>
                    <HStack flex={3} justifyContent={'flex-end'}>
                        <Text color={item.bgColor} fontFamily={'Dosis'} fontWeight={'bold'} fontSize={'md'}>Rp. 1.000.000.000,-</Text>
                    </HStack>
                </HStack>
            </VStack>
        </VStack>
    )
}

export default RenderItemBox