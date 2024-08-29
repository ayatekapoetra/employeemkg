import { Dimensions, TextInput } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import { VStack, Text, Image, HStack, Divider, Button, ScrollView, Actionsheet, Center } from 'native-base'
import { useNavigation, useRoute } from '@react-navigation/native'
import ImgEquipment from '../../common/imgEquipment'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import BadgeAlt from '../../components/BadgeAlt'
import moment from 'moment'
import { AlignVertically, Android, Clock, CloudRemove, Danger, Moon, SunFog, TimerStart, TruckFast, Watch } from 'iconsax-react-native'
import apiFetch from '../../helpers/ApiFetch'
import { applyAlert } from '../../redux/alertSlice'


const { height } = Dimensions.get('screen')

const ShowDelegasiTugasScreen = () => {
    const { params } = useRoute()
    const route = useNavigation()
    const dispatch = useDispatch()
    const isUsertask = params.type === 'user'
    const mode = useSelector(state => state.themes.value)
    const [ openAlasan, setOpenAlasan ] = useState(false)
    const [ state, setState ] = useState(params)
    const imagesIco = isUsertask ? require('../../../assets/images/engineer.png'):ImgEquipment(params.equipment.tipe)

    const onClose = () => setOpenAlasan(!openAlasan)

    const tolakTugasHandle = async () => {
        if(!state.alasan){
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Data invalid",
                subtitle: "Blum ada alasan penolakan tugas..."
            }))
        }

        try {
            const resp = await apiFetch.post('/penugasan-kerja/' + params.id + '/tolak', state)
            console.log(resp);
            if(resp.status == 201){
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Okey",
                    subtitle: "Penolakan tugas berhasil dikirim."
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Data invalid",
                subtitle: error.message
            }))
        }
    }

    const terimaTugasHandle = async () => {
        try {
            const resp = await apiFetch.post('/penugasan-kerja/' + params.id + '/terima')
            if(resp.status == 201){
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Okey",
                    subtitle: "Tugas berhasil diterima..."
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Data invalid",
                subtitle: error.message
            }))
        }
    }

    const selesaiTugasHandle = async () => {
        if(!params.done_at){
            try {
                const resp = await apiFetch.post('/penugasan-kerja/' + params.id + '/selesai')
                if(resp.status == 201){
                    route.goBack()
                    dispatch(applyAlert({
                        show: true,
                        status: "success",
                        title: "Okey",
                        subtitle: "Tugas berhasil diterima..."
                    }))
                }
            } catch (error) {
                console.log(error);
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Data invalid",
                    subtitle: error.message
                }))
            }
        }else{
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Data invalid",
                subtitle: "Tugas telah diselesaikan beberapa waktu lalu..."
            }))
        }
        
    }

    const removeTugasHandle = async () => {
        if(!params.done_at){
            try {
                const resp = await apiFetch.post('/penugasan-kerja/' + params.id + '/destroy')
                if(resp.status == 201){
                    route.goBack()
                    dispatch(applyAlert({
                        show: true,
                        status: "success",
                        title: "Okey",
                        subtitle: "Tugas berhasil dihapus..."
                    }))
                }
            } catch (error) {
                console.log(error);
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Data invalid",
                    subtitle: error.message
                }))
            }
        }else{
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Data invalid",
                subtitle: "Tugas telah diselesaikan beberapa waktu lalu..."
            }))
        }
        
    }

    switch (state.status) {
        case "check":
            var badge = <BadgeAlt rounded={"full"} type={"info"} colorScheme={"info.200"} title={"Check"}/>
            break;
        case "done":
            var badge = <BadgeAlt rounded={"full"} type={"success"} colorScheme={"success.200"} title={"Selesai"}/>
            break;
        case "reject":
            var badge = <BadgeAlt rounded={"full"} type={"error"} colorScheme={"error.200"} title={"Ditolak"}/>
            break;
        default:
            var badge = <BadgeAlt rounded={"full"} type={"warning"} colorScheme={"warning.200"} title={"Baru"}/>
            break;
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Show Penugasan"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                <VStack px={5} flex={1}>
                    <HStack space={2}>
                        <Image source={imagesIco} alt='icon' size={"lg"}/>
                        <VStack flex={1} justifyContent={'center'}>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontWeight={'bold'}
                                fontFamily={'Poppins-Regular'}
                                color={appcolor.teks[mode][1]}>
                                {state.nm_assign}
                            </Text>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <VStack>
                                    <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        {state.karyawan?.section}
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        {state.karyawan?.phone}
                                    </Text>
                                </VStack>
                                { badge }
                            </HStack>
                        </VStack>
                    </HStack>
                    <Divider mb={2}/>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <HStack space={2} alignItems={'center'} justifyContent={'space-around'}>
                            <VStack p={2} flex={1} borderWidth={1} borderColor={appcolor.line[mode][2]} borderStyle={'dotted'} rounded={'md'}>
                                <Text fontSize={16} fontFamily={'Farsan-Regular'} color={appcolor.teks[mode][4]}>Tugas Dimulai :</Text>
                                <HStack alignItems={'center'}>
                                    <Watch size="50" color={appcolor.ico[mode][4]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontWeight={'bold'}
                                            fontSize={'xl'}
                                            fontFamily={'Dosis-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(state.starttask).format('HH:mm [wita]') }
                                        </Text>
                                        <Text 
                                            mt={-1}
                                            fontWeight={'light'}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(state.starttask).format('ddd, DD MMM YYYY') }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                            <VStack p={2} flex={1} borderWidth={1} borderColor={appcolor.line[mode][2]} borderStyle={'dotted'} rounded={'md'}>
                                <Text fontSize={16} fontFamily={'Farsan-Regular'} color={appcolor.teks[mode][3]}>Tugas Berakhir :</Text>
                                <HStack>
                                    <Watch size="50" color={appcolor.ico[mode][5]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontWeight={'bold'}
                                            fontSize={'xl'}
                                            fontFamily={'Dosis-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { isUsertask ? moment(state.datelinetask).format('HH:mm [wita]') : moment(state.finishtask).format('HH:mm [wita]') }
                                        </Text>
                                        <Text 
                                            mt={-1}
                                            fontWeight={'light'}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { isUsertask ? moment(state.datelinetask).format('ddd, DD MMM YYYY') : moment(state.finishtask).format('ddd, DD MMM YYYY')}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </HStack>
                        {
                            isUsertask ?
                            <VStack>
                                <VStack minH={'150px'} py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Poppins-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        Narasi Tugas :
                                    </Text>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        {state.narasitask}
                                    </Text>
                                </VStack>
                                
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Tanggal Penugasan :
                                    </Text>
                                    <HStack space={2} alignItems={'center'}>
                                        <Clock size="30" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontWeight={'bold'}
                                                fontFamily={'Quicksand-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.date_ops).format('dddd, DD MMM YYYY') }
                                            </Text>
                                            <Text 
                                                mt={-1}
                                                fontWeight={'light'}
                                                fontFamily={'Abel-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { state?.creator?.nama_lengkap }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </VStack>
                            :
                            <VStack flex={1}>
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Equipemnt Tugas :
                                    </Text>
                                    <HStack space={2}>
                                        <TruckFast size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <Text 
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {state.equipment.kode}
                                        </Text>
                                    </HStack>
                                </VStack>
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Penyewa :
                                    </Text>
                                    <HStack space={2}>
                                        <Android size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <Text 
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {state.penyewa.nama}
                                        </Text>
                                    </HStack>
                                </VStack>
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Lokasi Kerja :
                                    </Text>
                                    <HStack space={2}>
                                        <AlignVertically size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <Text 
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {state.lokasi.nama}
                                        </Text>
                                    </HStack>
                                </VStack>
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Kegiatan Kerja :
                                    </Text>
                                    <HStack space={2}>
                                        <Danger size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <Text 
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {state.kegiatan.nama}
                                        </Text>
                                    </HStack>
                                </VStack>
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Shift Kerja :
                                    </Text>
                                    <HStack space={2}>
                                        {
                                            state.shift_id == 1 ?
                                            <SunFog size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                            :
                                            <Moon size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        }
                                        <Text 
                                            fontWeight={'bold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            {state.shift.nama}
                                        </Text>
                                    </HStack>
                                </VStack>
                                
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Tanggal Penugasan :
                                    </Text>
                                    <HStack space={2} alignItems={'center'}>
                                        <Clock size="30" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontWeight={'bold'}
                                                fontFamily={'Quicksand-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.date_ops).format('dddd, DD MMM YYYY') }
                                            </Text>
                                            <Text 
                                                mt={-1}
                                                fontWeight={'light'}
                                                fontFamily={'Abel-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { state?.creator?.nama_lengkap }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </VStack>
                        }
                        <VStack>
                            {
                                state.rejected_at &&
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][5]}>
                                        Tugas Ditolak :
                                    </Text>
                                    <HStack space={2} alignItems={'center'}>
                                        <CloudRemove size="30" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontWeight={'bold'}
                                                fontSize={'xl'}
                                                fontFamily={'Dosis-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.rejected_at).format('HH:mm [wita]') }
                                            </Text>
                                            <Text 
                                                mt={-1}
                                                fontWeight={'light'}
                                                fontFamily={'Abel-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.rejected_at).format('dddd, DD MMMM YYYY') }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            }
                            {
                                state.checked_at &&
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Tugas Diterima :
                                    </Text>
                                    <HStack space={2} alignItems={'center'}>
                                        <TimerStart size="30" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontWeight={'bold'}
                                                fontSize={'xl'}
                                                fontFamily={'Dosis-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.checked_at).format('HH:mm [wita]') }
                                            </Text>
                                            <Text 
                                                mt={-1}
                                                fontWeight={'light'}
                                                fontFamily={'Abel-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.checked_at).format('dddd, DD MMMM YYYY') }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            }
                            {
                                params.done_at &&
                                <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Konfirmasi Selesai :
                                    </Text>
                                    <HStack space={2} alignItems={'center'}>
                                        <TimerStart size="30" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                        <VStack>
                                            <Text 
                                                fontWeight={'bold'}
                                                fontSize={'xl'}
                                                fontFamily={'Dosis-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.done_at).format('HH:mm [wita]') }
                                            </Text>
                                            <Text 
                                                mt={-1}
                                                fontWeight={'light'}
                                                fontFamily={'Abel-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                { moment(state.done_at).format('dddd, DD MMMM YYYY') }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            }
                        </VStack>
                        <VStack>
                            {
                                params.alasan &&
                                <VStack my={2} py={2}>
                                    <Text 
                                        fontFamily={'Poppins-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        Alasan Penolakan :
                                    </Text>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        {state.alasan}
                                    </Text>
                                </VStack>
                            }
                        </VStack>
                    </ScrollView>
                </VStack>
                <VStack px={5}>
                    {
                        state.isRemoved ?
                        <VStack>
                            {
                                params.status === 'active' &&
                                <Button colorScheme={"danger"} onPress={removeTugasHandle}>
                                    <Text fontFamily={'Poppins'} fontWeight={'semibold'} color={'#FFF'}>Hapus Tugas</Text>
                                </Button>
                            }
                        </VStack>
                        :
                        <HStack>
                            {
                                params.checked_at  ?
                                <Button flex={1} colorScheme={params.status === "done"?"coolGray":"emerald"} onPress={selesaiTugasHandle}>
                                    <Text fontFamily={'Poppins'} fontWeight={'semibold'} color={'#FFF'}>Tugas Diselesaikan</Text>
                                </Button>
                                :
                                <HStack flex={1} space={2}>
                                    {
                                        !params.rejected_at &&
                                        <Button flex={1} colorScheme={"error"} onPress={() => setOpenAlasan(!openAlasan)}>
                                            <Text fontFamily={'Poppins'} fontWeight={'semibold'} color={'#FFF'}>Tolak</Text>
                                        </Button>
                                    }
                                    {
                                        !params.checked_at && !params.rejected_at && 
                                        <Button flex={3} colorScheme={"blue"} onPress={terimaTugasHandle}>
                                            <Text fontFamily={'Poppins'} fontWeight={'semibold'} color={'#FFF'}>Terima Tugas</Text>
                                        </Button>
                                    }
                                </HStack>
                            }
                        </HStack>
                    }
                </VStack>
            </VStack>
            <Actionsheet isOpen={openAlasan} onClose={onClose}>
                <Actionsheet.Content style={{height: height * .6}}>
                    <VStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                        <VStack>
                            <Center>
                                <Text 
                                    fontSize={14}
                                    fontWeight={300}
                                    fontFamily={'Abel-Regular'}>
                                    Alasan penolakan tugas yang diberikan oleh :
                                </Text>
                                <Text 
                                    fontSize={14}
                                    fontWeight={700}
                                    fontFamily={'Dosis-Regular'}>
                                    {state.creator?.karyawan?.nama}
                                </Text>
                            </Center>
                            <HStack flex={1} my={3} bg={"muted.200"} w={'full'} rounded={'md'}>
                                <TextInput 
                                    multiline 
                                    placeholder='Tuliskan alasan anda disini....'
                                    placeholderTextColor={"#FFF"}
                                    onChangeText={(teks) => setState({...state, alasan: teks})}
                                    style={{flex: 1, padding: 10}}/>
                            </HStack>
                            <Button colorScheme={"error"} onPress={tolakTugasHandle}>
                                <Text fontFamily={'Poppins'} fontWeight={'semibold'} color={'#FFF'}>Kirim Penolakan</Text>
                            </Button>
                        </VStack>
                    </VStack>
                </Actionsheet.Content>
            </Actionsheet>
        </AppScreen>
    )
}

export default ShowDelegasiTugasScreen