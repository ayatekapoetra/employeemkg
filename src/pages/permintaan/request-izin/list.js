import { FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import SakitCardList from '../informasi-sakit/listCard'
import moment from 'moment'

const RequestIzinScreen = ( { mode } ) => {
    const [ data, setData ] = useState([])
    return (
        <VStack mx={3} flex={5}>
            <TouchableOpacity>
                <HStack 
                    p={3}
                    mb={2}
                    space={2} 
                    alignItems={"center"} 
                    borderWidth={.5} 
                    borderStyle={"dashed"}
                    rounded={"md"}
                    borderColor={appcolor.teks[mode][1]}>
                    <CalendarAdd size="32" color="#d9e3f0" variant="Bulk"/>
                    <VStack>
                        <Text 
                            fontSize={18}
                            fontWeight={500}
                            fontFamily={"Quicksand-Regular"}
                            color={appcolor.teks[mode][1]}>
                            Buat izin absensi
                        </Text>
                        <Text 
                            lineHeight={"xs"}
                            fontSize={12}
                            fontWeight={300}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            Membuat permohonan cuti karyawan
                        </Text>
                    </VStack>
                </HStack>
            </TouchableOpacity>
            <VStack flex={1}>
                <FlatList
                    data={data}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => <SakitCardList item={item} mode={mode}/>}
                    keyExtractor={(item) => item.id}/>
            </VStack>
        </VStack>
    )
}

export default RequestIzinScreen