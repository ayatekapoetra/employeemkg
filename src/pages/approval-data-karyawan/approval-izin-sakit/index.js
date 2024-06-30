import { TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { getSakit } from '../../../redux/izinSakitSlice'
import { applyAlert } from '../../../redux/alertSlice'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import SakitCardList from '../../permintaan-absensi-karyawan/informasi-sakit/listCard'
import LoadingHauler from '../../../components/LoadingHauler'
import NoData from '../../../components/NoData'
import AppScreen from '../../../components/AppScreen'
import HeaderScreen from '../../../components/HeaderScreen'
import FilterApprovalIzinSakit from './filterApproval'
import ItemApprovalIzinSakit from './renderItem'

const ApprovalIzinSakit = () => {
    const route = useNavigation()
    const isFocus = useIsFocused()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const { data, error, loading } = useSelector(state => state.dataSakit)
    const [ refresh, setRefresh ] = useState(loading)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ filterData, setFilterData ] = useState({
        karyawan_id: null,
        karyawan: null,
        diketahui: user?.karyawan?.id,
        dateStart: moment().startOf('month').format('YYYY-MM-DD'),
        dateEnd: moment().format('YYYY-MM-DD'),
        narasi: ""
    })

    console.log(data);

    useEffect(() => {
        onGetDataHandle()
    }, [isFocus])

    const onGetDataHandle = async () => {
        dispatch(getSakit({qstring: filterData}))
    }

    const openFilterData = () => {
        setOpenFilter(!openFilter)
    }

    const onRefreshHandle = useCallback(() => {
        setRefresh(true)
        onGetDataHandle({qstring: null})
        setRefresh(false)
    })

    if(error){
        dispatch(applyAlert({
            show: true,
            status: 'error',
            title: "ERR_FETCH",
            subtitle: "Request failed with status code 500"
        }))
    }

    if(loading || refresh){
        return <LoadingHauler/>
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen 
                    title={"Approval Izin Sakit"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={openFilterData} 
                    onNotification={true}/>
                
                {
                    openFilter ?
                    <VStack flex={2}>
                        <FilterApprovalIzinSakit 
                            openFilter={openFilter} 
                            setOpenFilter={setOpenFilter}
                            filterData={filterData}
                            setFilterData={setFilterData}/>
                    </VStack>
                    :
                    <VStack flex={1}>
                        <HStack mx={2} px={2} py={1} bg={appcolor.box[mode]} justifyContent={'space-between'} rounded={'md'}>
                            <Text onPress={onRefreshHandle} color={appcolor.teks[mode][2]}>Total data {(data.length)?.toLocaleString('ID')} rows</Text>
                        </HStack>
                        <VStack px={3}>
                            {
                                data?.length > 0 ?
                                <FlatList 
                                    data={data} 
                                    keyExtractor={item => item.id} 
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle} />}
                                    renderItem={({item}) => <ItemApprovalIzinSakit item={item} mode={mode}/>}/>
                                :
                                <NoData title={'Data tidak ditemukan...'} subtitle={'Gunakan filter untuk memilih\ndata yang spesifik'} onRefresh={onRefreshHandle}/>
                            }
                        </VStack>

                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ApprovalIzinSakit