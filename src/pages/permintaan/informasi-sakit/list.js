import { TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { VStack, Text, HStack } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import moment from 'moment'
import SakitCardList from './listCard'
import { useNavigation } from '@react-navigation/native'

const mockup = [
    {id: 1, request_date: moment().add(1, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 2, request_date: moment().add(2, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 3, request_date: moment().add(3, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 4, request_date: moment().add(4, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 5, request_date: moment().add(5, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 6, request_date: moment().add(6, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 7, request_date: moment().add(7, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 8, request_date: moment().add(8, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 9, request_date: moment().add(9, "day").format("ddd, DD MMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
    {id: 10, request_date: moment().add(10, "day").format("dddd, DD MMMM YYYY"), nama: "Ayat Ekapoetra", narasi: "Sakit Maag"},
]

const InformasiSakitScreen = ( { mode } ) => {
    const route = useNavigation()
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
                    data={mockup}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => <SakitCardList item={item} mode={mode}/>}
                    keyExtractor={(item) => item.id}/>
            </VStack>
        </VStack>
    )
}

export default InformasiSakitScreen