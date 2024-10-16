import { FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, Avatar, Badge, HStack, Image, Text, VStack } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus, TickSquare } from 'iconsax-react-native'
import { getBarang } from '../redux/barangSlice'
import { URIPATH } from '../helpers/UriPath'

const { height, width } = Dimensions.get('screen')

const SheetBarang = ( { isOpen, onClose, onSelected } ) => {
    const dispatch = useDispatch()
    const barang = useSelector( state => state.barang.data)
    const [ state, setState ] = useState(barang?.map( m => ({...m, visible: true, selected: false})))
    const mode = useSelector(state => state.themes.value)

    const searchDataHandle = (teks) => {
        if(teks){
            dispatch(getBarang({keyword: teks}))
            setState(barang?.map( m => ({...m, visible: true, selected: false})))
        }else{
            dispatch(getBarang())
            setState(barang?.map( m => ({...m, visible: true})))
        }
    }
    
    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .81}}>
                <HStack p={2} mb={3} space={2} w={'full'} borderWidth={1} borderColor={'#000'} rounded={'md'}>
                    <SearchStatus size={22} variant="Broken" color='#000'/>
                    <TextInput onChangeText={searchDataHandle} autoCapitalize="words" style={{flex: 1}}/>
                </HStack>
                <FlatList 
                    data={state} 
                    keyExtractor={i => i.id}
                    renderItem={( { item } ) => <RenderItemComponent item={item} pickDataOption={onSelected}/>}/>
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

export default SheetBarang

const RenderItemComponent = ( { item, pickDataOption } ) => {
    const baseimage = URIPATH.apiphoto
    if(item.visible){
        return(
            <TouchableOpacity key={item.id} onPress={() => pickDataOption(item)}>
                <HStack space={3} px={3} py={2} w={width * .95} borderBottomWidth={.5} justifyContent={'space-between'} alignItems={'center'}>
                    <Avatar source={{uri: baseimage + item.photo}} style={{width: 50, height: 50}}>
                        <Text fontFamily={'Teko'} fontSize={14}>No Photo</Text>
                    </Avatar>
                    <VStack flex={1}>
                        <Text lineHeight={'xs'} fontSize={16} fontFamily={'Poppins-Regular'} fontWeight={700}>
                            {item.nama}
                        </Text>
                        <Text mt={-1} fontFamily={'Poppins-Regular'} fontSize={'xs'} fontWeight={700}>
                            {item.kode}
                        </Text>
                        <Text mt={-1} fontFamily={'Abel-Regular'} fontSize={'xs'}>
                            PN : {item.num_part}
                        </Text>
                    </VStack>

                </HStack>
            </TouchableOpacity>
        )
    }
}