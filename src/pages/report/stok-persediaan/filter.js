import { FlatList, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Stack, Flex, Button } from 'native-base'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import { CloseCircle, House, House2, Layer, RulerPen } from 'iconsax-react-native'
import SheetGudang from '../../../components/SheetGudang'
import SheetRack from '../../../components/SheetRack'
import SheetBarangMulti from '../../../components/SheetBarangMulti'
import SheetBisnisUnit from '../../../components/SheetBisnisUnit'

const FilterStokPersediaan = ( { onApplyFilter, onResetFilter, qstring, setQstring } ) => {
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ isOpen, setOpen ] = useState({
        bisnis: false,
        gudang: false,
        barang: false,
        rack: false
    })

    // const onSelectedBisnis = (obj) => {
    //     setOpen({...isOpen, gudang: false, rack: false, barang: false, bisnis: false })
    //     setQstring({...qstring, bisnis_id: obj.id, bisnis: obj})
    // }

    const onSelectedGudang = (obj) => {
        setOpen({...isOpen, gudang: false, rack: false, barang: false, bisnis: false })
        setQstring({...qstring, gudang_id: obj.id, gudang: obj})
    }

    const onSelectedRack = (obj) => {
        setOpen({...isOpen, gudang: false, rack: false, barang: false, bisnis: false })
        setQstring({...qstring, rack_id: obj.id, rack: obj})
    }

    const onSelectedBarang = (array) => {
        setOpen({...isOpen, gudang: false, rack: false, barang: false, bisnis: false })
        setQstring({
            ...qstring, 
            barang: array,
            barang_id: array.map( m => m.id)
        })
    }

    const clearRackHandle = () => {
        setQstring({...qstring, rack_id: null, rack: null})
    }

    const clearGudangHandle = () => {
        setQstring({...qstring, gudang_id: null, gudang: null})
    }

    // const clearBisnisHandle = () => {
    //     setQstring({...qstring, bisnis_id: null, bisnis: null})
    // }

    const onDiselectedBarang = (obj) => {
        const result = qstring.barang.filter( f => f.id != obj.id)
        setQstring({
            ...qstring, 
            barang: result,
            barang_id: result.map( m => m.id)
        })
    }
    
    return (
        <VStack px={4} mt={3} flex={1}>
            <VStack flex={1}>
                <HStack mb={3} space={2}>
                    <VStack p={2} borderWidth={1} flex={1} borderColor={appcolor.line[mode][2]} borderStyle={'dashed'} rounded={'md'}>
                        <TouchableOpacity onPress={() => setOpen({...isOpen, gudang: true, barang: false})}>
                            <HStack mb={2} justifyContent={'space-between'} alignItems={'center'}>
                                <HStack flex={1} space={2}>
                                    <House2 size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack>
                                        <Text 
                                            fontSize={16}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            Gudang :
                                        </Text>
                                        <Text 
                                            fontSize={20}
                                            lineHeight={'xs'}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            {qstring?.gudang?.nama || 'Semua Gudang'}
                                        </Text>
                                    </VStack>
                                </HStack>
                                {
                                    qstring?.gudang &&
                                    <TouchableOpacity onPress={clearGudangHandle}>
                                        <CloseCircle size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                    </TouchableOpacity>
                                }
                            </HStack>
                        </TouchableOpacity>
                    </VStack>
                </HStack>
                {
                    isOpen.gudang &&
                    <SheetGudang 
                        isOpen={isOpen.gudang} 
                        onClose={() => setOpen({...isOpen, gudang: false, barang: false})} 
                        onSelected={onSelectedGudang}/>
                }

                <HStack mb={3} space={2}>
                    <VStack p={2} borderWidth={1} flex={1} borderColor={appcolor.line[mode][2]} borderStyle={'dashed'} rounded={'md'}>
                        <TouchableOpacity onPress={() => setOpen({...isOpen, rack: true, gudang: false, barang: false})}>
                            <HStack mb={2} justifyContent={'space-between'} alignItems={'center'}>
                                <HStack flex={1} space={2}>
                                    <Layer size="42" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={16}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            Rack Barang :
                                        </Text>
                                        <Text 
                                            fontSize={20}
                                            lineHeight={'xs'}
                                            fontFamily={'Poppins-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            {qstring?.rack?.nama || 'Semua Rack'}
                                        </Text>
                                        <Text 
                                            fontSize={20}
                                            lineHeight={'xs'}
                                            fontFamily={'Teko-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            {qstring?.rack?.kode}
                                        </Text>
                                    </VStack>
                                </HStack>
                                {
                                    qstring?.rack &&
                                    <TouchableOpacity onPress={clearRackHandle}>
                                        <CloseCircle size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                    </TouchableOpacity>
                                }
                            </HStack>
                        </TouchableOpacity>
                    </VStack>
                </HStack>
                {
                    isOpen.rack &&
                    <SheetRack 
                        gudang={qstring.gudang}
                        isOpen={isOpen.rack} 
                        onClose={() => setOpen({...isOpen, gudang: false, barang: false, rack: false})} 
                        onSelected={onSelectedRack}/>
                }

                <HStack mb={3} space={2}>
                    <VStack p={2} borderWidth={1} flex={1} borderColor={appcolor.line[mode][2]} borderStyle={'dashed'} rounded={'md'}>
                        <TouchableOpacity onPress={() => setOpen({...isOpen, rack: false, gudang: false, barang: true})}>
                            <HStack mb={2} justifyContent={'space-between'} alignItems={'center'}>
                                <HStack flex={1} space={2}>
                                    <RulerPen size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontSize={16}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            Item Barang :
                                        </Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </TouchableOpacity>
                        <HStack space={2} flexWrap={'wrap'}>
                            { qstring?.barang?.map( m => <RenderItemBarang key={m.id} onDiselectedBarang={onDiselectedBarang} mode={mode} item={m}/>) }
                        </HStack>
                    </VStack>
                </HStack>
                {
                    isOpen.barang &&
                    <SheetBarangMulti 
                        isOpen={isOpen.barang} 
                        onClose={() => setOpen({...isOpen, gudang: false, barang: false, rack: false})} 
                        onSelected={onSelectedBarang}/>
                }
                
            </VStack>
            <HStack space={2} justifyContent={'space-between'}>
                <Button w={'1/3'} colorScheme={'coolGray'} onPress={onResetFilter}>Reset</Button>
                <Button flex={1} onPress={onApplyFilter}>Terapkan Filter</Button>
            </HStack>
        </VStack>
    )
}

export default FilterStokPersediaan

const RenderItemBarang = ( { onDiselectedBarang, item, mode } ) => {
    return(
        <TouchableOpacity key={item.id} onPress={() => onDiselectedBarang(item)}>
            <Flex h={'27px'} mb={2} bg={'amber.100'} rounded={'full'} alignItems={'flex-start'} justifyContent={'center'} borderWidth={.5} borderColor={appcolor.teks[mode][5]}>
                <HStack justifyContent={'center'}>
                    <CloseCircle size="25" color={appcolor.teks[mode][5]} variant="Bulk"/>
                    <HStack>
                        <Text 
                            fontSize={16} 
                            maxW={'300px'}
                            flexWrap={'nowrap'}
                            fontFamily={'Abel-Regular'} 
                            fontWeight={'bold'}>
                            {item.nama}
                        </Text>
                    </HStack>
                </HStack>
            </Flex>
        </TouchableOpacity>
    )
}