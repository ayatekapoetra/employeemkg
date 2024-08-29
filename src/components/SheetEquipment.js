import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'

const { height } = Dimensions.get('screen')

const SheetEquipment = ( { isOpen, onClose, onSelected } ) => {
    const equipment = useSelector( state => state.equipment.data)
    const [ state, setState ] = useState(equipment?.map( m => ({...m, visible: true})))
    const mode = useSelector(state => state.themes.value)

    const searchDataHandle = (teks) => {
        if(teks){
            setState(state.map(m => (`/${m.kode}/i`).includes(teks) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(state?.map( m => ({...m, visible: true})))
        }
    }


    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .8}}>
                <HStack p={2} mb={3} space={2} w={'full'} borderWidth={1} borderColor={'#000'} rounded={'md'}>
                    <SearchStatus size={22} variant="Broken" color='#000'/>
                    <TextInput onChangeText={searchDataHandle} autoCapitalize="words" style={{flex: 1}}/>
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

export default SheetEquipment

const RenderItemComponent = ( { item, onSelected } ) => {
    switch (item.tipe) {
        case 'dumptruck':
            var equipmentIcon = <Image source={require('../../assets/images/dumptruck.png')} alt='Alat' style={{height: 40, width: 50}}/>
            break;
        case 'excavator':
            var equipmentIcon = <Image source={require('../../assets/images/excavator.png')} alt='Alat' style={{height: 45, width: 50}}/>
            break;
        case 'dozer':
            var equipmentIcon = <Image source={require('../../assets/images/dozer.png')} alt='Alat' style={{height: 30, width: 50}}/>
            break;
        default:
            var equipmentIcon = <Image source={require('../../assets/images/compactor.png')} alt='Alat' style={{height: 30, width: 50}}/>
            break;
    }

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
                    <HStack space={3} alignItems={'center'}>
                        {equipmentIcon}
                        <VStack>
                            <Text ml={-1} lineHeight={'xs'} fontSize={16} fontFamily={'Poppins-Regular'} fontWeight={700}>
                                {item.kode}
                            </Text>
                            <Text m={-1} fontFamily={'Poppins-Regular'} fontSize={'xs'} fontWeight={700}>
                                {item.manufaktur}
                            </Text>
                            <Text m={-1} fontFamily={'Abel-Regular'} fontSize={'xs'}>
                                {item.kategori === 'DT' ? 'DumpTruck':'Alat Berat'}
                            </Text>
                        </VStack>
                    </HStack>
                </Actionsheet.Item>
            </HStack>
        )
    }
}