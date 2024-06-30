import { nanoid } from '@reduxjs/toolkit'
import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Center, HStack, Text, VStack, View } from 'native-base'
import { ArrowRight3, Calendar2, ProfileTick } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'

const CutiCardList = ( { item, mode } ) => {
    const route = useNavigation()
    return (
        <TouchableOpacity onPress={() => route.navigate("Show-Permintaan-Cuti", item)}>
            <HStack p={2} space={1} alignItems={"flex-start"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                <Center>
                    {
                        item.status != "A" &&
                        <HStack h={3} w={3} position={"absolute"} bg={"error.500"} rounded={"full"} zIndex={99} left={0} top={0}/>
                    }
                    <Calendar2 size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                    <Text 
                        fontSize={12}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][2]}>
                        { item.jumlah } H
                    </Text>
                </Center>
                <VStack flex={1}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        { item.nama }
                    </Text>
                    <HStack flex={1} justifyContent={"space-between"}>
                        <Text 
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][1]}>
                            { moment(item.cuti_start).format("ddd, DD MMM YYYY") }
                        </Text>
                        <ArrowRight3 size="22" color={appcolor.teks[mode][1]} variant="Bulk"/>
                        <Text 
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][1]}>
                            { moment(item.cuti_end).format("ddd, DD MMM YYYY") }
                        </Text>
                    </HStack>
                    <Text 
                        fontSize={12}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][2]}>
                        { item.narasi || "" }
                    </Text>
                    {
                        item.approve &&
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
                            <Text 
                                fontSize={12}
                                fontWeight={400}
                                fontStyle={"italic"}
                                fontFamily={"Poppins-Italic"}
                                color={appcolor.teks[mode][3]}>
                                { moment(item.approved_at).format("DD/MM/YY HH:mm") }
                            </Text>

                        </HStack>
                    }
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}

export default CutiCardList
