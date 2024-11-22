import moment from 'moment'
import { nanoid } from '@reduxjs/toolkit'
import { ScrollView, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { Button, HStack, VStack, Text, Image, Center } from 'native-base'
import { MYIMAGEBG } from '../../../assets/images'
import HeaderScreen from '../../components/HeaderScreen'
import { ArrowRight2, Barcode, Calendar1, CloseSquare, TagUser, Trash } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-native-date-picker'
import SheetPenyewa from '../../components/SheetPenyewa'
import SheetShift from '../../components/SheetShift'
import SheetLokasiPit from '../../components/SheetLokasiPit'
import SheetEquipment from '../../components/SheetEquipment'
import SheetKaryawan from '../../components/SheetKaryawan'
import SheetKegiatanEquipment from '../../components/SheetKegiatanEquipment'
import apiFetch from '../../helpers/ApiFetch'
import LoadingHauler from '../../components/LoadingHauler'
import { applyAlert } from '../../redux/alertSlice'
import { useNavigation, useRoute } from '@react-navigation/native'
import AlertConfirmation from '../../components/AlertConfirmation'

const ShowTugasEquipment = () => {
    const { params } = useRoute()
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [itemreff, setItemreff] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [ openConfirm, setOpenConfirm] = useState(false)
    const [ layerOpt, setLayerOpt ] = useState({
        date_task: false,
        penyewa: false,
        shift: false,
        lokasi: false,
        starttask: false,
        finishtask: false,
        karyawan: false,
        equipment: false,
        kegiatan: false
    })
    const [ state, setState ] = useState(params)
    

    useMemo(async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.get('penugasan/'+params.id+'/show')
            console.log(resp);
            setState(resp.data)
            setRefresh(false)
        } catch (error) {
            console.log(error);
            setRefresh(false)
        }

    }, [])

    const tambahItemHandle = () => {
        let iditem = nanoid()
        let items = state.items
        let urut = '0'.repeat(2 - `${items.length + 1}`.length) + `${items.length + 1}`
        items.push({
            id: iditem,
            urut: urut,
            equipment: null,
            karyawan: null,
            kegiatan: null
        })
        setState({...state, items: items})
    }

    const hapusItemHandle = (obj) => {
        if(obj.task_id){
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Error Hapus Item',
                subtitle: 'Fitur henghapus per item tugas blum tersedia\n\n'+
                'Anda hanya dapat menghapus item yang baru anda tambahkan. '+
                'Lakukan penghapusan dokumen penugasan utk melakukan penugasan ulang dengan item yang baru'
            }))
            return
        }else{
            let items = state.items
            items = items.filter( f => f.id != obj.id)
            setState({...state, items: items.map((m,i) => {
                let urut = '0'.repeat(2 - `${i + 1}`.length) + `${i + 1}`
                return {...m, urut: urut}
            })})
        }
    }

    const openLayerOption = (value, reff) => {
        if(reff){
            setItemreff(reff)
            setLayerOpt({...layerOpt, [value]: !layerOpt[value]})
        }else{
            setLayerOpt({...layerOpt, [value]: !layerOpt[value]})
        }
    }

    const onPickDatetimeHandle = (obj, value) => {
        var items = state.items?.map( m => m.id === itemreff ? {...m, [value]: obj}:m)
        setState({...state, items: items})
    }

    const onSelectedLokasi = (obj) => {
        // console.log(obj);
        var items = state.items?.map( m => m.id === itemreff ? {...m, lokasi: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, lokasi: false})
    }

    const onSelectedPenyewa = (obj, value) => {
        var items = state.items?.map( m => m.id === itemreff ? {...m, penyewa: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, penyewa: false})
    }

    const onSelectedEquipment = (obj) => {
        var items = state.items?.map( m => m.id === itemreff ? {...m, equipment: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, equipment: false})
    }

    const onSelectedKaryawan = (obj) => {
        var items = state.items?.map( m => m.id === itemreff ? {...m, karyawan: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, karyawan: false})
    }

    const onSelectedKegiatan = (obj) => {
        var items = state.items?.map( m => m.id === itemreff ? {...m, kegiatan: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, kegiatan: false})
    }

    const onSelectedShift = (obj) => {
        var items = state.items?.map( m => m.id === itemreff ? {...m, shift: obj}:m)
        setState({...state, items: items})
        setLayerOpt({...layerOpt, shift: false})
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
            alert('Tanggal penugasan blum ditentukan...')
            return
        }
        
        if(!state.items.length > 0){
            alert('Item tugas blum ditentukan...\n\nGunakan tombol tambah untuk menambahkan item')
            return
        }

        for (const elm of state.items) {
            if(!elm.penyewa){
                alert('Penyewa pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }

            if(!elm.equipment){
                alert('Equipment pada urut ke-' +elm.urut+ '\nBlum ditentukan...')
                return
            }
            if(!elm.lokasi){
                alert('Lokasi  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
            if(!elm.kegiatan){
                alert('Kegiatan pada urut ke-' +elm.urut+ '\nBlum ditentukan...')
                return
            }
            if(elm.equipment.kategori != elm.kegiatan.type){
                alert(
                    elm.equipment.kode
                    +'\nuntuk kegiatan\n'
                    +elm.kegiatan.nama
                    +'\npada urut ke-' +elm.urut
                    + '\nTidak sesuai...\n\n\nGunakan Kegiatan sesuai equipmentnya !!!')
                return
            }
            if(!elm.starttask){
                alert('Waktu mulai tugas  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
            if(!elm.finishtask){
                alert('Waktu selesai tugas  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
            if(!elm.shift){
                alert('Shift kerja tugas  pada urut ke-' +elm.urut+ '\nblum ditentukan...')
                return
            }
        }

        const data = {
            date_task: moment(state.date_task).format('YYYY-MM-DD'),
            items: state.items.map( m => {
                return {
                    id: m.id,
                    urut: m.urut,
                    penyewa_id: m.penyewa.id,
                    equipment_id: m.equipment.id,
                    kegiatan_id: m.kegiatan.id,
                    lokasi_id: m.lokasi.id,
                    shift_id: m.shift.id,
                    starttask: moment(m.starttask).format('YYYY-MM-DD HH:mm'),
                    finishtask: moment(m.finishtask).format('YYYY-MM-DD HH:mm'),
                }
            })
        }

        // console.log(data);
        setRefresh(true)
        try {
            const resp = await apiFetch.post('penugasan-equipment/' + params.id + '/update', data)
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
                                    Operator/Driver :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins'}>
                                    { state.nmassigned }
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
                        </HStack>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                state.items.map( item => {
                                    return(
                                        <VStack key={item.id} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
                                            <HStack mt={2} w={'full'} justifyContent={'space-between'} alignItems={'center'}>
                                                <TouchableOpacity onPress={() => openLayerOption('penyewa', item.id)}>
                                                    {
                                                        item.penyewa ?
                                                        <Text 
                                                            lineHeight={'xs'}
                                                            color={appcolor.teks[mode][6]}
                                                            fontSize={18}
                                                            fontWeight={'bold'}
                                                            fontFamily={'Poppins'}>
                                                            { item.penyewa?.nama || '???' }
                                                        </Text>
                                                        :
                                                        <Text 
                                                            lineHeight={'xs'}
                                                            color={appcolor.teks[mode][1]}
                                                            fontSize={18}
                                                            fontWeight={'bold'}
                                                            fontFamily={'Poppins'}>
                                                            { 'Pilih Penyewa...' }
                                                        </Text>
                                                    }
                                                </TouchableOpacity>
                                                <ArrowRight2 size="15" color={appcolor.teks[mode][2]} variant="Outline"/>
                                            </HStack>
                                            <HStack my={2} space={2}>
                                                <Center borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'lg'}>
                                                    <Text 
                                                        lineHeight={'xs'}
                                                        color={appcolor.teks[mode][1]}
                                                        fontSize={26}
                                                        fontWeight={'black'}
                                                        fontFamily={'Dosis'}>
                                                        { item.urut }
                                                    </Text>
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
                                                {/* PILIH EQUIPMENT */}
                                                <VStack flex={1}>
                                                    <HStack h={'40px'} w={'full'} alignItems={'center'} justifyContent={'space-between'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                                        <TouchableOpacity onPress={() => openLayerOption('equipment', item.id)}>
                                                            <Text 
                                                                lineHeight={'xs'}
                                                                color={appcolor.teks[mode][1]}
                                                                fontSize={20}
                                                                fontWeight={item.equipment?'bold':'light'}
                                                                fontFamily={'Dosis'}>
                                                                { item.equipment?.kode || 'Equipment' }
                                                            </Text>
                                                            <Text 
                                                                lineHeight={'xs'}
                                                                color={appcolor.teks[mode][3]}
                                                                fontFamily={'Abel-Regular'}>
                                                                { item.equipment?.manufaktur || 'Group' }
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <ArrowRight2 size="15" color={appcolor.teks[mode][2]} variant="Outline"/>
                                                    </HStack>
                                                    
                                                    <HStack py={1} w={'full'} alignItems={'center'} justifyContent={'space-between'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                                        <TouchableOpacity onPress={() => openLayerOption('lokasi', item.id)}>
                                                            {
                                                                item.lokasi ?
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={16}
                                                                    fontWeight={'semibold'}
                                                                    fontFamily={'Dosis'}>
                                                                    LOKASI { item.lokasi?.nama }
                                                                </Text>
                                                                :
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={16}
                                                                    fontFamily={'Dosis'}>
                                                                    { 'PILIH LOKASI...' }
                                                                </Text>
                                                            }
                                                        </TouchableOpacity>
                                                        <ArrowRight2 size="15" color={appcolor.teks[mode][2]} variant="Outline"/>
                                                    </HStack>

                                                    <HStack py={1} w={'full'} alignItems={'center'} justifyContent={'space-between'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                                        <TouchableOpacity onPress={() => openLayerOption('kegiatan', item.id)}>
                                                            {
                                                                item.kegiatan ?
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={16}
                                                                    fontWeight={'semibold'}
                                                                    fontFamily={'Dosis'}>
                                                                    { item.kegiatan?.nama }
                                                                </Text>
                                                                :
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={16}
                                                                    fontFamily={'Dosis'}>
                                                                    { 'PILIH KEGIATAN...' }
                                                                </Text>
                                                            }
                                                        </TouchableOpacity>
                                                        <ArrowRight2 size="15" color={appcolor.teks[mode][2]} variant="Outline"/>
                                                    </HStack>
                                                    <HStack space={2} w={'full'}>
                                                        <HStack pt={2} w={'1/3'}>
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
                                                                            fontSize={18}
                                                                            fontWeight={'bold'}
                                                                            fontFamily={'Dosis'}>
                                                                            { moment(item.starttask).format('HH:mm') }
                                                                        </Text>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={14}
                                                                            fontFamily={'Farsan-Regular'}>
                                                                            { moment(item.starttask).format('dddd, DD MMM') }
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
                                                        </HStack>
                                                        <HStack pt={2} w={'1/3'}>
                                                            <TouchableOpacity onPress={() => openLayerOption('finishtask', item.id)}>
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={12}
                                                                    fontFamily={'Abel-Regular'}>
                                                                    { 'Finish Tugas :' }
                                                                </Text>
                                                                {
                                                                    item.finishtask ?
                                                                    <VStack>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={18}
                                                                            fontWeight={'bold'}
                                                                            fontFamily={'Dosis'}>
                                                                            { moment(item.finishtask).format('HH:mm') }
                                                                        </Text>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={14}
                                                                            fontFamily={'Farsan-Regular'}>
                                                                            { moment(item.finishtask).format('dddd, DD MMM') }
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
                                                        </HStack>
                                                        <HStack pt={2} w={'1/3'}>
                                                            <TouchableOpacity onPress={() => openLayerOption('shift', item.id)}>
                                                                <Text 
                                                                    lineHeight={'xs'}
                                                                    color={appcolor.teks[mode][1]}
                                                                    fontSize={12}
                                                                    fontFamily={'Abel-Regular'}>
                                                                    { 'Shift Kerja :' }
                                                                </Text>
                                                                {
                                                                    item.shift ?
                                                                    <VStack>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={18}
                                                                            fontWeight={'bold'}
                                                                            fontFamily={'Dosis'}>
                                                                            { item.shift.nama }
                                                                        </Text>
                                                                        <Text 
                                                                            lineHeight={'xs'}
                                                                            color={appcolor.teks[mode][1]}
                                                                            fontSize={14}
                                                                            fontFamily={'Farsan-Regular'}>
                                                                            { item.shift.id === 1 ? 'Siang':'Malam' }
                                                                        </Text>
                                                                    </VStack>
                                                                    :
                                                                    <Text 
                                                                        lineHeight={'xs'}
                                                                        color={appcolor.teks[mode][1]}
                                                                        fontSize={18}
                                                                        fontWeight={'bold'}
                                                                        fontFamily={'Dosis'}>
                                                                        { '???' }
                                                                    </Text>
                                                                }
                                                            </TouchableOpacity>
                                                        </HStack>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
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
                    layerOpt.penyewa &&
                    <SheetPenyewa 
                        isOpen={layerOpt.penyewa} 
                        onClose={() => openLayerOption('penyewa')} 
                        onSelected={onSelectedPenyewa}/>
                }
                {
                    layerOpt.lokasi &&
                    <SheetLokasiPit 
                        isOpen={layerOpt.lokasi} 
                        onClose={() => openLayerOption('lokasi')} 
                        onSelected={onSelectedLokasi}/>
                }
                {
                    layerOpt.equipment &&
                    <SheetEquipment 
                        reff={itemreff}
                        isOpen={layerOpt.equipment} 
                        onClose={() => openLayerOption('equipment')} 
                        onSelected={onSelectedEquipment}/>
                }
                {
                    layerOpt.karyawan &&
                    <SheetKaryawan 
                        isoperator
                        isOpen={layerOpt.karyawan} 
                        onClose={() => openLayerOption('karyawan')} 
                        onSelected={onSelectedKaryawan}/>
                }
                {
                    layerOpt.kegiatan &&
                    <SheetKegiatanEquipment 
                        reff={itemreff}
                        isOpen={layerOpt.kegiatan} 
                        onClose={() => openLayerOption('kegiatan')} 
                        onSelected={onSelectedKegiatan}/>
                }
            </VStack>
        </AppScreen>
    )
}

export default ShowTugasEquipment