import moment from 'moment'
import _ from "underscore"
import { Dimensions, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack, Text, HStack, Divider, Center } from 'native-base'
import { Agenda, Calendar, CalendarList } from 'react-native-calendars'
import { useSelector } from 'react-redux'
import { ArrowCircleDown, ArrowCircleLeft, CalendarTick } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import apiFetch from '../../helpers/ApiFetch'
import LoadingSpinner from '../../components/LoadingSpinner'
import FilterKehadiran from './filterKehadiran'

const { height } = Dimensions.get("screen")

const AgendaScreen = ( { isDark, mode, openFilter, setOpenFilter } ) => {
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState([])
    const [ markedDates, setMarkedDates ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ showCalendar, setShowCalendar ] = useState(true)
    const [ dataFilter, setDataFilter ] = useState({
        karyawan_id: user.karyawan.id,
        karyawan: user.karyawan,
        thnbln: moment().format("YYYY-MM"),
        dateStart: new Date(),
        cabang_id: "",
    })
    
    useEffect(() => {
        getDataInsentif(dataFilter)
    }, [showCalendar])

    useEffect(() => {
        getDataMarker(dataFilter)
    }, [dataFilter])

    const getDataInsentif = async (qstring = null) => {
        setLoading(true)
        try {
            const resp = await apiFetch.get("insentif-karyawan/list", {params: qstring})
            if(resp.status == 200){
                setData(resp.data.data)
            }
            setLoading(false)
        } catch (error) {
            alert('Error...')
            setLoading(false)
        }
    }

    const getDataMarker = async (qstring = null) => {
        try {
            const resp = await apiFetch.get("my-attendances-calendar", {params: qstring})
            if(resp.status == 200){
                setMarkedDates(resp.data.marker)
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    const onApplyFilterHandle = async () => {
        getDataInsentif(dataFilter)
        setOpenFilter(false)
    }

    return (
        <VStack flex={1}>
            {
                openFilter ?
                <FilterKehadiran 
                    onApplyFilter={onApplyFilterHandle}
                    openFilter={openFilter} 
                    setOpenFilter={setOpenFilter} 
                    dataFilter={dataFilter} 
                    setDataFilter={setDataFilter}/>
                :
                <>
                    {
                        showCalendar &&
                        <CalendarList
                            // Customize the appearance of the calendar
                            style={{
                                height: height * .37,
                                backgroundColor: 'transparent'
                                
                            }}
                            theme={{
                                backgroundColor: 'transparent',
                                monthTextColor: isDark?"#FFF":"#2f313e",
                                calendarBackground: isDark?"#2f313e":"#F5F5F5",
                                dayTextColor: isDark?"#FFF":"#2f313e"
                            }}
                            // Specify the current date
                            current={moment().startOf('month').format("YYYY-MM-DD")}
                            // Callback that gets called when the user selects a day
                            onDayPress={day => {
                                console.log('selected day', day);
                            }}
                            // Mark specific dates as marked
                            markedDates={markedDates}
                            // markedDates={{
                            //     '2024-04-01': {selected: true, marked: true},
                            //     '2024-04-02': {selected: true, marked: true},
                            //     '2024-04-03': {selected: true, marked: true}
                            // }}
                            onVisibleMonthsChange={(months) => {
                                const [current] = months
                                setDataFilter({...dataFilter, dateStart: new Date(current.dateString), thnbln: moment(current.dateString).format("YYYY-MM")})
                                getDataInsentif({...dataFilter, thnbln: moment(current.dateString).format("YYYY-MM")})
                            }}
                            // Max amount of months allowed to scroll to the past. Default = 50
                            pastScrollRange={50}
                            // Max amount of months allowed to scroll to the future. Default = 50
                            futureScrollRange={50}
                            // Enable or disable scrolling of calendar list
                            scrollEnabled={true}
                            // Enable or disable vertical scroll indicator. Default = false
                            showScrollIndicator={true}
                        />
                    }
                    <VStack flex={1} px={3} my={3}>
                        <HStack px={3} my={3} borderLeftWidth={5} borderLeftColor={"muted.500"} alignItems={"center"} justifyContent={"space-between"}>
                            <Text 
                                fontSize={16}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                Keterangan Absensi
                            </Text>
                            <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
                                {
                                    showCalendar ?
                                    <ArrowCircleLeft size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    :
                                    <ArrowCircleDown size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                }

                            </TouchableOpacity>
                        </HStack>
                        <Divider thickness={"0.5"}/>
                        {
                            loading && <LoadingSpinner/>
                        }
                        <VStack flex={1}>
                            {
                                data?.length > 0 ?
                                <FlatList 
                                    data={data} 
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({item}) => <ItemList item={item} mode={mode}/>}
                                    keyExtractor={(item) => item.key}/>
                                :
                                <HStack flex={1} alignItems={"center"} justifyContent={"center"}>
                                    <Text 
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][2]}>
                                        Data tidak ditemukan...
                                    </Text>
                                </HStack>
                            }
                        </VStack>
                    </VStack>
                </>
            }
        </VStack>
    )
}

export default AgendaScreen

function ItemList({item, mode}) {
    return(
        <HStack 
            px={3} 
            py={2} 
            alignItems={"center"} 
            justifyContent={"space-between"} 
            borderBottomWidth={.5} 
            borderBottomStyle={"dashed"}
            borderBottomColor={appcolor.line[mode][2]}>
            <HStack space={2} alignItems={"center"}>
                <CalendarTick size="62" color={appcolor.ico[mode][1]} variant="Bulk"/>
                <VStack>
                    <Text 
                        lineHeight={"xs"}
                        fontSize={18}
                        fontWeight={600}
                        color={appcolor.teks[mode][1]}
                        fontFamily={"Quicksand-Regular"}>
                        { item.nm_karyawan }
                    </Text>
                    <Text 
                        lineHeight={"xs"}
                        color={appcolor.teks[mode][3]}
                        fontFamily={"Quicksand-Regular"}>
                        { item.sesction_karyawan }
                    </Text>
                    <Text 
                        color={appcolor.teks[mode][1]}
                        fontFamily={"Quicksand-Regular"}>
                        { moment(new Date(item.tanggal)).format('dddd, DD MMMM YYYY') }
                    </Text>
                </VStack>
            </HStack>
            <Text color={appcolor.teks[mode][2]} fontWeight={700} fontFamily={"Poppins-Bold"} fontSize={45}>
                { item.status }
            </Text>
        </HStack>
    )
}