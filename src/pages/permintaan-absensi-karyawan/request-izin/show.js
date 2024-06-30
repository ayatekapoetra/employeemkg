import { ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack, Text, HStack, Button, Center, PresenceTransition, Modal, Input } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { Image, ArrowRight2, Calendar1, Camera, MessageText1, User, Trash, Like1, Calculator, ProfileTick } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import AppScreen from '../../../components/AppScreen'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import { useNavigation, useRoute } from '@react-navigation/native'
import apiFetch from '../../../helpers/ApiFetch'
import { applyAlert } from '../../../redux/alertSlice'
import ShowBtnAction from './showBtnAction'


const ShowFormAlpha = () => {
    const { params } = useRoute()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [ openDateWork, setOpenDateWork ] = useState(false)
    const [ modalVisible, setModalVisible ] = useState(false)
    const [ data, setData ] = useState(params)

    console.log(data);

    useEffect(() => {
        onGetDataHandle()
    }, [])

    const onGetDataHandle = async () => {
        try {
            const resp = await apiFetch.get(`hrd/permohonan-izin-alpha/${params.id}/show`)
            // console.log(resp);
            setData(resp.data.data)
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message
            }))
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Update Informasi Alpha"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
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
                                        { data?.karyawan?.nama }
                                    </Text>
                                </VStack>
                            </HStack>
                        </HStack>
                    </VStack>
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
                                                { moment(data?.date_start).format('dddd, DD MMMM YYYY') }
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
                                setData({...data, date_start: date, jumlah: finish.diff(start, 'day') + 1})
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
                                                { moment(data?.date_end).format('dddd, DD MMMM YYYY') }
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
                            minimumDate={new Date(moment(data?.date_start).format("YYYY-MM-DD"))}
                            onConfirm={(date) => {
                                var start = moment(data.date_start)
                                var finish = moment(date)
                                setData({...data, date_end: date, jumlah: finish.diff(start, 'day') + 1})
                            }}
                            onCancel={() => {
                                setOpenDateEnd(false)
                            }}
                        />

                        <TouchableOpacity onPress={() => setOpenDateWork(true)}>
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
                                        <Calendar1 size="32" color={appcolor.ico[mode][4]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontWeight={"bold"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                Masuk Kerja Tanggal :
                                            </Text>
                                            <Text 
                                                lineHeight={"xs"}
                                                fontSize={18}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(data.work_start).format('dddd, DD MMMM YYYY') }
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
                            open={openDateWork}
                            date={new Date()}
                            theme={mode != "dark"?"light":"dark"}
                            minimumDate={new Date(moment(data.work_start).format("YYYY-MM-DD"))}
                            onConfirm={(date) => {
                                setData({...data, work_start: date})
                            }}
                            onCancel={() => {
                                setOpenDateWork(false)
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
                                                { data?.narasi || "???" }
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
                                            Jumlah { data?.jumlah } Hari
                                        </Text>
                                    </HStack>
                                </HStack>
                            </HStack>
                        </VStack>
                        {
                            data.status === "A" &&
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
                                        <ProfileTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack flex={1}>
                                            <Text 
                                                fontWeight={"bold"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                Disetujui oleh :
                                            </Text>
                                            <Text 
                                                lineHeight={"xs"}
                                                fontSize={18}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { data?.approve?.nama || "???" }
                                            </Text>
                                            <Text 
                                                lineHeight={"xs"}
                                                fontSize={12}
                                                fontWeight={600}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][3]}>
                                                { moment(data?.approved_at).format("dddd, DD MMMM YYYY HH:mm") }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </HStack>
                            </VStack>
                        }
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
                                    placeholder={data?.narasi}
                                    onChangeText={(teks) => setData({...data, narasi: teks})}/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button flex="1" onPress={() => {setModalVisible(false)}}>
                                    Tentukan
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    <ShowBtnAction data={data} user={user}/>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowFormAlpha