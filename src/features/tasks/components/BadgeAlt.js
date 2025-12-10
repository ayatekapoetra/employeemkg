import React from 'react';
import { Badge, Text } from 'native-base';

export default function BadgeAlt({ title, type, colorScheme, rounded }) {
  const getColorScheme = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return 'gray';
    }
  };

  return (
    <Badge colorScheme={getColorScheme()} rounded={rounded || 'md'} px={2} py={1}>
      <Text fontSize="xs" fontFamily="Poppins-SemiBold" color="white" textTransform="capitalize">
        {title}
      </Text>
    </Badge>
  );
}
