import { FlatList, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { VStack, Text, HStack } from 'native-base'
import { useSelector } from 'react-redux'
import appcolor from '../common/colorMode'
import employee from '../../assets/json/karyawans.json'
import { SearchStatus, TriangleLogo, UserTag } from 'iconsax-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiFetch from '../helpers/ApiFetch'

const dataEmployee = employee.RECORDS.filter( f => f.ktp)

// console.log('dataEmployee', dataEmployee);

const KaryawanList = ( { state, setState, setOpenKaryawan, section } ) => {
    const mode = useSelector(state => state.themes).value
    const [ karyawan, setKaryawan ] = useState(section ? dataEmployee.filter(f => section.includes(f.section)):dataEmployee)

    // console.log('SECTION', section);

    useEffect(() => {
        getDataLokal()
    }, [])

    const getDataLokal = async () => {
        try {
            const data = await AsyncStorage.getItem("@karyawan")
            if(data){
                if(section){
                    setKaryawan(JSON.parse(data).filter(f => section.includes(f.section)))
                }else{
                    setKaryawan(JSON.parse(data))
                }
            }
        } catch (error) {
            setKaryawan(dataEmployee)
        }
    }

    const searchKeywordHandle = async (teks) => {
        if(teks != ""){
            console.log(teks);
            try {
                const resp = await apiFetch.get(`karyawan?keyword=${teks}`)
                console.log(resp);
                const { data } = resp.data
                if(section){
                    setKaryawan(data.filter( f => section.includes(f.section)))
                }else{
                    setKaryawan(data)
                }
            } catch (error) {
                var dataFilter = karyawan.filter( f => (f.nama)?.includes(teks) || (f.section)?.includes(teks) || (f.id).includes(teks))
                console.log(dataFilter);
                setKaryawan(dataFilter)
            }
        }else{
            setKaryawan(dataEmployee)
        }
    }

    // console.log(karyawan);

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
                data={karyawan} 
                keyExtractor={(item => item.id)} 
                renderItem={({item}) => <ListItems mode={mode} item={item} state={state} setState={setState} setOpenKaryawan={setOpenKaryawan}/>}/>
        </VStack>
    )
}

export default KaryawanList

function ListItems( { mode, item, state, setState, setOpenKaryawan } ) {
    var active = item.ktp ? true:false

    const onSelectedHandle = () => {
        console.log(item);
        setState({...state, karyawan_id: item.id, karyawan: item})
        setOpenKaryawan(false)
    }

    if(active){
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
                                color={appcolor.teks[mode][3]}>
                                { item.ktp }
                            </Text>
                            <TriangleLogo size="16" color={appcolor.ico[mode][2]} variant="Bulk"/>
                            <Text 
                                fontSize={12}
                                fontFamily={"Poppins-Regular"}
                                color={appcolor.teks[mode][3]}>
                                { item.section }
                            </Text>
                        </HStack>
                    </VStack>
                </HStack>
            </TouchableOpacity>
        )
    }
}