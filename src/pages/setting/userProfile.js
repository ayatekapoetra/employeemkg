import { ScrollView, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Image } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import moment from 'moment'
import { AlignVertically, Edit, GlobalEdit } from 'iconsax-react-native'

const UserProfile = () => {
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const [ editEmail, setEditEmail ] = useState(false)
    const [ editHp, setEditHp ] = useState(false)

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Profile Ku"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack flex={1}>
                    <HStack mx={3} justifyContent={"space-between"} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                        <VStack flex={1}>
                            <Text 
                                fontSize={24}
                                fontWeight={700}
                                lineHeight={"xs"}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                {user.karyawan?.nama}
                            </Text>
                            <Text 
                                fontSize={14}
                                fontWeight={500}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][3]}>
                                {user.usertype} - {user.karyawan?.section}
                            </Text>
                            <Text 
                                fontSize={16}
                                fontWeight={300}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                {user.karyawan?.ktp}
                            </Text>
                            <TouchableOpacity>
                                <HStack my={2} space={2} alignItems={'center'}>
                                        <GlobalEdit size="22" color={appcolor.teks[mode][1]}/>
                                    {
                                        editEmail ?
                                        <Text>XXXX</Text>
                                        :
                                        <Text 
                                        fontSize={12}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                            {user?.email}
                                        </Text>
                                    }
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <HStack mb={2} space={2} alignItems={'center'}>
                                        <Edit size="22" color={appcolor.teks[mode][1]}/>
                                    <Text 
                                        fontSize={14}
                                        fontWeight={300}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                        {user?.handphone}
                                    </Text>
                                </HStack>
                            </TouchableOpacity>

                            <HStack mb={2} space={2} alignItems={'flex-start'}>
                                <AlignVertically size="22" color={appcolor.teks[mode][1]}/>
                                <Text 
                                    fontSize={14}
                                    fontWeight={300}
                                    fontFamily={"Poppins-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    {user?.karyawan?.alamat}
                                </Text>
                            </HStack>
                        </VStack>
                        <Image 
                            alt='...' 
                            source={require('../../../assets/images/employee.png')} 
                            resizeMode="contain"
                            style={{width: 120, height: 170}}/>
                    </HStack>
                    <ScrollView>
                        <HStack mt={1} mx={3} py={3} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Tempat & Tanggal Lahir :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { user?.karyawan?.t4_lahir }
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(user?.karyawan?.tgl_lahir).format("dddd, DD MMMM YYYY") }
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack mt={1} mx={3} py={3} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Status Karyawan & NPWP :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Karyawan { user?.karyawan?.sts_karyawan }
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={400}
                                    // fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    NPWP : { user?.karyawan?.npwp }
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack mt={1} mx={3} py={3} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Status Pernikahan :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { user?.karyawan?.tanggungan } - { user?.karyawan?.sts_nikah }
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack mt={1} mx={3} py={3} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Agama :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { user?.karyawan?.agama }
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack mt={1} mx={3} py={3} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Tanggal Bergabung :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(user?.karyawan?.tgl_gabung).format("dddd, DD MMMM YYYY") }
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack mt={1} mx={3} py={3} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <VStack>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Bank Transfer :
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={600}
                                    fontFamily={"Quicksand-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { user?.karyawan?.nm_bank } - { user?.karyawan?.no_rekening }
                                </Text>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    { user?.karyawan?.an_rekening }
                                </Text>
                            </VStack>
                        </HStack>
                    </ScrollView>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default UserProfile