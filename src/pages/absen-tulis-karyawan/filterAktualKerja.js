import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, PresenceTransition, Button, Select, CheckIcon } from 'native-base'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { CalendarSearch, CalendarTick, CloseCircle, Dislike, Like1, UserSearch } from 'iconsax-react-native'
import KaryawanList from '../../components/KaryawanList'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'

const FilterAktualKerja = ( { onApplyFilter, setFilter, qstring, setQstring } ) => {
    const mode = useSelector(state => state.themes.value)
    const {user} = useSelector(state => state.auth)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ dateStart, setDateStart ] = useState(false)
    const [ dateFinish, setDateFinish ] = useState(false)

    const onResetHandle = () => {
        setQstring({
            ...qstring,
            karyawan_id: user.karyawan.id,
            karyawan: user.karyawan,
            dateStart: moment().add(-1, 'day').format("YYYY-MM-DD"),
            dateEnd: moment().format("YYYY-MM-DD")
        })
        setFilter(false)
    }

    console.log("XXXX", qstring);

    return (
        <VStack mb={5} flex={1}>
            <VStack px={3} py={2} flex={1} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                {
                    ['developer', 'hrd', 'pjo', 'headspv', 'koordinator'].includes(user.usertype) &&
                    <>
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
                                            { qstring?.karyawan?.nama }
                                        </Text>
                                    </HStack>
                                </HStack>
                            </TouchableOpacity>
                            {
                                qstring?.karyawan?.nama &&
                                <TouchableOpacity onPress={() => setQstring({...qstring, karyawan_id: null, karyawan: null})}>
                                    <CloseCircle size="28" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                </TouchableOpacity>
                            }

                        </HStack>
                    </VStack>
                    {
                        openKaryawan &&
                        <PresenceTransition 
                            style={{height: 500}}
                            visible={openKaryawan} 
                            initial={{opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                            <KaryawanList state={qstring} setState={setQstring} setOpenKaryawan={setOpenKaryawan}/>
                        </PresenceTransition>
                    }
                    </>
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
                                { moment(qstring?.dateStart).format("dddd, DD MMMM YYYY") }
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
                        onConfirm={(date) => setQstring({...qstring, dateStart: date})}
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
                                { moment(qstring?.dateEnd).format("dddd, DD MMMM YYYY") }
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
                        onConfirm={(date) => setQstring({...qstring, dateEnd: date})}
                        onCancel={() => {
                            setDateFinish(false)
                        }}
                    />
                </VStack>
                <HStack h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]} alignItems={'center'} justifyContent={'space-between'}>
                    <Select 
                        variant='filled' 
                        selectedValue={qstring.status} 
                        h={'50px'} 
                        flex={1} 
                        accessibilityLabel="Choose Service" 
                        placeholder="Choose Service" 
                        _selectedItem={{endIcon: <CheckIcon size="5" />}} 
                        mt={1} onValueChange={value => setQstring({...qstring, status: value})}>
                        <Select.Item color={appcolor.teks[mode][2]} label="Semua Data" value="all" />
                        <Select.Item color={appcolor.teks[mode][2]} label="Menunggu Persetujuan" value="X" />
                        <Select.Item color={appcolor.teks[mode][2]} label="Telah disetujui" value="A" />
                    </Select>
                </HStack>

                <HStack mt={2}>
                    <Button onPress={onResetHandle} w={"1/4"} mr={2} bg={appcolor.teks[mode][2]}>
                        <HStack space={1} alignItems={"center"}>
                            <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>Reset</Text>
                        </HStack>
                    </Button>
                    <Button onPress={onApplyFilter} flex={1} bg={appcolor.teks[mode][6]}>
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

export default FilterAktualKerja