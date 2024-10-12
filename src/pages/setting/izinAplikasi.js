import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { Camera, FolderOpen, GalleryFavorite, Map, Map1, Microphone2 } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useSelector } from 'react-redux'

import AsyncStorage from '@react-native-async-storage/async-storage'
import PermissionApps from '../../common/permissionApps'

const IzinAplikasi = () => {
    PermissionApps()
    const mode = useSelector(state => state.themes.value)
    const [ izin, setIzin ] = useState(null)

    useEffect(() => {
        requestPermissionDevices()
    }, [])

    const requestPermissionDevices = async () => {
        try {
            const storage = await AsyncStorage.getItem('#izinaplikasi')
            if(storage){
                setIzin(JSON.parse(storage))
            }
        } catch (error) {
            alert(error)
        }
    }
    // console.log('-----------', izin);


    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Izin Aplikasi"} onBack={true} onThemes={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <HStack 
                        py={3} 
                        space={2} 
                        alignItems={'center'} 
                        borderBottomWidth={.5} 
                        borderBottomColor={appcolor.line[mode][2]}>
                        <Camera size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Kamera
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {(izin?.CAMERA)?.toUpperCase()}
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Izin mengakses kamera pengguna untuk mangambil foto pengguna
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack 
                        py={3} 
                        space={2} 
                        alignItems={'center'} 
                        borderBottomWidth={.5} 
                        borderBottomColor={appcolor.line[mode][2]}>
                        <Map size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Lokasi
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {(izin?.LOCATION_WHEN_IN_USE)?.toUpperCase()}
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Izin mengakses lokasi pengguna untuk menentukan titik gps pengguna
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack 
                        py={3} 
                        space={2} 
                        alignItems={'center'} 
                        borderBottomWidth={.5} 
                        borderBottomColor={appcolor.line[mode][2]}>
                        <Map1 size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Lokasi Presisi
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {(izin?.LOCATION_ALWAYS)?.toUpperCase()}
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Izin mengakses lokasi pengguna secara presisi untuk menentukan titik gps pengguna secara real time
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack 
                        py={3} 
                        space={2} 
                        alignItems={'center'} 
                        borderBottomWidth={.5} 
                        borderBottomColor={appcolor.line[mode][2]}>
                        <Microphone2 size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Microphone
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {(izin?.MICROPHONE)?.toUpperCase()}
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Izin mengakses microphone pengguna sebagai tambahan fitur akses camera
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack 
                        py={3} 
                        space={2} 
                        alignItems={'center'} 
                        borderBottomWidth={.5} 
                        borderBottomColor={appcolor.line[mode][2]}>
                        <GalleryFavorite size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Gallery
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {(izin?.PHOTO_LIBRARY)?.toUpperCase()}
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Izin mengakses media photo/library pengguna sebagai tambahan fitur akses camera
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack 
                        py={3} 
                        space={2} 
                        alignItems={'center'} 
                        borderBottomWidth={.5} 
                        borderBottomColor={appcolor.line[mode][2]}>
                        <FolderOpen size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    Arsip
                                </Text>
                                <Text 
                                    fontSize={16}
                                    fontWeight={'semibold'}
                                    fontFamily={'Dosis-Regular'}
                                    color={appcolor.teks[mode][1]}>
                                    {(izin?.MEDIA_LIBRARY)?.toUpperCase()}
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][2]}>
                                Izin mengakses file arsip pengguna sebagai tambahan fitur akses camera
                            </Text>
                        </VStack>
                    </HStack>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default IzinAplikasi