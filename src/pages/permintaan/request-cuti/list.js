import { TouchableOpacity } from 'react-native'
import React from 'react'
import { VStack, Text, HStack, Center, Image } from 'native-base'
import { CalendarAdd } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'

const RequestCutiScreen = ( { mode } ) => {
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
                            Buat permohonan cuti
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
                <Center flex={1} justifyContent={"center"}>
                    <Text 
                        fontSize={14}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][2]}>
                        Fitur ini masih dalam pengembangan
                    </Text>
                    <Image 
                        alt='...' 
                        source={require('../../../../assets/images/under-development.png')} 
                        resizeMode="contain" 
                        style={{width: "100%", height: 300}}/>
                    <Text 
                        fontSize={16}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][3]}>
                        Fitur Under Development
                    </Text>
                </Center>
            </VStack>
        </VStack>
    )
}

export default RequestCutiScreen