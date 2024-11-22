import { FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import FilterShipping from './filter'
import { useSelector } from 'react-redux'
import TabBarShipping from '../../../components/TabBarShipping'
import RenderItemBox from './item-box'
// import RenderItemList from './item-list'
import RenderItemChart from './item-chart'
// import AnimatedFlatList from './item-listx'
import apiFetch from '../../../helpers/ApiFetch'
import AnimateItems from './item-animate'
import LoadingHauler from '../../../components/LoadingHauler'
import moment from 'moment'

const objFilter = {
    kode: '',
    barang: '',
    pemasok: null,
    pemasok_id: null,
    dateStart: moment('2023-01-01').format('YYYY-MM-DD'),
    dateEnd: moment().format('YYYY-MM-DD')
}

const ShippingMonitoring = () => {
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState([])
    const [ stateChart, setStateChart ] = useState([])
    const [ refresh, setRefresh ] = useState(false)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ tabulator, setTabulator ] = useState({card: true, list: false, chart: false})
    const [ qstring, setQstring ] = useState(objFilter)

    useEffect(() => {
        getDataApi(qstring)
    }, [])

    const onApplyFilter = () => {
        getDataApi(qstring)
        setOpenFilter(false)
    }

    const onResetFilter = () => {
        setQstring(objFilter)
        getDataApi(objFilter)
        setOpenFilter(false)
    }

    const getDataApi = async (params=null) => {
        setRefresh(true)
        try {
            const resp = await apiFetch.post('report-shipping-monitoring/pickup-items', params)
            console.log(resp.data);
            setState(resp.data.data)
            generateDataChart(resp.data.data)
        } catch (error) {
            console.log(error);
        } finally {
            setRefresh(false)
        }
    }

    const generateDataChart = (data) => {
        var totJemput = 0
        var totDikirim = 0
        var totTransit = 0
        var totTiba = 0
        var totPersediaan = 0
        var totPemakaian = 0
        for (const elm of data) {
            totJemput += elm.pickup.jumlah
            totDikirim += elm.send.jumlah
            totTransit += elm.transit.jumlah
            totTiba += elm.received.jumlah
            totPersediaan += elm.persediaan.total
            totPemakaian += elm.pemakaian.total
        }

        let result = data.map( m => {
            return {
                cabang: m.nmcabang,
                jemput: parseInt(((m.pickup.jumlah) / totJemput) * 100) || 0,
                dikirim: parseInt(((m.send.jumlah) / totDikirim) * 100) || 0,
                transit: parseInt(((m.transit.jumlah) / totTransit) * 100) || 0,
                tiba: parseInt(((m.received.jumlah) / totTiba) * 100) || 0,
                persediaan: parseInt(((m.persediaan.total) / totPersediaan) * 100) || 0,
                pemakaian: parseInt(((m.pemakaian.total) / totPemakaian) * 100) || 0,
            }
        })

        setStateChart(result)
        // console.log(result);
    }

    const openFilterHandle = () => {
        setOpenFilter(!openFilter)
    }

    const onChangeTabScreen = (value) => {
        switch (value) {
            case 'card':
                setTabulator({card: true, list: false, chart: false})
                break;
            case 'list':
                setTabulator({card: false, list: true, chart: false})
                break;
            default:
                setTabulator({card: false, list: false, chart: true})
                break;
        }
    }

    // console.log(stateChart);
    

    if(refresh){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen title={"Shipping Monitoring"} onBack={true} onThemes={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }
    
    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Shipping Monitoring"} onBack={true} onThemes={true} onFilter={openFilterHandle} onNotification={true}/>
                {
                    openFilter ?
                    <FilterShipping mode={mode} qstring={qstring} setQstring={setQstring} applyFilter={onApplyFilter} resetFilter={onResetFilter}/>
                    :
                    <VStack flex={1} space={2} px={3}>
                        <TabBarShipping onPressTab={onChangeTabScreen}/>
                        {
                            tabulator.card &&
                            <FlatList 
                                data={state}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => <RenderItemBox item={item} mode={mode}/>}
                                keyExtractor={item => item.no}/>
                        }
                        {
                            tabulator.list &&
                            <VStack flex={1}>
                                <AnimateItems state={state}/>
                            </VStack>
                        }
                        {
                            tabulator.chart &&
                            <RenderItemChart mode={mode} dataCabang={stateChart}/>
                        }
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ShippingMonitoring