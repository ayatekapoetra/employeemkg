import { TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppScreen from '../../components/AppScreen'
import { HStack, VStack, Text } from 'native-base'
import { Moon, Notification, Sun1 } from 'iconsax-react-native'
import { useDispatch, useSelector } from 'react-redux'
import themeManager from '../../common/themeScheme'
import { applyTheme } from '../../redux/themeSlice'
import AgendaScreen from './AgendaScreen'
import HeaderScreen from '../../components/HeaderScreen'

const RiwayatAbsensiPage = () => {
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const [ colorTheme, setColorTheme ] = useState(themes.value)

    useEffect(() => {
        initialScheme()
    }, [])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        dispatch(applyTheme(initMode))
        setColorTheme(initMode)
    }

    const handleChangeScheme = async () => {
        const initMode = await themeManager.get()
        if(initMode === 'dark'){
            dispatch(applyTheme("light"))
            await themeManager.set("light")
            setColorTheme('light')
        }else{
            dispatch(applyTheme("dark"))
            await themeManager.set("dark")
            setColorTheme('dark')
        }
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Riwayat Kehadiran"} onBack={true} onThemes={true} onFilter={true} onNotification={true}/>
                <AgendaScreen isDark={colorTheme === 'dark'} mode={themes.value}/>
            </VStack>
        </AppScreen>
    )
}

export default RiwayatAbsensiPage