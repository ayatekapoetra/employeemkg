import { FlatList, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Stack, Flex, Button } from 'native-base'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import { Car, CloseCircle, StatusUp } from 'iconsax-react-native'
import SheetEquipmentMulti from '../../../components/SheetEquipmentMulti'
import SheetStatus from '../../../components/SheetStatus'

const dataStatus = [
    { id: 'a', status: '0', nama: 'menunggu teknisi', selected: false },
    { id: 'b', status: '1', nama: 'menunggu part', selected: false },
    { id: 'c', status: '2', nama: 'proses services', selected: false },
    { id: 'd', status: '9', nama: 'selesai pengerjaan', selected: false },
]

const FilterEquipmentServices = ( { onApplyFilter, onResetFilter, qstring, setQstring } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ openEquipment, setOpenEquipment ] = useState(false)
    const [ openStatus, setOpenStatus ] = useState(false)
    const [ dataFilter, setDataFilter ] = useState({
        equipment: [],
        status: null
    })

    const onSelectedEquipment = (array) => {
        console.log(array);

        setDataFilter({...dataFilter, equipment: array})

        setQstring({
            ...qstring, 
            status: dataFilter.status?.status,
            equipment_id: array?.map( m => m.id)
        })
    }

    const onDiselectedEquipment = (obj) => {
        const result = dataFilter.equipment.filter( f => f.id != obj.id)
        setDataFilter({...dataFilter, equipment: result})
        setQstring({
            ...qstring, 
            equipment_id: result.map( m => m.id)
        })
    }

    const onSelectedStatus = (obj) => {
        setDataFilter({...dataFilter, status: obj})
        setQstring({
            ...qstring, 
            status: obj.status
        })
        setOpenStatus(!openStatus)
    }

    const onCloseStatus = () => {
        setDataFilter({...dataFilter, status: null})
        setQstring({
            ...qstring, 
            status: null
        })
        setOpenStatus(!openStatus)
    }
    
    return (
        <VStack px={4} mt={3} flex={1}>
            <VStack flex={1}>
                <HStack mb={3} space={2}>
                    <VStack p={2} borderWidth={1} flex={1} borderColor={appcolor.line[mode][2]} borderStyle={'dashed'} rounded={'md'}>
                        <TouchableOpacity onPress={() => setOpenEquipment(!openEquipment)}>
                            <HStack mb={2} space={2}>
                                <Car size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Equipment Unit :
                                </Text>
                            </HStack>
                            {
                                !dataFilter.equipment.length > 0 &&
                                <VStack mb={2}>
                                    <Text ml={7} fontFamily={'Abel-Regular'} fontSize={20} color={appcolor.teks[mode][2]}>
                                        Pilih Equipment....
                                    </Text>
                                </VStack>
                            }
                        </TouchableOpacity>
                        {
                            openEquipment && 
                            <SheetEquipmentMulti 
                                isOpen={openEquipment} 
                                onClose={() => setOpenEquipment(!openEquipment)} 
                                onSelected={onSelectedEquipment}/>
                        }
                        <HStack space={2} flexWrap={'wrap'}>
                            { dataFilter.equipment?.map((m, i) => <RenderItemEquipment key={i} onDiselectedEquipment={onDiselectedEquipment} mode={mode} item={m}/>) }
                        </HStack>
                    </VStack>
                </HStack>
                <HStack mb={3} space={2}>
                    <VStack p={2} borderWidth={1} flex={1} borderColor={appcolor.line[mode][2]} borderStyle={'dashed'} rounded={'md'}>
                        <TouchableOpacity onPress={onCloseStatus}>
                            <HStack space={2}>
                                <StatusUp size="20" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Poppins-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Status :
                                </Text>
                            </HStack>
                            <VStack mb={2}>
                                {
                                    !dataFilter.status ?
                                    <Text ml={7} fontFamily={'Abel-Regular'} fontSize={20} color={appcolor.teks[mode][2]}>
                                        Pilih Status....
                                    </Text>
                                    :
                                    <Text ml={7} fontFamily={'Poppins-Regular'} fontWeight={'semibold'} fontSize={20} color={appcolor.teks[mode][2]}>
                                        {dataFilter.status?.nama}
                                    </Text>
                                }
                            </VStack>
                        </TouchableOpacity>
                        <SheetStatus data={dataStatus} isOpen={openStatus} onClose={onCloseStatus} onSelected={onSelectedStatus}/>
                    </VStack>
                </HStack>
            </VStack>
            <HStack space={2} justifyContent={'space-between'}>
                <Button w={'1/3'} colorScheme={'coolGray'} onPress={onResetFilter}>Reset</Button>
                <Button flex={1} onPress={onApplyFilter}>Terapkan Filter</Button>
            </HStack>
        </VStack>
    )
}

export default FilterEquipmentServices

const RenderItemEquipment = ( { onDiselectedEquipment, item, mode } ) => {
    return(
        <TouchableOpacity key={item.id} onPress={() => onDiselectedEquipment(item)}>
            <Flex h={'27px'} mb={2} bg={'amber.100'} rounded={'full'} alignItems={'center'} borderWidth={.5} borderColor={appcolor.teks[mode][5]}>
                <HStack alignItems={'flex-start'} justifyContent={'center'}>
                    <CloseCircle size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                    <Text mr={2} fontSize={16} fontFamily={'Poppins'} fontWeight={'bold'}>{item.kode}</Text>
                </HStack>
            </Flex>
        </TouchableOpacity>
    )
}