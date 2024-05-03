import { Dimensions, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { Calendar, Calendar2, Logout } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import apiFetch from '../../helpers/ApiFetch'
import moment from 'moment'
import LoadingHauler from '../../components/LoadingHauler'
import FilterAbsensi from './filterAbsensi'
import NoData from '../../components/NoData'


const { width } = Dimensions.get("screen")

const ListAbsensi = ( { openFilter, setFilter } ) => {
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ qstring, setQstring ] = useState({
        karywana_id: user?.karyawan?.id,
        karyawan: user?.karyawan,
        dateStart: moment().add(-1, 'day').format("YYYY-MM-DD"),
        dateEnd: moment().format("YYYY-MM-DD"),
        verify_sts: "",
        approve_sts: "",
    })

    useEffect(() => {
        getDataFetch(qstring)
    }, [])

    const getDataFetch = async (objString = null) => {
        setLoading(true)
        try {
            const resp = await apiFetch.get("mobile/checklog", {params: objString})
            console.log(resp);
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    const onRefreshHandle = async () => {
        getDataFetch(qstring)
    }

    const onApplyFilter = () => {
        setFilter(false)
        getDataFetch(qstring)
    }

    if(loading){
        return (
            <LoadingHauler/>
        )
    }

    return (
        <VStack flex={1}>
            { 
                openFilter && 
                <FilterAbsensi 
                    onApplyFilter={onApplyFilter} 
                    setFilter={setFilter} 
                    qstring={qstring} 
                    setQstring={setQstring}/> 
            }
            {
                data.length > 0 ?
                <FlatList 
                    data={data} 
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}
                    keyExtractor={(item) => item.id} 
                    renderItem={({item}) => <ItemDetails item={item} mode={mode}/>}/>
                :
                <NoData title={"Maaf, data tidak ditemukan"} subtitle={"Gunakan filter untuk mencari data"}/>
            }
        </VStack>
    )
}

export default ListAbsensi

function ItemDetails( { item, mode } ){
    const route = useNavigation()

    if(item.verify_sts === "A" && !item.approve_sts){
        var color = appcolor.ico[mode][3]
    }else if(item.verify_sts === "A" && item.approve_sts === "A"){
        var color = appcolor.ico[mode][4]
    }else{
        var color = appcolor.teks[mode][1]
    }

    const onShowHandle = async () => {
        route.navigate("Show-Kehadiran-Details", item)
    }

    return (
        <TouchableOpacity onPress={onShowHandle}>
            <HStack py={3} space={2} alignItems={"center"} borderBottomWidth={.5} borderBottomColor={appcolor.teks[mode][1]}>
                <VStack flex={1}>
                    <HStack alignItems={"center"} justifyContent={"space-between"}>
                        <Text 
                            fontSize={18}
                            fontWeight={600}
                            fontFamily={"Quicksand-Regular"}
                            color={appcolor.teks[mode][1]}>
                            { item?.karyawan?.nama }
                        </Text>
                        <Text 
                            fontSize={"sm"}
                            fontWeight={400}
                            fontFamily={"Roboto-Regular"}
                            color={appcolor.teks[mode][1]}>
                            ID#{ item?.id }
                        </Text>
                    </HStack>
                    <Text 
                        lineHeight={"xs"}
                        fontSize={14}
                        fontWeight={400}
                        fontFamily={"Roboto-Regular"}
                        color={appcolor.teks[mode][3]}>
                        { item?.karyawan?.section }
                    </Text>
                    
                    <HStack mt={1} flex={1} justifyContent={"space-between"} alignItems={"center"}>
                        <HStack alignItems={"center"}>
                            <Calendar size="42" color={color} variant="Bulk"/>
                            {
                                item.checklog_in &&
                                <>
                                    <VStack>
                                        <Text 
                                            fontSize={14}
                                            fontWeight={300}
                                            fontFamily={"Abel-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(item.checklog_in).format("ddd, DD MMM YYYY") }
                                        </Text>
                                        <Text 
                                            lineHeight={"xs"}
                                            fontSize={"xl"}
                                            fontWeight={300}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(item.checklog_in).format("HH:mm") }
                                        </Text>
                                    </VStack>
                                </>
                            }
                        </HStack>

                        <Logout size="32" color="#555555" variant="Bulk"/>

                        <HStack alignItems={"center"}>
                            <Calendar2 size="42" color={color} variant="Bulk"/>
                            {
                                item.checklog_out &&
                                <>
                                    <VStack>
                                        <Text 
                                            fontSize={14}
                                            fontWeight={300}
                                            fontFamily={"Abel-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(item.checklog_out).format("ddd, DD MMM YYYY") }
                                        </Text>
                                        <Text 
                                            lineHeight={"xs"}
                                            fontSize={"xl"}
                                            fontWeight={300}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(item.checklog_out).format("HH:mm") }
                                        </Text>
                                    </VStack>
                                </>
                            }
                        </HStack>
                    </HStack>
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}