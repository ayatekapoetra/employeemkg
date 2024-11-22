import { Dimensions, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import { VStack, Text, Center, Image, HStack, Avatar } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import apiFetch from '../../helpers/ApiFetch'
import { useDispatch, useSelector } from 'react-redux'
import LoadingHauler from '../../components/LoadingHauler'
import appcolor from '../../common/colorMode'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { Watch } from 'iconsax-react-native'
import BadgeAlt from '../../components/BadgeAlt'
import moment from 'moment'

const { width, height } = Dimensions.get("screen")

const PenugasanKuPage = () => {
    const route = useNavigation()
    const focused = useIsFocused()
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ showFilter, setShowFilter ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        type: 'user'
    })

    useEffect(() => {
        getDataFetch(dataFilter)
    }, [focused])

    const onRefresh = useCallback(() => {
        getDataFetch(dataFilter)
    })

    const getDataFetch = async (qstring = null) => {
        setLoading(true)
        try {
            const resp = await apiFetch.get('penugasan-kerja/masuk', {params: qstring})
            const { data } = resp.data
            setState(data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Tugas Harianku"} onThemes={true} onFilter={null} onNotification={true}/>
                <VStack flex={1}>
                    {
                        loading ?
                        <LoadingHauler/>
                        :
                        <VStack px={3} flex={1}>
                            {
                                    state ?
                                    <VStack flex={1}>
                                        {
                                            state.length > 0 ?
                                            <FlatList 
                                                data={state} 
                                                showsVerticalScrollIndicator={false}
                                                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
                                                renderItem={( { item } ) => <RenderComponentList item={item} mode={mode} route={route}/>}
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
                                    <Center flex={1}>
                                        <Image source={require('../../../assets/images/illustration.png')} resizeMode='cover' alt='...' style={{width: width, height: 350}}/>
                                        <Text fontFamily={'Poppins'} fontSize={18} fontWeight={300} color={appcolor.teks[mode][5]}>
                                            Gagal mengambil data dari server
                                        </Text>
                                    </Center>
                                }
                        </VStack>
                    }

                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default PenugasanKuPage

const RenderComponentList = ( { item, mode, route } ) => {

    const showDetailPenugasan = () => {
        route.navigate('show-delegasi-tugas', item)
    }

    switch (item.status) {
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
                                    {item.creator?.karyawan?.nama || '???'}
                                </Text>
                                <Text 
                                    fontWeight={300} 
                                    fontSize={12}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][3]}>
                                    {item.creator?.karyawan?.section || '--'}
                                </Text>
                            </VStack>
                            { badge }
                        </HStack>
                        
                        <Text fontFamily={'Quicksand'} color={appcolor.teks[mode][1]}>
                            {item.narasitask}
                        </Text>
                    </VStack>
                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'}>
                        <VStack w={'50px'}>
                            <Avatar source={require('../../../assets/images/engineer.png')} alt='...' resizeMode="contain" style={{width: 50, height: 50}}/>
                        </VStack>
                        <VStack px={2} py={1} flex={1} borderWidth={1} borderStyle={'dotted'} rounded={'md'} borderColor={appcolor.line[mode][2]}>
                            <Text lineHeight={'xs'} fontFamily={'Poppins-Regular'} color={appcolor.teks[mode][1]}>
                                Mulai Tugas :
                            </Text>
                            <HStack mt={-1} alignItems={'center'}>
                                <Watch size="22" color={appcolor.teks[mode][3]} variant={"Outline"}/>
                                <VStack>
                                    <Text fontFamily={'Roboto-Regular'} color={appcolor.teks[mode][1]}>
                                        { moment(item.starttask).format('HH:mm') }
                                    </Text>
                                    <Text mt={-1} fontSize={10} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][2]}>
                                        { moment(item.starttask).format('DD MMMM YYYY') }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                        
                        <VStack px={2} py={1} flex={1} borderWidth={1} borderStyle={'dotted'} rounded={'md'} borderColor={appcolor.line[mode][2]}>
                            <Text lineHeight={'xs'} fontFamily={'Poppins-Regular'} color={appcolor.teks[mode][1]}>
                                Dateline :
                            </Text>
                            <HStack mt={-1} alignItems={'center'}>
                                <Watch size="22" color={appcolor.teks[mode][5]} variant={"Outline"}/>
                                <VStack>
                                    <Text fontFamily={'Roboto-Regular'} color={appcolor.teks[mode][1]}>
                                        { moment(item.datelinetask).format('HH:mm') }
                                    </Text>
                                    <Text mt={-1} fontSize={10} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][2]}>
                                        { moment(item.datelinetask).format('DD MMMM YYYY') }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                        
                    </HStack>
                </VStack>
                <Text 
                    fontWeight={300} 
                    fontSize={12}
                    lineHeight={'xs'}
                    fontFamily={'Abel-Regular'} 
                    color={appcolor.teks[mode][1]}>
                    { moment(item.date_ops, 'YYYYMMDDHHmm').fromNow() }
                </Text>
            </VStack>
        </TouchableOpacity>
    )
}