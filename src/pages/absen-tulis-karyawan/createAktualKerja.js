import { ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Button, PresenceTransition, Modal, Input, Switch } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight2, BatteryCharging, Clock, Like1, Moon, SecurityUser, Sun1, UserTick } from 'iconsax-react-native'
import moment from 'moment'
import KaryawanList from '../../components/KaryawanList'
import DatePicker from 'react-native-date-picker'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'
import { useNavigation } from '@react-navigation/native'
import ValidatorList from '../../components/ValidatorList'

const CreateAktualKerja = () => {
    const dispatch = useDispatch()
    const route = useNavigation()
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const [modalVisible, setModalVisible] = useState(false);
    const [ openKaryawan, setOpenKaryawan ] = useState(false)
    const [ openValidator, setOpenValidator ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [ approvedBy, setApprovedBy ] = useState([])
    const [ data, setData ] = useState({
        karyawan_id: user.karyawan.id,
        ws_appovedby: null,
        appovedby: null,
        karyawan: user.karyawan,
        date_ops: new Date(),
        shift_id: 1,
        workstart: new Date(),
        workend: new Date(),
        break_duration: 0
    })
    

    useEffect(() => {
        getDataPenanggungJawab()
    }, [])

    const getDataPenanggungJawab = async () => {
        try {
            const resp = await apiFetch('karyawan-validator-aktual-kerja')
            setApprovedBy(resp.data.data)
        } catch (error) {
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal mengambil data penanggung jawab",
                subtitle: resp?.data?.diagnostic?.message || 'Error'
            }))
        }
    }
    // console.log('*****', validator);

    const onSaveDataHandle = async () => {
        if(!data.karyawan_id){
            alert("Karyawan belum ditentukan...")
            return
        }
        if(!data.date_ops){
            alert("Tanggal kerja belum ditentukan...")
            return
        }

        try {
            const resp = await apiFetch.post("hrd/worksheet/create", data)
            // console.log(resp);
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
                    title: "Success menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Okey...'
                }))
            }
        } catch (error) {
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal menyimpan",
                subtitle: resp?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    const onSelectEmployeeHandle = () => {
        if(['developer', 'hrd', 'headspv', 'koordinator'].includes(user.usertype)){
            setOpenKaryawan(!openKaryawan)
        }
    }

    console.log(data);
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Buat Aktual Kerja Harian"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <TouchableOpacity onPress={onSelectEmployeeHandle}>
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
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOpenValidator(!openValidator)}>
                        <HStack mt={3} px={3} py={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={400}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    Penanggung Jawab :
                                </Text>
                                <HStack space={1} alignItems={"center"}>
                                    <UserTick size="32" color={appcolor.ico[mode][2]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={18}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data.appovedby?.nama || '???' }
                                        </Text>
                                        <Text 
                                            fontSize={12}
                                            lineHeight={"xs"}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][1]}>
                                            { data?.appovedby?.section }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </HStack>
                    </TouchableOpacity>
                    {
                        openValidator &&
                        <PresenceTransition 
                            style={{height: 300}}
                            visible={openValidator} 
                            initial={{opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                            <ValidatorList data={approvedBy} state={data} setState={setData} setOpenValidator={setOpenValidator}/>
                        </PresenceTransition>
                    }
                    {
                        openKaryawan ?
                        <PresenceTransition 
                            style={{height: 500}}
                            visible={openKaryawan} 
                            initial={{opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                            <KaryawanList state={data} setState={setData} setOpenKaryawan={setOpenKaryawan}/>
                        </PresenceTransition>
                        :
                        <ScrollView>
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
                                    date={new Date()}
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
                                    date={new Date()}
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
                        </ScrollView>
                    }
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
                </VStack>
                <HStack m={3} space={1} mt={2}>
                    {/* <Button w={"25%"} bg={appcolor.teks[mode][5]}>
                        <HStack space={1} alignItems={"center"}>
                            <Trash size="20" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>hapus</Text>
                        </HStack>
                    </Button> */}
                    <Button onPress={onSaveDataHandle} flex={1} bg={appcolor.teks[mode][6]}>
                        <HStack space={1} alignItems={"center"}>
                            <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                            <Text fontWeight={"bold"} color={"#FFFFFF"}>Simpan Form Kerja</Text>
                        </HStack>
                    </Button>
                </HStack>
            </VStack>
        </AppScreen>
    )
}

export default CreateAktualKerja