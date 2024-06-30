import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, PresenceTransition, Button, Actionsheet, Center } from 'native-base'
import { CalendarSearch, CalendarTick, CloseCircle, Dislike, Like1, UserSearch } from 'iconsax-react-native'
import { useSelector } from 'react-redux'
import appcolor from '../../../common/colorMode'
import KaryawanList from '../../../components/KaryawanList'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'

const FilterApprovalChecklog = ( { openFilter, setOpenFilter, filterData, setFilterData } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ dateStart, setDateStart ] = useState(false)
    const [ dateFinish, setDateFinish ] = useState(false)
    const [ isOpenSheet, setOpenSheet ] = useState(false)

    const removeFilterKaryawan = () => {
        setFilterData({
            ...filterData,
            karyawan_id: null,
            karyawan: null,
        })
    }

    const onResetHandle = async () => {
        setFilterData({
            karyawan_id: null,
            karyawan: null,
            dateStart: moment().add(-1, 'month').format("YYYY-MM-DD"),
            dateEnd: moment().format("YYYY-MM-DD")
        })
        setOpenFilter(false)
    }

    const changeStatusKehadiran = async (sts) => {
        setFilterData({
            ...filterData,
            kehadiran_sts: sts
        })
        setOpenSheet(false)
    }

    switch (filterData.kehadiran_sts) {
        case 'H':
            var statusKehadiran = "Hadir";
            break;
        case 'A':
            var statusKehadiran = "Alpha";
            break;
        case 'L':
            var statusKehadiran = "Terlambat Masuk";
            break;
        case 'E':
            var statusKehadiran = "Pulang Cepat";
            break;
        case 'S':
            var statusKehadiran = "Sakit";
            break;
        default:
            var statusKehadiran = "";
            break;
    }


    return (
        <VStack mx={3}>
            <VStack borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                <Text 
                    fontFamily={"Poppins-Regular"}
                    color={appcolor.teks[mode][1]}>
                    Karyawan :
                </Text>
                <HStack py={2} alignItems={"center"} justifyContent={'space-between'}>
                    <TouchableOpacity onPress={() => setOpenKaryawan(!openKaryawan)} style={{flex: 1}}>
                        <HStack space={2}>
                            <UserSearch size="32" color="#555555" variant="Bulk"/>
                            <Text 
                                fontSize={20}
                                fontFamily={"Poppins-Bold"}
                                color={appcolor.teks[mode][2]}>
                                { filterData.karyawan?.nama }
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                    <CloseCircle onPress={removeFilterKaryawan} size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>
                </HStack>
                {
                    openKaryawan &&
                    <PresenceTransition 
                        style={{height: 350}}
                        visible={openKaryawan} 
                        initial={{opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                        <KaryawanList state={filterData} setState={setFilterData} setOpenKaryawan={setOpenKaryawan}/>
                    </PresenceTransition>
                }
            </VStack>

            <VStack mt={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
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
                            { moment(filterData.dateStart).format("dddd, DD MMMM YYYY") }
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
                    onConfirm={(date) => setFilterData({...filterData, dateStart: date})}
                    onCancel={() => {
                        setDateStart(false)
                    }}
                />
            </VStack>

            <VStack mt={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                <Text 
                    fontFamily={"Poppins-Regular"}
                    color={appcolor.teks[mode][1]}>
                    Hingga Tanggal :
                </Text>
                <TouchableOpacity onPress={() => setDateFinish(true)}>
                    <HStack py={2} space={2} alignItems={"center"}>
                        <CalendarSearch size="32" color="#555555" variant="Bulk"/>
                        <Text 
                            fontSize={20}
                            fontFamily={"Poppins-Bold"}
                            color={appcolor.teks[mode][2]}>
                            { moment(filterData.dateEnd).format("dddd, DD MMMM YYYY") }
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
                    onConfirm={(date) => setFilterData({...filterData, dateEnd: date})}
                    onCancel={() => {
                        setDateFinish(false)
                    }}
                />
            </VStack>

            <VStack mt={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                <Text 
                    fontFamily={"Poppins-Regular"}
                    color={appcolor.teks[mode][1]}>
                    Status Kehadiran :
                </Text>
                <TouchableOpacity onPress={() => setOpenSheet(true)}>
                    <HStack py={2} space={2} alignItems={"center"}>
                        <CalendarTick size="32" color="#555555" variant="Bulk"/>
                        <Text 
                            fontSize={20}
                            fontFamily={"Poppins-Bold"}
                            color={appcolor.teks[mode][2]}>
                            { statusKehadiran }
                        </Text>
                    </HStack>
                </TouchableOpacity>
            </VStack>
            <Actionsheet isOpen={isOpenSheet} onClose={() => setOpenSheet(false)}>
                <Actionsheet.Content>
                    <Center w="100%" h={60} px={4} justifyContent="center">
                        <Text fontSize="18" fontWeight={"700"} fontFamily={"Poppins-SemiBold"} color="muted.800">
                            Status Penolakan
                        </Text>
                    </Center>
                    <Actionsheet.Item onPress={() => changeStatusKehadiran('H')}>Hadir</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => changeStatusKehadiran('L')}>Terlambat Masuk</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => changeStatusKehadiran('E')}>Pulang Cepat</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => changeStatusKehadiran('C')}>Cuti</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => changeStatusKehadiran('I')}>Izin</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => changeStatusKehadiran('S')}>Sakit</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => {
                        setFilterData({...filterData, kehadiran_sts: " "})
                        setOpenSheet(false)
                    }}>Cancel</Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>

            <HStack mt={2}>
                <Button onPress={onResetHandle} w={"1/4"} mr={2} bg={appcolor.teks[mode][2]}>
                    <HStack space={1} alignItems={"center"}>
                        <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Reset</Text>
                    </HStack>
                </Button>
                <Button onPress={() => setOpenFilter(!openFilter)} flex={1} bg={appcolor.teks[mode][6]}>
                    <HStack space={1} alignItems={"center"}>
                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Terapkan Filter</Text>
                    </HStack>
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterApprovalChecklog