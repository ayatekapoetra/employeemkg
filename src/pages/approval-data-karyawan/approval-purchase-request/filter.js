import { TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { VStack, Text, Button, HStack } from 'native-base'
import { ArchiveBook, Bank, Calendar1, ColorSwatch, Scan } from 'iconsax-react-native'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'
import SheetBisnisUnit from '../../../components/SheetBisnisUnit'
import SheetStatus from '../../../components/SheetStatus'

const dataStatus = [
    {id: 1, nama: 'Permintaan Baru', status: ['active']},
    {id: 2, nama: 'Menunggu Approval', status: ['approved']},
    {id: 3, nama: 'Purchase Selesai', status: ['finish']},
    {id: 4, nama: 'Draft', status: ['draft']},
    {id: 5, nama: 'Semua Status', status: ['active', 'approved', 'finish', 'draft']}
]

const FilterPurchaseRequest = ( { applyFilter, resetFilter, qstring, setQstring } ) => {
    const reffKode = useRef(null)
    const mode = useSelector(state => state.themes.value)
    const { user } = useSelector(state => state.auth)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateEnd, setOpenDateEnd ] = useState(false)
    const [ openBisnis, setOpenBisnis ] = useState(false)
    const [ openStatus, setOpenStatus ] = useState(false)
    const [ openKode, setOpenKode ] = useState(false)

    const visibleDateOption = (field) => {
        if(field === 'startDate'){
            setOpenDateStart(!openDateStart)
        }else{
            setOpenDateEnd(!openDateEnd)
        }
    }

    const onSelectBisnis = (obj) => {
        setQstring({...qstring, bisnis: obj, bisnis_id: obj.id})
        setOpenBisnis(false)
    }

    const onSelectStatusHandle = (val) => {
        console.log(val);
        setQstring({...qstring, status: val.status, nm_status: val.nama})
        setOpenStatus(false)
    }

    const inputKodeHandle = () => {
        if(openKode){
            reffKode.current?.focus();
        }else{
            reffKode.current?.blur();
        }
        setOpenKode(!openKode)
    }

    return (
        <VStack flex={1}>
            <VStack flex={1}>
                <TouchableOpacity onPress={() => setOpenBisnis(!openBisnis)}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Bank size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Unit Bisnis :
                            </Text>
                            <Text 
                                fontSize={16}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.bisnis?.name || user.nm_bisnis }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
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
                                { moment(qstring.beginDate).format('dddd, DD MMMM YYYY') }
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
                <TouchableOpacity onPress={() => setOpenStatus(!openStatus)}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <ColorSwatch size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Status Purchase Request :
                            </Text>
                            <Text 
                                fontSize={20}
                                lineHeight={'xs'}
                                fontFamily={'Poppins'}
                                color={appcolor.teks[mode][1]}>
                                { qstring.nm_status }
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
                {
                    openStatus &&
                    <SheetStatus data={dataStatus} isOpen={openStatus} onClose={() => setOpenStatus(!openStatus)} onSelected={onSelectStatusHandle}/>
                }
                <TouchableOpacity onPress={inputKodeHandle}>
                    <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                        <Scan size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <VStack flex={1}>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Kode Purchase Request :
                            </Text>
                            {
                                openKode ?
                                <Text 
                                    fontSize={20}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins'}
                                    color={appcolor.teks[mode][1]}>
                                    { qstring.kode || '? ? ? ?' }
                                </Text>
                                :
                                <TextInput 
                                    reff={reffKode}
                                    value={qstring.kode}
                                    onChangeText={(teks) => setQstring({...qstring, kode: teks})}
                                    style={{flex: 1, color: appcolor.teks[mode][1]}}/>
                            }
                        </VStack>
                    </HStack>
                </TouchableOpacity>
                <HStack p={2} mb={3} space={1} rounded={'md'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                    <ArchiveBook size="42" color={appcolor.ico[mode][2]} variant="Bulk"/>
                    <VStack flex={1}>
                        <Text 
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            Narasi :
                        </Text>
                        <TextInput 
                            value={qstring.narasi || ''}
                            onChangeText={(teks) => setQstring({...qstring, narasi: teks})}
                            style={{flex: 1, color: appcolor.teks[mode][1]}}/>
                    </VStack>
                </HStack>
            </VStack>
            { openBisnis && <SheetBisnisUnit isOpen={openBisnis} onClose={() => setOpenBisnis(!openBisnis)} onSelected={onSelectBisnis}/> }
            <DatePicker
                modal
                mode={"date"}
                locale={"ID"}
                open={openDateStart}
                date={new Date(qstring.beginDate)}
                theme={mode != "dark"?"light":"dark"}
                onConfirm={(date) => setQstring({...qstring, beginDate: date})}
                onCancel={() => {
                    setOpenDateStart(false)
                }}
            />
            <DatePicker
                modal
                mode={"date"}
                locale={"ID"}
                open={openDateEnd}
                date={new Date(qstring.finishDate)}
                theme={mode != "dark"?"light":"dark"}
                onConfirm={(date) => setQstring({...qstring, finishDate: date})}
                onCancel={() => {
                    setOpenDateEnd(false)
                }}
            />
            <HStack space={2}>
                <Button w={'1/3'} colorScheme={'coolGray'} onPress={resetFilter}>Reset</Button>
                <Button flex={1} onPress={applyFilter}>Apply Filter</Button>
            </HStack>
        </VStack>
    )
}

export default FilterPurchaseRequest