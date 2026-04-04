import React from 'react';
import { HStack, Text } from 'native-base';
import { useSelector } from 'react-redux';
import { getCategoryData, getCategoryColor } from '../../../../src/utils/dailyBreakdown/utils';

/**
 * CategoryBadge Component
 * Displays breakdown category with icon and color
 * 
 * @param {string} kategori - Category value (MECHANICAL, ELECTRICAL, etc)
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} showLabel - Show category label text
 */
const CategoryBadge = ({ kategori, size = 'md', showLabel = true }) => {
  const mode = useSelector(state => state.themes)?.value || 'light';
  const categoryData = getCategoryData(kategori);
  const color = getCategoryColor(kategori, mode);
  
  if (!categoryData) return null;
  
  // Size configurations
  const sizeConfig = {
    sm: { px: 2, py: 1, fontSize: 10, iconSize: 12 },
    md: { px: 3, py: 1.5, fontSize: 11, iconSize: 14 },
    lg: { px: 4, py: 2, fontSize: 12, iconSize: 16 },
  };
  
  const config = sizeConfig[size] || sizeConfig.md;
  
  // Background color with opacity
  const bgColor = mode === 'dark' 
    ? `${color}20` 
    : `${color}10`;
  
  return (
    <HStack
      px={config.px}
      py={config.py}
      bg={bgColor}
      borderWidth={1}
      borderColor={color}
      borderRadius="full"
      alignItems="center"
      space={1}
    >
      <Text fontSize={config.iconSize}>
        {categoryData.icon}
      </Text>
      {showLabel && (
        <Text
          fontSize={config.fontSize}
          fontFamily="Quicksand-Medium"
          color={color}
          numberOfLines={1}
        >
          {categoryData.label}
        </Text>
      )}
    </HStack>
  );
};

export default CategoryBadge;
