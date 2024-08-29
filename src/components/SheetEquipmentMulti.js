import { FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus, TickSquare } from 'iconsax-react-native'

const { height, width } = Dimensions.get('screen')

const SheetEquipmentMulti = ( { isOpen, onClose, onSelected } ) => {
    const equipment = useSelector( state => state.equipment.data)
    const [ state, setState ] = useState(equipment?.map( m => ({...m, visible: true, selected: false})))
    const mode = useSelector(state => state.themes.value)

    const searchDataHandle = (teks) => {
        if(teks){
            setState(state.map(m => (`/${m.kode}/i`).includes(teks) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(state?.map( m => ({...m, visible: true})))
        }
    }

    const pickDataOption = (obj) => {
        var array = state.map( m => m.id === obj.id ? {...m, selected: !m.selected}:m)
        setState(array)
        onSelected(array.filter( f => f.selected))
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
                    renderItem={( { item } ) => <RenderItemComponent item={item} pickDataOption={pickDataOption}/>}/>
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

export default SheetEquipmentMulti

const RenderItemComponent = ( { item, pickDataOption } ) => {
    const mode = useSelector(state => state.themes.value)

    switch (item.tipe) {
        case 'dumptruck':
            var equipmentIcon = <Image source={require('../../assets/images/dumptruck.png')} resizeMode="contain" alt='Alat' style={{height: 50, width: 50}}/>
            break;
        case 'excavator':
            var equipmentIcon = <Image source={require('../../assets/images/excavator.png')} resizeMode="contain" alt='Alat' style={{height: 45, width: 50}}/>
            break;
        case 'dozer':
            var equipmentIcon = <Image source={require('../../assets/images/dozer.png')} resizeMode="contain" alt='Alat' style={{height: 30, width: 50}}/>
            break;
        default:
            var equipmentIcon = <Image source={require('../../assets/images/compactor.png')} resizeMode="contain" alt='Alat' style={{height: 50, width: 50}}/>
            break;
    }

    if(item.visible){
        return(
            <TouchableOpacity key={item.id} onPress={() => pickDataOption(item)}>
                <HStack space={3} px={3} py={2} w={width * .95} borderBottomWidth={.5} justifyContent={'space-between'} alignItems={'center'}>
                    {equipmentIcon}
                    <VStack flex={1}>
                        <Text lineHeight={'xs'} fontSize={16} fontFamily={'Poppins-Regular'} fontWeight={700}>
                            {item.kode}
                        </Text>
                        <Text mt={-1} fontFamily={'Poppins-Regular'} fontSize={'xs'} fontWeight={700}>
                            {item.manufaktur}
                        </Text>
                        <Text mt={-1} fontFamily={'Abel-Regular'} fontSize={'xs'}>
                            {item.kategori === 'DT' ? 'DumpTruck':'Alat Berat'}
                        </Text>
                    </VStack>
                    <TickSquare size="30" color={item.selected?'#16a34a':'#555555'} variant={item.selected?"Bulk":"Linear"}/>
                </HStack>
            </TouchableOpacity>
        )
    }
}