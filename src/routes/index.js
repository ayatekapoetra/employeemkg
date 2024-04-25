import { Colors } from 'react-native/Libraries/NewAppScreen';
import themeManager from '../common/themeScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import LoginPage from '../pages/auth/LoginPage';
import AppStack from './AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';

const RootNavigation = () => {
    
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const { token, user } = useSelector( state => state.auth)
    const [ logging, setLogging ] = useState(token)
    const [ colorScheme, setColorScheme ] = useState('dark')
    const [ backgroundStyle, setBackgroundStyle ] = useState({backgroundColor: Colors.lighter})

    useEffect(() => {
        isUserLogging()
    }, [token])

    useEffect(() => {
        initialScheme()
    }, [colorScheme])

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

    return (
        <NavigationContainer>
            {!logging ? <LoginPage/> : <AppStack themes={themes.value}/>}
        </NavigationContainer>
    )
}

export default RootNavigation