import moment from 'moment'
import { nanoid } from '@reduxjs/toolkit'
import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { Button, HStack, VStack, Text, Image, FlatList, Center } from 'native-base'
import { MYIMAGEBG } from '../../../assets/images'
import HeaderScreen from '../../components/HeaderScreen'
import { AlignVertically, Android, ArrowRight2, Calendar1, Courthouse, Trash, TruckTime, Watch, WristClock } from 'iconsax-react-native'
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
import { useNavigation } from '@react-navigation/native'
import SheetCabangRoles from '../../components/SheetCabangRoles'
import useGroupingActions from '../../hook/OpsRoles'



const CreateTugasEquipment = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { grouping, ungrouping } = useGroupingActions()
    const [itemreff, setItemreff] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [ layerOpt, setLayerOpt ] = useState({
        cabang: false,
        date_task: false,
        penyewa: false,
        shift: false,
        lokasi: false,
        start_time: false,
        finish_time: false,
        karyawan: false,
        equipment: false,
        kegiatan: false
    })
    const [ state, setState ] = useState({
        date_task: new Date(),
        cabang: null,
        penyewa: null,
        shift: null,
        lokasi: null,
        start_time: null,
        finish_time: null,
        items: []
    })
    

    const tambahItemHandle = () => {
        let iditem = nanoid()
        let items = state.items
        items.push({
            id: iditem,
            urut: items.length + 1,
            equipment: null,
            karyawan: null,
            kegiatan: null
        })
        setState({...state, items: items})
    }

    const hapusItemHandle = (obj) => {
        let items = state.items
        items = items.filter( f => f.id != obj.id)
        setState({...state, items: items.map((m,i) => ({...m, urut: i + 1}))})
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
        setState({...state, [value]: obj})
    }

    const saveDataHandle = async () => {
        console.log(state);
        if(!state.date_task){
            alert('Tanggal penugasan blum ditentukan...')
            return
        }
        if(!state.penyewa){
            alert('Penyewa blum ditentukan...')
            return
        }
        if(!state.shift){
            alert('Shift blum ditentukan...')
            return
        }
        if(!state.lokasi){
            alert('Lokasi blum ditentukan...')
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
        if(!state.items.length > 0){
            alert('Item tugas blum ditentukan...\n\nGunakan tombol tambah untuk menambahkan item')
            return
        }

        for (const elm of state.items) {

            if(!elm.equipment){
                alert('Equipment pada urut ke-' +elm.urut+ '\nBlum ditentukan...')
                return
            }
            if(!elm.karyawan){
                alert('Operator atau Driver pada urut ke-' +elm.urut+ '\nBlum ditentukan...')
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
        }

        const data = {
            date_task: moment(state.date_task).format('YYYY-MM-DD'),
            start_time: moment(state.start_time).format('YYYY-MM-DD HH:mm'),
            finish_time: moment(state.finish_time).format('YYYY-MM-DD HH:mm'),
            penyewa_id: state.penyewa.id,
            shift_id: state.shift.id,
            lokasi_id: state.lokasi.id,
            items: state.items.map( m => {
                return {
                    id: m.id,
                    urut: m.urut,
                    equipment_id: m.equipment.id,
                    karyawan_id: m.karyawan.id,
                    kegiatan_id: m.kegiatan.id
                }
            })
        }

        setRefresh(true)
        try {
            const resp = await apiFetch.post('penugasan-equipment', data)
            console.log(resp);
            setRefresh(false)
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
            setRefresh(false)
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Gagal terkirim',
                subtitle: error?.response?.data?.diagnostic?.message||'Error api...'
            }))
        }
        
    }

    const onSelectedCabangRole = (obj) => {
        grouping('cabang', obj)
        setState({...state, cabang: {id: obj.key, nama: obj.cabang}})
        setLayerOpt({...layerOpt, cabang: false})
    }

    const onSelectedPenyewa = (obj) => {
        // grouping('lokasi', obj)
        setState({...state, penyewa: obj})
        setLayerOpt({...layerOpt, penyewa: false})
    }

    const onSelectedShift = (obj) => {
        setState({...state, shift: obj})
        setLayerOpt({...layerOpt, shift: false})
    }

    const onSelectedLokasi = (obj) => {
        setState({...state, lokasi: obj})
        setLayerOpt({...layerOpt, lokasi: false})
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

    console.log(state);

    if(refresh){
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Penugasan Kerja Equipment"} onBack={true} onThemes={true} onNotification={true}/>
                <LoadingHauler/>
            </VStack>
        </AppScreen>
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Penugasan Kerja Equipment"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
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
                        <TouchableOpacity onPress={() => openLayerOption('penyewa')}>
                            <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                <Android size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][1]}
                                        fontFamily={'Abel-Regular'}>
                                        Penyewa :
                                    </Text>
                                    <Text 
                                        fontSize={16}
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][1]}
                                        fontFamily={'Poppins'}>
                                        { state?.penyewa?.nama || '???' }
                                    </Text>
                                </VStack>
                                <ArrowRight2 size="15" color={appcolor.teks[mode][2]} variant="Outline"/>
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
                            <TouchableOpacity onPress={() => openLayerOption('lokasi')} style={{flex: 1, flexWrap: 'nowrap'}}>
                                <HStack h={'70px'} py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <AlignVertically size="32" color={appcolor.teks[mode][2]} variant="Outline"/>
                                    <VStack flex={1}>
                                        <Text 
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Abel-Regular'}>
                                            Lokasi Kerja :
                                        </Text>
                                        <Text 
                                            fontSize={16}
                                            lineHeight={'xs'}
                                            color={appcolor.teks[mode][1]}
                                            fontFamily={'Poppins'}>
                                            { state?.lokasi?.nama || '???' }
                                        </Text>
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
                                            Mulai Kerja :
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
                                            Finish Kerja :
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

                        {/* DETAIL PENUGASAN */}
                        <VStack mt={2} flex={1}>
                            {
                                state.items.length > 0 ?
                                <FlatList 
                                    data={state.items}
                                    renderItem={ ( { item } ) => {
                                        return (
                                            <HStack my={2} pb={2} space={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                                <VStack position={'relative'} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'lg'}>
                                                    <Center h={5} w={5} bg={'success.500'} rounded={'full'} position={'absolute'} right={'30px'} top={'-10px'}>
                                                        <Text color={'#FFF'}>{item.urut}</Text>
                                                    </Center>
                                                    <Image 
                                                        source={MYIMAGEBG.engeneerIllustration} 
                                                        resizeMode='contain' 
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
                                                                <Trash size="15" color={appcolor.teks[mode][5]} variant="Bold"/>
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
                                                </VStack>
                                                <VStack flex={1}>
                                                    {/* PILIH KARYAWAN */}
                                                    <HStack mt={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                                        <TouchableOpacity onPress={() => openLayerOption('karyawan', item.id)} style={{flex: 1}}>
                                                            <Text 
                                                                lineHeight={'xs'}
                                                                color={appcolor.teks[mode][1]}
                                                                fontSize={12}
                                                                fontFamily={'Abel-Regular'}>
                                                                { 'Operator/Driver :' }
                                                            </Text>
                                                            <Text 
                                                                lineHeight={'xs'}
                                                                color={appcolor.teks[mode][1]}
                                                                fontSize={20}
                                                                fontWeight={item.karyawan?'bold':'light'}
                                                                fontFamily={'Dosis'}>
                                                                { item.karyawan?.nama || 'Nama Operator/Driver ???' }
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </HStack>
                                                    {/* PILIH EQUIPMENT */}
                                                    <HStack borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
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
                                                                color={appcolor.teks[mode][1]}
                                                                fontFamily={'Abel-Regular'}>
                                                                { item.equipment?.manufaktur || 'Group' }
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </HStack>
                                                    
                                                    {/* PILIH KEGIATAN KERJA */}
                                                    <HStack mt={2} space={1} alignItems={'center'}>
                                                        <TruckTime size="22" color={appcolor.teks[mode][3]} variant="Outline"/>
                                                        <TouchableOpacity onPress={() => openLayerOption('kegiatan', item.id)} style={{flex: 1}}>
                                                            <Text 
                                                                flex={1}
                                                                lineHeight={'xs'}
                                                                color={appcolor.teks[mode][1]}
                                                                fontSize={16}
                                                                fontWeight={item.kegiatan?'semibold':'light'}
                                                                fontFamily={'Poppins'}>
                                                                { item.kegiatan?.nama || 'Kegiatan Kerja ???' }
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        )
                                    } }
                                    keyExtractor={ i => i.id}/>
                                :
                                <Center mx={8} flex={1}>
                                    <Text 
                                        textAlign={'center'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        Tambahkan item kegiatan kerja, equipment dan operator/driver
                                        dengan klik tombol tambah yang ada disebelah kanan bawah layar
                                    </Text>
                                </Center>
                            }
                            
                        </VStack>
                    </VStack>
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
                        title={'Waktu Selesai Tugas'}
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
                    layerOpt.cabang &&
                    <SheetCabangRoles 
                        isOpen={layerOpt.cabang} 
                        onClose={() => openLayerOption('cabang')} 
                        onSelected={onSelectedCabangRole}/>
                }
                {
                    layerOpt.penyewa &&
                    <SheetPenyewa 
                        isOpen={layerOpt.penyewa} 
                        onClose={() => openLayerOption('penyewa')} 
                        onSelected={onSelectedPenyewa}/>
                }
                {
                    layerOpt.shift &&
                    <SheetShift 
                        isOpen={layerOpt.shift} 
                        onClose={() => openLayerOption('shift')} 
                        onSelected={onSelectedShift}/>
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
                        // clueKey={null}
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

export default CreateTugasEquipment