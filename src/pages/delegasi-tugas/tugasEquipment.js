import { FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { VStack, Text, HStack, Image, Center } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import appcolor from '../../common/colorMode'
import { Additem, Flag, TagRight } from 'iconsax-react-native'
import { applyTugas } from '../../redux/tugasSlice'
import IllustrationTaskEquipment from '../../components/IllustrationTaskEquipment'
import { useNavigation } from '@react-navigation/native'

const TugasEquipment = () => {
    const task = useSelector(state => state.tugas)
    const mode = useSelector(state => state.themes.value)
    return (
        <VStack flex={1}>
            <FlatList 
                data={task.equipmentTask} 
                keyExtractor={item => item.id} 
                showsVerticalScrollIndicator={false}
                renderItem={( { item } ) => <RenderComponentItem data={item} mode={mode}/>} />
        </VStack>
    )
}

export default TugasEquipment

const RenderComponentItem = ( { data, mode } ) => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const task = useSelector(state => state.tugas)
    const [ openShift, setOpenShift ] = useState(false)
    const [ openPenyewa, setOpenPenyewa ] = useState(false)
    const [ openLokasiPit, setOpenLokasiPit ] = useState(false)
    const [ openKegiatan, setOpenKegiatan ] = useState(false)
    const [ openEquipment, setOpenEquipment ] = useState(false)
    const [ openNarasi, setOpenNarasi ] = useState(false)

    const gotoDetailKegiatan = () => {
        route.navigate('create-equipment-tugas-detail', data)
    }

    const setDataKegiatan = (obj) => {
        dispatch(applyTugas({
            ...task,
            items: task.items.map( m => m.id === data.id ? {...m, kegiatan: obj}:m)
        }))
        setOpenKegiatan(false)
    }

    const setDataEquipment = (obj) => {
        dispatch(applyTugas({
            ...task,
            items: task.items.map( m => m.id === data.id ? {...m, equipment: obj}:m)
        }))
        setOpenEquipment(false)
    }

    const setDataNarasi = (teks) => {
        dispatch(applyTugas({
            ...task,
            items: task.items.map( m => m.id === data.id ? {...m, narasitask: teks}:m)
        }))
        setOpenEquipment(false)
    }

    // console.log('data.item', data.items);

    return (
        <VStack py={3} flex={1}>
            <HStack p={2} mb={2} bg={appcolor.box[mode]} rounded={'sm'} alignItems={'center'} justifyContent={'space-between'}>
                <HStack space={1}>
                    <TagRight size="22" color={appcolor.teks[mode][6]} variant="Bulk"/>
                    <Text 
                        fontSize={18}
                        fontWeight={700}
                        lineHeight={'xs'}
                        fontFamily={'Quicksand-Regular'} 
                        color={appcolor.teks[mode][1]}>
                        {data.nama}
                    </Text>
                </HStack>
                <Text 
                    fontSize={12}
                    fontWeight={300}
                    lineHeight={'xs'}
                    fontFamily={'Abel-Regular'} 
                    color={appcolor.teks[mode][2]}>
                    {data.section}
                </Text>
            </HStack>
            <TouchableOpacity onPress={gotoDetailKegiatan}>
                <HStack 
                    p={1}
                    rounded={'md'}
                    borderWidth={.5} 
                    borderColor={appcolor.line[mode][2]} 
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    borderStyle={'dashed'}>
                    <HStack space={2} alignItems={'center'}>
                        <Additem size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                        <VStack>
                            <Text 
                                fontSize={16}
                                lineHeight={'xs'}
                                fontFamily={'Quicksand'}
                                color={appcolor.teks[mode][1]}>
                                Tambah Kegiatan
                            </Text>
                            <Text 
                                my={-1}
                                fontSize={12}
                                fontWeight={'light'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Klik tombol ini untuk membuat kegiatan baru
                            </Text>
                        </VStack>
                    </HStack>
                    <Flag size="32" color={appcolor.ico[mode][1]} variant="Bulk"/>
                </HStack>
            </TouchableOpacity>
            <VStack>
                {
                    data?.items?.length > 0 ?
                    <FlatList 
                        data={data.items}
                        key={i => i.key}
                        renderItem={({item}) => <IllustrationTaskEquipment data={item} person={data}/>}/>
                    
                    :
                    <Center>
                        <Image opacity={.3} source={require('../../../assets/images/delegation-illustration.png')} resizeMode="cover" alt='...' style={{width: 250, height: 230}}/>
                    </Center>

                }
            </VStack>
        </VStack>
    )
}