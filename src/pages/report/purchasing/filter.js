import { TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { HStack, VStack, Text, Button, Modal } from 'native-base'
import { Airpod, Android, Buildings, Calendar, CloseCircle, DocumentText1, ScanBarcode } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import SheetStatus from '../../../components/SheetStatus'
import SheetBarang from '../../../components/SheetBarang'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import SheetPemasok from '../../../components/SheetPemasok'

const typeBerkas = [
    {id: 1, nama: 'Purchasing Request', status: 'PR'},
    {id: 2, nama: 'Purchasing Order', status: 'PO'},
]

const FilterPurchaseMonitoring = ( { qstring, setQstring, applyFilter, resetFilter } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ layer, setLayer ] = useState({berkas: false, kode: false, bisnis: false, barang: false, pemasok: false, startDate: false, endDate: false})

    const toggleLayerHandle = (key) => {
        setLayer({...layer, [key]: !layer[key]})
    }

    const onSelectedBerkas = (obj) => {
        setQstring({...qstring, berkas: obj.status, nm_berkas: obj.nama})
        setLayer({...layer, berkas: false})
    }

    const onSelectedBarang = (obj) => {
        console.log(obj);
        setQstring({...qstring, barang: obj, barang_id: obj.id})
        setLayer({...layer, barang: false})
    }

    const onSelectedPemasok = (obj) => {
        console.log(obj);
        setQstring({...qstring, nm_pemasok: obj.nama, pemasok_id: obj.id})
        setLayer({...layer, pemasok: false})
    }

    const onSelectedStartDate = (date) => {
        setQstring({...qstring, dateStart: moment(date).format('YYYY-MM-DD')})
        setLayer({...layer, startDate: false})
    }

    const onSelectedEndDate = (date) => {
        setQstring({...qstring, dateEnd: moment(date).format('YYYY-MM-DD')})
        setLayer({...layer, endDate: false})
    }

    const removeBarangHandle = () => {
        setQstring({...qstring, barang: null, barang_id: null})
    }

    const removeKodeHandle = () => {
        setQstring({...qstring, kode: ''})
    }

    const removePemasokHandle = () => {
        setQstring({...qstring, pemasok_id: null, nm_pemasok: null})
    }

    return (
        <VStack flex={1} px={3}>
            <VStack flex={1}>
                <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                    <HStack space={1} flex={1}>
                        <Buildings size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Unit Bisnis :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.nm_bisnis || 'Unit Bisnis' }
                            </Text>
                            
                        </VStack>
                    </HStack>
                </HStack>
                <TouchableOpacity onPress={() => toggleLayerHandle('berkas')}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <DocumentText1 size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Type Dokumen :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { qstring?.nm_berkas || 'Semua Type Dokumen' }
                                </Text>
                                
                            </VStack>
                        </HStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('kode')}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <ScanBarcode size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Kode Dokumen :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { qstring?.kode || 'xxxx-xxxxxx' }
                                </Text>
                            </VStack>
                        </HStack>
                        {
                            qstring.kode &&
                            <TouchableOpacity onPress={removeKodeHandle}>
                                <CloseCircle size="22" color={appcolor.teks[mode][5]} variant="Outline"/>
                            </TouchableOpacity>
                        }
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('pemasok')}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <Android size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Pemasok :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { qstring?.nm_pemasok || '???' }
                                </Text>
                            </VStack>
                        </HStack>
                        {
                            qstring.nm_pemasok &&
                            <TouchableOpacity onPress={removePemasokHandle}>
                                <CloseCircle size="22" color={appcolor.teks[mode][5]} variant="Outline"/>
                            </TouchableOpacity>
                        }
                    </HStack>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setLayer({...layer, barang: true})}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <Airpod size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Nama Barang :
                                </Text>
                                {
                                    qstring.barang ?
                                    <VStack>
                                        <Text 
                                            fontSize={14}
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { qstring.barang?.kode }
                                        </Text>
                                        <Text 
                                            fontSize={20}
                                            lineHeight={'xs'}
                                            fontFamily={'Poppins'}
                                            color={appcolor.teks[mode][1]}>
                                            { qstring.barang?.nama }
                                        </Text>
                                        <Text 
                                            fontSize={14}
                                            lineHeight={'xs'}
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { qstring.barang?.num_part }
                                        </Text>
                                    </VStack>
                                    :
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { 'Semua Barang' }
                                    </Text>
                                }
                                
                            </VStack>
                            {
                                qstring.barang &&
                                <TouchableOpacity onPress={removeBarangHandle}>
                                    <CloseCircle size="22" color={appcolor.teks[mode][5]} variant="Outline"/>
                                </TouchableOpacity>
                            }
                        </HStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('startDate')}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <Calendar size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Mulai Tanggal :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(qstring?.dateStart).format('dddd, DD MMMM YYYY') }
                                </Text>
                                
                            </VStack>
                        </HStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('endDate')}>
                    <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <HStack space={1} flex={1}>
                            <Calendar size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                            <VStack flex={1}>
                                <Text 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][2]}>
                                    Hingga Tanggal :
                                </Text>
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { moment(qstring?.dateEnd).format('dddd, DD MMMM YYYY') }
                                </Text>
                                
                            </VStack>
                        </HStack>
                    </HStack>
                </TouchableOpacity>
            </VStack>
            <HStack space={2} w={'full'}>
                <Button flex={1} colorScheme={'coolGray'} onPress={resetFilter}>Reset</Button>
                <Button flex={3} colorScheme={'darkBlue'} onPress={applyFilter}>Terapkan Filter</Button>
            </HStack>
            {
                layer.kode &&
                <Modal isOpen={layer.kode} onClose={() => toggleLayerHandle('kode')}>
                    <Modal.Content maxWidth="400px">
                        <Modal.CloseButton />
                        <Modal.Header>Input Kode Berkas</Modal.Header>
                        <Modal.Body>
                            <TextInput 
                                onChangeText={(teks) => setQstring({...qstring, kode: teks})}
                                style={{backgroundColor: "#ddd", height: 30, paddingHorizontal: 5}}/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button.Group space={2}>
                                <Button colorScheme={'darkBlue'} onPress={() => toggleLayerHandle('kode')}>
                                    Okey
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            }
            {
                layer.berkas &&
                <SheetStatus 
                    data={typeBerkas} 
                    isOpen={layer.berkas} 
                    onClose={() => toggleLayerHandle('berkas')} 
                    onSelected={onSelectedBerkas}/>
            }
            {
                layer.pemasok &&
                <SheetPemasok
                    isOpen={layer.pemasok} 
                    bisnis_id={qstring.bisnis_id}
                    onClose={() => toggleLayerHandle('pemasok')} 
                    onSelected={onSelectedPemasok}/>
            }
            {
                layer.barang &&
                <SheetBarang
                    isOpen={layer.barang} 
                    bisnis_id={qstring.bisnis_id}
                    onClose={() => toggleLayerHandle('barang')} 
                    onSelected={onSelectedBarang}/>
            }
            {
                layer.startDate &&
                <DatePicker
                    modal
                    title={'Pilih Tanggal Mulai'}
                    mode={"date"}
                    locale={"ID"}
                    open={layer.startDate}
                    date={new Date(qstring.dateStart)}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onSelectedStartDate(date)}
                    onCancel={() => {
                        setLayer({...layer, dateStart: false})
                    }}
                />
            }
            {
                layer.endDate &&
                <DatePicker
                    modal
                    title={'Pilih Tanggal Mulai'}
                    mode={"date"}
                    locale={"ID"}
                    open={layer.endDate}
                    date={new Date(qstring.dateEnd)}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onSelectedEndDate(date)}
                    onCancel={() => {
                        setLayer({...layer, endDate: false})
                    }}
                />
            }
        </VStack>
    )
}

export default FilterPurchaseMonitoring