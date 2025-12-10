import React, { useRef, useState } from 'react';
import { Keyboard, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { HStack, VStack, Text, Button } from 'native-base';
import { ArrowRight2, CloseSquare, ToggleOffCircle, UserTag, Barcode, CalendarCircle } from 'iconsax-react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { DatePickerModal } from '../../../components/common';

const taskStatus = [
  { id: 1, value: '', nama: 'Semua Status' },
  { id: 2, value: 'active', nama: 'Tugas Baru' },
  { id: 3, value: 'check', nama: 'Tugas Diterima' },
  { id: 4, value: 'done', nama: 'Tugas Selesai' },
  { id: 5, value: 'reject', nama: 'Tugas Ditolak' },
];

export default function FilterTugasKu({ state, setState, resetFilter, applyFilter }) {
  const kodeRef = useRef();
  const mode = useSelector(state => state.themes.value);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subTextColor = mode === 'dark' ? '#9a8f90' : '#6b7280';
  const lineColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';

  return (
    <VStack flex={1}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <VStack flex={1}>
          <TouchableOpacity onPress={() => console.log('Select status')}>
            <HStack
              p={2}
              mb={3}
              space={2}
              borderWidth={0.5}
              alignItems="center"
              borderStyle="dashed"
              borderColor={lineColor}
              rounded="md"
            >
              <ToggleOffCircle size="32" color={textColor} />
              <HStack flex={1} justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontFamily="Abel-Regular" color={subTextColor}>
                    Status Tugas :
                  </Text>
                  <Text lineHeight="xs" fontSize="lg" fontWeight="semibold" fontFamily="Poppins-SemiBold" color={textColor}>
                    {state.stsObject?.nama || 'Semua Status'}
                  </Text>
                </VStack>
                <ArrowRight2 size="15" color={subTextColor} />
              </HStack>
            </HStack>
          </TouchableOpacity>

          <HStack
            p={2}
            mb={3}
            space={2}
            borderWidth={0.5}
            alignItems="center"
            borderStyle="dashed"
            borderColor={lineColor}
            rounded="md"
          >
            <UserTag size="32" color={textColor} />
            <HStack flex={1} justifyContent="space-between" alignItems="center">
              <VStack flex={1}>
                <Text fontFamily="Abel-Regular" color={subTextColor}>
                  Pemberi Tugas :
                </Text>
                <TextInput
                  ref={kodeRef}
                  placeholder="Ketik nama pemberi tugas..."
                  placeholderTextColor={subTextColor}
                  value={state.nmassigner || null}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={teks => setState({ ...state, nmassigner: teks })}
                  style={{
                    height: 30,
                    fontSize: 18,
                    fontFamily: 'Poppins-SemiBold',
                    alignItems: 'center',
                    color: textColor,
                  }}
                />
              </VStack>
              {state.nmassigner && (
                <TouchableOpacity onPress={() => setState({ ...state, nmassigner: '' })}>
                  <CloseSquare size="25" color="#ef4444" variant="Bulk" />
                </TouchableOpacity>
              )}
            </HStack>
          </HStack>

          <HStack
            p={2}
            mb={3}
            space={2}
            borderWidth={0.5}
            alignItems="center"
            borderStyle="dashed"
            borderColor={lineColor}
            rounded="md"
          >
            <Barcode size="32" color={textColor} />
            <HStack flex={1} justifyContent="space-between" alignItems="center">
              <VStack flex={1}>
                <Text fontFamily="Abel-Regular" color={subTextColor}>
                  Kode Tugas :
                </Text>
                <TextInput
                  placeholder="Ketik kode tugas..."
                  placeholderTextColor={subTextColor}
                  value={state.kode || null}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={teks => setState({ ...state, kode: teks })}
                  style={{
                    height: 30,
                    fontSize: 18,
                    fontFamily: 'Poppins-SemiBold',
                    alignItems: 'center',
                    color: textColor,
                  }}
                />
              </VStack>
              {state.kode && (
                <TouchableOpacity onPress={() => setState({ ...state, kode: '' })}>
                  <CloseSquare size="25" color="#ef4444" variant="Bulk" />
                </TouchableOpacity>
              )}
            </HStack>
          </HStack>

          <TouchableOpacity onPress={() => setShowStartDate(true)}>
            <HStack
              p={2}
              mb={3}
              space={2}
              borderWidth={0.5}
              alignItems="center"
              borderStyle="dashed"
              borderColor={lineColor}
              rounded="md"
            >
              <CalendarCircle size="32" color={textColor} />
              <HStack flex={1} justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontFamily="Abel-Regular" color={subTextColor}>
                    Tanggal Mulai :
                  </Text>
                  <Text lineHeight="xs" fontSize="lg" fontWeight="semibold" fontFamily="Poppins-SemiBold" color={textColor}>
                    {moment(state.startDate).format('DD MMMM YYYY')}
                  </Text>
                </VStack>
                <ArrowRight2 size="15" color={subTextColor} />
              </HStack>
            </HStack>
          </TouchableOpacity>

          <DatePickerModal
            isOpen={showStartDate}
            onClose={() => setShowStartDate(false)}
            onConfirm={(date) => setState({ ...state, startDate: moment(date).format('YYYY-MM-DD') })}
            date={new Date(state.startDate)}
            title="Tanggal Mulai"
          />

          <TouchableOpacity onPress={() => setShowEndDate(true)}>
            <HStack
              p={2}
              mb={3}
              space={2}
              borderWidth={0.5}
              alignItems="center"
              borderStyle="dashed"
              borderColor={lineColor}
              rounded="md"
            >
              <CalendarCircle size="32" color={textColor} />
              <HStack flex={1} justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontFamily="Abel-Regular" color={subTextColor}>
                    Tanggal Akhir :
                  </Text>
                  <Text lineHeight="xs" fontSize="lg" fontWeight="semibold" fontFamily="Poppins-SemiBold" color={textColor}>
                    {moment(state.endDate).format('DD MMMM YYYY')}
                  </Text>
                </VStack>
                <ArrowRight2 size="15" color={subTextColor} />
              </HStack>
            </HStack>
          </TouchableOpacity>

          <DatePickerModal
            isOpen={showEndDate}
            onClose={() => setShowEndDate(false)}
            onConfirm={(date) => setState({ ...state, endDate: moment(date).format('YYYY-MM-DD') })}
            date={new Date(state.endDate)}
            title="Tanggal Akhir"
          />
        </VStack>
      </TouchableWithoutFeedback>

      <HStack space={2} mt={2}>
        <Button flex={1} bg="muted.400" onPress={resetFilter} _text={{ fontFamily: 'Poppins-SemiBold' }}>
          Reset
        </Button>
        <Button flex={1} bg="error.600" onPress={applyFilter} _text={{ fontFamily: 'Poppins-SemiBold' }}>
          Terapkan
        </Button>
      </HStack>
    </VStack>
  );
}
