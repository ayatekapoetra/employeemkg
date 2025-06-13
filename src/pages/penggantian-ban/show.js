import React, { useCallback, useState } from 'react'
import { 
    ScrollView, 
    TouchableOpacity, 
    Dimensions, 
    TextInput, 
    KeyboardAvoidingView, 
    Platform,
    Keyboard,
    Linking,
    Alert
} from 'react-native'
import { 
    HStack, 
    VStack, 
    Text, 
    Button, 
    Image as NBImage, 
} from 'native-base'
import { 
    ArrangeHorizontalSquare, 
    Award, 
    Barcode, 
    CalendarEdit, 
    ChartCircle, 
    Clock, 
    Danger, 
    GalleryEdit, 
    Signpost, 
    TruckRemove, 
    UserTag
} from 'iconsax-react-native'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native'
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
import LoadingHauler from '../../components/LoadingHauler'
import { URIPATH } from '../../helpers/UriPath'

const { width } = Dimensions.get("screen")
const widthPhoto = width * (43/100)

const ShowTireUsages = () => {
    const route = useNavigation()
    const { params } = useRoute()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
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
        ...params,
        kategori: params.demage_ctg,
        photo1: {uri: `${URIPATH.apiphoto}${params.photo1}`},
        photo2: {uri: `${URIPATH.apiphoto}${params.photo2}`},
    })

    const openLampiranFoto = useCallback( async(link) => {
        const supported = await Linking.canOpenURL(link.uri);
        if (supported && link) {
            await Linking.openURL(link.uri);
        }else{
            Alert.alert(`Alamat url photo tidak valid...`);
        }
    }, [])
    

    const updateData = async () => {
        setRefresh(true)
        var data = new FormData()
        data.append('data', JSON.stringify(state))

        if(state.photo1?.fileSize > 0){
            data.append('photo1', {
                uri: state.photo1?.uri,
                name: state.photo1?.fileName,
                type: state.photo1?.type
            });
        }

        if(state.photo2?.fileSize > 0){
            data.append('photo2', {
                uri: state.photo2?.uri,
                name: state.photo2?.fileName,
                type: state.photo2?.type
            });
        }

        try {
            const resp = await apiFetch.post(`tire-usages/${params.id}/update`, data, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  "Cache-Control": "no-cache",
                }
            })

            setRefresh(false)
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Update Ganti Ban',
                    subtitle: 'Anda berhasil mengirim update laporan penggantian ban...'
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
                title: 'Update Error',
                subtitle: error?.response?.data?.diagnostic?.message||'Error api...'
            }))
        }
    }

    const checkData = async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.post(`tire-usages/${params.id}/check`, state)
            console.log('xxx--', resp);
            setRefresh(false)
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Form Ganti Ban',
                    subtitle: 'Anda berhasil check laporan penggantian ban...'
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

    const acceptData = async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.post(`tire-usages/${params.id}/accept`, state)
            setRefresh(false)
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Form Ganti Ban',
                    subtitle: 'Anda berhasil accept/approved laporan penggantian ban...'
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

    const removeData = async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.post(`tire-usages/${params.id}/destroy`)
            setRefresh(false)
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Delete Ganti Ban',
                    subtitle: 'Anda berhasil menghapus laporan penggantian ban...'
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
    

    if(params.author == user.id){
        if(!params.checkedby && !params.acceptedby){
            var BtnAction = 
            <HStack space={2} px={3}>
                <Button flex={1} colorScheme={'error'} onPress={removeData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Hapus</Text>
                </Button>
                <Button flex={3} colorScheme={'coolGray'} onPress={updateData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Update</Text>
                </Button>
            </HStack>
        }
        
    }else{
        if(!params.checkedby && !params.acceptedby){
            var BtnAction = 
            <HStack space={2} px={3}>
                <Button flex={1} colorScheme={'error'} onPress={removeData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Hapus</Text>
                </Button>
                <Button flex={3} colorScheme={'warning'} onPress={checkData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Check</Text>
                </Button>
            </HStack>
        }
        if(params.checkedby && !params.acceptedby){
            var BtnAction = 
            <HStack space={2} px={3}>
                <Button flex={1} colorScheme={'error'} onPress={removeData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Hapus</Text>
                </Button>
                <Button flex={3} colorScheme={'darkBlue'} onPress={acceptData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Accept</Text>
                </Button>
            </HStack>
        }
        if(!params.checkedby && params.acceptedby){
            var BtnAction = 
            <HStack space={2} px={3}>
                <Button flex={1} colorScheme={'error'} onPress={removeData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Hapus</Text>
                </Button>
                <Button flex={3} colorScheme={'warning'} onPress={checkData}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Check</Text>
                </Button>
            </HStack>
        }
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Show Tire Usages"} onBack={true} onThemes={true} onNotification={true}/>
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
                                {
                                    state.photo1 &&
                                    <VStack 
                                        rounded={'md'}
                                        borderWidth={1}
                                        position={'relative'}
                                        h={`${widthPhoto}px`} 
                                        w={`${widthPhoto}px`}
                                        borderStyle={'dashed'}
                                        borderColor={'#ddd'}>
                                        <TouchableOpacity onPress={() => openLampiranFoto(state.photo1)}>
                                            <NBImage
                                                rounded={'md'}
                                                h={`${widthPhoto - 2}px`} w={`${widthPhoto - 2}px`}
                                                source={{ uri: state.photo1?.uri }}
                                                alt="..."/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={takeImageOne} style={{position: 'absolute'}}>
                                            <HStack py={1} px={3} right={2} top={3} bg={appcolor.container[mode]} alignItems={'center'} roundedRight={'full'}>
                                                <GalleryEdit size="18" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                                <Text 
                                                    ml={1} 
                                                    fontWeight={'bold'}
                                                    color={appcolor.teks[mode][1]}
                                                    fontFamily={'Dosis-Medium'}>
                                                    Ganti Photo
                                                </Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </VStack>
                                }
                                
                                {
                                    state.photo2 &&
                                    <VStack 
                                        rounded={'md'}
                                        borderWidth={1}
                                        position={'relative'}
                                        h={`${widthPhoto}px`} 
                                        w={`${widthPhoto}px`}
                                        borderStyle={'dashed'}
                                        borderColor={'#ddd'}>
                                        <TouchableOpacity onPress={() => openLampiranFoto(state.photo2)}>
                                            <NBImage
                                                rounded={'md'}
                                                h={`${widthPhoto - 2}px`} w={`${widthPhoto - 2}px`}
                                                source={{ uri: state.photo2?.uri }}
                                                alt="..."/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={takeImageTwo} style={{position: 'absolute'}}>
                                            <HStack py={1} px={3} right={2} top={3} bg={appcolor.container[mode]} alignItems={'center'} roundedRight={'full'}>
                                                <GalleryEdit size="18" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                                <Text 
                                                    ml={1} 
                                                    fontWeight={'bold'}
                                                    color={appcolor.teks[mode][1]}
                                                    fontFamily={'Dosis-Medium'}>
                                                    Ganti Photo
                                                </Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </VStack>
                                }
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
                            {
                                state.usrCheck &&
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <UserTag size="36" color={appcolor.teks[mode][6]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][6]}>
                                            Checked By :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.usrCheck.nama_lengkap }
                                        </Text>
                                        <Text 
                                            fontSize={'xs'}
                                            lineHeight={'xs'}
                                            fontFamily={'Dosis-Medium'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(state.datechecked).format('YYYY-MM-DD HH:mm') }
                                        </Text>
                                    </VStack>
                                </HStack>
                            }
                            {
                                state.usrAccept &&
                                <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                    <UserTag size="36" color={appcolor.teks[mode][4]} variant="Broken"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][4]}>
                                            Accepted By :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { state.usrAccept.nama_lengkap }
                                        </Text>
                                        <Text 
                                            fontSize={'xs'}
                                            lineHeight={'xs'}
                                            fontFamily={'Dosis-Medium'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(state.dateaccepted).format('YYYY-MM-DD HH:mm') }
                                        </Text>
                                    </VStack>
                                </HStack>
                            }
                        </VStack>
                    </ScrollView>
                </KeyboardAvoidingView>
                { BtnAction }
            </VStack>
        </AppScreen>
    )
}

export default ShowTireUsages