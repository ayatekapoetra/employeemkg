import { Colors } from 'react-native/Libraries/NewAppScreen';
import themeManager from '../common/themeScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import LoginPage from '../pages/_auth/LoginPage';
import AppStack from './AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';
import { PermissionsAndroid, Platform } from 'react-native';
import LoadingHauler from '../components/LoadingHauler';
import PermissionApps from '../common/permissionApps';

// import {requestMultiple, checkLocationAccuracy, PERMISSIONS, RESULTS} from 'react-native-permissions';


const RootNavigation = () => {
  
  PermissionApps()
  const dispatch = useDispatch()
  const themes = useSelector(state => state.themes)
  const { token, loading } = useSelector( state => state.auth)
  const [ logging, setLogging ] = useState(token)
  const [ colorScheme, setColorScheme ] = useState('dark')
  const [ backgroundStyle, setBackgroundStyle ] = useState({backgroundColor: Colors.lighter})

  
  useEffect(() => {
    isUserLogging()
  }, [token])
  
  useEffect(() => {
    initialScheme()
  }, [colorScheme])
  
  useEffect(() => {
    requestLocationPermission()
  }, [])

  const isUserLogging = async () => {
    const isLogging = await AsyncStorage.getItem("@token")
    const isUser = await AsyncStorage.getItem("@user")
    setLogging(isLogging)
    if(isLogging){
        const local = {
            data: {
                type: "bearer",
                token: isLogging
            },
            loading: true,
            user: JSON.parse(isUser)
        }
        dispatch(login.fulfilled(local))
    }
  }
  
  const initialScheme = async () => {
    const initMode = await themeManager.get()
    setBackgroundStyle({backgroundColor: initMode === 'dark' ? Colors.darker : Colors.lighter})
    setColorScheme(initMode)
  }
  const requestLocationPermission = async () => {
    if(Platform.OS != "ios"){
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: 'Cool Photo App Location Permission',
            message: 'Cool Photo App needs access to your camera ' +
              'so you can take awesome pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the location');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };
  
  if(loading){
      return(
          <LoadingHauler/>
      )
  }
  return (
      <NavigationContainer>
          {!logging ? <LoginPage/> : <AppStack themes={themes.value}/>}
      </NavigationContainer>
  )
}

export default RootNavigation