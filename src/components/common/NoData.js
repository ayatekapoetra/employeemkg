import React from 'react';
import { VStack, Text, Center, Image, useColorMode } from 'native-base';

const NoData = ({ 
  message = 'No data available', 
  description,
  icon 
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Center flex={1} px={6}>
      <VStack space={4} alignItems="center">
        {icon && (
          <Image
            source={icon}
            alt="No data"
            size="xl"
            resizeMode="contain"
          />
        )}
        <Text
          fontSize="lg"
          fontFamily="Quicksand-Bold"
          color={isDark ? '#F5F5F5' : '#2f313e'}
          textAlign="center"
        >
          {message}
        </Text>
        {description && (
          <Text
            fontSize="sm"
            fontFamily="Poppins-Light"
            color={isDark ? '#9a8f90' : '#666666'}
            textAlign="center"
          >
            {description}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

export default NoData;
