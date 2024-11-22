import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Center, Image, Badge, Stack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { BTNTASK } from '../../../assets/images'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const CreatePenugasan = () => {
    const route = useNavigation()
    const mode = useSelector(state => state.themes.value)
    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Buat Penugasan Kerja"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack mt={3} h={'170px'} px={3} space={3} justifyContent={'space-around'} alignItems={'center'}>
                        <TouchableOpacity onPress={() => route.navigate('create-penugasan-karyawan')} style={{flex: 1}}>
                            <VStack p={3} flex={1} alignItems={'center'} rounded={'lg'} borderWidth={1} borderStyle={'dashed'} borderColor={appcolor.line[mode][2]}>
                                <Text fontFamily={'Poppins'} color={appcolor.teks[mode][1]} textAlign={'center'}>Penugasan</Text>
                                <Image 
                                    alt='...' 
                                    source={BTNTASK.user} 
                                    resizeMode="contain"
                                    style={{width: 100, height: 100}}/>
                                <Text mt={2} fontFamily={'Poppins'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} textAlign={'center'} lineHeight={'xs'}>Karyawan</Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => route.navigate('create-penugasan-equipment')} style={{flex: 1}}>
                            <VStack p={3} flex={1} alignItems={'center'} rounded={'lg'} borderWidth={1} borderStyle={'dashed'} borderColor={appcolor.line[mode][2]}>
                                <Text fontFamily={'Poppins'} color={appcolor.teks[mode][1]} textAlign={'center'}>Penugasan</Text>
                                <Image 
                                    alt='...' 
                                    source={BTNTASK.equipment} 
                                    resizeMode="contain"
                                    style={{width: 100, height: 100}}/>
                                <Text mt={2} fontFamily={'Poppins'} fontWeight={'semibold'} color={appcolor.teks[mode][1]} textAlign={'center'} lineHeight={'xs'}>Equipment</Text>
                            </VStack>
                        </TouchableOpacity>
                    </HStack>
                    <VStack px={3} flex={1}>
                        <HStack my={5} space={2} alignItems={'flex-start'}>
                            <Stack mt={1} h={'15px'} w={'15px'} bg={'danger.500'} rounded={'full'}/>
                            <VStack>
                                <Text fontFamily={'Quicksand'} fontSize={16} fontWeight={'semibold'} color={appcolor.teks[mode][1]}>
                                    Penugasan Karyawan
                                </Text>
                                <Text color={appcolor.teks[mode][2]}>
                                    Delegasi tugas karyawan atau pemberian tugas tugas kepada karyawan dengan deadline yang telah ditentukan
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack space={2} alignItems={'flex-start'}>
                            <Stack mt={1} h={'15px'} w={'15px'} bg={'warning.500'} rounded={'full'}/>
                            <VStack>
                                <Text fontFamily={'Quicksand'} fontSize={16} fontWeight={'semibold'} color={appcolor.teks[mode][1]}>
                                    Penugasan Equipment
                                </Text>
                                <Text color={appcolor.teks[mode][2]}>
                                    Delegasi tugas atau pemberian tugas tugas kepada operator maupun driver tentang lokasi pekerjaan,
                                    tipe pekerjaan, waktu shift kerja, equipment yang digunakan dan lain sebagainya. Data penugasan akan
                                    dijadikan acuan dalam pembuatan timesheet kerja operator dan driver
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default CreatePenugasan