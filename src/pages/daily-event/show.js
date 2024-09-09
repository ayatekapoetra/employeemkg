import { TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { HStack, VStack, Text, FlatList, Avatar, Image, Button, Flex } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import LoadingHauler from '../../components/LoadingHauler'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Danger, Signpost, SmartCar, Watch, WatchStatus } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import apiFetch from '../../helpers/ApiFetch'
import { useNavigation, useRoute } from '@react-navigation/native'
import { applyAlert } from '../../redux/alertSlice'
import ICONEQUIPMENT from '../../common/iconEquipment'

const ShowDailyEvent = () => {
    const route = useNavigation()
    const { params } = useRoute()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const [ loading, setLoading ] = useState(false)
    const [ openPicker, setOpenPicker ] = useState({
        event: false,
        equipment: false,
        startDate: false,
        endDate: false
    })

    const [ state, setState ] = useState({
        ...params,
        startEvent: new Date(params.start_at),
        endEvent: params.finish_at ? new Date(params.finish_at):null
    })

    const onReadyEquipmentHandle = async () => {
        setLoading(true)
        try {
            const resp = await apiFetch.post(`daily-event/${params.id}/ready`, state)
            console.log(resp);
            setLoading(false)
            if(resp.status === 201){
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: 'Success update event',
                    subtitle: `Equipment Unit :\n${params.equipment?.kode} \nsiap bekerja kembali...`
                }))
            }else{
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: 'Failed update event',
                    subtitle: `Equipment Unit :\n${params.equipment?.kode}\ngagal update untuk bekerja kembali...`
                }))
            }
            
        } catch (error) {
            console.log(error);
            setLoading(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Data invalid',
                subtitle: error.response?.data?.diagnostic?.message || error.message
            }))
        }

        setOpenPicker({
            event: false,
            equipment: false,
            startDate: false,
            endDate: false
        })
    }

    const onDeleteEventHandle = async () => {
        setLoading(true)
        try {
            const resp = await apiFetch.post(`daily-event/${params.id}/remove`)
            setLoading(false)
            if(resp.status === 201){
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: 'Success delete event',
                    subtitle: "Event berhasil dihapus"
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: 'Data invalid',
                subtitle: error.response?.data?.diagnotic?.message || error.message
            }))
        }
        setOpenPicker({
            event: false,
            equipment: false,
            startDate: false,
            endDate: false
        })
    }

    if(loading){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen title={"Show Daily Event"} onBack={true} onThemes={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Show Daily Event"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack flex={1} px={3}>
                    <HStack p={2} mb={2} alignItems={'center'} justifyContent={'space-between'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                        <HStack space={2} alignItems={'center'}>
                            <SmartCar size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                            <VStack flex={1}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Equipment :
                                </Text>
                                <Text 
                                    fontSize={18}
                                    lineHeight={'xs'}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { state.equipment?.kode }
                                </Text>
                                <Text 
                                    lineHeight={'xs'}
                                    fontWeight={'bold'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { state.equipment?.model }
                                </Text>
                            </VStack>
                            { ICONEQUIPMENT(state.equipment?.tipe) }
                        </HStack>
                    </HStack>

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

                    <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                        <Signpost size="36" color={appcolor.teks[mode][1]} variant="Broken"/>
                        <VStack flex={1}>
                            <Text 
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Lokasi Event :
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

                    <TouchableOpacity onPress={() => setOpenPicker({...openPicker, endDate: true})}>
                        <HStack space={2} p={2} mb={2} alignItems={'center'} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <WatchStatus size="36" color={appcolor.teks[mode][5]} variant="Broken"/>
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
                                    state.endEvent &&
                                    <Text 
                                        lineHeight={'xs'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { moment(state.endEvent).format('dddd, DD MMMM YYYY') }
                                    </Text>
                                }
                                
                            </VStack>
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

                    
                </VStack>
                <HStack space={2} px={3}>
                    <Button flex={1} colorScheme={'danger'} onPress={onDeleteEventHandle}>
                        <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Delete</Text>
                    </Button>
                    {
                        !params.finish_at &&
                        <Button flex={3} colorScheme={'darkBlue'} onPress={onReadyEquipmentHandle}>
                            <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Ready Work</Text>
                        </Button>
                    }
                </HStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowDailyEvent

