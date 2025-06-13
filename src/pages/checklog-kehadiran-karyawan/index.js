import moment from 'moment'
import 'moment/locale/id'
import { TouchableOpacity, Dimensions, Platform, Alert, Linking } from 'react-native'
import { VStack, Text, Center, HStack, View, Image, Button, Stack } from 'native-base'
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
import { applyAlert } from '../../redux/alertSlice'
import apiFetch from '../../helpers/ApiFetch'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import LoadingHauler from '../../components/LoadingHauler'

import { Camera } from 'react-native-vision-camera';
import OpenCameraScreen from './openCamera'


const { width } = Dimensions.get("screen")

let lokasi = lokasiAbsensi.RECORDS

const config = {
    skipPermissionRequests: false,
    authorizationLevel: 'always',
    enableBackgroundLocationUpdates: true,
    locationProvider: 'auto'
}

Geolocation.setRNConfiguration(config)

const ChecklogPage = () => {
    const [openKamera, setOpenKamera] = useState({visible: false, metode: ''});
    const [ photo, setPhoto ] = useState(null)

    const route = useNavigation()
    const dispatch = useDispatch()
    const os = Platform.OS === 'android' ? { height: 25, width: 30, marginTop: 50, marginLeft: 25 } : { height: 25, width: 30 }
    const mode = useSelector(state => state.themes).value
    const { user } = useSelector(state => state.auth)
    const [jarak, setJarak] = useState(100)
    const [currentClock, setCurrentClock] = useState(moment().format("HH:mm:ss"))
    const [myLocation, setMyLocation] = useState(null)
    const [fakeGPS, setFakeGPS] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isLogmasuk, setLogmasuk] = useState(false)
    const [isLogpulang, setLogpulang] = useState(false)
    const [checklogPin, setChecklogPin] = useState(lokasi)
    const [location, setLocation] = useState({
        latitude: -5.145109, //-5.196104, 119.459791
        longitude: 119.44856182,
    })

    useEffect(() => {
        getDataPin()
    }, [])

    useEffect(() => {
        const requestPermission = async () => {
            const status = await Camera.requestCameraPermission();
            console.log(`Camera permission status: ${status}`);
            setHasPermission(status === 'granted');

            // Untuk Android, perlu meminta izin mikrofon jika menggunakan audio
            const microphoneStatus = await Camera.requestMicrophonePermission();
            console.log(`Microphone permission status: ${microphoneStatus}`);
        };

        requestPermission();
    }, []);

    const getDataPin = async () => {
        let arrPin = await AsyncStorage.getItem('@lokasi-absensi')
        if (arrPin) {
            arrPin = JSON.parse(arrPin)
            setChecklogPin(arrPin)
        }
    }

    useMemo(() => {
        Geolocation.getCurrentPosition(info => {
            setMyLocation(info.coords)
            setLocation({ ...location, latitude: info?.coords?.latitude, longitude: info?.coords?.longitude })

            let arr = checklogPin.map(m => {
                var distance = getDistance(
                    { latitude: m.latitude, longitude: m.longitude },
                    { latitude: info?.coords?.latitude, longitude: info?.coords?.longitude }
                )

                return {
                    jarak: distance,
                    site: m.site_id,
                    checkpoint: m.nama,
                    latitude: info?.coords?.latitude,
                    longitude: info?.coords?.longitude
                }
            }).sort((a, b) => { return a.jarak - b.jarak })

            setJarak(arr[0])

            if (info.mocked) {
                setFakeGPS(true)
                dispatch(
                    applyAlert({
                        show: true,
                        status: "warning",
                        title: "Peringatan",
                        subtitle: "Anda menggunakan lokasi samaran, segeralah bertaubat..."
                    })
                )
            }
        });
    }, [myLocation?.latitude, myLocation?.longitude])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentClock(moment().format("HH:mm:ss"));
        }, 1000);

        // Cleanup saat komponen unmount
        return () => clearInterval(interval);
    }, [currentClock])


    useEffect(() => {
        getDataInitial()
        return () => getDataInitial();
    }, [])

    const getDataInitial = async () => {
        // UPDATE STATE TOMBOL CHECKLOG
        try {
            const resp = await apiFetch.get(`mobile/checklog-today/${user.karyawan?.id || "0"}/${user.karyawan?.pin || "0"}`)
            const result = resp.data
            if (!result.diagnostic.error) {
                setLogmasuk(!result.data.checklog_in ? true : false)
                setLogpulang(!result.data.checklog_out ? true : false)
            } else {
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
        if (jarak.jarak >= 100) {
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
        setOpenKamera({visible: true, metode: 'in'})
    }

    const postCheckIn = async (photo) => {
        setLoading(true)
        try {
            var data = new FormData()
            if(photo){
                const uuid = await AsyncStorage.getItem("@DEVICESID")
                const uriPhoto = Platform.OS === "android" ? photo.path : photo.path.replace("file://", "")

                data.append("pin", user.karyawan?.pin || '')
                data.append("karyawan_id", user.karyawan?.id || '')
                data.append("device_id", uuid)

                // Generate filename jika tidak ada
                const timestamp = new Date().getTime()
                const fileName = photo.fileName || `photo_${timestamp}.jpg`
                
                // Tentukan MIME type berdasarkan path
                const getImageType = (path) => {
                    const extension = path.split('.').pop().toLowerCase()
                    switch(extension) {
                        case 'jpg':
                        case 'jpeg':
                            return 'image/jpeg'
                        case 'png':
                            return 'image/png'
                        case 'heic':
                            return 'image/heic'
                        default:
                            return 'image/jpeg'
                    }
                }

                const imageType = getImageType(photo.path)

                data.append('photo', {
                    uri: uriPhoto,
                    name: fileName,
                    type: imageType
                });

                setLogmasuk(false)
                const resp = await apiFetch.post(`mobile/check-in-mobile/karyawan`, data, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                      "Cache-Control": "no-cache",
                    }
                })

                if(resp.data.diagnostic.error){
                    setLogmasuk(true)
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

                setOpenKamera({visible: false, metode: ''})
                setLoading(false)
                dispatch(
                    applyAlert({
                        show: true, 
                        status: "success", 
                        title: "Success", 
                        subtitle: `Anda berhasil melakukan checklog masuk pada pukul ${moment().format("HH:mm")}`
                    })
                )
            }else{
                setLoading(false)
                dispatch(
                    applyAlert({
                        show: true, 
                        status: "error", 
                        title: "Peringatan", 
                        subtitle: "Anda gagal mengambil photo selfy..."
                    })
                )
                return
            }

        } catch (error) {
            setLogmasuk(true)
            setLoading(false)
            setOpenKamera({visible: false, metode: ''})
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
        if (jarak.jarak >= 100) {
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

        setOpenKamera({visible: true, metode: 'out'})
    }

    const postCheckOut = async (photo) => {
        setLoading(true)
        try {
            var data = new FormData()
            if(photo){
                const uuid = await AsyncStorage.getItem("@DEVICESID")
                const uriPhoto = Platform.OS === "android" ? photo.path : photo.path.replace("file://", "")

                data.append("pin", user.karyawan?.pin || '')
                data.append("karyawan_id", user.karyawan?.id || '')
                data.append("device_id", uuid)

                // Generate filename jika tidak ada
                const timestamp = new Date().getTime()
                const fileName = photo.fileName || `photo_${timestamp}.jpg`
                
                // Tentukan MIME type berdasarkan path
                const getImageType = (path) => {
                    const extension = path.split('.').pop().toLowerCase()
                    switch(extension) {
                        case 'jpg':
                        case 'jpeg':
                            return 'image/jpeg'
                        case 'png':
                            return 'image/png'
                        case 'heic':
                            return 'image/heic'
                        default:
                            return 'image/jpeg'
                    }
                }

                const imageType = getImageType(photo.path)

                data.append('photo', {
                    uri: uriPhoto,
                    name: fileName,
                    type: imageType
                });

                setLogmasuk(false)
                const resp = await apiFetch.post(`mobile/check-out-mobile/karyawan`, data, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                      "Cache-Control": "no-cache",
                    }
                })

                if(resp.data.diagnostic.error){
                    setLogmasuk(true)
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

                setOpenKamera({visible: false, metode: ''})
                setLoading(false)
                dispatch(
                    applyAlert({
                        show: true, 
                        status: "success", 
                        title: "Success", 
                        subtitle: `Anda berhasil melakukan checklog masuk pada pukul ${moment().format("HH:mm")}`
                    })
                )
            }else{
                setLoading(false)
                dispatch(
                    applyAlert({
                        show: true, 
                        status: "error", 
                        title: "Peringatan", 
                        subtitle: "Anda gagal mengambil photo selfy..."
                    })
                )
                return
            }

        } catch (error) {
            setLogmasuk(true)
            setLoading(false)
            setOpenKamera({visible: false, metode: ''})
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

    if(loading){
        return <LoadingHauler />
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <AppAlertDevice />
                <HeaderScreen title={"Checklog Kehadiran"} onBack={true} onThemes={true} onNotification={true} />
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
                {
                    openKamera.visible ?
                        <OpenCameraScreen 
                            postCheckIn={postCheckIn}
                            postCheckOut={postCheckOut}
                            photoPath={photo} 
                            metode={openKamera.metode}
                            setPhoto={setPhoto}/>
                        :
                        <VStack>
                            {
                                !fakeGPS &&
                                <HStack space={2} mx={3} alignItems={"center"} justifyContent={"space-around"}>
                                    {
                                        isLogmasuk ?
                                            <TouchableOpacity onPress={selfyLogmasukHandle} style={{ flex: 1 }}>
                                                <HStack p={2} space={1} alignItems={"center"} bg={"#d1fae5"} rounded={"md"} shadow={2}>
                                                    <Scan size="32" color={appcolor.teks[mode][4]} variant="Bulk" />
                                                    <Text
                                                        fontWeight={'semibold'}
                                                        fontFamily={"Dosis-SemiBold"}>
                                                        Checklog Masuk
                                                    </Text>
                                                </HStack>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={riwayatAbsensiHandle}>
                                                <HStack maxW={"170px"} p={2} space={1} alignItems={"center"} bg={"muted.100"} rounded={"md"} shadow={2}>
                                                    <Scan size="32" color={appcolor.teks[mode][2]} variant="Bulk" />
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
                                            <TouchableOpacity onPress={selfyLogpulangHandle} style={{ flex: 1 }}>
                                                <HStack p={2} space={1} alignItems={"center"} bg={"#fecdd3"} rounded={"md"} shadow={2}>
                                                    <Scan size="32" color={appcolor.teks[mode][5]} variant="Bulk" />
                                                    <Text
                                                        fontWeight={'semibold'}
                                                        fontFamily={"Dosis-SemiBold"}>
                                                        Checklog Pulang
                                                    </Text>
                                                </HStack>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={riwayatAbsensiHandle}>
                                                <HStack maxW={"170px"} p={2} space={1} alignItems={"center"} bg={"muted.100"} rounded={"md"} shadow={2}>
                                                    <Scan size="32" color={appcolor.teks[mode][2]} variant="Bulk" />
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
                            }
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
                                    jarak.jarak >= 10 && jarak.jarak <= 100 &&
                                    <Text
                                        fontSize={12}
                                        fontWeight={"300"}
                                        fontFamily={"Poppins-Light"}
                                        color={appcolor.teks[mode][3]}>
                                        Anda berada pada radius checklog {jarak.jarak} meter
                                    </Text>
                                }
                                {
                                    jarak.jarak > 100 &&
                                    <Text
                                        fontSize={12}
                                        fontWeight={"300"}
                                        fontFamily={"Poppins-Light"}
                                        color={appcolor.teks[mode][5]}>
                                        Anda berada pada radius checklog {jarak.jarak} meter
                                    </Text>
                                }
                            </VStack>
                        </VStack>

                }
                <VStack flex={1} bg={"amber.100"}>
                    <Center flex={1}>
                        {
                            myLocation &&
                            <MapView
                                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                                style={{ width: width, height: "100%" }}
                                showsMyLocationButton={true}
                                showsUserLocation={true}
                                region={{
                                    ...location,
                                    latitudeDelta: 0.002,
                                    longitudeDelta: 0.002,
                                }}>
                                {

                                    checklogPin?.map(m => {
                                        return (
                                            <View key={m.id}>
                                                <Circle
                                                    strokeWidth={1}
                                                    strokeColor={"red"}
                                                    fillColor={"error.100"}
                                                    center={{ latitude: m.latitude, longitude: m.longitude }}
                                                    radius={100} />
                                                <Marker
                                                    title={`Titik Checklog ${m.nama}`}
                                                    description={"Radius checklog untuk absensi"}
                                                    coordinate={{ ...m, latitude: parseFloat(m.latitude), longitude: parseFloat(m.longitude) }}>
                                                    <Image
                                                        alt='Pin'
                                                        source={require('../../../assets/images/finger-mechine.png')}
                                                        style={os} />
                                                </Marker>
                                            </View>
                                        )
                                    })
                                }
                                <Marker
                                    title={`Lokasi Saya...`}
                                    description={"Radius checklog untuk absensi"}
                                    coordinate={myLocation}>
                                    <Image
                                        alt='Pin'
                                        source={require('../../../assets/images/engineer-standing.png')}
                                        style={{ height: 65, width: 20 }} />
                                </Marker>
                            </MapView>
                        }
                    </Center>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default ChecklogPage