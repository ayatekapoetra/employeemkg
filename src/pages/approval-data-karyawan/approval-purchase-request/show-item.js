import { View } from 'react-native'
import React from 'react'
import AppScreen from '../../../components/AppScreen'
import { VStack, Text, HStack, ScrollView } from 'native-base'
import HeaderScreen from '../../../components/HeaderScreen'
import appcolor from '../../../common/colorMode'
import { useSelector } from 'react-redux'
import { useRoute } from '@react-navigation/native'
import { Airpods, Award, Bag2, Bill, Calendar1, CreativeCommons, MessageNotif, MoneySend, Okru, Shop, ShopAdd, ShoppingCart, UsdCoin, UserOctagon, UserTick } from 'iconsax-react-native'
import moment from 'moment'

const ShowPurchaseRequestItem = () => {
    const { params } = useRoute()
    const mode = useSelector(state => state.themes.value)

    console.log('-----X', params);

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen 
                    title={"Request Item Detail"} 
                    onBack={true} 
                    onThemes={true} 
                    onFilter={null} 
                    onNotification={true}/>
                <VStack flex={1} px={3}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <Shop size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Pemasok :
                                    </Text>
                                    <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { params.pemasok?.nama }
                                    </Text>
                                    <Text 
                                        lineHeight={'xs'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        { params.pemasok?.alamat }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <Airpods size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Barang Order :
                                    </Text>
                                    <Text 
                                        fontSize={18}
                                        lineHeight={'xs'}
                                        fontWeight={'semibold'}
                                        fontFamily={'Quicksand-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        { params.barang?.nama }
                                    </Text>
                                    <Text 
                                        fontWeight={'semibold'}
                                        fontFamily={'Dosis-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        { params.barang?.kode }
                                    </Text>
                                    <Text 
                                        fontWeight={'semibold'}
                                        fontFamily={'Farsan-Regular'}
                                        color={appcolor.teks[mode][1]}>
                                        PN : { params.barang?.num_part }
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <MoneySend size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Mata Uang :
                                    </Text>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { params.currency == 'IDR' ? 'RUPIAH' : 'US DOLLAR' }
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Farsan-Regular'}
                                            color={appcolor.teks[mode][params.metode === 'kredit'?5:3]}>
                                            { params.metode }
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                        {
                            params.currency == 'USD' &&
                            <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <HStack space={2} alignItems={'center'}>
                                    <UsdCoin size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            Harga USD :
                                        </Text>
                                        <HStack alignItems={'center'} justifyContent={'space-between'}>
                                            <Text 
                                                fontSize={18}
                                                lineHeight={'xs'}
                                                fontWeight={'semibold'}
                                                fontFamily={'Quicksand-Regular'}
                                                color={appcolor.teks[mode][1]}>
                                                $ { params.harga_usd }
                                            </Text>
                                            <Text 
                                                fontSize={14}
                                                lineHeight={'xs'}
                                                fontWeight={'semibold'}
                                                fontFamily={'Dosis-Medium'}
                                                color={appcolor.teks[mode][1]}>
                                                Rp. { (params.kurs)?.toLocaleString('ID') } / USD
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </VStack>
                        }
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <Bag2 size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Jumlah Order :
                                    </Text>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { params.qty_acc } { params.stn }
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            Rp. { (params.harga)?.toLocaleString('ID') },-
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <CreativeCommons size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Potongan :
                                    </Text>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            Rp. { (params.potongan)?.toLocaleString('ID') }
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <Bill size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Pajak :
                                    </Text>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { params.ppn } %
                                        </Text>
                                        <Text 
                                            fontSize={16}
                                            lineHeight={'xs'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            Rp. { (params.ppn_rp)?.toLocaleString('ID') || '0' },-
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <ShoppingCart size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Grand Total :
                                    </Text>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            Rp. { (params.subtotal)?.toLocaleString('ID') },-
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                        {
                            params.date_validated &&
                            <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <HStack space={2} alignItems={'center'}>
                                    <UserTick size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            User Validate :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { params.userValidate?.nama_lengkap || '???' }
                                        </Text>
                                        <Text 
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Dosis-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            { moment(params.date_validated).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        }
                        {
                            params.date_approved &&
                            <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                                <HStack space={2} alignItems={'center'}>
                                    <UserOctagon size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                    <VStack flex={1}>
                                        <Text 
                                            fontFamily={'Abel-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            User Approval :
                                        </Text>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { params.user_approved?.nama_lengkap || '???' }
                                        </Text>
                                        <Text 
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Dosis-Regular'}
                                            color={appcolor.teks[mode][2]}>
                                            { moment(params.date_approved).format('dddd, DD MMMM YYYY') }
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        }
                        <VStack py={5} borderBottomWidth={1} borderBottomColor={appcolor.line[mode][1]}>
                            <HStack space={2} alignItems={'center'}>
                                <MessageNotif size="40" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <VStack flex={1}>
                                    <Text 
                                        fontFamily={'Abel-Regular'}
                                        color={appcolor.teks[mode][2]}>
                                        Keterangan Item :
                                    </Text>
                                    <HStack alignItems={'center'} justifyContent={'space-between'}>
                                        <Text 
                                            fontSize={18}
                                            lineHeight={'xs'}
                                            fontWeight={'semibold'}
                                            fontFamily={'Quicksand-Regular'}
                                            color={appcolor.teks[mode][1]}>
                                            { params.description || '-' }
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </VStack>
                    </ScrollView>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ShowPurchaseRequestItem