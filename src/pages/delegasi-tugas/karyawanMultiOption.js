import { TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { HStack, VStack, Text, FlatList } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import { MouseSquare, SearchNormal1, TickSquare } from 'iconsax-react-native'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'
import LoadingHauler from '../../components/LoadingHauler'

const KaryawanMultiOption = ({isoprdrv, state, setState}) => {
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ karyawan, setKaryawan ] = useState([])

    useEffect(() => {
        searchKeywordHandle()
    }, [])

    const searchKeywordHandle = async () => {
        const uri = isoprdrv ? 'karyawan-nonoprdrv':'karyawan-oprdrv'
        try {
            const resp = await apiFetch.get(uri)
            const { data } = resp.data
            let result = data?.map(m => {
                return {
                    id: m.id,
                    nama: m.nama,
                    section: m.section,
                    phone: m.phone || '',
                    user_id: m.user_id || null,
                    selected: false, 
                    visible: true
                }
            })
            if(state.length > 0){
                var array = state.map( m => m.id)
                setKaryawan(result.map( m => array.includes(m.id) ? {...m, selected: true} : {...m, selected: false}))
            }else{
                setKaryawan(result)
            }
        } catch (error) {
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal mengambil data",
                subtitle: error?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const pilihKaryawan = (data) => {
        let selectedData = karyawan?.map(m => m.id === data.id ? {...m, selected: !m.selected}:m)
        setKaryawan(selectedData)
        setState(selectedData.filter( f => f.selected))
    }

    const filterDataKaryawan = (teks) => {
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
        <VStack flex={1}>
            <HStack 
                px={3}
                py={1}
                borderWidth={.5} 
                borderColor={appcolor.line[mode][2]}
                alignItems={'center'}
                rounded={'md'}>
                <SearchNormal1 size="22" color={appcolor.ico[mode][5]} variant="Outline"/>
                <TextInput 
                    placeholder='Nama, Section atau Handphone'
                    placeholderTextColor={mode=='dark'?'#ddd':'#c4c4c4'}
                    onChangeText={(teks) => filterDataKaryawan(teks)}
                    style={{
                        flex: 1, 
                        height: 50, 
                        alignItems: "center", 
                        fontFamily: 'Poppins-SemiBold', 
                        fontSize: 16, 
                        color: appcolor.teks[mode][1]}}/>
            </HStack>
            <VStack mt={3}>
                {
                    karyawan.length > 0 ?
                    <FlatList 
                        data={karyawan} 
                        keyExtractor={item => item.id} 
                        renderItem={({item}) => {
                            return (
                                <RenderItems 
                                    data={item} 
                                    appcolor={appcolor} 
                                    mode={mode} 
                                    pilihKaryawan={pilihKaryawan}/>
                            )
                        } }/>
                    :
                    <LoadingHauler/>
                }
            </VStack>
        </VStack>
    )
}

export default KaryawanMultiOption

const RenderItems = ( { data, appcolor, mode, pilihKaryawan } ) => {
    if(data.visible){
        return (
            <TouchableOpacity onPress={() => pilihKaryawan(data)}>
                <HStack alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    {
                        data.selected ?
                        <TickSquare size="32" color={appcolor.ico[mode][4]} variant="Bulk"/>
                        :
                        <MouseSquare size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                    }
                    <VStack flex={1} p={1}>
                        <Text 
                            fontSize={18}
                            lineHeight={'xs'}
                            fontFamily={'Roboto-Regular'}
                            color={appcolor.teks[mode][1]}>
                            { data.nama }
                        </Text>
                        <HStack justifyContent={'space-between'}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][3]}>
                                {data.phone || '--'}
                            </Text>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                {data.section}
                            </Text>
                        </HStack>
                    </VStack>
                </HStack>
            </TouchableOpacity>
        )
    }
}