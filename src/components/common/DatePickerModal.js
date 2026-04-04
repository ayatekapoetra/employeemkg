import React, { useState } from 'react';
import { Platform, Modal, TouchableOpacity } from 'react-native';
import { VStack, Text, HStack, Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';

function DatePickerModal({ 
  isOpen, 
  onClose = () => {}, 
  onConfirm = () => {}, 
  onChange: onChangeProp,
  date = new Date(),
  mode = 'date',
  title = 'Pilih Tanggal'
}) {
  const [selectedDate, setSelectedDate] = useState(date);
  const themeMode = useSelector(state => state.themes).value;

  const textColor = themeMode === 'dark' ? '#F5F5F5' : '#2f313e';
  const backgroundColor = themeMode === 'dark' ? '#2f313e' : '#F5F5F5';

  const onChange = (event, newDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        const finalDate = newDate || selectedDate;
        if (onChangeProp) {
          onChangeProp(finalDate);
        } else {
          onConfirm(finalDate);
        }
        onClose();
      } else {
        onClose();
      }
    } else {
      setSelectedDate(newDate || selectedDate);
    }
  };

  const handleConfirm = () => {
    if (onChangeProp) {
      onChangeProp(selectedDate);
    } else {
      onConfirm(selectedDate);
    }
    onClose();
  };

  if (Platform.OS === 'android') {
    return isOpen ? (
      <DateTimePicker
        value={selectedDate}
        mode={mode}
        display="default"
        onChange={onChange}
      />
    ) : null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <VStack bg={backgroundColor} p={4} borderTopRadius="2xl">
            <Text fontSize="lg" fontFamily="Poppins-SemiBold" color={textColor} mb={3}>
              {title}
            </Text>
            
            <DateTimePicker
              value={selectedDate}
              mode={mode}
              display="spinner"
              onChange={onChange}
              textColor={textColor}
            />

            <HStack space={2} mt={4}>
              <Button 
                flex={1} 
                variant="outline" 
                onPress={onClose}
                _text={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Batal
              </Button>
              <Button 
                flex={1} 
                bg="error.600" 
                onPress={handleConfirm}
                _text={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Pilih
              </Button>
            </HStack>
          </VStack>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default DatePickerModal;
