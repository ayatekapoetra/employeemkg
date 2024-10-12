import { FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { VStack, Text, HStack, View, Divider, ScrollView, Actionsheet, Center, Stack, Badge, Spinner } from 'native-base'
import AppScreen from '../../../components/AppScreen'
import HeaderScreen from '../../../components/HeaderScreen'
import { MYICON } from '../../../../assets/images'
import CardStep from './cart-step'
import { ArrowCircleDown, ArrowCircleUp, Buildings, CloseCircle, Danger, InfoCircle, Map, SidebarTop, TagUser, TruckTick, UserSquare } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit'
import moment from 'moment'
import FilterPurchaseMonitoring from './filter'
import apiFetch from '../../../helpers/ApiFetch'
import LoadingHauler from '../../../components/LoadingHauler'
import { getNewRequst } from '../../../redux/docNewRequestSlice'
import { getCheckRequst } from '../../../redux/docCheckRequestSlice'
import { getWaitOrder } from '../../../redux/docWaitOrderSlice'
import { getVerifyOrder } from '../../../redux/docVerifyOrderSlice'
import { getWaitPayment } from '../../../redux/docWaitPaymentSlice'
import { getWaitPart } from '../../../redux/docWaitPartSlice'
import LoadingSpinner from '../../../components/LoadingSpinner'

const PurchaseMonitoring = () => {
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const { newreq, loadnewreq } = useSelector( state => state.newRequest)
    const { checkreq, loadcheck } = useSelector( state => state.checkRequest)
    const { loadwaitorder, waitorder } = useSelector( state => state.waitOrder)
    const { loadverifyorder, verifyorder } = useSelector( state => state.verifyOrder)
    const { loadwaitpay, waitpayment } = useSelector( state => state.waitPay)
    const { loadwaitpart, waitpart } = useSelector( state => state.waitPart)
    const [ isSmall, setSmall ] = useState(false)
    const [ refreshing, setRefreshing ] = useState(false)
    const [ openSheet, setOpenSheet ] = useState(false)
    const [ openFilter, setOpenFilter ] = useState(false)
    const [ dataSheet, setDataSheet ] = useState(null)
    const [ state, setState ] = useState(null)
    const [ qstring, setQstring ] = useState({
        berkasGroup: '',
        berkas: '',
        kode: '',
        nm_berkas: '',
        bisnis_id: user?.bisnis_id,
        nm_bisnis: user?.nm_bisnis,
        barang_id: null,
        barang: null,
        pemasok_id: null,
        nm_pemasok: null,
        dateStart: moment('2024-01-01').format('YYYY-MM-DD'),
        dateEnd: moment().format('YYYY-MM-DD')
    })
    
    useEffect(() => {
        getDataHandle(qstring)
    }, [])

    useEffect(() => {
        dispatch(getNewRequst(qstring))
        dispatch(getCheckRequst(qstring))
        dispatch(getWaitOrder(qstring))
        dispatch(getVerifyOrder(qstring))
        dispatch(getWaitPayment(qstring))
        dispatch(getWaitPart(qstring))
    }, [user, qstring])

    const getDataHandle = async (params = qstring) => {
        setRefreshing(true)
        try {
            const resp = await apiFetch.post('report-berkas-monitoring/document-list', params)
            setState(resp.data)
            console.log(resp.data);
            setRefreshing(false)
        } catch (error) {
            console.log(error);
            setRefreshing(false)
        }
    }
    
    const onToggleFilterHandle = () => {
        setOpenFilter(!openFilter)
    }

    const applyFilterHandle = () => {
        
        getDataHandle(qstring)
        onToggleFilterHandle()
    }

    const resetFilterHandle = useCallback(() => {
        setQstring({
            berkasGroup: '',
            berkas: '',
            kode: '',
            nm_berkas: '',
            bisnis_id: user?.bisnis_id,
            nm_bisnis: user?.nm_bisnis,
            barang_id: null,
            barang: null,
            dateStart: moment('2024-01-01').format('YYYY-MM-DD'),
            dateEnd: moment().format('YYYY-MM-DD')
        })
        getDataHandle(qstring)
        onToggleFilterHandle()
    }, [qstring])

    const onCardClickHandle = useCallback((params) => {
        if(params){
            setQstring({...qstring, berkasGroup: params})
            getDataHandle({...qstring, berkasGroup: params})
        }
    }, [qstring])

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Purchase Monitoring"} onBack={true} onThemes={true} onFilter={onToggleFilterHandle} onNotification={true}/>
                {
                    openFilter ?
                    <FilterPurchaseMonitoring qstring={qstring} setQstring={setQstring} applyFilter={applyFilterHandle} resetFilter={resetFilterHandle}/>
                    :
                    <VStack flex={1} px={3}>
                        <VStack flex={1}>
                            {
                                isSmall ?
                                <VStack>
                                    <HStack space={2} w={'full'} justifyContent={'space-between'}>
                                        <HStack py={1} px={2} mb={2} rounded={'md'} flex={1} justifyContent={'space-between'} borderWidth={1} borderColor={'error.400'}>
                                            <Text flex={1} onPress={() => onCardClickHandle('new-request')} color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>New Request</Text>
                                            <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{newreq?.len||0}</Text>
                                        </HStack>
                                        <HStack py={1} px={2} mb={2} rounded={'md'} flex={1} justifyContent={'space-between'} borderWidth={1} borderColor={'warning.400'}>
                                            <Text flex={1} onPress={() => onCardClickHandle('check-request')} color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>Wait Approveal</Text>
                                            <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{checkreq?.len||0}</Text>
                                        </HStack>
                                    </HStack>
                                    <HStack space={2} w={'full'} justifyContent={'space-between'}>
                                        <HStack py={1} px={2} mb={2} rounded={'md'} flex={1} justifyContent={'space-between'} borderWidth={1} borderColor={'muted.400'}>
                                            <Text flex={1} onPress={() => onCardClickHandle('wait-order')} color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>Wait Order</Text>
                                            <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{waitorder?.len||0}</Text>
                                        </HStack>
                                        <HStack py={1} px={2} mb={2} rounded={'md'} flex={1} justifyContent={'space-between'} borderWidth={1} borderColor={'purple.400'}>
                                            <Text flex={1} onPress={() => onCardClickHandle('verify-order')} color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>Wait Verify</Text>
                                            <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{verifyorder?.len||0}</Text>
                                        </HStack>
                                    </HStack>
                                    <HStack space={2} w={'full'} justifyContent={'space-between'}>
                                        <HStack py={1} px={2} mb={2} rounded={'md'} flex={1} justifyContent={'space-between'} borderWidth={1} borderColor={'info.400'}>
                                            <Text flex={1} onPress={() => onCardClickHandle('wait-payment')} color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>Wait Payment</Text>
                                            <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{waitpayment?.len||0}</Text>
                                        </HStack>
                                        <HStack py={1} px={2} mb={2} rounded={'md'} flex={1} justifyContent={'space-between'} borderWidth={1} borderColor={'success.400'}>
                                            <Text flex={1} onPress={() => onCardClickHandle('wait-part')} color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>Wait Part</Text>
                                            <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{waitpart?.len||0}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                                :
                                <VStack>
                                    <HStack mb={1} h={'120px'} space={1} alignItems={'center'} justifyContent={'space-around'}>
                                        <TouchableOpacity onPress={() => onCardClickHandle('new-request')} style={{flex: 1}}>
                                            <CardStep 
                                                loading={loadnewreq}
                                                color={'error.400'} 
                                                title={'New Request'} 
                                                total={newreq?.len||0} 
                                                price={newreq?.total_rp||0} 
                                                ico={'shopCart'}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onCardClickHandle('check-request')} style={{flex: 1}}>
                                            <CardStep 
                                                loading={loadcheck}
                                                color={'warning.400'} 
                                                title={'Waiting Approval'} 
                                                total={checkreq?.len||0} 
                                                price={checkreq?.total_rp||0} 
                                                ico={'approval'}/>
                                        </TouchableOpacity>
                                    </HStack>
                                    <HStack mb={1} h={'120px'} space={1} alignItems={'center'} justifyContent={'space-around'}>
                                        <TouchableOpacity onPress={() => onCardClickHandle('wait-order')} style={{flex: 1}}>
                                            <CardStep 
                                                loading={loadwaitorder}
                                                color={'gray.600'} 
                                                title={'Waiting P.Order'} 
                                                total={waitorder?.len||0} 
                                                price={waitorder?.total_rp||0} 
                                                ico={'waitOrder'}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onCardClickHandle('verify-order')} style={{flex: 1}}>
                                            <CardStep 
                                                loading={loadverifyorder}
                                                color={'purple.500'} 
                                                title={'Waiting Verification'} 
                                                total={verifyorder?.len||0} 
                                                price={verifyorder?.total_rp||0} 
                                                ico={'verifyOrder'}/>
                                        </TouchableOpacity>
                                    </HStack>
                                    <HStack mb={1} h={'120px'} space={1} alignItems={'center'} justifyContent={'space-around'}>
                                        <TouchableOpacity onPress={() => onCardClickHandle('wait-payment')} style={{flex: 1}}>
                                            <CardStep 
                                                loading={loadwaitpay}
                                                color={'info.600'} 
                                                title={'Waiting Payment'} 
                                                total={waitpayment?.len||0} 
                                                price={waitpayment?.total_rp||0} 
                                                ico={'wallet'}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onCardClickHandle('wait-part')} style={{flex: 1}}>
                                            <CardStep 
                                                loading={loadwaitpart}
                                                color={'success.500'} 
                                                title={'Waiting Part'} 
                                                total={waitpart?.len||0} 
                                                price={waitpart?.total_rp||0} 
                                                ico={'waitPart'}/>
                                        </TouchableOpacity>
                                    </HStack>
                                </VStack>
                            }
                            <HStack space={1}>
                                <HStack flex={1} alignItems={'center'}>
                                    <Divider/>
                                </HStack>
                                <TouchableOpacity onPress={() => setSmall(!isSmall)}>
                                    {
                                        isSmall ?
                                        <ArrowCircleDown size="32" color={appcolor.ico[mode][1]} variant="Bulk" />
                                        :
                                        <ArrowCircleUp size="32" color={appcolor.ico[mode][1]} variant="Bulk" />
                                    }
                                </TouchableOpacity>
                                <HStack flex={1} alignItems={'center'}>
                                    <Divider/>
                                </HStack>
                            </HStack>
                            <VStack flex={1}>
                                {
                                    refreshing ?
                                    <LoadingSpinner/>
                                    :
                                    <FlatList 
                                    data={state?.list}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({item}) => <RenderComponentItem item={item} mode={mode} setOpenSheet={setOpenSheet} setDataSheet={setDataSheet}/>}
                                    keyExtractor={item => item.urut}/>
                                }
                            </VStack>
                        </VStack>
                    </VStack>
                }
                <Actionsheet isOpen={openSheet} onClose={() => setOpenSheet(false)}>
                    <Actionsheet.Content>
                    <VStack w={'full'} h={'full'}>
                        <Center mb={1}>
                            <Text fontFamily={'Poppins'} fontSize={18} fontWeight={'bold'} lineHeight={'xs'} textAlign={'center'}>
                                {dataSheet?.nmbrg}
                            </Text>
                            <Text fontFamily={'Quicksand'} fontWeight={'bold'} fontSize={14} lineHeight={'xs'}>
                                {dataSheet?.kdbrg}
                            </Text>
                            <Text fontFamily={'Dosis-Regular'} fontWeight={'semibold'} fontSize={12} lineHeight={'xs'}>
                                {dataSheet?.numpart}
                            </Text>
                            <Text fontFamily={'Abel-Regular'} fontSize={10} lineHeight={'xs'}>
                                #{dataSheet?.barang_id}
                            </Text>
                        </Center>
                        <ScrollView showsVerticalScrollIndicator={false} h={'500px'}>
                            <VStack space={2}>
                                <VStack flex={1}>
                                    <HStack h={'30px'} alignItems={'center'}>
                                        <Text fontFamily={'Poppins'} fontWeight={'bold'}>Purchasing Request</Text>
                                    </HStack>
                                    <VStack p={2} bg={'error.100'} rounded={'md'}>
                                        <TextComponentItem title="Kode Request" value={dataSheet?.kdpr}/>
                                        <TextComponentItem title="Gudang Request" value={dataSheet?.nmgudang}/>
                                        <TextComponentItem title="Tanggal Berkas" value={dataSheet?.date_ro ? moment(dataSheet.date_ro).format('dddd, DD MMMM YYYY'):'-'}/>
                                        <TextComponentItem title="Jumlah Barang" value={`${(dataSheet?.qty)?.toLocaleString('ID')} ${dataSheet?.uom||''}`}/>
                                        <TextComponentItem title="Harga Barang" value={'Rp. '+ (dataSheet?.harga||0)?.toLocaleString('ID')}/>
                                        <TextComponentItem title="PPn" value={'Rp. '+ (dataSheet?.ppn_rp||0)?.toLocaleString('ID')}/>
                                        <TextComponentItem title="User Checked" value={(dataSheet?.checked_pr||'-')}/>
                                        <TextComponentItem noborder title="User Approved" value={(dataSheet?.validated_pr||'-')}/>
                                    </VStack>
                                    <HStack h={'30px'} alignItems={'center'}>
                                        <Text fontFamily={'Poppins'} fontWeight={'bold'}>Purchasing Order</Text>
                                    </HStack>
                                    <VStack p={2} bg={'warning.100'} rounded={'md'}>
                                        <TextComponentItem title="Kode Order" value={dataSheet?.kdpo}/>
                                        <TextComponentItem title="Tanggal Order" value={dataSheet?.request_date ? moment(dataSheet?.request_date).format('dddd, DD MMMM YYYY'):'-'}/>
                                        <TextComponentItem title="Nama Pemasok" value={dataSheet?.nmpemasok}/>
                                        <TextComponentItem noborder title="User Verify" value={dataSheet?.nama_verified}/>
                                    </VStack>
                                    <HStack h={'30px'} alignItems={'center'}>
                                        <Text fontFamily={'Poppins'} fontWeight={'bold'}>Payment Order</Text>
                                    </HStack>
                                    <VStack p={2} bg={'info.100'} rounded={'md'}>
                                        <TextComponentItem title="Kode Bayar" value={dataSheet?.kdbayar}/>
                                        <TextComponentItem noborder title="Tanggal Bayar" value={dataSheet?.trx_date ? moment(dataSheet?.trx_date).format('dddd, DD MMMM YYYY'):'-'}/>
                                    </VStack>
                                    <HStack h={'30px'} alignItems={'center'}>
                                        <Text fontFamily={'Poppins'} fontWeight={'bold'}>Shipping Proses</Text>
                                    </HStack>
                                    <VStack p={2} bg={'success.100'} rounded={'md'}>
                                        <TextComponentItem title="Kode Shipping" value={dataSheet?.kdsj}/>
                                        <TextComponentItem noborder title="Tanggal Shipping" value={dataSheet?.shipp_date ? moment(dataSheet?.shipp_date).format('dddd, DD MMMM YYYY'):'-'}/>
                                    </VStack>
                                </VStack>
                            </VStack>
                        </ScrollView>
                    </VStack>
                    </Actionsheet.Content>
                </Actionsheet>
            </VStack>   
        </AppScreen>
    )
}

