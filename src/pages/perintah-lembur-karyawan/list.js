import { TouchableOpacity, FlatList, RefreshControl, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { VStack, Text, HStack } from 'native-base';
import { Clock, NoteAdd, RulerPen } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react'
import appcolor from '../../common/colorMode'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import NoData from '../../components/NoData';
import apiFetch from '../../helpers/ApiFetch';
import { applyAlert } from '../../redux/alertSlice';
import LoadingHauler from '../../components/LoadingHauler';
import moment from 'moment';

const ListPerintahLembur = ( { data, loading, onRefreshHandle } ) => {
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    return (
        <VStack flex={1}>
            <VStack flex={1} mt={3}>
                {
                    data.length > 0 ?
                    <FlatList
                        data={data}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle}/>}
                        renderItem={({item}) => <ItemList mode={mode} item={item} user={user}/>}
                        keyExtractor={item => item.id}/>
                    :
                    <NoData title={"Oops.."} subtitle={"Data tidak ditemukan..."}/>
                }
            </VStack>

        </VStack>
    )
}

export default ListPerintahLembur

function ItemList ( { item, user, mode } ) {
    const route = useNavigation()
    switch (item.status) {
        case "A":
            var iconColor = appcolor.ico[mode][4]
            break;
        case "F":
            var iconColor = appcolor.ico[mode][5]
            break;
        case "C":
            var iconColor = appcolor.ico[mode][3]
            break;
        default:
            var iconColor = appcolor.ico[mode][2]
            break;
    }
    return (
        <TouchableOpacity onPress={() => route.navigate("Show-Perintah-Lembur", item)}>
            <HStack alignItems={"center"} px={1} py={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                {
                    user.karyawan.id === item.karyawan_id &&
                    <View style={{height: 10, width: 10, backgroundColor: "red", position: "absolute", top: 35, left: 5, borderRadius: 10}}/>
                }
                <NoteAdd size="52" color={iconColor} variant="Bulk"/>
                <VStack ml={1} flex={1}>
                    <Text 
                        fontSize={18}
                        lineHeight={"xs"}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        { item.karyawan.nama }
                    </Text>
                    <Text 
                        fontSize={12}
                        lineHeight={"xs"}
                        fontFamily={"Quicksand-Regular"}
                        color={appcolor.teks[mode][3]}>
                        { item.karyawan.section }
                    </Text>
                    
                    <HStack space={2}>
                        <HStack space={1} alignItems={"center"}>
                            <Clock size="22" color={appcolor.teks[mode][4]} variant="Bulk"/>
                            <Text 
                                fontSize={16}
                                lineHeight={"xs"}
                                fontFamily={"Quicksand-Regular"}
                                color={appcolor.teks[mode][4]}>
                                { moment(item.overtime_start).format("HH:mm") }
                            </Text>
                        </HStack>
                        <HStack space={1} alignItems={"center"}>
                            <Clock size="22" color={appcolor.teks[mode][5]} variant="Bulk"/>
                            <Text 
                                fontSize={16}
                                lineHeight={"xs"}
                                fontFamily={"Quicksand-Regular"}
                                color={appcolor.teks[mode][5]}>
                                { moment(item.overtime_end).format("HH:mm") }
                            </Text>
                        </HStack>
                        <HStack space={1} alignItems={"center"}>
                            <RulerPen size="22" color={appcolor.teks[mode][3]} variant="Bulk"/>
                            <Text 
                                fontSize={16}
                                lineHeight={"xs"}
                                fontFamily={"Quicksand-Regular"}
                                color={appcolor.teks[mode][3]}>
                                { item.overtime_duration } JAM
                            </Text>
                        </HStack>
                    </HStack>
                    <Text 
                        fontSize={16}
                        lineHeight={"xs"}
                        fontFamily={"Quicksand-Regular"}
                        color={appcolor.teks[mode][1]}>
                        { moment().format("dddd, DD MMMM YYYY") }
                    </Text>
                    <Text 
                        fontSize={14}
                        lineHeight={"xs"}
                        fontWeight={700}
                        fontFamily={"Quicksand-Regular"}
                        color={appcolor.teks[mode][1]}>
                        Author : { item.author.nama_lengkap }
                    </Text>
                </VStack>
            </HStack>
        </TouchableOpacity>
    )
}