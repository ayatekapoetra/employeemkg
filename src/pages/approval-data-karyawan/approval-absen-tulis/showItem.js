import { ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack, Text, Center, HStack, Image, Button, useDisclose, Actionsheet, Box, Switch, Modal, Input } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { ArrowRight2, BatteryCharging, Clock, Dislike, Like1, Moon, SecurityUser, Sun1, Trash } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import apiFetch from '../../../helpers/ApiFetch'
import LoadingHauler from '../../../components/LoadingHauler'
import AppScreen from '../../../components/AppScreen'
import appcolor from '../../../common/colorMode'
import { applyAlert } from '../../../redux/alertSlice'
import { showDataFetch } from '../../../redux/showDataSlice'

const { width } = Dimensions.get("screen")

const ShowApprovalAbsenTulis = () => {
    const dispatch = useDispatch()
    const { params } = useRoute()
    const route = useNavigation()
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    const [ loading, setLoading ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [ state, setState ] = useState(null)

    useEffect(() => {
        getDataRdx()
    }, [])

    const getDataRdx = async () => {
        setLoading(true)
        try {
            const resp = await apiFetch(`hrd/worksheet/${params.id}/show-worksheet`)
            const { data } = resp.data
            setState(data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal memuat data",
                subtitle: error?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const onApproveDataHandle = async () => {
        try {
            const resp = await apiFetch.post(`hrd/worksheet/${params.id}/approval-worksheet`, state)
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
            const resp = await apiFetch.post(`hrd/worksheet/${params.id}/update-worksheet`, state)
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

    // console.log("SHOW-DATA----", data);
    if(loading){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Absensi Details"} onThemes={true} onBack={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

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
                                        { state?.karyawan?.nama || "-" }
                                    </Text>
                                    <Text 
                                        fontSize={12}
                                        lineHeight={"xs"}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        { state?.karyawan?.section }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </HStack>
                    <ScrollView 
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={getDataRdx}/>}
                        showsVerticalScrollIndicator={false}>
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
                                        state?.shift_id === 1 ?
                                        <Sun1 size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                        :
                                        <Moon size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                    }
                                    <Text 
                                        fontSize={18}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][state?.shift_id === 1 ? 3:2]}>
                                        { state?.shift_id === 1 ? "Shift Siang":"Shift Malam" }
                                    </Text>
                                </HStack>
                            </VStack>
                            <Switch size="sm" isChecked={state?.shift_id === 1 ? false:true} onToggle={() => setState({...state, shift_id: state?.shift_id === 1 ? 2:1})} />
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
                                                { moment(state?.workstart).format("HH:mm A") }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state?.workstart).format("dddd, DD MMMM YYYY") }
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
                                date={new Date(state?.workstart)}
                                theme={mode != "dark"?"light":"dark"}
                                onConfirm={(date) => setState({...state, workstart: date, date_ops: date})}
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
                                                { moment(state?.workend).format("HH:mm A") }
                                            </Text>
                                            <Text 
                                                fontSize={12}
                                                lineHeight={"xs"}
                                                fontFamily={"Poppins-Regular"}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state?.workend).format("dddd, DD MMMM YYYY") }
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
                                date={new Date(state?.workend)}
                                theme={mode != "dark"?"light":"dark"}
                                onConfirm={(date) => setState({...state, workend: date})}
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
                                                { state?.break_duration } JAM
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
                                        onChangeText={(teks) => setState({...state, break_duration: teks})}/>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button flex="1" onPress={() => {setModalVisible(false)}}>
                                        Tentukan
                                    </Button>
                                </Modal.Footer>
                            </Modal.Content>
                        </Modal>
                        <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={400}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    { state?.ws_status === 'A'?'Disetujui Oleh :':'Minta persetujuan kepada :'}
                                </Text>
                                <HStack space={1} alignItems={"center"}>
                                    <SecurityUser size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={18}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { state?.ws_approve?.nama || "-" }
                                        </Text>
                                        <Text 
                                            fontSize={12}
                                            lineHeight={"xs"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            Penanggung Jawab { state?.ws_approve?.section }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </HStack>
                    </ScrollView>
                </VStack>
                <HStack m={3} space={1} mt={2}>
                    {
                        ['developer', 'hrd'].includes(user.usertype) &&
                        <Button onPress={onDeleteDataHandle} w={"25%"} bg={appcolor.teks[mode][5]}>
                            <HStack space={1} alignItems={"center"}>
                                <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                                <Text fontWeight={"bold"} color={"#FFFFFF"}>Hapus</Text>
                            </HStack>
                        </Button>
                    }
                    {
                        state?.ws_status === 'A' ?
                        <Button onPress={null} disabled flex={1} bg={appcolor.teks[mode][2]}>
                            <HStack space={1} alignItems={"center"}>
                                <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                <Text fontWeight={"bold"} color={"#FFFFFF"}>Approve Form Kerja</Text>
                            </HStack>
                        </Button>
                        :
                        <>
                            {
                                user.karyawan.id === state?.karyawan_id ?
                                <Button onPress={onUpdateDataHandle} flex={1} bg={appcolor.teks[mode][6]}>
                                    <HStack space={1} alignItems={"center"}>
                                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Update Form Kerja</Text>
                                    </HStack>
                                </Button>
                                :
                                <Button onPress={onApproveDataHandle} flex={1} bg={appcolor.teks[mode][3]}>
                                    <HStack space={1} alignItems={"center"}>
                                        <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Approve Form Kerja</Text>
                                    </HStack>
                                </Button>
                            }
                        </>
                    }
                </HStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowApprovalAbsenTulis