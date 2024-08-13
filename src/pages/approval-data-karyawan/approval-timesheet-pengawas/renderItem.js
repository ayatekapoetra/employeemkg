import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { HStack, VStack, Text, Image, Center, Badge } from 'native-base'
import moment from 'moment'
import appcolor from '../../../common/colorMode'
import { BatteryCharging, Clock, Moon, Pause, PlayCircle, Sun1 } from 'iconsax-react-native'
import { useNavigation } from '@react-navigation/native'

const ItemApprovalTimesheet = ( { mode, data } ) => {
    const route = useNavigation()
    const [ selisihDate, setSelisihDate ] = useState(0)

    if (data.endtime && data.starttime) {
        var diff = (moment(data.endtime).diff(moment(data.starttime), 'minute') / 60)?.toFixed(1)
    }else{
        var diff = '???'
    }

    if(moment(data?.endtime).diff(moment(data.starttime), 'd') > 0){
        var selisihhari = moment(data?.endtime).diff(moment(data.starttime), 'd')
        setSelisihDate(selisihhari)
    }

    const navigateScreen = () => {
        route.navigate('approval-timesheet-pengawas-details', data)
    }

    return (
        <TouchableOpacity onPress={navigateScreen}>
            <VStack py={2} borderBottomWidth={1} borderColor={appcolor.line[mode][1]}>
                <HStack flex={1} alignItems={'center'} justifyContent={'space-between'}>
                    <Text 
                        fontSize={'xl'}
                        fontFamily={'Quicksand-Regular'}
                        color={appcolor.teks[mode][1]}>
                        { moment(data?.date_ops).format('dddd, DD MMMM YYYY') }
                    </Text>
                    <Text 
                        fontSize={'lg'}
                        fontFamily={'Teko-Regular'}
                        color={appcolor.teks[mode][1]}>
                        #{ data?.id }
                    </Text>
                </HStack>
                <HStack alignItems={'center'} justifyContent={'space-between'}>
                    <Text 
                        fontSize={'sm'}
                        lineHeight={'xs'}
                        fontWeight={500}
                        fontFamily={'Quicksand-Regular'}
                        color={appcolor.teks[mode][3]}>
                        { data?.pelanggan?.nama }
                    </Text>
                    <Badge colorScheme={data?.approvedby ? "success":"coolGray"}>
                        { data?.approvedby ? "Accept":"Waiting" }
                    </Badge>
                </HStack>
                <HStack 
                    p={2}
                    my={2} 
                    borderWidth={1} 
                    borderColor={appcolor.line[mode][2]} 
                    borderStyle={'dashed'} 
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    rounded={'md'}>
                    <VStack flex={1}>
                        <Text 
                            fontSize={'2xl'}
                            fontWeight={700}
                            fontFamily={'Dosis-Regular'} 
                            color={appcolor.teks[mode][1]}>
                            { data?.karyawan?.nama }
                        </Text>
                        <HStack space={2} alignItems={'center'}>
                            <Text 
                                fontSize={'2xl'}
                                fontFamily={'Teko-Regular'} 
                                color={appcolor.teks[mode][2]}>
                                { data?.equipment?.kode }
                            </Text>
                            <BatteryCharging size="30" color={appcolor.teks[mode][3]} variant="Bulk"/>
                            <Text 
                                fontSize={'2xl'}
                                fontFamily={'Teko-Regular'} 
                                color={appcolor.teks[mode][2]}>
                                { data?.bbm } Liter
                            </Text>
                        </HStack>
                        <HStack pr={4} space={10} justifyContent={'flex-start'}>
                            <HStack space={1}>
                                <Clock size="20" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <Text 
                                    fontSize={'sm'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][1]}>
                                    Start { moment(data?.starttime).format('HH:mm') }
                                </Text>
                            </HStack>
                            <HStack space={1}>
                                <PlayCircle size="20" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]}>
                                    {
                                        data?.equipment?.kategori === 'DT' ?
                                        <Text>KM {data?.smustart || '-----'}</Text>
                                        :
                                        <Text>HM {data?.smustart || '-----'}</Text>
                                    }
                                </Text>
                            </HStack>
                        </HStack>
                        <HStack pr={4} space={9} justifyContent={'flex-start'}>
                            <HStack space={1}>
                                <Clock size="20" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                <HStack space={1}>
                                    <Text 
                                        fontSize={'sm'}
                                        fontFamily={'Abel-Regular'} 
                                        color={appcolor.teks[mode][1]}>
                                        Finish { moment(data?.endtime).format('HH:mm') } 
                                    </Text>
                                    {
                                        selisihDate > 0 &&
                                        <Text 
                                        fontSize={'sm'}
                                        fontFamily={'Abel-Regular'} 
                                        color={appcolor.teks[mode][1]}>
                                            (+{ selisihDate }) 
                                        </Text>
                                    }
                                </HStack>
                            </HStack>
                            <HStack space={1}>
                                <Pause size="20" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]}>
                                    {
                                        data?.equipment?.kategori === 'DT' ?
                                        <Text>KM {data?.smustart || '-----'}</Text>
                                        :
                                        <Text>HM {data?.smufinish || '-----'}</Text>
                                    }
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>
                        
                    <VStack w={'100px'}>
                        <Center>
                            
                            {
                                data?.equipment?.kategori === 'DT' ?
                                <Image alt='alat-berat' source={require(`../../../../assets/images/IMG-DT.png`)} resizeMode='contain' style={{width: 80, height: 55}}/>
                                :
                                <Image alt='alat-berat' source={require(`../../../../assets/images/IMG-EXCA-BIG.png`)} resizeMode='contain'  style={{width: 80, height: 60}}/>
                            }
                            <HStack mt={3} space={1} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={'sm'}
                                    fontFamily={'Poppins-Regular'} 
                                    color={appcolor.teks[mode][1]}>
                                    Total { diff } Jam
                                </Text>
                            </HStack>
                            <>
                                {
                                    data?.shift == '1' ?
                                    <HStack space={1}>
                                        <Sun1 size="20" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                        <Text 
                                            fontSize={'sm'}
                                            fontFamily={'Poppins-Regular'} 
                                            color={appcolor.teks[mode][1]}>
                                            Shift Pagi
                                        </Text>
                                    </HStack>
                                    :
                                    <HStack space={1}>
                                        <Moon size="20" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                        <Text 
                                            fontSize={'sm'}
                                            fontFamily={'Poppins-Regular'} 
                                            color={appcolor.teks[mode][1]}>
                                            Shift Malam
                                        </Text>
                                    </HStack>
                                }
                            </>
                        </Center>
                    </VStack>
                </HStack>
                <HStack 
                    pb={1}
                    borderWidth={1}
                    borderColor={appcolor.line[mode][1]}
                    justifyContent={'center'} 
                    alignItems={'center'} 
                    rounded={'md'}>
                    {
                        data?.approvedby ?
                        <VStack>
                            <Text 
                                fontSize={'md'}
                                fontWeight={300}
                                fontFamily={'Dosis-Regular'} 
                                color={appcolor.teks[mode][1]}>
                                disetujui oleh : { data?.approved?.nama_lengkap }
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                fontWeight={300}
                                lineHeight={'xs'}
                                fontFamily={'Dosis-Regular'} 
                                color={appcolor.teks[mode][4]}>
                                { moment(data?.approved_at).format('dddd, DD MMMM YYYY [-] HH:mm [WITA]') }
                            </Text>
                        </VStack>
                        :
                        <Text 
                            fontSize={'md'}
                            fontWeight={300}
                            fontFamily={'Dosis-Regular'} 
                            color={appcolor.teks[mode][1]}>
                            Tunggu Persetujuan : { data?.pengawas?.nama || 'pengawas' }
                        </Text>
                    }
                </HStack>
                {
                    data.keterangan &&
                    <VStack>
                        <Text color={appcolor.teks[mode][6]}>Catatan :</Text>
                        <Text 
                            fontFamily={'Poppins-Regular'}
                            color={appcolor.teks[mode][2]}>
                            { data.keterangan }
                        </Text>
                    </VStack>
                }
            </VStack>
        </TouchableOpacity>
    )
}

export default ItemApprovalTimesheet