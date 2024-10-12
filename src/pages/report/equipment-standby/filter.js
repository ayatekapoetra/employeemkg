import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Flex, ScrollView, Button } from 'native-base'
import { Buildings, CloseSquare, Map, TruckTime } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import SheetEquipmentMulti from '../../../components/SheetEquipmentMulti'
import SheetPenyewa from '../../../components/SheetPenyewa'
import SheetLokasiPit from '../../../components/SheetLokasiPit'

const FilterReportEquipmentStandByDetails = ( { qstring, setQstring, applyFilterHandle, resetFilterHandle } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ layer, setLayer ] = useState({
        penyewa: false,
        equipment: false,
        lokasi: false
    })

    const onSelectedEquipment = (array) => {
        console.log(array);
        setQstring({...qstring, equipments: array})
    }
    const onDeselectedEquipment = (obj) => {
        setQstring({...qstring, equipments: qstring.equipments.filter( f => f.id != obj.id)})
    }

    const onSelectedPenyewa = (obj) => {
        setQstring({...qstring, penyewa: obj})
        setLayer({...layer, penyewa: false})
    }

    const onSelectedLokasi = (obj) => {
        setQstring({...qstring, lokasi: obj})
        setLayer({...layer, lokasi: false})
    }

    return (
        <VStack p={3}>
            <ScrollView>
                <TouchableOpacity onPress={() => setLayer({...layer, equipment: true})}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <TruckTime size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Equipment Terdampak :
                                </Text>
                                <Flex flexWrap={'wrap'} direction='row'>
                                    {
                                        qstring?.equipments?.map( m => {
                                            return(
                                                <TouchableOpacity key={m.id} onPress={() => onDeselectedEquipment(m)}>
                                                    <HStack 
                                                        mr={2} 
                                                        mb={2} 
                                                        space={2}
                                                        bg={'amber.100'} 
                                                        rounded={'md'} 
                                                        alignItems={'center'} 
                                                        justifyContent={'space-between'}
                                                        borderWidth={1} borderColor={appcolor.teks[mode][5]}>
                                                        <Text 
                                                            ml={3}
                                                            fontSize={18}
                                                            lineHeight={'xs'}
                                                            fontWeight={'black'}
                                                            fontFamily={'Dosis'}>
                                                            { m.kode }
                                                        </Text>
                                                        <CloseSquare size="28" color={appcolor.teks[mode][5]} variant="Broken"/>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </Flex>
                            </VStack>
                        </HStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setLayer({...layer, penyewa: true})}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <Buildings size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Penyewa :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { qstring?.penyewa?.nama || 'Semua Penyewa' }
                                </Text>
                                
                            </VStack>
                        </HStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setLayer({...layer, lokasi: true})}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <Map size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Lokasi :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { qstring?.lokasi?.nama || 'Semua Lokasi' }
                                </Text>
                                
                            </VStack>
                        </HStack>
                    </HStack>
                </TouchableOpacity>
            </ScrollView>
            {
                layer.equipment &&
                <SheetEquipmentMulti isOpen={layer.equipment} onClose={() => setLayer({...layer, equipment: false})} onSelected={onSelectedEquipment}/>
            }
            {
                layer.penyewa &&
                <SheetPenyewa isOpen={layer.penyewa} onClose={() => setLayer({...layer, penyewa: false})} onSelected={onSelectedPenyewa}/>
            }
            {
                layer.lokasi &&
                <SheetLokasiPit isOpen={layer.lokasi} onClose={() => setLayer({...layer, lokasi: false})} onSelected={onSelectedLokasi}/>
            }
            <HStack space={2}>
                <Button flex={1} colorScheme={'coolGray'} onPress={resetFilterHandle}>Reset</Button>
                <Button flex={3} colorScheme={'darkBlue'} onPress={applyFilterHandle}>Terapkan Filter</Button>
            </HStack>
        </VStack>
    )
}

export default FilterReportEquipmentStandByDetails