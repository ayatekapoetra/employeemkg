import { TouchableOpacity } from 'react-native'
import React from 'react'
import { VStack, Text, HStack, Badge, Center, Divider } from 'native-base'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import { Calculator, TimerPause, TimerStart } from 'iconsax-react-native'
import { useNavigation } from '@react-navigation/native'

const ItemApprovalLemburKaryawan = ( { data, mode } ) => {
    const route = useNavigation()
    const navigateScreen = () => {
        route.navigate('approval-lembur-karyawan-details', data)
    }


    switch (data.status) {
        case "A":
            var statusBadge = <Badge colorScheme={"success"} rounded={'lg'} variant={'solid'}>approve</Badge>
            break;
        case "F":
            var statusBadge = <Badge colorScheme={"warning"} rounded={'lg'} variant={'solid'}>waiting...</Badge>
            break;
        case "C":
            var statusBadge = <Badge colorScheme={'coolGray'} rounded={'lg'} variant={"solid"}>diterima</Badge>
            break;
        default:
            var statusBadge = <Badge colorScheme={"info"} rounded={'lg'} variant={'solid'}>spl baru</Badge>
            break;
    }

    return (
        <TouchableOpacity onPress={navigateScreen}>
            <VStack mb={2} pb={2} borderBottomColor={appcolor.line[mode][2]} borderBottomWidth={1}>
                <HStack alignItems={'flex-end'} justifyContent={'space-between'}>
                    <Text 
                        fontSize={'xl'}
                        fontWeight={'semibold'}
                        fontFamily={'Quicksand-Regular'}
                        color={appcolor.teks[mode][1]}>
                        { data?.karyawan?.nama }
                    </Text>
                    { statusBadge }
                </HStack>
                <HStack>
                    <Text 
                        fontSize={'sm'}
                        lineHeight={'xs'}
                        fontFamily={'Abel-Regular'}
                        color={appcolor.teks[mode][3]}>
                        { data?.karyawan?.section }
                    </Text>
                </HStack>
                <HStack justifyContent={'space-between'}>
                    <Text 
                        flex={1}
                        fontSize={'md'}
                        lineHeight={'xs'}
                        fontFamily={'Abel-Regular'}
                        color={appcolor.teks[mode][1]}>
                        { moment(data?.date_ops).format('dddd, DD MMMM YYYY') }
                    </Text>
                    <Text 
                        flex={1}
                        textAlign={'right'}
                        fontSize={'md'}
                        lineHeight={'xs'}
                        fontFamily={'Teko-Medium'}
                        color={appcolor.teks[mode][1]}>
                        By : { data?.author?.nama_lengkap }
                    </Text>
                </HStack>
                <HStack 
                    mt={1}
                    alignItems={'center'} 
                    justifyContent={'space-around'}
                    borderWidth={1}
                    borderColor={appcolor.line[mode][1]}
                    rounded={'md'}>
                    <HStack py={2} space={1} flex={1} justifyContent={'center'} alignItems={'center'}>
                        <TimerStart size="32" color={appcolor.teks[mode][4]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { 'Mulai :' }
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontWeight={'bold'}
                                fontFamily={'Roboto-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { moment(data?.overtime_start).format('HH:mm') }
                                <Text 
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { ' WITA' }
                                </Text>
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { moment(data?.overtime_start).format('ddd, DD/MM') }
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack py={2} space={1} flex={1} justifyContent={'center'} alignItems={'center'}>
                        <TimerPause size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { 'Selesai :' }
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontWeight={'bold'}
                                fontFamily={'Roboto-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { moment(data?.overtime_start).format('HH:mm') }
                                <Text 
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { ' WITA' }
                                </Text>
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { moment(data?.overtime_start).format('ddd, DD/MM') }
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack py={2} space={1} flex={1} justifyContent={'center'} alignItems={'center'}>
                        <Calculator size="32" color={appcolor.teks[mode][3]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { 'Total Jam :' }
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontWeight={'bold'}
                                fontFamily={'Roboto-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { data?.overtime_duration }
                                <Text 
                                    fontSize={'sm'}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { ' JAM' }
                                </Text>
                            </Text>
                            <Text 
                                fontSize={'sm'}
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { moment(data?.overtime_start).format('ddd, DD/MM') }
                            </Text>
                        </VStack>
                    </HStack>
                </HStack>
                {
                    data?.approve &&
                    <HStack mt={2} justifyContent={'space-between'}>
                        <Text 
                            fontSize={'sm'}
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][1]}>
                            Disetujui : { data?.approve?.nama || '???' }
                        </Text>
                        <Text 
                            fontSize={'sm'}
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][1]}>
                            { moment(data?.approvedat).format('dddd, DD MMM YYYY') }
                        </Text>
                    </HStack>
                }
                <HStack mt={2}>
                    <Text 
                        fontSize={'sm'}
                        lineHeight={'xs'}
                        fontFamily={'Abel-Regular'}
                        color={appcolor.teks[mode][2]}>
                        Catatan : { data?.narasi }
                    </Text>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}

export default ItemApprovalLemburKaryawan