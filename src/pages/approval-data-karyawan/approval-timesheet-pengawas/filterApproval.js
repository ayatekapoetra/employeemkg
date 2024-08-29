import { ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, PresenceTransition, Button, Actionsheet, Center, Switch } from 'native-base'
import { CalendarSearch, CalendarTick, CloseCircle, Dislike, Like1, Moon, Sun1, UserOctagon, UserSearch } from 'iconsax-react-native'
import { useSelector } from 'react-redux'
import appcolor from '../../../common/colorMode'
import KaryawanList from '../../../components/KaryawanList'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'

const FilterApprovalTimesheet = ( { applyFilter, openFilter, setOpenFilter, filterData, setFilterData } ) => {
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector( state => state.auth)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ dateStart, setDateStart ] = useState(false)
    const [ dateFinish, setDateFinish ] = useState(false)
    const [ isOpenSheet, setOpenSheet ] = useState(false)
    const [ dataSwitch, setDataSwitch ] = useState(false)
    const [ shiftSwitch, setShiftSwitch ] = useState(false)

    const removeFilterKaryawan = () => {
        setFilterData({
            ...filterData,
            pengawas_id: null,
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

    const onToggleSwitch = () => {
        setDataSwitch(!dataSwitch)
        setFilterData({...filterData, pengawas_id: dataSwitch ? user.karyawan.id:null})
    }

    const onToggleShiftSwitch = () => {
        setShiftSwitch(!shiftSwitch)
        setFilterData({...filterData, shift: shiftSwitch ? '2':'1'})
    }

    const changeStatusApproval = async (sts) => {
        setFilterData({
            ...filterData,
            sts_approved: sts
        })
        setOpenSheet(false)
    }

    switch (filterData.sts_approved) {
        case 'P':
            var statusPersetujuan = "Menunggu Persetujuan";
            break;
        case 'A':
            var statusPersetujuan = "Disetujui";
            break;
        case 'R':
            var statusPersetujuan = "Ditolak";
            break;
        default:
            var statusPersetujuan = "Semua Status";
            break;
    }


    return (
        // <ScrollView>
            <VStack mx={3}>
                <VStack borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Pengawas :
                    </Text>
                    <HStack py={2} alignItems={"center"} justifyContent={'space-between'}>
                        <HStack space={2}>
                            <UserOctagon size="32" color={appcolor.teks[mode][6]} variant="Bulk"/>
                            <Text 
                                fontSize={20}
                                fontFamily={"Poppins-Bold"}
                                color={appcolor.teks[mode][6]}>
                                { dataSwitch ? 'Semua pengawas':'Hanya untuk saya' }
                            </Text>
                        </HStack>
                        <Switch isChecked={dataSwitch} onToggle={onToggleSwitch} size="md" />
                    </HStack>
                </VStack>

                <VStack mt={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
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
                            <KaryawanList state={filterData} setState={setFilterData} setOpenKaryawan={setOpenKaryawan} section={['operator', 'driver']}/>
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
                        Shift Kerja :
                    </Text>
                    <HStack py={2} alignItems={"center"} justifyContent={'space-between'}>
                        <HStack space={2}>
                            {
                                shiftSwitch ?
                                <Sun1 size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                :
                                <Moon size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                            }
                            <Text 
                                fontSize={20}
                                fontFamily={"Poppins-Bold"}
                                color={appcolor.teks[mode][shiftSwitch?3:1]}>
                                { shiftSwitch ? 'Shift Siang':'Shift Malam' }
                            </Text>
                        </HStack>
                        <Switch isChecked={shiftSwitch} onToggle={onToggleShiftSwitch} size="md" />
                    </HStack>
                </VStack>

                <VStack mt={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Status Persetujuan :
                    </Text>
                    <TouchableOpacity onPress={() => setOpenSheet(true)}>
                        <HStack py={2} space={2} alignItems={"center"}>
                            <CalendarTick size="32" color="#555555" variant="Bulk"/>
                            <Text 
                                fontSize={20}
                                fontFamily={"Poppins-Bold"}
                                color={appcolor.teks[mode][2]}>
                                { statusPersetujuan }
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                </VStack>
                <Actionsheet isOpen={isOpenSheet} onClose={() => setOpenSheet(false)}>
                    <Actionsheet.Content>
                        <Center w="100%" h={60} px={4} justifyContent="center">
                            <Text fontSize="18" fontWeight={"700"} fontFamily={"Poppins-SemiBold"} color="muted.800">
                                Status Persetujuan
                            </Text>
                        </Center>
                        <Actionsheet.Item onPress={() => changeStatusApproval('P')}>Menunggu Persetujuan</Actionsheet.Item>
                        <Actionsheet.Item onPress={() => changeStatusApproval('A')}>Telah di Setujui</Actionsheet.Item>
                        <Actionsheet.Item onPress={() => changeStatusApproval('R')}>Ditolak</Actionsheet.Item>
                        <Actionsheet.Item onPress={() => {
                            setFilterData({...filterData, sts_approved: "X"})
                            setOpenSheet(false)
                        }}>Semua Data</Actionsheet.Item>
                    </Actionsheet.Content>
                </Actionsheet>

                <HStack mt={2}>
                    <Button onPress={onResetHandle} w={"1/4"} mr={2} bg={appcolor.teks[mode][2]}>
                        <HStack space={1} alignItems={"center"}>
                            <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>Reset</Text>
                        </HStack>
                    </Button>
                    <Button onPress={applyFilter} flex={1} bg={appcolor.teks[mode][6]}>
                        <HStack space={1} alignItems={"center"}>
                            <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>Terapkan Filter</Text>
                        </HStack>
                    </Button>
                </HStack>
            </VStack>
        // </ScrollView>
    )
}

export default FilterApprovalTimesheet