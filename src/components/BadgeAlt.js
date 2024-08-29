import { View } from 'react-native'
import { Text, HStack } from 'native-base'
import { useSelector } from 'react-redux'
import React from 'react'
import appcolor from '../common/colorMode'

const BadgeAlt = ( { rounded, colorScheme, title, type } ) => {
    const mode = useSelector(state => state.themes.value)
    switch (type) {
        case "error":
            var color = {width: 15, height: 15, backgroundColor: "#ef4444", position: "absolute", borderRadius: 10, top: -8, right: 0}
            break;
        case "info":
            var color = {width: 15, height: 15, backgroundColor: "#0077e6", position: "absolute", borderRadius: 10, top: -8, right: 0}
            break;
        case "warning":
            var color = {width: 15, height: 15, backgroundColor: "#eab308", position: "absolute", borderRadius: 10, top: -8, right: 0}
            break;
        case "success":
            var color = {width: 15, height: 15, backgroundColor: "#10b981", position: "absolute", borderRadius: 10, top: -8, right: 0}
            break;
        case "danger":
            var color = {width: 15, height: 15, backgroundColor: "#eab308", position: "absolute", borderRadius: 10, top: -8, right: 0}
            break;
    }
    return (
        <HStack w={75} h={'22px'} px={1} rounded={rounded} bg={colorScheme} justifyContent={"center"}>
            <View style={{...color, borderWidth: 3, borderColor: appcolor.container[mode]}}/>
            <Text color={"#000"} fontWeight={500} fontFamily={"Dosis-Regular"}>{title}</Text>
        </HStack>
    )
}

export default BadgeAlt