import { ScrollView, View } from 'react-native'
import React from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack, Image } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import moment from 'moment'

const UserProfile = () => {
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Profile Ku"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack flex={1}>
                    <HStack mx={3} justifyContent={"space-between"}>
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
                            <Text 
                                fontSize={12}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                {user?.email}
                            </Text>
                            <Text 
                                fontSize={14}
                                fontWeight={300}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                {user?.handphone}
                            </Text>
                            <Text 
                                fontSize={14}
                                fontWeight={300}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][1]}>
                                {user?.karyawan?.alamat}
                            </Text>
                        </VStack>
                        <Image 
                            alt='...' 
                            source={require('../../../assets/images/employee.png')} 
                            resizeMode="contain"
                            style={{width: 120, height: 170}}/>
                    </HStack>
                    <ScrollView>
                        <HStack mt={3} mx={3} p={3} rounded={"md"} bg={appcolor.box[mode]}>
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
                        <HStack mt={3} mx={3} p={3} rounded={"md"} bg={appcolor.box[mode]}>
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
                        <HStack mt={3} mx={3} p={3} rounded={"md"} bg={appcolor.box[mode]}>
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
                        <HStack mt={3} mx={3} p={3} rounded={"md"} bg={appcolor.box[mode]}>
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
                        <HStack mt={3} mx={3} p={3} rounded={"md"} bg={appcolor.box[mode]}>
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
                        <HStack mt={3} mx={3} p={3} rounded={"md"} bg={appcolor.box[mode]}>
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