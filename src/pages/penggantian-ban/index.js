import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { HStack, VStack, Text } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { Driving } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import ListTireReport from './list'
import FilterTireUsages from './filter'
import moment from 'moment'

const TireUsages = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ qstring, setQstring ] = useState({
        dateStart: moment().add(-3, 'days').format('YYYY-MM-DD'),
        dateEnd: moment().format('YYYY-MM-DD'),
        equipment_id: null,
        equipment: null,
        lokasi_id: null,
        lokasi: null,
        shift_id: null,
        shift: null,
        nmbrand: '',
        type: '',
        kategori: '',
        noseri: '',
        status: '',
    })

    const showFilter = () => {
        setOpenFilter(!openFilter)
    }

    const resetFilter = () => {
        setQstring({
            dateStart: moment().add(-3, 'days').format('YYYY-MM-DD'),
            dateEnd: moment().format('YYYY-MM-DD'),
            equipment_id: null,
            equipment: null,
            lokasi_id: null,
            lokasi: null,
            shift_id: null,
            shift: null,
            nmbrand: '',
            type: '',
            kategori: '',
            noseri: '',
            status: '',
        })
        setOpenFilter(false)
    }

    console.log(qstring);
    

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Tire Usages"} onBack={true} onFilter={showFilter} onThemes={true} onNotification={true}/>
                {
                    openFilter ?
                    <FilterTireUsages qstring={qstring} setQstring={setQstring} showFilter={showFilter} resetFilter={resetFilter}/>
                    :
                    <VStack flex={1} px={3}>
                        <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                            <TouchableOpacity onPress={() => route.navigate('create-penggantian-ban')}>
                                <HStack px={3} py={2} space={2} alignItems={"center"}>
                                    <Driving size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={18} 
                                            fontWeight={"semibold"}
                                            fontFamily={"Quicksand-SemiBold"}
                                            color={appcolor.teks[mode][1]}>
                                            Form Pemakaian Ban
                                        </Text>
                                        <Text 
                                            fontSize={12} 
                                            fontWeight={300}
                                            fontFamily={"Poppins-Light"}
                                            color={appcolor.teks[mode][2]}>
                                            Membuat laporan pemakaian ban
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                        <ListTireReport qstring={qstring}/>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default TireUsages