import { View } from 'react-native'
import React, { useState } from 'react'
import ListAktualKerja from './listAktualKerja'
import AppScreen from '../../components/AppScreen'
import { VStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import FilterAktualKerja from './filterAktualKerja'
import moment from 'moment'

const AbsenTulisPage = () => {
    const [ filterAbsensi, setFilterAbsensi ] = useState(false)

    const onFilterHandle = () => {
        setFilterAbsensi(!filterAbsensi)
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Aktual Kerja Harian"} onBack={true} onThemes={true} onFilter={onFilterHandle} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <ListAktualKerja openFilter={filterAbsensi} setFilterAbsensi={setFilterAbsensi}/>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default AbsenTulisPage