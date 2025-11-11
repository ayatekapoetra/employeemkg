import React from 'react';
import { VStack, Text, Center, ScrollView, Button } from 'native-base';
import { useColorMode } from 'native-base';
import { AppScreen, HeaderScreen } from '../../src/components/common';
import { useDispatch } from 'react-redux';
import { applyAlert } from '../../src/store/slices/alertSlice';

export default function SettingScreen() {
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useDispatch();
  const isDark = colorMode === 'dark';

  const testAlert = (status) => {
    dispatch(applyAlert({
      show: true,
      status: status,
      title: `${status.toUpperCase()} Alert`,
      subtitle: `This is a test ${status} alert message`,
      duration: 3000,
    }));
  };

  return (
    <AppScreen>
      <HeaderScreen title="Settings" onThemes />
      <ScrollView flex={1}>
        <VStack flex={1} p={4} space={4}>
          <Center mt={4}>
            <Text fontSize="md" fontFamily="Poppins-Light" mb={4}>
              Pengaturan Aplikasi
            </Text>

            <VStack space={3} w="full" maxW="300px">
              <Button
                onPress={toggleColorMode}
                colorScheme="secondary"
              >
                Toggle {isDark ? 'Light' : 'Dark'} Mode
              </Button>

              <Text fontSize="sm" fontFamily="Quicksand-Bold" mt={4} mb={2}>
                Test Alerts:
              </Text>

              <Button
                onPress={() => testAlert('success')}
                colorScheme="success"
                size="sm"
              >
                Success Alert
              </Button>

              <Button
                onPress={() => testAlert('error')}
                colorScheme="error"
                size="sm"
              >
                Error Alert
              </Button>

              <Button
                onPress={() => testAlert('warning')}
                colorScheme="warning"
                size="sm"
              >
                Warning Alert
              </Button>

              <Button
                onPress={() => testAlert('info')}
                colorScheme="info"
                size="sm"
              >
                Info Alert
              </Button>
            </VStack>
          </Center>
        </VStack>
      </ScrollView>
    </AppScreen>
  );
}
