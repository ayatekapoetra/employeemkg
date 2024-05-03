import { TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import SakitCardList from './listCard'
import { useNavigation } from '@react-navigation/native'

const InformasiSakitScreen = ( { mode } ) => {
    const route = useNavigation()
    const [ data, setData ] = useState([])
    return (
        <VStack mx={3} flex={5}>
            <TouchableOpacity onPress={() => route.navigate('Permintaan-Create-Sakit')}>
                <HStack 
                    p={3}
                    mb={2}
                    space={2} 
                    alignItems={"center"} 
                    borderWidth={.5} 
                    borderStyle={"dashed"}
                    rounded={"md"}
                    borderColor={appcolor.teks[mode][1]}>
                    <CalendarAdd size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                    <VStack>
                        <Text 
                            fontSize={18}
                            fontWeight={500}
                            fontFamily={"Quicksand-Regular"}
                            color={appcolor.teks[mode][1]}>
                            Buat izin sakit
                        </Text>
                        <Text 
                            lineHeight={"xs"}
                            fontSize={12}
                            fontWeight={300}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            Membuat pemberitahuan sakit karyawan
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

export default InformasiSakitScreen