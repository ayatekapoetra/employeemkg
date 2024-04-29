import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Button, Center, PresenceTransition } from 'native-base'
import { useSelector } from 'react-redux'
import { Image, ArrowRight2, Calendar1, Camera, MessageText1, User, Trash, Like1 } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import AppScreen from '../../../components/AppScreen'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import KaryawanList from '../../../components/KaryawanList'


const ShowFormSakit = () => {
    const mode = useSelector(state => state.themes).value
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [ data, setData ] = useState({
        karyawan_id: null,
        karyawan: {nama: "Ayat Ekapoetra"},
        date_start: new Date(),
        date_end: new Date(moment().add(1, "day")),
        narasi: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
    })

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Update Informasi Sakit"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <TouchableOpacity onPress={() => setOpenKaryawan(!openKaryawan)}>
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
                                    <User size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontWeight={"bold"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            Pemohon :
                                        </Text>
                                        <Text 
                                            lineHeight={"xs"}
                                            fontSize={18}
                                            fontFamily={"Quicksand-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data.karyawan?.nama }
                                        </Text>
                                    </VStack>
                                </HStack>
                                <ArrowRight2 size="16" color={appcolor.ico[mode][1]} variant="TwoTone"/>
                            </HStack>
                        </VStack>
                    </TouchableOpacity>
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
                                            { moment(data.date_start).format('dddd, DD MMMM YYYY') }
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
                        onConfirm={(date) => setData({...data, date_start: date})}
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
                                            Hingga Tanggal :
                                        </Text>
                                        <Text 
                                            lineHeight={"xs"}
                                            fontSize={18}
                                            fontFamily={"Quicksand-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data.date_end).format('dddd, DD MMMM YYYY') }
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
                        minimumDate={new Date(moment(data.date_start).format("YYYY-MM-DD"))}
                        onConfirm={(date) => setData({...data, date_end: date})}
                        onCancel={() => {
                            setOpenDateEnd(false)
                        }}
                    />
                    <TouchableOpacity>
                        <VStack mt={1}>
                            <HStack 
                                p={2} 
                                mt={1} 
                                rounded={"md"}
                                borderWidth={.5} 
                                alignItems={"center"}
                                justifyContent={"space-between"}
                                borderColor={appcolor.line[mode][1]}>
                                <HStack space={2}>
                                    <MessageText1 size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontWeight={"bold"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            Narasi/diagnosa sakit :
                                        </Text>
                                        <Text 
                                            lineHeight={"xs"}
                                            fontSize={18}
                                            fontFamily={"Quicksand-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data.narasi }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </VStack>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <VStack mt={1}>
                            <HStack 
                                p={2} 
                                mt={1} 
                                rounded={"md"}
                                borderWidth={.5} 
                                alignItems={"center"}
                                justifyContent={"space-between"}
                                borderColor={appcolor.line[mode][1]}>
                                <HStack space={2}>
                                    <Camera size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontWeight={"bold"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            Foto Surat Dokter :
                                        </Text>
                                        <Center 
                                            m={3} p={5} 
                                            rounded={"md"} 
                                            borderWidth={1} 
                                            borderStyle={"dotted"}
                                            borderColor={appcolor.line[mode][2]}>
                                            <Image size="100" color="#ff8a65" variant="Bulk"/>
                                            <Text fontSize={10} color={appcolor.teks[mode][2]}>
                                                *upload surat dokter jika ada
                                            </Text>
                                        </Center>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </VStack>
                    </TouchableOpacity>
                    <HStack space={1} mt={2}>
                        <Button w={"25%"} bg={appcolor.teks[mode][5]}>
                            <HStack space={1} alignItems={"center"}>
                                <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                                <Text fontWeight={"bold"} color={"#FFFFFF"}>hapus</Text>
                            </HStack>
                        </Button>
                        <Button flex={1} bg={appcolor.teks[mode][3]}>
                            <HStack space={1} alignItems={"center"}>
                                <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                <Text fontWeight={"bold"} color={"#FFFFFF"}>form persetujuan</Text>
                            </HStack>
                        </Button>
                    </HStack>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowFormSakit