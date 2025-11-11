import React from 'react';
import { VStack, useColorMode } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppScreen = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#2f313e' : '#F5F5F5',
      }}
    >
      <VStack flex={1} bg={isDark ? '#2f313e' : '#F5F5F5'} {...props}>
        {children}
      </VStack>
    </SafeAreaView>
  );
};

export default AppScreen;
