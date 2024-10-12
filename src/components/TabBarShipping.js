import { TouchableOpacity } from 'react-native'
import React from 'react'
import appcolor from '../common/colorMode'
import { Divider, HStack, Text } from 'native-base'
import { Card, PresentionChart, Solana } from 'iconsax-react-native'
import { useSelector } from 'react-redux'

const TabBarShipping = ( { onPressTab } ) => {
    const mode = useSelector(state => state.themes.value)
    const isDark = mode === 'dark'
    return (
        <HStack borderWidth={1} borderColor={appcolor.line[mode][1]}  h={'12'} rounded={'md'} alignItems={'center'} justifyContent={'space-around'}>
            <TouchableOpacity onPress={() => onPressTab('card')} style={{flex: 1}}>
                <HStack space={2} justifyContent={'center'} alignItems={'center'} h={'full'}>
                    <Card size="22" color={isDark?'#fdba74':'#2f313e'}/>
                    <Text color={appcolor.teks[mode][1]} fontFamily={'Poppins'} fontWeight={'semibold'}>Card</Text>
                </HStack>
            </TouchableOpacity>
            <Divider orientation='vertical' bg={appcolor.line[mode][1]}/>
            <TouchableOpacity onPress={() => onPressTab('list')} style={{flex: 1}}>
                <HStack space={2} justifyContent={'center'} alignItems={'center'} h={'full'}>
                    <Solana size="22" color={isDark?'#fdba74':'#2f313e'}/>
                    <Text color={appcolor.teks[mode][1]} fontFamily={'Poppins'} fontWeight={'semibold'}>List</Text>
                </HStack>
            </TouchableOpacity>
            <Divider orientation='vertical' bg={appcolor.line[mode][1]}/>
            <TouchableOpacity onPress={() => onPressTab('chart')} style={{flex: 1}}>
                <HStack space={2} justifyContent={'center'} alignItems={'center'} h={'full'}>
                    <PresentionChart size="22" color={isDark?'#fdba74':'#2f313e'}/>
                    <Text color={appcolor.teks[mode][1]} fontFamily={'Poppins'} fontWeight={'semibold'}>Chart</Text>
                </HStack>
            </TouchableOpacity>
        </HStack>
    )
}

export default TabBarShipping