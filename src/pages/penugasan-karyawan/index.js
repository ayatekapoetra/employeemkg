import { TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { NoteAdd } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import LoadingHauler from '../../components/LoadingHauler'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import ListPenugasan from './list'
import { getPenugasan } from '../../redux/fetchPenugasanSlice'
import NoData from '../../components/NoData'
import FilterPenugasan from './filter'

const PenugasanKaryawan = () => {
    const route = useNavigation()
    const focused = useIsFocused()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { data, loading } = useSelector(state => state.penugasan)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        group: 'assigner',
        type: '',
        kode: '',
        assigned_id: '',
        karyawan: null,
        status: null,
        statusObj: null,
        startDate: null,
        endDate: null,
    })

    useEffect(() =>  {
        dispatch(getPenugasan(dataFilter))
    }, [focused])

    const onRefreshHandle = useCallback(() => {
        dispatch(getPenugasan(dataFilter))
    })

    const onResetFilterHandle = () => {
        const filtered = {
            group: 'assigner',
            type: '',
            kode: '',
            assigned_id: '',
            karyawan: null,
            status: null,
            statusObj: null,
            startDate: null,
            endDate: null,
        }
        setOpenFilter(false)
        setDataFilter(filtered)
        dispatch(getPenugasan(filtered))
    }

    const onApplyFilterHandle = () => {
        setOpenFilter(false)
        dispatch(getPenugasan(dataFilter))
    }

    console.log(dataFilter);
    

    if(loading){
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Penugasan Kerja"} onBack={true} onThemes={true} onNotification={true}/>
                <LoadingHauler/>
            </VStack>
        </AppScreen>
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Penugasan Kerja"} onBack={true} onThemes={true} onFilter={() => setOpenFilter(!openFilter)} onNotification={true}/>
                {
                    openFilter ?
                    <FilterPenugasan 
                        dataFilter={dataFilter} 
                        setDataFilter={setDataFilter} 
                        onResetFilter={onResetFilterHandle} 
                        onApplyFilter={onApplyFilterHandle}/>
                    :
                    <VStack px={3} flex={1}>
                        {/* TOMBOL CREATE PENUGASAN */}
                        <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                            <TouchableOpacity onPress={() => route.navigate('create-penugasan-kerja')}>
                                <HStack px={3} py={2} space={2} alignItems={"center"}>
                                    <NoteAdd size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={18} 
                                            fontWeight={"semibold"}
                                            fontFamily={"Quicksand-SemiBold"}
                                            color={appcolor.teks[mode][1]}>
                                            Buat Penugasan Kerja
                                        </Text>
                                        <Text 
                                            fontSize={12} 
                                            fontWeight={300}
                                            fontFamily={"Poppins-Light"}
                                            color={appcolor.teks[mode][2]}>
                                            Membuat tugas tugas kepada karyawan
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                        {/* LIST DATA PENUGASAN */}
                        <VStack mt={2} flex={1}>
                            {
                                data.length > 0 ?
                                <ListPenugasan 
                                    data={data} 
                                    mode={mode}
                                    refreshing={loading}
                                    onRefreshHandle={onRefreshHandle}/>
                                :
                                <NoData title={"Data tidak ditemukan"}/>
                            }
                        </VStack>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default PenugasanKaryawan