import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Button } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation, useRoute } from '@react-navigation/native'
import SheetKegiatanEquipment from '../../components/SheetKegiatanEquipment'
import { applyTugas } from '../../redux/tugasSlice'
import { CalendarEdit, CalendarRemove, CalendarTick, CloseSquare } from 'iconsax-react-native'
import SheetEquipment from '../../components/SheetEquipment'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import { nanoid } from '@reduxjs/toolkit'

const TugasEquipmentDetail = () => {
    const key = nanoid()
    const { params } = useRoute()
    const route = useNavigation()
    const dispatch = useDispatch()
    const task = useSelector(state => state.tugas)
    const mode = useSelector(state => state.themes.value)
    const [ dataTask, setDataTask ] = useState({key: key})
    const [ openKegiatan, setOpenKegiatan ] = useState(false)
    const [ openEquipment, setOpenEquipment ] = useState(false)
    const [ openStartKerja, setOpenStartKerja ] = useState(false)
    const [ openFinishKerja, setOpenFinishKerja ] = useState(false)
    console.log(task);

    const onSelectKegiatan = (val) => {
        setDataTask({...dataTask, kegiatan: val})
        setOpenKegiatan(false)
    }

    const onSelectEquipment = (val) => {
        setDataTask({...dataTask, equipment: val})
        setOpenEquipment(false)
    }

    const onSelectStartDate = (val) => {
        setDataTask({...dataTask, starttask: moment(val).format('YYYY-MM-DD HH:mm')})
    }

    const onSelectSFinishDate = (val) => {
        setDataTask({...dataTask, finishtask: moment(val).format('YYYY-MM-DD HH:mm')})
    }

    const removeFieldHandle = (property) => {
        setDataTask({...dataTask, [property]: null})
    }

    const addItemKegiatan = () => {
        if(!dataTask.equipment){
            route.goBack()
            return
        }
        if(!dataTask.kegiatan){
            route.goBack()
            return
        }
        dispatch(applyTugas({
            ...task,
            equipmentTask: task.equipmentTask.map( m => m.id === params.id ? 
                {...m, items: m?.items?.length > 0 ? [dataTask, ...m?.items]:[dataTask]}
                :
                m
            )
        }))

        route.goBack()
    }

    console.log(params);

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={params.nama} onThemes={true} onFilter={null} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <Text 
                        textAlign={'right'} 
                        fontWeight={'semibold'}
                        fontFamily={'Poppins'}
                        color={appcolor.teks[mode][1]}>
                        {params.section}
                    </Text>
                    <HStack alignItems={'center'} justifyContent={'space-between'} p={2} borderWidth={.5} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                        <TouchableOpacity onPress={() => setOpenEquipment(!openEquipment)} style={{flex: 1}}>
                            <VStack>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Equipment Kerja :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {dataTask.equipment?.kode || '???'}
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                        {dataTask.equipment && <CloseSquare onPress={() => removeFieldHandle('equipment')} size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>}
                    </HStack>
                    { openEquipment && <SheetEquipment isOpen={openEquipment} onClose={() => setOpenEquipment(!openEquipment)} onSelected={onSelectEquipment}/> }

                    <HStack mt={3} alignItems={'center'} justifyContent={'space-between'} p={2} borderWidth={.5} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                        <TouchableOpacity onPress={() => setOpenKegiatan(!openKegiatan)} style={{flex: 1}}>
                            <VStack>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Kegiatan Kerja :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {dataTask.kegiatan?.nama || '???'}
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                        {dataTask.kegiatan && <CloseSquare onPress={() => removeFieldHandle('kegiatan')} size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>}
                    </HStack>
                    { openKegiatan && <SheetKegiatanEquipment isOpen={openKegiatan} onClose={() => setOpenKegiatan(!openKegiatan)} onSelected={onSelectKegiatan}/> }

                    <HStack space={3}>
                        <HStack flex={1} mt={3} alignItems={'center'} justifyContent={'space-between'} p={2} borderWidth={.5} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                            <TouchableOpacity onPress={() => setOpenStartKerja(!openStartKerja)} style={{flex: 1}}>
                                <VStack>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        Mulai Kerja :
                                    </Text>
                                    <HStack mt={-2} alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={'4xl'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Dosis-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {dataTask.starttask ? moment(dataTask.starttask).format('HH:mm') : '???'}
                                        </Text>
                                        <CalendarTick size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    </HStack>
                                    {
                                        dataTask.starttask &&
                                        <Text 
                                            fontSize={'xs'}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {moment(dataTask.starttask).format('dddd, DD MMMM YYYY')}
                                        </Text>
                                    }
                                </VStack>
                            </TouchableOpacity>
                            {
                                openStartKerja &&
                                <DatePicker
                                    modal
                                    mode={"datetime"}
                                    locale={"ID"}
                                    open={openStartKerja}
                                    date={new Date()}
                                    theme={mode != "dark"?"light":"dark"}
                                    onConfirm={(date) => onSelectStartDate(date)}
                                    onCancel={() => {
                                        setOpenStartKerja(!openStartKerja)
                                    }}
                                />
                            }
                        </HStack>
                        <HStack flex={1} mt={3} alignItems={'center'} justifyContent={'space-between'} p={2} borderWidth={.5} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                            <TouchableOpacity onPress={() => setOpenFinishKerja(!openFinishKerja)} style={{flex: 1}}>
                                <VStack>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        Finish Kerja :
                                    </Text>
                                    <HStack mt={-2} alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={'4xl'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Dosis-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {dataTask.finishtask ? moment(dataTask.finishtask).format('HH:mm') : '???'}
                                        </Text>
                                        <CalendarRemove size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    </HStack>
                                    {
                                        dataTask.finishtask &&
                                        <Text 
                                            fontSize={'xs'}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {moment(dataTask.finishtask).format('dddd, DD MMMM YYYY')}
                                        </Text>
                                    }
                                </VStack>
                            </TouchableOpacity>
                            {
                                openFinishKerja &&
                                <DatePicker
                                    modal
                                    mode={"datetime"}
                                    locale={"ID"}
                                    open={openFinishKerja}
                                    date={new Date()}
                                    theme={mode != "dark"?"light":"dark"}
                                    onConfirm={(date) => onSelectSFinishDate(date)}
                                    onCancel={() => {
                                        setOpenFinishKerja(!openFinishKerja)
                                    }}
                                />
                            }
                        </HStack>
                    </HStack>
                </VStack>
                <VStack px={3}>
                    <Button onPress={addItemKegiatan}>Okey, Simpan Perubahan</Button>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default TugasEquipmentDetail