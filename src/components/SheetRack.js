import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'

const { height } = Dimensions.get('screen')

const SheetRack = ( { isOpen, onClose, onSelected } ) => {
    const rack = useSelector( state => state.rack.data)
    const [ state, setState ] = useState(rack?.map( m => ({...m, visible: true})))
    const mode = useSelector(state => state.themes.value)

    const searchDataHandle = (teks) => {
        if(teks){
            setState(state.map(m => ((`/${m.nama}/i`).includes(teks) || (`/${m.kode}/i`).includes(teks)) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(state?.map( m => ({...m, visible: true})))
        }
    }


    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .8}}>
                <HStack p={2} mb={3} space={2} w={'full'} borderWidth={1} borderColor={'#000'} rounded={'md'}>
                    <SearchStatus size={22} variant="Broken" color='#000'/>
                    <TextInput onChangeText={searchDataHandle} style={{flex: 1}}/>
                </HStack>
                <FlatList 
                    data={state} 
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

export default SheetRack

const RenderItemComponent = ( { item, onSelected } ) => {
    if(item.visible){
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
                        <Text 
                            fontWeight={'bold'}
                            fontFamily={'Quicksand'}>
                            {item.kode}
                        </Text>
                        <Text 
                            fontSize={20} 
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}>
                            {item.nama}
                        </Text>
                        <Text 
                            fontSize={20} 
                            lineHeight={'xs'}
                            fontFamily={'Teko-Regular'}>
                            {item.gudang.nama}
                        </Text>
                    </VStack>
                </Actionsheet.Item>
            </HStack>
        )
    }
}