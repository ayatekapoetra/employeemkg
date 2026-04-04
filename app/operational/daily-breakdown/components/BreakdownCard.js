import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { VStack, HStack, Text, Badge, Box } from 'native-base';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { formatBreakdownTime, getRelativeTime, formatEquipmentName, calculateDuration } from '../../../../src/utils/dailyBreakdown/utils';
import { COLORS } from '../../../../src/constants/colors';
import { Tools, Time, Calendar, ArrowRight2, User } from 'iconsax-react-native';

/**
 * BreakdownCard Component
 * Card component for displaying breakdown in list
 * 
 * @param {object} breakdown - Breakdown data object
 * @param {function} onPress - Custom onPress handler (optional)
 */
const BreakdownCard = ({ breakdown, onPress }) => {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  
  const cardBg = mode === 'dark' ? '#3a3c4a' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#5e5f6cff' : '#e5e7eb';
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const dividerColor = mode === 'dark' ? '#4b5563' : '#e5e7eb';
  
  const handlePress = () => {
    if (onPress) {
      onPress(breakdown);
    } else {
      router.push(`/operational/daily-breakdown/detail?id=${breakdown.id}`);
    }
  };
  
  // Get first item for preview
  const firstItem = breakdown.items && breakdown.items.length > 0 ? breakdown.items[0] : null;
  const itemsCount = breakdown.items?.length || 0;
  
  // Calculate duration
  const duration = calculateDuration(breakdown.breakdown_at, breakdown.ready_at);
  
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <VStack
        bg={cardBg}
        p={4}
        rounded="xl"
        borderWidth={1}
        borderColor={cardBorder}
        shadow={2}
        space={3}
      >
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack space={3} flex={1}>
            <VStack
              bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
              p={3}
              rounded="xl"
              justifyContent="center"
              alignItems="center"
            >
              <Tools size={24} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} variant="Bold" />
            </VStack>

            <VStack flex={1} space={1}>
              <Text
                fontSize="lg"
                fontFamily="Quicksand-Bold"
                color={textColor}
                numberOfLines={1}
              >
                {formatEquipmentName(breakdown.equipment)}
              </Text>
              <Text
                fontSize="xs"
                fontFamily="Poppins-Regular"
                color={subtitleColor}
                numberOfLines={2}
              >
                {firstItem?.problem || 'No problem description'}
              </Text>
            </VStack>
          </HStack>

          <VStack space={1} alignItems="flex-end">
            <StatusBadge status={breakdown.status} size="medium" />
            {breakdown.smu && (
              <Badge
                bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
                rounded="md"
                _text={{
                  fontSize: 9,
                  fontFamily: 'Quicksand-SemiBold',
                  color: subtitleColor,
                }}
              >
                SMU: {breakdown.smu}h
              </Badge>
            )}
          </VStack>
        </HStack>

        <HStack space={3} flexWrap="wrap">
          <HStack space={1} alignItems="center">
            <Calendar size={14} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {formatBreakdownTime(breakdown.breakdown_at, 'DD MMM YYYY')}
            </Text>
          </HStack>

          <HStack space={1} alignItems="center">
            <Time size={14} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {getRelativeTime(breakdown.breakdown_at)}
            </Text>
          </HStack>

          <HStack space={1} alignItems="center">
            <Box w={2} h={2} bg={subtitleColor} rounded="full" />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {itemsCount} item
            </Text>
          </HStack>
        </HStack>

        <VStack 
          bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}
          p={2}
          rounded="lg"
          space={1}
        >
          <HStack justifyContent="space-between">
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Status:
            </Text>
            <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
              {duration.text}
            </Text>
          </HStack>

          <HStack space={1} alignItems="center">
            <VStack flex={1} bg={mode === 'dark' ? '#374151' : '#e5e7eb'} h={1.5} rounded="full">
              <VStack 
                w={`${breakdown.status === 9 ? '100%' : breakdown.status === 8 ? '75%' : breakdown.status === 1 ? '50%' : '25%'}`}
                bg={mode === 'dark' ? '#3b82f6' : '#2563eb'}
                h={1.5}
                rounded="full"
              />
            </VStack>
          </HStack>
        </VStack>

        <HStack justifyContent="space-between" alignItems="center" mt={1}>
          <HStack space={1} alignItems="center">
            <User size={14} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {breakdown.creator?.name || breakdown.creator?.nama || '-'}
            </Text>
          </HStack>

          <HStack space={1} alignItems="center">
            <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
              Lihat Detail
            </Text>
            <ArrowRight2 size={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
          </HStack>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};

export default BreakdownCard;
