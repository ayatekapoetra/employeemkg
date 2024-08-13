import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import FilterApprovalLemburKaryawan from './filterApproval'
import appcolor from '../../../common/colorMode'
import NoData from '../../../components/NoData'
import { getDataFetch } from '../../../redux/fetchDataSlice'
import ItemApprovalLemburKaryawan from './renderItem'
import { useIsFocused } from '@react-navigation/native'

const ApprovalLemburKaryawan = () => {
    const dispatch = useDispatch()
    const activeLayer = useIsFocused()
    const mode = useSelector(state => state.themes.value)
    const { data, loading, error } = useSelector( state => state.fetchData)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ filterData, setFilterData ] = useState({
        dateStart: moment('2024-06-02').startOf('month').format("YYYY-MM-DD"),
        dateEnd: moment().endOf('month').format("YYYY-MM-DD"),
        karyawan_id: null,
        status: "ALL",
    })

    useEffect(() => {
        getDataApi(filterData)
    }, [filterData])

    const getDataApi = async ( qstring = null) => {
        console.log(qstring);
        dispatch(getDataFetch({uri: 'hrd/perintah-lembur', params: qstring}))
    }

    const openFilterData = () => {
        setOpenFilter(!openFilter)
    }

    const onRefreshData = useCallback(() => {
        getDataApi(filterData)
    })

    console.log(filterData);

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen
                    title={"Approval Lembur Karyawan"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={openFilterData} 
                    onNotification={true}/>
                <VStack flex={1}>
                    {
                        openFilter ?
                        <FilterApprovalLemburKaryawan
                            openFilter={openFilter} 
                            setOpenFilter={setOpenFilter}
                            filterData={filterData}
                            setFilterData={setFilterData}/>
                        :
                        <VStack flex={1}>
                            <HStack mx={2} px={2} py={1} bg={appcolor.box[mode]} alignItems={'center'} justifyContent={'space-between'} rounded={'md'}>
                                <Text fontFamily={'Teko-Medium'} fontSize={'18'} color={appcolor.teks[mode][1]}>Usap kebawah utk refresh data</Text>
                                <Text onPress={onRefreshData} color={appcolor.teks[mode][2]}>Total data {(data.length)?.toLocaleString('ID')} rows</Text>
                            </HStack>
                            <VStack mt={2} px={3}>
                                {
                                    data.length > 0 ?
                                    <>
                                        {
                                            data.length > 10000 ?
                                            <OverloadScreen/>
                                            :
                                            <FlatList
                                            data={data}
                                            showsVerticalScrollIndicator={false}
                                            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshData} />}
                                            renderItem={({item}) => <ItemApprovalLemburKaryawan data={item} mode={mode}/>}
                                            keyExtractor={item => item.id}/>
                                        }
                                    </>
                                    :
                                    <NoData title={'Data tidak ditemukan...'} subtitle={'Gunakan filter untuk memilih\ndata yang spesifik'} onRefresh={onRefreshData}/>
                                }
                            </VStack>
                        </VStack>
                    }
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ApprovalLemburKaryawan