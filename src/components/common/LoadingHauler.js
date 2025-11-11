import React from 'react';
import { VStack, Spinner, Text, Center, useColorMode } from 'native-base';

const LoadingHauler = ({ message = 'Loading...', size = 'lg' }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Center flex={1} bg={isDark ? '#2f313e' : '#F5F5F5'}>
      <VStack space={4} alignItems="center">
        <Spinner size={size} color="primary.500" />
        <Text
          fontSize="md"
          fontFamily="Poppins-Light"
          color={isDark ? '#9a8f90' : '#666666'}
        >
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

export default LoadingHauler;
