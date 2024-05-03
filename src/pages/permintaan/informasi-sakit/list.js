import { TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
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

const InformasiSakitScreen = ( { mode } ) => {
    const route = useNavigation()
    const isFocus = useIsFocused()
    const dispatch = useDispatch()
    const { data, error, loading } = useSelector(state => state.dataSakit)

    useEffect(() => {
        onGetDataHandle()
    }, [isFocus])

    const onGetDataHandle = async () => {
        dispatch(getSakit({qstring: null}))
    }

    if(error){
        dispatch(applyAlert({
            show: true,
            status: 'error',
            title: "ERR_FETCH",
            subtitle: "Request failed with status code 500"
        }))
    }

    if(loading){
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
                        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshHandle}/>}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item}) => <SakitCardList item={item} mode={mode}/>}
                        keyExtractor={(item) => item.id}/>
                    :
                    <NoData title={"Oops !!"} subtitle={"Maaf data yang anda cari tidak ditemukan."}/>
                }
            </VStack>
        </VStack>
    )
}

export default InformasiSakitScreen