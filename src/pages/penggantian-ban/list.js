import moment from 'moment'
import { RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { FlatList, HStack, VStack, Text, Center, Avatar } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { getTireUsages } from '../../redux/fetchTireUsagesSlice'
import appcolor from '../../common/colorMode'
import BadgeAlt from '../../components/BadgeAlt'
import { AlignVertically, Image as ImageIco, Moon, Sun1  } from 'iconsax-react-native'
import { URIPATH } from '../../helpers/UriPath'
import LoadingSpinner from '../../components/LoadingSpinner'

const ListTireReport = ( { qstring } ) => {
    const route = useNavigation()
    const isFocus = useIsFocused()
    const dispatch = useDispatch()
    
    const mode = useSelector(state => state.themes.value)
    const { data, loading, error} = useSelector( state => state.tireUsages)

    useEffect(() => {
        dispatch(getTireUsages(qstring))
    }, [isFocus])

    const onApplyFilter = () => {
        dispatch(getTireUsages(qstring))
    }
    
    return (
        <VStack mt={2} flex={1}>
            {
                loading ?
                <LoadingSpinner/>
                :
                <FlatList
                    data={data} 
                    keyExtractor={i => i.id} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onApplyFilter}/>}
                    renderItem={({item}) => <RenderComponentItem item={item} mode={mode} route={route}/>}/>
            }
        </VStack>
    )
}

export default ListTireReport

const RenderComponentItem = ( { mode, item, route } ) => {
    if(!item.checkedby && !item.acceptedby){
        var badgeStatus = <BadgeAlt rounded={"full"} type={"error"} colorScheme={"error.200"} title={"waiting"}/>
    }else if(item.checkedby && !item.acceptedby){
        var badgeStatus = <BadgeAlt rounded={"full"} type={"warning"} colorScheme={"yellow.200"} title={"checked"}/>
    }else if(item.checkedby && item.acceptedby){
        var badgeStatus = <BadgeAlt rounded={"full"} type={"success"} colorScheme={"success.200"} title={"accepted"}/>
    }else{
        var badgeStatus = <BadgeAlt rounded={"full"} type={"info"} colorScheme={"blue.200"} title={"recheck"}/>
    }

    const showData = () => {
        route.navigate('show-penggantian-ban', item)
    }

    return(
        <TouchableOpacity onPress={showData}>
            <VStack flex={1} py={3} borderBottomWidth={.5} borderBottomColor={appcolor.line[mode][1]}>
                <HStack space={2}>
                    <Center px={2} my={2} h={'110px'} w={'80px'} rounded={'md'} borderWidth={1} borderStyle={'dashed'} borderColor={appcolor.line[mode][2]}>
                        <Text 
                            fontFamily={'Abel-Regular'}
                            color={appcolor.teks[mode][2]}>
                            { moment(item.date_ops).format('MMMM') }
                        </Text>
                        <Text 
                            mt={-3}
                            fontSize={30}
                            fontWeight={'black'}
                            fontFamily={'Dosis'}
                            color={appcolor.teks[mode][1]}>
                            { moment(item.date_ops).format('DD') }
                        </Text>
                        <Text 
                            mt={-2}
                            color={appcolor.teks[mode][2]}>
                            { moment(item.date_ops).format('YYYY') }
                        </Text>
                    </Center>
                    <VStack flex={1}>
                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                            <VStack flex={1}>
                                <Text 
                                    fontSize={'lg'}
                                    fontWeight={'bold'}
                                    fontFamily={'Poppins-Bold'}
                                    color={appcolor.teks[mode][1]}>
                                    {item.equipment.kode}
                                </Text>
                                <Text 
                                    fontSize={'xs'}
                                    lineHeight={'xs'}
                                    fontFamily={'Poppins-Medium'}
                                    color={appcolor.teks[mode][3]}>
                                    {item.equipment.manufaktur}
                                </Text>

                            </VStack>
                            {badgeStatus}
                        </HStack>
                        
                        <HStack alignItems={'center'}>
                            <HStack w={'65px'}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Brand
                                </Text>
                            </HStack>
                            <HStack flex={1}>
                                <Text
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-SemiBold'}
                                    color={appcolor.teks[mode][1]}>
                                    : { item.nmbrand }
                                </Text>
                            </HStack>
                        </HStack>
                        <HStack alignItems={'center'}>
                            <HStack w={'65px'}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Type & Seri
                                </Text>
                            </HStack>
                            <HStack flex={1}>
                                <Text
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-SemiBold'}
                                    color={appcolor.teks[mode][1]}>
                                    : { item.type } - { item.noseri }
                                </Text>
                            </HStack>
                        </HStack>
                        <HStack alignItems={'center'}>
                            <HStack w={'65px'}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Kategori
                                </Text>
                            </HStack>
                            <HStack flex={1}>
                                <Text
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-SemiBold'}
                                    color={appcolor.teks[mode][1]}>
                                    : { item.demage_ctg } 
                                </Text>
                            </HStack>
                        </HStack>
                        <HStack alignItems={'center'}>
                            <HStack w={'65px'}>
                                <Text 
                                    fontFamily={'Abel-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Status
                                </Text>
                            </HStack>
                            <HStack flex={1}>
                                <Text
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-SemiBold'}
                                    color={appcolor.teks[mode][1]}>
                                    : { item.status } 
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>
                </HStack>
                <HStack space={2} justifyContent={'flex-start'} alignItems={'center'}>
                    <HStack w={'80px'} justifyContent={'space-around'}>
                        <Avatar bg={appcolor.ico[mode][2]} w={'35px'} h={'35px'} borderWidth={2} borderColor={appcolor.line[mode][2]}
                            source={{
                            uri: `${URIPATH.apiphoto}${item.photo1}`}}>
                                <ImageIco size="20" color={appcolor.line[mode][2]} variant="Broken"/>
                        </Avatar>
                        <Avatar ml={-12} bg={appcolor.ico[mode][2]} w={'35px'} h={'35px'} borderWidth={2} borderColor={appcolor.line[mode][2]}
                            source={{
                            uri: `${URIPATH.apiphoto}${item.photo2}`}}>
                                <ImageIco size="20" color={appcolor.line[mode][2]} variant="Broken"/>
                        </Avatar>
                    </HStack>
                    <HStack flex={1} space={1} justifyContent={'space-between'} alignItems={'center'}>
                        <HStack>
                            <AlignVertically size="22" color={appcolor.teks[mode][2]} variant="Broken"/>
                            <Text
                                fontWeight={'semibold'}
                                fontFamily={'Dosis-SemiBold'}
                                color={appcolor.teks[mode][1]}>
                                { item.lokasi.nama }
                            </Text>
                        </HStack>
                        <HStack space={1} alignItems={'center'}>
                            {
                                item.shift.kode == 'I'
                                ?
                                <Sun1 size="22" color={'#fdba74'} variant="Bold"/>
                                :
                                <Moon size="22" color={'#d4d4d4'} variant="Bulk"/>
                            }
                            <Text 
                                fontFamily={'Farsan-Regular'}
                                color={appcolor.teks[mode][1]}>
                                { item.shift.nama }
                            </Text>
                        </HStack>
                    </HStack>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}