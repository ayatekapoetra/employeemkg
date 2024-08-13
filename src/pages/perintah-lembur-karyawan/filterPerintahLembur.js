import { Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, PresenceTransition, Select, CheckIcon, Button } from 'native-base'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { ArrowRight3, CalendarSearch, CalendarTick, CloseCircle, Dislike, Like1, UserSearch } from 'iconsax-react-native'
import KaryawanList from '../../components/KaryawanList'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'

const { height } = Dimensions.get("screen")

const FilterPerintahLembur = ( { dataFilter, setDataFilter, onApplyFilterHandle } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ dateStart, setDateStart ] = useState(false)
    const [ dateFinish, setDateFinish ] = useState(false)
    const [service, setService] = useState("");

    const onResetHandle = () => {
        setDataFilter({
            ...dataFilter,
            dateStart: moment().startOf('month').format("YYYY-MM-DD"),
            dateEnd: moment().endOf('month').format("YYYY-MM-DD"),
            karyawan_id: null,
            status: "X",
        })
        
        onApplyFilterHandle()
    }

    const onChangeStatusHandle = (val) => {
        setService(val)
        setDataFilter({...dataFilter, status: val})
    }

    return (
        <VStack h={`${height - 95}px`}>
            <VStack m={3} px={3} py={2} flex={1} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                <VStack h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Karyawan :
                    </Text>
                    <HStack>
                        <TouchableOpacity style={{flex: 1}} onPress={() => setOpenKaryawan(!openKaryawan)}>
                            <HStack py={2} space={2} alignItems={"center"}>
                                <HStack space={2}>
                                    <UserSearch size="32" color="#555555" variant="Bulk"/>
                                    <Text 
                                        fontSize={20}
                                        fontFamily={"Poppins-Bold"}
                                        color={appcolor.teks[mode][2]}>
                                        { dataFilter?.karyawan?.nama }
                                    </Text>
                                </HStack>
                            </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setDataFilter({...dataFilter, karyawan_id: null, karyawan: null})}>
                            <CloseCircle size="28" color={appcolor.teks[mode][5]} variant="Bulk"/>
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
                        <KaryawanList state={dataFilter} setState={setDataFilter} setOpenKaryawan={setOpenKaryawan}/>
                    </PresenceTransition>
                }

                <VStack mt={2} h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Mulai Tanggal :
                    </Text>
                    <TouchableOpacity onPress={() => setDateStart(true)}>
                        <HStack py={2} space={2} alignItems={"center"}>
                            <CalendarSearch size="32" color="#555555" variant="Bulk"/>
                            <Text 
                                fontSize={20}
                                fontFamily={"Poppins-Bold"}
                                color={appcolor.teks[mode][2]}>
                                { moment(dataFilter?.dateStart).format("dddd, DD MMMM YYYY") }
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        mode={"date"}
                        locale={"ID"}
                        open={dateStart}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setDataFilter({...dataFilter, dateStart: date})}
                        onCancel={() => {
                            setDateStart(false)
                        }}
                    />
                </VStack>

                <VStack mt={2} h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Hingga Tanggal :
                    </Text>
                    <TouchableOpacity onPress={() => setDateFinish(true)}>
                        <HStack py={2} space={2} alignItems={"center"}>
                            <CalendarTick size="32" color="#555555" variant="Bulk"/>
                            <Text 
                                fontSize={20}
                                fontFamily={"Poppins-Bold"}
                                color={appcolor.teks[mode][2]}>
                                { moment(dataFilter?.dateEnd).format("dddd, DD MMMM YYYY") }
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        mode={"date"}
                        locale={"ID"}
                        open={dateFinish}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setDataFilter({...dataFilter, dateEnd: date})}
                        onCancel={() => {
                            setDateFinish(false)
                        }}
                    />
                </VStack>

                <VStack mt={2} h={"75px"}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Hingga Tanggal :
                    </Text>
                    <Select 
                        selectedValue={service} 
                        minWidth="200" 
                        accessibilityLabel="Choose Service" 
                        placeholder="Choose Service"
                        color={appcolor.teks[mode][1]}
                        fontFamily={"Poppins-Regular"}
                        fontSize={16}
                        // _selectedItem={{ bg: "teal.600" }} 
                        mt={3} 
                        h={"50px"}
                        onValueChange={itemValue => onChangeStatusHandle(itemValue)}>
                        <Select.Item label="SPL Baru" fontFamily={"Poppins-Regular"} value="X"/>
                        <Select.Item label="Diterima oleh karyawan" fontFamily={"Poppins-Regular"} value="C"/>
                        <Select.Item label="Menunggu Persetujuan" fontFamily={"Poppins-Regular"} value="F"/>
                        <Select.Item label="Disetujui Penanggung Jawab" fontFamily={"Poppins-Regular"} value="A"/>
                        <Select.Item label="Semua Data" fontFamily={"Poppins-Regular"} value="ALL"/>
                    </Select>
                </VStack>

                <HStack mt={5}>
                    <Button onPress={onResetHandle} w={"1/4"} mr={2} bg={appcolor.teks[mode][2]}>
                        <HStack space={1} alignItems={"center"}>
                            <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>Reset</Text>
                        </HStack>
                    </Button>
                    <Button onPress={onApplyFilterHandle} flex={1} bg={appcolor.teks[mode][6]}>
                        <HStack space={1} alignItems={"center"}>
                            <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>Terapkan Filter</Text>
                        </HStack>
                    </Button>
                </HStack>
            </VStack>
        </VStack>
    )
}

export default FilterPerintahLembur