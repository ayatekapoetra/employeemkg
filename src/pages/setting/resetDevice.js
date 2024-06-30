import { FlatList, Linking, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import apiFetch from '../../helpers/ApiFetch'
import { CloseCircle, CloseSquare, SearchStatus } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'
import { applyAlert } from '../../redux/alertSlice'
import { getDataFetch } from '../../redux/fetchDataSlice'

const ResetUserDevice = () => {
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes.value)
    // const [ data, setData ] = useState([])
    const [ keyword, setKeyword ] = useState("")
    const { data, loading, error } = useSelector( state => state.fetchData)

    console.log(data);

    useEffect(() => {
        onGetDataHandle(keyword)
    }, [keyword])

    const onGetDataHandle = async (qstring = null) => {
        dispatch(getDataFetch({uri: `user-devices`, params: { keyword: qstring }}))
        // try {
        //     const resp = await apiFetch.get("user-devices", { params: { keyword: qstring } })
        //     console.log(resp);
        //     setData(resp.data.data)
        // } catch (error) {
        //     console.log(error);
        //     dispatch(applyAlert({
        //         show: true,
        //         status: "error",
        //         title: error.code,
        //         subtitle: error.message
        //     }))
        // }
    }

    const onPostResetHandle = async (id) => {
        try {
            const resp = await apiFetch.post("user-devices/"+id+"/reset")
            console.log('POST---', resp);
            const { nama_lengkap } = resp?.data?.data
            dispatch(applyAlert({
                show: true,
                status: "success",
                title: "Success",
                subtitle: "Okey uniq number device user\n" + nama_lengkap + "\nberhasil di reset..."
            }))
            onGetDataHandle("")
        } catch (error) {
            console.log(error);
            dispatch(applyAlert({
                show: true,
                status: "error",
                title: error.code,
                subtitle: error.message
            }))
        }
    }
    
    // console.log(data);
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Reset UUID Devices"} onBack={true} />
                <VStack m={3} flex={1}>
                    <HStack p={2} rounded={"md"} justifyContent={"space-between"} borderWidth={1} borderColor={appcolor.line[mode][2]}>
                        <HStack flex={1} space={2} alignItems={"center"}>
                            <SearchStatus size="22" color={appcolor.ico[mode][2]} variant="Bulk"/>
                            <TextInput 
                                onChangeText={(teks) => {
                                    setKeyword(teks)
                                }} 
                                style={{flex: 1, fontFamily: "Poppins-Regular", color: appcolor.teks[mode][1]}}/>
                        </HStack>
                    </HStack>
                    <FlatList 
                        data={data} 
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item}) => {
                            return (
                                <HStack my={1} py={2} space={2} alignItems={"center"} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                                    <TouchableOpacity onPress={() => onPostResetHandle(item.user_id)}>
                                        <CloseSquare size="36" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                    </TouchableOpacity>
                                    <VStack flex={1}>
                                        <Text 
                                        fontSize={18}
                                        fontWeight={600}
                                        fontFamily={"Quicksand-Regular"}
                                        color={appcolor.teks[mode][1]}>
                                            {item.nama_lengkap}
                                        </Text>
                                        <HStack justifyContent={'space-between'}>
                                            <Text 
                                            fontSize={12}
                                            fontFamily={"Poppins-Regular"}
                                            color={appcolor.teks[mode][2]}>
                                                {item.telephone}
                                            </Text>
                                            <Text 
                                            fontSize={14}
                                            letterSpacing={'lg'}
                                            fontFamily={"Teko-Regular"}
                                            color={appcolor.teks[mode][2]}>
                                                {item.section}
                                            </Text>
                                        </HStack>
                                        <Text 
                                        fontSize={12}
                                        fontFamily={"Poppins-Regular"}
                                        color={appcolor.teks[mode][3]}>
                                            {item.device_id}
                                        </Text>
                                    </VStack>
                                </HStack>
                            )
                        }}/>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ResetUserDevice