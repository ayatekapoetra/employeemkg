import { View } from 'react-native'
import React from 'react'
import AppScreen from '../../../components/AppScreen'
import { HStack, VStack, Text } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useRoute } from '@react-navigation/native'
import UnderDevelopmentScreen from '../../../components/UnderDevelopment'

const ReportEquipmentStandByDetails = () => {
    const { params } = useRoute()
    console.log(params);
    return (
        <AppScreen>
            <VStack h={'full'}>
                <UnderDevelopmentScreen/>
            </VStack>
        </AppScreen>
    )
}

export default ReportEquipmentStandByDetails