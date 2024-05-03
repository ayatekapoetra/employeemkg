import { ScrollView, TouchableOpacity } from 'react-native'
import { VStack, Text, HStack, Button, PresenceTransition, Modal, Input } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight2, Calendar1, DocumentText, Like1, UserTick } from 'iconsax-react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import moment from 'moment'
import KaryawanList from '../../components/KaryawanList'
import DatePicker from 'react-native-date-picker'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'
import { useNavigation } from '@react-navigation/native'

const CreatePerintahLembur = () => {
    const dispatch = useDispatch()
    const route = useNavigation()
    const mode = useSelector(state => state.themes.value)
    const [ openOTStart, setOpenOTStart ] = useState(false)
    const [ openOTFinish, setOpenOTFinish ] = useState(false)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [ data, setData ] = useState({
        karyawan_id: null,
        karyawan: null,
        date_ops: new Date(),
        overtime_start: new Date(),
        overtime_end: new Date(),
        narasi: ""
    })

    const postDataFormLembur = async () => {
        if(!data.karyawan_id){
            alert("Karyawan belum ditentukan...")
            return
        }

        if(!data.overtime_start){
            alert("Waktu awal kegiatan lembur belum ditentukan...")
            return
        }

        if(!data.overtime_end){
            alert("Waktu akhir kegiatan lembur belum ditentukan...")
            return
        }

        if(!data.narasi){
            alert("Narasi kegiatan lembur belum ditentukan...")
            return
        }
        
        try {
            const resp = await apiFetch.post("hrd/perintah-lembur/create", data)
            console.log(resp);
            dispatch(applyAlert({
                show: true,
                status: "success",
                title: "Okey...",
                subtitle: "Berhasil membuat data form lembur"
            }))
            route.goBack()
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal menyimpan",
                subtitle: resp?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    // console.log(data);
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Form Perintah Lembur"} onBack={true} onThemes={true} onNotification={true}/>
                <ScrollView>
                    <VStack px={3} flex={1}>
                        <TouchableOpacity onPress={() => setOpenKaryawan(!openKaryawan)}>
                            <HStack px={3} py={2} mt={3} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text color={appcolor.teks[mode][2]}>
                                        Kepada :
                                    </Text>
                                    <HStack space={2} alignItems={"center"}>
                                        <UserTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack flex={1}>
                                            <Text 
                                                fontSize={20}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { data?.karyawan?.nama }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][3]}>
                                                { data?.karyawan?.section }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                                <ArrowRight2 size="22" color={appcolor.ico[mode][2]} variant="Bold"/>
                            </HStack>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setOpenOTStart(true)}>
                            <HStack px={3} py={2} mt={3} h={"75px"} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text color={appcolor.teks[mode][2]}>
                                        Mulai dari :
                                    </Text>
                                    <HStack space={2} alignItems={"center"}>
                                        <Calendar1 size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontSize={20}
                                                lineHeight={"xs"}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(data.overtime_start).format("HH:mm A") }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][3]}>
                                                { moment(data.overtime_start).format("dddd, DD MMMM YYYY") }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                                <ArrowRight2 size="22" color={appcolor.ico[mode][2]} variant="Bold"/>
                            </HStack>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setOpenOTFinish(true)}>
                            <HStack px={3} py={2} mt={3} h={"75px"} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text color={appcolor.teks[mode][2]}>
                                        Hingga pada :
                                    </Text>
                                    <HStack space={2} alignItems={"center"}>
                                        <Calendar1 size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontSize={20}
                                                lineHeight={"xs"}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(data.overtime_end).format("HH:mm A") }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][3]}>
                                                { moment(data.overtime_end).format("dddd, DD MMMM YYYY") }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                                <ArrowRight2 size="22" color={appcolor.ico[mode][2]} variant="Bold"/>
                            </HStack>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <HStack px={3} py={2} mt={3} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text color={appcolor.teks[mode][2]}>
                                        Narasi Tugas :
                                    </Text>
                                    <HStack space={2} alignItems={"flex-start"}>
                                        <DocumentText size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack flex={1}>
                                            <Text 
                                                fontSize={18}
                                                lineHeight={"xs"}
                                                textAlign={"justify"}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { data?.narasi || "???" }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </TouchableOpacity>
                    </VStack>
                </ScrollView>
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
                {
                    openOTStart &&
                    <DatePicker
                        modal
                        mode={"datetime"}
                        locale={"ID"}
                        open={openOTStart}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setData({...data, overtime_start: date, date_ops: date})}
                        onCancel={() => {
                            setOpenOTStart(false)
                        }}
                    />
                }
                {
                    openOTFinish &&
                    <DatePicker
                        modal
                        mode={"datetime"}
                        locale={"ID"}
                        open={openOTFinish}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setData({...data, overtime_end: date})}
                        onCancel={() => {
                            setOpenOTFinish(false)
                        }}
                    />
                }

                <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} bottom="4" size="lg">
                    <Modal.Content>
                        <Modal.CloseButton />
                        <Modal.Header>
                            Narasi
                        </Modal.Header>
                        <Modal.Body>
                            <Text>Penjelasan Tugas :</Text>
                            <Input 
                                h={200}
                                multiline
                                keyboardAppearance={mode} 
                                placeholder='Narasikan tugas disini...'
                                onChangeText={(teks) => setData({...data, narasi: teks})}/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button flex="1" onPress={() => {setModalVisible(false)}}>
                                Tentukan
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>

                <HStack m={3} space={1} mt={2}>
                    <Button onPress={postDataFormLembur} flex={1} bg={appcolor.teks[mode][6]}>
                        <HStack space={1} alignItems={"center"}>
                            <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>simpan spl</Text>
                        </HStack>
                    </Button>
                </HStack>
            </VStack>
        </AppScreen>
    )
}

export default CreatePerintahLembur