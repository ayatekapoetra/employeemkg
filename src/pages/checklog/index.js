import moment from 'moment'
import 'moment/locale/id'
import { TouchableOpacity, Dimensions } from 'react-native'
import { VStack, Text, Center, HStack } from 'native-base'
import { useSelector } from 'react-redux'
import { Scan } from 'iconsax-react-native'
import React, { useState } from 'react'
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'

const { width } = Dimensions.get("screen")

let posistion = {
    latitude: -5.14515, //-5.196104, 119.459791
    longitude: 119.4479473,
}

const ChecklogPage = () => {
    const mode = useSelector(state => state.themes).value
    const [ currentClock, setCurrentClock ] = useState(moment().format("HH:mm:ss"))
    const [ location, setLocation ] = useState(posistion)
    console.log(moment().format("dddd, DD MMMM YYYY"));
    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Checklog Kehadiran"} onBack={true} onThemes={true} onNotification={true}/>
                <Center>
                    <Text fontSize={20} fontFamily={"Quicksand-Light"} color={appcolor.teks[mode][1]}>
                        {moment().format("dddd, DD MMMM YYYY")}
                    </Text>
                    <Text 
                        lineHeight={"xs"}
                        fontSize={"45"}
                        fontFamily={"Teko-Bold"}
                        color={appcolor.teks[mode][1]}>
                        {currentClock}
                    </Text>
                </Center>
                <HStack mx={3} alignItems={"center"} justifyContent={"space-around"}>
                    <TouchableOpacity>
                        <HStack p={2} space={1} alignItems={"center"} bg={"#d1fae5"} rounded={"md"} shadow={2}>
                            <Scan size="32" color={appcolor.teks[mode][4]} variant="Bulk"/>
                            <Text 
                                fontWeight={"600"}
                                fontFamily={"Poppins-SemiBold"}>
                                Checklog Masuk
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <HStack p={2} space={1} alignItems={"center"} bg={"#fecdd3"} rounded={"md"} shadow={2}>
                            <Scan size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>
                            <Text 
                                fontWeight={"600"}
                                fontFamily={"Poppins-SemiBold"}>
                                Checklog Pulang
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                </HStack>
                <VStack my={2} justifyContent={"center"} alignItems={"center"}>
                    <Text 
                        fontSize={12} 
                        fontWeight={"300"} 
                        fontFamily={"Poppins-Light"} 
                        color={appcolor.teks[mode][1]}>
                        Anda berada pada radius checklog 100 meter
                    </Text>
                </VStack>
                <VStack flex={1} bg={"amber.100"}>
                    <Center flex={1}>
                    <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        style={{width: width, height: "100%"}}
                        showsUserLocation={true}
                        region={{
                            ...location,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.002,
                        }}>
                        <Circle 
                                strokeWidth={.5}
                                strokeColor={"red"}
                                fillColor={"error.100"}
                                center={posistion}
                                radius={30}/>
                                
                        <Marker 
                            title={"Titik Checklog"}  
                            description={"Radius checklog untuk absensi"}  
                            coordinate={posistion}/>
                    </MapView>
                    </Center>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ChecklogPage