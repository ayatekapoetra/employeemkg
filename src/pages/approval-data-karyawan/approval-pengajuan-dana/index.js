import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { FlatList, VStack, Text, HStack, Center } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useDispatch, useSelector } from 'react-redux'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import LoadingHauler from '../../../components/LoadingHauler'
import NoData from '../../../components/NoData'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import BadgeAlt from '../../../components/BadgeAlt'
import { getPengajuan } from '../../../redux/fetchPengajuanSlice'
import Error500 from '../../../components/Error500'
import FilterPengajuanDana from './filter'

const ApprovalPengajuanDana = () => {
    const route = useNavigation()
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { data, loading, error } = useSelector( state => state.pengajuan)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ qstring, setQstring ] = useState({
        status: ['open', 'verify', 'approval'],
        nm_status: 'Selain Yang Telah Selesai',
        kode: '',
        narasi: '',
        bisnis: null,
        bisnis_id: null,
        beginDate: moment().add(-1, 'month').format('YYYY-MM-DD'),
        finishDate: moment().format('YYYY-MM-DD')
    })

    useEffect(() => {
        onGetDataFetch(qstring)
    }, [isFocused])

    const onGetDataFetch = async (params = null) => {
        dispatch(getPengajuan(params))
    }

    const isFiltered = () => setOpenFilter(!openFilter)

    const applyFilterHandle = () => {
        dispatch(getPengajuan(qstring))
        setOpenFilter(false)
    }

    const resetFilterHandle = () => {
        setQstring({
            status: ['open', 'verify', 'approval'],
            nm_status: 'Selain Yang Telah Selesai',
            kode: '',
            narasi: '',
            bisnis: null,
            bisnis_id: null,
            beginDate: moment().add(-1, 'month').format('YYYY-MM-DD'),
            finishDate: moment().format('YYYY-MM-DD')
        })

        dispatch(getPengajuan({
            status: ['open', 'verify', 'approval'],
            kode: '',
            narasi: '',
            bisnis: null,
            bisnis_id: null,
            beginDate: moment().add(-1, 'month').format('YYYY-MM-DD'),
            finishDate: moment().format('YYYY-MM-DD')
        }))
        setOpenFilter(false)
    }

    if(error){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen 
                        title={"Approval Pengajuan Dana"} 
                        onBack={true} 
                        onThemes={true} 
                        onFilter={null} 
                        onNotification={true}/>
                    <VStack px={3} flex={1}>
                        <Error500/>
                    </VStack>
                </VStack>
            </AppScreen>
        )
    }

    if(loading){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen 
                        title={"Approval Pengajuan Dana"} 
                        onBack={true} 
                        onThemes={true} 
                        onFilter={null} 
                        onNotification={true}/>
                    <VStack px={3} flex={1}>
                        <LoadingHauler/>
                    </VStack>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen 
                    title={"Approval Pengajuan Dana"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={isFiltered}
                    onNotification={true}/>
                <VStack px={3} flex={1}>
                    {
                        openFilter ?
                        <FilterPengajuanDana 
                            qstring={qstring} 
                            setQstring={setQstring}
                            resetFilter={resetFilterHandle}
                            applyFilter={applyFilterHandle}/>
                        :
                        <VStack>
                            {
                                data?.length > 0 ?
                                <FlatList 
                                    data={data} 
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({item}) => <RenderItemComponent item={item} mode={mode} route={route}/>} 
                                    key={i => i.id}/>
                                :
                                <NoData title={'Opps'} subtitle={'Data pengajuan dana tidak ditemukan...'}/>
                            }
                        </VStack>
                    }
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ApprovalPengajuanDana

const RenderItemComponent = ( { item, mode, route } ) => {
    switch (item.status) {
        case 'approval':
            var badgeStatus = <BadgeAlt rounded={"full"} type={"success"} colorScheme={"success.200"} title={"approval"}/>
            break;
        case 'verify':
            var badgeStatus = <BadgeAlt rounded={"full"} type={"info"} colorScheme={"blue.200"} title={"verify"}/>
            break;
        case 'open':
            var badgeStatus = <BadgeAlt rounded={"full"} type={"warning"} colorScheme={"yellow.200"} title={"baru"}/>
            break;
        case 'reject':
            var badgeStatus = <BadgeAlt rounded={"full"} type={"error"} colorScheme={"error.200"} title={"reject"}/>
            break;
        default:
            var badgeStatus = <BadgeAlt rounded={"full"} type={"danger"} colorScheme={"muted.200"} title={"done"}/>
            break;
    }
    return(
        <VStack borderBottomWidth={.5} borderColor={appcolor.line[mode][1]}>
            <TouchableOpacity 
                onPress={() => route.navigate('approval-pengajuan-dana-details', item)} 
                style={{ flex: 1 }}>
                <HStack space={2}>
                    <Center px={2} my={2} h={'90px'} w={'80px'} rounded={'md'} borderWidth={1} borderStyle={'dashed'} borderColor={appcolor.line[mode][2]}>
                        <Text 
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            { moment(item.trx_date).format('MMMM') }
                        </Text>
                        <Text 
                            mt={-3}
                            fontSize={30}
                            fontWeight={'black'}
                            fontFamily={'Dosis'}
                            color={appcolor.teks[mode][1]}>
                            { moment(item.trx_date).format('DD') }
                        </Text>
                        <Text 
                            mt={-2}
                            color={appcolor.teks[mode][2]}>
                            { moment(item.trx_date).format('YYYY') }
                        </Text>
                    </Center>
                    <VStack flex={1}>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                            <Text 
                                mt={2} 
                                fontSize={18}
                                // fontWeight={'semibold'}
                                fontFamily={'Teko-Regular'}
                                color={appcolor.teks[mode][1]}>
                                {item.kode}
                            </Text>
                            {badgeStatus}
                        </HStack>
                        <HStack mt={-3} space={2}>
                            <Text 
                                mt={2} 
                                fontWeight={'bold'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][3]}>
                                {item.bisnis.initial}
                            </Text>
                            <Text 
                                mt={2} 
                                fontWeight={'bold'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][3]}>
                                {item.cabang.nama}
                            </Text>
                        </HStack>
                        <HStack mt={-2} alignItems={'center'} justifyContent={'space-between'}>
                            <Text 
                                mt={2} 
                                fontWeight={'bold'}
                                fontFamily={'Dosis-Regular'}
                                color={appcolor.teks[mode][5]}>
                                Tot {(item.total)?.toLocaleString('ID') || '--'}
                            </Text>
                            <Text 
                                mt={2} 
                                fontWeight={'semibold'}
                                fontFamily={'Dosis-Regular'}
                                color={appcolor.teks[mode][6]}>
                                @{item.author.nama_lengkap}
                            </Text>
                        </HStack>
                        {
                            item.narasi ?
                            <HStack mt={-2} mb={1}>
                                <Text 
                                    mt={2} 
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {item.narasi}
                                </Text>
                            </HStack>
                            :
                            <>
                                {
                                    item.items.map( m => {
                                        return(
                                            <HStack key={m.id} space={1} alignItems={'flex-start'}>
                                                <Text 
                                                    lineHeight={'xs'}
                                                    flexWrap={'nowrap'}
                                                    fontFamily={'Quicksand-Regular'}
                                                    color={appcolor.teks[mode][1]}>
                                                    -
                                                </Text>
                                                <Text 
                                                    lineHeight={'xs'}
                                                    flexWrap={'nowrap'}
                                                    fontFamily={'Quicksand-Regular'}
                                                    color={appcolor.teks[mode][1]}>
                                                    {m.narasi}
                                                </Text>
                                            </HStack>
                                        )
                                    })
                                }
                            </>
                        }

                    </VStack>
                </HStack>
            </TouchableOpacity>
        </VStack>
    )
}