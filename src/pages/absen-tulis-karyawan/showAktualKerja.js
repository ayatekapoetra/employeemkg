import { View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, PresenceTransition, Button, Modal, Input, Switch } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { ArrowRight2, BatteryCharging, Clock, Like1, Moon, SecurityUser, Sun1, Trash, UserTick } from 'iconsax-react-native'
import KaryawanList from '../../components/KaryawanList'
import { useDispatch, useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import { useNavigation, useRoute } from '@react-navigation/native'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'

const ShowAktualKerja = () => {
    const dispatch = useDispatch()
    const { params } = useRoute()
    const route = useNavigation()
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState(params)
    const [modalVisible, setModalVisible] = useState(false);
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)

    useEffect(() => {
        onGetDataHandle()
    }, [])

    const onGetDataHandle = async () => {
        try {
            const resp = await apiFetch.get(`hrd/worksheet/${params.id}/show-worksheet`)
            console.log(resp);
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

    const onApproveDataHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/worksheet/${params.id}/approval-worksheet`, data)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
                
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Berhasil menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Okey...'
                }))
                route.goBack()
            }
            
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

    const onUpdateDataHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/worksheet/${params.id}/update-worksheet`, data)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
                
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Berhasil menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Okey...'
                }))
                route.goBack()
            }
            
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

    const onDeleteDataHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/worksheet/${params.id}/destroy-worksheet`)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menghapus",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
                
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Berhasil menghapus",
                    subtitle: resp?.data?.diagnostic?.message || 'Okey...'
                }))
                route.goBack()
            }
            
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

    // console.log(data);
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Aktual Kerja Detail"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack mt={3} px={3} py={2} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][2]} borderStyle={"dashed"}>
                        <VStack flex={1}>
                            <Text 
                                fontSize={14}
                                fontWeight={400}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][2]}>
                                Nama Karyawan :
                            </Text>
                            <HStack space={1} alignItems={"center"}>
                                <SecurityUser size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                <VStack>
                                    <Text 
                                        fontSize={18}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        { data?.karyawan?.nama || "-" }
                                    </Text>
                                    <Text 
                                        fontSize={12}
                                        lineHeight={"xs"}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        { data?.karyawan?.section }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </HStack>

                    <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                        <VStack flex={1}>
                            <Text 
                                fontSize={14}
                                fontWeight={400}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][2]}>
                                Shift Kerja :
                            </Text>
                            <HStack space={1} alignItems={"center"}>
                                {
                                    data.shift_id === 1 ?
                                    <Sun1 size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                    :
                                    <Moon size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                }
                                <Text 
                                    fontSize={18}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][data.shift_id === 1 ? 3:2]}>
                                    { data.shift_id === 1 ? "Shift Siang":"Shift Malam" }
                                </Text>
                            </HStack>
                        </VStack>
                        <Switch size="sm" isChecked={data.shift_id === 1 ? false:true} onToggle={() => setData({...data, shift_id: data.shift_id === 1 ? 2:1})} />
                    </HStack>

                    <TouchableOpacity onPress={() => setOpenDateStart(!openDateStart)}>
                        <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={400}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    Mulai Kerja :
                                </Text>
                                <HStack space={1} alignItems={"center"}>
                                    <Clock size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={18}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data?.workstart).format("HH:mm A") }
                                        </Text>
                                        <Text 
                                            fontSize={12}
                                            lineHeight={"xs"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data?.workstart).format("dddd, DD MMMM YYYY") }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                            <ArrowRight2 size="22" color={appcolor.ico[mode][2]}/>
                        </HStack>
                    </TouchableOpacity>
                    {
                        openDateStart &&
                        <DatePicker
                            modal
                            mode={"datetime"}
                            locale={"ID"}
                            open={openDateStart}
                            date={new Date(data.workstart)}
                            theme={mode != "dark"?"light":"dark"}
                            onConfirm={(date) => setData({...data, workstart: date, date_ops: date})}
                            onCancel={() => {
                                setOpenDateStart(false)
                            }}
                        />
                    }
                    <TouchableOpacity onPress={() => setOpenDateEnd(!openDateEnd)}>
                        <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={400}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    Selesai Kerja :
                                </Text>
                                <HStack space={1} alignItems={"center"}>
                                    <Clock size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={18}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data?.workend).format("HH:mm A") }
                                        </Text>
                                        <Text 
                                            fontSize={12}
                                            lineHeight={"xs"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data?.workend).format("dddd, DD MMMM YYYY") }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                            <ArrowRight2 size="22" color={appcolor.ico[mode][2]}/>
                        </HStack>
                    </TouchableOpacity>
                    {
                        openDateEnd &&
                        <DatePicker
                            modal
                            mode={"datetime"}
                            locale={"ID"}
                            open={openDateEnd}
                            date={new Date(data.workend)}
                            theme={mode != "dark"?"light":"dark"}
                            onConfirm={(date) => setData({...data, workend: date})}
                            onCancel={() => {
                                setOpenDateEnd(false)
                            }}
                        />
                    }
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={400}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    Break Kerja :
                                </Text>
                                <HStack space={1} alignItems={"center"}>
                                    <BatteryCharging size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={18}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data?.break_duration } JAM
                                        </Text>
                                        <Text 
                                            fontSize={12}
                                            lineHeight={"xs"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { "Durasi istirahat kerja" }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                            <ArrowRight2 size="22" color={appcolor.ico[mode][2]}/>
                        </HStack>
                    </TouchableOpacity>
                    <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} bottom="4" size="lg">
                        <Modal.Content>
                            <Modal.CloseButton />
                            <Modal.Header>
                                Durasi Break
                            </Modal.Header>
                            <Modal.Body>
                                <Text>Durasi waktu istirahat :</Text>
                                <Input 
                                    keyboardType="decimal-pad" 
                                    keyboardAppearance={mode} 
                                    onChangeText={(teks) => setData({...data, break_duration: teks})}/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button flex="1" onPress={() => {setModalVisible(false)}}>
                                    Tentukan
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    {
                        data?.ws_status === 'A' &&
                        <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={400}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    Disetujui Oleh :
                                </Text>
                                <HStack space={1} alignItems={"center"}>
                                    <UserTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={18}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data?.ws_approve?.nama }
                                        </Text>
                                        <Text 
                                            fontSize={12}
                                            lineHeight={"xs"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data?.ws_approvedat ? moment(data?.ws_approvedat).format("DD MMMM YYYY [ - ] HH:mm"):"" }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </HStack>
                    }
                </VStack>
                <HStack m={3} space={1} mt={2}>
                    {
                        user.karyawan.id === data.karyawan_id && !data?.ws_approvedat &&
                        <Button onPress={onDeleteDataHandle} flex={1} bg={appcolor.teks[mode][5]}>
                            <HStack space={1} alignItems={"center"}>
                                <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                                <Text fontWeight={"bold"} color={"#FFFFFF"}>Hapus</Text>
                            </HStack>
                        </Button>
                    }
                    
                </HStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowAktualKerja