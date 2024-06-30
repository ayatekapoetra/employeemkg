import { FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import ListAbsensi from './listAbsensi'
import FilterAbsensi from './filterAbsensi'
import NoData from '../../components/NoData'
import apiFetch from '../../helpers/ApiFetch'
import moment from 'moment'
import LoadingHauler from '../../components/LoadingHauler'

const RiwayatChecklogHarianPage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ filterAbsensi, setFilterAbsensi ] = useState(false)
    const [ filter, setFilter ] = useState({
        karyawan_id: user?.karyawan?.id,
        karyawan: user?.karyawan,
        dateStart: moment().add(-1, 'month').format("YYYY-MM-DD"),
        dateEnd: moment().format("YYYY-MM-DD"),
        verify_sts: "",
        approve_sts: "",
    })

    useEffect(() => {
        getDataFetch(filter)
    }, [])

    const getDataFetch = async (objString = null) => {
        setLoading(true)
        try {
            const resp = await apiFetch.get("mobile/checklog", {params: objString})
            // console.log('XXXX', resp);
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    const onRefreshHandle = async () => {
        await getDataFetch(filter)
    }

    const onApplyFilter = async () => {
        await getDataFetch(filter)
        setFilterAbsensi(!filterAbsensi)
    }


    const onFilterHandle = () => {
        setFilterAbsensi(!filterAbsensi)
    }

    if(loading){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Riwayat Kehadiran Harian"} onThemes={true} onFilter={onFilterHandle} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Riwayat Kehadiran Harian"} onThemes={true} onFilter={onFilterHandle} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <VStack flex={1}>
                        { 
                            filterAbsensi ?
                            <FilterAbsensi 
                                onApplyFilter={onApplyFilter} 
                                setFilter={setFilterAbsensi} 
                                qstring={filter} 
                                setQstring={setFilter}/> 
                            :
                            <>
                                {
                                    data.length > 0 ?
                                    <FlatList 
                                        data={data} 
                                        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}
                                        keyExtractor={(item) => item.id} 
                                        renderItem={({item}) => <ListAbsensi item={item}/>} />
                                    :
                                    <NoData title={"Maaf, data tidak ditemukan"} subtitle={"Gunakan filter untuk mencari data"}/>
                                }
                            </>
                        }
                    </VStack>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default RiwayatChecklogHarianPage