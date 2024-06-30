import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { HStack, VStack, Text } from 'native-base'
import moment from 'moment'
import appcolor from '../../../common/colorMode'
import { Alarm, CalendarTick, Timer1 } from 'iconsax-react-native'
import { useNavigation } from '@react-navigation/native'

const ItemApprovalAbsenTulis = ( { mode, data } ) => {
    const route = useNavigation()

    if (data.workend && data.workstart) {
        var diff = (moment(data.workend).diff(moment(data.workstart), 'minute') / 60)?.toFixed(1)
    }else{
        var diff = '???'
    }

    const navigateScreen = () => {
        route.navigate('approval-absen-tulis-details', data)
    }

    switch (data.ws_status) {
        case "A":
            var status = 'Accept'
            break;
        default:
            var status = 'Waiting'
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
                        fontFamily={'Farsan-Regular'}
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
                <HStack 
                    p={1} 
                    my={2} 
                    rounded={'md'}
                    borderWidth={1} 
                    alignItems={'center'} 
                    justifyContent={'space-around'} 
                    borderColor={appcolor.line[mode][2]} 
                    borderStyle={'dashed'}>
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
                                { data.workstart ? moment(data.workstart).format('HH:mm'):'--:--' }
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={'xs'}
                                lineHeight={'xs'}
                                fontWeight={'normal'}
                                fontFamily={'Poppins-Light'}
                                color={appcolor.teks[mode][1]}>
                                { data.workstart && moment(data.workstart).format('dddd')}
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
                                { data.workend ? moment(data.workend).format('HH:mm'):'--:--' }
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={'xs'}
                                lineHeight={'xs'}
                                fontWeight={'normal'}
                                fontFamily={'Poppins-Light'}
                                color={appcolor.teks[mode][1]}>
                                { data.workend && moment(data.workend).format('dddd')}
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack space={2} flex={1} alignItems={'center'}>
                        <CalendarTick size="32" color={appcolor.teks[mode][6]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Poppins-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { "Status" }
                            </Text>
                            <Text 
                                fontSize={'xl'}
                                lineHeight={'xs'}
                                fontFamily={'teko-Regular'}
                                color={appcolor.teks[mode][status === 'Accept'?4:5]}>
                                { status }
                            </Text>
                            <Text 
                                mt={-2}
                                fontSize={'xs'}
                                // lineHeight={'xs'}
                                fontWeight={'normal'}
                                fontFamily={'Poppins-Light'}
                                color={appcolor.teks[mode][1]}>
                                { diff } JAM
                            </Text>
                        </VStack>
                    </HStack>
                </HStack>
                <HStack justifyContent={'space-between'}>
                    <Text 
                        fontWeight={300}
                        fontSize={'md'}
                        fontFamily={'Abel-Regular'} 
                        color={appcolor.teks[mode][2]}>
                        { data?.sts_calc_msg || '-' }
                    </Text>
                    <Text 
                        fontWeight={300}
                        fontSize={'md'}
                        fontFamily={'Abel-Regular'} 
                        color={appcolor.teks[mode][2]}>
                        { moment(data?.created_at, 'YYYYMMDDHHmm').fromNow() }
                    </Text>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}

export default ItemApprovalAbsenTulis