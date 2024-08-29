import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, Center, Divider, HStack, Input, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'

const { height, width } = Dimensions.get('screen')

const SheetLokasiPit = ( { isOpen, onClose, onSelected } ) => {
    const pit = useSelector( state => state.pit.data)
    const [ state, setState ] = useState(pit?.map( m => ({...m, visible: true})))
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
                <HStack p={2} space={2} w={'full'} mb={3} borderWidth={1} borderColor={'#000'} rounded={'md'}>
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
                    <HStack>
                        <Text color={appcolor.teks[mode][5]} fontSize={'lg'} fontWeight={'bold'}>Batal</Text>
                    </HStack>
                </Actionsheet.Item>
                </Actionsheet.Content>
        </Actionsheet>
    )
}

export default SheetLokasiPit

const RenderItemComponent = ( { item, onSelected } ) => {
    if(item.visible){
        return(
            <HStack>
                <Actionsheet.Item 
                    p={2} 
                    mx={0} 
                    my={1} 
                    rounded={'md'}
                    justifyContent={'center'} 
                    borderWidth={1}
                    borderColor={'#DDD'}
                    onPress={() => onSelected(item)}>
                    <Text fontFamily={'Poppins-SemiBold'} fontWeight={'semibold'} fontSize={18}>{item.nama}</Text>
                </Actionsheet.Item>
            </HStack>
        )
    }
}