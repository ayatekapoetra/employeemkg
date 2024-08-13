import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../../components/AppScreen'
import { HStack, VStack, Text, Center, Badge, Divider, Button } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation, useRoute } from '@react-navigation/native'
import HeaderScreen from '../../../components/HeaderScreen'
import LoadingHauler from '../../../components/LoadingHauler'
import apiFetch from '../../../helpers/ApiFetch'
import { applyAlert } from '../../../redux/alertSlice'
import appcolor from '../../../common/colorMode'
import LottieView from 'lottie-react-native'
import { TimerPause, TimerStart } from 'iconsax-react-native'
import moment from 'moment'

const ShowApprovalLemburKaryawan = () => {
    const dispatch = useDispatch()
    const { params } = useRoute()
    const route = useNavigation()
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    // const { data, loading, error } = useSelector(state => state.showData)
    const [ data, setData ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [ state, setState ] = useState(data)

    useEffect(() => {
        onGetDataShow()
    }, [])

    const onGetDataShow = async () => {
        setLoading(true)
        try {
            const resp = await apiFetch.get(`hrd/perintah-lembur/${params.id}/show`)
            console.log(resp);
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal memuat",
                subtitle: resp?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    const onLemburApproval = async () => {
        try {
            const resp = await apiFetch.post(`hrd/perintah-lembur/${params.id}/approval`, data)
            console.log(resp);
            if(resp.data.diagnostic.error){
                dispatch(applyAlert({
                    show: true,
                    status: "error",
                    title: "Gagal menyimpan",
                    subtitle: resp?.data?.diagnostic?.message || 'Error'
                }))
            }else{
                route.goBack()
                dispatch(applyAlert({
                    show: true,
                    status: "success",
                    title: "Success",
                    subtitle: resp?.data?.diagnostic?.message || 'Anda berhasil mengupdate perintah lembur'
                }))
            }
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: "Gagal menyimpan",
                subtitle: error?.response?.data?.diagnostic?.message || 'Error'
            }))
        }
    }

    switch (data?.status) {
        case "A":
            var statusBadge = <Badge colorScheme={"success"} variant={'solid'}>approve lembur</Badge>
            break;
        case "F":
            var statusBadge = <Badge colorScheme={"warning"} variant={'solid'}>menunggu approval</Badge>
            break;
        case "C":
            var statusBadge = <Badge colorScheme={'coolGray'} variant={"solid"}>lembur diterima</Badge>
            break;
        default:
            var statusBadge = <Badge colorScheme={"info"} variant={'solid'}>perintah baru</Badge>
            break;
    }

    if(loading && data){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Absensi Details"} onThemes={true} onBack={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    console.log(data);
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Lembur Detail"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack alignItems={'flex-start'} justifyContent={'space-between'}>
                        <VStack w={'2/3'}>
                            <Text 
                                fontSize={'2xl'}
                                fontWeight={'bold'}
                                fontFamily={'Quicksand-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { data?.karyawan?.nama }
                            </Text>
                            <Text 
                                fontSize={'md'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][3]}>
                                { data?.karyawan?.section }
                            </Text>
                            <Text 
                                fontSize={'md'}
                                lineHeight={'xs'}
                                fontFamily={'Roboto-Regular'}
                                color={appcolor.teks[mode][2]}>
                                { data?.karyawan?.phone }
                            </Text>
                            <HStack>
                                { statusBadge }
                            </HStack>
                        </VStack>
                        <HStack w={'1/3'}>
                            <LottieView source={require('../../../../assets/lottie/waiting.json')} autoPlay loop style={{height: 135, width: 160}} />
                        </HStack>
                    </HStack>
                    <Divider mt={-7}/>
                    <HStack py={2} alignItems={'center'} justifyContent={'space-between'}>
                        <HStack flex={1} space={1} alignItems={'center'}>
                            <TouchableOpacity>
                                <TimerStart size="42" color={appcolor.ico[mode][4]} variant="Bulk"/>
                            </TouchableOpacity>
                            <VStack>
                                <Text 
                                    fontSize={'md'}
                                    fontFamily={'Dosis'}
                                    fontWeight={'bold'}
                                    color={appcolor.teks[mode][2]}>
                                    Mulai :
                                </Text>
                                <Text 
                                    fontSize={'md'}
                                    lineHeight={'xs'}
                                    fontWeight={'black'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    { moment(data?.overtime_start).format('HH:mm') } Wita
                                </Text>
                                <Text 
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    { moment(data?.overtime_start).format('dddd, DD MMM YYYY') }
                                </Text>
                            </VStack>
                        </HStack>
                    
                        <HStack flex={1} space={1} alignItems={'center'}>
                            <TouchableOpacity>
                                <TimerPause size="42" color={appcolor.ico[mode][5]} variant="Bulk"/>
                            </TouchableOpacity>
                            <VStack>
                                <Text 
                                    fontSize={'md'}
                                    fontFamily={'Dosis'}
                                    fontWeight={'bold'}
                                    color={appcolor.teks[mode][2]}>
                                    Hingga :
                                </Text>
                                <Text 
                                    fontSize={'md'}
                                    lineHeight={'xs'}
                                    fontWeight={'black'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    { moment(data?.overtime_end).format('HH:mm') } Wita
                                </Text>
                                <Text 
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    { moment(data?.overtime_end).format('dddd, DD MMM YYYY') }
                                </Text>
                            </VStack>
                        </HStack>
                    </HStack>
                    <Center py={2} mb={2} borderWidth={1} borderColor={appcolor.line[mode][2]} borderStyle={'dotted'} rounded={'md'}>
                        <Text 
                            fontSize={'md'}
                            lineHeight={'xs'}
                            fontWeight={'bold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Aktual Durasi Lembur
                        </Text>
                        <Text 
                            fontSize={'2xl'}
                            lineHeight={'xs'}
                            fontWeight={'semibold'}
                            fontFamily={'Quicksand-Regular'}
                            color={appcolor.teks[mode][2]}>
                            { data?.overtime_duration } Jam
                        </Text>
                        <Text 
                            fontSize={'md'}
                            lineHeight={'xs'}
                            fontWeight={'bold'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Author : { data?.author?.nama_lengkap }
                        </Text>
                    </Center>
                    {
                        data?.approvedby &&
                        <VStack>
                            <HStack py={1} alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    flex={2}
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Diperiksa Oleh
                                </Text>
                                <Text 
                                    flex={3}
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    : { data?.approve?.nama }
                                </Text>
                            </HStack>
                            <Divider thickness={1} my={1} bg={appcolor.line[mode][1]}/>
                            <HStack py={1} alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    flex={2}
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Diperiksa Tanggal
                                </Text>
                                <Text 
                                    flex={3}
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    : { moment(data?.approvedat).format('dddd, DD MMMM YYYY') }
                                </Text>
                            </HStack>
                            <Divider thickness={1} my={1} bg={appcolor.line[mode][1]}/>
                            <HStack py={1} alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    flex={2}
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Diperiksa Pukul
                                </Text>
                                <Text 
                                    flex={3}
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    : { moment(data?.approvedat).format('HH:mm [Wita]') }
                                </Text>
                            </HStack>
                            <Divider thickness={1} my={1} bg={appcolor.line[mode][1]}/>
                        </VStack>
                    }
                    <VStack alignItems={'flex-start'}>
                        <Text 
                            fontSize={'sm'}
                            lineHeight={'xs'}
                            fontFamily={'Poppins-Regular'}
                            color={appcolor.teks[mode][1]}>
                            Narasi Perintah :
                        </Text>
                        <HStack mt={2} py={2} px={1} w={"full"} minH={'150px'} maxH={'250px'} borderWidth={1} borderColor={appcolor.line[mode][2]} borderStyle={'dotted'} rounded={'md'}>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                { data?.narasi || '-' }
                            </Text>
                        </HStack>
                    </VStack>
                </VStack>
                <VStack px={3}>
                    {
                        !data?.approvedat && !data?.approvedby && data?.status === 'F' &&
                        <Button onPress={onLemburApproval}>
                            <Text color={'#FFF'} fontWeight={'bold'} fontFamily={'Poppins-Regular'}>
                                Setujui Lembur
                            </Text>
                        </Button>
                    }
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowApprovalLemburKaryawan