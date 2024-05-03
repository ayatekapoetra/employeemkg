import { ScrollView, TouchableOpacity } from 'react-native'
import { VStack, Text, HStack, Button, PresenceTransition, Modal, Input } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight2, Calendar1, CalendarTick, DocumentText, Like1, Trash, UserTick } from 'iconsax-react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'
import { useNavigation, useRoute } from '@react-navigation/native'

const ShowPerintahLembur = () => {
    const { params } = useRoute()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ openOTStart, setOpenOTStart ] = useState(false)
    const [ openOTFinish, setOpenOTFinish ] = useState(false)
    const [ data, setData ] = useState(params)

    useEffect(() => {
        onGetDataShow()
    }, [])

    const onGetDataShow = async () => {
        const resp = await apiFetch.get(`hrd/perintah-lembur/${params.id}/show`)
        console.log(resp);
        setData(resp.data.data)
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Perintah Lembur Detail"} onBack={true} onThemes={true} onNotification={true}/>
                <ScrollView>
                    <VStack px={3} flex={1}>
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
                        </HStack>

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
                                            { data?.narasi }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </HStack>

                        <HStack px={3} py={2} mt={3} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text color={appcolor.teks[mode][2]}>
                                    Penanggung Jawab :
                                </Text>
                                <HStack alignItems={"center"}>
                                    <HStack flex={1} space={2} alignItems={"center"}>
                                        <UserTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack flex={1}>
                                            <Text 
                                                fontSize={20}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { data?.author?.nama_lengkap }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][3]}>
                                                { data?.author?.usertype }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </HStack>

                        {
                            data.approvedat &&
                            <HStack px={3} py={2} mt={3} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text color={appcolor.teks[mode][2]}>
                                        Disetujui pada :
                                    </Text>
                                    <HStack alignItems={"center"}>
                                        <HStack flex={1} space={2} alignItems={"center"}>
                                            <CalendarTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                            <VStack flex={1}>
                                                <Text 
                                                    fontSize={20}
                                                    fontFamily={"Quicksand-Regular"}
                                                    color={appcolor.teks[mode][1]}>
                                                    { moment().format("dddd, DD MMMM YYYY") }
                                                </Text>
                                                <Text 
                                                    fontSize={12}
                                                    lineHeight={"xs"}
                                                    fontFamily={"Poppins-Regular"}
                                                    color={appcolor.teks[mode][3]}>
                                                    { moment().format("HH:mm A") }
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </HStack>
                        }

                        {
                            data?.approve &&
                            <HStack px={3} py={2} mt={3} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text color={appcolor.teks[mode][2]}>
                                        Disetujui Oleh :
                                    </Text>
                                    <HStack space={2} alignItems={"center"}>
                                        <UserTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                        <VStack flex={1}>
                                            <Text 
                                                fontSize={20}
                                                fontFamily={"Quicksand-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { data?.approve?.nama }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][3]}>
                                                { data?.approve?.nama }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </HStack>
                        }
                    </VStack>
                </ScrollView>
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

                <HStack m={3} space={1} mt={2}>
                    <ButtonUpdateLembur data={data} user={user} mode={mode}/>
                </HStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowPerintahLembur

function ButtonUpdateLembur( { data, user, mode } ){
    const dispatch = useDispatch()
    const route = useNavigation()

    const onLemburAccept = async () => {
        try {
            const resp = await apiFetch.post(`hrd/perintah-lembur/${data.id}/accept`)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
            }else{
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp?.data?.diagnostic?.message || 'Anda berhasil menyetujui perintah lembur'
                }))
            }
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

    const onLemburFinish = async () => {
        try {
            const resp = await apiFetch.post(`hrd/perintah-lembur/${data.id}/finish`, data)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
            }else{
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp?.data?.diagnostic?.message || 'Anda berhasil mengupdate perintah lembur'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal menyimpan",
                subtitle: error?.response?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    const onLemburApproval = async () => {
        try {
            const resp = await apiFetch.post(`hrd/perintah-lembur/${data.id}/approval`, data)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
            }else{
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp?.data?.diagnostic?.message || 'Anda berhasil mengupdate perintah lembur'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal menyimpan",
                subtitle: error?.response?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    const onLemburDelete = async () => {
        try {
            const resp = await apiFetch.post(`hrd/perintah-lembur/${data.id}/destroy`)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Peringatan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
            }else{
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp?.data?.diagnostic?.message || 'Anda berhasil mengupdate perintah lembur'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Peringatan",
                subtitle: error?.response?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    if(user.karyawan?.id === data?.karyawan_id && data.status === ""){
        return (
            <Button onPress={onLemburAccept} flex={1} bg={appcolor.teks[mode][4]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Terima Perintah</Text>
                </HStack>
            </Button>
        )
    }else if(user.karyawan?.id === data?.karyawan_id && data.status === "C"){
        return (
            <Button onPress={onLemburFinish} flex={1} bg={appcolor.teks[mode][6]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Finish Lembur</Text>
                </HStack>
            </Button>
        )
    }else if(user.karyawan?.id === data?.karyawan_id && data.status === "F"){
        return (
            <Button onPress={null} disabled flex={1} bg={appcolor.teks[mode][2]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Menunggu Persetujuan</Text>
                </HStack>
            </Button>
        )
    }else if(user?.id === data?.createdby && data.status === ""){
        return (
            <Button onPress={onLemburDelete} flex={1} bg={appcolor.teks[mode][5]}>
                <HStack space={1} alignItems={"center"}>
                    <Trash size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Hapus</Text>
                </HStack>
            </Button>
        )
    }else if(user?.id === data?.createdby && data.status === "C"){
        return (
            <Button onPress={null} disabled flex={1} bg={appcolor.teks[mode][5]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Menunggu Pekerjaan Selesai</Text>
                </HStack>
            </Button>
        )
    }else if(user?.id === data?.createdby && data.status === "F"){
        return (
            <Button onPress={onLemburApproval} flex={1} bg={appcolor.teks[mode][6]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Setujui Form SPL</Text>
                </HStack>
            </Button>
        )
    }else{
        return (
            <Button onPress={null} disabled flex={1} bg={appcolor.teks[mode][2]}>
                <HStack space={1} alignItems={"center"}>
                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Finish</Text>
                </HStack>
            </Button>
        )
    }
}