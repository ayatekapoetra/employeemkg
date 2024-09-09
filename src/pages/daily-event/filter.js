import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, ScrollView, Flex, Button } from 'native-base'
import { useSelector } from 'react-redux'
import { Calendar1, CalendarTick, CloseSquare, CloudSnow, CloudSunny, ColorSwatch, PenClose, TruckTime } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import moment from 'moment'
import SheetDatePicker from '../../components/SheetDatePicker'
import DatePicker from 'react-native-date-picker'
import SheetEvent from '../../components/SheetEvent'
import SheetEquipmentMulti from '../../components/SheetEquipmentMulti'
import SheetStatus from '../../components/SheetStatus'

const formatDate = 'YYYY-MM-DD HH:mm'
const dataStatus = [
    {id: 1, nama: 'StandBy', status: 0},
    {id: 2, nama: 'Working', status: 1},
    {id: 5, nama: 'Semua Status', status: null},
]

const FilterDailyEvent = ( { qstring, setQstring, onApplyFilter, onResetFilter } ) => {
    const mode = useSelector(state => state.themes.value)
    const [ layer, setLayer ] = useState({
        mulaiStart: false,
        hinggaStart: false,
        mulaiFinish: false,
        hinggaFinish: false,
        status: false,
        event: false,
        equipment: false,
    })

    const onCloseEvent = () => {
        setLayer({...layer, event: false})
    }

    const onSelectedEvent = (obj) => {
        setQstring({...qstring, event: obj})
        setLayer({...layer, event: false})
    }

    const onSelectedEquipment = (array) => {
        console.log(array);
        setQstring({...qstring, equipments: array})
    }
    const onDeselectedEquipment = (obj) => {
        setQstring({...qstring, equipments: qstring.equipments.filter( f => f.id != obj.id)})
    }

    const onSelectStatusHandle = (val) => {
        setQstring({...qstring, status: val.status, nm_status: val.nama})
        setLayer({...layer, status: false})
    }

    // const objKeys = Object.keys(layer)
    // console.log(layer);

    

    return (
        <VStack flex={1} px={3}>
            <VStack flex={1}>
                <ScrollView>
                    <TouchableOpacity onPress={() => setLayer({...layer, status: true})}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <ColorSwatch size="52" color={appcolor.teks[mode][6]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Status Event :
                                    </Text>
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { qstring.nm_status || 'Semua Status' }
                                    </Text>
                                    
                                </VStack>
                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayer({...layer, mulaiStart: !layer.mulaiStart })}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <Calendar1 size="52" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Mulai Waktu Start Event :
                                    </Text>
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { 
                                            qstring.beginStartEvent ? moment(qstring.beginStartEvent).format('HH:mm [wita]') 
                                            :
                                            "??:??"
                                        }
                                    </Text>
                                    {
                                        qstring.beginStartEvent &&
                                        <Text 
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(qstring.beginStartEvent).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayer({...layer, hinggaStart: !layer.hinggaStart })}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <Calendar1 size="52" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Hingga Waktu Start Event :
                                    </Text>
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { 
                                            qstring.endStartEvent ? moment(qstring.endStartEvent).format('HH:mm [wita]') 
                                            :
                                            "??:??"
                                        }
                                    </Text>
                                    {
                                        qstring.endStartEvent &&
                                        <Text 
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(qstring.endStartEvent).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayer({...layer, mulaiFinish: !layer.mulaiFinish })}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <CalendarTick size="52" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Mulai Waktu Finish Event :
                                    </Text>
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { 
                                            qstring.beginFinishEvent ? moment(qstring.beginFinishEvent).format('HH:mm [wita]') 
                                            :
                                            "??:??"
                                        }
                                    </Text>
                                    {
                                        qstring.beginFinishEvent &&
                                        <Text 
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(qstring.beginFinishEvent).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayer({...layer, hinggaFinish: !layer.hinggaFinish })}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <CalendarTick size="52" color={appcolor.teks[mode][3]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Hingga Waktu Finish Event :
                                    </Text>
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { 
                                            qstring.endFinishEvent ? moment(qstring.endFinishEvent).format('HH:mm [wita]') 
                                            :
                                            "??:??"
                                        }
                                    </Text>
                                    {
                                        qstring.endFinishEvent &&
                                        <Text 
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand'}
                                            color={appcolor.teks[mode][1]}>
                                            { moment(qstring.endFinishEvent).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    }
                                </VStack>
                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayer({...layer, event: true})}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <CloudSunny size="52" color={appcolor.teks[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Nama Event :
                                    </Text>
                                    <Text 
                                        fontSize={20}
                                        lineHeight={'xs'}
                                        fontFamily={'Poppins'}
                                        color={appcolor.teks[mode][1]}>
                                        { qstring.event?.nama || '???' }
                                    </Text>
                                </VStack>
                            </HStack>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayer({...layer, equipment: true})}>
                        <HStack p={2} mb={3} rounded={'md'} alignItems={'center'} justifyContent={'space-between'} borderWidth={.5} borderColor={appcolor.line[mode][1]}>
                            <HStack flex={1}>
                                <TruckTime size="52" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Equipment Terdampak :
                                    </Text>
                                    <Flex flexWrap={'wrap'} direction='row'>
                                        {
                                            qstring.equipments.map( m => {
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
                </ScrollView>
                {
                    layer.status &&
                    <SheetStatus data={dataStatus} isOpen={layer.status} onClose={() => setLayer({...layer, status: false})} onSelected={onSelectStatusHandle}/>
                }
                {
                    layer.mulaiStart &&
                    <DatePicker
                        modal
                        mode={'datetime'}
                        locale={"ID"}
                        open={layer.mulaiStart}
                        date={new Date()}
                        title={'Waktu Mulai Kejadian'}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setQstring({...qstring, beginStartEvent: moment(date).format(formatDate) })}
                        onCancel={() => setLayer({...layer, mulaiStart: false})}
                    />
                }
                {
                    layer.hinggaStart &&
                    <DatePicker
                        modal
                        mode={'datetime'}
                        locale={"ID"}
                        open={layer.hinggaStart}
                        date={new Date()}
                        title={'Hingga Mulai Kejadian'}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setQstring({...qstring, endStartEvent: moment(date).format(formatDate) })}
                        onCancel={() => setLayer({...layer, hinggaStart: false})}
                    />
                }
                {
                    layer.mulaiFinish &&
                    <DatePicker
                        modal
                        mode={'datetime'}
                        locale={"ID"}
                        open={layer.mulaiFinish}
                        date={new Date()}
                        title={'Hingga Mulai Kejadian'}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setQstring({...qstring, beginFinishEvent: moment(date).format(formatDate) })}
                        onCancel={() => setLayer({...layer, mulaiFinish: false})}
                    />
                }
                {
                    layer.hinggaFinish &&
                    <DatePicker
                        modal
                        mode={'datetime'}
                        locale={"ID"}
                        open={layer.hinggaFinish}
                        date={new Date()}
                        title={'Hingga Mulai Kejadian'}
                        theme={mode != "dark"?"light":"dark"}
                        onConfirm={(date) => setQstring({...qstring, endFinishEvent: moment(date).format(formatDate) })}
                        onCancel={() => setLayer({...layer, hinggaFinish: false})}
                    />
                }
                {
                    layer.event && 
                    <SheetEvent isOpen={layer.event} onClose={onCloseEvent} onSelected={onSelectedEvent}/>
                }
                {
                    layer.equipment &&
                    <SheetEquipmentMulti isOpen={layer.equipment} onClose={() => setLayer({...layer, equipment: false})} onSelected={onSelectedEquipment}/>
                }

            </VStack>
            <HStack space={2}>
                <Button w={'1/3'} colorScheme={'gray'} onPress={onResetFilter}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Reset</Text>
                </Button>
                <Button onPress={onApplyFilter} flex={1} colorScheme={'darkBlue'}>
                    <Text fontWeight={'bold'} fontFamily={'Poppins'} color={'#FFF'}>Terapkan Filter</Text>
                </Button>
            </HStack>
        </VStack>
    )
}

export default FilterDailyEvent