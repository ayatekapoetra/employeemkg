import { ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack, Image, Divider, Badge, Stack, FlatList, Button, View } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { Bag, BrushBig, Calendar1, MoneySend, TruckTick, UserSquare } from 'iconsax-react-native'
import moment from 'moment'
import _ from 'underscore'
import apiFetch from '../../../helpers/ApiFetch'
import { applyAlert } from '../../../redux/alertSlice'
import AlertConfirmation from '../../../components/AlertConfirmation'

const { width } = Dimensions.get('screen')

const ShowPurchaseRequest = () => {
    const { params } = useRoute()
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState(params)
    const [ openConfirmRollback, setOpenConfirmRollback] = useState(false)
    const [ openConfirmDestroy, setOpenConfirmDestroy] = useState(false)
    const [ itemsGrp, setItemsGrp ] = useState(params.items)


    useEffect(() => {
        getDataShow()
    }, [])

    const getDataShow = async () => {
        try {
            const resp = await apiFetch('purchasing-request/'+params.id+'/show')
            const { data } = resp.data
            console.log("RESP---", data);
            setState(data)
            setItemsGrp(data.items)
        } catch (error) {
            console.log(error);
        }
    }
    

    const visiblePemasok = (elm) => {
        setItemsGrp(itemsGrp.map( m => m.pemasok_id === elm.pemasok_id ? {...m, visible: !m.visible}:m))
    }

    const rollbackDataHandle = async () => {
        try {
            const resp = await apiFetch.post('purchasing-request/'+params.id+'/rollback')
            if(resp.status === 201){
                dispatch(applyAlert({
                    show: true,
                    status: "warning",
                    title: "Success Approve Request",
                    subtitle: "Berhasil rollback request order"
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Err Approve Request",
                subtitle: "Gagal rollback request order"
            }))
        }
    }

    const approvalDataHandle = async () => {
        try {
            const resp = await apiFetch.post('purchasing-request/'+params.id+'/update-approve', {...params, pilih: 'Y'})
            if(resp.status === 201){
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success Approve Request",
                    subtitle: "Berhasil menyetujui request order\nData akan dikirim purchasing order..."
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Err Approve Request",
                subtitle: "Gagal menyetujui request order\nData akan dikirim purchasing order..."
            }))
        }
    }

    const removeDataHandle = async () => {
        try {
            const resp = await apiFetch.post('purchasing-request/'+params.id+'/destroy')
            if(resp.status === 201){
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success Delete Request",
                    subtitle: "Berhasil menghapus request order\nData tidak akan ditampilkan lagi..."
                }))

                route.goBack()
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Err Approve Request",
                subtitle: "Gagal menyetujui request order\nStatus data masih aktif..."
            }))
        }
    }

    switch (params.prioritas) {
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

    console.log('state', state);
    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen 
                    title={"Purchase Request Detail"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={null} 
                    onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack space={1}>
                        <Image 
                            alt='...'
                            opacity={.7}
                            resizeMode="contain"
                            source={require('../../../../assets/images/shop-cart.png')} 
                            style={{width: 80, height: 90}}/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={22}
                                    fontFamily={'Teko-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {state?.kode}
                                </Text>
                                {badgePrioritas}
                            </HStack>
                            <Text 
                                mt={-2}
                                fontSize={16}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                By: {state?.author.nama_lengkap}
                            </Text>
                            <HStack space={1}>
                                <Text 
                                    fontSize={14}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][6]}>
                                    [{state?.bisnis.initial}]
                                </Text>
                                <Text 
                                    fontSize={14}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][6]}>
                                    {state?.cabang.nama}
                                </Text>
                            </HStack>
                            <Divider mt={1}/>
                            <HStack justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][3]}>
                                    GrandTotal
                                </Text>
                                {
                                    state?.total_ro ?
                                    <Text 
                                        fontSize={18}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        { "Rp. " + (state?.total_ro)?.toLocaleString('ID') }
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
                    <VStack mt={2}>
                        <Text 
                            fontSize={14}
                            fontWeight={'semibold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Tanggal Buat :
                        </Text>
                        <VStack p={2} borderWidth={1} borderColor={appcolor.line[mode][1]} rounded={'md'}>
                            <HStack space={2}>
                                <Calendar1 size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text 
                                    color={appcolor.teks[mode][1]}>
                                    { moment(state.date_ro).format('dddd, DD MMMM YYYY') }
                                </Text>
                            </HStack>
                        </VStack>
                    </VStack>
                    <ScrollView>
                        <VStack flex={1}>
                            {
                                itemsGrp.map((m,i) => {
                                    return(
                                        <VStack mb={5} flex={1} key={i}>
                                            <HStack my={2} space={2}>
                                                <VStack>
                                                    <TouchableOpacity onPress={() => visiblePemasok(m)}>
                                                        <HStack 
                                                            w={7} h={7} 
                                                            rounded={'full'} 
                                                            borderWidth={1} 
                                                            justifyContent={'center'}
                                                            alignItems={'center'}
                                                            borderColor={appcolor.line[mode][2]}>
                                                            <Text color={appcolor.teks[mode][1]}>
                                                                { i + 1 }
                                                            </Text>
                                                        </HStack>
                                                    </TouchableOpacity>
                                                    <Stack ml={'14px'} w={'1px'} bg={'#ddd'} flex={1}/>
                                                </VStack>
                                                <VStack flex={1}>
                                                    <HStack space={1} justifyContent={'space-between'} alignItems={'flex-start'}>
                                                        <Text 
                                                            flex={1}
                                                            fontSize={18}
                                                            lineHeight={'xs'}
                                                            fontWeight={'semibold'}
                                                            fontFamily={'Dosis-Regular'}
                                                            color={appcolor.teks[mode][1]}>
                                                            {m.nm_pemasok}
                                                        </Text>
                                                        <Text 
                                                            fontFamily={'Dosis'}
                                                            fontWeight={'semibold'}
                                                            color={appcolor.teks[mode][2]}>
                                                            Rp. {m.totharga_ppn_rp}
                                                        </Text>
                                                    </HStack>
                                                    {
                                                        m.visible &&
                                                        <>
                                                            {
                                                                m.items?.length > 0 &&
                                                                m.items.map( item => {
                                                                    return <RenderComponentItem key={item.id} item={item} mode={mode} route={route}/>
                                                                })
                                                            }
                                                        </>
                                                    }
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    )
                                })
                            }
                        </VStack>
                    </ScrollView>
                    {
                        state.status == 'approved' &&
                        <HStack space={2}>
                            <Button onPress={() => setOpenConfirmRollback(true)} flex={1} colorScheme={'error'}>
                                <Text 
                                    color={'#FFF'} 
                                    fontFamily={'Poppins-Regular'} 
                                    fontWeight={'bold'}>
                                    Tolak
                                </Text>
                            </Button>
                            <Button onPress={approvalDataHandle} flex={3} colorScheme={'lightBlue'}>
                                <Text 
                                    color={'#FFF'} 
                                    fontFamily={'Poppins-Regular'} 
                                    fontWeight={'bold'}>
                                    Approve Order
                                </Text>
                            </Button>
                        </HStack>
                    }
                    {
                        state.status == 'active' &&
                        <HStack space={2}>
                            <Button onPress={() => setOpenConfirmDestroy(true)} flex={1} colorScheme={'error'}>
                                <Text 
                                    color={'#FFF'} 
                                    fontFamily={'Poppins-Regular'} 
                                    fontWeight={'bold'}>
                                    Hapus Permintaan
                                </Text>
                            </Button>
                        </HStack>
                    }
                </VStack>

                {
                    openConfirmRollback &&
                    <AlertConfirmation 
                        isOpen={openConfirmRollback}
                        txtConfirm={'Rollback'}
                        title={"Rollback Permintaan"}
                        subtitle={"Apakah anda yakin akan rollback purchase request ini ?"}
                        onClose={() => setOpenConfirmRollback(false)} 
                        onAction={rollbackDataHandle}/>
                }

                {
                    openConfirmDestroy &&
                    <AlertConfirmation 
                        isOpen={openConfirmDestroy}
                        txtConfirm={'Delete'}
                        title={"Hapus Permintaan"}
                        subtitle={"Apakah anda yakin akan menghapus purchase request ini ?"}
                        onClose={() => setOpenConfirmDestroy(false)} 
                        onAction={removeDataHandle}/>
                }
            </VStack>
        </AppScreen>
    )
}

