import { TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, PresenceTransition, Button, Switch } from 'native-base'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { CalendarSearch, CalendarTick, Dislike, Like1, UserSearch } from 'iconsax-react-native'
import moment from 'moment'
import KaryawanList from '../../components/KaryawanList'
import DatePicker from 'react-native-date-picker'

const { height } = Dimensions.get("screen")

const FilterAbsensi = ({ onApplyFilter, setFilter, qstring, setQstring }) => {
    const mode = useSelector(state => state.themes).value
    const {user} = useSelector(state => state.auth)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ dateStart, setDateStart ] = useState(false)
    const [ dateFinish, setDateFinish ] = useState(false)

    const onResetHandle = () => {
        setQstring({
            karyawan_id: user.karyawan.id,
            karyawan: user.karyawan,
            dateStart: moment().add(-1, 'day').format("YYYY-MM-DD"),
            dateEnd: moment().format("YYYY-MM-DD")
        })
        setFilter(false)
    }

    // console.log("XXXX", qstring);

    return (
        <VStack h={`${height * .65}px`}>
            <VStack px={3} py={2} flex={1} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                {
                    ['developer', 'hrd', 'headspv', 'koordinator'].includes(user.usertype) &&
                    <>
                    <VStack h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                        <Text 
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][1]}>
                            Karyawan :
                        </Text>
                        <TouchableOpacity onPress={() => setOpenKaryawan(!openKaryawan)}>
                            <HStack py={2} space={2} alignItems={"center"}>
                                <UserSearch size="32" color="#555555" variant="Bulk"/>
                                <Text 
                                    fontSize={20}
                                    fontFamily={"Poppins-Bold"}
                                    color={appcolor.teks[mode][2]}>
                                    { qstring.karyawan.nama }
                                </Text>
                            </HStack>
                        </TouchableOpacity>
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
                                { moment(qstring.dateStart).format("dddd, DD MMMM YYYY") }
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
                                { moment(qstring.dateEnd).format("dddd, DD MMMM YYYY") }
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
                <VStack mt={2} h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Status Verify :
                    </Text>
                    <HStack py={2} space={2} alignItems={"center"}>
                        <Switch 
                            size="sm" 
                            onToggle={() => setQstring({...qstring, verify_sts: qstring.verify_sts ? "":"A"})} 
                            isChecked={qstring.verify_sts ? true:false}/>
                        <Text 
                            fontSize={20}
                            fontFamily={"Poppins-Bold"}
                            color={appcolor.teks[mode][2]}>
                            { qstring.verify_sts ? "Verified":"Waiting Verified" }
                        </Text>
                    </HStack>
                </VStack>

                <VStack mt={2} h={"75px"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Status Approval :
                    </Text>
                    <HStack py={2} space={2} alignItems={"center"}>
                        <Switch 
                            size="sm" 
                            onToggle={() => setQstring({...qstring, approve_sts: qstring.approve_sts ? "":"A"})} 
                            isChecked={qstring.approve_sts ? true:false}/>
                        <Text 
                            fontSize={20}
                            fontFamily={"Poppins-Bold"}
                            color={appcolor.teks[mode][2]}>
                            { qstring.approve_sts ? "Approved":"Waiting Approval" }
                        </Text>
                    </HStack>
                </VStack>

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

export default FilterAbsensi