import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import { VStack, Text, HStack, Switch, Button, PresenceTransition, Actionsheet, Box, Center, Divider, View, Stack } from 'native-base'
import { AlignVertically, Android, ArrowSquareRight, Calendar2, Watch, WatchStatus } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useNavigation } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { applyTugas, clearTugas } from '../../redux/tugasSlice'
import KaryawanMultiOption from './karyawanMultiOption'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import TugasKaryawan from './tugasKaryawan'
import TugasEquipment from './tugasEquipment'
import { applyAlert } from '../../redux/alertSlice'
import apiFetch from '../../helpers/ApiFetch'
import SheetPenyewa from '../../components/SheetPenyewa'
import SheetLokasiPit from '../../components/SheetLokasiPit'

const dataShift = [
    {id: 1, kode: 'I', nama: 'Shift 1', narasi: 'Shift Kerja Pagi'},
    {id: 2, kode: 'II', nama: 'Shift 2', narasi: 'Shift Kerja Malam'},
]

const CreateDelegasiTugasScreen = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const task = useSelector(state => state.tugas)
    const mode = useSelector(state => state.themes.value)
    const [ openDateOps, setOpenDateOps ] = useState(false)
    const [ openShift, setOpenShift ] = useState(false)
    const [ openPenyewa, setOpenPenyewa ] = useState(false)
    const [ openLokasi, setOpenLokasi ] = useState(false)
    const [ typeTugas, setTypeTugas ] = useState(task.type === 'equipment')
    const [ arrayKaryawan, setArrayKaryawan ] = useState(task.type === 'equipment' ? task.equipmentTask : task.userTask)

    const onChangeTypeTugas = () => {
        dispatch(
            applyTugas({
                ...task,
                type: !typeTugas ? 'equipment':'user'
            })
        )
        setTypeTugas(!typeTugas)
    }

    const onChangeShiftTugas = (value) => {
        dispatch(applyTugas({...task, shift: value}))
        setOpenShift(false)
    }

    const onSelectPenyewa = (value) => {
        dispatch(applyTugas({...task, penyewa: value}))
        setOpenPenyewa(false)
    }

    const onSelectLokasi = (value) => {
        dispatch(applyTugas({...task, lokasi: value}))
        setOpenLokasi(false)
    }

    const previusDateScreen = () => {
        dispatch(applyTugas({...task, step: 1}))
        setOpenDateOps(false)
    }

    const nextKaryawanScreen = () => {
        dispatch(applyTugas({...task, step: 2}))
    }

    const nextNarasiScreen = () => {
        if(arrayKaryawan.length > 0){
            if(task.type === 'equipment'){
                dispatch(applyTugas({
                    ...task, 
                    equipmentTask: arrayKaryawan.map( m => ({...m, items: []})),
                    step: 3
                }))
            }else{
                dispatch(applyTugas({
                    ...task, 
                    userTask: arrayKaryawan,
                    step: 3
                }))
            }
        }else{
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Data invalid",
                subtitle: "Blum ada karyawan terpilih dalam penugasan..."
            }))
        }
    }

    const simpanDataTugas = async () => {
        console.log(task);
        if(task.type === 'user'){
            for (const obj of task.userTask) {
                if(!obj.narasitask){
                    dispatch(applyAlert({
                        show: true,
                        status: "error",
                        title: 'Data invalid',
                        subtitle: obj.nama + "\nBlum ada narasi tugas yg ditentukan..."
                    }))
                    return
                }
            }
        }

        if(task.type === 'equipment'){
            for (const obj of task.equipmentTask) {
                if(!task.shift){
                    dispatch(applyAlert({
                        show: true,
                        status: "error",
                        title: 'Data invalid',
                        subtitle: obj.nama + "\nBlum ada shift kerja yg ditentukan..."
                    }))
                    return
                }
                if(!task.penyewa){
                    dispatch(applyAlert({
                        show: true,
                        status: "error",
                        title: 'Data invalid',
                        subtitle: obj.nama + "\nBlum ada penyewa yg ditentukan..."
                    }))
                    return
                }
                if(!task.lokasi){
                    dispatch(applyAlert({
                        show: true,
                        status: "error",
                        title: 'Data invalid',
                        subtitle: obj.nama + "\nBlum ada lokasi kerja yg ditentukan..."
                    }))
                    return
                }

                for (const val of obj.items) {
                    if(!val.kegiatan){
                        dispatch(applyAlert({
                            show: true,
                            status: "error",
                            title: 'Data invalid',
                            subtitle: obj.nama + "\nBlum ada kegiatan kerja yg ditentukan..."
                        }))
                        return
                    }
                    if(!val.equipment){
                        dispatch(applyAlert({
                            show: true,
                            status: "error",
                            title: 'Data invalid',
                            subtitle: obj.nama + "\nBlum ada Equipment kerja yg ditentukan..."
                        }))
                        return
                    }
                    
                }
            }
        }

        try {
            const resp = await apiFetch.post( '/penugasan-kerja', task )
            console.log(resp);
            dispatch(applyAlert({
                show: true,
                status: "success",
                title: 'Success create task',
                subtitle: "Tugas telah dikirimkan ke setiap karyawan yang terpilih"
            }))
            dispatch(clearTugas())
            route.navigate('Delegasi-Tugas')
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Data Error',
                subtitle: error.message
            }))
        }
    }

    console.log('-----task', task);

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Buat Tugas Karyawan"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                {
                    task.step == 1 &&
                    <VStack space={3} px={3} flex={1} justifyContent={'space-between'}>
                        <VStack>
                            <HStack 
                                mb={3}
                                rounded={'md'} 
                                alignItems={'center'} 
                                justifyContent={'space-between'} 
                                borderWidth={1} 
                                borderStyle={'dotted'}
                                borderColor={appcolor.line[mode][2]}>
                                <VStack p={3}>
                                    <Text 
                                        fontSize={18} 
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][1]} 
                                        fontFamily={'Poppins-Regular'}>
                                        Group Penugasan
                                    </Text>
                                    <Text 
                                        fontSize={14} 
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][1]} 
                                        fontFamily={'Dosis-Regular'}>
                                        { task.type }
                                    </Text>
                                </VStack>
                                <Switch size="sm" colorScheme={'warning'} onToggle={onChangeTypeTugas} isChecked={typeTugas} />
                            </HStack>

                            {/* INPUT TANGGAL OPERATIONAL */}
                            <TouchableOpacity onPress={() => setOpenDateOps(!openDateOps)}>
                                <HStack 
                                    p={3}
                                    mb={3}
                                    rounded={'md'} 
                                    alignItems={'center'} 
                                    justifyContent={'space-between'} 
                                    borderWidth={1} 
                                    borderStyle={'dotted'}
                                    borderColor={appcolor.line[mode][2]}>
                                    <VStack>
                                        <Text color={appcolor.teks[mode][1]} fontSize={14} fontWeight={300} fontFamily={'Poppins-Light'}>
                                            Tanggal Operational :
                                        </Text>
                                        <Text color={appcolor.teks[mode][1]} fontSize={16} fontFamily={'Poppins-Regular'}>
                                            { moment(task.dateops).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    </VStack>
                                    <Calendar2 size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                </HStack>
                            </TouchableOpacity>
                            {
                                openDateOps &&
                                <DatePicker
                                    modal
                                    mode={"date"}
                                    locale={"ID"}
                                    open={openDateOps}
                                    date={new Date()}
                                    theme={mode != "dark"?"light":"dark"}
                                    onConfirm={(date) => dispatch(applyTugas({...task, dateops: moment(date).format('YYYY-MM-DD')}))}
                                    onCancel={() => {
                                        setOpenDateOps(!openDateOps)
                                    }}
                                />
                            }

                            {/* INPUT SHIFT KERJA */}
                            <TouchableOpacity onPress={() => setOpenShift(!openShift)}>
                                <HStack 
                                    p={3}
                                    mb={3}
                                    rounded={'md'} 
                                    alignItems={'center'} 
                                    justifyContent={'space-between'} 
                                    borderWidth={1} 
                                    borderStyle={'dotted'}
                                    borderColor={appcolor.line[mode][2]}>
                                    <Watch size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack py={1} flex={1}>
                                        <Text color={appcolor.teks[mode][1]} fontSize={14} fontWeight={300} fontFamily={'Poppins-Light'}>
                                            Shift Kerja :
                                        </Text>
                                        <Text 
                                            fontSize={16}
                                            fontWeight={500}
                                            lineHeight={'xs'}
                                            fontFamily={'Poppins-Regular'} 
                                            color={appcolor.teks[mode][1]}>
                                            { task.shift?.nama || "???" }
                                        </Text>
                                    </VStack>
                                    <ArrowSquareRight size="22" color={appcolor.teks[mode][2]} variant={openShift?"Bulk":"Outline"}/>
                                </HStack>
                            </TouchableOpacity>
                            {
                                openShift &&
                                <Actionsheet isOpen={openShift} onClose={() => setOpenShift(!openShift)}>
                                    <Actionsheet.Content>
                                        <Center py={2}>
                                            <Text fontFamily={'Abel-Regular'} fontSize={18}>Pilih Shift Kerja</Text>
                                        </Center>
                                        <Divider/>
                                        { 
                                            dataShift?.map( m => {
                                                return(
                                                    <Actionsheet.Item key={m.id} onPress={() => onChangeShiftTugas(m)}>
                                                        <VStack>
                                                            <Text fontSize={18} fontWeight={'semibold'} fontFamily={'Poppins-Regular'}>{m.nama}</Text>
                                                            <Text mt={-1} fontFamily={'Farsan-Regular'}>{m.narasi}</Text>
                                                        </VStack>
                                                    </Actionsheet.Item>
                                                )
                                            }) 
                                        }
                                        <Actionsheet.Item onPress={() => setOpenShift(!openShift)}>
                                            <Text color={appcolor.teks[mode][5]} fontSize={'lg'} fontWeight={'bold'}>Batal</Text>
                                        </Actionsheet.Item>
                                    </Actionsheet.Content>
                                </Actionsheet>
                            }
                            <View>
                                {
                                    task.type === 'equipment' &&
                                    <Stack>
                                        <TouchableOpacity onPress={() => setOpenPenyewa(!openPenyewa)}>
                                            <HStack 
                                                p={3}
                                                mb={3}
                                                rounded={'md'} 
                                                alignItems={'center'} 
                                                justifyContent={'space-between'} 
                                                borderWidth={1} 
                                                borderStyle={'dotted'}
                                                borderColor={appcolor.line[mode][2]}>
                                                <Android size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                <VStack py={1} flex={1}>
                                                    <Text 
                                                        fontSize={12}
                                                        fontWeight={300}
                                                        fontFamily={'Abel-Regular'} 
                                                        color={appcolor.teks[mode][2]}>
                                                        Penyewa :
                                                    </Text>
                                                    <Text 
                                                        fontSize={16}
                                                        fontWeight={500}
                                                        lineHeight={'xs'}
                                                        fontFamily={'Poppins-Regular'} 
                                                        color={appcolor.teks[mode][1]}>
                                                        { task.penyewa?.nama || "???" }
                                                    </Text>
                                                </VStack>
                                                <ArrowSquareRight size="22" color={appcolor.teks[mode][2]} variant={openShift?"Bulk":"Outline"}/>
                                            </HStack>
                                        </TouchableOpacity>
                                        { openPenyewa && <SheetPenyewa isOpen={openPenyewa} onClose={() => setOpenPenyewa(!openPenyewa)} onSelected={onSelectPenyewa}/> }

                                        <TouchableOpacity onPress={() => setOpenLokasi(!openLokasi)}>
                                            <HStack 
                                                p={3}
                                                mb={3}
                                                rounded={'md'} 
                                                alignItems={'center'} 
                                                justifyContent={'space-between'} 
                                                borderWidth={1} 
                                                borderStyle={'dotted'}
                                                borderColor={appcolor.line[mode][2]}>
                                                <AlignVertically size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                <VStack py={1} flex={1}>
                                                    <Text 
                                                        fontSize={12}
                                                        fontWeight={300}
                                                        fontFamily={'Abel-Regular'} 
                                                        color={appcolor.teks[mode][2]}>
                                                        Lokasi Kerja :
                                                    </Text>
                                                    <Text 
                                                        fontSize={16}
                                                        fontWeight={500}
                                                        lineHeight={'xs'}
                                                        fontFamily={'Poppins-Regular'} 
                                                        color={appcolor.teks[mode][1]}>
                                                        { task.lokasi?.nama || "???" }
                                                    </Text>
                                                </VStack>
                                                <ArrowSquareRight size="22" color={appcolor.teks[mode][2]} variant={openShift?"Bulk":"Outline"}/>
                                            </HStack>
                                        </TouchableOpacity>
                                        { openLokasi && <SheetLokasiPit isOpen={openLokasi} onClose={() => setOpenLokasi(!openLokasi)} onSelected={onSelectLokasi}/> }
                                    </Stack>

                                }
                            </View>
                        </VStack>

                        <Button onPress={nextKaryawanScreen}>Selanjutnya</Button>
                    </VStack>
                }

                {
                    task.step === 2 &&
                    <VStack px={3} flex={1}>
                        <KaryawanMultiOption isoprdrv={task.type === 'user'} state={arrayKaryawan} setState={setArrayKaryawan}/>
                        <HStack mt={2} px={1} space={2} justifyContent={"space-around"}>
                            <Button flex={1} variant={"solid"} colorScheme={"coolGray"} onPress={previusDateScreen}>Kembali</Button>
                            <Button flex={1} onPress={nextNarasiScreen}>Selanjutnya</Button>
                        </HStack>
                    </VStack>
                }

                {
                    task.step === 3 &&
                    <VStack px={3} flex={1}>
                        {
                            task.type === 'user' ?
                            <TugasKaryawan/>
                            :
                            <TugasEquipment/>
                        }
                        <HStack mt={2} px={1} space={2} justifyContent={"space-around"}>
                            <Button flex={1} variant={"solid"} colorScheme={"coolGray"} onPress={nextKaryawanScreen}>Kembali</Button>
                            <Button flex={1} onPress={simpanDataTugas}>Simpan</Button>
                        </HStack>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default CreateDelegasiTugasScreen