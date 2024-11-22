import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Button, HStack, VStack, Text } from 'native-base'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { 
    ArrowRight2, 
    Barcode, 
    CalendarSearch, 
    CopySuccess, 
    NotificationStatus, 
    TagUser 
} from 'iconsax-react-native'
import SheetStatus from '../../components/SheetStatus'
import SheetKaryawan from '../../components/SheetKaryawan'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import SheetInputKode from '../../components/SheetInputKode'

const taskType = [
    {id: 1, value: '', nama: 'Semua Type'},
    {id: 2, value: 'karyawan', nama: 'Penugasan Karyawan'},
    {id: 3, value: 'equipment', nama: 'Penugasan Equipment'},
]

const taskStatus = [
    {id: 1, value: '', nama: 'Semua Status'},
    {id: 2, value: ['active'], nama: 'Tugas Baru'},
    {id: 3, value: ['check'], nama: 'Tugas Diterima'},
    {id: 4, value: ['done'], nama: 'Tugas Selesai'},
    {id: 5, value: ['reject'], nama: 'Tugas Ditolak'},
]

const FilterPenugasan = ( { dataFilter, setDataFilter, onResetFilter, onApplyFilter } ) => {
    const mode = useSelector(state => state.themes.value)
    const [layer, setLayer] = useState({
        type: false,
        kode: false,
        karyawan: false,
        status: false,
        startDate: false,
        endDate: false,
    })

    const onSubmitKode = (teks) => {
        setDataFilter({...dataFilter, kode: teks})
        setLayer({...layer, kode: !layer.kode})
    }

    const onSelectedType = (obj) => {
        console.log(obj);
        setDataFilter({...dataFilter, type: obj.value})
        setLayer({...layer, type: !layer.type})
    }

    const onSelectedStatus = (obj) => {
        console.log(obj);
        setDataFilter({...dataFilter, status: obj.value, statusObj: obj})
        setLayer({...layer, status: !layer.status})
    }

    const onSelectedKaryawan = (obj) => {
        console.log(obj);
        setDataFilter({...dataFilter, karyawan: obj, assigned_id: obj.id})
        setLayer({...layer, karyawan: !layer.karyawan})
    }

    const onPickDatetimeHandle = (value, key) => {
        setDataFilter({...dataFilter, [key]: value})
        setLayer({...layer, [key]: !layer[key]})
    }

    return (
        <VStack px={3} flex={1}>
            {
                layer.kode &&
                <SheetInputKode 
                    isOpen={layer.kode} 
                    onClose={() => setLayer({...layer, kode: !layer.kode})}
                    onSelected={onSubmitKode}/>
            }
            {
                layer.type &&
                <SheetStatus 
                    data={taskType} 
                    isOpen={layer.type} 
                    onClose={() => setLayer({...layer, type: !layer.type})}
                    onSelected={onSelectedType}/>
            }
            {
                layer.status &&
                <SheetStatus 
                    data={taskStatus} 
                    isOpen={layer.status} 
                    onClose={() => setLayer({...layer, status: !layer.status})}
                    onSelected={onSelectedStatus}/>
            }
            {
                layer.karyawan &&
                <SheetKaryawan 
                    isoperator={dataFilter.type == 'equipment'} 
                    isOpen={layer.karyawan}
                    onClose={() => setLayer({...layer, karyawan: !layer.karyawan})} 
                    onSelected={onSelectedKaryawan}/>
            }
            {
                layer.startDate &&
                <DatePicker
                    modal
                    title={'Tanggal Tugas'}
                    mode={"date"}
                    locale={"ID"}
                    open={layer.startDate}
                    date={new Date()}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onPickDatetimeHandle(date, 'startDate')}
                    onCancel={() => {
                        setLayer({...layer, startDate: false})
                    }}
                />
            }
            {
                layer.endDate &&
                <DatePicker
                    modal
                    title={'Tanggal Tugas'}
                    mode={"date"}
                    locale={"ID"}
                    open={layer.endDate}
                    date={new Date()}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onPickDatetimeHandle(date, 'endDate')}
                    onCancel={() => {
                        setLayer({...layer, endDate: false})
                    }}
                />
            }
            <VStack flex={1}>
                <TouchableOpacity onPress={() => setLayer({...layer, type: !layer.type})}>
                    <HStack 
                        p={2} 
                        mb={2}
                        borderWidth={1} 
                        borderColor={appcolor.line[mode][1]} 
                        borderStyle={'dashed'} 
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        rounded={'md'}>
                        <HStack space={2} alignItems={'center'}>
                            <CopySuccess size="32" color={appcolor.teks[mode][2]} variant="Outline" />
                            <VStack>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                    Type Penugasan :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins-Regular'}>
                                    { dataFilter.type || 'Semua' }
                                </Text>
                            </VStack>
                        </HStack>
                        <ArrowRight2 size="16" color={appcolor.teks[mode][2]} variant="Outline" />
                    </HStack>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setLayer({...layer, kode: !layer.kode})}>
                    <HStack 
                        p={2} 
                        mb={2}
                        borderWidth={1} 
                        borderColor={appcolor.line[mode][1]} 
                        borderStyle={'dashed'} 
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        rounded={'md'}>
                        <HStack space={2} alignItems={'center'}>
                            <Barcode size="32" color={appcolor.teks[mode][2]} variant="Outline" />
                            <VStack>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                    Kode Penugasan :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins-Regular'}>
                                    { dataFilter.kode || '--' }
                                </Text>
                            </VStack>
                        </HStack>
                        <ArrowRight2 size="16" color={appcolor.teks[mode][2]} variant="Outline" />
                    </HStack>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setLayer({...layer, karyawan: !layer.karyawan})}>
                    <HStack 
                        p={2} 
                        mb={2}
                        borderWidth={1} 
                        borderColor={appcolor.line[mode][1]} 
                        borderStyle={'dashed'} 
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        rounded={'md'}>
                        <HStack w={'5/6'} space={2} alignItems={'center'}>
                            <TagUser size="32" color={appcolor.teks[mode][2]} variant="Outline" />
                            <VStack flex={1}>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                    Penugasan Ke :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins-Regular'}>
                                    { dataFilter.karyawan?.nama || '???' }
                                </Text>
                            </VStack>
                        </HStack>
                        <ArrowRight2 size="16" color={appcolor.teks[mode][2]} variant="Outline" />
                    </HStack>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setLayer({...layer, status: !layer.status})}>
                    <HStack 
                        p={2} 
                        mb={2}
                        borderWidth={1} 
                        borderColor={appcolor.line[mode][1]} 
                        borderStyle={'dashed'} 
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        rounded={'md'}>
                        <HStack space={2} alignItems={'center'}>
                            <NotificationStatus size="32" color={appcolor.teks[mode][2]} variant="Outline" />
                            <VStack>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                    Status :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins-Regular'}>
                                    { dataFilter.statusObj?.nama || 'Semua Status' }
                                </Text>
                            </VStack>
                        </HStack>
                        <ArrowRight2 size="16" color={appcolor.teks[mode][2]} variant="Outline" />
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setLayer({...layer, startDate: !layer.startDate})}>
                    <HStack 
                        p={2} 
                        mb={2}
                        borderWidth={1} 
                        borderColor={appcolor.line[mode][1]} 
                        borderStyle={'dashed'} 
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        rounded={'md'}>
                        <HStack space={2} alignItems={'center'}>
                            <CalendarSearch size="32" color={appcolor.teks[mode][2]} variant="Outline" />
                            <VStack>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                    Mulai Tanggal :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins-Regular'}>
                                    { dataFilter.startDate ? moment(dataFilter.startDate).format('dddd, DD MMMM YYYY') : moment().format('dddd, DD MMMM YYYY') }
                                </Text>
                            </VStack>
                        </HStack>
                        <ArrowRight2 size="16" color={appcolor.teks[mode][2]} variant="Outline" />
                    </HStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setLayer({...layer, endDate: !layer.endDate})}>
                    <HStack 
                        p={2} 
                        mb={2}
                        borderWidth={1} 
                        borderColor={appcolor.line[mode][1]} 
                        borderStyle={'dashed'} 
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        rounded={'md'}>
                        <HStack space={2} alignItems={'center'}>
                            <CalendarSearch size="32" color={appcolor.teks[mode][2]} variant="Outline" />
                            <VStack>
                                <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][3]}>
                                    Hingga Tanggal :
                                </Text>
                                <Text 
                                    fontSize={'lg'}
                                    lineHeight={'xs'}
                                    color={appcolor.teks[mode][1]}
                                    fontFamily={'Poppins-Regular'}>
                                    { dataFilter.endDate ? moment(dataFilter.endDate).format('dddd, DD MMMM YYYY') : moment().format('dddd, DD MMMM YYYY') }
                                </Text>
                            </VStack>
                        </HStack>
                        <ArrowRight2 size="16" color={appcolor.teks[mode][2]} variant="Outline" />
                    </HStack>
                </TouchableOpacity>
            </VStack>
            <HStack space={2}>
                <Button 
                    flex={1} 
                    onPress={onResetFilter}
                    colorScheme={'coolGray'}>
                    Reset
                </Button>
                <Button 
                    flex={3} 
                    onPress={onApplyFilter}
                    colorScheme={'darkBlue'}>
                    Terapkan Filter
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterPenugasan