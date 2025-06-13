import React, { useState } from 'react'
import { 
    ScrollView, 
    TouchableOpacity, 
    Dimensions, 
    TextInput, 
    KeyboardAvoidingView, 
    Platform,
    Keyboard
} from 'react-native'
import { 
    HStack, 
    VStack, 
    Text, 
    Button, 
    Center, 
    Image as NBImage 
} from 'native-base'
import { 
    ArrangeHorizontalSquare, 
    Award, 
    Barcode, 
    CalendarEdit, 
    ChartCircle, 
    Clock, 
    Danger, 
    Image, 
    Signpost, 
    TruckRemove 
} from 'iconsax-react-native'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import appcolor from '../../common/colorMode'
import DatePicker from 'react-native-date-picker'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'

import SheetLokasiPit from '../../components/SheetLokasiPit'
import SheetEquipment from '../../components/SheetEquipment'
import SheetShift from '../../components/SheetShift'
import SheetOption from '../../components/SheetOption'
import SheetMediaCamera from '../../components/SheetMediaCamera'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'
import LoadingSpinner from '../../components/LoadingSpinner'
import LoadingHauler from '../../components/LoadingHauler'

const { width } = Dimensions.get("screen")
const widthPhoto = width * (43/100)

const CreateTireUsages = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ refresh, setRefresh ] = useState(false);
    const [ photo, setPhoto ] = useState("");

    const [ openPicker, setOpenPicker ] = useState({
        media: false,
        equipment: false,
        lokasi: false,
        equipment: false,
        shift: false,
        brand: false,
        type: false,
        kategori: false,
        status: false,
        tanggal: false,
    })
    const [ state, setState ] = useState({
        equipment_id: null,
        equipment: null,
        lokasi_id: null,
        lokasi: null,
        shift_id: null,
        shift: null,
        nmbrand: '',
        type: '',
        kategori: '',
        noseri: '',
        status: '',
        photo1: null,
        photo2: null,
        date_ops: new Date()
    })

    console.log(state);
    

    const simpanData = async () => {
        setRefresh(true)
        var data = new FormData()
        data.append('data', JSON.stringify(state))

        data.append('photo1', {
            uri: state.photo1?.uri,
            name: state.photo1?.fileName,
            type: state.photo1?.type
        });

        data.append('photo2', {
            uri: state.photo2?.uri,
            name: state.photo2?.fileName,
            type: state.photo2?.type
        });

        try {
            const resp = await apiFetch.post('tire-usages', data, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  "Cache-Control": "no-cache",
                }
            })

            console.log('xxx--', resp);
            setRefresh(false)
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Form Ganti Ban',
                    subtitle: 'Anda berhasil mengirim laporan penggantian ban...'
                }))
                route.navigate('penggantian-ban')
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

    const takeImageOne = () => {
        Keyboard.dismiss();
        setOpenPicker({...openPicker, media: !openPicker.media})
        setPhoto("photo1")
    }

    const takeImageTwo = () => {
        Keyboard.dismiss();
        setOpenPicker({...openPicker, media: !openPicker.media})
        setPhoto("photo2")
    }

    const onCloseMedia = () => {
        setOpenPicker({...openPicker, media: false})
    }

    const onSelectedMedia = (obj) => {
        Keyboard.dismiss();
        setOpenPicker({...openPicker, media: false})
        setState({...state, [photo]: obj})
    }

    const onCloseLokasi = () => {
        setOpenPicker({...openPicker, lokasi: false})
    }

    const onSelectedLokasi = (obj) => {
        Keyboard.dismiss();
        setState({...state, lokasi_id: obj.id, lokasi: obj})
        setOpenPicker({...openPicker, lokasi: false})
    }

    const onCloseShift = () => {
        setOpenPicker({...openPicker, shift: false})
    }

    const onSelectedShift = (obj) => {
        Keyboard.dismiss();
        setState({...state, shift_id: obj.id, shift: obj})
        setOpenPicker({...openPicker, shift: false})
    }

    const onCloseBrand = () => {
        setOpenPicker({...openPicker, brand: false})
    }

    const onSelectedBrand = (obj) => {
        Keyboard.dismiss();
        setState({...state, nmbrand: obj.nilai})
        setOpenPicker({...openPicker, brand: false})
    }

    const onCloseType = () => {
        setOpenPicker({...openPicker, type: false})
    }

    const onSelectedType = (obj) => {
        Keyboard.dismiss();
        setState({...state, type: obj.nilai})
        setOpenPicker({...openPicker, type: false})
    }

    const onCloseKategori = () => {
        setOpenPicker({...openPicker, kategori: false})
    }

    const onSelectedKategori = (obj) => {
        Keyboard.dismiss();
        setState({...state, kategori: obj.nilai})
        setOpenPicker({...openPicker, kategori: false})
    }

    const onCloseStatus = () => {
        setOpenPicker({...openPicker, kategori: false})
    }

    const onSelectedStatus = (obj) => {
        Keyboard.dismiss();
        setState({...state, status: obj.nilai})
        setOpenPicker({...openPicker, status: false})
    }

    const onCloseEquipment = () => {
        setOpenPicker({...openPicker, equipment: false})
    }

    const onSelectedEquipment = (obj) => {
        Keyboard.dismiss();
        setState({...state, equipment_id: obj.id, equipment: obj})
        setOpenPicker({...openPicker, equipment: false})
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Form Tire Usages"} onBack={true} onThemes={true} onNotification={true}/>
                { refresh && <LoadingHauler/> }
                {
                    openPicker.media && 
                    <SheetMediaCamera 
                        isOpen={openPicker.media} 
                        onClose={onCloseMedia} 
                        onSelected={onSelectedMedia}/>
                }
                {
                    openPicker.lokasi && 
                    <SheetLokasiPit 
                        isOpen={openPicker.lokasi} 
                        onClose={onCloseLokasi} 
                        onSelected={onSelectedLokasi}/>
                }
                {
                    openPicker.shift &&
                    <SheetShift 
                        isOpen={openPicker.shift} 
                        onClose={onCloseShift} 
                        onSelected={onSelectedShift}/>
                }
                {
                    openPicker.brand &&
                    <SheetOption 
                        optgroup={"tire-merk"}
                        isOpen={openPicker.brand} 
                        onClose={onCloseBrand} 
                        onSelected={onSelectedBrand}/>
                }
                {
                    openPicker.type &&
                    <SheetOption 
                        optgroup={"tire-type"}
                        isOpen={openPicker.type} 
                        onClose={onCloseType} 
                        onSelected={onSelectedType}/>
                }
                {
                    openPicker.kategori &&
                    <SheetOption 
                        optgroup={"tire-demage"}
                        isOpen={openPicker.kategori} 
                        onClose={onCloseKategori} 
                        onSelected={onSelectedKategori}/>
                }
                {
                    openPicker.status &&
                    <SheetOption 
                        optgroup={"tire-status"}
                        isOpen={openPicker.status} 
                        onClose={onCloseStatus} 
                        onSelected={onSelectedStatus}/>
                }
                {
                    openPicker.equipment &&
                    <SheetEquipment 
                        clueKey={['dumptruck', 'lighttruck', 'lightvehicle', 'motorgrader', 'loader']}
                        isOpen={openPicker.equipment} 
                        onClose={onCloseEquipment} 
                        onSelected={onSelectedEquipment}/>
                }
                
                <KeyboardAvoidingView 
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <ScrollView>
                        <VStack flex={1} px={3}>
                            <HStack mb={3} space={5} justifyContent={"center"} alignItems={'center'}>
                                <TouchableOpacity onPress={takeImageOne}>
                                    {
                                        state.photo1 ?
                                        <NBImage
                                            rounded={'md'}
                                            h={`${widthPhoto}px`} w={`${widthPhoto}px`}
                                            source={{ uri: state.photo1?.uri }}
                                            alt="Gambar dari Handphone"/>
                                        :
                                        <Center h={`${widthPhoto}px`} w={`${widthPhoto}px`} borderWidth={1} borderStyle={'dashed'} borderColor={appcolor.line[mode][2]} rounded={'md'}>
                                            <Image size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                            <Text mt={2} color={appcolor.teks[mode][3]} fontFamily={'Abel-Regular'}>Upload Photo 1</Text>
                                        </Center>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity onPress={takeImageTwo}>
                                    {
                                        state.photo2 ?
                                        <NBImage
                                            rounded={'md'}
                                            h={`${widthPhoto}px`} w={`${widthPhoto}px`}
                                            source={{ uri: state.photo2?.uri }}
                                            alt="Gambar dari Handphone"/>
                                        :
                                        <Center h={`${widthPhoto}px`} w={`${widthPhoto}px`} borderWidth={1} borderStyle={'dashed'} borderColor={appcolor.line[mode][2]} rounded={'md'}>
                                            <Image size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                            <Text mt={2} color={appcolor.teks[mode][3]} fontFamily={'Abel-Regular'}>Upload Photo 2</Text>
                                        </Center>
                                    }
                                </TouchableOpacity>
                            </HStack>
                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, tanggal: !openPicker.tanggal})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <CalendarEdit size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Tanggal :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(state.date_ops).format('dddd, DD MMMM YYYY') || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                            {
                                openPicker.tanggal && 
                                <DatePicker
                                    modal
                                    mode={"date"}
                                    locale={"ID"}
                                    title={'Tanggal Penggantian'}
                                    open={openPicker.tanggal}
                                    date={new Date()}
                                    theme={mode != "dark"?"light":"dark"}
                                    onConfirm={(date) => setState({...state, date_ops: date })}
                                    onCancel={() => {
                                        setOpenPicker({...openPicker, tanggal: false })
                                    }}
                                />
                            }

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, lokasi: !openPicker.lokasi})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <Signpost size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Lokasi :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.lokasi?.nama || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, shift: !openPicker.shift})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <Clock size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Shift Kerja :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.shift?.nama || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, equipment: !openPicker.equipment})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <TruckRemove size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Dilepas dari :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.equipment?.kode || '???' }
                                        </Text>
                                        {
                                            state.equipment &&
                                            <HStack justifyContent={'space-between'} alignItems={'center'}>
                                                <Text 
                                                    fontSize={12}
                                                    lineHeight={'xs'}
                                                    fontWeight={'light'}
                                                    fontFamily={'Dosis-Light'}
                                                    color={appcolor.teks[mode][1]}>
                                                    { state.equipment?.model }
                                                </Text>
                                                <Text 
                                                    fontSize={14}
                                                    lineHeight={'xs'}
                                                    fontWeight={'medium'}
                                                    fontFamily={'Poppins-Medium'}
                                                    color={appcolor.teks[mode][6]}>
                                                    { state.equipment?.manufaktur }
                                                </Text>
                                            </HStack>
                                        }
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, brand: !openPicker.brand})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <Award size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Merk Ban :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.nmbrand || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, type: !openPicker.type})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <ChartCircle size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Tipe Ban :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.type || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>

                            <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <Barcode size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        Nomor Seri Ban :
                                    </Text>
                                    <TextInput
                                        placeholder='???'
                                        placeholderTextColor={appcolor.teks[mode][1]}
                                        onChangeText={(teks) => setState({...state, noseri: teks})}
                                        value={state.noseri}
                                        style={{
                                            color: appcolor.teks[mode][1],
                                            fontFamily: 'Quicksand-Bold',
                                            fontSize: 18,
                                        }}/>
                                </VStack>
                            </HStack>

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, kategori: !openPicker.kategori})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <Danger size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Kategori Kerusakan :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.kategori || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setOpenPicker({...openPicker, status: !openPicker.status})}>
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <ArrangeHorizontalSquare size="36" color={appcolor.teks[mode][2]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][3]}>
                                            Status :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.status || '???' }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                    </ScrollView>
                </KeyboardAvoidingView>
                <VStack px={3}>
                    <Button colorScheme={'darkBlue'} onPress={simpanData}>
                        <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Simpan</Text>
                    </Button>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default CreateTireUsages