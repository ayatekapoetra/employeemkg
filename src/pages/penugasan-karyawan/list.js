import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { VStack, Text, HStack, Image, Avatar, Center } from 'native-base'
import { useNavigation } from '@react-navigation/native'
import appcolor from '../../common/colorMode'
import moment from 'moment'
import BadgeAlt from '../../components/BadgeAlt'

const ListPenugasan = ( { data, mode, refreshing, onRefreshHandle } ) => {
    
    return (
        <VStack flex={1}>
            <FlatList 
                data={data} 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshHandle} />}
                renderItem={ ( {item} ) =>  <ComponentItem  item={item} mode={mode}/> } 
                keyExtractor={ item => item.id}/>
        </VStack>
  )
}

export default ListPenugasan

const ComponentItem = ( { mode, item } ) => {
    const route = useNavigation()
    switch (item.status) {
        case 'reject':
            var myBudges = <BadgeAlt rounded={'full'} title={item.status} type={'error'} colorScheme={'error.100'}/>
            break;
        case 'check':
            var myBudges = <BadgeAlt rounded={'full'} title={item.status} type={'warning'} colorScheme={'warning.100'}/>
            break;
        case 'done':
            var myBudges = <BadgeAlt rounded={'full'} title={item.status} type={'success'} colorScheme={'success.100'}/>
            break;
        default:
            var myBudges = <BadgeAlt rounded={'full'} title={item.status} type={'info'} colorScheme={'blue.100'}/>
            break;
    }

    const navigasiHandle = () => {
        const url = 'show-penugasan-' + item.type
        route.navigate(url, item)
    }

    return(
        <TouchableOpacity onPress={navigasiHandle}>
            <VStack py={2} borderBottomColor={appcolor.line[mode][1]} borderBottomWidth={1}>
                <HStack space={2}>
                    <VStack>
                        {
                            item.type == 'equipment' ?
                            <Avatar bg={'amber.500'}>EQ</Avatar>
                            :
                            <Avatar bg={'blueGray.500'}>EM</Avatar>
                        }
                    </VStack>
                    <VStack flex={1}>
                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                            <Text 
                                fontFamily={'Dosis'}
                                lineHeight={'xs'}
                                fontWeight={'bold'}
                                fontSize={20}
                                color={appcolor.teks[mode][1]}>
                                {item.nmassigned}
                            </Text>
                            { myBudges }
                        </HStack>
                        <Text 
                            lineHeight={'xs'}
                            fontFamily={'Roboto'}
                            color={appcolor.teks[mode][1]}>
                            {item.kode}
                        </Text>
                        <Text 
                            lineHeight={'xs'}
                            fontFamily={'Abel-Regular'}
                            fontSize={12}
                            color={appcolor.teks[mode][3]}>
                            {moment(item.date_task).format('dddd, DD MMMM YYYY')}
                        </Text>
                        {
                            item.items.map((m, i) => {
                                var narasi = m.narasitask.length >= 100 ? `${(m.narasitask).substring(0, 100)}......` : m.narasitask
                                return(
                                    <HStack mt={1} space={1} key={m.id}>
                                        <Text lineHeight={'xs'} color={appcolor.teks[mode][1]} fontFamily={'Quicksand'}>{i+1}.</Text>
                                        <Text 
                                            flex={1} 
                                            lineHeight={'xs'} 
                                            color={appcolor.teks[mode][1]} 
                                            // textAlign={'justify'}
                                            fontFamily={'Quicksand'}>
                                            {narasi}
                                        </Text>
                                    </HStack>
                                )
                            })
                        }
                    </VStack>
                </HStack>
            </VStack>
        </TouchableOpacity>
    )
}