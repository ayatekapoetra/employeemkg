import React from 'react';
import { VStack, Text, Center, ScrollView } from 'native-base';
import { AppScreen, HeaderScreen } from '../../src/components/common';

export default function TugaskuScreen() {
  return (
    <AppScreen>
      <HeaderScreen title="Tugasku" onThemes />
      <ScrollView flex={1}>
        <VStack flex={1} p={4} space={4}>
          <Center mt={10}>
            <Text fontSize="lg" fontFamily="Poppins-Light">
              Penugasan Karyawan
            </Text>
          </Center>
        </VStack>
      </ScrollView>
    </AppScreen>
  );
}
