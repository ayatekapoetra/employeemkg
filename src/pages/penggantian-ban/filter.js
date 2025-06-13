import React, { useState } from 'react'
import { 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Keyboard
} from 'react-native'
import { 
    HStack, 
    VStack, 
    Text, 
    Button
} from 'native-base'
import { 
    ArrangeHorizontalSquare, 
    Award, 
    Barcode, 
    Calendar1, 
    ChartCircle, 
    Danger, 
    Signpost, 
    TruckRemove 
} from 'iconsax-react-native'
import { useSelector } from 'react-redux'
import moment from 'moment'
import appcolor from '../../common/colorMode'
import DatePicker from 'react-native-date-picker'

import SheetLokasiPit from '../../components/SheetLokasiPit'
import SheetEquipment from '../../components/SheetEquipment'
import SheetOption from '../../components/SheetOption'

const FilterTireUsages = ( { qstring, setQstring, showFilter, resetFilter } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)

    const [ openPicker, setOpenPicker ] = useState({
        media: false,
        equipment: false,
        lokasi: false,
        equipment: false,
        shift: false,
        brand: false,
        type: false,
        kategori: false,
        status: false,
        tanggal: false,
    })

    const visibleDateOption = (field) => {
        if(field === 'startDate'){
            setOpenDateStart(!openDateStart)
        }else{
            setOpenDateEnd(!openDateEnd)
        }
    }

    const onCloseEquipment = () => {
        setOpenPicker({...openPicker, equipment: false})
    }

    const onSelectedEquipment = (obj) => {
        Keyboard.dismiss();
        setQstring({...qstring, equipment_id: obj.id, equipment: obj})
        setOpenPicker({...openPicker, equipment: false})
    }

    const onCloseLokasi = () => {
        setOpenPicker({...openPicker, lokasi: false})
    }

    const onSelectedLokasi = (obj) => {
        Keyboard.dismiss();
        setQstring({...qstring, lokasi_id: obj.id, lokasi: obj})
        setOpenPicker({...openPicker, lokasi: false})
    }

    const onCloseBrand = () => {
        setOpenPicker({...openPicker, brand: false})
    }

    const onSelectedBrand = (obj) => {
        Keyboard.dismiss();
        setQstring({...qstring, nmbrand: obj.nilai})
        setOpenPicker({...openPicker, brand: false})
    }

    const onCloseType = () => {
        setOpenPicker({...openPicker, type: false})
    }

    const onSelectedType = (obj) => {
        Keyboard.dismiss();
        setQstring({...qstring, type: obj.nilai})
        setOpenPicker({...openPicker, type: false})
    }

    const onCloseKategori = () => {
        setOpenPicker({...openPicker, kategori: false})
    }

    const onSelectedKategori = (obj) => {
        Keyboard.dismiss();
        setQstring({...qstring, kategori: obj.nilai})
        setOpenPicker({...openPicker, kategori: false})
    }

    const onCloseStatus = () => {
        setOpenPicker({...openPicker, kategori: false})
    }

    const onSelectedStatus = (obj) => {
        Keyboard.dismiss();
        setQstring({...qstring, status: obj.nilai})
        setOpenPicker({...openPicker, status: false})
    }

    return (
        <VStack flex={1} px={3}>
            {
                openDateStart &&
                <DatePicker
                    modal
                    mode={"date"}
                    locale={"ID"}
                    open={openDateStart}
                    date={new Date(qstring.dateStart)}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => setQstring({...qstring, dateStart: moment(date).format('YYYY-MM-DD')})}
                    onCancel={() => {
                        setOpenDateStart(false)
                    }}
                />
            }
            {
                openDateEnd &&
                <DatePicker
                    modal
                    mode={"date"}
                    locale={"ID"}
                    open={openDateEnd}
                    date={new Date(qstring.dateEnd)}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => setQstring({...qstring, dateEnd: moment(date).format('YYYY-MM-DD')})}
                    onCancel={() => {
                        setOpenDateEnd(false)
                    }}
                />
            }
            {
                openPicker.equipment &&
                <SheetEquipment 
                    clueKey={['dumptruck', 'lighttruck', 'lightvehicle', 'motorgrader', 'loader']}
                    isOpen={openPicker.equipment} 
                    onClose={onCloseEquipment} 
                    onSelected={onSelectedEquipment}/>
            }
            {
                openPicker.lokasi && 
                <SheetLokasiPit 
                    isOpen={openPicker.lokasi} 
                    onClose={onCloseLokasi} 
                    onSelected={onSelectedLokasi}/>
            }
            {
                openPicker.brand &&
                <SheetOption 
                    optgroup={"tire-merk"}
                    isOpen={openPicker.brand} 
                    onClose={onCloseBrand} 
                    onSelected={onSelectedBrand}/>
            }
            {
                openPicker.type &&
                <SheetOption 
                    optgroup={"tire-type"}
                    isOpen={openPicker.type} 
                    onClose={onCloseType} 
                    onSelected={onSelectedType}/>
            }
            {
                openPicker.kategori &&
                <SheetOption 
                    optgroup={"tire-demage"}
                    isOpen={openPicker.kategori} 
                    onClose={onCloseKategori} 
                    onSelected={onSelectedKategori}/>
            }
            {
                openPicker.status &&
                <SheetOption 
                    optgroup={"tire-status"}
                    isOpen={openPicker.status} 
                    onClose={onCloseStatus} 
                    onSelected={onSelectedStatus}/>
            }
            <ScrollView>
                <TouchableOpacity onPress={() => visibleDateOption('startDate')}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Calendar1 size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
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
                </TouchableOpacity>

                <TouchableOpacity onPress={() => visibleDateOption('endDate')}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Calendar1 size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
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
                                { moment(qstring.finishDate).format('dddd, DD MMMM YYYY') }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, equipment: !openPicker.equipment})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <TruckRemove size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Equipment :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.equipment?.kode || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, lokasi: !openPicker.lokasi})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Signpost size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
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
                                { qstring.lokasi?.nama || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, brand: !openPicker.brand})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Award size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Nama Brand/Merk :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.nmbrand || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, type: !openPicker.type})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Barcode size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Nomor Seri :
                            </Text>
                            <TextInput
                                placeholder='???'
                                placeholderTextColor={appcolor.teks[mode][1]}
                                onChangeText={(teks) => setQstring({...qstring, noseri: teks})}
                                value={qstring.noseri || ''}
                                style={{
                                    color: appcolor.teks[mode][1],
                                    fontFamily: 'Quicksand-Bold',
                                    fontSize: 18,
                                }}/>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, type: !openPicker.type})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <ChartCircle size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Type :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.type || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, kategori: !openPicker.kategori})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Danger size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Kategori :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.kategori || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setOpenPicker({...openPicker, status: !openPicker.status})}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <ArrangeHorizontalSquare size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Status :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.status || '???' }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
            </ScrollView>
            <HStack px={3} space={2}>
                <Button flex={1} colorScheme={'gray'} onPress={resetFilter}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Reset</Text>
                </Button>
                <Button flex={3} colorScheme={'info'} onPress={showFilter}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Terapkan</Text>
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterTireUsages