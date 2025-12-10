import React, { useEffect, useState } from 'react';
import { Text, HStack, VStack } from 'native-base';
import { PieChart } from 'react-native-gifted-charts';
import { Calendar2 } from 'iconsax-react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';

const pieData = [
  {
    value: 47,
    color: '#009FFF',
    gradientCenterColor: '#006DFF',
    focused: true,
    teks: 'Hadir',
  },
  { value: 40, color: '#93FCF8', gradientCenterColor: '#3BE9DE', teks: 'Tepat Waktu' },
  { value: 16, color: '#BDB2FA', gradientCenterColor: '#8F80F3', teks: 'Terlambat' },
  { value: 3, color: '#FFA5BA', gradientCenterColor: '#FF7F97', teks: 'Tidak Hadir' },
];

function HomeDonutChart() {
  const mode = useSelector(state => state.themes)?.value || 'light';
  const [data, setData] = useState(pieData);

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subTextColor = mode === 'dark' ? '#9a8f90' : '#b31e02';
  const innerCircleColor = mode === 'dark' ? '#2f313e' : '#F5F5F5';

  useEffect(() => {
    onGetDataChartHandle();
  }, []);

  const onGetDataChartHandle = async () => {
    try {
      const resp = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/absensi-score-chart`);
      console.log('Chart data:', resp.data);
      if (resp.data && Array.isArray(resp.data)) {
        setData(resp.data);
      }
    } catch (error) {
      console.log('Error fetching chart data:', error);
    }
  };

  return (
    <HStack flex={1} justifyContent="space-around" alignItems="center">
      <PieChart
        data={data}
        donut
        sectionAutoFocus
        radius={75}
        innerRadius={50}
        innerCircleColor={innerCircleColor}
        centerLabelComponent={() => {
          return (
            <VStack justifyContent="center" alignItems="center">
              <Text color={textColor} fontSize="2xl" fontFamily="Quicksand-Bold" fontWeight="bold">
                {data[0]?.value || 0}%
              </Text>
              <Text color={subTextColor} fontSize="sm" fontFamily="Poppins-Light">
                Kehadiran
              </Text>
            </VStack>
          );
        }}
      />
      <VStack space={2}>
        {data?.map((m, i) => {
          return (
            <HStack key={i} space={2} alignItems="center">
              <Calendar2 size="22" color={m.color} variant="Bulk" />
              <Text fontFamily="Poppins-Regular" fontSize={14} color={textColor}>
                {m.value}% {m?.teks || '???'}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </HStack>
  );
}

export default HomeDonutChart;
