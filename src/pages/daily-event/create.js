import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { HStack, VStack, Text, Button, Flex, ScrollView } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import LoadingHauler from '../../components/LoadingHauler'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { CloseCircle, CloseSquare, Danger, Signpost, SmartCar, Watch, WatchStatus } from 'iconsax-react-native'
import SheetEvent from '../../components/SheetEvent'
import DatePicker from 'react-native-date-picker'
import SheetEquipmentMulti from '../../components/SheetEquipmentMulti'
import ICONEQUIPMENT from '../../common/iconEquipment'
import apiFetch from '../../helpers/ApiFetch'
import { useNavigation } from '@react-navigation/native'
import { applyAlert } from '../../redux/alertSlice'
import SheetLokasiPit from '../../components/SheetLokasiPit'

const CreateDailyEvent = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const [ refreshing, setRefreshing ] = useState(false)
    const mode = useSelector(state => state.themes.value)
    const [ openPicker, setOpenPicker ] = useState({
        event: false,
        lokasi: false,
        equipment: false,
        startDate: false,
        endDate: false
    })

    const [ state, setState ] = useState({
        event: null,
        lokasi: null,
        equipments: [],
        startEvent: moment().format('YYYY-MM-DD HH:mm'),
        endEvent: null,
    })

    const onCloseEvent = () => {
        setOpenPicker({...openPicker, event: false})
    }

    const onCloseLokasi = () => {
        setOpenPicker({...openPicker, lokasi: false})
    }

    const onCloseEquipment = () => {
        setOpenPicker({...openPicker, equipment: false})
    }
    
    const onSelectedEvent = (obj) => {
        setState({...state, event: obj})
        setOpenPicker({...openPicker, event: false})
    }

    const onSelectedLokasi = (obj) => {
        setState({...state, lokasi: obj})
        setOpenPicker({...openPicker, lokasi: false})
    }

    const onSelectedEquipment = (array) => {
        console.log(array);
        setState({...state, equipments: array})
    }

    const onDeselectedEquipment = (obj) => {
        setState({...state, equipments: state.equipments.filter( f => f.id != obj.id)})
    }

    const onClearFinishEventHandle = () => {
        setState({...state, endEvent: null})
    }

    const onPostDataHandle = async () => {
        setRefreshing(true)
        const data = {
            ...state, 
            lokasi_id: state.lokasi?.id||null, 
            equipments: state.equipments.map( m => m.id)
        }


        try {
            const resp = await apiFetch.post('daily-event', data)
            console.log(resp)
            if(resp.status === 201){
                setRefreshing(false)
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: 'Success create event',
                    subtitle: "Event berhasil dibuat"
                }))
            }
            setRefreshing(false)
            setOpenPicker({
                event: false,
                equipment: false,
                startDate: false,
                endDate: false
            })
        } catch (error) {
            console.log(error);
            setRefreshing(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Data invalid',
                subtitle: error.response?.data?.diagnostic?.message || error.message
            }))
        }
    }

    if(refreshing){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen title={"Buat Daily Event"} onBack={true} onThemes={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Buat Daily Event"} onBack={true} onThemes={true} onNotification={true}/>
                <ScrollView>
                    <VStack flex={1} px={3}>
                        <TouchableOpacity onPress={() => setOpenPicker({...openPicker, event: !openPicker.event})}>
                            <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <Danger size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Event/Kejadian Operational :
                                    </Text>
                                    <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'bold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { state.event?.nama || '???' }
                                    </Text>
                                </VStack>
                            </HStack>
                        </TouchableOpacity>
                        

                        <TouchableOpacity onPress={() => setOpenPicker({...openPicker, lokasi: !openPicker.event})}>
                            <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <Signpost size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Lokasi Equipment :
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
                        

                        <TouchableOpacity onPress={() => setOpenPicker({...openPicker, startDate: true})}>
                            <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <Watch size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Mulai Event/Kejadian :
                                    </Text>
                                    <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'bold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { moment(state.startEvent).format('HH:mm [wita]') }
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { moment(state.startEvent).format('dddd, DD MMMM YYYY') }
                                    </Text>
                                    
                                </VStack>
                            </HStack>
                        </TouchableOpacity>
                        {
                            openPicker.startDate && 
                            <DatePicker
                                modal
                                mode={"datetime"}
                                locale={"ID"}
                                title={'Waktu Mulai Event'}
                                open={openPicker.startDate}
                                date={new Date()}
                                theme={mode != "dark"?"light":"dark"}
                                onConfirm={(date) => setState({...state, startEvent: date })}
                                onCancel={() => {
                                    setOpenPicker({...openPicker, startDate: false })
                                }}
                            />
                        }

                        <TouchableOpacity onPress={() => setOpenPicker({...openPicker, endDate: true})}>
                            <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <WatchStatus size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Selesai Event/Kejadian :
                                    </Text>
                                    <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'bold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { state.endEvent ? moment(state.endEvent).format('HH:mm [wita]'):'??:??' }
                                    </Text>
                                    {
                                        state.endEvent ?
                                        <Text 
                                        lineHeight={'xs'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                            { moment(state.endEvent).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                        :
                                        <Text 
                                        lineHeight={'xs'}
                                        fontSize={12}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                            Biarkan kosong jika waktu selesai event/kejadiannya blum ditentukan
                                        </Text>
                                    }
                                    
                                </VStack>
                                {
                                    state.endEvent &&
                                    <TouchableOpacity onPress={onClearFinishEventHandle}>
                                        <CloseCircle size="26" color={appcolor.teks[mode][5]} variant="Outline"/>
                                    </TouchableOpacity>
                                }
                            </HStack>
                        </TouchableOpacity>
                        {
                            openPicker.endDate && 
                            <DatePicker
                                modal
                                mode={"datetime"}
                                locale={"ID"}
                                title={'Waktu Selesai Event'}
                                open={openPicker.endDate}
                                date={new Date()}
                                theme={mode != "dark"?"light":"dark"}
                                onConfirm={(date) => setState({...state, endEvent: date })}
                                onCancel={() => {
                                    setOpenPicker({...openPicker, endDate: false })
                                }}
                            />
                        }

                        <TouchableOpacity onPress={() => setOpenPicker({...openPicker, equipment: true})}>
                            <HStack space={2} p={2} mb={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <SmartCar size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Equipment terdampak :
                                    </Text>
                                    {
                                        !state.equipments.length > 0 ?
                                        <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'bold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                            { '???' }
                                        </Text>
                                        :
                                        <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'bold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                            { state.equipments.length } Unit Terdampak
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </TouchableOpacity>
                        <Flex flex={1} direction='row' flexWrap={'wrap'} justifyContent={'flex-start'}>
                            {
                                state.equipments.length > 0 &&
                                state.equipments.map( item => {
                                    return(
                                        <HStack key={item.id} mr={1} mb={1}>
                                            <HStack p={1} space={1} alignItems={'center'} borderWidth={.5} 
                                                borderColor={appcolor.line[mode][2]} 
                                                borderStyle={'dashed'} 
                                                rounded={'md'}>
                                                { ICONEQUIPMENT(item.tipe, {height: 40, width: 30}) }
                                                <VStack>
                                                    <Text 
                                                        fontSize={16}
                                                        fontWeight={'bold'}
                                                        fontFamily={'Dosis-Regular'}
                                                        color={appcolor.teks[mode][1]}>
                                                        {item.kode}
                                                    </Text>
                                                    <Text 
                                                        fontSize={10}
                                                        lineHeight={'xs'}
                                                        fontWeight={'semibold'}
                                                        fontFamily={'Abel-Regular'}
                                                        color={appcolor.teks[mode][1]}>
                                                        {item.manufaktur}
                                                    </Text>
                                                    <Text 
                                                        fontSize={10}
                                                        lineHeight={'xs'}
                                                        fontWeight={'semibold'}
                                                        fontFamily={'Dosis-Regular'}
                                                        color={appcolor.teks[mode][1]}>
                                                        {item.model}
                                                    </Text>
                                                </VStack>
                                                <TouchableOpacity onPress={() => onDeselectedEquipment(item)}>
                                                    <CloseSquare size="22" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                                </TouchableOpacity>
                                            </HStack>
                                        </HStack>
                                    )
                                })
                            }
                        </Flex>
                    </VStack>
                </ScrollView>
                {
                    openPicker.event && 
                    <SheetEvent isOpen={openPicker.event} onClose={onCloseEvent} onSelected={onSelectedEvent}/>
                }
                {
                    openPicker.lokasi && 
                    <SheetLokasiPit isOpen={openPicker.lokasi} onClose={onCloseLokasi} onSelected={onSelectedLokasi}/>
                }
                {
                    openPicker.equipment &&
                    <SheetEquipmentMulti isOpen={openPicker.equipment} onClose={onCloseEquipment} onSelected={onSelectedEquipment}/>
                }
                <VStack px={3}>
                    <Button colorScheme={'darkBlue'} onPress={onPostDataHandle}>
                        <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Simpan</Text>
                    </Button>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default CreateDailyEvent