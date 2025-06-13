import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { VStack, Text, HStack } from 'native-base'
import HeaderScreen from '../../components/HeaderScreen'
import { Camera, DirectboxReceive, FolderOpen, GalleryFavorite, Map, Map1, Microphone2 } from 'iconsax-react-native'
import appcolor from '../../common/colorMode'
import { useDispatch, useSelector } from 'react-redux'

import AsyncStorage from '@react-native-async-storage/async-storage'
import PermissionApps from '../../common/permissionApps'
import { TouchableOpacity } from 'react-native'
import { getKaryawan } from '../../redux/karyawanSlice'
import { getPenyewa } from '../../redux/penyewaSlice'
import { getLokasiPit } from '../../redux/lokasiPitSlice'
import { getKegiatanPit } from '../../redux/kegiatanPitSlice'
import { getBarangRack } from '../../redux/barangRackSlice'
import { getEquipment } from '../../redux/equipmentSlice'
import { getGudang } from '../../redux/gudangSlice'
import { getBarang } from '../../redux/barangSlice'
import { getEvent } from '../../redux/eventSlice'
import { getPemasok } from '../../redux/pemasokSlice'
import { getOption } from '../../redux/sysOptionSlice'
import { getRoles } from '../../redux/roleOperationSlice'

const IzinAplikasi = () => {
    PermissionApps()
    const dispatch = useDispatch()
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

    const initDataRedux = async () => {
        const arrayKey = [
            '@pemasok', 
            '@equipment',
            '@karyawan',
            '@penyewa', 
            '@gudang',
            '@lokasi-absensi', 
            '@lokasi-pit', 
            '@kegiatan-pit',
            '@option',
            '@rack',
            '@event',
        ]
        
        try {
            await AsyncStorage.multiRemove(arrayKey)
            dispatch(getKaryawan())
            dispatch(getPenyewa())
            dispatch(getLokasiPit())
            dispatch(getKegiatanPit())
            dispatch(getBarangRack())
            dispatch(getEquipment())
            dispatch(getGudang())
            dispatch(getBarang())
            dispatch(getEvent())
            dispatch(getPemasok())
            dispatch(getOption())
            dispatch(getRoles())
          } catch(e) {
            console.log(e);
            alert('Err refresh data local...')
        }
    }

    return (
        <AppScreen>
            <VStack h={'full'}>
                <HeaderScreen title={"Izin Aplikasi"} onBack={true} onThemes={true} onNotification={true}/>
                <TouchableOpacity onPress={() => initDataRedux()}>
                    <HStack 
                        mx={3}
                        py={3} 
                        space={2} 
                        bg={'blueGray.100'}
                        rounded={'md'}
                        alignItems={'center'}>
                        <DirectboxReceive size="52" color="#787b83" variant="Bulk"/>
                        <VStack flex={1}>
                            <HStack alignItems={'center'} justifyContent={'space-between'}>
                                <Text 
                                    fontSize={18}
                                    fontWeight={'bold'}
                                    fontFamily={'Quicksand-Regular'}
                                    color={appcolor.teks[mode][5]}>
                                    LocalStorages
                                </Text>
                            </HStack>
                            <Text 
                                lineHeight={'xs'}
                                fontFamily={'Abel-Regular'}
                                color={appcolor.teks[mode][6]}>
                                Klik disini untuk melakukan pembaharuan data local pada handphone anda
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
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