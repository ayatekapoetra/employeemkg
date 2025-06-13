import { FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Actionsheet, Button, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { CloseSquare, SearchStatus } from 'iconsax-react-native'
import SearchDataWithKeyword from '../helpers/SearchKeyword'

const { height } = Dimensions.get('screen')
const keysToSearch = ["kode", "identity", "model", "tipe", "manufaktur", "kategori"]; // Key dinamis

const SheetEquipment = ( { reff, clueKey, isOpen, onClose, onSelected } ) => {
    const equipment = useSelector( state => state.equipment.data)
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState(equipment?.map( m => ({...m, visible: true})))
    const [ keyword, setKeyword ] = useState('')
    
    useEffect(() => {
        if(clueKey){
            setState(state?.filter( f => clueKey.includes(f.tipe)))
        }
    }, [])

    const searchDataHandle = (teks) => {
        setKeyword(teks)
        if(teks){
            const regex = new RegExp(teks, "i");
            setState(state.map(m => keysToSearch?.some(key => regex.test(m[key]?.toString() || "")) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(state?.map( m => ({...m, visible: true})))
        }
    }

    const searchDataBtnHandle = () => {
        const results = SearchDataWithKeyword(state, keysToSearch, keyword)
        // console.log(results);
        if(results.length > 0){
            let arrayID = results.map( m => m.id)
            setState(state.map( m => arrayID.includes(m.id) ? {...m, visible: true}:{...m, visible: false}))
        }
    }

    const resetDataFilter = () => {
        setKeyword('')
        setState(equipment?.map( m => ({...m, visible: true})))
    }
    
    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .8}}>
                <HStack w={'full'} space={2}>
                    <HStack 
                        p={2} 
                        mb={3} 
                        space={2} 
                        flex={1}
                        borderWidth={1} 
                        borderColor={'#000'} 
                        alignItems={'center'}
                        rounded={'md'}>
                        <SearchStatus size={22} variant="Broken" color='#000'/>
                        <TextInput value={keyword} onChangeText={(teks) => searchDataHandle(teks)} autoCapitalize="words" style={{flex: 1, color: '#000'}}/>
                        {
                            keyword &&
                            <TouchableOpacity onPress={resetDataFilter}>
                                <CloseSquare size={22} variant="Bulk" color='red'/>
                            </TouchableOpacity>
                        }
                    </HStack>
                    <TouchableOpacity onPress={searchDataBtnHandle}>
                        <HStack p={2} bg={'darkBlue.500'} rounded={'sm'}>
                            <Text 
                                color={'#FFF'}
                                fontWeight={'bold'}
                                fontFamily={'Poppins-Bold'}>
                                Go
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                </HStack>
                <FlatList 
                    data={state} 
                    keyExtractor={i => i.id}
                    renderItem={( { item } ) => <RenderItemComponent reff={reff} item={item} onSelected={onSelected}/>}/>
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

const RenderItemComponent = ( { reff, item, onSelected } ) => {
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
        case 'lightvehicle':
            var equipmentIcon = <Image source={require('../../assets/images/lightvehicles.png')} alt='Alat' style={{height: 30, width: 50}}/>
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
                    onPress={() => onSelected(item, reff)} 
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