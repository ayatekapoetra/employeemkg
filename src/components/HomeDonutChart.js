import { View } from 'react-native'
import { Center, Button, Text, Flex, HStack, Image } from 'native-base'
import React from 'react'
import { PieChart } from "react-native-gifted-charts"
import { Calendar2 } from 'iconsax-react-native';


const HomeDonutChart = () => {
    const pieData = [
        {
            value: 47,
            color: '#009FFF',
            gradientCenterColor: '#006DFF',
            focused: true,
        },
        {value: 40, color: '#93FCF8', gradientCenterColor: '#3BE9DE'},
        {value: 16, color: '#BDB2FA', gradientCenterColor: '#8F80F3'},
        {value: 3, color: '#FFA5BA', gradientCenterColor: '#FF7F97'},
    ];
  
    return (
        <Center>
            <PieChart
                data={pieData}
                donut
                showGradient
                sectionAutoFocus
                radius={120}
                innerRadius={60}
                innerCircleColor={'#2f313e'}
                centerLabelComponent={() => {
                return (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                        style={{fontSize: 22, color: 'white', fontWeight: 'bold'}}>
                        47%
                    </Text>
                    <Text style={{fontSize: 14, color: 'white'}}>Kehadiran</Text>
                    </View>
                )}}/>
            <HStack my={3} space={2}>
                <HStack space={2} alignItems={"center"}>
                    <Calendar2 size="18" color="#009FFF" variant="Bulk"/>
                    <Text fontFamily={"Poppins-Regular"} fontSize={10} color={"#009FFF"}>47% Hadir</Text>
                </HStack>
                <HStack space={2} alignItems={"center"}>
                    <Calendar2 size="18" color="#79d4d0" variant="Bulk"/>
                    <Text fontFamily={"Poppins-Regular"} fontSize={10} color={"#79d4d0"}>40% Cuti</Text>
                </HStack>
                <HStack space={2} alignItems={"center"}>
                    <Calendar2 size="18" color="#BDB2FA" variant="Bulk"/>
                    <Text fontFamily={"Poppins-Regular"} fontSize={10} color={"#BDB2FA"}>17% Sakit</Text>
                </HStack>
            </HStack>
            <HStack space={2}>
                <HStack space={2} alignItems={"center"}>
                    <Calendar2 size="18" color="#FFA5BA" variant="Bulk"/>
                    <Text fontFamily={"Poppins-Regular"} fontSize={10} color={"#FFA5BA"}>4% Alpha</Text>
                </HStack>
            </HStack>
        </Center>
    )
  }

export default HomeDonutChart