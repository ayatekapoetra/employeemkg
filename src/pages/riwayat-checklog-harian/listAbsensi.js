import { TouchableOpacity } from 'react-native'
import React from 'react'
import { VStack, Text, HStack } from 'native-base'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { Calendar, Calendar2, Logout } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import moment from 'moment'

const ListAbsensi = ( { item } ) => {
    // console.log(item);
    const route = useNavigation()
    const mode = useSelector(state => state.themes).value

    if(item.approve_sts === "A"){
        var color = appcolor.ico[mode][4]
    }else{
        var color = appcolor.teks[mode][1]
    }

    const onShowHandle = () => {
        route.navigate('Show-Kehadiran-Details', item)
    }

    return (
        <TouchableOpacity onPress={onShowHandle}>
            <HStack py={3} space={2} alignItems={"center"} borderBottomWidth={.5} borderBottomColor={appcolor.teks[mode][1]}>
                <VStack flex={1}>
                    <HStack alignItems={"center"} justifyContent={"space-between"}>
                        <Text 
                            fontSize={18}
                            fontWeight={600}
                            fontFamily={"Quicksand-Regular"}
                            color={appcolor.teks[mode][1]}>
                            { moment(item.date_ops).format("dddd, DD MMMM YYYY") }
                        </Text>
                        <Text 
                            fontSize={"sm"}
                            fontWeight={400}
                            fontFamily={"Roboto-Regular"}
                            color={appcolor.teks[mode][1]}>
                            ID#{ item?.id }
                        </Text>
                    </HStack>
                    <Text 
                        lineHeight={"xs"}
                        fontSize={14}
                        fontWeight={400}
                        fontFamily={"Roboto-Regular"}
                        color={appcolor.teks[mode][3]}>
                        [ { item?.karyawan?.section } ] { item?.karyawan?.nama }
                    </Text>
                    
                    <HStack 
                        my={1} 
                        flex={1} 
                        borderWidth={1}
                        borderColor={appcolor.line[mode][2]}
                        borderStyle={'dashed'}
                        rounded={'md'}
                        justifyContent={"space-around"} 
                        alignItems={"center"}>
                        <HStack alignItems={"center"} w={'1/3'}>
                            <Calendar size="32" color={color} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={"2xl"}
                                    fontWeight={300}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { item.checklog_in ? moment(item.checklog_in).format("HH:mm"):'--:--' }
                                </Text>
                            </VStack>
                        </HStack>

                        <Logout size="32" color="#555555" variant="Bulk"/>

                        <HStack space={1} alignItems={"center"} w={'1/3'}>
                            <Calendar2 size="32" color={color} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={"2xl"}
                                    fontWeight={300}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { item.checklog_out ? moment(item.checklog_out).format("HH:mm"):'--:--' }
                                </Text>
                            </VStack>
                        </HStack>
                    </HStack>
                    <HStack justifyContent={'space-between'}>
                        {
                            item?.approve &&
                            <Text 
                                fontFamily={'Dosis'}
                                color={appcolor.teks[mode][2]}>
                                checkBy : { item?.approve?.nama || '???' }
                            </Text>
                        }
                        {
                            item?.approve_at &&
                            <Text 
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][6]}>
                                { moment(item?.approve_at, 'YYYYMMDDHHmm').fromNow() }
                            </Text>
                        }
                    </HStack>
                    {
                        item?.sts_calc_msg &&
                        <Text 
                            fontFamily={'Farsan-Regular'}
                            color={appcolor.teks[mode][2]}>
                            { item?.sts_calc_msg }
                        </Text>
                    }
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}

export default ListAbsensi