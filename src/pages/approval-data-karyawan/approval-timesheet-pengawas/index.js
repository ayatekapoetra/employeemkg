import { RefreshControl, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import FilterApprovalTimesheet from './filterApproval'
import { FlatList } from 'react-native-gesture-handler'
import NoData from '../../../components/NoData'
import LoadingHauler from '../../../components/LoadingHauler'
import ItemApprovalTimesheet from './renderItem'
import OverloadScreen from '../../../components/OverloadData'
import { getTimesheet } from '../../../redux/fetchTimeSheet'

const ApprovalTimesheetPengawas = () => {
    const dispatch = useDispatch()
    const isFocused = useIsFocused()
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector( state => state.auth)
    const { data, loading, error } = useSelector( state => state.timesheet)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ filterData, setFilterData ] = useState({
        pengawas_id: user?.karyawan?.id,
        sts_approved: 'P',
        dateStart: moment().add(-3, 'days').format("YYYY-MM-DD"),
        dateEnd: moment().format("YYYY-MM-DD")
    })

    useEffect(() => {
        getDataApi(filterData)
    }, [isFocused])

    const getDataApi = async ( qstring = null) => {
        dispatch(getTimesheet(qstring))
    }

    const openFilterData = () => {
        setOpenFilter(!openFilter)
    }

    const onRefreshData = useCallback(() => {
        dispatch(getTimesheet(filterData))
    })

    const applyFilterHandle = () => {
        setOpenFilter(!openFilter)
        getDataApi(filterData)
    }

    if(loading){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Approval Timesheet"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Approval Timesheet"} onBack={true} onThemes={true} onFilter={openFilterData} onNotification={true}/>
                {
                    openFilter ?
                        <FilterApprovalTimesheet 
                            openFilter={openFilter} 
                            setOpenFilter={setOpenFilter}
                            filterData={filterData}
                            applyFilter={applyFilterHandle}
                            setFilterData={setFilterData}/>
                        :
                        <VStack flex={1}>
                            <TouchableOpacity onPress={onRefreshData}>
                                <HStack mx={2} px={2} py={1} bg={appcolor.box[mode]} justifyContent={'space-between'} alignItems={'center'} rounded={'md'}>
                                    <Text fontFamily={'Teko-Medium'} fontSize={'18'} color={appcolor.teks[mode][1]}>Usap kebawah utk refresh data</Text>
                                    <Text onPress={null} color={appcolor.teks[mode][2]}>Total {(data.length)?.toLocaleString('ID')} rows</Text>
                                </HStack>
                            </TouchableOpacity>
                            {/* <VStack mt={2} px={3}>
                                {
                                    data.length > 0 ?
                                    <>
                                        {
                                            data.length > 100 ?
                                            <OverloadScreen limit={100}/>
                                            :
                                            <FlatList
                                                data={data}
                                                showsVerticalScrollIndicator={false}
                                                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshData} />}
                                                renderItem={({item}) => <ItemApprovalTimesheet data={item} mode={mode}/>}
                                                keyExtractor={item => item.id}/>
                                        }
                                    </>
                                    :
                                    <NoData title={'Data tidak ditemukan...'} subtitle={'Gunakan filter untuk memilih\ndata yang spesifik'} onRefresh={onRefreshData}/>
                                }
                            </VStack> */}
                            <VStack mt={2} px={3}>
                                {
                                    data.length > 0 ?
                                    <FlatList
                                        data={data||[]}
                                        showsVerticalScrollIndicator={false}
                                        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshData} />}
                                        renderItem={({item}) => <ItemApprovalTimesheet data={item} mode={mode}/>}
                                        keyExtractor={item => item.id}/>
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

export default ApprovalTimesheetPengawas