import { TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, Button, HStack, Image, Center } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const { height, width } = Dimensions.get('screen')

const ReportScreen = () => {
    const route = useNavigation()
    const mode = useSelector(state => state.themes.value)

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Laporan Operational"} onThemes={true} onFilter={null} onNotification={true}/>
                <VStack mx={3} flex={1}>
                    <HStack space={3} h={'100px'} justifyContent={'flex-start'} alignItems={'center'}>
                        <TouchableOpacity 
                            style={{flex: 1}} 
                            onPress={() => route.navigate('report-maintenances-equipment')}>
                            <VStack 
                                py={2} 
                                px={3} 
                                flex={1}
                                alignItems={'center'} 
                                justifyContent={'center'}
                                borderWidth={.5} 
                                rounded={'xl'}
                                // shadow={'2'}
                                borderStyle={'dotted'} 
                                borderColor={appcolor.line[mode][2]}>
                                <Image resizeMode="contain" source={require('../../../assets/images/technician.png')} alt='...' style={{ width: 50, height: 50 }}/>
                                <Text 
                                    textAlign={'center'} 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    Equipment Breakdown
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => route.navigate('report-stok-persediaan')}
                            style={{flex: 1}}>
                            <VStack 
                                py={2} 
                                px={3} 
                                flex={1}
                                alignItems={'center'} 
                                justifyContent={'center'}
                                borderWidth={.5} 
                                rounded={'xl'}
                                // shadow={'2'}
                                borderStyle={'dotted'} 
                                borderColor={appcolor.line[mode][2]}>
                                <Image resizeMode="contain" source={require('../../../assets/images/stock-barang.png')} alt='...' style={{ width: 50, height: 50 }}/>
                                <Text 
                                    textAlign={'center'} 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    Stock Persediaan
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate('report-standby-equipment')}>
                            <VStack 
                                py={2} 
                                px={3} 
                                flex={1}
                                alignItems={'center'} 
                                justifyContent={'center'}
                                borderWidth={.5} 
                                rounded={'xl'}
                                // shadow={'2'}
                                borderStyle={'dotted'} 
                                borderColor={appcolor.line[mode][2]}>
                                <Image resizeMode="contain" source={require('../../../assets/images/rep-standby1.png')} alt='...' style={{ width: 90, height: 55 }}/>
                                <Text 
                                    textAlign={'center'} 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    Laporan StandBy
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                    </HStack>
                    <HStack mt={3} space={3} h={'100px'} justifyContent={'flex-start'} alignItems={'center'}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate('report-purchasing-order')}>
                            <VStack 
                                py={2} 
                                px={3} 
                                flex={1}
                                alignItems={'center'} 
                                justifyContent={'center'}
                                borderWidth={.5} 
                                rounded={'xl'}
                                // shadow={'2'}
                                borderStyle={'dotted'} 
                                borderColor={appcolor.line[mode][2]}>
                                <Image resizeMode="cover" source={require('../../../assets/images/warehouse.png')} alt='...' style={{ width: 55, height: 50 }}/>
                                <Text 
                                    textAlign={'center'} 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    Purchase Monitoring
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex: 1}} onPress={() => route.navigate('report-shipping-order')}>
                            <VStack 
                                py={2} 
                                px={3} 
                                flex={1}
                                alignItems={'center'} 
                                justifyContent={'center'}
                                borderWidth={.5} 
                                rounded={'xl'}
                                // shadow={'2'}
                                borderStyle={'dotted'} 
                                borderColor={appcolor.line[mode][2]}>
                                <Image resizeMode="contain" source={require('../../../assets/images/delmon.png')} alt='...' style={{ width: 50, height: 50 }}/>
                                <Text 
                                    textAlign={'center'} 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    Shipping Monitoring
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex: 1}}>
                            <VStack 
                                py={2} 
                                px={3} 
                                flex={1}
                                alignItems={'center'} 
                                justifyContent={'center'}
                                borderWidth={.5} 
                                rounded={'xl'}
                                // shadow={'2'}
                                borderStyle={'dotted'} 
                                borderColor={appcolor.line[mode][2]}>
                                <Image resizeMode="contain" source={require('../../../assets/images/pamauaeu.png')} alt='...' style={{ width: 50, height: 50 }}/>
                                <Text 
                                    textAlign={'center'} 
                                    lineHeight={'xs'}
                                    fontFamily={'Abel-Regular'} 
                                    color={appcolor.teks[mode][2]}>
                                    Equipment Utility
                                </Text>
                            </VStack>
                        </TouchableOpacity>
                    </HStack>
                </VStack>
                <Center position={'absolute'} bottom={2} flex={2}>
                    <Image opacity={.2} source={require('../../../assets/images/illustration.png')} resizeMode='cover' alt='...' style={{width: width, height: 350}}/>
                </Center>
            </VStack>
        </AppScreen>
    )
}

export default ReportScreen