import { FlatList, TextInput, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Actionsheet, HStack, Image, Text, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import { SearchStatus } from 'iconsax-react-native'
import apiFetch from '../helpers/ApiFetch'
import LoadingHauler from './LoadingHauler'
import LoadingSpinner from './LoadingSpinner'

const { height } = Dimensions.get('screen')
const keysToSearch = ["nama", "section", "phone"]; // Key dinamis

const SheetKaryawan = ( { isoperator, isOpen, onClose, onSelected } ) => {
    const [ karyawan, setKaryawan ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ keyword, setKeyword ] = useState('')
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
        setKeyword(teks)
        if(teks){
            setLoading(true)
            const regex = new RegExp(teks, "i");
            const array = karyawan.map(m => keysToSearch.some(key => regex.test(m[key]?.toString() || "")) ? {...m, visible: true} : {...m, visible: false})
            setTimeout(() => {
                setKaryawan(array)
                setLoading(false)
            }, 3000);
        }else{
            setKaryawan(karyawan.map( m => ({...m, visible: true})))
            setLoading(false)
        }
    }
    

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content style={{height: height * .8}}>
                <VStack mb={3}>
                    <HStack 
                        p={2} 
                        space={2} 
                        w={'full'} 
                        borderWidth={1} 
                        borderColor={'#000'} 
                        alignItems={'center'}
                        rounded={'md'}>
                        <SearchStatus size={22} variant="Broken" color='#000'/>
                        <TextInput onChangeText={(teks) => searchDataHandle(teks)} autoCapitalize="words" style={{flex: 1, color: '#000'}}/>
                    </HStack>
                    {
                       !loading &&
                        <>
                            {
                                karyawan && karyawan.filter(f => f.visible).length > 0 ?
                                <Text textAlign={'right'} fontFamily={'Abel-Regular'}>
                                    {karyawan.filter(f => f.visible).length} data ditemukan
                                </Text>
                                :
                                <Text textAlign={'right'} fontFamily={'Abel-Regular'} color={'error.500'}>tidak ada data ditemukan...</Text>
                            }
                        </>
                    }
                </VStack>
                {
                    loading &&
                    <LoadingSpinner 
                        title={"Mohon Menunggu..."} 
                        subtitle={`System sedang mencari data yang !!!\nMengandung karakter\n"${keyword}"`} 
                        color={'#000'}/>
                }
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