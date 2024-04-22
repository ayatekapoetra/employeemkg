import { TouchableOpacity } from 'react-native'
import { HStack, Text } from 'native-base'
import { Moon, Notification, Sun1, ArrowCircleLeft2, Filter } from 'iconsax-react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { applyTheme } from '../redux/themeSlice'
import React, { useEffect, useState } from 'react'
import themeManager from '../common/themeScheme'
import appcolor from '../common/colorMode'

const HeaderScreen = ( { title, onBack, onThemes, onFilter, onNotification } ) => {
    const route = useNavigation()
    const dispatch = useDispatch()
    const themes = useSelector(state => state.themes)
    const mode = useSelector(state => state.themes).value
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

    const handleBackScreen = () => {
        route.goBack()
    }

    return (
        <HStack px={3} alignItems={"center"} justifyContent={"space-between"}>
            {
                onBack ?
                <TouchableOpacity onPress={handleBackScreen}>
                    <HStack space={2} alignItems={"center"}>
                        <ArrowCircleLeft2 size="28" color={colorTheme === 'dark'?"#d9e3f0":"#2f313e"} variant="Bulk"/>
                        <Text fontSize={20} fontFamily={"Abel-Regular"} color={appcolor.teks[mode][1]}>
                            { title || 'XXXXX' }
                        </Text>
                    </HStack>
                </TouchableOpacity>
                :
                <HStack space={2} alignItems={"center"}>
                    <Text fontSize={20} fontFamily={"Abel-Regular"} color={appcolor.teks[mode][1]}>
                        { title || 'XXXXX' }
                    </Text>
                </HStack>
            }
            <HStack space={2} h={"50px"} alignItems={"center"} justifyContent={"flex-end"}>
                {
                    onThemes &&
                    <TouchableOpacity onPress={handleChangeScheme}>
                        {
                            colorTheme === 'dark' ?
                            <Sun1 size="25" color={"#efb539"} variant="Bold"/>
                            :
                            <Moon size="25" color={"#4f4c46"} variant="Bold"/>
                        }
                    </TouchableOpacity>
                }

                {
                    onFilter &&
                    <TouchableOpacity>
                        {
                            colorTheme === 'dark' ?
                            <Filter size="25" color={"#efb539"}/>
                            :
                            <Filter size="25" color={"#4f4c46"}/>
                        }
                    </TouchableOpacity>
                }

                {
                    onNotification &&
                    <TouchableOpacity>
                        <HStack h={"10px"} w={"10px"} position={"absolute"} bg={"error.500"} rounded={"full"} zIndex={99} right={0}/>
                        {
                            colorTheme === 'dark' ?
                            <Notification size="25" color={"#efb539"}/>
                            :
                            <Notification size="25" color={"#4f4c46"}/>
                        }
                    </TouchableOpacity>
                }
            </HStack>
        </HStack>
    )
}

export default HeaderScreen