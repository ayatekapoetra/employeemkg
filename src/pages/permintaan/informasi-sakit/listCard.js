import { nanoid } from '@reduxjs/toolkit'
import { TouchableOpacity } from 'react-native'
import React from 'react'
import { HStack, Text, VStack } from 'native-base'
import { ArrowRight3, Calendar2 } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useNavigation } from '@react-navigation/native'

const SakitCardList = ( { item, mode } ) => {
    const route = useNavigation()
    return (
        <TouchableOpacity onPress={() => route.navigate("Permintaan-Show-Sakit")}>
            <HStack p={2} space={2} alignItems={"flex-start"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                <Calendar2 size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                <VStack flex={1}>
                    <Text 
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        {nanoid()}
                    </Text>
                    <HStack flex={1} justifyContent={"space-between"}>
                        <Text 
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][1]}>
                            {item.request_date}
                        </Text>
                        <ArrowRight3 size="22" color={appcolor.teks[mode][1]} variant="Bulk"/>
                        <Text 
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][1]}>
                            {item.request_date}
                        </Text>
                    </HStack>
                    <Text 
                        fontSize={12}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][2]}>
                        {item.narasi}
                    </Text>
                    <Text 
                        fontSize={12}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][5]}>
                        {"Ayat Ekapoetra"}
                    </Text>
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}

export default SakitCardList
