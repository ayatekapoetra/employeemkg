import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack, Image, Divider, Badge } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import apiFetch from '../../../helpers/ApiFetch'
import { useDispatch, useSelector } from 'react-redux'
import { applyAlert } from '../../../redux/alertSlice'
import appcolor from '../../../common/colorMode'
import { Eye, EyeSlash, Setting2, Size } from 'iconsax-react-native'
import moment from 'moment'
import _ from 'underscore'
import LoadingHauler from '../../../components/LoadingHauler'
import BadgeAlt from '../../../components/BadgeAlt'
import FilterEquipmentServices from './filter'

const ReportMaintenanceScreen = () => {
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ state, setState ] = useState(null)
    const [ showFilter, setShowFilter ] = useState(false)
    const [ refresing, setRefreshing ] = useState(false)
    const [ smallBoard, setSmallBoard ] = useState(false)
    const [ qstring, setQstring ] = useState({
        equipment_id: [],
        status: null
    })

    const [ summary, setSummary ] = useState({
        breakdown: '00',
        ditangani: '00',
        waitpart: '00',
        waitteknisi: '00',
    })

    useEffect(() => {
        onGetDataHandle(qstring)
    }, [])

    const openFilter = () => setShowFilter(!showFilter)

    const onApplyFilter = useCallback(() => {
        onGetDataHandle(qstring)
        setShowFilter(false)

    })

    const onResetFilter = useCallback(() => {
        onGetDataHandle({
            equipment_id: [],
            status: null
        })
        setShowFilter(false)

    })

    const onGetDataHandle = async (params = null) => {
        try {
            const resp = await apiFetch.get('/signage-services', {params: params})
            const { data } = resp.data
            setState(data)
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Error',
                subtitle: error.message
            }))
        }

        try {
            const resp = await apiFetch.get('/signage-services/barcount', {params: params})
            setSummary(resp.data)
            setRefreshing(false)
        } catch (error) {
            console.log(error);
            setRefreshing(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Error',
                subtitle: error.message
            }))
        }
    }

    

    const onRefresh = useCallback(() => {
        onGetDataHandle(qstring)
    }, [smallBoard])

    if (refresing) {
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen title={"Equipment Maintenances"} onBack={true} onThemes={true} onFilter={null} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Equipment Maintenances"} onBack={true} onThemes={true} onFilter={openFilter} onNotification={true}/>
                {
                    showFilter ?
                    <FilterEquipmentServices 
                        onClose={openFilter} 
                        qstring={qstring} 
                        setQstring={setQstring}
                        onApplyFilter={onApplyFilter} 
                        onResetFilter={onResetFilter}/>
                    :
                    <VStack flex={1}>
                        <VStack mx={3}>
                            {
                                smallBoard ?
                                <VStack>
                                    <HStack mb={2} space={2}>
                                        <HStack px={3} flex={1} bg={'danger.100'} rounded={'xs'} justifyContent={'space-between'} alignItems={'center'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'error.800'}>Breakdown</Text>
                                            <Text>{summary.breakdown}</Text>
                                        </HStack>
                                        <HStack px={3} flex={1} bg={'amber.200'} rounded={'xs'} justifyContent={'space-between'} alignItems={'center'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'yellow.800'}>Menunggu Teknisi</Text>
                                            <Text>{summary.waitteknisi}</Text>
                                        </HStack>
                                    </HStack>
                                    <HStack space={2}>
                                        <HStack px={3} flex={1} bg={'blue.200'} rounded={'xs'} justifyContent={'space-between'} alignItems={'center'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'blue.800'}>Menunggu Part</Text>
                                            <Text>{summary.waitpart}</Text>
                                        </HStack>
                                        <HStack px={3} flex={1} bg={'success.200'} rounded={'xs'} justifyContent={'space-between'} alignItems={'center'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'success.800'}>Dalam Pengerjaan</Text>
                                            <Text>{summary.ditangani}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                                :
                                <VStack>
                                    <HStack mb={3} space={3}>
                                        <VStack p={2} flex={1} bg={'danger.100'} rounded={'lg'} shadow={'3'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'error.800'} fontSize={16}>Unit Breakdown</Text>
                                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                                <Image resizeMode="contain" source={require('../../../../assets/images/excavator.png')} alt='...' style={{ width: 70, height: 70 }}/>
                                                <VStack alignItems={'flex-end'}>
                                                    <Text 
                                                        fontSize={45}
                                                        fontWeight={'bold'}
                                                        color={'error.800'}
                                                        fontFamily={'Dosis-Regular'}>
                                                        {summary.breakdown}
                                                    </Text>
                                                    <Text 
                                                        mt={-3}
                                                        fontSize={12}
                                                        fontFamily={'Abel-Regular'}>
                                                        Equipment Unit
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                        <VStack p={2} flex={1} bg={'amber.200'} rounded={'lg'} shadow={'3'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'yellow.800'} fontSize={16}>Menunggu Teknisi</Text>
                                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                                <Image resizeMode="contain" source={require('../../../../assets/images/technician.png')} alt='...' style={{ width: 70, height: 70 }}/>
                                                <VStack alignItems={'flex-end'}>
                                                    <Text 
                                                        fontSize={45}
                                                        fontWeight={'bold'}
                                                        color={'yellow.800'}
                                                        fontFamily={'Dosis-Regular'}>
                                                        {summary.waitteknisi}
                                                    </Text>
                                                    <Text 
                                                        mt={-3}
                                                        fontSize={12}
                                                        fontFamily={'Abel-Regular'}>
                                                        Equipment Unit
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                    <HStack space={3}>
                                        <VStack p={2} flex={1} bg={'blue.200'} rounded={'lg'} shadow={'3'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'blueGray.800'} fontSize={16}>Menunggu Part</Text>
                                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                                <Image resizeMode="contain" source={require('../../../../assets/images/cart-part-2.png')} alt='...' style={{ width: 70, height: 70 }}/>
                                                <VStack alignItems={'flex-end'}>
                                                    <Text 
                                                        fontSize={45}
                                                        fontWeight={'bold'}
                                                        color={'darkBlue.800'}
                                                        fontFamily={'Dosis-Regular'}>
                                                        {summary.waitpart}
                                                    </Text>
                                                    <Text 
                                                        mt={-3}
                                                        fontSize={12}
                                                        fontFamily={'Abel-Regular'}>
                                                        Equipment Unit
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                        <VStack p={2} flex={1} bg={'success.200'} rounded={'lg'} shadow={'3'}>
                                            <Text fontFamily={'Dosis-Regular'} fontWeight={'bold'} color={'success.800'} fontSize={16}>Dalam Pengerjaan</Text>
                                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                                <Image resizeMode="contain" source={require('../../../../assets/images/sparepart.png')} alt='...' style={{ width: 70, height: 70 }}/>
                                                <VStack alignItems={'flex-end'}>
                                                    <Text 
                                                        fontSize={45}
                                                        fontWeight={'bold'}
                                                        color={'success.800'}
                                                        fontFamily={'Dosis-Regular'}>
                                                        {summary.ditangani}
                                                    </Text>
                                                    <Text 
                                                        mt={-3}
                                                        fontSize={12}
                                                        fontFamily={'Abel-Regular'}>
                                                        Equipment Unit
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            }
                        </VStack>
                        {/* LIST ITEMS */}
                        <VStack flex={1} px={3} mt={3}>
                            <TouchableOpacity onPressOut={() => setSmallBoard(!smallBoard)}>
                                <HStack p={2} mb={2} rounded={'sm'} bg={appcolor.box[mode]} justifyContent={'space-between'}>
                                    <HStack space={1}>
                                        <Setting2 size="22" color={appcolor.teks[mode][3]} variant={"Bulk"}/>
                                        <Text color={appcolor.teks[mode][1]}>
                                            {!smallBoard ? 'Kecilkan Tampilan Board':'Besarkan Tampilan Board'}
                                        </Text>
                                    </HStack>
                                    <Size size="22" color={appcolor.teks[mode][1]} variant={"Bulk"}/>
                                </HStack>
                            </TouchableOpacity>
                            <FlatList 
                                data={state} 
                                keyExtractor={i => i.id} 
                                showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={refresing} onRefresh={onRefresh} />}
                                renderItem={( { item } ) => <RenderItemComponent item={item} mode={mode}/>}/>
                        </VStack>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default ReportMaintenanceScreen

const RenderItemComponent = ( { item, mode } ) => {
    const [ visible, setVisible ] = useState(false)

    switch (item.status) {
        case 2:
            var badgeStatus = <BadgeAlt rounded={"full"} type={"success"} colorScheme={"success.200"} title={"on services"}/>
            break;
        case 1:
            var badgeStatus = <BadgeAlt rounded={"full"} type={"info"} colorScheme={"blue.200"} title={"wait part"}/>
            break;
        case 0:
            var badgeStatus = <BadgeAlt rounded={"full"} type={"warning"} colorScheme={"yellow.200"} title={"wait teknisi"}/>
            break;
        default:
            var badgeStatus = <BadgeAlt rounded={"full"} type={"danger"} colorScheme={"muted.200"} title={"work done"}/>
            break;
    }
    return(
        <VStack py={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
            <HStack alignItems={'center'} justifyContent={'space-between'}>
                <VStack>
                    <Text 
                        fontSize={18}
                        fontWeight={800}
                        fontFamily={'Quicksand-SemiBold'} 
                        color={appcolor.teks[mode][1]}>
                        {item.kode_unit}
                    </Text>
                    <Text 
                        mt={-1}
                        fontWeight={'semibold'}
                        fontFamily={'Abel-Regular'} 
                        color={appcolor.teks[mode][1]}>
                        {item.lokasi.nama}
                    </Text>
                </VStack>
                {badgeStatus}
            </HStack>
            <Text 
                mt={-1}
                fontWeight={'semibold'}
                fontFamily={'Abel-Regular'} 
                color={appcolor.teks[mode][6]}>
                {moment(item.breakdown_at).format('dddd, DD MMMM YYYY')}
            </Text>
            <VStack px={2} pb={1} borderWidth={.5} borderColor={appcolor.line[mode][2]} borderStyle={'dashed'} rounded={'md'}>
                <VStack>
                    <TouchableOpacity onPress={() => setVisible(!visible)}>
                        <HStack mt={1} alignItems={'center'} justifyContent={'space-between'}>
                            <Text fontFamily={'Poppins-Regular'} color={appcolor.teks[mode][3]}>Problem Issue :</Text>
                            {
                                visible ?
                                <EyeSlash size="22" color={appcolor.teks[mode][1]} variant={"Bulk"}/>
                                :
                                <Eye size="22" color={appcolor.teks[mode][1]} variant={"Bulk"}/>
                            }
                        </HStack>
                    </TouchableOpacity>
                    <Divider/>
                    {
                        item.items.map( m => {
                            return(
                            <VStack key={m.id}>
                                    <VStack>
                                        <Text color={appcolor.teks[mode][1]}>{m.problem_issue}</Text>
                                    </VStack>
                            </VStack>
                            )
                        })
                    }
                </VStack>
                <VStack>
                    {
                        visible &&
                        <VStack>
                            <Text fontFamily={'Poppins-Regular'} color={appcolor.teks[mode][3]}>Services Action :</Text>
                            <Divider/>
                            {
                                item.items.map( m => {
                                    return(
                                    <VStack key={m.id}>
                                            <VStack>
                                                <Text flexWrap={'wrap'} color={appcolor.teks[mode][1]}>{m.services_act}</Text>
                                            </VStack>
                                    </VStack>
                                    )
                                })
                            }
                        </VStack>
                    }
                </VStack>
            </VStack>
            <HStack mt={1} alignItems={'center'} justifyContent={'flex-end'}>
                
                <Text 
                    fontWeight={'semibold'}
                    fontFamily={'Abel-Regular'} 
                    color={appcolor.teks[mode][2]}>
                    {moment(item.date_issue).fromNow()}
                </Text>
            </HStack>
        </VStack>
    )
}