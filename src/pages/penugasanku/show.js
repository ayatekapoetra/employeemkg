// import { nanoid } from '@reduxjs/toolkit'
import { ScrollView, TouchableOpacity, Linking, Alert, Platform, NativeModules, RefreshControl } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Button, Center, Image } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import AlertConfirmation from '../../components/AlertConfirmation'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Dislike, LampCharge, LampSlash } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import apiFetch from '../../helpers/ApiFetch'
import { ICOFILE, MYIMAGEBG } from '../../../assets/images'
import LoadingHauler from '../../components/LoadingHauler'
import { URIPATH } from '../../helpers/UriPath'
import SheetInputTeks from '../../components/SheetInputTeks'
import { applyAlert } from '../../redux/alertSlice'
import TeksLink from '../../components/TeksLink'

const ShowTugasKu = () => {
    const { params } = useRoute()
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ openConfirm, setOpenConfirm] = useState(false)
    const [ openAlasan, setOpenAlasan ] = useState(false)
    const [activeReff, setActiveReff] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [ state, setState] = useState({...params, durasi: ""})

    useMemo(async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.get('penugasan/'+params.id+'/show')
            setState(resp.data)
            setRefresh(false)
        } catch (error) {
            console.log(error);
            setRefresh(false)
        }

    }, [])

    const onRefreshHandle = useCallback(async() => {
        setRefresh(true)
        try {
            const resp = await apiFetch.get('penugasan/'+params.id+'/show')
            setState(resp.data)
            setRefresh(false)
        } catch (error) {
            console.log(error);
            setRefresh(false)
        }
    })

    const confirmationRemoveHandle = () => {
        setOpenConfirm(true)
    }

    const openAlasanHandle = () => {
        setOpenAlasan(true)
    }

    const onSubmitInputHandle = async (teks) => {

        try {
            const resp = await apiFetch.post('penugasan/' + params.id + '/reject', {reject_msg: teks})
            console.log(resp);
            
            if(resp.status == 201){
                setOpenAlasan(false)
                setOpenConfirm(false)
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Tolak Tugas',
                    subtitle: 'Anda berhasil menolak penugasan...'
                }))
                route.goBack()
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

    const linkAttachmentHandle = async () => {
        if(state.attach_url){
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
        }else{
            return
        }
    }

    const completedItemHandle = async (obj) => {
        console.log(obj);
        try {
            const resp = await apiFetch.post('penugasan-karyawan/' + state.id + '/item/' + obj.id + '/finish')
            if(resp.status == 201){
                await onRefreshHandle()
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Item Tugas Selesai',
                    subtitle: 'Anda berhasil menyelesaikan penugasan\n'+obj.narasitask
                }))
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: 'error',
                    title: 'Terima Tugas',
                    subtitle: 'Terjadi kesalahan dalam pengiriman data ke server...'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Gagal Menerima Tugas',
                subtitle: error?.response?.data?.diagnostic?.message||error.message
            }))
        }
    }

    const completedAllHandle = async (obj) => {
        console.log(obj);
        try {
            const resp = await apiFetch.post('penugasan-karyawan/' + state.id +  '/completed')
            if(resp.status == 201){
                await onRefreshHandle()
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Semua Tugas Selesai',
                    subtitle: 'Anda berhasil menyelesaikan semua item penugasan'
                }))
                route.goBack()
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: 'error',
                    title: 'Terima Tugas',
                    subtitle: 'Terjadi kesalahan dalam pengiriman data ke server...'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Gagal Menerima Tugas',
                subtitle: error?.response?.data?.diagnostic?.message||error.message
            }))
        }
    }

    const acceptDataHandle = async () => {
        try {
            const resp = await apiFetch.post('penugasan-karyawan/' + params.id + '/accept')
            console.log(resp);
            
            if(resp.status == 201){
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Terima Tugas',
                    subtitle: 'Anda berhasil menerima penugasan...'
                }))
                route.goBack()
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: 'error',
                    title: 'Terima Tugas',
                    subtitle: 'Terjadi kesalahan dalam pengiriman data ke server...'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: 'Gagal Menerima Tugas',
                subtitle: error?.response?.data?.diagnostic?.message||'Error api...'
            }))
        }
    }

    if(state.attach_url){
        var ext = ((state.attach_url).split('.'))?.pop()
        ext = ext.toLowerCase()
        console.log(ext);
        var iconFile = <Image resizeMode='contain' alt='icon' source={ICOFILE[ext]} style={{width: 80, height: 100}}/>
    }else{
        var iconFile = <Image resizeMode='cover' alt='icon' source={MYIMAGEBG.engeneerIllustration} style={{width: 80, height: 100}}/>
    }

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
                    title={"Tolak Data Penugasan"}
                    subtitle={"Apakah anda yakin akan menolak penugasan ini ?\n\nSebelum menolak tugas yang diberikan, silahkan mengisi alasan penolakan anda..."}
                    onClose={() => setOpenConfirm(false)} 
                    onAction={openAlasanHandle}/>
                <VStack px={3} flex={1}>
                    <ScrollView 
                        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefreshHandle} />}
                        showsVerticalScrollIndicator={false}>
                        <VStack flex={1}>
                            <HStack space={2}>
                                <TouchableOpacity onPress={linkAttachmentHandle}>
                                    <Center maxH={'175px'} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'lg'}>
                                        { iconFile }
                                    </Center>
                                </TouchableOpacity>

                                <VStack flex={1}>
                                    <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
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
                                </VStack>
                                
                            </HStack>

                            <HStack py={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][1]}
                                        fontFamily={'Abel-Regular'}>
                                        Diberikan oleh :
                                    </Text>
                                    <Text 
                                        fontSize={16}
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][1]}
                                        fontFamily={'Poppins'}>
                                        { state.nmassigner }
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        color={appcolor.teks[mode][3]}
                                        fontFamily={'Abel-Regular'}>
                                        { state.assigner?.section }
                                    </Text>
                                </VStack>
                            </HStack>
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
                                                <VStack flex={1}>
                                                    <HStack space={2}>
                                                        <VStack p={2} flex={1} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
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
                                                        </VStack>
                                                        <VStack p={2} flex={1} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
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
                                                        </VStack>
                                                        {
                                                            state.status === 'check' && item.isfinish == 0 &&
                                                            <Button onPress={() => completedItemHandle(item)} colorScheme={'success'}>
                                                                <Center>
                                                                    <Text mt={-1} color={'#FFF'} fontWeight={'bold'} fontFamily={'DOsis'}>SELESAI</Text>
                                                                </Center>
                                                            </Button>
                                                        }
                                                    </HStack>
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
                                                </VStack>
                                            </HStack>
                                            <VStack>
                                                <Text 
                                                    fontFamily={'Poppins'}
                                                    fontWeight={'bold'}
                                                    color={appcolor.teks[mode][7]}>
                                                    { item.urut }. Penjelasan Tugas :
                                                </Text>
                                                <TeksLink 
                                                    teks={item.narasitask}
                                                    fontFamily={'Quicksand'}
                                                    color={appcolor.teks[mode][1]}/>
                                            </VStack>
                                        </VStack>
                                    )
                                })
                            }
                        </VStack>
                    </ScrollView>
                    <>
                    {
                        state.status == 'active' &&
                        <HStack space={2}>
                            <Button 
                                onPress={confirmationRemoveHandle}
                                colorScheme={'danger'}>
                                <HStack space={1}>
                                    <Dislike size="22" color={"#FFF"} variant="Outline"/>
                                    <Text color={'#FFF'} fontWeight={'bold'} fontFamily={'Roboto'}>Tolak</Text>
                                </HStack>
                            </Button>
                            <Button 
                                flex={3} 
                                onPress={acceptDataHandle}
                                colorScheme={'darkBlue'}>
                                <Text color={'#FFF'} fontWeight={'bold'} fontFamily={'Roboto'}>Terima Tugas</Text>
                            </Button>
                        </HStack>
                    }
                    {
                        state.status == 'check' &&
                        <HStack space={2}>
                            <Button 
                                flex={3} 
                                onPress={completedAllHandle}
                                colorScheme={'darkBlue'}>
                                <Text color={'#FFF'} fontWeight={'bold'} fontFamily={'Roboto'}>Semua Tugas Selesai</Text>
                            </Button>
                        </HStack>
                    }
                    {
                        state?.durasi &&
                        <HStack my={2} w={'full'} p={2} mt={3} bg={'muted.300'} alignItems={'center'} justifyContent={'space-between'} rounded={'sm'}>
                            <VStack w={'4/5'}>
                                <Text
                                    lineHeight={'xs'}
                                    fontWeight={'bold'}
                                    fontFamily={'Poppins'}>
                                    {'Selamat...'}
                                </Text>
                                <Text
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}>
                                    {'Tugas diselesaikan dalam waktu'}
                                </Text>
                            </VStack>

                            <Text w={'1/5'} 
                                fontSize={20}
                                textAlign={'center'}
                                lineHeight={'xs'}
                                fontWeight={'bold'}
                                fontFamily={'Dosis'}>
                                {state?.durasi || ''}
                            </Text>
                        </HStack>
                    }
                    </>
                </VStack>
                {
                    openAlasan &&
                    <SheetInputTeks 
                        title={'Penjelasan Penolakan Tugas :'}
                        placeholder={'Jelaskan secara terperinci dan detail penolakan tugas yang anda diberikan'}
                        isOpen={openAlasan} 
                        onClose={() => setOpenAlasan(false)} 
                        onSelected={onSubmitInputHandle}/>
                }
            </VStack>
        </AppScreen>
    )
}

export default ShowTugasKu