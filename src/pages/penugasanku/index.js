import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { getPenugasan } from '../../redux/fetchPenugasanSlice'
import LoadingHauler from '../../components/LoadingHauler'
import ListTugasKu from './list'
import NoData from '../../components/NoData'
import FilterTugasKu from './filter'
import moment from 'moment'
import { countPenugasan } from '../../redux/fetchPenugasanCountSlice'

const PenugasanKu = () => {
    const route = useNavigation()
    const focused = useIsFocused()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { data, loading } = useSelector(state => state.penugasan)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        group: 'assigned',
        status: "",
        stsObject: null,
        nmassigner: "",
        kode: "",
        startDate: moment().startOf('year').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
    })

    useEffect(() =>  {
        dispatch(getPenugasan(dataFilter))
        dispatch(countPenugasan())
    }, [focused])

    const onRefreshHandle = useCallback(() => {
        dispatch(getPenugasan(dataFilter))
        dispatch(countPenugasan())
    })

    const filterToggleHandle = () => {
        setOpenFilter(!openFilter)
    }

    const onResetFilterHandle = () => {
        const resetData = {
            group: 'assigned',
            status: "",
            stsObject: null,
            nmassigner: "",
            kode: "",
            startDate: moment().startOf('year').format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD')
        }
        dispatch(getPenugasan(resetData))
        setDataFilter(resetData)
        setOpenFilter(false)
    }

    const onApplyFilterHandle = () => {
        dispatch(getPenugasan(dataFilter))
        setOpenFilter(false)
    }

    console.log(dataFilter);
    

    if(loading){
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Tugas Harianku"} onThemes={true} onFilter={null} onNotification={true}/>
                <LoadingHauler/>
            </VStack>
        </AppScreen>
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Tugas Harianku"} onThemes={true} onFilter={filterToggleHandle} onNotification={true}/>
                <VStack flex={1} px={3}>
                    {
                        openFilter ?
                        <FilterTugasKu 
                            state={dataFilter}
                            setState={setDataFilter}
                            resetFilter={onResetFilterHandle} 
                            applyFilter={onApplyFilterHandle}/>
                        :
                        <VStack flex={1}>
                            {
                                data.length > 0 ?
                                <ListTugasKu 
                                    data={data} 
                                    mode={mode}
                                    refreshing={loading}
                                    onRefreshHandle={onRefreshHandle}/>
                                :
                                <NoData title={"Data tidak ditemukan"}/>
                            }
                        </VStack>
                    }
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default PenugasanKu