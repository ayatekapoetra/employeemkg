import { TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { VStack, Text, HStack, Image, Center } from 'native-base';
import { Autobrightness, MedalStar, Moon, NoteAdd, PauseCircle, Sun1, Timer1, WristClock } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react'
import appcolor from '../../common/colorMode'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import apiFetch from '../../helpers/ApiFetch';
import moment from 'moment';
import LoadingHauler from '../../components/LoadingHauler';
import { applyAlert } from '../../redux/alertSlice';
import NoData from '../../components/NoData';
import FilterAktualKerja from './filterAktualKerja';

const ListAktualKerja = ( { openFilter, setFilter } ) => {
    const dispatch = useDispatch()
    const route = useNavigation()
    const isFocus = useIsFocused()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ data, setData ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        karyawan_id: user?.karyawan.id,
        date_ops: moment().format("YYYY-MM-DD"),
        dateStart: moment().add(-1, 'day').format("YYYY-MM-DD"),
        dateEnd: moment().format("YYYY-MM-DD")
    })

    useEffect(() => {
        onGetDataHandle()
    }, [isFocus])

    const onGetDataHandle = async (qstring = null) => {
        setLoading(true)
        try {
            const resp = await apiFetch.get("hrd/worksheet", {params: qstring})
            console.log(resp);
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message
            }))
        }
    }

    const onRefreshHandle = () => {
        onGetDataHandle(dataFilter)
    }

    const onApplyFilter = () => {
        setFilter(false)
        onGetDataHandle(dataFilter)
    }

    if(loading){
        return(
            <LoadingHauler/>
        )
    }
    
    return (
        <VStack flex={1}>
            { 
                openFilter ?
                <FilterAktualKerja 
                    onApplyFilter={onApplyFilter} 
                    setFilter={setFilter} 
                    qstring={dataFilter} 
                    setQstring={setDataFilter}/> 
                :
                <>
                <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                    <TouchableOpacity onPress={() => route.navigate('Create-Aktual-Kerja')}>
                        <HStack px={3} py={2} space={2} alignItems={"center"}>
                            <NoteAdd size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={18} 
                                    fontWeight={"semibold"}
                                    fontFamily={"Quicksand-SemiBold"}
                                    color={appcolor.teks[mode][1]}>
                                    Buat Aktual Kerja
                                </Text>
                                <Text 
                                    fontSize={12} 
                                    fontWeight={300}
                                    fontFamily={"Poppins-Light"}
                                    color={appcolor.teks[mode][2]}>
                                    Membuat aktual kerja harian karyawan
                                </Text>
                            </VStack>
                        </HStack>
                    </TouchableOpacity>
                </VStack>
                <VStack flex={1} mt={3}>
                    {
                        data.length > 0 ?
                        <FlatList
                            data={data}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}
                            renderItem={({item}) => <ItemList item={item} mode={mode}/>}
                            keyExtractor={item => item.id}/>
                        :
                        <NoData title={"Maaf, data tidak ditemukan"} subtitle={"Gunakan filter untuk mencari data"}/>
                    }
                </VStack>
                </>
            }
        </VStack>
    )
}

export default ListAktualKerja

function ItemList( { item, mode } ){
    const route = useNavigation()
    return(
        <VStack flex={1} py={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
            <TouchableOpacity onPress={() => route.navigate("Show-Aktual-Kerja", item)}>
                <HStack alignItems={"center"} justifyContent={"space-between"}>
                    <VStack flex={1}>
                        <HStack flex={1} alignItems={"center"} justifyContent={"space-between"}>
                            <Text 
                                fontSize={18}
                                fontWeight={600}
                                fontFamily={"Quicksand-Regular"}
                                color={appcolor.teks[mode][1]}>
                                { item.karyawan.nama }
                            </Text>
                            <Autobrightness size="32" variant="Bulk" color={appcolor.teks[mode][item.ws_status === "A" ? 4:2]}/>
                        </HStack>
                        <Text 
                            fontSize={14}
                            fontWeight={400}
                            fontFamily={"Quicksand-Regular"}
                            color={appcolor.teks[mode][1]}>
                            { moment(item.date_ops).format("dddd, DD MMMM YYYY") }
                        </Text>
                        <HStack space={3}>
                            <HStack space={1}>
                                <WristClock size="22" color={appcolor.teks[mode][3]}/>
                                <Text color={appcolor.teks[mode][3]}>
                                    { moment(item.workstart).format("HH:mm") }
                                </Text>
                            </HStack>
                            <HStack space={1}>
                                <WristClock size="22" color={appcolor.teks[mode][5]}/>
                                <Text color={appcolor.teks[mode][5]}>
                                    { moment(item.workend).format("HH:mm") }
                                </Text>
                            </HStack>
                            <HStack space={1}>
                                <Timer1 size="22" color={appcolor.teks[mode][2]}/>
                                <Text color={appcolor.teks[mode][2]}>
                                    { item.break_duration } JAM
                                </Text>
                            </HStack>
                            <HStack space={1}>
                                {
                                    item.shift_id === 1 ?
                                    <Sun1 size="22" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                    :
                                    <Moon size="22" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                }
                                <Text color={appcolor.teks[mode][2]}>
                                    { item.shift_id === 1 ? "Shift Siang":"Shift Malam" }
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>
                    
                </HStack>
            </TouchableOpacity>
        </VStack>
    )
}