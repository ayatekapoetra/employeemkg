import { nanoid } from '@reduxjs/toolkit'
import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Badge, Center, HStack, Text, VStack } from 'native-base'
import { ArrowRight3, Calendar2, ProfileTick } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'

const ItemApprovalIzinSakit = ( { item, mode } ) => {
    const route = useNavigation()
    return (
        <TouchableOpacity onPress={() => route.navigate("approval-izin-sakit-details", item)}>
            <VStack pb={2} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                <HStack p={2} space={1} alignItems={"flex-start"}>
                    <Center>
                        {
                            !item?.approved_at &&
                            <HStack h={3} w={3} position={"absolute"} bg={"error.500"} rounded={"full"} zIndex={99} left={0} top={0}/>
                        }
                        <Calendar2 size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                        <Text 
                            fontSize={12}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            { item?.jumlah } H
                        </Text>
                    </Center>
                    <VStack flex={1}>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                            <Text 
                                fontSize={'lg'}
                                lineHeight={'xs'}
                                fontWeight={'semibold'}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                { item?.nama }
                            </Text>
                            {
                                item?.status ?
                                <HStack>
                                    { item?.status === 'A' && <Badge rounded={'full'} colorScheme="success">Approve</Badge> }
                                    { item?.status === 'R' && <Badge rounded={'full'} colorScheme="danger">Reject</Badge> }
                                </HStack>
                                :
                                <HStack>
                                    <Badge rounded={'full'} colorScheme="coolGray">Waiting</Badge>
                                </HStack>
                            }
                        </HStack>
                        <Text 
                            fontSize={'sm'}
                            fontFamily={"Abel-Regular"}
                            color={appcolor.teks[mode][6]}>
                            dibuat : { moment(item.created_at, 'YYYYMMDDHHmm').fromNow() }
                        </Text>
                        <HStack flex={1} justifyContent={"space-between"}>
                            <Text 
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                { moment(item?.date_start).format("ddd, DD MMM YYYY") }
                            </Text>
                            <ArrowRight3 size="22" color={appcolor.teks[mode][1]} variant="Bulk"/>
                            <Text 
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                { moment(item?.date_end).format("ddd, DD MMM YYYY") }
                            </Text>
                        </HStack>
                        <Text 
                            fontSize={12}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            { item?.narasi || "" }
                        </Text>
                    </VStack>
                </HStack>
                {
                    item?.approve &&
                    <HStack justifyContent={"space-between"}>
                        <HStack space={1}>
                            <ProfileTick size="20" color={appcolor.teks[mode][4]} variant="Bulk"/>
                            <Text 
                                fontSize={12}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][4]}>
                                { item?.approve?.nama }
                            </Text>
                        </HStack>
                        {
                            item?.approved_at &&
                            <Text 
                                fontSize={12}
                                fontWeight={400}
                                fontStyle={"italic"}
                                fontFamily={"Poppins-Italic"}
                                color={appcolor.teks[mode][3]}>
                                { moment(item?.approved_at).format("DD/MM/YY HH:mm") }
                            </Text>
                        }
                    </HStack>
                }
            </VStack>
        </TouchableOpacity>
    )
}

export default ItemApprovalIzinSakit
