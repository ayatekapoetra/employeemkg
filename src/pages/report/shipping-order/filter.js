import { TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { HStack, VStack, Text, Button, Modal } from 'native-base'
import { Buildings, CalendarSearch, CalendarTick, CpuSetting, DocumentCode, House2 } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import moment from 'moment'
import SheetPemasok from '../../../components/SheetPemasok'
import { TouchableOpacity } from 'react-native-gesture-handler'
import DatePicker from 'react-native-date-picker'

const FilterShipping = ( { mode, qstring, setQstring, applyFilter, resetFilter } ) => {
    const { user } = useSelector(state => state.auth)
    const [ layer, setLayer ] = useState({pemasok: false, berkas: false, barang: false, startDate: false, endDate: false})

    const toggleLayerHandle = (key) => {
        setLayer({...layer, [key]: !layer[key]})
    }

    const onSelectedPemasok = (obj) => {
        console.log(obj);
        setQstring({
            ...qstring, 
            pemasok_id: obj.id,
            pemasok: {
                id: obj.id,
                nama: obj.nama
            }
        })
        setLayer({...layer, pemasok: false})
    }

    const onSelectedStartDate = (date) => {
        setQstring({
            ...qstring, 
            dateStart: moment(date).format('YYYY-MM-DD')
        })
        setLayer({...layer, startDate: false})
    }

    const onSelectedEndDate = (date) => {
        setQstring({
            ...qstring, 
            dateEnd: moment(date).format('YYYY-MM-DD')
        })
        setLayer({...layer, endDate: false})
    }

    console.log(qstring);
    
    
    return (
        <VStack px={3} flex={1}>
            <VStack flex={1}>
                <HStack p={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                    <Buildings size="32" color={appcolor.ico[mode][2]} />
                    <VStack>
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
                            { user?.nm_bisnis }
                        </Text>
                    </VStack>
                </HStack>
                <TouchableOpacity onPress={() => toggleLayerHandle('pemasok')}>
                    <HStack p={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                        <House2 size="32" color={appcolor.ico[mode][2]} />
                        <VStack>
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
                                { qstring?.pemasok?.nama || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('berkas')}>
                    <HStack p={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                        <DocumentCode size="32" color={appcolor.ico[mode][2]} />
                        <VStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Kode Berkas:
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring?.kode || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('barang')}>
                    <HStack p={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                        <CpuSetting size="32" color={appcolor.ico[mode][2]} />
                        <VStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Nama Barang:
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring?.barang || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('startDate')}>
                    <HStack p={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                        <CalendarSearch size="32" color={appcolor.ico[mode][2]} />
                        <VStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Mulai Tanggal:
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { moment(qstring.dateStart).format('dddd, DD MMMM YYYY') }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLayerHandle('endDate')}>
                    <HStack p={2} space={2} alignItems={'center'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                        <CalendarTick size="32" color={appcolor.ico[mode][2]} />
                        <VStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Hingga Tanggal:
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { moment(qstring.dateEnd).format('dddd, DD MMMM YYYY') }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
            </VStack>
            <HStack space={2}>
                <Button flex={1} colorScheme={'coolGray'} onPress={resetFilter}>Reset</Button>
                <Button flex={3} colorScheme={'darkBlue'} onPress={applyFilter}>Terapkan Filter</Button>
            </HStack>
            {
                layer.pemasok &&
                <SheetPemasok
                    isOpen={layer.pemasok} 
                    bisnis_id={user?.bisnis_id}
                    onClose={() => toggleLayerHandle('pemasok')} 
                    onSelected={onSelectedPemasok}/>
            }
            {
                layer.berkas &&
                <Modal isOpen={layer.berkas} onClose={() => toggleLayerHandle('berkas')}>
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
                                <Button colorScheme={'darkBlue'} onPress={() => toggleLayerHandle('berkas')}>
                                    Okey
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            }
            {
                layer.barang &&
                <Modal isOpen={layer.barang} onClose={() => toggleLayerHandle('barang')}>
                    <Modal.Content maxWidth="400px">
                        <Modal.CloseButton />
                        <Modal.Header>Cari Barang</Modal.Header>
                        <Modal.Body>
                            <TextInput 
                                onChangeText={(teks) => setQstring({...qstring, barang: teks})}
                                style={{backgroundColor: "#ddd", height: 30, paddingHorizontal: 5}}/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button.Group space={2}>
                                <Button colorScheme={'darkBlue'} onPress={() => toggleLayerHandle('barang')}>
                                    Okey
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
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

export default FilterShipping