import { FlatList, Linking, RefreshControl, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { useDispatch, useSelector } from 'react-redux'
import { VStack, Text, Center, HStack, Button, Image } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { Lock, UserOctagon } from 'iconsax-react-native'
import apiFetch from '../../helpers/ApiFetch'
import LoadingHauler from '../../components/LoadingHauler'
import NoData from '../../components/NoData'
import moment from 'moment'
import { URIPATH } from '../../helpers/UriPath'

const InternalMemo = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const mode = useSelector(state => state.themes.value)
    const [ data, setData ] = useState([])
    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        onGetData()
    }, [])

    const onGetData = async () => {
        setLoading(true)
        try {
            const resp = await apiFetch.get("internal-memo")
            setData(resp.data.data)
            setLoading(false)
        } catch (error) {
            console.log(error);
            setLoading(false)
        }
    }

    const onRefresh = useCallback(() => {
        onGetData()
    })

    if(loading){
        return (
            <AppScreen>
                <HeaderScreen title={"Internal Memo"} onBack={true} onThemes={true} onNotification={true} />
                <LoadingHauler/>
            </AppScreen>
        )
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Internal Memo"} onBack={true} onThemes={true} onNotification={true} />
                <VStack m={3} flex={1}>
                    {
                        data?.length <= 0 ?
                        <NoData/>
                        :
                        <FlatList 
                            data={data}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh}/>}
                            renderItem={({item}) => <ItemList item={item} mode={mode}/>}
                            keyExtractor={(item) => item.id}/>
                    }
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default InternalMemo


function ItemList({item, mode}){
    const onClickLink = () => {
        if(item.url){
            Linking.openURL(URIPATH.apiphoto + item.url)
        }
    }

    return(
        <HStack py={2} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
            <TouchableOpacity onPress={onClickLink}>
                <VStack>
                    <Text 
                        fontSize={20}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][2]}>
                        { moment(item.memo_date).format("dddd, DD MMMM YYYY") }
                    </Text>
                    <Text 
                        fontSize={18}
                        fontFamily={"Rancho-Regular"}
                        color={appcolor.teks[mode][3]}>
                        { item.kode }
                    </Text>
                    <Text 
                        fontSize={18}
                        fontFamily={"Poppins-Regular"}
                        color={appcolor.teks[mode][1]}>
                        { item.title }
                    </Text>
                    <Text 
                        fontSize={15}
                        textAlign={"justify"}
                        fontFamily={"Quicksand-Regular"}
                        color={appcolor.teks[mode][1]}>
                        { item.narasi }
                    </Text>
                    <Text 
                        fontSize={15}
                        fontFamily={"Quicksand-Regular"}
                        color={appcolor.teks[mode][6]}>
                        { `author : ${item.author}` }
                    </Text>
                    {
                        item.url &&
                        <HStack>
                            <Text 
                                fontSize={12}
                                fontFamily={"Quicksand-Regular"}
                                color={appcolor.teks[mode][4]}>
                                { `Link URL : ${URIPATH.apiphoto}${item.url}` }
                            </Text>
                        </HStack>
                    }

                </VStack>
            </TouchableOpacity>
        </HStack>
    )
}