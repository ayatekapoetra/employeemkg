import { Dimensions, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Button, PresenceTransition } from 'native-base'
import { ArrowRight2, Calendar1, CloseSquare, MessageSearch, Refresh2, SearchStatus, User } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import KaryawanList from '../../components/KaryawanList'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import { getSakit } from '../../redux/izinSakitSlice'
import { getCuti } from '../../redux/izinCutiSlice'
import { getAlpha } from '../../redux/izinAlphaSlice'

const { height } = Dimensions.get("screen")

const FilterPermohonan = ( { type, onFilterDataHandle } ) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [ data, setData ] = useState({
        karyawan_id: user.karyawan.id,
        karyawan: user.karyawan,
        dateStart: moment().startOf('year').format('YYYY-MM-DD'),
        dateEnd: moment().format('YYYY-MM-DD'),
        narasi: ""
    })

    const handleOpenKaryawan = () => {
        var array = ["developer", "administrator", "hrd", "pjo"]
        if(array.includes(user.usertype)){
            setOpenKaryawan(!openKaryawan)
        }
    }

    const onApplyFilterHandle = () => {
        switch (type) {
            case "sakit":
                dispatch(getSakit({qstring: data}))
                break;
            case "cuti":
                dispatch(getCuti({qstring: data}))
                break;
            case "izin":
                dispatch(getAlpha({qstring: data}))
                break;
            default:
                break;
        }
        onFilterDataHandle()
        setOpenDateStart(false)
        setOpenDateEnd(false)
    }

    const onResetFilterHandle = () => {
        switch (type) {
            case "sakit":
                dispatch(getSakit({qstring: null}))
                break;
            case "cuti":
                dispatch(getCuti({qstring: null}))
                break;
            case "izin":
                dispatch(getAlpha({qstring: null}))
                break;
            default:
                break;
        }
        onFilterDataHandle()
        setOpenDateStart(false)
        setOpenDateEnd(false)
    }

    console.log(data);
    return (
        <VStack px={3} py={2} mb={8} h={`${height * .85}`}>
            <VStack flex={1}>
                <VStack mt={1}>
                    <HStack 
                        p={2} 
                        mt={1} 
                        rounded={"md"}
                        borderWidth={.5} 
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        borderColor={appcolor.line[mode][1]}>
                        <TouchableOpacity onPress={handleOpenKaryawan}>
                            <HStack space={2} alignItems={"center"}>
                                <User size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                <VStack>
                                    <Text 
                                        lineHeight={"xs"}
                                        fontSize={18}
                                        fontFamily={"Quicksand-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        { data?.karyawan?.nama }
                                    </Text>
                                    <Text 
                                        lineHeight={"xs"}
                                        fontSize={12}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][3]}>
                                        { data?.karyawan?.section }
                                    </Text>
                                </VStack>
                            </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setData({...data, karyawan_id: null, karyawan: null})}>
                            <CloseSquare size="22" color={appcolor.teks[mode][5]} variant="Bulk"/>
                        </TouchableOpacity>
                    </HStack>
                </VStack>
                {
                    openKaryawan &&
                    <PresenceTransition 
                        style={{height: 500}}
                        visible={openKaryawan} 
                        initial={{opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                        <KaryawanList state={data} setState={setData} setOpenKaryawan={setOpenKaryawan}/>
                    </PresenceTransition>
                }

                <TouchableOpacity onPress={() => setOpenDateStart(true)}>
                    <VStack mt={1}>
                        <HStack 
                            p={2} 
                            mt={1} 
                            rounded={"md"}
                            borderWidth={.5} 
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            borderColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={"center"}>
                                <Calendar1 size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                <VStack>
                                    <Text 
                                        fontWeight={"bold"}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        Dari Tanggal :
                                    </Text>
                                    <Text 
                                        lineHeight={"xs"}
                                        fontSize={18}
                                        fontFamily={"Quicksand-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        { moment(data.dateStart).format('dddd, DD MMMM YYYY') }
                                    </Text>
                                </VStack>
                            </HStack>
                            <ArrowRight2 size="16" color={appcolor.ico[mode][1]} variant="TwoTone"/>
                        </HStack>
                    </VStack>
                </TouchableOpacity>
                <DatePicker
                    modal
                    mode={"date"}
                    locale={"ID"}
                    open={openDateStart}
                    date={new Date()}
                    theme={mode != "dark"?"light":"dark"}
                    maximumDate={new Date(moment().format("YYYY-MM-DD"))}
                    onConfirm={(date) => {
                        setData({...data, dateStart: date})
                    }}
                    onCancel={() => {
                        setOpenDateStart(false)
                    }}
                />

                <TouchableOpacity onPress={() => setOpenDateEnd(true)}>
                    <VStack mt={1}>
                        <HStack 
                            p={2} 
                            mt={1} 
                            rounded={"md"}
                            borderWidth={.5} 
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            borderColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={"center"}>
                                <Calendar1 size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                <VStack>
                                    <Text 
                                        fontWeight={"bold"}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        Dari Tanggal :
                                    </Text>
                                    <Text 
                                        lineHeight={"xs"}
                                        fontSize={18}
                                        fontFamily={"Quicksand-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        { moment(data.dateEnd).format('dddd, DD MMMM YYYY') }
                                    </Text>
                                </VStack>
                            </HStack>
                            <ArrowRight2 size="16" color={appcolor.ico[mode][1]} variant="TwoTone"/>
                        </HStack>
                    </VStack>
                </TouchableOpacity>
                <DatePicker
                    modal
                    mode={"date"}
                    locale={"ID"}
                    open={openDateEnd}
                    date={new Date()}
                    theme={mode != "dark"?"light":"dark"}
                    minimumDate={new Date(moment(data.dateStart).format("YYYY-MM-DD"))}
                    onConfirm={(date) => {
                        setData({...data, dateEnd: date})
                    }}
                    onCancel={() => {
                        setOpenDateEnd(false)
                    }}
                />

                <VStack mt={1}>
                    <HStack 
                        p={2} 
                        mt={1} 
                        rounded={"md"}
                        borderWidth={.5} 
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        borderColor={appcolor.line[mode][1]}>
                        <HStack space={2} alignItems={"center"}>
                            <MessageSearch size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    fontWeight={"bold"}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Alasan/Keterangan :
                                </Text>
                                <HStack>
                                    <TextInput 
                                        onChangeText={(teks) => setData({...data, narasi: teks})}
                                        style={{flex: 1, color: appcolor.teks[mode][1]}}/>
                                </HStack>
                            </VStack>
                        </HStack>
                    </HStack>
                </VStack>
            </VStack>
            <HStack space={1} mt={2}>
                <Button onPress={onResetFilterHandle} w={"25%"} bg={appcolor.teks[mode][2]}>
                    <HStack space={1} alignItems={"center"}>
                        <Refresh2 size="20" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Reset</Text>
                    </HStack>
                </Button>
                <Button onPress={onApplyFilterHandle} flex={1} bg={appcolor.teks[mode][6]}>
                    <HStack space={1} alignItems={"center"}>
                        <SearchStatus size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Terapkan Filter</Text>
                    </HStack>
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterPermohonan