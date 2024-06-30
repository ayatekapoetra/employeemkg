import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { HStack, VStack, Text } from 'native-base'
import moment from 'moment'
import appcolor from '../../../common/colorMode'
import { Alarm, CalendarTick, Timer1 } from 'iconsax-react-native'
import { useNavigation } from '@react-navigation/native'

const ItemApprovalChecklog = ( { mode, data } ) => {
    const route = useNavigation()

    if (data.checklog_out && data.checklog_in) {
        var diff = (moment(data.checklog_out).diff(moment(data.checklog_in), 'minute') / 60)?.toFixed(1)
    }else{
        var diff = '???'
    }

    const navigateScreen = () => {
        route.navigate('approval-checklog-harian-details', data)
    }

    switch (data.kehadiran_sts) {
        case "H":
            var status = 'Hadir'
            break;
        case "C":
            var status = 'Cuti'
            break;
        case "A":
            var status = 'Alpha'
            break;
        case "L":
            var status = 'Terlambat'
            break;
        case "E":
            var status = 'Pulang Cpt'
            break;
    
        default:
            var status = '-'
            break;
    }
    return (
        <TouchableOpacity onPress={navigateScreen}>
            <VStack py={2} borderBottomWidth={1} borderColor={appcolor.line[mode][1]}>
                <HStack flex={1} alignItems={'center'} justifyContent={'space-between'}>
                    <Text 
                        fontSize={'xl'}
                        fontWeight={'bold'}
                        fontFamily={'Dosis-Regular'}
                        color={appcolor.teks[mode][1]}>
                        { data?.karyawan?.nama }
                    </Text>
                    <Text 
                        fontSize={'lg'}
                        fontFamily={'Teko-Regular'}
                        color={appcolor.teks[mode][1]}>
                        { data?.karyawan?.section }
                    </Text>
                </HStack>
                <HStack alignItems={'center'} justifyContent={'space-between'}>
                    <Text 
                        fontSize={'sm'}
                        lineHeight={'xs'}
                        fontFamily={'Quicksand-Regular'}
                        color={appcolor.teks[mode][2]}>
                        { moment(data.date_ops).format('dddd, DD MMMM YYYY') }
                    </Text>
                    <Text 
                        fontSize={'md'}
                        lineHeight={'xs'}
                        fontFamily={'Poppins-Regular'}
                        color={appcolor.teks[mode][2]}>
                        { "#" + data?.id }
                    </Text>
                </HStack>
                <HStack alignItems={'center'} justifyContent={'space-between'}>
                    <HStack space={2} flex={1} alignItems={'center'}>
                        <Timer1 size="32" color={appcolor.teks[mode][4]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                fontFamily={'Poppins-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { "Masuk" }
                            </Text>
                            <Text 
                                fontSize={'2xl'}
                                lineHeight={'xs'}
                                fontFamily={'Teko-Regular'}
                                color={appcolor.teks[mode][4]}>
                                { data.checklog_in ? moment(data.checklog_in).format('HH:mm'):'--:--' }
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={'xs'}
                                lineHeight={'xs'}
                                fontWeight={'normal'}
                                fontFamily={'Poppins-Light'}
                                color={appcolor.teks[mode][1]}>
                                { data.checklog_in && moment(data.checklog_in).format('DD/MM dddd')}
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack space={2} flex={1} alignItems={'center'}>
                        <Timer1 size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Poppins-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { "Pulang" }
                            </Text>
                            <Text 
                                fontSize={'2xl'}
                                lineHeight={'xs'}
                                fontFamily={'Teko-Regular'}
                                color={appcolor.teks[mode][3]}>
                                { data.checklog_out ? moment(data.checklog_out).format('HH:mm'):'--:--' }
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={'xs'}
                                lineHeight={'xs'}
                                fontWeight={'normal'}
                                fontFamily={'Poppins-Light'}
                                color={appcolor.teks[mode][1]}>
                                { data.checklog_out && moment(data.checklog_out).format('DD/MM dddd')}
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack space={2} flex={1} alignItems={'center'}>
                        <CalendarTick size="32" color={appcolor.teks[mode][6]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                fontFamily={'Poppins-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { "Status" }
                            </Text>
                            <Text 
                                fontSize={'2xl'}
                                lineHeight={'xs'}
                                fontFamily={'Teko-Regular'}
                                color={appcolor.teks[mode][6]}>
                                { status }
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={'xs'}
                                lineHeight={'xs'}
                                fontWeight={'normal'}
                                fontFamily={'Poppins-Light'}
                                color={appcolor.teks[mode][2]}>
                                { diff } JAM
                            </Text>
                        </VStack>
                    </HStack>
                </HStack>
                <HStack>
                    <Text 
                        fontWeight={300}
                        fontSize={'md'}
                        fontFamily={'Abel-Regular'} 
                        color={appcolor.teks[mode][2]}>
                        { data.sts_calc_msg }
                    </Text>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}

export default ItemApprovalChecklog