export default ShowPurchaseRequest

const RenderComponentItem = ( { item, mode, route } ) => {

    const routingDetailHandle = () => {
        route.navigate('approval-purchase-request-item-details', item)
    }

    return(
        <TouchableOpacity onPress={routingDetailHandle}>
            
            <VStack 
                my={2} 
                py={1} 
                px={2}
                flex={1} 
                borderWidth={1} 
                borderColor={appcolor.line[mode][2]} 
                borderStyle={'dashed'} rounded={'md'}>
                <VStack mt={3}>
                    <HStack justifyContent={'space-between'}>
                        <Text 
                            fontSize={14}
                            fontWeight={'semibold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Nama Barang :
                        </Text>
                        {
                            item.userApprove ?
                            <View px={3} zIndex={99} h={'20px'} bg={'amber.400'} rounded={'full'}>
                                <Text fontWeight={'semibold'} fontFamily={'Poppins'} color={'#FFF'}>approved</Text>
                            </View>
                            :
                            <View px={3} zIndex={99} h={'20px'} bg={'success.500'} rounded={'full'}>
                                <Text fontWeight={'semibold'} fontFamily={'Poppins'} color={'#FFF'}>waiting</Text>
                            </View>
                        }

                    </HStack>
                    <VStack py={1}>
                        <HStack px={2} space={2}>
                            <BrushBig size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    mr={3}
                                    lineHeight={'xs'}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { item.barang?.nama || 'Belum ditentukan' }
                                </Text>
                                <Text 
                                    flex={1}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][3]}>
                                    { item.barang?.kode || '???' }
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>
                </VStack>
                <VStack borderTopWidth={.5} borderTopColor={appcolor.line[mode][1]} rounded={'md'}>
                    <Text 
                        fontSize={14}
                        fontWeight={'semibold'}
                        fontFamily={'Abel-Regular'}
                        color={appcolor.teks[mode][2]}>
                        Jumlah Barang :
                    </Text>
                    <VStack px={2} py={1}>
                        <HStack space={2} alignItems={'center'}>
                            <Bag size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <Text 
                                flex={1}
                                lineHeight={'xs'}
                                fontSize={18}
                                fontWeight={'semibold'}
                                fontFamily={'Quicksand-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { item.qty_acc } { item.stn }
                            </Text>
                            <MoneySend size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <Text 
                                flex={1}
                                lineHeight={'xs'}
                                fontSize={16}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { (item.tot_harga)?.toLocaleString('ID') } 
                            </Text>
                        </HStack>
                    </VStack>
                </VStack>
                {
                    item.equipment &&
                    <VStack borderTopWidth={.5} borderTopColor={appcolor.line[mode][1]} rounded={'md'}>
                        <Text 
                            fontSize={14}
                            fontWeight={'semibold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Equipment :
                        </Text>
                        <VStack px={2} py={1}>
                            <HStack space={2} alignItems={'center'}>
                                <TruckTick size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text 
                                    flex={1}
                                    lineHeight={'xs'}
                                    fontSize={18}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { item.equipment?.kode }
                                </Text>
                                <Text 
                                    flex={1}
                                    lineHeight={'xs'}
                                    fontSize={16}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { item.equipment?.manufaktur } 
                                </Text>
                            </HStack>
                        </VStack>
                    </VStack>
                }

                {
                    item.userValidate &&
                    <VStack borderTopWidth={.5} borderTopColor={appcolor.line[mode][1]} rounded={'md'}>
                        <Text 
                            fontSize={14}
                            fontWeight={'semibold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Validated By :
                        </Text>
                        <VStack px={2} py={1}>
                            <HStack space={2} alignItems={'center'}>
                                <UserSquare size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        flex={1}
                                        lineHeight={'xs'}
                                        fontSize={18}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { item.userValidate?.nama_lengkap }
                                    </Text>
                                    {
                                        item.date_validated &&
                                        <Text 
                                            flex={1}
                                            lineHeight={'xs'}
                                            fontSize={12}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(item.date_validated).format('dddd, DD MMMM YYYY') } 
                                        </Text>
                                    }

                                </VStack>
                            </HStack>
                        </VStack>
                    </VStack>
                }

                {
                    item.userApprove &&
                    <VStack borderTopWidth={.5} borderTopColor={appcolor.line[mode][1]} rounded={'md'}>
                        <Text 
                            fontSize={14}
                            fontWeight={'semibold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Approved By :
                        </Text>
                        <VStack px={2} py={1}>
                            <HStack space={2} alignItems={'center'}>
                                <UserSquare size="32" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        flex={1}
                                        lineHeight={'xs'}
                                        fontSize={18}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { item.userApprove?.nama_lengkap||'???' }
                                    </Text>
                                    {
                                        item.date_validated &&
                                        <Text 
                                            flex={1}
                                            lineHeight={'xs'}
                                            fontSize={12}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(item.date_approved).format('dddd, DD MMMM YYYY') } 
                                        </Text>
                                    }

                                </VStack>
                            </HStack>
                        </VStack>
                    </VStack>
                }
            </VStack>
        </TouchableOpacity>
    )
}