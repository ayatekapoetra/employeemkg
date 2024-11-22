import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Button, PresenceTransition } from 'native-base'
import appcolor from '../../common/colorMode'
import { CloseCircle, CloseSquare, FilterSearch, Refresh2, RepeatCircle, UserSearch } from 'iconsax-react-native'
import { useSelector } from 'react-redux'
import KaryawanList from '../../components/KaryawanList'

const FilterDelegasiTugas = ( { onClose, onApplyFilter, qstring, setQstring } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ openKaryawan, setOpenKaryawan ] = useState(false)

    const typeChangeHandle = () => {
        setQstring({
            ...qstring, 
            type: qstring.type === 'user' ? 'equipment':'user'
        })
    }

    console.log('----', qstring);

    return (
        <VStack flex={1}>
            <VStack flex={1}>
                <VStack h={"75px"}>
                    <HStack alignItems={'center'} px={2} borderWidth={.5} borderColor={appcolor.line[mode][2]} borderStyle={'dotted'} rounded={'md'}>
                        <TouchableOpacity style={{flex: 1}} onPress={typeChangeHandle}>
                            <VStack p={2}>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Type Tugas :
                                </Text>
                                <HStack m={-1} px={1} space={2} alignItems={"center"}>
                                    <Text 
                                        fontSize={20}
                                        fontFamily={"Poppins-Bold"} 
                                        color={appcolor.teks[mode][2]}>
                                        { qstring?.type || 'Semua Type' }
                                    </Text>
                                </HStack>
                            </VStack>
                        </TouchableOpacity>
                        {
                            !qstring.type ?
                            <RepeatCircle size="28" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            :
                            <TouchableOpacity onPress={() => setQstring({...qstring, type: ''})}>
                                <CloseSquare size="28" color={appcolor.teks[mode][5]} variant="Outline"/>
                            </TouchableOpacity>
                        }
                    </HStack>
                </VStack>
                <VStack h={"75px"}>
                    <HStack px={2} alignItems={'center'} borderWidth={.5} borderColor={appcolor.line[mode][2]} borderStyle={'dotted'} rounded={'md'}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => setOpenKaryawan(!openKaryawan)}>
                            <VStack p={2}>
                                <Text 
                                    fontFamily={"Abel-Regular"}
                                    color={appcolor.teks[mode][1]}>
                                    Karyawan :
                                </Text>
                                <HStack space={2} alignItems={"center"}>
                                    <HStack space={2}>
                                        <UserSearch size="32" color="#555555" variant="Bulk"/>
                                        <Text 
                                            flex={1}
                                            fontSize={20}
                                            fontFamily={"Poppins-Bold"}
                                            color={appcolor.teks[mode][2]}>
                                            { qstring?.karyawan?.nama }
                                        </Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </TouchableOpacity>
                        {
                            qstring?.karyawan?.nama &&
                            <TouchableOpacity onPress={() => setQstring({...qstring, karyawan_id: null, karyawan: null})}>
                                <CloseCircle size="28" color={appcolor.teks[mode][5]} variant="Bulk"/>
                            </TouchableOpacity>

                        }
                    </HStack>
                    {
                        openKaryawan &&
                        <PresenceTransition 
                            style={{height: 500}}
                            visible={openKaryawan} 
                            initial={{opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 250 } }}>
                            <KaryawanList state={qstring} setState={setQstring} setOpenKaryawan={setOpenKaryawan}/>
                        </PresenceTransition>
                    }
                </VStack>

            </VStack>
            <HStack px={2} mt={2}>
                <Button onPress={onClose} w={"1/3"} mr={2} bg={appcolor.teks[mode][2]}>
                    <HStack space={1} alignItems={"center"}>
                        <Refresh2 size="26" color="#000" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#000"}>Reset</Text>
                    </HStack>
                </Button>
                <Button onPress={onApplyFilter} flex={1} bg={appcolor.teks[mode][6]}>
                    <HStack space={1} alignItems={"center"}>
                        <FilterSearch size="26" color="#FFFFFF" variant="Bulk"/>
                        <Text fontWeight={"bold"} color={"#FFFFFF"}>Terapkan Filter</Text>
                    </HStack>
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterDelegasiTugas