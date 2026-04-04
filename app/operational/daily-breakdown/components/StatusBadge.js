import React from 'react';
import { HStack, Text } from 'native-base';
import { useSelector } from 'react-redux';
import { getStatusLabel, getStatusColors } from '../../../../src/utils/dailyBreakdown/utils';

/**
 * StatusBadge Component
 * Displays breakdown status with color-coded badge
 * 
 * @param {number} status - Status code (0, 1, 8, 9)
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} showIcon - Show icon indicator
 */
const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const mode = useSelector(state => state.themes)?.value || 'light';
  const colors = getStatusColors(status, mode);
  const label = getStatusLabel(status);
  
  // Size configurations
  const sizeConfig = {
    sm: { px: 2, py: 1, fontSize: 10, iconSize: 6 },
    md: { px: 3, py: 1.5, fontSize: 11, iconSize: 8 },
    lg: { px: 4, py: 2, fontSize: 12, iconSize: 10 },
  };
  
  const config = sizeConfig[size] || sizeConfig.md;
  
  // Status icons
  const getStatusIcon = () => {
    const icons = {
      0: '⏳',  // Waiting
      1: '📦',  // Waiting Part
      8: '🔄',  // In Progress
      9: '✅',  // Completed
    };
    return icons[status] || '❓';
  };
  
  return (
    <HStack
      px={config.px}
      py={config.py}
      bg={colors.bg}
      borderWidth={1}
      borderColor={colors.border}
      borderRadius="full"
      alignItems="center"
      space={1}
    >
      {showIcon && (
        <Text fontSize={config.fontSize}>
          {getStatusIcon()}
        </Text>
      )}
      <Text
        fontSize={config.fontSize}
        fontFamily="Quicksand-SemiBold"
        color={colors.text}
        numberOfLines={1}
      >
        {label}
      </Text>
    </HStack>
  );
};

export default StatusBadge;
