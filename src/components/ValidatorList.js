import { FlatList, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import employee from '../../assets/json/karyawans.json'
import { SearchStatus, TriangleLogo, UserTag } from 'iconsax-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiFetch from '../helpers/ApiFetch'

const ValidatorList = ( { data, state, setState, setOpenValidator, field } ) => {
    const mode = useSelector(state => state.themes).value
    const [ list, setList ] = useState(data)

    const searchKeywordHandle = async (teks) => {
        if(teks != ""){
            console.log(teks);
            var dataFilter = list.filter( f => (f.nama)?.includes(teks))
            console.log(dataFilter);
            setList(dataFilter)
        }else{
            setList(data)
        }
    }

    return (
        <VStack 
            mt={1} 
            p={2} 
            flex={1}
            rounded={"md"} 
            borderWidth={1} 
            borderStyle={"dotted"}
            borderColor={appcolor.line[mode][2]}>
            <HStack p={2} mb={2} space={2} rounded={"md"} alignItems={"center"} borderWidth={1} borderColor={appcolor.line[mode][2]}>
                <SearchStatus size="22" color={appcolor.ico[mode][1]} variant="Bulk"/>
                <TextInput 
                    onChangeText={(teks) => searchKeywordHandle(teks)}
                    // onSubmitEditing={(teks) => searchKeywordHandle(teks)}
                    placeholder='Cari nama atau section karyawan di sini...'
                    placeholderTextColor={appcolor.teks[mode][2]}
                    style={{flex: 1, color: appcolor.teks[mode][1]}}/>
            </HStack>
            <FlatList 
                data={list} 
                keyExtractor={(item => item.id)} 
                renderItem={({item}) => <ListItems field={field} mode={mode} item={item} state={state} setState={setState} setOpenValidator={setOpenValidator}/>}/>
        </VStack>
    )
}

export default ValidatorList

function ListItems( { mode, item, state, setState, setOpenValidator, field } ) {

    const onSelectedHandle = () => {
        console.log(item);
        if(field){
            setState({...state, [field[0]]: item.id, [field[1]]: item})
        }else{
            setState({...state, ws_appovedby: item.id, appovedby: item})
        }
        setOpenValidator(false)
    }

    return(
        <TouchableOpacity onPress={onSelectedHandle}>
            <HStack 
                flex={1} 
                py={2} 
                space={2} 
                alignItems={"center"}>
                <UserTag size="28" color={appcolor.ico[mode][1]} variant="Bulk"/>
                <VStack>
                    <Text 
                        fontWeight={"bold"}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        { item.nama }
                    </Text>
                    <HStack space={2} alignItems={"center"}>
                        <Text 
                            fontSize={12}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            { item.ktp }
                        </Text>
                        <TriangleLogo size="16" color={appcolor.ico[mode][2]} variant="Bulk"/>
                        <Text 
                            fontSize={12}
                            fontFamily={"Poppins-Regular"}
                            color={appcolor.teks[mode][2]}>
                            { item.section }
                        </Text>
                    </HStack>
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}