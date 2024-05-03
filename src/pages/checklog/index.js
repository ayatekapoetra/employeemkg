import moment from 'moment'
import 'moment/locale/id'
import { TouchableOpacity, Dimensions, Platform } from 'react-native'
import { VStack, Text, Center, HStack } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { Scan } from 'iconsax-react-native'
import React, { useEffect, useMemo, useState } from 'react'
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { launchCamera } from 'react-native-image-picker'
import { getDistance } from 'geolib'
import Geolocation from '@react-native-community/geolocation'
import AppScreen from '../../components/AppScreen'
import HeaderScreen from '../../components/HeaderScreen'
import appcolor from '../../common/colorMode'
import AppAlertDevice from '../../components/AppAlertDevice'
import lokasiAbsensi from '../../../assets/json/lokasiAbsen.json'
import AlertCustom from '../../components/AlertCustom'
import { applyAlert } from '../../redux/alertSlice'
import apiFetch from '../../helpers/ApiFetch'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import LoadingHauler from '../../components/LoadingHauler'

const { width } = Dimensions.get("screen")

let lokasi = lokasiAbsensi.RECORDS

const ChecklogPage = () => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    const [ jarak, setJarak ] = useState(100)
    const [ currentClock, setCurrentClock ] = useState(moment().format("HH:mm:ss"))
    const [ myLocation, setMyLocation ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ isLogmasuk, setLogmasuk ] = useState(true)
    const [ isLogpulang, setLogpulang ] = useState(true)
    const [ location, setLocation ] = useState({
        latitude: -5.145109, //-5.196104, 119.459791
        longitude: 119.44856182,
    })

    useEffect(() => {
        Geolocation.getCurrentPosition(info => {
            // console.log(info);
            setMyLocation(info)
            setLocation({...location, latitude: info?.coords?.latitude, longitude: info?.coords?.longitude})
            
            let arr = lokasi.map( m => {
                var distance = getDistance(
                    { latitude: m.latitude, longitude: m.longitude }, 
                    { latitude: info?.coords?.latitude, longitude: info?.coords?.longitude }
                )
                return {
                    jarak: distance,
                    checkpoint: m.nama,
                    latitude: info?.coords?.latitude, 
                    longitude: info?.coords?.longitude
                }
            }).sort((a, b) => {return a.jarak - b.jarak})
                
            // console.log(arr);
            setJarak(arr[0])
        });
    }, [myLocation])

    useEffect(() => {
        setTimeout(() => setCurrentClock(moment().format("HH:mm:ss")), 1000);
    }, [currentClock])

    useEffect(() => {
        getDataInitial()
    }, [])

    const getDataInitial = async () => {
        try {
            const resp = await apiFetch.get(`mobile/checklog-today/${user.karyawan?.id || "0"}/${user.karyawan?.pin || "0"}`)
            console.log(resp);
            const result = resp.data
            if(!result.diagnostic.error){
                setLogmasuk(!result.data.checklog_in ? true:false)
                setLogpulang(!result.data.checklog_out ? true:false)
            }else{
                console.log(resp);
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    const riwayatAbsensiHandle = () => {
        route.navigate('Checklog-Absensi-Riwayat')
    }

    const selfyLogmasukHandle = async () => {
        setLoading(true)
        if(jarak.jarak >= 30){
            dispatch(
                applyAlert({
                    show: true, 
                    status: "warning", 
                    title: "Peringatan", 
                    subtitle: "Anda tidak berada pada radius lokasi absensi"
                })
            )
            setLoading(false)
            return
        }

        try {
            var data = new FormData()
            const result = await launchCamera({cameraType: "front"});
            const [ photo ] = result.assets

            const uuid = await AsyncStorage.getItem("@DEVICESID")
            const uriPhoto = Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
            
            data.append("pin", user.karyawan?.pin || '')
            data.append("karyawan_id", user.karyawan?.id || '')
            data.append("device_id", uuid)
            data.append('photo', {
                uri: uriPhoto,
                name: photo.fileName,
                type: photo.type
            });
            
            setLogmasuk(false)
            const resp = await apiFetch.post("mobile/check-in-mobile/karyawan", data, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  "Cache-Control": "no-cache",
                }
            })

            console.log(resp);

            if(resp.data.diagnostic.error){
                setLogmasuk(true)
                setLoading(false)
                dispatch(
                    applyAlert({
                        show: true, 
                        status: "error", 
                        title: "Peringatan", 
                        subtitle: "Anda gagal melakukan checklog...."
                    })
                )
                return
            }

            setLoading(false)
            dispatch(
                applyAlert({
                    show: true, 
                    status: "success", 
                    title: "Success", 
                    subtitle: `Anda berhasil melakukan checklog masuk pada pukul ${moment().format("HH:mm")}`
                })
            )
            
        } catch (error) {
            console.log(error);
            setLogmasuk(true)
            setLoading(false)
            dispatch(
                applyAlert({
                    show: true, 
                    status: "error", 
                    title: "Peringatan", 
                    subtitle: error.response.data.diagnostic.message || "Batal membuka kamera depan pada device anda...."
                })
            )
            return
        }
    }

    const selfyLogpulangHandle = async () => {
        setLoading(true)
        if(jarak.jarak >= 30){
            dispatch(
                applyAlert({
                    show: true, 
                    status: "warning", 
                    title: "Peringatan", 
                    subtitle: "Anda tidak berada pada radius lokasi absensi"
                })
            )
            return
        }

        try {
            var data = new FormData()
            const result = await launchCamera({cameraType: "front"});
            const [ photo ] = result.assets

            const uuid = await AsyncStorage.getItem("@DEVICESID")
            const uriPhoto = Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
            data.append("pin", user.karyawan.pin)
            data.append("karyawan_id", user.karyawan.id)
            data.append("device_id", uuid)
            data.append('photo', {
                uri: uriPhoto,
                name: photo.fileName,
                type: photo.type
            });
            
            setLogpulang(false)
            const resp = await apiFetch.post("mobile/check-out-mobile/karyawan", data, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  "Cache-Control": "no-cache",
                }
            })

            if(resp.data.diagnostic.error){
                setLogpulang(true)
                setLoading(false)
                dispatch(
                    applyAlert({
                        show: true, 
                        status: "error", 
                        title: "Peringatan", 
                        subtitle: "Anda gagal melakukan checklog...."
                    })
                )
                return
            }

            setLoading(false)
            dispatch(
                applyAlert({
                    show: true, 
                    status: "success", 
                    title: "Success", 
                    subtitle: `Anda berhasil melakukan checklog masuk pada pukul ${moment().format("HH:mm")}`
                })
            )
            
        } catch (error) {
            console.log(error);
            setLogpulang(true)
            setLoading(false)
            dispatch(
                applyAlert({
                    show: true, 
                    status: "error", 
                    title: "Peringatan", 
                    subtitle: error.message || "Batal membuka kamera depan pada device anda...."
                })
            )
            return
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <AppAlertDevice/>
                <HeaderScreen title={"Checklog Kehadiran"} onBack={true} onThemes={true} onNotification={true}/>
                { loading && <LoadingHauler/> }
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
                    {
                        isLogmasuk ?
                        <TouchableOpacity onPress={selfyLogmasukHandle}>
                            <HStack p={2} space={1} alignItems={"center"} bg={"#d1fae5"} rounded={"md"} shadow={2}>
                                <Scan size="32" color={appcolor.teks[mode][4]} variant="Bulk"/>
                                <Text 
                                    fontWeight={"600"}
                                    fontFamily={"Poppins-SemiBold"}>
                                    Checklog Masuk
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={riwayatAbsensiHandle}>
                            <HStack maxW={"170px"} p={2} space={1} alignItems={"center"} bg={"muted.100"} rounded={"md"} shadow={2}>
                                <Scan size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                <Text 
                                    fontWeight={"600"}
                                    fontFamily={"Poppins-SemiBold"}
                                    color={appcolor.teks[mode][2]}>
                                    Riwayat Masuk
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                    }
                    {
                        isLogpulang ?
                        <TouchableOpacity onPress={selfyLogpulangHandle}>
                            <HStack p={2} space={1} alignItems={"center"} bg={"#fecdd3"} rounded={"md"} shadow={2}>
                                <Scan size="32" color={appcolor.teks[mode][5]} variant="Bulk"/>
                                <Text 
                                    fontWeight={"600"}
                                    fontFamily={"Poppins-SemiBold"}>
                                    Checklog Pulang
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={riwayatAbsensiHandle}>
                            <HStack maxW={"170px"} p={2} space={1} alignItems={"center"} bg={"muted.100"} rounded={"md"} shadow={2}>
                                <Scan size="32" color={appcolor.teks[mode][2]} variant="Bulk"/>
                                <Text 
                                    fontWeight={"600"}
                                    fontFamily={"Poppins-SemiBold"}
                                    color={appcolor.teks[mode][2]}>
                                    Riwayat Pulang
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                    }
                </HStack>
                <VStack my={2} justifyContent={"center"} alignItems={"center"}>
                    {
                        jarak.jarak < 10 &&
                        <Text 
                            fontSize={12} 
                            fontWeight={"300"} 
                            fontFamily={"Poppins-Light"} 
                            color={appcolor.teks[mode][4]}>
                            Anda berada pada radius checklog {jarak.jarak} meter
                        </Text>
                    }
                    {
                        jarak.jarak >= 10 && jarak.jarak <= 30 &&
                        <Text 
                            fontSize={12} 
                            fontWeight={"300"} 
                            fontFamily={"Poppins-Light"} 
                            color={appcolor.teks[mode][3]}>
                            Anda berada pada radius checklog {jarak.jarak} meter
                        </Text>
                    }
                    {
                        jarak.jarak > 30 && 
                        <Text 
                            fontSize={12} 
                            fontWeight={"300"} 
                            fontFamily={"Poppins-Light"} 
                            color={appcolor.teks[mode][5]}>
                            Anda berada pada radius checklog {jarak.jarak} meter
                        </Text>
                    }
                </VStack>
                <VStack flex={1} bg={"amber.100"}>
                    <Center flex={1}>
                        <MapView
                            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                            style={{width: width, height: "100%"}}
                            showsMyLocationButton={true}
                            showsUserLocation={true}
                            region={{
                                ...location,
                                latitudeDelta: 0.002,
                                longitudeDelta: 0.002,
                            }}>
                            {
                                Platform.OS === 'ios' &&
                                lokasi?.map( m => {
                                    return (
                                        <Circle 
                                            key={m.id}
                                            strokeWidth={1}
                                            strokeColor={"red"}
                                            fillColor={"error.100"}
                                            center={{latitude: m.latitude, longitude: m.longitude}}
                                            radius={30}/>
                                    )
                                })
                            }
                            {
                                Platform.OS === 'ios' &&
                                lokasi?.map( m => {
                                    return ( 
                                        <Marker 
                                            key={m.id} 
                                            title={`Titik Checklog ${m.nama}`} 
                                            description={"Radius checklog untuk absensi"} 
                                            coordinate={{latitude: m.latitude, longitude: m.longitude}}/>
                                    )
                                })
                            }
                        </MapView>
                    </Center>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ChecklogPage