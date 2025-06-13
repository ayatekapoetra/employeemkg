import { FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, Button, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus, TickSquare } from 'iconsax-react-native'

const { height, width } = Dimensions.get('screen')
const keysToSearch = ["kode", "identity", "model", "tipe", "manufaktur"]; // 

const SheetEquipmentMulti = ( { isOpen, onClose, onSelected } ) => {
    const equipment = useSelector( state => state.equipment.data)
    const [ state, setState ] = useState(equipment?.map( m => ({...m, visible: true, selected: false})))
    const mode = useSelector(state => state.themes.value)

    const searchDataHandle = (teks) => {
        if(teks){
            const regex = new RegExp(teks, "i");
            setState(state.map(m => keysToSearch.some(key => regex.test(m[key]?.toString() || "")) ? {...m, visible: true} : {...m, visible: false}))
            // setState(state.map(m => (`/${m.kode}/i`).includes(teks) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(state?.map( m => ({...m, visible: true})))
        }
    }

    const pickDataOption = (obj) => {
        var array = state.map( m => m.id === obj.id ? {...m, selected: !m.selected}:m)
        setState(array)
        onSelected(array.filter( f => f.selected))
    }

    const onSelectAll = () => {
        var array = state.map( m => ({...m, selected: !m.selected}))
        setState(array)
        onSelected(array)
    }


    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .81}}>
                <HStack space={2} w={'full'}>
                    <HStack 
                        p={2} 
                        mb={3} 
                        flex={3} 
                        space={2} 
                        borderWidth={1} 
                        borderColor={'#000'} 
                        alignItems={'center'}
                        rounded={'md'}>
                        <SearchStatus size={22} variant="Broken" color='#000'/>
                        <TextInput onChangeText={searchDataHandle} autoCapitalize="words" style={{flex: 1, color: '#000'}}/>
                    </HStack>
                    <TouchableOpacity onPress={onSelectAll}>
                        <VStack py={1} px={3} bg={'darkBlue.600'} alignItems={'center'} rounded={'md'}>
                            <Text color={appcolor.teks[mode][1]} fontFamily={'Dosis'} fontWeight={'bold'} lineHeight={'xs'}>Pilih</Text>
                            <Text color={appcolor.teks[mode][1]} fontFamily={'Dosis'} fontWeight={'bold'} lineHeight={'xs'}>Semua</Text>
                        </VStack>
                    </TouchableOpacity>
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