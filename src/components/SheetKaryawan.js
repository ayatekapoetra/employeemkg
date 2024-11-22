import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'
import apiFetch from '../helpers/ApiFetch'
import LoadingHauler from './LoadingHauler'

const { height } = Dimensions.get('screen')

const SheetKaryawan = ( { isoperator, isOpen, onClose, onSelected } ) => {
    const [ karyawan, setKaryawan ] = useState([])
    const mode = useSelector(state => state.themes.value)

    useEffect(() => {
        searchKeywordHandle()
    }, [])

    const searchKeywordHandle = async () => {
        const uri = isoperator ? 'karyawan-oprdrv':'karyawan-nonoprdrv'
        try {
            const resp = await apiFetch.get(uri)
            const { data } = resp.data
            
            
            let result = data?.map(m => {
                return {
                    id: m.id,
                    nama: m.nama,
                    section: m.section,
                    ktp: m.ktp,
                    phone: m.phone || '--',
                    user_id: m.user_id || null,
                    selected: false, 
                    visible: true
                }
            })
            setKaryawan(result)
        } catch (error) {
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal mengambil data",
                subtitle: error?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const searchDataHandle = (teks) => {
        if(teks){
            // keyword search data
            var patten = (m) => {
                return (`/${m.nama}/g`).includes(teks) || (`/${m.section}/g`).includes(teks) || (`/${m.phone}/g`).includes(teks)
            }
            let resultData = karyawan.map( m => patten(m) ? {...m, visible: true}:{...m, visible: false})
            setKaryawan(resultData)
        }else{
            setKaryawan(karyawan.map( m => ({...m, visible: true})))
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
                    <TextInput onChangeText={searchDataHandle} autoCapitalize="words" style={{flex: 1, color: '#000'}}/>
                </HStack>
                {
                    karyawan.length > 0 ?
                    <FlatList 
                        data={karyawan} 
                        keyExtractor={i => i.id}
                        renderItem={( { item } ) => <RenderItemComponent item={item} onSelected={onSelected}/>}/>
                    :
                    <LoadingHauler/>
                }
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

export default SheetKaryawan

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
                    <HStack space={3} alignItems={'center'}>
                        <VStack>
                            <Text ml={-1} lineHeight={'xs'} fontSize={16} fontFamily={'Poppins-Regular'} fontWeight={700}>
                                {item.nama}
                            </Text>
                            <Text m={-1} fontFamily={'Poppins-Regular'} fontSize={'xs'} fontWeight={500}>
                                {item.phone}
                            </Text>
                            <Text m={-1} fontFamily={'Dosis-Regular'} fontSize={'xs'} fontWeight={500} color={'danger.500'}>
                                {item.section}
                            </Text>
                        </VStack>
                    </HStack>
                </Actionsheet.Item>
            </HStack>
        )
    }
}