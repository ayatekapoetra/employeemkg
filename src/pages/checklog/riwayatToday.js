import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, Center, HStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import apiFetch from '../../helpers/ApiFetch'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import { Alarm, Calendar2, LoginCurve, LogoutCurve, WristClock } from 'iconsax-react-native'
import moment from 'moment'
import { FlatList } from 'react-native'
import LoadingHauler from '../../components/LoadingHauler'

const RiwayatAbsensiToday = () => {
    const route = useNavigation()
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    const [ data, setData ] = useState(null)
    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        getDataInitial()
    }, [])

    const getDataInitial = async () => {
        setLoading(true)
        const resp = await apiFetch.get(`mobile/checklog-today/${user.karyawan.id}/${user.karyawan.pin}`)
        const result = resp.data
        if(!result.diagnostic.error){
            setData(result.data)
        }

        setLoading(false)
    }

    console.log(data);
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Riwayat Checklog"} onBack={true} onThemes={true} onNotification={true}/>
                { 
                    loading ? 
                    <LoadingHauler/> 
                    :
                    <VStack flex={1}>
                        <Center mt={3}>
                            <Text 
                                fontSize={"4xl"}
                                fontWeight={"semibold"}
                                fontFamily={"Quicksand"}
                                color={appcolor.teks[mode][1]}>
                                { user.karyawan.nama }
                            </Text>
                            <Text 
                                fontSize={"xl"}
                                fontWeight={"light"}
                                fontFamily={"Quicksand"}
                                color={appcolor.teks[mode][1]}>
                                Pin { user.karyawan.pin }
                            </Text>
                        </Center>
                        <HStack px={2} my={3} space={2} alignItems={"center"} justifyContent={"space-around"}>
                            <HStack p={1} flex={1} space={1} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]} borderStyle={"dashed"}>
                                <WristClock size="42" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                {
                                    data?.checklog_in &&
                                    <VStack>
                                        <Text 
                                            fontFamily={"Abel-Regular"}
                                            color={appcolor.teks[mode][2]}>
                                            { moment(data?.checklog_in).format("ddd, DD MMMM YYYY") }
                                        </Text>
                                        <Text 
                                            fontSize={"lg"}
                                            fontFamily={"Poppins"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data?.checklog_in).format("HH:mm A") }
                                        </Text>
                                    </VStack>
                                }
                            </HStack>
                            <HStack p={1} flex={1} space={1} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][1]} borderStyle={"dashed"}>
                                <WristClock size="42" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                {
                                    data?.checklog_out &&
                                    <VStack>
                                        <Text 
                                            fontFamily={"Abel-Regular"}
                                            color={appcolor.teks[mode][2]}>
                                            { moment(data?.checklog_out).format("ddd, DD MMMM YYYY") }
                                        </Text>
                                        <Text 
                                            fontSize={"lg"}
                                            fontFamily={"Poppins"}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(data?.checklog_out).format("HH:mm A") }
                                        </Text>
                                    </VStack>
                                }
                            </HStack>
                        </HStack>
                        <VStack px={2} flex={1}>
                            <FlatList
                                data={data?.items || []}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => <ItemRiwayat item={item} mode={mode}/>}
                                keyExtractor={(item) => item.id}/>
                        </VStack>
                    </VStack>
                }
            </VStack>
        </AppScreen>
    )
}

export default RiwayatAbsensiToday


function ItemRiwayat( { item, mode } ) {
    return(
        <HStack py={2} space={1} alignItems={"center"} justifyContent={"space-between"} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
            <HStack>
                <Calendar2 size="52" color={appcolor.ico[mode][1]} variant="Bulk"/>
                <VStack>
                    <Text color={appcolor.teks[mode][2]}>
                        { moment(item.scan).format("dddd, DD MMMM YYYY") }
                    </Text>
                    <Text fontSize={"xs"} color={appcolor.teks[mode][2]}>
                        { item.status_scan == 0 ? "LOG MASUK":"LOG PULANG" }
                    </Text>
                    <Text fontSize={"xs"} color={appcolor.teks[mode][2]}>
                        VIA { item.via == "A" ? "APLIKASI":"FINGER" }
                    </Text>
                </VStack>
            </HStack>
            {
                item.status_scan == 0 ?
                <LoginCurve size="32" color={appcolor.teks[mode][6]} variant="Bulk"/>
                :
                <LogoutCurve size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
            }
            <VStack alignItems={"flex-end"}>
                <Text fontFamily={"Teko"} fontWeight={"light"} fontSize={"2xl"} color={appcolor.teks[mode][1]}>
                    { moment(item.scan).format("HH:mm") }
                </Text>
                <Text lineHeight={"xs"} fontFamily={"Poppins"} fontWeight={"light"} fontSize={"sm"} color={appcolor.teks[mode][1]}>
                    { moment(item.scan).format("A") }
                </Text>
            </VStack>
        </HStack>
    )
}