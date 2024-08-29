import { Linking, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { VStack, Text, Image, HStack, Divider, Stack, ScrollView, Button, Center, Flex, Badge } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation, useRoute } from '@react-navigation/native'
import AppScreen from '../../../components/AppScreen'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import { Buildings, Calendar1, Clock, Map, MoneySend, Note1, ShoppingCart, TruckFast, UserOctagon, UserRemove, Watch } from 'iconsax-react-native'
import apiFetch from '../../../helpers/ApiFetch'
import { applyAlert } from '../../../redux/alertSlice'
import AlertConfirmation from '../../../components/AlertConfirmation'

const baseuri = 'https://offices.makkuragatama.id/';

const ShowApprovalPengajuanDana = () => {
    const route = useNavigation()
    const { params } = useRoute()
    const dispatch = useDispatch()
    const [ openConfirm, setOpenConfirm] = useState(false)
    const mode = useSelector(state => state.themes.value)

    const openLampiranFoto = useCallback(async(url) => {
        const supported = await Linking.canOpenURL(baseuri + url);
        if (supported && url) {
            await Linking.openURL(baseuri + url);
        }else{
            Alert.alert(`Lampiran pengajuan tdk ditemukan...`);
        }
    }, [])

    const approvalHandle = async () => {
        try {
            const resp = await apiFetch.post('pengajuan-dana/'+params.id+'/approval', params)
            console.log(resp);
            if(resp.status === 201){
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Okey Success Approval",
                    subtitle: "Berhasil menyetujui pengajuan dana\nData akan dikirim ke team keuangan untuk divalidasi..."
                }))
                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal approve data",
                subtitle: error?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const verifiedHandle = async () => {
        try {
            const resp = await apiFetch.post('pengajuan-dana/'+params.id+'/verified', params)
            console.log(resp);
            if(resp.status === 201){
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success Verified Keuangan",
                    subtitle: "Berhasil verifikasi pengajuan dana\nData akan dikirim ke kasir untuk dilakukan pencairan dana..."
                }))
                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal approve data",
                subtitle: error?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const rejectHandle = async () => {

        try {
            const resp = await apiFetch.post('pengajuan-dana/'+params.id+'/rejected', params)
            console.log(resp);
            if(resp.status === 201){
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Okey Success Reject",
                    subtitle: "Berhasil menolak pengajuan dana yang telah dibuat oleh\n"+params.author.nama_lengkap
                }))
                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal reject data",
                subtitle: error?.data?.diagnostic?.message || error.message
            }))
        }
    }

    console.log(params);

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen 
                    title={"Show Pengajuan Dana"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={null} 
                    onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack>
                        <Image 
                            alt='...'
                            resizeMode="contain"
                            source={require('../../../../assets/images/funds.png')} 
                            style={{width: 80, height: 90}}/>
                        <VStack flex={1}>
                            <Text 
                                fontSize={22}
                                fontFamily={'Teko-Regular'}
                                color={appcolor.teks[mode][1]}>
                                {params.kode}
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={16}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                By: {params.author.nama_lengkap}
                            </Text>
                            <Divider/>
                            <HStack justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][3]}>
                                    GrandTotal
                                </Text>
                                {
                                    params?.total ?
                                    <Text 
                                        fontSize={18}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        { "Rp. " + (params?.total)?.toLocaleString('ID') }
                                    </Text>
                                    :
                                    <Text 
                                        fontSize={18}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        { "Rp. 0.00" }
                                    </Text>
                                }
                            </HStack>
                        </VStack>
                    </HStack>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <VStack mt={2}>
                            <Text 
                                fontSize={14}
                                fontWeight={'semibold'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Narasi Pengajuan :
                            </Text>
                            <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                <Text 
                                    color={appcolor.teks[mode][1]}>
                                    {params.narasi}
                                </Text>
                            </VStack>
                        </VStack>
                        <VStack mt={2}>
                            <Text 
                                fontSize={14}
                                fontWeight={'semibold'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Tanggal Pengajuan :
                            </Text>
                            <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                <HStack space={2}>
                                    <Calendar1 size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <Text 
                                        color={appcolor.teks[mode][1]}>
                                        { moment(params.trx_date).format('dddd, DD MMMM YYYY') }
                                    </Text>
                                </HStack>
                            </VStack>
                        </VStack>
                        <VStack mt={2}>
                            <Text 
                                fontSize={14}
                                fontWeight={'semibold'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Lokasi Pengajuan :
                            </Text>
                            <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                <HStack space={2}>
                                    <Map size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <Text 
                                        color={appcolor.teks[mode][1]}>
                                        { params.bisnis?.initial } { params.cabang?.nama }
                                    </Text>
                                </HStack>
                            </VStack>
                        </VStack>
                        <VStack mt={2}>
                            {
                                params.checked_at &&
                                <VStack>
                                    <Text 
                                        fontSize={14}
                                        fontWeight={'semibold'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Tanggal Approved :
                                    </Text>
                                    <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                                            <HStack space={2} alignItems={'center'}>
                                                <Calendar1 size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                <VStack>
                                                    <Text 
                                                        color={appcolor.teks[mode][1]}>
                                                        { moment(params.checked_at).format('dddd, DD MMMM YYYY') }
                                                    </Text>
                                                    <Text 
                                                        lineHeight={'xs'}
                                                        fontFamily={'Abel-Regular'}
                                                        color={appcolor.teks[mode][1]}>
                                                        { params.checked?.nama_lengkap }
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <HStack space={1}>
                                                <Clock size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                <Text 
                                                    color={appcolor.teks[mode][1]}>
                                                    { moment(params.checked_at).format('HH:mm') }
                                                </Text>
                                            </HStack>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            }
                        </VStack>
                        <VStack mt={2}>
                            {
                                params.validated_at &&
                                <VStack>
                                    <Text 
                                        fontSize={14}
                                        fontWeight={'semibold'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Tanggal Verified :
                                    </Text>
                                    <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                                            <HStack space={2} alignItems={'center'}>
                                                <Calendar1 size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                <VStack>
                                                    <Text 
                                                        color={appcolor.teks[mode][1]}>
                                                        { moment(params.validated_at).format('dddd, DD MMMM YYYY') }
                                                    </Text>
                                                    <Text 
                                                        lineHeight={'xs'}
                                                        fontFamily={'Abel-Regular'}
                                                        color={appcolor.teks[mode][1]}>
                                                        { params.validated?.nama_lengkap }
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <HStack space={1}>
                                                <Clock size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                <Text 
                                                    color={appcolor.teks[mode][1]}>
                                                    { moment(params.validated_at).format('HH:mm') }
                                                </Text>
                                            </HStack>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            }
                        </VStack>
                        <VStack mt={2}>
                            {
                                params.rejector &&
                                <VStack>
                                    <Text 
                                        fontSize={14}
                                        fontWeight={'semibold'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][5]}>
                                        Ditolak Oleh :
                                    </Text>
                                    <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                        <HStack space={2} alignItems={'center'}>
                                            <UserRemove size="22" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                            <VStack>
                                                <Text 
                                                    color={appcolor.teks[mode][1]}>
                                                    { params.rejector || 'Unknow' }
                                                </Text>
                                                {
                                                    params.rejected_at &&
                                                    <HStack space={2} alignItems={'center'}>
                                                        <Text 
                                                            lineHeight={'xs'}
                                                            fontFamily={'Dosis'}
                                                            fontWeight={'semibold'}
                                                            color={appcolor.teks[mode][1]}>
                                                            { moment(params.rejected_at).format('DD MMM YYYY') }
                                                        </Text>
                                                        <Watch size="15" color={appcolor.teks[mode][3]} variant="Outline"/>
                                                        <Text 
                                                            lineHeight={'xs'}
                                                            fontFamily={'Dosis'}
                                                            fontWeight={'semibold'}
                                                            color={appcolor.teks[mode][1]}>
                                                            { moment(params.rejected_at).format('HH:mm [wita]') }
                                                        </Text>
                                                    </HStack>
                                                }
                                            </VStack>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            }
                        </VStack>
                        {
                            params?.items?.map((m, i) => {
                                if(m.pemasok_id){
                                    var component = 
                                    <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                                        pemasok : {m.pemasok.nama}
                                    </Text>
                                }else if(m.karyawan_id){
                                    var component = 
                                    <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                                        karyawan an. {m.karyawan.nama}
                                    </Text>
                                }else{
                                    var component = 
                                    <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                                        lainnya
                                    </Text>
                                }

                                switch (m.prioritas) {
                                    case 'P1':
                                        var badgePrioritas = <Badge h={6} w={6} p={0} colorScheme={'error'} rounded={'full'}>P1</Badge>
                                        break;
                                    case 'P2':
                                        var badgePrioritas = <Badge h={6} w={6} p={0} colorScheme={'warning'} rounded={'full'}>P2</Badge>
                                        break;
                                    default:
                                        var badgePrioritas = <Badge h={6} w={6} p={0} colorScheme={'info'} rounded={'full'}>P3</Badge>
                                        break;
                                }

                                return(
                                    <HStack key={m.id} my={2} space={2}>
                                        <VStack>
                                            <HStack 
                                                w={7} h={7} 
                                                rounded={'full'} 
                                                borderWidth={1} 
                                                justifyContent={'center'}
                                                alignItems={'center'}
                                                borderColor={appcolor.line[mode][2]}>
                                                <Text color={appcolor.teks[mode][1]}>
                                                    { i + 1}
                                                </Text>
                                            </HStack>
                                            <Stack ml={'14px'} w={'1px'} bg={'#ddd'} flex={1}/>
                                        </VStack>
                                        <VStack flex={1}>
                                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                                <Text 
                                                    fontWeight={'semibold'}
                                                    fontFamily={'Poppins-Regular'}
                                                    color={appcolor.teks[mode][3]}>
                                                    {m.coa.coa_name}
                                                </Text>
                                                { badgePrioritas }
                                            </HStack>
                                            <Text 
                                                lineHeight={'xs'}
                                                fontFamily={'Abel-Regular'}
                                                color={appcolor.teks[mode][2]}>
                                                {m.narasi}
                                            </Text>
                                            <HStack my={1} alignItems={'center'} justifyContent={'space-between'}>
                                                <HStack space={1}>
                                                    <UserOctagon size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                    <VStack>
                                                        <Text color={appcolor.teks[mode][1]}>
                                                            {m.nm_penerima || 'Unset'}
                                                        </Text>
                                                        { component }
                                                    </VStack>
                                                </HStack>
                                            </HStack>
                                            <HStack my={1} alignItems={'center'} justifyContent={'space-between'}>
                                                <HStack space={2}>
                                                    <Buildings size="38" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                    <VStack flex={1}>
                                                        <Text fontWeight={'bold'} color={appcolor.teks[mode][1]}>{m.nm_bank}</Text>
                                                        <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>{m.no_rekening}</Text>
                                                        <Text mt={-1} lineHeight={'xs'} fontFamily={'Dosis'} fontWeight={'semibold'} color={appcolor.teks[mode][4]}>
                                                            {m.type_bayar} ke {m.an_rekening}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </HStack>
                                            <HStack my={1} alignItems={'center'} justifyContent={'space-between'}>
                                                <HStack space={2}>
                                                    <ShoppingCart size="38" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                    <VStack>
                                                        <Text fontWeight={'bold'} color={appcolor.teks[mode][1]}>{m.qty} {m.satuan}</Text>
                                                        <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                                                            Rp. {(m.harga)?.toLocaleString('ID')}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </HStack>
                                            <HStack my={1} alignItems={'center'} justifyContent={'space-between'}>
                                                <HStack space={2}>
                                                    <MoneySend size="38" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                    <VStack>
                                                        <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                                                            {m.ppn_rp > 0 ? `Pajak ${(m.ppn_rp)?.toLocaleString('ID')}` : `Non PPN`}
                                                        </Text>
                                                        <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][6]}>
                                                            SubTot: Rp. { (m.grandtotal)?.toLocaleString('ID') }
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </HStack>
                                            {
                                                m.gudang_id &&
                                                <HStack my={1} alignItems={'center'} justifyContent={'space-between'}>
                                                    <HStack space={2}>
                                                        <TruckFast size="38" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                                        <VStack>
                                                            <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                                                                Barang dikirim ke :
                                                            </Text>
                                                            <Text mt={-1} fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                                                [{m.gudang?.kode}] {m.gudang?.nama}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </HStack>
                                            }
                                        </VStack>
                                    </HStack>
                                )
                            })
                        }
                        <VStack>
                            <VStack mt={2}>
                                <Text 
                                    fontSize={14}
                                    fontWeight={'semibold'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Lampiran Pengajuan :
                                </Text>
                                <Flex space={2} my={2} flexDirection={'row'} flex={1}>
                                    {
                                        params.files.map((m, i) => {
                                            return(
                                                <TouchableOpacity key={m.id} onPress={() => openLampiranFoto(m.url)} style={{marginRight: 10}}>
                                                    <Center mb={2} p={1} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                                                        <HStack h={'80px'} w={'80px'}>
                                                            <Image resizeMode='contain' source={{uri: baseuri + m.url}} alt={'photo-error'} style={{width: 80, height: 80}}/>
                                                        </HStack>
                                                        <Text fontFamily={'Farsan-Regular'} color={appcolor.teks[mode][2]}>lihat photo</Text>
                                                    </Center>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </Flex>
                            </VStack>
                        </VStack>
                        
                    </ScrollView>
                    {
                        ['open', 'approval'].includes(params.status) &&
                        <HStack space={2}>
                            <Button onPress={() => setOpenConfirm(true)} w={'1/3'} colorScheme={'coolGray'}>Tolak</Button>
                            {
                                params.status === 'approval'?
                                <Button onPress={verifiedHandle} flex={1} colorScheme={'lightBlue'}>Verify Keuangan</Button>
                                :
                                <Button onPress={approvalHandle} flex={1} colorScheme={'danger'}>Setujui</Button>
                            }
                        </HStack>
                    }
                </VStack>
                <AlertConfirmation 
                    isOpen={openConfirm}
                    txtConfirm={'Tolak'}
                    title={"Tolak Pengajuan"}
                    subtitle={"Apakah anda yakin akan menolak pengajuan ini ?\n\nJika anda menolak, proses berkas pengajuan akan berhenti sampai disini..."}
                    onClose={() => setOpenConfirm(false)} 
                    onAction={rejectHandle}/>
            </VStack>
        </AppScreen>
    )
}

export default ShowApprovalPengajuanDana