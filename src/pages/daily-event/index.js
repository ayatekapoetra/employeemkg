import { TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Center, View } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { SmartCar, TagRight, Map, Timer1, CloudLightning, Danger } from 'iconsax-react-native'
import LoadingHauler from '../../components/LoadingHauler'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { getDailyEvent } from '../../redux/fetchDailyEventSlice'
import moment from 'moment'
import BadgeAlt from '../../components/BadgeAlt'
import ICONEQUIPMENT from '../../common/iconEquipment'
import FilterDailyEvent from './filter'
import NoData from '../../components/NoData'

const DailyEvent = () => {
    const isFocus = useIsFocused()
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    const { data, loading, error } = useSelector(state => state.dailyEvent)
    const [ showFilter, setShowFilter ] = useState(false)
    const [ qstring, setQstring ] = useState({
        beginStartEvent: null,
        endStartEvent: null,
        beginFinishEvent: null,
        endFinishEvent: null,
        event: null,
        equipments: [],
        status: 0,
        nm_status: 'StandBy'
    })

    useEffect(() => {
        dispatch(getDailyEvent(qstring))
    }, [isFocus])

    const openFilter = () => setShowFilter(!showFilter)

    const onResetFilter = () => {
        setShowFilter(false)
        setQstring({
            beginStartEvent: null,
            endStartEvent: null,
            beginFinishEvent: null,
            endFinishEvent: null,
            event: null,
            equipments: [],
            status: '',
            nm_status: ''
        })

        dispatch(getDailyEvent({
            beginStartEvent: null,
            endStartEvent: null,
            beginFinishEvent: null,
            endFinishEvent: null,
            event: null,
            equipments: [],
            status: '',
            nm_status: ''
        }))
    }

    const onApplyFilter = () => {
        setShowFilter(false)
        let data = {
            ...qstring, 
            equipments: qstring.equipments?.map( m => m.id)
        }

        dispatch(getDailyEvent(data))
    }

    // console.log(data);

    if(loading){
        return(
            <AppScreen>
                <VStack h={'full'}>
                    <HeaderScreen title={"Daily Event Equipment"} onBack={true} onThemes={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }
    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Daily Event Equipment"} onBack={true} onFilter={openFilter} onThemes={true} onNotification={true}/>
                {
                    showFilter ?
                    <FilterDailyEvent qstring={qstring} setQstring={setQstring} onApplyFilter={onApplyFilter} onResetFilter={onResetFilter}/>
                    :
                    <VStack flex={1} px={3}>
                        <VStack h={"70px"} borderWidth={.5} borderStyle={"dashed"} borderColor={appcolor.line[mode][2]} rounded={"md"}>
                            <TouchableOpacity onPress={() => route.navigate('create-daily-event')}>
                                <HStack px={3} py={2} space={2} alignItems={"center"}>
                                    <SmartCar size="32" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={18} 
                                            fontWeight={"semibold"}
                                            fontFamily={"Quicksand-SemiBold"}
                                            color={appcolor.teks[mode][1]}>
                                            Buat Daily Event Equipment
                                        </Text>
                                        <Text 
                                            fontSize={12} 
                                            fontWeight={300}
                                            fontFamily={"Poppins-Light"}
                                            color={appcolor.teks[mode][2]}>
                                            Membuat event harian pada equipment
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                        <VStack my={2} flex={1}>
                        {
                            data?.length > 0 ?
                            <FlatList 
                                data={data} 
                                keyExtractor={i => i.id} 
                                showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={loading} onRefresh={onApplyFilter}/>}
                                renderItem={({item}) => <RenderComponentItem item={item} mode={mode} route={route}/>}/>
                            :
                            <NoData title={"Opps"} subtitle={'Data daily event equipment tidak ditemukan...'}/>
                        }
                        </VStack>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default DailyEvent

const RenderComponentItem = ( { item, mode, route } ) => {

    switch (item.status) {
        case "0":
            var badge = <BadgeAlt rounded={"full"} type={"error"} colorScheme={"error.200"} title={"StandBy"}/>
            break;
        case "1":
            var badge = <BadgeAlt rounded={"full"} type={"success"} colorScheme={"success.200"} title={"Working"}/>
            break;
        default:
            var badge = <BadgeAlt rounded={"full"} type={"warning"} colorScheme={"warning.200"} title={"Unknow"}/>
            break;
    }

    return(
        <TouchableOpacity onPress={() => route.navigate('show-daily-event', item)}>
            <VStack borderBottomWidth={1} borderBottomColor={appcolor.line[mode][2]}>
                <HStack space={2}>
                    <Center 
                        px={2} 
                        my={2} 
                        h={'90px'} 
                        w={'80px'} 
                        justifyContent={'space-between'}>
                        <View mt={1}>
                            {badge}
                        </View>
                        <View mt={1}>
                            { ICONEQUIPMENT(item.equipment.tipe) }
                        </View>
                        {
                            item.duration > 0 &&
                            <HStack space={1} mt={1}>
                                <Timer1 size="20" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <Text fontWeight={'bold'} fontFamily={'Dosis'} color={appcolor.teks[mode][1]}>
                                    {item.duration} H
                                </Text>
                            </HStack>
                        }
                    </Center>
                    <VStack flex={1}>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                            <Text 
                                mt={1}
                                fontSize={20}
                                fontFamily={'Dosis'}
                                fontWeight={'bold'}
                                color={appcolor.teks[mode][3]}>
                                {item.equipment?.kode}
                            </Text>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][4]}>
                                Report By {item.reported?.nama_lengkap}
                            </Text>
                            
                        </HStack>
                        <HStack space={1}>
                            <Danger size="20" color={appcolor.teks[mode][1]} variant="Broken"/>
                            <Text 
                                fontWeight={'bold'}
                                fontFamily={'Poppins-Regular'}
                                color={appcolor.teks[mode][1]}>
                                {item.event?.nama}
                            </Text>
                        </HStack>
                        <HStack space={1}>
                            <Map size="20" color={appcolor.teks[mode][1]} variant="Broken"/>
                            <Text 
                                fontSize={16}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                {item.lokasi?.nama}
                            </Text>
                        </HStack>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                            <VStack>
                                <Text 
                                    fontSize={18}
                                    fontFamily={'Teko-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(item.start_at).format('HH:mm [wita]') }
                                </Text>
                                <Text 
                                    mt={-1}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(item.start_at).format('dddd, DD MMM YY') }
                                </Text>
                            </VStack>
                            <TagRight size="25" color={appcolor.teks[mode][6]} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={18}
                                    fontFamily={'Teko-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { item.finish_at ? moment(item.finish_at).format('HH:mm [wita]'):"??:?? wita" }
                                </Text>
                                {
                                    item.finish_at &&
                                    <Text 
                                        mt={-1}
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { moment(item.finish_at).format('dddd, DD MMM YY') }
                                    </Text>
                                }
                            </VStack>
                        </HStack>
                    </VStack>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}