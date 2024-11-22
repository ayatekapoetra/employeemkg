import { nanoid } from '@reduxjs/toolkit'
import { ScrollView, TouchableOpacity, Linking, Alert, Platform, NativeModules } from 'react-native'
import React, { useMemo, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Button, Center, Image } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import AlertConfirmation from '../../components/AlertConfirmation'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Barcode, Calendar1, CloseSquare, Dislike, LampCharge, LampSlash, Message, TagUser, Trash } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'
import apiFetch from '../../helpers/ApiFetch'
import { ICOFILE, MYIMAGEBG } from '../../../assets/images'
import LoadingHauler from '../../components/LoadingHauler'
import { URIPATH } from '../../helpers/UriPath'
import SheetInputTeks from '../../components/SheetInputTeks'
import SheetShift from '../../components/SheetShift'
import { applyAlert } from '../../redux/alertSlice'
import TeksLink from '../../components/TeksLink'

const ShowTugasKaryawan = () => {
    const { params } = useRoute()
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ openConfirm, setOpenConfirm] = useState(false)
    const [activeRef, setActiveRef] = useState(null);
    const [refresh, setRefresh] = useState(false)
    const [ state, setState] = useState(params)
    const [ layerOpt, setLayerOpt ] = useState({
        date_task: false,
        shift: false,
        starttask: false,
        finishtask: false,
        narasi: false
    })

    useMemo(async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.get('penugasan/'+params.id+'/show')
            // console.log('resp----', resp);
            setState(resp.data)
            setRefresh(false)
        } catch (error) {
            console.log(error);
            setRefresh(false)
        }

    }, [])

    const openLayerOption = (value, reff) => {
        if(reff){
            setActiveRef(reff)
            setLayerOpt({...layerOpt, [value]: !layerOpt[value]})
        }else{
            setLayerOpt({...layerOpt, [value]: !layerOpt[value]})
        }
    }

    const onPickDatetimeHandle = (obj, value) => {
        var items = state.items?.map( m => m.id === activeRef ? {...m, [value]: obj}:m)
        setState({...state, items: items})
    }

    const onSelectedShift = (obj, value) => {
        var items = state.items?.map( m => m.id === activeRef ? {...m, shift: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, shift: false})
    }

    const onSubmitInputHandle = (teks) => {
        var items = state.items?.map( m => m.id === activeRef ? {...m, narasitask: teks}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, narasi: false})
    }

    const tambahItemHandle = () => {
        let iditem = nanoid()
        let items = state.items
        let urut = '0'.repeat(2 - `${items.length + 1}`.length) + `${items.length + 1}`
        items.push({
            id: iditem,
            urut: urut,
            narasi: ''
        })
        setState({...state, items: items})
    }

    const hapusItemHandle = (obj) => {
        let items = state.items
            items = items.filter( f => f.id != obj.id)
            setState({...state, items: items.map((m,i) => {
                let urut = '0'.repeat(2 - `${i + 1}`.length) + `${i + 1}`
                return {...m, urut: urut}
            })})
    }

    const linkAttachmentHandle = async () => {
        const uri = URIPATH.apiphoto + state.attach_url
        if (Platform.OS === 'android') {
            NativeModules.AndroidURL.openURL(uri);
        }else{
            try {
                // Cek apakah URL bisa dibuka
                const supported = await Linking.canOpenURL(uri);
          
                if (supported) {
                  await Linking.openURL(uri);
                } else {
                  Alert.alert('Error', `Tidak bisa membuka URL: ${uri}`);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    const confirmationRemoveHandle = () => {
        setOpenConfirm(true)
    }

    const removeDataHandle = async () => {
        try {
            const resp = await apiFetch.post('penugasan/' + params.id + '/destroy')
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Hapus Tugas',
                    subtitle: 'Anda berhasil menghapus penugasan...'
                }))
                route.navigate('Penugasan-Kerja')
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: 'error',
                    title: 'Hapus Tugas',
                    subtitle: 'Terjadi kesalahan dalam pengiriman data ke server...'
                }))
            }
            
        } catch (error) {
            console.log(error);
            setOpenConfirm(false)
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Gagal Menghapus Tugas',
                subtitle: error?.response?.data?.diagnostic?.message||'Error api...'
            }))
        }
    }

    const saveDataHandle = async () => {
        // console.log(state);
        if(!state.date_task){
            Alert.alert('Peringatan', 'Tanggal penugasan blum ditentukan...')
            return
        }
        
        if(!state.items.length > 0){
            Alert.alert('Peringatan', 'Item tugas blum ditentukan...\n\nGunakan tombol tambah untuk menambahkan item')
            return
        }

        for (const elm of state.items) {
            if(!elm.starttask){
                Alert.alert('Peringatan', 'Waktu mulai tugas  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
            if(!elm.finishtask){
                Alert.alert('Peringatan', 'Waktu selesai tugas  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
            if(!elm.shift){
                Alert.alert('Peringatan', 'Shift kerja tugas  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
        }

        const data = {
            date_task: moment(state.date_task).format('YYYY-MM-DD'),
            items: state.items.map( m => {
                return {
                    id: m.id,
                    urut: m.urut,
                    narasitask: m.narasitask,
                    shift_id: m.shift.id,
                    starttask: moment(m.starttask).format('YYYY-MM-DD HH:mm'),
                    finishtask: moment(m.finishtask).format('YYYY-MM-DD HH:mm'),
                }
            })
        }

        // console.log(data);
        setRefresh(true)
        try {
            const resp = await apiFetch.post('penugasan-karyawan/' + params.id + '/update', data)
            console.log(resp);
            setRefresh(false)
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Tugas terupdate',
                    subtitle: 'Anda berhasil melakukan update penugasan...'
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
            setRefresh(false)
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Server Gagal Update',
                subtitle: error?.response?.data?.diagnostic?.message||'Error api...'
            }))
        }
        
    }

    if(state.attach_url){
        var ext = ((state.attach_url).split('.'))?.pop()
        ext = ext.toLowerCase()
        console.log(ext);
        var iconFile = <Image alt='icon' source={ICOFILE[ext]} style={{width: 30, height: 30}}/>
    }

    console.log(state);

    if(refresh){
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Detail Penugasan"} onBack={true} onThemes={true} onNotification={true}/>
                <LoadingHauler/>
            </VStack>
        </AppScreen>
    }
    
    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Detail Penugasan"} onBack={true} onThemes={true} onNotification={true}/>
                <AlertConfirmation
                    isOpen={openConfirm}
                    txtConfirm={'Hapus'}
                    title={"Hapus Data Penugasan"}
                    subtitle={"Apakah anda yakin akan menghapus penugasan ini ?"}
                    onClose={() => setOpenConfirm(false)} 
                    onAction={removeDataHandle}/>
                <VStack px={3} flex={1}>
                    <VStack flex={1}>
                        {/*  */}
                        <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                            <Barcode size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Abel-Regular'}>
                                    Kode :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins'}>
                                    { state.kode }
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
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
                                    { state.nmassigned }
                                </Text>
                                <Text 
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][3]}
                                    fontFamily={'Abel-Regular'}>
                                    { state.assigned?.section }
                                </Text>
                            </VStack>
                        </HStack>
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
                            <TouchableOpacity onPress={linkAttachmentHandle}>
                                {iconFile}
                            </TouchableOpacity>
                        </HStack>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                state.reject_msg &&
                                <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Dislike size="32" color={appcolor.teks[mode][5]} variant="Outline"/>
                                    <VStack flex={1}>
                                        <Text 
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            color={appcolor.teks[mode][5]}
                                            fontFamily={'Poppins'}>
                                            Alasan Penolakan Tugas :
                                        </Text>
                                        <Text 
                                            fontSize={14}
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Poppins'}>
                                            { state.reject_msg }
                                        </Text>
                                    </VStack>
                                </HStack>
                            }
                            {
                                state.items.map( item => {
                                    
                                    return(
                                        <VStack key={item.id} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                                            <HStack my={2} space={2}>
                                                <Center maxH={'175px'} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'lg'}>
                                                    <Image 
                                                        source={MYIMAGEBG.engeneerIllustration} 
                                                        resizeMode='cover' 
                                                        alt="..." 
                                                        rounded={'lg'} 
                                                        style={{height: 100, width: 80}}/>
                                                    <HStack 
                                                        w={'full'} 
                                                        space={1} 
                                                        justifyContent={'center'} 
                                                        alignItems={'center'} 
                                                        position={'absolute'} 
                                                        bottom={0} 
                                                        roundedBottom={'lg'}>
                                                        <Button onPress={() => hapusItemHandle(item)} bg={'amber.100'} h={'7'} roundedBottom={'lg'} roundedTop={'none'}>
                                                            <HStack alignItems={'center'} space={1}>
                                                                <CloseSquare size="15" color={appcolor.teks[mode][5]} variant="Bold"/>
                                                                <Text 
                                                                    mt={-1}
                                                                    fontWeight={'semibold'}
                                                                    color={appcolor.teks[mode][5]}
                                                                    fontFamily={'Poppins'}>
                                                                    Hapus
                                                                </Text>
                                                            </HStack>
                                                        </Button>
                                                    </HStack>
                                                </Center>
                                                
                                                <VStack flex={1}>
                                                    <HStack space={2}>
                                                        <VStack p={2} flex={1} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                                            <TouchableOpacity onPress={() => openLayerOption('starttask', item.id)}>
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={12}
                                                                    fontFamily={'Abel-Regular'}>
                                                                    { 'Mulai Tugas :' }
                                                                </Text>
                                                                {
                                                                    item.starttask ?
                                                                    <VStack>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={24}
                                                                            fontWeight={'bold'}
                                                                            fontFamily={'Dosis'}>
                                                                            { moment(item.starttask).format('HH:mm') }
                                                                        </Text>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={14}
                                                                            fontFamily={'Farsan-Regular'}>
                                                                            { moment(item.starttask).format('dddd, DD MMMM') }
                                                                        </Text>
                                                                    </VStack>
                                                                    :
                                                                    <Text 
                                                                        lineHeight={'xs'}
                                                                        color={appcolor.teks[mode][1]}
                                                                        fontSize={18}
                                                                        fontWeight={'bold'}
                                                                        fontFamily={'Dosis'}>
                                                                        { '--:--' }
                                                                    </Text>
                                                                }
                                                            </TouchableOpacity>
                                                        </VStack>
                                                        <VStack p={2} flex={1} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                                            <TouchableOpacity onPress={() => openLayerOption('finishtask', item.id)}>
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={12}
                                                                    fontFamily={'Abel-Regular'}>
                                                                    { 'Deadline Tugas :' }
                                                                </Text>
                                                                {
                                                                    item.finishtask ?
                                                                    <VStack>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={24}
                                                                            fontWeight={'bold'}
                                                                            fontFamily={'Dosis'}>
                                                                            { moment(item.finishtask).format('HH:mm') }
                                                                        </Text>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={14}
                                                                            fontFamily={'Farsan-Regular'}>
                                                                            { moment(item.finishtask).format('dddd, DD MMMM') }
                                                                        </Text>
                                                                    </VStack>
                                                                    :
                                                                    <Text 
                                                                        lineHeight={'xs'}
                                                                        color={appcolor.teks[mode][1]}
                                                                        fontSize={18}
                                                                        fontWeight={'bold'}
                                                                        fontFamily={'Dosis'}>
                                                                        { '--:--' }
                                                                    </Text>
                                                                }
                                                            </TouchableOpacity>
                                                        </VStack>
                                                    </HStack>
                                                    <TouchableOpacity onPress={() => openLayerOption('shift', item.id)}>
                                                        <HStack space={1} mt={2} p={1} alignItems={'center'} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'sm'}>
                                                            {
                                                                item.shift?.id == 1 ?
                                                                <LampSlash size="22" color={appcolor.teks[mode][1]} variant="Bold"/>
                                                                :
                                                                <LampCharge size="22" color={appcolor.teks[mode][3]} variant="Bold"/>
                                                            }
                                                            <Text fontFamily={'Poppins'} color={appcolor.teks[mode][1]}>
                                                                Jadwal {item.shift?.nama || '???'}
                                                            </Text>
                                                        </HStack>
                                                    </TouchableOpacity>
                                                </VStack>
                                            </HStack>
                                            <VStack>
                                                <TouchableOpacity onPress={() => openLayerOption('narasi', item.id)}>
                                                    <HStack h={'30px'} justifyContent={'space-between'} alignItems={'center'}>
                                                        <Text 
                                                            fontFamily={'Poppins'}
                                                            fontWeight={'bold'}
                                                            color={appcolor.teks[mode][7]}>
                                                            { item.urut }. Penjelasan Tugas :
                                                        </Text>
                                                        <Message size="22" color={appcolor.teks[mode][1]} variant="Bold"/>
                                                    </HStack>
                                                </TouchableOpacity>
                                            </VStack>
                                            <TeksLink fontFamily={'Quicksand'} color={appcolor.teks[mode][1]} teks={item.narasitask}/>
                                            
                                        </VStack>
                                    )
                                })
                            }
                        </ScrollView>
                    </VStack>
                    <HStack space={2}>
                        <Button 
                            onPress={confirmationRemoveHandle}
                            colorScheme={'danger'}>
                            <Trash size="22" color={"#FFF"} variant="Outline"/>
                        </Button>
                        <Button 
                            flex={3} 
                            onPress={saveDataHandle}
                            colorScheme={'darkBlue'}>
                            Update Penugasan
                        </Button>
                        {
                            !state.reject_msg && !['reject', 'done'].includes(state.status)  &&
                            <Button 
                                flex={1} 
                                onPress={tambahItemHandle}
                                colorScheme={'warning'}>
                                Tambah
                            </Button>
                        }
                    </HStack>
                </VStack>
                {
                    layerOpt.starttask &&
                    <DatePicker
                        modal
                        mode={"datetime"}
                        title={'Waktu Mulai Tugas'}
                        locale={"ID"}
                        open={layerOpt.starttask}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => onPickDatetimeHandle(date, 'starttask')}
                        onCancel={() => {
                            setLayerOpt({...layerOpt, starttask: false})
                        }}
                    />
                }
                {
                    layerOpt.finishtask &&
                    <DatePicker
                        modal
                        mode={"datetime"}
                        title={'Waktu Selesai Tugas'}
                        locale={"ID"}
                        open={layerOpt.finishtask}
                        date={new Date()}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => onPickDatetimeHandle(date, 'finishtask')}
                        onCancel={() => {
                            setLayerOpt({...layerOpt, finishtask: false})
                        }}
                    />
                }
                {
                    layerOpt.shift &&
                    <SheetShift 
                        isOpen={layerOpt.shift} 
                        onClose={() => openLayerOption('shift')} 
                        onSelected={onSelectedShift}/>
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

export default ShowTugasKaryawan