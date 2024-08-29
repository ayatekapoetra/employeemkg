import { TouchableOpacity, FlatList, Dimensions, TextInput } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Actionsheet, Center, Button, Stack, Divider } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import { ArrowSquareRight, MenuBoard, Watch } from 'iconsax-react-native'
import { applyTugas } from '../../redux/tugasSlice'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'

const { height, width } = Dimensions.get("window")

const TugasKaryawan = () => {
    const task = useSelector(state => state.tugas)
    const mode = useSelector(state => state.themes.value)


    return (
        <VStack flex={1}>
            <FlatList 
                data={task.userTask} 
                keyExtractor={item => item.id} 
                showsVerticalScrollIndicator={false}
                renderItem={( { item } ) => <RenderComponentItem data={item} mode={mode}/>} />
        </VStack>
    )
}

export default TugasKaryawan

const RenderComponentItem = ( { data, mode } ) => {
    const dispatch = useDispatch()
    const cancelRef = React.useRef(null);
    const task = useSelector(state => state.tugas)
    const [ editBox, setEditBox ] = useState(false)
    const [ openDateStart, setOpenDateStart ] = useState(false)
    const [ openDateFinish, setOpenDateFinish ] = useState(false)
    const onClose = () => setEditBox(false);

    const setDataDetailTugas = (teks) => {
        dispatch(applyTugas({
            ...task,
            userTask: task.userTask.map( m => m.id === data.id ? {...m, narasitask: teks}:m)
        }))
    }

    const onSelectDatetime = (date, field) => {
        dispatch(applyTugas({
            ...task,
            userTask: task.userTask.map( m => m.id === data.id ? {...m, [field]: moment(date).format('YYYY-MM-DD HH:mm')}:m)
        }))
    }

    return (
        <VStack py={3}>
            <VStack p={2} mb={2} bg={appcolor.box[mode]} rounded={'sm'} alignItems={'center'} justifyContent={'space-between'}>
                <Text 
                    fontSize={18}
                    fontWeight={700}
                    lineHeight={'xs'}
                    fontFamily={'Quicksand-Regular'} 
                    color={appcolor.teks[mode][1]}>
                    {data.nama}
                </Text>
                <Text 
                    fontSize={12}
                    fontWeight={300}
                    lineHeight={'xs'}
                    fontFamily={'Abel-Regular'} 
                    color={appcolor.teks[mode][2]}>
                    {data.section}
                </Text>
            </VStack>
            <TouchableOpacity onPress={() => setEditBox(true)}>
                <HStack space={2} flex={1} alignItems={'flex-start'} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                    <MenuBoard size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                    <VStack py={1} flex={1}>
                        <Text 
                            fontSize={12}
                            fontWeight={300}
                            fontFamily={'Abel-Regular'} 
                            color={appcolor.teks[mode][2]}>
                            Narasi Tugas :
                        </Text>
                        <Text 
                            fontSize={16}
                            fontWeight={500}
                            lineHeight={'xs'}
                            fontFamily={'Quicksand-Regular'} 
                            color={appcolor.teks[mode][1]}>
                            { data.narasitask || "???" }
                        </Text>
                    </VStack>
                    <Stack mt={2}>
                        <ArrowSquareRight size="22" color={appcolor.teks[mode][2]} variant={editBox?"Bulk":"Outline"}/>
                    </Stack>
                </HStack>
            </TouchableOpacity>
            <HStack flex={1} justifyContent={"space-around"}>
                <TouchableOpacity onPress={() => setOpenDateStart(!openDateStart)}>
                    <VStack>
                        <Text fontFamily={'Poppins-Regular'} fontWeight={500} color={appcolor.teks[mode][3]}>Mulai Tugas</Text>
                        <HStack space={1} alignItems={'center'}>
                            <Watch size="22" color={appcolor.teks[mode][2]} variant={"Outline"}/>
                            <Text fontFamily={'Dosis'} fontWeight={800} fontSize={18} color={appcolor.teks[mode][1]}>
                                {moment(data.starttask).format("HH:mm [wita]")}
                            </Text>
                        </HStack>
                        <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                            {moment(data.starttask).format('dddd, DD MMMM YYYY')}
                        </Text>
                    </VStack>
                </TouchableOpacity>
                <Divider orientation='vertical' bg={appcolor.line[mode][1]}/>
                <TouchableOpacity onPress={() => setOpenDateFinish(!openDateFinish)}>
                    <VStack>
                        <Text fontFamily={'Poppins-Regular'} fontWeight={500} color={appcolor.teks[mode][5]}>Dateline Tugas</Text>
                        <HStack space={1} alignItems={'center'}>
                            <Watch size="22" color={appcolor.teks[mode][2]} variant={"Outline"}/>
                            <Text fontFamily={'Dosis'} fontWeight={800} fontSize={18} color={appcolor.teks[mode][1]}>
                                {moment(data.dateline).format("HH:mm [wita]")}
                            </Text>
                        </HStack>
                        <Text fontFamily={'Abel-Regular'} color={appcolor.teks[mode][1]}>
                            {moment(data.dateline).format('dddd, DD MMMM YYYY')}
                        </Text>
                    </VStack>
                </TouchableOpacity>
            </HStack>
            <Actionsheet isOpen={editBox} onClose={onClose}>
                <Actionsheet.Content style={{height: height * .6}}>
                    <VStack flex={1} justifyContent={'space-between'} alignItems={'center'}>
                        <VStack>
                            <Center>
                                <Text 
                                    fontSize={14}
                                    fontWeight={300}
                                    fontFamily={'Abel-Regular'}>
                                    Penjelasan detail tugas yang diberikan kepada
                                </Text>
                                <Text 
                                    fontSize={14}
                                    fontWeight={700}
                                    fontFamily={'Dosis-Regular'}>
                                    {data.nama}
                                </Text>
                            </Center>
                            <HStack flex={1} mt={3} bg={'amber.100'} w={'full'} rounded={'md'}>
                                <TextInput 
                                    multiline 
                                    onChangeText={setDataDetailTugas}
                                    style={{flex: 1, padding: 10}}/>
                            </HStack>
                        </VStack>
                    </VStack>
                </Actionsheet.Content>
            </Actionsheet>
            {
                openDateStart &&
                <DatePicker
                    modal
                    mode={"datetime"}
                    locale={"ID"}
                    open={openDateStart}
                    date={new Date()}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onSelectDatetime(date, 'starttask')}
                    onCancel={() => {
                        setOpenDateStart(!openDateStart)
                    }}
                />
            }
            {
                openDateFinish &&
                <DatePicker
                    modal
                    mode={"datetime"}
                    locale={"ID"}
                    open={openDateFinish}
                    date={new Date()}
                    theme={mode != "dark"?"light":"dark"}
                    onConfirm={(date) => onSelectDatetime(date, 'dateline')}
                    onCancel={() => {
                        setOpenDateFinish(!openDateFinish)
                    }}
                />
            }
        </VStack>
    )
}