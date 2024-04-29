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
import FilterKehadiran from './filterKehadiran'

const RiwayatAbsensiPage = () => {
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const [ colorTheme, setColorTheme ] = useState(themes.value)
    const [ openFilter, setOpenFilter ] = useState(false)

    useEffect(() => {
        initialScheme()
    }, [])

    const initialScheme = async () => {
        const initMode = await themeManager.get()
        dispatch(applyTheme(initMode))
        setColorTheme(initMode)
    }

    const onOpenFilterHandle = () => {
        setOpenFilter(!openFilter)
    }

    return (
        <AppScreen>
            <VStack h={"full"}>
                <HeaderScreen title={"Riwayat Kehadiran"} onBack={true} onThemes={true} onFilter={onOpenFilterHandle} onNotification={true}/>
                
                <AgendaScreen isDark={colorTheme === 'dark'} mode={themes.value} openFilter={openFilter} setOpenFilter={setOpenFilter}/>
            </VStack>
        </AppScreen>
    )
}

export default RiwayatAbsensiPage