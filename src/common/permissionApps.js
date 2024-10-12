import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useMemo } from 'react'
import { Platform } from 'react-native';
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';

const PermissionApps = () => {

    const MINTA_IZIN_APLIKASI = useMemo(() => {
        requestMultiple([
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.LOCATION_ALWAYS,
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
            PERMISSIONS.IOS.MEDIA_LIBRARY,
            PERMISSIONS.IOS.PHOTO_LIBRARY,
            PERMISSIONS.IOS.MICROPHONE,
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
            PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
          ]).then(async(statuses) => {
            console.log(Platform.OS);
            if(Platform.OS === 'ios'){
              let DATA = {
                "CAMERA": statuses[PERMISSIONS.IOS.CAMERA],
                "LOCATION_ALWAYS": statuses[PERMISSIONS.IOS.LOCATION_ALWAYS],
                "LOCATION_WHEN_IN_USE": statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
                "MEDIA_LIBRARY": statuses[PERMISSIONS.IOS.MEDIA_LIBRARY],
                "PHOTO_LIBRARY": statuses[PERMISSIONS.IOS.PHOTO_LIBRARY],
                "MICROPHONE": statuses[PERMISSIONS.IOS.MICROPHONE],
              }
              console.log('cmcmcmcmcmcmcmcmcmcmcmcmcm', DATA);
              await AsyncStorage.setItem("#izinaplikasi", JSON.stringify(DATA))
            }else{
              let DATA = {
                "CAMERA": statuses[PERMISSIONS.ANDROID.CAMERA],
                "MEDIA_LIBRARY": statuses[PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION],
                "LOCATION_ALWAYS": statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
                "LOCATION_WHEN_IN_USE": statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION],
                "PHOTO_LIBRARY": statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
                "MICROPHONE": statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE],
              }
              console.log('cmcmcmcmcmcmcmcmcmcmcmcmcm', DATA);
              await AsyncStorage.setItem("#izinaplikasi", JSON.stringify(DATA))
            }
          });
    }, [])

    return MINTA_IZIN_APLIKASI
}

export default PermissionApps