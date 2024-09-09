import { Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import appcolor from '../common/colorMode'
import { VStack, Text, HStack, Stack } from 'native-base'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('screen')

const EquipmentStandby = ( { item } ) => {
    const route = useNavigation()
    const maxwidth = parseInt(width * .65)
    const barlength = (item.cummulative/maxwidth) * maxwidth
    const barlengthCurrent = (item.current/maxwidth) * maxwidth
    const barlengthRatio = (parseFloat(item.ratio) * maxwidth)
    const mode = useSelector(state => state.themes.value)
    return (
        <TouchableOpacity onPress={() => route.navigate('report-standby-equipment-detail', item)}>
            <VStack my={3} px={3}>
                <VStack 
                    m={3} 
                    px={2} 
                    w={'180px'}
                    zIndex={99}
                    position={'absolute'} 
                    alignItems={'center'}
                    justifyContent={'center'}
                    roundedTopRight={'full'} 
                    roundedBottomRight={'full'} 
                    bg={item.titlecolor}>
                    <Text 
                        fontSize={18}
                        fontWeight={'bold'}
                        fontFamily={'Dosis'}
                        color={"#FFF"}>
                        { item.title }
                    </Text>
                </VStack>
                <VStack ml={8} mt={8} zIndex={99}>
                    <HStack mt={2} alignItems={'center'} justifyContent={'flex-start'}>
                        <HStack w={'50px'} p={1} mr={2} alignItems={'flex-end'} justifyContent={'flex-end'}>
                            <Text color={appcolor.teks[mode][1]} fontSize={14} fontWeight={'bold'} fontFamily={'Dosis'}>
                                { item.cummulative }
                            </Text>
                        </HStack>
                        <VStack flex={1}>
                            <Text 
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                Cummulative this month
                            </Text>
                            <Stack h={2} w={`${barlength}px`} maxW={maxwidth} bg={item.barcolor} borderWidth={.5} borderColor={item.barcolor}/>
                        </VStack>
                    </HStack>
                    <HStack alignItems={'center'} justifyContent={'flex-start'}>
                        <HStack w={'50px'} p={1} mr={2} alignItems={'flex-end'} justifyContent={'flex-end'}>
                            <Text color={appcolor.teks[mode][1]} fontSize={14} fontWeight={'bold'} fontFamily={'Dosis'}>
                                { item.current }
                            </Text>
                        </HStack>
                        <VStack>
                            <Text 
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                Current Status
                            </Text>
                            <Stack h={2} w={`${barlengthCurrent}px`} maxW={maxwidth} bg={item.barcolor} borderWidth={.5} borderColor={item.barcolor}/>
                        </VStack>
                    </HStack>
                    <HStack alignItems={'center'} justifyContent={'flex-start'}>
                        <HStack w={'50px'} p={1} mr={2} alignItems={'flex-end'} justifyContent={'flex-end'}>
                            <Text color={appcolor.teks[mode][1]} fontSize={14} fontWeight={'semibold'} fontFamily={'Dosis'}>
                                { item.ratio }
                            </Text>
                        </HStack>
                        <VStack>
                            <Text 
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                Ratio
                            </Text>
                            <Stack h={2} w={`${barlengthRatio}px`} maxW={maxwidth} bg={item.barcolor} borderWidth={.5} borderColor={item.barcolor}/>
                        </VStack>
                    </HStack>
                </VStack>
                <HStack 
                    mt={'-120px'} 
                    ml={5} 
                    p={2} 
                    h={'130px'} 
                    position={'relative'} 
                    opacity={.5} 
                    bg={appcolor.box[mode]} 
                    // rounded={'md'} 
                    roundedBottomLeft={'3xl'}
                    roundedTopRight={'3xl'}
                    borderWidth={.5} 
                    borderColor={appcolor.line[mode][2]}/>
            </VStack>
        </TouchableOpacity>
    )
}

export default EquipmentStandby