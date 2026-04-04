import React, { useState, useEffect } from 'react';
import { Modal, VStack, HStack, Text, Button, ScrollView } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DatePickerModal from '../../../../src/components/common/DatePickerModal';
import { FILTER_OPTIONS, KATEGORI } from '../../../../src/utils/dailyBreakdown/constants';
import { COLORS } from '../../../../src/constants/colors';
import { Filter, CloseCircle, TickCircle } from 'iconsax-react-native';

/**
 * FilterModal Component
 * Modal for filtering breakdown list
 * 
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onApply - Apply filter handler
 * @param {object} currentFilters - Current active filters
 */
const FilterModal = ({ visible, onClose, onApply, currentFilters = {} }) => {
  const mode = useSelector(state => state.themes)?.value || 'light';
  
  const [filters, setFilters] = useState({
    status: 'all',
    kategori: 'all',
    startdate: '',
    enddate: '',
    ...currentFilters,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start'); // 'start' or 'end'
  
  const cardBg = mode === 'dark' ? '#3a3c4a' : '#ffffff';
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const borderColor = mode === 'dark' ? '#5e5f6cff' : '#e5e7eb';
  const selectedBg = mode === 'dark' ? '#1e40af' : '#dbeafe';
  const selectedBorder = mode === 'dark' ? '#3b82f6' : '#93c5fd';
  const selectedText = mode === 'dark' ? '#93c5fd' : '#1e40af';
  
  useEffect(() => {
    if (visible) {
      setFilters({
        status: 'all',
        kategori: 'all',
        startdate: '',
        enddate: '',
        ...currentFilters,
      });
    }
  }, [visible, currentFilters]);
  
  const handleStatusSelect = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
  };
  
  const handleKategoriSelect = (value) => {
    setFilters(prev => ({ ...prev, kategori: value }));
  };
  
  const handleDateSelect = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    if (datePickerType === 'start') {
      setFilters(prev => ({ ...prev, startdate: formattedDate }));
    } else {
      setFilters(prev => ({ ...prev, enddate: formattedDate }));
    }
    setShowDatePicker(false);
  };
  
  const openDatePicker = (type) => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };
  
  const handleReset = () => {
    setFilters({
      status: 'all',
      kategori: 'all',
      startdate: '',
      enddate: '',
    });
  };
  
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  
  const isFiltered = () => {
    return filters.status !== 'all' || 
           filters.kategori !== 'all' || 
           filters.startdate !== '' || 
           filters.enddate !== '';
  };
  
  return (
    <>
      <Modal isOpen={visible} onClose={onClose} size="full">
        <Modal.Content maxWidth="400px" bg={cardBg}>
          <Modal.CloseButton />
          <Modal.Header bg={cardBg} borderBottomWidth={1} borderBottomColor={borderColor}>
            <HStack alignItems="center" space={2}>
              <Filter size={20} color={textColor} variant="Bold" />
              <Text fontSize={16} fontFamily="Quicksand-Bold" color={textColor}>
                Filter Breakdown
              </Text>
            </HStack>
          </Modal.Header>
          
          <Modal.Body>
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space={4} py={2}>
                {/* Status Filter */}
                <VStack space={2}>
                  <Text fontSize={14} fontFamily="Quicksand-SemiBold" color={textColor}>
                    Status
                  </Text>
                  <VStack space={2}>
                    {FILTER_OPTIONS.STATUS.map((option) => {
                      const isSelected = filters.status === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handleStatusSelect(option.value)}
                          activeOpacity={0.7}
                        >
                          <HStack
                            bg={isSelected ? selectedBg : cardBg}
                            borderWidth={1}
                            borderColor={isSelected ? selectedBorder : borderColor}
                            borderRadius={8}
                            p={3}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Text
                              fontSize={13}
                              fontFamily="Poppins-Medium"
                              color={isSelected ? selectedText : textColor}
                            >
                              {option.label}
                            </Text>
                            {isSelected && (
                              <TickCircle size={20} color={selectedText} variant="Bold" />
                            )}
                          </HStack>
                        </TouchableOpacity>
                      );
                    })}
                  </VStack>
                </VStack>
                
                {/* Category Filter */}
                <VStack space={2}>
                  <Text fontSize={14} fontFamily="Quicksand-SemiBold" color={textColor}>
                    Kategori
                  </Text>
                  <VStack space={2}>
                    {/* All Categories */}
                    <TouchableOpacity
                      onPress={() => handleKategoriSelect('all')}
                      activeOpacity={0.7}
                    >
                      <HStack
                        bg={filters.kategori === 'all' ? selectedBg : cardBg}
                        borderWidth={1}
                        borderColor={filters.kategori === 'all' ? selectedBorder : borderColor}
                        borderRadius={8}
                        p={3}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text
                          fontSize={13}
                          fontFamily="Poppins-Medium"
                          color={filters.kategori === 'all' ? selectedText : textColor}
                        >
                          Semua Kategori
                        </Text>
                        {filters.kategori === 'all' && (
                          <TickCircle size={20} color={selectedText} variant="Bold" />
                        )}
                      </HStack>
                    </TouchableOpacity>
                    
                    {/* Category Options */}
                    {KATEGORI.map((option) => {
                      const isSelected = filters.kategori === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handleKategoriSelect(option.value)}
                          activeOpacity={0.7}
                        >
                          <HStack
                            bg={isSelected ? selectedBg : cardBg}
                            borderWidth={1}
                            borderColor={isSelected ? selectedBorder : borderColor}
                            borderRadius={8}
                            p={3}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <HStack alignItems="center" space={2}>
                              <Text fontSize={16}>{option.icon}</Text>
                              <Text
                                fontSize={13}
                                fontFamily="Poppins-Medium"
                                color={isSelected ? selectedText : textColor}
                              >
                                {option.label}
                              </Text>
                            </HStack>
                            {isSelected && (
                              <TickCircle size={20} color={selectedText} variant="Bold" />
                            )}
                          </HStack>
                        </TouchableOpacity>
                      );
                    })}
                  </VStack>
                </VStack>
                
                {/* Date Range Filter */}
                <VStack space={2}>
                  <Text fontSize={14} fontFamily="Quicksand-SemiBold" color={textColor}>
                    Rentang Tanggal
                  </Text>
                  
                  {/* Start Date */}
                  <TouchableOpacity
                    onPress={() => openDatePicker('start')}
                    activeOpacity={0.7}
                  >
                    <VStack
                      bg={cardBg}
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius={8}
                      p={3}
                      space={1}
                    >
                      <Text fontSize={11} fontFamily="Poppins-Light" color={subtitleColor}>
                        Dari Tanggal
                      </Text>
                      <Text fontSize={13} fontFamily="Poppins-Medium" color={textColor}>
                        {filters.startdate 
                          ? moment(filters.startdate).format('DD MMM YYYY')
                          : 'Pilih tanggal mulai'}
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                  
                  {/* End Date */}
                  <TouchableOpacity
                    onPress={() => openDatePicker('end')}
                    activeOpacity={0.7}
                  >
                    <VStack
                      bg={cardBg}
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius={8}
                      p={3}
                      space={1}
                    >
                      <Text fontSize={11} fontFamily="Poppins-Light" color={subtitleColor}>
                        Sampai Tanggal
                      </Text>
                      <Text fontSize={13} fontFamily="Poppins-Medium" color={textColor}>
                        {filters.enddate 
                          ? moment(filters.enddate).format('DD MMM YYYY')
                          : 'Pilih tanggal akhir'}
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                </VStack>
              </VStack>
            </ScrollView>
          </Modal.Body>
          
          <Modal.Footer bg={cardBg} borderTopWidth={1} borderTopColor={borderColor}>
            <HStack space={3} flex={1}>
              {/* Reset Button */}
              <Button
                flex={1}
                variant="outline"
                borderColor={borderColor}
                onPress={handleReset}
                _pressed={{ bg: mode === 'dark' ? '#374151' : '#f3f4f6' }}
                isDisabled={!isFiltered()}
              >
                <HStack alignItems="center" space={1}>
                  <CloseCircle size={18} color={textColor} variant="Bold" />
                  <Text fontSize={13} fontFamily="Quicksand-SemiBold" color={textColor}>
                    Reset
                  </Text>
                </HStack>
              </Button>
              
              {/* Apply Button */}
              <Button
                flex={1}
                bg={mode === 'dark' ? '#1e40af' : '#3b82f6'}
                onPress={handleApply}
                _pressed={{ bg: mode === 'dark' ? '#1e3a8a' : '#2563eb' }}
              >
                <HStack alignItems="center" space={1}>
                  <TickCircle size={18} color="#ffffff" variant="Bold" />
                  <Text fontSize={13} fontFamily="Quicksand-SemiBold" color="#ffffff">
                    Terapkan
                  </Text>
                </HStack>
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
      
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateSelect}
        date={
          datePickerType === 'start' 
            ? (filters.startdate ? new Date(filters.startdate) : new Date())
            : (filters.enddate ? new Date(filters.enddate) : new Date())
        }
      />
    </>
  );
};

export default FilterModal;
