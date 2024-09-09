import { View, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { Image, VStack, Text, HStack, Stack } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { BGLAYOUT } from '../../../../assets/images'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import EquipmentStandby from '../../../components/EquipmentStandby'
import apiFetch from '../../../helpers/ApiFetch'

const { height, width } = Dimensions.get('screen')

const DATA = [
    {
        id: 1,
        title: "Active Work",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#09cd02",
        barcolor: "green.400",
        item: []
    },
    {
        id: 2,
        title: "Breakdown",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#ef4444",
        barcolor: "error.400",
        item: []
    },
    {
        id: 3,
        title: "Hujan & Licin",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#01a8d7",
        barcolor: "info.400",
        item: []
    },
    {
        id: 4,
        title: "No Job",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#f09d27",
        barcolor: "warning.400",
        item: []
    },
    {
        id: 5,
        title: "No Driver",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#7e22ce",
        barcolor: "purple.400",
        item: []
    },
    {
        id: 6,
        title: "Refueling",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#005db4",
        barcolor: "darkBlue.400",
        item: []
    },
    {
        id: 7,
        title: "Tunggu Arahan",
        cummulative: 0,
        current: 0,
        ratio: 0,
        titlecolor: "#0d9488",
        barcolor: "teal.400",
        item: []
    },
]

const ReportEquipmentStandBy = () => {
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState(DATA)

    useEffect(() => {
        onGetDataFetch()
    }, [])

    const onGetDataFetch = async () => {
        try {
            const resp = await apiFetch('daily-event/report')
            console.log(resp.data.data);
            setState(resp.data.data)
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <AppScreen>
            <Image position={'absolute'} opacity={.2} alt='...' resizeMode="cover" source={BGLAYOUT} style={{height: height, width: width}}/>
            <VStack h={'full'}>
                <HeaderScreen title={"Laporan Standby"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                <VStack flex={1}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {
                            state.map( m => {
                                return( <EquipmentStandby key={m.id} item={m}/> )
                            })
                        }
                        <VStack px={3}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Teko'}
                                fontWeight={'light'}
                                color={appcolor.teks[mode][1]}>
                                Cummulative this month : Total equipment terdampak sejak awal bulan berjalan
                            </Text>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Teko'}
                                fontWeight={'light'}
                                color={appcolor.teks[mode][1]}>
                                Current Status : Total equipment terdampak saat ini
                            </Text>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Teko'}
                                fontWeight={'light'}
                                color={appcolor.teks[mode][1]}>
                                Ratio : Total equipment terdampak saat ini berbanding total seluruh equipment
                            </Text>
                        </VStack>
                    </ScrollView>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ReportEquipmentStandBy