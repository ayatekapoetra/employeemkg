import _ from 'underscore'
import React, { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'
import AppScreen from '../../../components/AppScreen'
import { HStack, VStack, Text, Image } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useRoute } from '@react-navigation/native'
import UnderDevelopmentScreen from '../../../components/UnderDevelopment'

import DetailsActiveWorking from './details-working'
import FilterReportEquipmentStandByDetails from './filter'

const { width, height } = Dimensions.get('screen')

const randLocation = () => {
    const h = _.random(0, height-150);
    const w = _.random(0, width-50);
    return {
        randH: h,
        randW: w
    }
}

const ReportEquipmentStandByDetails = () => {
    const { params } = useRoute()
    const [ dataItems, setDataItems ] = useState(params.item)
    const [ isFilter, setIsFilter ] = useState(false)
    const [ qstring, setQstring ] = useState({
        equipments: [],
        penyewa: null,
        lokasi: null
    })

    useEffect(() => getDataItems(), [])

    const getDataItems = () => {
        const arrayUnit = params?.item?.map( m => {
            switch (m.status) {
                case 'active':
                    var bgTitle = '#a8a29e'
                    var bgDot = '#44403c'
                    break;
                case 'check':
                    var bgTitle = '#84cc16'
                    var bgDot = '#166534'
                    break;
                case 'done':
                    var bgTitle = '#3b82f6'
                    var bgDot = '#9f1239'
                    break;
                default:
                    var bgTitle = '#f87171'
                    var bgDot = '#9f1239'
                    break;
            }

            return {
                ...m,
                kode: m.equipment.kode,
                model: m.equipment.model,
                imgTop: randLocation().randH,
                imgLeft: randLocation().randW,
                bgTitle: bgTitle,
                bgDot: bgDot,
                openSheet: false
            }
        })

        setDataItems(arrayUnit)
    }

    const filteringData = (array) => {
        const arrayUnit = array?.map( m => {
            switch (m.status) {
                case 'active':
                    var bgTitle = '#a8a29e'
                    var bgDot = '#44403c'
                    break;
                case 'check':
                    var bgTitle = '#84cc16'
                    var bgDot = '#166534'
                    break;
                case 'done':
                    var bgTitle = '#3b82f6'
                    var bgDot = '#9f1239'
                    break;
                default:
                    var bgTitle = '#f87171'
                    var bgDot = '#9f1239'
                    break;
            }

            return {
                ...m,
                kode: m.equipment.kode,
                model: m.equipment.model,
                imgTop: randLocation().randH,
                imgLeft: randLocation().randW,
                bgTitle: bgTitle,
                bgDot: bgDot,
                openSheet: false
            }
        })

        setDataItems(arrayUnit)
    }

    const openFilter = () => {
        setIsFilter(!isFilter)
    }

    const applyFilterHandle = () => {
        if(qstring.equipments.length > 0){
            console.log('ada equipment');
            var dataApply = params.item?.filter( f => (qstring.equipments.map(m => m.id)).includes(f.equipment_id))
            filteringData(dataApply)
        }else if(qstring.penyewa){
            console.log('ada penyewa');
            var dataApply = params.item?.filter(f => qstring.penyewa.id == f.penyewa_id)
            filteringData(dataApply)
        }else if(qstring.lokasi){
            console.log('ada penyewa');
            var dataApply = params.item?.filter(f => qstring.lokasi.id == f.lokasi_id)
            filteringData(dataApply)
        }else if(qstring.equipments.length > 0 && qstring.penyewa){
            console.log('ada equipment & penyewa');
            var dataApply = params.item?.filter( 
                f => (qstring.equipments.map(m => m.id)).includes(f.equipment_id) && qstring.penyewa.id === f.penyewa_id
            )
            filteringData(dataApply)
        }else if(qstring.equipments.length > 0 && qstring.penyewa && qstring.lokasi){
            console.log('ada equipment & penyewa');
            var dataApply = params.item?.filter( 
                f => (qstring.equipments.map(m => m.id)).includes(f.equipment_id) && 
                qstring.penyewa.id === f.penyewa_id &&
                qstring.lokasi.id === f.lokasi_id
            )
            filteringData(dataApply)
        }else{
            getDataItems()
        }

        setIsFilter(false)
    }

    const resetFilterHandle = () => {
        getDataItems()
        setIsFilter(false)
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={params.title} onBack={true} onThemes={true} onFilter={openFilter} onNotification={true}/>
                {
                    isFilter ?
                    <FilterReportEquipmentStandByDetails 
                        setQstring={setQstring} 
                        qstring={qstring} 
                        resetFilterHandle={resetFilterHandle}
                        applyFilterHandle={applyFilterHandle}/>
                    :
                    <VStack flex={1}>
                        <Image 
                            opacity={.7} 
                            position={'absolute'} 
                            resizeMode='cover' 
                            source={require('../../../../assets/images/map-illustration.jpg')} 
                            alt='...' style={{width: width, height: height}}/>
                        {
                            params.title === 'Active Work' &&
                            <DetailsActiveWorking data={dataItems}/>
                        }
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ReportEquipmentStandByDetails



