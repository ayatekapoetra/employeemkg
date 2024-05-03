import { FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { VStack, Text, HStack, Center, Image } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { getCuti } from '../../../redux/izinCutiSlice'
import { applyAlert } from '../../../redux/alertSlice'
import appcolor from '../../../common/colorMode'
import LoadingHauler from '../../../components/LoadingHauler'
import NoData from '../../../components/NoData'
import CutiCardList from './listCard'

const RequestCutiScreen = ( { mode } ) => {
    const route = useNavigation()
    const isFocus = useIsFocused()
    const dispatch = useDispatch()
    const { data, error, loading } = useSelector(state => state.dataCuti)

    useEffect(() => {
        onGetDataHandle()
    }, [isFocus])

    const onGetDataHandle = async () => {
        dispatch(getCuti({qstring: null}))
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
            <TouchableOpacity onPress={() => route.navigate('Create-Permintaan-Cuti')}>
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
                            Buat permohonan cuti
                        </Text>
                        <Text 
                            lineHeight={"xs"}
                            fontSize={12}
                            fontWeight={300}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            Membuat permohonan cuti karyawan
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
                        renderItem={({item}) => <CutiCardList item={item} mode={mode}/>}
                        keyExtractor={(item) => item.id}/>
                    :
                    <NoData title={"Oops !!"} subtitle={"Maaf data yang anda cari tidak ditemukan."}/>
                }
            </VStack>
        </VStack>
    )
}

export default RequestCutiScreen