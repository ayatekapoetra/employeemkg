import { Keyboard, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { HStack, VStack, Text, Button } from 'native-base'
import { ArrowRight2, Barcode, CalendarCircle, CloseSquare, ToggleOffCircle, UserTag } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import SheetStatus from '../../components/SheetStatus'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'

const taskStatus = [
    {id: 1, value: '', nama: 'Semua Status'},
    {id: 2, value: 'active', nama: 'Tugas Baru'},
    {id: 3, value: 'check', nama: 'Tugas Diterima'},
    {id: 4, value: 'done', nama: 'Tugas Selesai'},
    {id: 5, value: 'reject', nama: 'Tugas Ditolak'},
]

const FilterTugasKu = ( { state, setState, resetFilter, applyFilter } ) => {
    const kodeRef = useRef()
    const mode = useSelector(state => state.themes.value)
    const [ layer, setLayer ] = useState({
        status: false,
        startDate: false,
        endDate: false
    })

    const onLayerHandle = (key) => {
        setLayer({...layer, [key]: !layer[key]})
    }

    const onSelectedStatusHandle = (obj) => {
        setState({...state, status: obj.value, stsObject: obj})
        setLayer({...layer, status: false})
    }

    const onPickDatetimeHandle = (date, key) => {
        setState({...state, [key]: moment(date).format('YYYY-MM-DD')})
    }

    return (
        <VStack flex={1}>
            {
                layer.status &&
                <SheetStatus 
                    data={taskStatus} 
                    isOpen={layer.status} 
                    onClose={() => setLayer({...layer, status: !layer.status})}
                    onSelected={onSelectedStatusHandle}/>
            }
            {
                layer.startDate &&
                <DatePicker
                    modal
                    title={'Tanggal Tugas'}
                    mode={"date"}
                    locale={"ID"}
                    open={layer.startDate}
                    date={new Date(moment(state.startDate).format('YYYY-MM-DD'))}
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
                    date={new Date(moment(state.endDate).format('YYYY-MM-DD'))}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onPickDatetimeHandle(date, 'endDate')}
                    onCancel={() => {
                        setLayer({...layer, endDate: false})
                    }}
                />
            }
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <VStack flex={1}>
                    <TouchableOpacity onPress={() => onLayerHandle('status')}>
                        <HStack 
                            p={2} 
                            mb={3}
                            space={2} 
                            borderWidth={.5} 
                            alignItems={'center'} 
                            borderStyle={'dashed'}
                            borderColor={appcolor.line[mode][2]} 
                            rounded={'md'}>
                            <ToggleOffCircle size="32" color={appcolor.teks[mode][1]}/>
                            <HStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                                <VStack>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        Status Tugas :
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontSize={'lg'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Poppins-SemiBold'}
                                        color={appcolor.teks[mode][1]}>
                                        { state.stsObject?.nama||"Semua Status" }
                                    </Text>
                                </VStack>
                                <ArrowRight2 size="15" color={appcolor.teks[mode][2]}/>

                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    
                    <HStack 
                        p={2} 
                        mb={3}
                        space={2} 
                        borderWidth={.5} 
                        alignItems={'center'} 
                        borderStyle={'dashed'}
                        borderColor={appcolor.line[mode][2]} 
                        rounded={'md'}>
                        <UserTag size="32" color={appcolor.teks[mode][1]}/>
                        <HStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                            <VStack flex={1}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][3]}>
                                    Pemberi Tugas :
                                </Text>
                                <TextInput
                                    ref={kodeRef}
                                    placeholder='Ketik nama pemberi tugas...'
                                    placeholderTextColor={appcolor.teks[mode][2]}
                                    value={state.nmassigner||null}
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    onChangeText={(teks) => setState({...state, nmassigner: teks})}
                                    style={{height: 30, fontSize: 18, fontFamily: "Poppins-SemiBold", alignItems: 'center', color: appcolor.teks[mode][1]}}/>
                            </VStack>
                            {
                                state.nmassigner &&
                                <TouchableOpacity onPress={() => setState({...state, nmassigner: ""})}>
                                    <CloseSquare size="25" color={appcolor.teks[mode][5]} variant='Bulk'/>
                                </TouchableOpacity>
                            }
                        </HStack>
                    </HStack>
                    <HStack 
                        p={2} 
                        mb={3}
                        space={2} 
                        borderWidth={.5} 
                        alignItems={'center'} 
                        borderStyle={'dashed'}
                        borderColor={appcolor.line[mode][2]} 
                        rounded={'md'}>
                        <Barcode size="32" color={appcolor.teks[mode][1]}/>
                        <HStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                            <VStack>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][3]}>
                                    Kode Tugas :
                                </Text>
                                <TextInput
                                    placeholder='Ketik kode tugas...'
                                    placeholderTextColor={appcolor.teks[mode][2]}
                                    value={state.kode||null}
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    onChangeText={(teks) => setState({...state, kode: teks})}
                                    style={{height: 30, fontSize: 18, fontFamily: "Poppins-SemiBold", alignItems: 'center', color: appcolor.teks[mode][1]}}/>
                            </VStack>
                            {
                                state.kode &&
                                <TouchableOpacity onPress={() => setState({...state, kode: ""})}>
                                    <CloseSquare size="25" color={appcolor.teks[mode][5]} variant='Bulk'/>
                                </TouchableOpacity>
                            }
                        </HStack>
                    </HStack>
                    <TouchableOpacity onPress={() => onLayerHandle('startDate')}>
                        <HStack 
                            p={2} 
                            mb={3}
                            space={2} 
                            borderWidth={.5} 
                            alignItems={'center'} 
                            borderStyle={'dashed'}
                            borderColor={appcolor.line[mode][2]} 
                            rounded={'md'}>
                            <CalendarCircle size="32" color={appcolor.teks[mode][1]}/>
                            <HStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                                <VStack>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        Mulai Tanggal :
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontSize={'lg'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Poppins-SemiBold'}
                                        color={appcolor.teks[mode][1]}>
                                        { state.startDate ? moment(state.startDate).format('dddd, DD MMMM YYYY'):'???' }
                                    </Text>
                                </VStack>
                                <ArrowRight2 size="15" color={appcolor.teks[mode][2]}/>

                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onLayerHandle('endDate')}>
                        <HStack 
                            p={2} 
                            mb={3}
                            space={2} 
                            borderWidth={.5} 
                            alignItems={'center'} 
                            borderStyle={'dashed'}
                            borderColor={appcolor.line[mode][2]} 
                            rounded={'md'}>
                            <CalendarCircle size="32" color={appcolor.teks[mode][1]}/>
                            <HStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                                <VStack>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][3]}>
                                        Hingga Tanggal :
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontSize={'lg'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Poppins-SemiBold'}
                                        color={appcolor.teks[mode][1]}>
                                        { state.endDate ? moment(state.endDate).format('dddd, DD MMMM YYYY'):'???' }
                                    </Text>
                                </VStack>
                                <ArrowRight2 size="15" color={appcolor.teks[mode][2]}/>

                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                </VStack>
            </TouchableWithoutFeedback>
            <HStack mb={3} space={2}>
                <Button 
                    flex={1} 
                    colorScheme={'blueGray'}
                    onPress={resetFilter}>
                    Reset
                </Button>
                <Button 
                    flex={3} 
                    colorScheme={'darkBlue'}
                    onPress={applyFilter}>
                    Terapkan Filter
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterTugasKu