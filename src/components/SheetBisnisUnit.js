import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'

const { height } = Dimensions.get('screen')

const SheetBisnisUnit = ( { isOpen, onClose, onSelected } ) => {
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState(user.arrBisnis.map( m => m.bisnis) || [])
    console.log('arrBisnis---', user.arrBisnis);

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content>
                <FlatList 
                    data={data} 
                    keyExtractor={i => i.id}
                    renderItem={( { item } ) => <RenderItemComponent item={item} onSelected={onSelected}/>}/>
                <Actionsheet.Item 
                    p={0} 
                    m={0} 
                    h={'40px'} 
                    onPress={onClose} 
                    bg={'#DDD'} 
                    rounded={'md'} 
                    alignItems={'center'} 
                    justifyContent={'center'}>
                    <Text color={appcolor.teks[mode][5]} fontSize={'lg'} fontWeight={'bold'}>Batal</Text>
                </Actionsheet.Item>
                </Actionsheet.Content>
        </Actionsheet>
    )
}

export default SheetBisnisUnit

const RenderItemComponent = ( { item, onSelected } ) => {
    return(
        <HStack>
            <Actionsheet.Item 
                p={2} 
                mx={0} 
                my={1} 
                onPress={() => onSelected(item)} 
                rounded={'md'}
                justifyContent={'center'} 
                borderWidth={1}
                borderColor={'#DDD'}>
                <VStack>
                    <Text fontWeight={'bold'}>{item.initial}</Text>
                    <Text fontFamily={'Poppins-Regular'}>{item.name}</Text>
                    <Text fontFamily={'Abel-Regular'}>{item.alamat}</Text>
                </VStack>
            </Actionsheet.Item>
        </HStack>
    )
}