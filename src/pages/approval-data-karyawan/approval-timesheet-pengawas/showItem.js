import { ScrollView, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { VStack, Text, Center, HStack, Image, Button, Divider } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { BatteryCharging, Calendar, Moon, Sun1, Clock, Dislike, Like1, MoneyTime, Setting2, Image as Foto, PlayCircle, Pause, Alarm, Airdrop } from 'iconsax-react-native'
import apiFetch from '../../../helpers/ApiFetch'
import LoadingHauler from '../../../components/LoadingHauler'
import AppScreen from '../../../components/AppScreen'
import appcolor from '../../../common/colorMode'
import { applyAlert } from '../../../redux/alertSlice'
import { showDataFetch } from '../../../redux/showDataSlice'

const baseuri = 'https://offices.makkuragatama.id/';

const ShowApprovalTimesheet = () => {
    const dispatch = useDispatch()
    const { params } = useRoute()
    const route = useNavigation()
    const mode = useSelector(state => state.themes).value
    const { data, loading, error } = useSelector(state => state.showData)
    const [ refresh, setRefresh ] = useState(loading)

    useEffect(() => {
        getDataFetch()
    }, [])

    const getDataFetch = async () => {
        dispatch(showDataFetch(`daily-monitoring/${params.id}/show`))
    }

    const onRefreshHandle = async () => {
        getDataFetch()
    }

    const approvalHandle = async () => {
        setRefresh(true)
        try {
            const resp = await apiFetch.post(`daily-monitoring/${data.id}/approval-timesheet`)
            // console.log(resp);
            if(resp.status === 201){
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: 'success',
                    title: 'Timesheet Approved',
                    subtitle: 'Timesheet berhasil disetujui...'
                }))
            }else{
                Alert.alert('Error...')
            }
            setRefresh(false)
        } catch (error) {
            setRefresh(false)
            route.goBack()
            dispatch(applyAlert({
                show: true,
                status: 'error',
                title: error?.code,
                subtitle: error.response?.data?.diagnostic?.message || error.message
            }))
        }
    }

    const onHandleReject = async () => {
        setRefresh(true)

        Alert.alert('Perhatian', 'Apakah anda yakin akan menolak timesheet ini ?', [
            {
              text: 'Cancel',
              onPress: setRefresh(false),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => rejectFetch()},
        ]);
    }

    const rejectFetch = async () => {
        try {
            const resp = await apiFetch.post(`daily-monitoring/${data.id}/reject-timesheet`)
            console.log("REJECT-----", resp);
            route.goBack()
            dispatch(applyAlert({
                show: true,
                status: 'warning',
                title: 'Timesheet Reject',
                subtitle: 'Timesheet berhasil ditolak...'
            }))
        } catch (error) {
            setRefresh(false)
            dispatch(applyAlert({
                status: "warning",
                title: "Koneksi error..",
                subtitle: "Data gagal terkirim, anda dapat kembali mengirim ulang data ini pada waktu lain"
            }))
        }
    }

    const openTimesheetFoto = useCallback(async(url) => {
        const supported = await Linking.canOpenURL(baseuri + url);
        if (supported && url) {
            await Linking.openURL(baseuri + url);
        }else{
            Alert.alert(`Photo Timesheet tdk ditemukan...`);
        }
    }, [])

    // console.log(params);
    if(loading || refresh){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Timesheet Details"} onThemes={true} onBack={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Timesheet Details"} onThemes={true} onBack={true} onNotification={true}/>
                <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}>
                    <VStack px={3} flex={1}>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>

                            <HStack space={2}>
                                <Calendar size="26" color={appcolor.teks[mode][1]} variant="Broken"/>
                                <Text 
                                    fontSize={'xl'}
                                    fontWeight={'semibold'}
                                    fontFamily={'Quicksand-SemiBold'}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(data?.date_ops).format('dddd, DD MMMM YYYY') }
                                </Text>
                            </HStack>
                            <HStack>
                                <Text 
                                    fontSize={'xl'}
                                    fontFamily={'Teko-SemiBold'}
                                    color={appcolor.teks[mode][1]}>
                                    #{ data?.id }
                                </Text>
                            </HStack>
                        </HStack>

                        <HStack>
                            <Text 
                                fontSize={'md'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { data?.pelanggan?.nama }
                            </Text>
                        </HStack>

                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                            <Text 
                                fontSize={'2xl'}
                                fontFamily={'Poppins-Bold'}
                                color={appcolor.teks[mode][1]}>
                                { data?.karyawan?.nama }
                            </Text>
                            <HStack space={1} alignItems={'center'}>
                                <BatteryCharging size="30" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                <Text 
                                    fontSize={'2xl'}
                                    fontFamily={'Teko-Medium'} 
                                    color={appcolor.teks[mode][2]}>
                                    { data?.bbm } Liter
                                </Text>
                            </HStack>
                        </HStack>

                        <HStack 
                            my={2} 
                            py={2}
                            rounded={'md'}
                            bg={appcolor.box[mode]}
                            alignItems={'center'} 
                            justifyContent={'space-around'}>
                            {
                                data?.shift === 1 ?
                                <HStack space={1} alignItems={'center'}>
                                    <Sun1 size="25" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                    <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>Shift Pagi</Text>
                                </HStack>
                                :
                                <HStack space={1} alignItems={'center'}>
                                    <Moon size="25" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                    <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>Shift Malam</Text>
                                </HStack>
                            }
                            <HStack space={1} alignItems={'center'}>
                                <MoneyTime size="25" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>{ data?.ls || 'STD' }</Text>
                            </HStack>
                            <HStack space={1} alignItems={'center'}>
                                <Setting2 size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>{ data?.equipment_tool || '???' }</Text>
                            </HStack>
                        </HStack>

                        <VStack>
                            <HStack my={2} flex={1} justifyContent={'space-between'}>
                                <VStack>
                                    <HStack space={1} justifyContent={'space-around'}>
                                        <HStack space={1}>
                                            <PlayCircle size="20" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                            <Text color={appcolor.teks[mode][1]}>
                                                {
                                                    data?.equipment?.kategori === 'DT' ?
                                                    <Text>KM {data?.smustart || '???'}</Text>
                                                    :
                                                    <Text>HM {data?.smustart || '???'}</Text>
                                                }
                                            </Text>
                                        </HStack>
                                        <HStack space={1}>
                                            <Pause size="20" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                            <Text color={appcolor.teks[mode][1]}>
                                                {
                                                    data?.equipment?.kategori === 'DT' ?
                                                    <Text>KM {data?.smustart || '???'}</Text>
                                                    :
                                                    <Text>HM {data?.smustart || '???'}</Text>
                                                }
                                            </Text>
                                        </HStack>
                                    </HStack>
                                    <Divider my={1} bg={appcolor.box[mode]}/>
                                    <HStack space={2} flex={3} alignItems={'center'}>
                                        {
                                            data?.equipment?.kategori === 'DT' ?
                                            <Image alt='dump-truck' source={require(`../../../../assets/images/IMG-DT.png`)} resizeMode='contain' style={{width: 80, height: 55}}/>
                                            :
                                            <Image alt='alat-berat' source={require(`../../../../assets/images/IMG-EXCA-BIG.png`)} resizeMode='contain'  style={{width: 80, height: 60}}/>
                                        }
                                        <VStack>
                                            <Text
                                                fontSize={20}
                                                fontWeight={900}
                                                lineHeight={'xs'}
                                                fontFamily={'Dosis'}
                                                color={appcolor.teks[mode][1]}>
                                                { data?.equipment?.kode }
                                            </Text>
                                            <Text 
                                                fontSize={14}
                                                lineHeight={'xs'}
                                                fontFamily={'Poppins-Regular'}
                                                color={appcolor.teks[mode][3]}>
                                                { data?.equipment?.manufaktur }
                                            </Text>
                                            <Text 
                                                fontSize={14}
                                                lineHeight={'xs'}
                                                fontFamily={'Teko-Medium'}
                                                color={appcolor.teks[mode][2]}>
                                                { data?.equipment?.model }
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                                <Divider mx={2} thickness={2} orientation={'vertical'}/>
                                <VStack flex={2}>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={14}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][4]}>
                                            Start
                                        </Text>
                                        <Text 
                                            fontSize={14}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][4]}>
                                            { moment(data?.starttime).format('dddd, HH:mm') }
                                        </Text>
                                    </HStack>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={14}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][5]}>
                                            Finish
                                        </Text>
                                        <Text 
                                            fontSize={14}
                                            lineHeight={'xs'}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][5]}>
                                            { moment(data?.endtime).format('dddd, HH:mm') }
                                        </Text>
                                    </HStack>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={14}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            Total
                                        </Text>
                                        <Text 
                                            fontSize={14}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { (moment(data?.endtime).diff(moment(data?.starttime), 'minute')/60)?.toFixed(1) } Jam
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                            <HStack flex={1} alignItems={'center'} justifyContent={'space-between'}>
                                <VStack flex={1}>
                                    <Text 
                                        fontSize={14}
                                        fontFamily={'Poppins-Regular'}
                                        color={appcolor.teks[mode][6]}>
                                        Catatan :
                                    </Text>
                                    <Text 
                                        fontSize={16}
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { data?.keterangan || '-' }
                                    </Text>
                                </VStack>
                                <TouchableOpacity onPress={() => openTimesheetFoto(data.photo)}>
                                    <HStack 
                                        py={2} 
                                        w={'40px'} 
                                        bg={appcolor.btn[mode]['active']} 
                                        justifyContent={'center'} 
                                        alignItems={'center'} 
                                        borderWidth={1}
                                        borderColor={appcolor.line[mode][2]}
                                        rounded={'lg'}>
                                        <Foto size="25" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                    </HStack>
                                </TouchableOpacity>
                            </HStack>
                            {
                                data?.approvedby ?
                                <HStack my={2} py={1} bg="success.100" rounded={'xs'} justifyContent={'center'}>
                                    <Center>
                                        <Text color={'success.900'} fontWeight={500}>
                                            { "Approved By " + data?.approved?.nama_lengkap }
                                        </Text>
                                        <Text lineHeight={'xs'} fontFamily={'Teko-Medium'} color={'success.900'} fontWeight={500}>
                                            { moment(data?.approved_at).format('dddd, DD MMMM YYYY [-] HH:mm [WITA]') }
                                        </Text>
                                    </Center>
                                </HStack>
                                :
                                <HStack my={2} py={1} bg="error.100" rounded={'xs'} justifyContent={'center'}>
                                    <Text color={'error.900'} fontWeight={500}>
                                        { "Tunggu approval " + data?.pengawas?.nama }
                                    </Text>
                                </HStack>
                            }
                            <VStack>
                                {
                                    data?.items?.map( m => {
                                        return (
                                            <VStack 
                                                p={2}
                                                mb={2}
                                                key={m.id} 
                                                borderWidth={1} 
                                                rounded={'md'}
                                                borderStyle={'dashed'}
                                                borderColor={appcolor.line[mode][2]}>
                                                <HStack justifyContent={'space-between'}>
                                                    <Text 
                                                        fontSize={'lg'}
                                                        fontWeight={'bold'}
                                                        fontFamily={'Poppins-Regular'}
                                                        color={appcolor.teks[mode][1]}>
                                                        { m.narasi }
                                                    </Text>
                                                    {
                                                        m.event_id ?
                                                        <Alarm size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                                        :
                                                        <Airdrop size="25" color={appcolor.teks[mode][6]} variant="Bulk"/>
                                                    }
                                                </HStack>
                                                <Text
                                                    fontFamily={'Dosis'}
                                                    fontWeight={'semibold'}
                                                    color={appcolor.teks[mode][1]}>
                                                    { m.lokasi.nama }
                                                </Text>
                                                <Divider my={2}/>
                                                <HStack rounded={'md'} alignItems={'center'} justifyContent={'space-between'}>
                                                    <HStack space={1} alignItems={'flex-end'}>
                                                        <Clock size="25" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                                        <VStack>
                                                            <Text
                                                                fontFamily={'Dosis'}
                                                                fontWeight={500}
                                                                color={appcolor.teks[mode][1]}>
                                                                Start :
                                                            </Text>
                                                            <Text
                                                                fontFamily={'Dosis'}
                                                                fontWeight={500}
                                                                color={appcolor.teks[mode][4]}>
                                                                { moment(m.start_time).format('ddd, HH:mm') }
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                    <HStack space={1} alignItems={'flex-end'}>
                                                        <Clock size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                                        <VStack>
                                                            <Text
                                                                fontFamily={'Dosis'}
                                                                fontWeight={500}
                                                                color={appcolor.teks[mode][1]}>
                                                                Finish :
                                                            </Text>
                                                            <Text
                                                                fontFamily={'Dosis'}
                                                                fontWeight={500}
                                                                color={appcolor.teks[mode][5]}>
                                                                { moment(m.end_time).format('ddd, HH:mm') }
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                    <HStack space={1} alignItems={'flex-end'}>
                                                        <Clock size="25" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                                        <VStack>
                                                            <Text
                                                                fontFamily={'Dosis'}
                                                                fontWeight={500}
                                                                color={appcolor.teks[mode][1]}>
                                                                Total :
                                                            </Text>
                                                            <Text
                                                                fontFamily={'Dosis'}
                                                                fontWeight={500}
                                                                color={appcolor.teks[mode][3]}>
                                                                { m.time_used } Jam
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </HStack>
                                            </VStack>
                                        )
                                    })
                                }
                            </VStack>
                        </VStack>
                    {
                        !data?.approved_at ?
                        <HStack>
                            <Button onPress={onHandleReject} w={"1/4"} mr={2} bg={appcolor.teks[mode][5]}>
                                <HStack space={1} alignItems={"center"}>
                                    <Dislike size="26" color="#FFFFFF" variant="Bulk"/>
                                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Tolak</Text>
                                </HStack>
                            </Button>
                            <Button onPress={approvalHandle} flex={1} bg={appcolor.teks[mode][6]}>
                                <HStack space={1} alignItems={"center"}>
                                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                    <Text fontWeight={"bold"} color={"#FFFFFF"}>Approve Timesheet</Text>
                                </HStack>
                            </Button>
                        </HStack>
                        :
                        <HStack>
                            <Button flex={1} bg={appcolor.teks[mode][2]}>
                                <HStack space={1} alignItems={"center"}>
                                    <Like1 size="26" color="#FFFFFF" variant="Bulk"/>
                                    <Text fontWeight={"bold"} color={"#FFFFFF"}>
                                        Timesheet {data?.sts_approved === 'A' ? 'telah disetujui':'telah ditolak'}
                                    </Text>
                                </HStack>
                            </Button>
                        </HStack>
                    }
                    </VStack>
                </ScrollView>
            </VStack>
        </AppScreen>
    )
}

export default ShowApprovalTimesheet