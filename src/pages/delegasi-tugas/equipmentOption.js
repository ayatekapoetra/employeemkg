import { TextInput, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { VStack, Text, Flex, HStack, Stack, ZStack, Image, Divider } from 'native-base'
import appcolor from '../../common/colorMode'
import { Bubble, CodeCircle, Cpu, SearchStatus } from 'iconsax-react-native'

const EquipmentOption = ( { setDataEquipment } ) => {
    const equipment = useSelector( state => state.equipment)
    const [ state, setState ] = useState(equipment.data?.map( m => ({...m, visible: true})))
    const mode = useSelector(state => state.themes.value)
    console.log(state);

    const searchEquipment = (teks) => {
        console.log(teks);
        if(teks){
            setState(state.map(m => (`/${m.kode}/i`).includes(teks) ? {...m, visible: true} : {...m, visible: false}))
        }else{
            setState(equipment.data?.map( m => ({...m, visible: true})))
        }
    }

    return (
        <VStack>
            <HStack p={2} mb={2} space={2} borderWidth={.5} borderColor={appcolor.line[mode][2]} rounded={'sm'}>
                <SearchStatus size="22" color={appcolor.ico[mode][1]} variant={"Outline"}/>
                <TextInput 
                    onChangeText={searchEquipment}
                    style={{flex: 1, height: 25, fontFamily: 'Quicksand-Regular', color: appcolor.teks[mode][1]}}/>
            </HStack>
            <FlatList 
                data={state} 
                keyExtractor={item => item.id} 
                renderItem={( { item } ) => (
                    <RenderComponentKegiatan 
                    data={item} 
                    mode={mode} 
                    setDataEquipment={setDataEquipment}/>)
                }/>
        </VStack>
    )
}

export default EquipmentOption

const RenderComponentKegiatan = ( { data, mode, setDataEquipment } ) => {
    if(data.visible){
        return (
            <TouchableOpacity onPress={() => setDataEquipment(data)}>
                <HStack 
                    p={2} 
                    my={1} 
                    space={2} 
                    alignItems={'center'} 
                    justifyContent={'space-between'} 
                    borderWidth={.5} 
                    borderStyle={'dashed'} 
                    borderColor={appcolor.line[mode][2]} 
                    rounded={'sm'}>
                    <HStack space={3}>
                        <Image 
                            alt='...' 
                            source={data.kategori === 'DT' ? require('../../../assets/images/IMG-DT.png') : require('../../../assets/images/IMG-EXCA-BIG.png')} 
                            resizeMode="stretch"
                            style={{width: 60, height: 40}}/>
                        <VStack>
                            <Text 
                                fontSize={22}
                                fontWeight={700}
                                fontFamily={'Poppins-SemiBold'} 
                                color={appcolor.teks[mode][1]}>
                                {data.kode}
                            </Text>
                            <HStack space={2} alignItems={'center'}>
                                <Text 
                                    fontSize={12}
                                    fontWeight={200}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    {data.model}
                                </Text>
                                <Cpu size="12" color={appcolor.ico[mode][1]} variant={"Outline"}/>
                                <Text 
                                    fontSize={12}
                                    fontWeight={200}
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    {data.manufaktur}
                                </Text>
                            </HStack>
                        </VStack>

                    </HStack>
                    <Bubble size="22" color={appcolor.ico[mode][1]} variant={"Bulk"}/>
                </HStack>
            </TouchableOpacity>
        )
    }
}