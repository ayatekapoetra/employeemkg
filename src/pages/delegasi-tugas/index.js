import { FlatList, TouchableOpacity, Dimensions, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import { VStack, Text, HStack, Avatar, Image, Stack, Badge, Center } from 'native-base'
import { AlignVertically, Danger, NoteAdd, TruckFast, Watch } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import apiFetch from '../../helpers/ApiFetch'
import moment from 'moment'
import BadgeAlt from '../../components/BadgeAlt'
import { applyAlert } from '../../redux/alertSlice'
import FilterDelegasiTugas from './filterDelegasiTugas'
import LoadingHauler from '../../components/LoadingHauler'

const { width, height } = Dimensions.get("screen")

const DelegasiTugasScreen = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState(null)
    const [ showFilter, setShowFilter ] = useState(false)
    const [ refreshing, setRefresing ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        type: ''
    })

    useEffect(() => {
        getDataFetch(dataFilter)
    }, [])

    const getDataFetch = async (qstring = dataFilter) => {
        setRefresing(true)
        try {
            const resp = await apiFetch.get('penugasan-kerja/keluar', {params: qstring})
            const { data } = resp.data
            setState(data)
            setRefresing(false)
        } catch (error) {
            setRefresing(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Error',
                subtitle: error.message
            }))
        }
    }

    const onRefresh = useCallback(() => {
        getDataFetch()
    })

    const onOpenFilterHandle = () => setShowFilter(!showFilter)
    const onCloseFilterHandle = useCallback(() => {
        setDataFilter({type: ''})
        setShowFilter(!showFilter)
        getDataFetch()
    })

    const onApplyFilter = () => {
        getDataFetch(dataFilter)
        setShowFilter(!showFilter)
    } 

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Delegasi Tugas Karyawan"} onBack={true} onThemes={true} onFilter={onOpenFilterHandle} onNotification={true}/>
                { refreshing && <LoadingHauler/> }
                {
                    showFilter ?
                    <VStack px={3} flex={1}>
                        <FilterDelegasiTugas onClose={onCloseFilterHandle} onApplyFilter={onApplyFilter} qstring={dataFilter} setQstring={setDataFilter}/>
                    </VStack>
                    :
                    <VStack px={3} flex={1}>
                        <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                            <TouchableOpacity onPress={() => route.navigate('create-delegasi-tugas')}>
                                <HStack px={3} py={2} space={2} alignItems={"center"}>
                                    <NoteAdd size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={18} 
                                            fontWeight={"semibold"}
                                            fontFamily={"Quicksand-SemiBold"}
                                            color={appcolor.teks[mode][1]}>
                                            Buat Penugasan Kerja
                                        </Text>
                                        <Text 
                                            fontSize={12} 
                                            fontWeight={300}
                                            fontFamily={"Poppins-Light"}
                                            color={appcolor.teks[mode][2]}>
                                            Membuat tugas tugas kepada karyawan
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                        <VStack flex={1}>
                            {
                                state ?
                                <VStack flex={1}>
                                    {
                                        state.length > 0 ?
                                        <FlatList 
                                            data={state} 
                                            showsVerticalScrollIndicator={false}
                                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                                            renderItem={( { item } ) => <RenderComponentList data={item} mode={mode} route={route}/>}
                                            keyExtractor={item => item.id}/>
                                        :
                                        <Center flex={1}>
                                            <Image source={require('../../../assets/images/empty-box.png')} resizeMode='cover' alt='No-data' style={{height: 400, width: width}}/>
                                            <Text fontFamily={'Abel-Regular'} fontSize={18} fontWeight={300} color={appcolor.teks[mode][1]}>
                                                Data tidak ditemukan
                                            </Text>
                                        </Center>
                                    }
                                </VStack>
                                :
                                <Center h={'full'}>
                                    <Image opacity={.3} source={require('../../../assets/images/illustration.png')} resizeMode='cover' alt='...' style={{width: width, height: 350}}/>
                                    <Text fontFamily={'Poppins'} fontSize={18} fontWeight={300} color={appcolor.teks[mode][5]}>
                                        Gagal mengambil data dari server
                                    </Text>
                                </Center>
                            }
                        </VStack>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default DelegasiTugasScreen

const RenderComponentList = ( { data, mode, route } ) => {

    const showDetailPenugasan = () => {
        route.navigate('show-delegasi-tugas', {...data, isRemoved: true})
    }

    switch (data.status) {
        case "check":
            var badge = <BadgeAlt rounded={"full"} type={"info"} colorScheme={"info.200"} title={"Check"}/>
            break;
        case "done":
            var badge = <BadgeAlt rounded={"full"} type={"success"} colorScheme={"success.200"} title={"Selesai"}/>
            break;
        case "reject":
            var badge = <BadgeAlt rounded={"full"} type={"error"} colorScheme={"error.200"} title={"Ditolak"}/>
            break;
        default:
            var badge = <BadgeAlt rounded={"full"} type={"warning"} colorScheme={"warning.200"} title={"Baru"}/>
            break;
    }

    return (
        <TouchableOpacity onPress={showDetailPenugasan}>
            <VStack py={2} space={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                <VStack flex={1} justifyContent={'space-between'}>
                    <VStack my={2}>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                            <VStack flex={1}>
                                <Text 
                                    flex={1}
                                    fontWeight={500} 
                                    fontSize={18}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'} 
                                    color={appcolor.teks[mode][1]}>
                                    {data.nm_assign}
                                </Text>
                                <Text 
                                    fontWeight={300} 
                                    fontSize={12}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][4]}>
                                    { moment(data.date_ops).format('dddd, DD MMMM YYYY') }
                                </Text>
                            </VStack>
                            { badge }
                        </HStack>
                        
                        {
                            data.type === 'user' ?
                            <Text fontFamily={'Quicksand'} color={appcolor.teks[mode][1]}>
                                {data.narasitask}
                            </Text>
                            :
                            <VStack>
                                <Text fontFamily={'Dosis'} fontWeight={'semibold'} color={appcolor.teks[mode][1]}>
                                    {data.penyewa.nama}
                                </Text>
                                <HStack justifyContent={'space-between'}>
                                    <HStack space={1} alignItems={'center'}>
                                        <Danger size="18" color={appcolor.teks[mode][1]} variant={"Bulk"}/>
                                        <Text fontFamily={'Quicksand'} color={appcolor.teks[mode][1]}>
                                            {data.kegiatan.nama}
                                        </Text>
                                    </HStack>
                                    <HStack space={1} alignItems={'center'}>
                                        <TruckFast size="18" color={appcolor.teks[mode][1]} variant={"Bulk"}/>
                                        <Text fontFamily={'Quicksand'} color={appcolor.teks[mode][1]}>
                                            {data.equipment.kode}
                                        </Text>
                                    </HStack>
                                </HStack>
                                <HStack space={1} alignItems={'center'}>
                                    <AlignVertically size="18" color={appcolor.teks[mode][1]} variant={"Bulk"}/>
                                    <Text fontFamily={'Quicksand'} color={appcolor.teks[mode][1]}>
                                        {data.lokasi.nama}
                                    </Text>
                                </HStack>
                                
                            </VStack>
                        }
                    </VStack>
                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'}>
                        {
                            data.type === 'user' ?
                            <VStack w={'50px'}>
                                <Avatar source={require('../../../assets/images/engineer.png')} alt='...' resizeMode="contain" style={{width: 50, height: 50}}/>
                            </VStack>
                            :
                            <VStack w={'50px'}>
                                {
                                    data.equipment.kategori === 'DT' ?
                                    <Image source={require('../../../assets/images/dumptruck.png')} alt='...' resizeMode="contain" style={{width: 50, height: 50}}/>
                                    :
                                    <Image source={require('../../../assets/images/excavator.png')} alt='...' resizeMode="contain" style={{width: 50, height: 50}}/>
                                }
                            </VStack>
                        }
                        <VStack px={2} py={1} flex={1} borderWidth={1} borderStyle={'dotted'} rounded={'md'} borderColor={appcolor.line[mode][2]}>
                            <Text lineHeight={'xs'} fontFamily={'Poppins-Regular'} color={appcolor.teks[mode][1]}>
                                Mulai Tugas :
                            </Text>
                            <HStack mt={-1} alignItems={'center'}>
                                <Watch size="22" color={appcolor.teks[mode][3]} variant={"Outline"}/>
                                <VStack>
                                    <Text fontFamily={'Roboto-Regular'} color={appcolor.teks[mode][1]}>
                                        { moment(data.starttask).format('HH:mm') }
                                    </Text>
                                    <Text mt={-1} fontSize={10} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][2]}>
                                        { moment(data.starttask).format('DD MMMM YYYY') }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                        
                        <VStack px={2} py={1} flex={1} borderWidth={1} borderStyle={'dotted'} rounded={'md'} borderColor={appcolor.line[mode][2]}>
                            <Text lineHeight={'xs'} fontFamily={'Poppins-Regular'} color={appcolor.teks[mode][1]}>
                                {data.type === 'user' ? 'Dateline :':'Tugas Selesai :'}
                            </Text>
                            <HStack mt={-1} alignItems={'center'}>
                                <Watch size="22" color={appcolor.teks[mode][5]} variant={"Outline"}/>
                                {
                                    data.type === 'user' ? 
                                    <VStack>
                                        <Text fontFamily={'Roboto-Regular'} color={appcolor.teks[mode][1]}>
                                            { moment(data.datelinetask).format('HH:mm') }
                                        </Text>
                                        <Text mt={-1} fontSize={10} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][2]}>
                                            { moment(data.datelinetask).format('DD MMMM YYYY') }
                                        </Text>
                                    </VStack>
                                    :
                                    <VStack>
                                        <Text fontFamily={'Roboto-Regular'} color={appcolor.teks[mode][1]}>
                                            { moment(data.finishtask).format('HH:mm') }
                                        </Text>
                                        <Text mt={-1} fontSize={10} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][2]}>
                                            { moment(data.finishtask).format('DD MMMM YYYY') }
                                        </Text>
                                    </VStack>
                                }
                            </HStack>
                        </VStack>
                        
                    </HStack>
                </VStack>
            </VStack>
        </TouchableOpacity>
    )
}