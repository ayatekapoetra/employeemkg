import { View } from 'react-native'
import { Text, HStack, VStack } from 'native-base'
import React, { useEffect, useState } from 'react'
import { PieChart } from "react-native-gifted-charts"
import { Calendar2 } from 'iconsax-react-native';
import appcolor from '../common/colorMode';
import { useSelector } from 'react-redux';
import apiFetch from '../helpers/ApiFetch';

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

const HomeDonutChart = () => {
    const mode = useSelector(state => state.themes.value)
    const [ data, setData ] = useState(pieData)

    useEffect(() => {
        onGetDataChartHandle()
    }, [])

    const onGetDataChartHandle = async () => {
        try {
            const resp = await apiFetch.get("absensi-score-chart")
            console.log(resp);
            setData(resp.data)
        } catch (error) {
            console.log(error);
        }
    }
  
    return (
        <HStack flex={1} justifyContent={"space-around"} alignItems={"center"}>
            <PieChart
                data={data}
                donut
                showGradient
                sectionAutoFocus
                radius={75}
                innerRadius={50}
                innerCircleColor={mode=='dark'?'#2f313e':'#F5F5F5'}
                centerLabelComponent={() => {
                return (
                    <VStack justifyContent={'center'} alignItems={'center'}>
                        <Text
                            color={appcolor.teks[mode][1]}
                            fontSize={'2xl'}
                            fontFamily={'Dosis'}
                            fontWeight={'bold'}>
                            { data[0].value }%
                        </Text>
                        <Text 
                            color={appcolor.teks[mode][2]}
                            fontSize={'sm'}>
                            Kehadiran
                        </Text>
                    </VStack>
                )}}/>
            <VStack space={2}>
                {
                    data?.map( (m, i) => {
                        return(
                            <HStack key={i} space={2} alignItems={"center"}>
                                <Calendar2 size="22" color={m.color} variant="Bulk"/>
                                <Text fontFamily={"Poppins-Regular"} fontSize={14} color={appcolor.teks[mode][1]}>
                                    {m.value}% {m?.teks || "???"}
                                </Text>
                            </HStack>
                        )
                    })
                }
            </VStack>
        </HStack>
    )
  }

export default HomeDonutChart