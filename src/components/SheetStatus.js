import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'

const { height } = Dimensions.get('screen')

const SheetStatus = ( { data, isOpen, onClose, onSelected } ) => {
    const mode = useSelector(state => state.themes.value)

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

export default SheetStatus

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
                {item.nama}
            </Actionsheet.Item>
        </HStack>
    )
}