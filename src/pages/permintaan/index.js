import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { VStack, Text, HStack, Image, Center } from 'native-base'
import { CalendarAdd, EmptyWalletTime, Hospital, NoteFavorite, ShieldTick } from 'iconsax-react-native'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import InformasiSakitScreen from './informasi-sakit/list'
import RequestCutiScreen from './request-cuti/list'
import RequestIzinScreen from './request-izin/list'
import RequestPanjarScreen from './request-panjar/list'


const PermintaanPage = () => {
    const mode = useSelector(state => state.themes).value
    const [ showLayer, setShowLayer ] = useState({sakit: true, cuti: false, izin: false, panjar: false})

    const switchLayerHandle = (name) => {
        if(name === 'sakit'){
            setShowLayer({sakit: true, cuti: false, izin: false, panjar: false})
        }else if(name==='cuti'){
            setShowLayer({sakit: false, cuti: true, izin: false, panjar: false})
        }else if(name==='izin'){
            setShowLayer({sakit: false, cuti: false, izin: true, panjar: false})
        }else{
            setShowLayer({sakit: false, cuti: false, izin: false, panjar: true})
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Permintaan Karyawan"} onBack={true} onThemes={true} onFilter={true} onNotification={true}/>
                <VStack flex={1}>
                    <HStack m={3} justifyContent={"space-around"}>
                        <TouchableOpacity onPress={() => switchLayerHandle('sakit')}>
                            <VStack h={"80px"} w={"80px"} bg={appcolor.box[mode]} alignItems={"center"} justifyContent={"center"} rounded={"md"} shadow={2}>
                                <Hospital size="50" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]} fontFamily={"Poppins-Regular"} fontSize={12}>Sakit</Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => switchLayerHandle('cuti')}>
                            <VStack h={"80px"} w={"80px"} bg={appcolor.box[mode]} alignItems={"center"} justifyContent={"center"} rounded={"md"} shadow={2}>
                                <NoteFavorite size="52" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]} fontFamily={"Poppins-Regular"} fontSize={12}>Cuti</Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => switchLayerHandle('izin')}>
                            <VStack h={"80px"} w={"80px"} bg={appcolor.box[mode]} alignItems={"center"} justifyContent={"center"} rounded={"md"} shadow={2}>
                                <ShieldTick size="52" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]} fontFamily={"Poppins-Regular"} fontSize={12}>Izin</Text>
                            </VStack>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => switchLayerHandle('panjar')}>
                            <VStack h={"80px"} w={"80px"} bg={appcolor.box[mode]} alignItems={"center"} justifyContent={"center"} rounded={"md"} shadow={2}>
                                <EmptyWalletTime size="52" color={appcolor.ico[mode][1]} variant="Bulk"/>
                                <Text color={appcolor.teks[mode][1]} fontFamily={"Poppins-Regular"} fontSize={12}>Panjar</Text>
                            </VStack>
                        </TouchableOpacity>
                    </HStack>
                </VStack>

                { showLayer.sakit && <InformasiSakitScreen mode={mode}/> }
                { showLayer.cuti && <RequestCutiScreen mode={mode}/> }
                { showLayer.izin && <RequestIzinScreen mode={mode}/> }
                { showLayer.panjar && <RequestPanjarScreen mode={mode}/> }
                
            </VStack>
        </AppScreen>
    )
}

export default PermintaanPage