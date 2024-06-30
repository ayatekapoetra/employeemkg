import { TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { getSakit } from '../../../redux/izinSakitSlice'
import { applyAlert } from '../../../redux/alertSlice'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import SakitCardList from './listCard'
import LoadingHauler from '../../../components/LoadingHauler'
import NoData from '../../../components/NoData'

const InformasiSakitScreen = ( { mode, openFilter } ) => {
    const route = useNavigation()
    const isFocus = useIsFocused()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { data, error, loading } = useSelector(state => state.dataSakit)
    const [ refresh, setRefresh ] = useState(loading)
    const [ filterData, setFilterData ] = useState({
        karyawan_id: user?.karyawan.id,
        karyawan: user.karyawan,
        dateStart: moment().startOf('year').format('YYYY-MM-DD'),
        dateEnd: moment().format('YYYY-MM-DD')
    })

    console.log('DATA---', data);
    console.log('DATA---', filterData);

    useMemo(() => {
        () => onGetDataHandle()
    }, [isFocus, openFilter])

    const onGetDataHandle = async () => {
        dispatch(getSakit({qstring: filterData}))
    }

    const onRefreshHandle = useCallback(() => {
        setRefresh(true)
        onGetDataHandle({qstring: filterData})
        setRefresh(false)
    })

    if(error){
        dispatch(applyAlert({
            show: true,
            status: 'error',
            title: "ERR_FETCH",
            subtitle: "Request failed with status code 500"
        }))
    }

    if(loading || refresh){
        return <LoadingHauler/>
    }

    return (
        <VStack mx={3} flex={5}>
            <TouchableOpacity onPress={() => route.navigate('Create-Permintaan-Sakit')}>
                <HStack 
                    p={3}
                    mb={2}
                    space={2} 
                    alignItems={"center"} 
                    borderWidth={.5} 
                    borderStyle={"dashed"}
                    rounded={"md"}
                    borderColor={appcolor.teks[mode][1]}>
                    <CalendarAdd size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                    <VStack>
                        <Text 
                            fontSize={18}
                            fontWeight={500}
                            fontFamily={"Quicksand-Regular"}
                            color={appcolor.teks[mode][1]}>
                            Buat izin sakit
                        </Text>
                        <Text 
                            lineHeight={"xs"}
                            fontSize={12}
                            fontWeight={300}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            Membuat pemberitahuan sakit karyawan
                        </Text>
                    </VStack>
                </HStack>
            </TouchableOpacity>
            <VStack flex={1}>
                {
                    data?.length > 0 ?
                    <FlatList
                        data={data}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}
                        renderItem={({item}) => <SakitCardList item={item} mode={mode}/>}
                        keyExtractor={(item) => item.id}/>
                    :
                    <NoData title={'Data tidak ditemukan...'} subtitle={'Gunakan filter untuk memilih\ndata yang spesifik'} onRefresh={onRefreshHandle}/>
                }
            </VStack>
        </VStack>
    )
}

export default InformasiSakitScreen