export default PurchaseMonitoring

const TextComponentItem = ({noborder, title, value}) => {
    return(
        <HStack py={1} borderBottomWidth={noborder?0:.5} borderBottomColor={'#C4C4C4'} alignItems={'center'} justifyContent={'space-between'}>
            <Text flex={1} fontFamily={'Dosis-Regular'} fontSize={14} fontWeight={'semibold'} lineHeight={'xs'}>
                {title}
            </Text>
            <Text fontFamily={'Dosis-Regular'} fontSize={14} fontWeight={'semibold'} lineHeight={'xs'}>
                {'=>'}
            </Text>
            <Text flex={2} textAlign={'right'} lineHeight={'xs'} fontFamily={'Quicksand-Regular'} fontSize={14} fontWeight={'semibold'}>{value}</Text>
        </HStack>
    )
}


const RenderComponentItem = ( { item, mode, setOpenSheet, setDataSheet } ) => {
    // console.log(item);

    const viewDetailSheetHandle = () => {
        setDataSheet(item)
        setOpenSheet(true)
    }

    return(
        <VStack py={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][2]}>
            <TouchableOpacity key={item} onPress={viewDetailSheetHandle}>
                <Text 
                    fontSize={12}
                    fontFamily={'Abel-Regular'}
                    color={appcolor.teks[mode][2]}>
                    {item.kdbrg}
                </Text>
                <Text 
                    fontSize={20}
                    lineHeight={'xs'}
                    fontWeight={'semibold'}
                    fontFamily={'Quicksand'}
                    color={appcolor.teks[mode][1]}>
                    {item.nmbrg}
                </Text>
                <Text 
                    fontSize={12}
                    color={appcolor.teks[mode][2]}>
                    NUMPART: {item.numpart}
                </Text>
            </TouchableOpacity>
            <HStack mt={3} w={'full'} alignItems={'center'}>
                {
                    item.stsberkas === 'new-request' &&
                    <HStack p={1} w={'full'} position={'relative'} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                        <HStack bg={"error.400"} w={'1/6'} h={3}></HStack>
                        <Text fontFamily={'Teko'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} position={'absolute'} right={1}>progress 15%</Text>
                    </HStack>
                }
                {
                    item.stsberkas === 'check-request' &&
                    <HStack p={1} w={'full'} borderWidth={1} position={'relative'} borderColor={appcolor.line[mode][1]}>
                        <HStack bg={"warning.400"} w={'2/6'} h={3}></HStack>
                        <Text fontFamily={'Teko'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} position={'absolute'} right={1}>progress 30%</Text>
                    </HStack>
                }
                {
                    item.stsberkas === 'wait-order' &&
                    <HStack p={1} w={'full'} borderWidth={1} position={'relative'} borderColor={appcolor.line[mode][1]}>
                        <HStack bg={"muted.400"} w={'3/6'} h={3}></HStack>
                        <Text fontFamily={'Teko'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} position={'absolute'} right={1}>progress 45%</Text>
                    </HStack>
                }
                {
                    item.stsberkas === 'verify-order' &&
                    <HStack p={1} w={'full'} borderWidth={1} position={'relative'} borderColor={appcolor.line[mode][1]}>
                        <HStack bg={"purple.500"} w={'4/6'} h={3}></HStack>
                        <Text fontFamily={'Teko'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} position={'absolute'} right={1}>progress 60%</Text>
                    </HStack>
                }
                {
                    item.stsberkas === 'wait-payment' &&
                    <HStack p={1} w={'full'} borderWidth={1} position={'relative'} borderColor={appcolor.line[mode][1]}>
                        <HStack bg={"info.500"} w={'5/6'} h={3}></HStack>
                        <Text fontFamily={'Teko'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} position={'absolute'} right={1}>progress 75%</Text>
                    </HStack>
                }
                {
                    item.stsberkas === 'wait-part' &&
                    <HStack p={1} w={'full'} borderWidth={1} position={'relative'} borderColor={appcolor.line[mode][1]}>
                        <HStack bg={"success.500"} w={'full'} h={3}></HStack>
                        <Text fontFamily={'Teko'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} position={'absolute'} right={1}>progress 100%</Text>
                    </HStack>
                }
            </HStack>
            <HStack justifyContent={'space-between'}>
                <Text color={appcolor.teks[mode][1]}>{item.kdpr}</Text>
                <Text color={appcolor.teks[mode][1]} fontFamily={'Abel-Regular'}>{item.stsberkas}</Text>
            </HStack>
        </VStack>
        
    )
}

