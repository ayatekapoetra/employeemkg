import React from 'react';
import { View } from 'react-native';
import { Box, Text, HStack, VStack } from 'native-base';
import { Svg, Circle, G } from 'react-native-svg';

const STATUS_CONFIG = {
  hadir: { color: '#4CAF50', label: 'Hadir' },
  terlambat: { color: '#FF9800', label: 'Telat' },
  cuti: { color: '#2196F3', label: 'Cuti' },
  izin: { color: '#9C27B0', label: 'Izin' },
  sakit: { color: '#E91E63', label: 'Sakit' },
  absen: { color: '#F44336', label: 'Alpha' },
};

function DonutChartSegment({ percentage, color, radius, strokeWidth, rotation, index }) {
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Circle
      cx={100}
      cy={100}
      r={radius}
      fill="transparent"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      rotation={rotation}
      origin="100, 100"
      strokeLinecap="butt"
    />
  );
}

function AttendanceDonutChart({ summary, isDark }) {
  const textColor = isDark ? '#F5F5F5' : '#2f313e';
  const cardBg = isDark ? '#2a2c3e' : '#ffffff';

  // Calculate total for percentage
  const total = Object.values(summary || {}).reduce((sum, val) => sum + (val || 0), 0);

  // Build chart data from summary
  const chartData = Object.entries(summary || {})
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      value: value,
      color: STATUS_CONFIG[key]?.color || '#9ca3af',
      label: STATUS_CONFIG[key]?.label || key,
    }));

  // If no data, show empty state
  if (total === 0 || chartData.length === 0) {
    return (
      <Box bg={cardBg} borderRadius={12} p={4} alignItems="center">
        <Text color={textColor} fontFamily="Poppins-Regular" fontSize="sm">
          Tidak ada data absensi
        </Text>
      </Box>
    );
  }

  // Calculate center text (show total present days)
  const presentDays = (summary?.hadir || 0) + (summary?.terlambat || 0);

  // SVG donut chart parameters
  const radius = 40;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments
  let currentRotation = -90; // Start from top
  const segments = chartData.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const rotation = currentRotation;
    currentRotation += (percentage / 100) * 360;
    return { ...item, percentage, rotation };
  });

  return (
    <Box bg={cardBg} borderRadius={12} p={4}>
      <HStack alignItems="center" justifyContent="space-between">
        {/* Donut Chart */}
        <Box width="140" height="140" alignItems="center" justifyContent="center">
          <Box position="absolute" width={200} height={200}>
            <Svg width="200" height="200" viewBox="0 0 200 200">
              {segments.map((segment, index) => (
                <DonutChartSegment
                  key={index}
                  percentage={segment.percentage}
                  color={segment.color}
                  radius={radius}
                  strokeWidth={strokeWidth}
                  rotation={segment.rotation}
                  index={index}
                />
              ))}
            </Svg>
          </Box>
          {/* Center Text */}
          <VStack alignItems="center" position="absolute">
            <Text
              fontSize={24}
              fontFamily="Quicksand-Bold"
              color={textColor}
              lineHeight={28}
            >
              {presentDays}
            </Text>
            <Text
              fontSize={10}
              fontFamily="Poppins-Regular"
              color={isDark ? '#9ca3af' : '#6b7280'}
            >
              Hadir
            </Text>
          </VStack>
        </Box>

        {/* Legend */}
        <VStack flex={1} ml={4} space={2}>
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            return (
              <HStack key={index} alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={2} flex={1}>
                  <Box
                    width={3}
                    height={3}
                    borderRadius={2}
                    bg={item.color}
                  />
                  <Text
                    fontSize="xs"
                    fontFamily="Poppins-Regular"
                    color={textColor}
                    flex={1}
                  >
                    {item.label}
                  </Text>
                </HStack>
                <HStack alignItems="flex-end" space={1} minWidth={50}>
                  <Text
                    fontSize="sm"
                    fontFamily="Quicksand-Bold"
                    color={textColor}
                    textAlign="right"
                  >
                    {item.value}
                  </Text>
                  <Text
                    fontSize="xs"
                    fontFamily="Poppins-Regular"
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    ({percentage}%)
                  </Text>
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      </HStack>
    </Box>
  );
}

export default AttendanceDonutChart;
