import { View, SafeAreaView, StatusBar, ScrollView } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen';
import themeManager from '../common/themeScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
  
import React, { useEffect, useState } from 'react'
import LoginPage from '../pages/auth/LoginPage';
import AppStack from './AppStack';
import HomeScreen from '../pages/HomeScreen';
import { useSelector } from 'react-redux';

const RootNavigation = () => {
    const themes = useSelector(state => state.themes)
    const [ logging, setLogging ] = useState(null)
    const [ colorScheme, setColorScheme ] = useState('dark')
    const [ backgroundStyle, setBackgroundStyle ] = useState({backgroundColor: Colors.lighter})

    useEffect(() => {
        isUserLogging()
    }, [])

    useEffect(() => {
        initialScheme()
    }, [colorScheme])

    const isUserLogging = async () => {
        const isLogging = await AsyncStorage.getItem("@token")
        console.log("isLogging", isLogging);
    }
    
    const initialScheme = async () => {
        const initMode = await themeManager.get()
        setBackgroundStyle({backgroundColor: initMode === 'dark' ? Colors.darker : Colors.lighter})
        setColorScheme(initMode)
    }

    console.log("colorScheme", themes);


    return (
        <NavigationContainer>
            {logging ? <LoginPage/> : <AppStack themes={themes.value}/>}
        </NavigationContainer>
    )
}

export default RootNavigation