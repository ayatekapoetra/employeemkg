import moment from 'moment'
import { nanoid } from '@reduxjs/toolkit'
import { TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { Button, HStack, VStack, Text, ScrollView, Badge } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight2, AttachSquare, Calendar1, TagUser, TrushSquare, Watch, WristClock } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import SheetKaryawan from '../../components/SheetKaryawan'
import DocumentPicker, { types } from 'react-native-document-picker';
import SheetInputTeks from '../../components/SheetInputTeks'
import SheetShift from '../../components/SheetShift'
import { useNavigation } from '@react-navigation/native'
import { applyAlert } from '../../redux/alertSlice'
import apiFetch from '../../helpers/ApiFetch'

const CreateTugasKaryawan = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [activeRef, setActiveRef] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [ layerOpt, setLayerOpt ] = useState({
        date_task: false,
        shift: false,
        start_time: false,
        finish_time: false,
        karyawan: false,
        narasi: false
    })

    const [ state, setState ] = useState({
        date_task: new Date(),
        shift: null,
        karyawan: null,
        start_time: null,
        finish_time: null,
        items: []
    })

    const openLayerOption = (value, reff) => {
        if(reff){
            setActiveRef(reff)
            setLayerOpt({...layerOpt, [value]: !layerOpt[value]})
        }else{
            setLayerOpt({...layerOpt, [value]: !layerOpt[value]})
        }
    }

    const onPickDatetimeHandle = (obj, value) => {
        setState({...state, [value]: obj})
    }

    const onSelectedKaryawan = (obj) => {
        setState({...state, karyawan: obj})
        setLayerOpt({...layerOpt, karyawan: false})
    }

    const onSelectedShift = (obj) => {
        // console.log(obj);
        setState({...state, shift: obj})
        setLayerOpt({...layerOpt, shift: false})
    }

    const tambahItemHandle = () => {
        let iditem = nanoid()
        let items = state.items
        items.push({
            id: iditem,
            urut: items.length + 1,
            narasi: ''
        })
        setState({...state, items: items})
    }

    const hapusItemHandle = (obj) => {
        let items = state.items
        items = items.filter( f => f.id != obj.id)
        setState({...state, items: items.map((m,i) => ({...m, urut: i + 1}))})
    }

    const onSubmitInputHandle = (teks) => {
        
        var items = state.items?.map( m => m.id === activeRef ? {...m, narasi: teks}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, narasi: false})
    }

    const pickDocumentHandle = async () => {
        setFileInfo(null)
        try {
            const res = await DocumentPicker.pick({
              type: [types.allFiles], // Atau gunakan types.pdf, types.images, dll. sesuai kebutuhan
            });
            let myfile = res[0]
            let alias = (myfile.name).length > 15 
            ? `...${(myfile.name).slice(-10)}`
            : myfile.name

            setFileInfo({...myfile, alias: alias});
          } catch (err) {
            if (DocumentPicker.isCancel(err)) {
              console.log('User canceled the picker');
            } else {
              console.log('Unknown error: ', err);
            }
          }
    }

    const saveDataHandle = async () => {

        if(!state.date_task){
            alert('Tanggal penugasan blum ditentukan...')
            return
        }
        if(!state.karyawan){
            alert('Karyawan blum ditentukan...')
            return
        }
        if(!state.shift){
            alert('Shift blum ditentukan...')
            return
        }
        if(!state.start_time){
            alert('Waktu mulai tugas blum ditentukan...')
            return
        }
        if(!state.finish_time){
            alert('Waktu selesai tugas blum ditentukan...')
            return
        }
        if(state.items.length == 0){
            alert('Narasi tugas blum ditentukan...\n\nGunakan Tombol tambah dibawah untuk menambahkan narasi tugas!!!')
            return
        }
        for (const elm of state.items) {
            if(!elm.narasi){
                alert('Narasi tugas urut ke-' +elm.urut+ '\nBlum ditentukan...')
                return
            }
        }

        var data = new FormData()
        data.append("date_task", moment(state.date_task).format('YYYY-MM-DD'))
        data.append("start_time", moment(state.start_time).format('YYYY-MM-DD HH:mm'))
        data.append("finish_time", moment(state.finish_time).format('YYYY-MM-DD HH:mm'))
        data.append("karyawan_id", state.karyawan.id)
        data.append("shift_id", state.shift.id)
        data.append("items", JSON.stringify(state.items))
        if(fileInfo){
            const uriFile = Platform.OS === "android" ? fileInfo.uri : fileInfo.uri.replace("file://", "")
            data.append('attachFile', {
                uri: uriFile,
                name: fileInfo.name,
                type: fileInfo.type
            });
        }

        console.log(data);

        try {
            const resp = await apiFetch.post("penugasan-karyawan", data, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  "Cache-Control": "no-cache",
                }
            })

            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Tugas terkirim',
                    subtitle: 'Anda berhasil membuat penugasan...'
                }))
                route.navigate('Penugasan-Kerja')
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: 'error',
                    title: 'Gagal terkirim',
                    subtitle: 'Terjadi kesalahan dalam pengiriman data ke server...'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Gagal terkirim',
                subtitle: error?.response?.data?.diagnostic?.message||'Error api...'
            }))
        }
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Penugasan Kerja Karyawan"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <VStack flex={1}>
                            <TouchableOpacity onPress={() => openLayerOption('date_task')}>
                                <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Calendar1 size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                    <VStack flex={1}>
                                        <Text 
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Abel-Regular'}>
                                            Tanggal Penugasan :
                                        </Text>
                                        <Text 
                                            fontSize={16}
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Poppins'}>
                                            { moment(state.date_task).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    </VStack>
                                    <ArrowRight2 size="15" color={appcolor.teks[mode][2]} variant="Outline"/>
                                </HStack>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => openLayerOption('karyawan')}>
                                <HStack h={'70px'} py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <TagUser size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                    <VStack flex={1}>
                                        <Text 
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Abel-Regular'}>
                                            Karyawan :
                                        </Text>
                                        <Text 
                                            fontSize={16}
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Poppins'}>
                                            { state?.karyawan?.nama || '???' }
                                        </Text>
                                        {
                                            state?.karyawan &&
                                            <Text 
                                                fontSize={12}
                                                lineHeight={'xs'}
                                                color={appcolor.teks[mode][3]}
                                                fontFamily={'Poppins'}>
                                                { state?.karyawan?.section }
                                            </Text>
                                        }
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                            <HStack space={5}>
                                <TouchableOpacity onPress={() => openLayerOption('shift')} style={{flex: 1}}>
                                    <HStack h={'70px'} py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                        <Watch size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                        <VStack flex={1}>
                                            <Text 
                                                lineHeight={'xs'}
                                                color={appcolor.teks[mode][1]}
                                                fontFamily={'Abel-Regular'}>
                                                Shift Kerja :
                                            </Text>
                                            <Text 
                                                fontSize={16}
                                                lineHeight={'xs'}
                                                color={appcolor.teks[mode][1]}
                                                fontFamily={'Poppins'}>
                                                { state?.shift?.nama || '???' }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={pickDocumentHandle} style={{flex: 1}}>
                                    <HStack h={'70px'} py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                        <AttachSquare size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                        <VStack flex={1}>
                                            <Text 
                                                lineHeight={'xs'}
                                                color={appcolor.teks[mode][1]}
                                                fontFamily={'Abel-Regular'}>
                                                Lampiran :
                                            </Text>
                                            {
                                                fileInfo ?
                                                <VStack>
                                                    <Text 
                                                        flexWrap={'nowrap'}
                                                        fontSize={16}
                                                        lineHeight={'xs'}
                                                        color={appcolor.teks[mode][1]}
                                                        fontFamily={'Poppins'}>
                                                        { fileInfo.alias }
                                                    </Text>
                                                    <Text 
                                                        flexWrap={'nowrap'}
                                                        fontSize={10}
                                                        lineHeight={'xs'}
                                                        color={appcolor.teks[mode][3]}
                                                        fontFamily={'Roboto'}>
                                                        { fileInfo.size } { 'kb' }
                                                    </Text>
                                                </VStack>

                                                :
                                                <Text 
                                                    fontSize={16}
                                                    lineHeight={'xs'}
                                                    color={appcolor.teks[mode][1]}
                                                    fontFamily={'Poppins'}>
                                                    { 'Pilih Files' }
                                                </Text>
                                            }
                                        </VStack>
                                    </HStack>
                                </TouchableOpacity>

                            </HStack>
                            <HStack space={5}>
                                <TouchableOpacity onPress={() => openLayerOption('start_time')} style={{flex: 1}}>
                                    <HStack h={'70px'}  py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                        <WristClock size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                        <VStack flex={1}>
                                            <Text 
                                                lineHeight={'xs'}
                                                color={appcolor.teks[mode][1]}
                                                fontFamily={'Abel-Regular'}>
                                                Mulai Tugas :
                                            </Text>
                                            <Text 
                                                ml={1}
                                                lineHeight={'xs'}
                                                fontSize={22}
                                                color={appcolor.teks[mode][1]}
                                                fontWeight={'semibold'}
                                                fontFamily={'Dosis'}>
                                                { state?.start_time ? moment(state?.start_time).format('HH:mm'):'???' }
                                            </Text>
                                            {
                                                state?.start_time &&
                                                <Text 
                                                    lineHeight={'xs'}
                                                    fontFamily={'Farsan-Regular'}
                                                    color={appcolor.teks[mode][1]}>
                                                    { moment(state?.start_time).format('ddd, DD MMM YYYY') }
                                                </Text>
                                            }
                                        </VStack>
                                    </HStack>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openLayerOption('finish_time')} style={{flex: 1}}>
                                    <HStack h={'70px'} py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                        <WristClock size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                        <VStack flex={1}>
                                            <Text 
                                                lineHeight={'xs'}
                                                color={appcolor.teks[mode][1]}
                                                fontFamily={'Abel-Regular'}>
                                                Deadline :
                                            </Text>
                                            <Text 
                                                ml={1}
                                                lineHeight={'xs'}
                                                fontSize={22}
                                                color={appcolor.teks[mode][1]}
                                                fontWeight={'semibold'}
                                                fontFamily={'Dosis'}>
                                                { state?.finish_time ? moment(state?.finish_time).format('HH:mm'):'???' }
                                            </Text>
                                            {
                                                state?.finish_time &&
                                                <Text 
                                                    lineHeight={'xs'}
                                                    fontFamily={'Farsan-Regular'}
                                                    color={appcolor.teks[mode][1]}>
                                                    { moment(state?.finish_time).format('ddd, DD MMM YYYY') }
                                                </Text>
                                            }
                                        </VStack>
                                    </HStack>
                                </TouchableOpacity>
                            </HStack>
                            <VStack mt={2} flex={1}>
                            {
                                state.items.length > 0  &&
                                <>
                                    {
                                        state.items.map( m => {
                                            return(
                                                <VStack key={m.id}>
                                                    <HStack mt={2} p={2} bg={'amber.100'} alignItems={'center'} justifyContent={'space-between'} rounded={'md'}>
                                                        <HStack space={1}>
                                                            <Badge colorScheme={"coolGray"} rounded={'full'}>{m.urut}</Badge>
                                                            <Text 
                                                                fontSize={16}
                                                                fontWeight={'extrabold'}
                                                                fontFamily={'Quicksand'}>
                                                                Narasi Tugas
                                                            </Text>
                                                        </HStack>
                                                        <TouchableOpacity onPress={() => hapusItemHandle(m)}>
                                                            <TrushSquare size="26" color={appcolor.teks[mode][5]} variant="Outline"/>
                                                        </TouchableOpacity>
                                                    </HStack>
                                                    <VStack p={2}>
                                                        <TouchableOpacity onPress={() => openLayerOption('narasi', m.id)}>
                                                            {
                                                                m.narasi ?
                                                                <Text fontSize={16} fontFamily={'Quicksand'} color={appcolor.teks[mode][2]}>
                                                                    { m.narasi }
                                                                </Text>
                                                                :
                                                                <Text color={appcolor.teks[mode][3]}>
                                                                    { 'Klik disini untuk membuat penjelasan detail tugas' }
                                                                </Text>
                                                            }
                                                        </TouchableOpacity>
                                                    </VStack>
                                                </VStack>
                                            )
                                        })
                                    }
                                </>
                            }
                                
                            </VStack>
                        </VStack>
                    </ScrollView>
                    <HStack space={2}>
                        <Button 
                            flex={3} 
                            onPress={saveDataHandle}
                            colorScheme={'darkBlue'}>
                            Kirim Penugasan
                        </Button>
                        <Button 
                            flex={1} 
                            onPress={tambahItemHandle}
                            colorScheme={'warning'}>
                            Tambah
                        </Button>
                    </HStack>
                </VStack>
                {/* COMPONENT OPTIONS */}
                {
                    layerOpt.date_task &&
                    <DatePicker
                        modal
                        title={'Tanggal Tugas'}
                        mode={"date"}
                        locale={"ID"}
                        open={layerOpt.date_task}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => onPickDatetimeHandle(date, 'date_task')}
                        onCancel={() => {
                            setLayerOpt({...layerOpt, date_task: false})
                        }}
                    />
                }
                {
                    layerOpt.karyawan &&
                    <SheetKaryawan 
                        isOpen={layerOpt.karyawan} 
                        onClose={() => openLayerOption('karyawan')} 
                        onSelected={onSelectedKaryawan}/>
                }
                {
                    layerOpt.shift &&
                    <SheetShift 
                        isOpen={layerOpt.shift} 
                        onClose={() => openLayerOption('shift')} 
                        onSelected={onSelectedShift}/>
                }
                {
                    layerOpt.start_time &&
                    <DatePicker
                        modal
                        mode={"datetime"}
                        title={'Waktu Mulai Tugas'}
                        locale={"ID"}
                        open={layerOpt.start_time}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => onPickDatetimeHandle(date, 'start_time')}
                        onCancel={() => {
                            setLayerOpt({...layerOpt, start_time: false})
                        }}
                    />
                }
                {
                    layerOpt.finish_time &&
                    <DatePicker
                        modal
                        mode={"datetime"}
                        title={'Deadline Tugas'}
                        locale={"ID"}
                        open={layerOpt.finish_time}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => onPickDatetimeHandle(date, 'finish_time')}
                        onCancel={() => {
                            setLayerOpt({...layerOpt, finish_time: false})
                        }}
                    />
                }
                {
                    layerOpt.narasi &&
                    <SheetInputTeks 
                        isOpen={layerOpt.narasi} 
                        onClose={() => openLayerOption('narasi')} 
                        onSelected={onSubmitInputHandle}/>
                }
            </VStack>
        </AppScreen>
    )
}

export default CreateTugasKaryawan