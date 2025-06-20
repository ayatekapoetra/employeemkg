import { ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, Center, HStack, Image, Button, useDisclose, Actionsheet, Box } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import moment from 'moment'
import { Clock, Like1, Trash } from 'iconsax-react-native'
import DatePicker from 'react-native-date-picker'
import { URIPATH } from '../../helpers/UriPath'
import ButtonVerifyApprove from '../../components/ButtonVerifyApprove'
import LoadingHauler from '../../components/LoadingHauler'
import apiFetch from '../../helpers/ApiFetch'

const { width } = Dimensions.get("screen")

const ShowAbsensiDetails = () => {
    const { params } = useRoute()
    const route = useNavigation()
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState(params)
    const [ masuk, setMasuk ] = useState(false)
    const [ pulang, setPulang ] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [ isOpenSheet, setOpenSheet ] = useState(false)

    switch (data.kehadiran_sts) {
        case 'H':
            var statusKehadiran = "Hadir";
            break;
        case 'A':
            var statusKehadiran = "Alpha";
            break;
        case 'L':
            var statusKehadiran = "Terlambat Masuk";
            break;
        case 'E':
            var statusKehadiran = "Pulang Cepat";
            break;
        case 'S':
            var statusKehadiran = "Sakit";
            break;
        default:
            var statusKehadiran = "";
            break;
    }

    const getDataFetch = async () => {
        setLoading(true)
        try {
            const resp = await apiFetch.get(`mobile/checklog/${params.id}/show`)
            console.log('RESP', resp);
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    const onRefreshHandle = async () => {
        getDataFetch()
    }

    console.log(data);
    console.log(`${URIPATH.apiphoto}${data.photo_in}`);
    

    if(loading){
        return (
            <AppScreen>
                <VStack h={"full"}>
                    <HeaderScreen title={"Absensi Details"} onThemes={true} onBack={true} onNotification={true}/>
                    <LoadingHauler/>
                </VStack>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Absensi Details"} onThemes={true} onBack={true} onNotification={true}/>
                <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}>
                    <VStack px={3} flex={1}>
                        <HStack my={2} justifyContent={"center"} alignItems={"center"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack p={2}>
                                <Text 
                                    fontSize={22}
                                    fontWeight={600}
                                    textAlign={"center"}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][2]}>
                                    { data?.karyawan?.nama }
                                </Text>
                                <Text 
                                    textAlign={"center"}
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(data.date_ops).format("dddd, DD MMMM YYYY") }
                                </Text>
                                <Text 
                                    textAlign={"center"}
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Pin { data?.karyawan?.pin || '???' } - ID#{data?.id}
                                </Text>
                                <Text 
                                    textAlign={"center"}
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    {data?.karyawan?.nik}
                                </Text>
                            </VStack>
                        </HStack>
                        <VStack mb={2} p={2} flex={1} rounded={"md"} borderWidth={.5} borderColor={appcolor.line[mode][2]}>
                            <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>
                                Masuk :
                            </Text>
                            <HStack space={1} alignItems={"center"}>
                                <Clock size="32" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <VStack>
                                    <Text 
                                        fontSize={24}
                                        fontWeight={400}
                                        fontFamily={"Poppins-Regular"} 
                                        color={appcolor.teks[mode][2]}>
                                        { data.checklog_in ? moment(data.checklog_in).format('HH:mm A') : "??:??" }
                                    </Text>
                                    {
                                        data.checklog_in &&
                                        <Text 
                                            lineHeight={'xs'}
                                            fontSize={14}
                                            fontWeight={300}
                                            fontFamily={"Poppins-Regular"} 
                                            color={appcolor.teks[mode][3]}>
                                            { moment(data.checklog_in).format('dddd, DD MMMM YYYY')}
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </VStack>

                        <VStack mb={2} p={2} flex={1} rounded={"md"} borderWidth={.5} borderColor={appcolor.line[mode][2]}>
                            <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>
                                Pulang :
                            </Text>
                            <HStack space={1} alignItems={"center"}>
                                <Clock size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                <VStack>
                                    <Text 
                                        fontSize={24}
                                        fontWeight={400}
                                        fontFamily={"Poppins-Regular"} 
                                        color={appcolor.teks[mode][2]}>
                                        { data.checklog_out ? moment(data.checklog_out).format('HH:mm A') : "??:??" }
                                    </Text>
                                    {
                                        data.checklog_out &&
                                        <Text 
                                            lineHeight={'xs'}
                                            fontSize={14}
                                            fontWeight={300}
                                            fontFamily={"Poppins-Regular"} 
                                            color={appcolor.teks[mode][3]}>
                                            { moment(data.checklog_out).format('dddd, DD MMMM YYYY')}
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </VStack>
                        

                        <HStack mb={2} p={2} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack flex={1}>
                                <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>
                                    disetujui oleh :
                                </Text>
                                <Text fontSize={24} fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][1]}>
                                    { data.verify?.nama || "???" }
                                </Text>
                                { 
                                    data.verify_at && 
                                    <HStack flex={1} justifyContent={"space-between"}>
                                        <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>
                                            { moment(data.verify_at).format("dddd, DD MMMM YYYY") }
                                        </Text>
                                        <HStack space={1} alignItems={"center"}>
                                            <Clock size="18" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                            <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>
                                                { moment(data.verify_at).format("HH:mm") }
                                            </Text>
                                        </HStack>
                                    </HStack>
                                }
                            </VStack>
                        </HStack>

                        {
                            data.kehadiran_sts &&
                            <HStack mb={2} p={2} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                                <VStack flex={1}>
                                    <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][2]}>
                                        Status Absensi :
                                    </Text>
                                    <Text fontSize={24} fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][1]}>
                                        { statusKehadiran }
                                    </Text>
                                </VStack>
                            </HStack>
                        }

                        <HStack mb={2} p={2} flex={1} justifyContent={"space-around"} rounded={"md"} borderWidth={1} borderColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Image size={width * .4} alt="..." rounded={"md"} source={{ uri: `${URIPATH.apiphoto}${data.photo_in}` }} fallbackSource={{ uri: `${URIPATH.apiphoto}no-photo.png` }} />
                                <Center>
                                    <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][4]}>Absen Masuk</Text>
                                </Center>
                            </VStack>
                            <VStack>
                                <Image size={width * .4} alt="..." rounded={"md"} source={{ uri: `${URIPATH.apiphoto}${data.photo_out}` }} fallbackSource={{ uri: `${URIPATH.apiphoto}no-photo.png` }} />
                                <Center>
                                    <Text fontFamily={"Poppins-Regular"} color={appcolor.teks[mode][5]}>Absen Pulang</Text>
                                </Center>
                            </VStack>
                        </HStack>

                        {/* <HStack space={1} mt={2}>
                            {
                                ['developer', 'hrd'].includes(user.usertype) ?
                                <ButtonVerifyApprove mode={mode} data={data} verifyAction={verifyHandle} approvalAction={approvalHandle} rejectAction={rejectHandle}/>
                                :
                                <>
                                    {
                                        user.karyawan.id != data.karyawan_id &&
                                        <ButtonVerifyApprove mode={mode} data={data} verifyAction={verifyHandle} approvalAction={approvalHandle}/>
                                    }
                                </>
                            }
                        </HStack> */}
                    </VStack>
                    {/* <Actionsheet isOpen={isOpenSheet} onClose={() => setOpenSheet(false)}>
                        <Actionsheet.Content>
                            <Center w="100%" h={60} px={4} justifyContent="center">
                                <Text fontSize="18" fontWeight={"700"} fontFamily={"Poppins-SemiBold"} color="muted.800">
                                    Status Penolakan
                                </Text>
                            </Center>
                            <Actionsheet.Item onPress={() => changeStatusKehadiran('L')}>Terlambat Masuk</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => changeStatusKehadiran('E')}>Pulang Cepat</Actionsheet.Item>
                            <Actionsheet.Item isDisabled>Cuti</Actionsheet.Item>
                            <Actionsheet.Item isDisabled>Izin</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => changeStatusKehadiran('S')}>Sakit</Actionsheet.Item>
                            <Actionsheet.Item onPress={() => {
                                setData({...data, kehadiran_sts: ""})
                                setOpenSheet(false)
                            }}>Cancel</Actionsheet.Item>
                        </Actionsheet.Content>
                    </Actionsheet> */}
                </ScrollView>
            </VStack>
        </AppScreen>
    )
}

export default ShowAbsensiDetails