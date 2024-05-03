import { ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Button, Center, PresenceTransition, Modal, Input } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight2, Calendar1, MessageText1, User, Like1, Calculator } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import AppScreen from '../../../components/AppScreen'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import KaryawanList from '../../../components/KaryawanList'
import apiFetch from '../../../helpers/ApiFetch'
import { applyAlert } from '../../../redux/alertSlice'
import { useNavigation } from '@react-navigation/native'


const CreateFormAlpha = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [ modalVisible, setModalVisible ] = useState(false)
    const [ data, setData ] = useState({
        karyawan_id: user.karyawan.id,
        karyawan: user.karyawan,
        date_start: new Date(),
        date_end: new Date(moment().add(1, 'd')),
        jumlah: 1,
        narasi: ""
    })

    const handleOpenKaryawan = () => {
        var array = ["developer", "administrator", "hrd"]
        if(array.includes(user.usertype)){
            setOpenKaryawan(!openKaryawan)
        }
    }

    const onPostDataHandle = async () => {
        if(!data.karyawan_id){
            alert("Karyawan belum ditentukan...")
            return
        }

        if(!data.narasi){
            alert("Narasi belum ditentukan...")
            return
        }

        try {
            const resp = await apiFetch.post("hrd/permohonan-izin-alpha", data)
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "ERR_POST",
                    subtitle: resp.data.diagnostic.message || "Error post data..."
                }))
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp.data.diagnostic.message || "Success post data..."
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message || "ERROR..."
            }))
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Form Informasi Alpha"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <TouchableOpacity onPress={handleOpenKaryawan}>
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
                    <ScrollView showsVerticalScrollIndicator={false}>
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
                            onConfirm={(date) => {
                                var start = moment(date)
                                var finish = moment(data.date_end)
                                setData({...data, date_start: date, jumlah: finish.diff(start, 'day')})
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
                            onConfirm={(date) => {
                                var start = moment(data.date_start)
                                var finish = moment(date)
                                setData({...data, date_end: date, jumlah: finish.diff(start, 'day')})
                            }}
                            onCancel={() => {
                                setOpenDateEnd(false)
                            }}
                        />
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
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
                                                Alasan Alpha :
                                            </Text>
                                            <Text 
                                                lineHeight={"xs"}
                                                fontSize={18}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { data.narasi || "???" }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </TouchableOpacity>
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
                                    <Calculator size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <HStack flex={1}>
                                        <Text 
                                            fontWeight={"bold"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][3]}>
                                            Jumlah {data.jumlah + 1} Hari
                                        </Text>
                                    </HStack>
                                </HStack>
                            </HStack>
                        </VStack>
                        {/* <TouchableOpacity>
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
                        </TouchableOpacity> */}
                    </ScrollView>
                    <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} bottom="4" size="lg">
                        <Modal.Content>
                            <Modal.CloseButton />
                            <Modal.Header>
                                Narasi
                            </Modal.Header>
                            <Modal.Body>
                                <Text>Penjelasan :</Text>
                                <Input 
                                    h={200}
                                    multiline
                                    keyboardAppearance={mode} 
                                    placeholder='Keterangan disini...'
                                    onChangeText={(teks) => setData({...data, narasi: teks})}/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button flex="1" onPress={() => {setModalVisible(false)}}>
                                    Tentukan
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    <HStack space={1} mt={2}>
                        <Button onPress={onPostDataHandle} flex={1} bg={appcolor.teks[mode][6]}>
                            <HStack space={1} alignItems={"center"}>
                                <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                <Text fontWeight={"bold"} color={"#FFFFFF"}>Simpan & Kirim Form</Text>
                            </HStack>
                        </Button>
                    </HStack>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default CreateFormAlpha