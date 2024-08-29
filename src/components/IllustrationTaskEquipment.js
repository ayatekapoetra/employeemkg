// import { View } from 'react-native'
import React from 'react'
import { VStack, Text, HStack, View, Divider, Center } from 'native-base'
import { AlignVertically, Android, TimerPause, TimerStart, Trash, TruckFast, Watch, WristClock } from 'iconsax-react-native'
import appcolor from '../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { applyTugas } from '../redux/tugasSlice'
import { TouchableOpacity } from 'react-native'

const IllustrationTaskEquipment = ( { data, person } ) => {
    
    const dispatch = useDispatch()
    const task = useSelector(state => state.tugas)
    const mode = useSelector(state => state.themes.value)

    const removeKegiatanHandle = () => {
        console.log("----**", data);
        console.log("----**---", person.key);
        dispatch(applyTugas({
            ...task,
            equipmentTask: task.equipmentTask.map( m => m.id === person.id ? {...m, items: m.items.filter( mm => mm.key != data.key)}: m)
        }))
    }

    return (
        <VStack my={2} flex={1}>
            <HStack flex={1} space={2}>
                <VStack w={'25px'} alignItems={'center'}>
                    <Center bg={appcolor.teks[mode][4]} h={'25px'} width={'25px'} rounded={'full'}>
                        <TimerStart size="20" color={'#FFF'} variant={"Outline"}/>
                    </Center>
                    <View flex={1} bg={appcolor.line[mode][1]} w={'1px'}/>
                    <Center bg={appcolor.teks[mode][5]} h={'10px'} width={'10px'} rounded={'full'}/>
                </VStack>
                <VStack flex={1} minH={'100px'}>
                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                        <Text 
                            fontSize={18}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][1]}>
                            { data.kegiatan?.nama || '???' }
                        </Text>
                        <TouchableOpacity onPress={removeKegiatanHandle}>
                            <Trash size="20" color={appcolor.ico[mode][2]} variant={"Outline"}/>
                        </TouchableOpacity>
                    </HStack>
                    <VStack pb={1} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]} borderBottomStyle={'dotted'}>
                        <HStack flex={1} justifyContent={'space-between'}>
                            <VStack>
                                <HStack space={1} alignItems={'center'}>
                                    <Watch size="20" color={appcolor.teks[mode][3]} variant={"Outline"}/>
                                    <Text 
                                        fontSize={18}
                                        fontWeight={700}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { data.starttask ? moment(data.starttask).format('HH:mm [wita]'):'00:00 wita' }
                                    </Text>
                                </HStack>
                                <Text 
                                    fontSize={12}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][3]}>
                                    { data.starttask ? moment(data.starttask).format('dddd, DD MMMM YYYY'):'Mulai Pukul' }
                                </Text>
                            </VStack>
                            <VStack>
                                <HStack space={1} alignItems={'center'}>
                                    <Watch size="20" color={appcolor.teks[mode][6]} variant={"Outline"}/>
                                    <Text 
                                        fontSize={18}
                                        fontWeight={700}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { data.finishtask ? moment(data.finishtask).format('HH:mm [wita]'):'00:00 wita' }
                                    </Text>
                                </HStack>
                                <Text 
                                    fontSize={12}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][5]}>
                                    { data.finishtask ? moment(data.finishtask).format('dddd, DD MMMM YYYY'):'Selesai Pukul' }
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    <VStack pb={1} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]} borderBottomStyle={'dotted'}>
                        <HStack space={2} mt={1} alignItems={'center'}>
                            <TruckFast size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={12}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Equipment Unit :
                                </Text>
                                <Text 
                                    mt={-1}
                                    fontSize={16}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { data.equipment?.kode || 'Kode Alat Berat' }
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    <VStack pb={1} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]} borderBottomStyle={'dotted'}>
                        <HStack space={2} mt={1} alignItems={'center'}>
                            <Android size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={12}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Penyewa :
                                </Text>
                                <Text 
                                    mt={-1}
                                    fontSize={16}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { task.penyewa?.nama || "Nama Penyewa Alat" }
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    <VStack pb={1} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]} borderBottomStyle={'dotted'}>
                        <HStack space={2} mt={1} alignItems={'center'}>
                            <AlignVertically size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={12}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Lokasi Kerja :
                                </Text>
                                <Text 
                                    mt={-1}
                                    fontSize={16}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { task.lokasi?.nama || "Lokasi Kerja Equipment" }
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    <VStack pb={1}>
                        <HStack space={2} mt={1} alignItems={'center'}>
                            <WristClock size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                            <VStack>
                                <Text 
                                    fontSize={12}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Shift Kerja :
                                </Text>
                                <Text 
                                    mt={-1}
                                    fontSize={16}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    { task.shift?.nama || "Waktu Shift Kerjat" }
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                </VStack>
            </HStack>
        </VStack>
    )
}

export default IllustrationTaskEquipment