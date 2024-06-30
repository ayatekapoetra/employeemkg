import { FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useDispatch, useSelector } from 'react-redux'
import { getDataFetch } from '../../../redux/fetchDataSlice'
import apiFetch from '../../../helpers/ApiFetch'
import moment from 'moment'
import ItemApprovalChecklog from './renderItem'
import FilterApprovalChecklog from './filterApproval'
import { applyAlert } from '../../../redux/alertSlice'
import NoData from '../../../components/NoData'
import { RefreshControl } from 'react-native-gesture-handler'
import appcolor from '../../../common/colorMode'
import { CloseCircle } from 'iconsax-react-native'
import { useIsFocused } from '@react-navigation/native'
import LoadingHauler from '../../../components/LoadingHauler'

const ApprovalChecklogHarian = () => {
    const dispatch = useDispatch()
    const isFocused = useIsFocused()
    const mode = useSelector(state => state.themes.value)
    const { data, loading, error } = useSelector( state => state.fetchData)
    const [ countRows, setCountRows ] = useState(true)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ filterData, setFilterData ] = useState({
        karyawan_id: null,
        karyawan: null,
        kehadiran_sts: " ",
        dateStart: moment().add(-1, 'day').format('YYYY-MM-DD'),
        dateEnd: moment().format('YYYY-MM-DD'),
    })

    // console.log(filterData);

    useEffect(() => {
        getDataApi()
    }, [openFilter, isFocused])

    const getDataApi = () => {
        dispatch(getDataFetch({uri: 'mobile/checklog-approval', params: filterData}))
    }

    const openFilterData = () => {
        setOpenFilter(!openFilter)
    }

    const onRefreshData = useCallback(() => {
        getDataApi()
    })

    if(error){
        dispatch(applyAlert({
            show: true,
            status: 'error',
            title: error,
            subtitle: "Request failed with status code 500"
        }))
    }

    // console.log("----DATA----", data);

    if(loading){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Approval Checklog Harian"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen 
                    title={"Approval Checklog Harian"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={openFilterData} 
                    onNotification={true}/>
                
                {
                    openFilter ?
                    <VStack flex={2}>
                        <FilterApprovalChecklog 
                            openFilter={openFilter} 
                            setOpenFilter={setOpenFilter}
                            filterData={filterData}
                            setFilterData={setFilterData}/>
                    </VStack>
                    :
                    <VStack flex={1}>
                        <HStack mx={2} px={2} py={1} bg={appcolor.box[mode]} justifyContent={'space-between'} rounded={'md'}>
                            <Text onPress={onRefreshData} color={appcolor.teks[mode][2]}>Total data {(data.length)?.toLocaleString('ID')} rows</Text>
                        </HStack>
                        <VStack px={3}>
                            {
                                data.length > 0 ?
                                <FlatList 
                                    data={data} 
                                    keyExtractor={item => item.id} 
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshData} />}
                                    renderItem={({item}) => <ItemApprovalChecklog data={item} mode={mode}/>}/>
                                :
                                <NoData title={'Data tidak ditemukan...'} subtitle={'Gunakan filter untuk memilih\ndata yang spesifik'} onRefresh={onRefreshData}/>
                            }
                        </VStack>

                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ApprovalChecklogHarian