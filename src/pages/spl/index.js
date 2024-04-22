import { TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { VStack, HStack, Text } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import themeManager from '../../common/themeScheme'
import { applyTheme } from '../../redux/themeSlice'
import AppScreen from '../../components/AppScreen'
import ListPerintahLembur from './list'
import HeaderScreen from '../../components/HeaderScreen'

const PerintahLemburPage = () => {
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
                <HeaderScreen title={"Perintah Lembur"} onThemes={true} onFilter={true} onNotification={true}/>
                <VStack px={3} flex={1}>
                    <ListPerintahLembur/>
                </VStack>
            </VStack>
        </AppScreen>
    )
}

export default PerintahLemburPage