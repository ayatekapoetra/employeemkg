import { View, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack, Stack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import apiFetch from '../../../helpers/ApiFetch'
import FilterStokPersediaan from './filter'
import { useSelector } from 'react-redux'
import appcolor from '../../../common/colorMode'
import { House2 } from 'iconsax-react-native'
import NoData from '../../../components/NoData'
import LoadingHauler from '../../../components/LoadingHauler'

const ReportStokPersediaanScreen = () => {
    const mode = useSelector(state => state.themes.value)
    const [ refresing, setRefresing ] = useState(false)
    const [ showFilter, setShowFilter ] = useState(false)
    const [ state, setState ] = useState([])
    const [ qstring, setQstring ] = useState({
        gudang_id: 1,
        rack_id: null,
        barang: [],
        barang_id: []
    })
    
    useEffect(() => {
        onGetDataHandle(qstring)
    }, [])
    
    const openFilter = () => setShowFilter(!showFilter)

    const onApplyFilter = useCallback(() => {
        onGetDataHandle({
            ...qstring, 
            barang_id: qstring.barang?.map( m => m.id)
        })
        setShowFilter(false)

    })

    const onResetFilter = useCallback(() => {
        onGetDataHandle({
            gudang_id: 1,
            rack_id: null,
            barang_id: []
        })
        setShowFilter(false)

    })

    const onGetDataHandle = async (params = null) => {
        setRefresing(true)
        try {
            const resp = await apiFetch.get('report-stok-persediaan', {params: params})
            const { data } = resp.data
            setState(data)
            setRefresing(false)
        } catch (error) {
            console.log(error);
            setRefresing(false)
        }
    }

    console.log(qstring);

    if(refresing){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen title={"Stok Persediaan"} onBack={true} onThemes={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Stok Persediaan"} onBack={true} onThemes={true} onFilter={openFilter} onNotification={true}/>
                {
                    showFilter ?
                    <FilterStokPersediaan 
                        onClose={openFilter} 
                        qstring={qstring} 
                        setQstring={setQstring}
                        onApplyFilter={onApplyFilter} 
                        onResetFilter={onResetFilter}/>
                    :
                    <VStack px={3} flex={1}>
                        {
                            state.length > 0 ?
                            <FlatList 
                                data={state} 
                                renderItem={({item}) => <RenderComponentItem item={item} mode={mode}/>}
                                keyExtractor={i => i.id}/>
                            :
                            <NoData title={'Opps'} subtitle={'Data tidak ditemukan'}/>
                        }
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ReportStokPersediaanScreen

const RenderComponentItem = ( { item, mode } ) => {
    return(
        <VStack 
            p={2} 
            mt={7} 
            mb={2} 
            mr={'10px'} 
            flex={1} 
            minH={'120px'} 
            shadow={'3'}
            borderWidth={1} 
            borderColor={appcolor.line[mode][2]} 
            rounded={'md'}>
            <Stack 
                px={2} 
                py={1}
                top={'-15px'}
                right={'-10px'}
                w={'100px'} 
                position={'absolute'} 
                shadow={'3'}
                alignItems={'center'} 
                justifyContent={'center'}
                bg={appcolor.box[mode]}>
                <Text 
                    fontSize={18}
                    lineHeight={'xs'}
                    fontWeight={'semibold'}
                    fontFamily={'Dosis-Regular'}
                    color={appcolor.teks[mode][1]}>
                    {item.kode}
                </Text>
            </Stack>
            <HStack space={2} alignItems={'center'}>
                <VStack flex={1} justifyContent={'space-between'}>
                    <VStack>
                        <Text 
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][1]}>
                            {item.kd_barang}
                        </Text>
                        <Text 
                            fontSize={18}
                            lineHeight={'xs'}
                            fontWeight={'semibold'}
                            fontFamily={'Poppins-Regular'}
                            color={appcolor.teks[mode][1]}>
                            {item.nm_barang}
                        </Text>
                        <Text 
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][1]}>
                            PARTNUM : {item.barang?.num_part}
                        </Text>

                    </VStack>
                    <HStack space={1} mt={2}>
                        <House2 size="20" color={appcolor.teks[mode][3]} variant="Bulk"/>
                        <Text 
                            fontSize={18}
                            lineHeight={'xs'}
                            color={appcolor.teks[mode][3]}>
                            {item.nm_gudang}
                        </Text>
                    </HStack>
                </VStack>
                <VStack mx={1} alignItems={'center'}>
                    <Text 
                        fontSize={'2xl'}
                        lineHeight={'xs'}
                        fontWeight={'bold'}
                        fontFamily={'Dosis-Regular'}
                        color={appcolor.teks[mode][1]}>
                        {item.qty}
                    </Text>
                    <Text 
                        lineHeight={'xs'}
                        fontFamily={'Abel-Regular'}
                        color={appcolor.teks[mode][1]}>
                        {item.satuan}
                    </Text>
                    
                </VStack>
            </HStack>
            
        </VStack>
    )
}