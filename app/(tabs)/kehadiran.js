import React from 'react';
import { VStack, Text, Center, ScrollView } from 'native-base';
import { AppScreen, HeaderScreen } from '../../src/components/common';

export default function KehadiranScreen() {
  return (
    <AppScreen>
      <HeaderScreen title="Riwayat Kehadiran" onThemes />
      <ScrollView flex={1}>
        <VStack flex={1} p={4} space={4}>
          <Center mt={10}>
            <Text fontSize="lg" fontFamily="Poppins-Light">
              Riwayat Checklog Harian
            </Text>
          </Center>
        </VStack>
      </ScrollView>
    </AppScreen>
  );
}
