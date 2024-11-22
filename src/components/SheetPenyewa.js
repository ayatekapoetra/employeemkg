import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, Center, Divider, HStack, Input, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'

const { height } = Dimensions.get('screen')

const SheetPenyewa = ( { isOpen, onClose, onSelected } ) => {
    const penyewa = useSelector( state => state.penyewa.data)
    const [ state, setState ] = useState(penyewa?.map( m => ({...m, visible: true})))
    const mode = useSelector(state => state.themes.value)

    const searchDataHandle = (teks) => {
        if(teks){
            setState(state.map(m => (`/${m.nama}/i`).includes(teks) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(state?.map( m => ({...m, visible: true})))
        }
    }


    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .8}}>
                <HStack 
                    p={2} 
                    mb={3} 
                    space={2} 
                    w={'full'} 
                    borderWidth={1} 
                    borderColor={'#000'} 
                    alignItems={'center'}
                    rounded={'md'}>
                    <SearchStatus size={22} variant="Broken" color='#000'/>
                    <TextInput 
                        placeholder='Cari Penyewa !!!'
                        onChangeText={searchDataHandle} 
                        style={{flex: 1, height: 40, color: '#000'}}/>
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

export default SheetPenyewa

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
                        <Text fontWeight={'bold'}>{item.nama}</Text>
                        <Text fontFamily={'Dosis'} fontWeight={'light'}>{item.bisnis?.name}</Text>
                    </VStack>
                </Actionsheet.Item>
            </HStack>
        )
    }
}