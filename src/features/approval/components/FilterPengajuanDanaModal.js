import React, { useState, useEffect } from 'react';
import { Modal, VStack, HStack, Text, Pressable, Button } from 'native-base';
import { ScrollView, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Calendar, SearchNormal } from 'iconsax-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import apiClient from '../../../services/api/client';
import { API_ENDPOINTS } from '../../../services/api/endpoints';

const FilterPengajuanDanaModal = ({ isOpen, onClose, onApplyFilter, currentFilters }) => {
  const mode = useSelector(state => state.themes)?.value || 'light';

  const [filters, setFilters] = useState({
    status: '',
    kategori: '',
    kode: '',
    narasi: '',
    min_amount: '',
    max_amount: '',
    date_start: '',
    date_end: '',
    bisnis_unit_id: '',
    ...currentFilters
  });

  const [showDatePicker, setShowDatePicker] = useState({ visible: false, type: '' });
  const [bisnisUnitList, setBisnisUnitList] = useState([]);

  useEffect(() => {
    fetchBisnisUnits();
  }, []);

  const fetchBisnisUnits = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BISNIS_UNIT.MYLIST);
      if (response.data?.diagnostic?.error === false) {
        const rows = response.data.rows;
        if (Array.isArray(rows)) {
          setBisnisUnitList(rows);
        } else if (rows?.data && Array.isArray(rows.data)) {
          setBisnisUnitList(rows.data);
        }
      }
    } catch (error) {
      console.error('[FilterPengajuanDana] Error fetching bisnis units:', error.response?.data || error.message);
    }
  };

  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  useEffect(() => {
    setFilters({ ...filters, ...currentFilters });
  }, [currentFilters]);

  const statusChips = [
    { 
      label: 'Semua', 
      value: '',
      bg: mode === 'dark' ? '#374151' : '#f3f4f6',
      text: mode === 'dark' ? '#9ca3af' : '#6b7280',
      activeBg: mode === 'dark' ? '#4b5563' : '#e5e7eb',
      activeText: mode === 'dark' ? '#d1d5db' : '#374151',
    },
    { 
      label: 'Open', 
      value: 'open',
      bg: mode === 'dark' ? '#92400e' : '#fef3c7',
      text: mode === 'dark' ? '#fbbf24' : '#d97706',
      activeBg: mode === 'dark' ? '#78350f' : '#fde68a',
      activeText: mode === 'dark' ? '#fbbf24' : '#b45309',
    },
    { 
      label: 'Approved', 
      value: 'approval',
      bg: mode === 'dark' ? '#1e40af' : '#dbeafe',
      text: mode === 'dark' ? '#60a5fa' : '#2563eb',
      activeBg: mode === 'dark' ? '#1e3a8a' : '#bfdbfe',
      activeText: mode === 'dark' ? '#60a5fa' : '#1e40af',
    },
    { 
      label: 'Paid', 
      value: 'close',
      bg: mode === 'dark' ? '#065f46' : '#d1fae5',
      text: mode === 'dark' ? '#6ee7b7' : '#059669',
      activeBg: mode === 'dark' ? '#064e3b' : '#a7f3d0',
      activeText: mode === 'dark' ? '#6ee7b7' : '#047857',
    },
    { 
      label: 'Rejected', 
      value: 'reject',
      bg: mode === 'dark' ? '#7f1d1d' : '#fee2e2',
      text: mode === 'dark' ? '#fca5a5' : '#dc2626',
      activeBg: mode === 'dark' ? '#991b1b' : '#fecaca',
      activeText: mode === 'dark' ? '#fca5a5' : '#b91c1c',
    },
  ];

  const kategoriChips = [
    { label: 'Semua', value: '' },
    { label: 'Reimburse', value: 'reimburse' },
    { label: 'Direct Paid', value: 'direct-paid' },
  ];

  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleResetFilter = () => {
    const resetFilters = {
      status: '',
      kategori: '',
      kode: '',
      narasi: '',
      min_amount: '',
      max_amount: '',
      date_start: '',
      date_end: '',
      bisnis_unit_id: '',
    };
    setFilters(resetFilters);
    onApplyFilter(resetFilters);
    onClose();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker({ visible: false, type: '' });
    
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      if (showDatePicker.type === 'start') {
        setFilters({ ...filters, date_start: formattedDate });
      } else {
        setFilters({ ...filters, date_end: formattedDate });
      }
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
    >
      <Pressable 
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
        bg="rgba(0,0,0,0.5)"
        onPress={onClose}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '85%',
        }}
      >
        <VStack
          bg={cardBg}
          roundedTop="2xl"
          maxHeight="100%"
        >
          {/* Header */}
          <HStack 
            p={4} 
            pb={3}
            alignItems="center" 
            justifyContent="space-between"
            borderBottomWidth={1}
            borderBottomColor={borderColor}
          >
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
              Filter Pengajuan Dana
            </Text>
            <Pressable onPress={onClose} p={1}>
              <Text fontSize="2xl" color={subtitleColor}>×</Text>
            </Pressable>
          </HStack>
          
          {/* Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            bounces={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
          >
            <VStack space={4}>
              {/* Unit Bisnis Filter */}
              {bisnisUnitList.length > 0 && (
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    Unit Bisnis
                  </Text>
                  <HStack flexWrap="wrap" space={2}>
                    <Pressable
                      onPress={() => setFilters({ ...filters, bisnis_unit_id: '' })}
                      bg={!filters.bisnis_unit_id ? (mode === 'dark' ? '#4b5563' : '#e5e7eb') : (mode === 'dark' ? '#374151' : '#f3f4f6')}
                      px={4}
                      py={2}
                      rounded="full"
                      mb={2}
                    >
                      <Text
                        fontSize="xs"
                        fontFamily="Quicksand-SemiBold"
                        color={!filters.bisnis_unit_id ? (mode === 'dark' ? '#d1d5db' : '#374151') : subtitleColor}
                      >
                        Semua
                      </Text>
                    </Pressable>
                    {bisnisUnitList.map((unit) => {
                      const isActive = filters.bisnis_unit_id === unit.id;
                      return (
                        <Pressable
                          key={unit.id}
                          onPress={() => setFilters({ ...filters, bisnis_unit_id: isActive ? '' : unit.id })}
                          bg={isActive ? (mode === 'dark' ? '#065f46' : '#d1fae5') : (mode === 'dark' ? '#374151' : '#f3f4f6')}
                          px={4}
                          py={2}
                          rounded="full"
                          mb={2}
                        >
                          <Text
                            fontSize="xs"
                            fontFamily="Quicksand-SemiBold"
                            color={isActive ? (mode === 'dark' ? '#6ee7b7' : '#059669') : subtitleColor}
                          >
                            {unit.initial || unit.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>
              )}

              {/* Status Filter */}
              <VStack space={2}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Status
                </Text>
                <HStack flexWrap="wrap" space={2}>
                  {statusChips.map((chip) => {
                    const isActive = filters.status === chip.value;
                    return (
                      <Pressable
                        key={chip.value}
                        onPress={() => setFilters({ ...filters, status: chip.value })}
                        bg={isActive ? chip.activeBg : chip.bg}
                        px={4}
                        py={2}
                        rounded="full"
                        mb={2}
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="Quicksand-SemiBold"
                          color={isActive ? chip.activeText : chip.text}
                        >
                          {chip.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Kategori Filter */}
              <VStack space={2}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Kategori
                </Text>
                <HStack flexWrap="wrap" space={2}>
                  {kategoriChips.map((chip) => {
                    const isActive = filters.kategori === chip.value;
                    return (
                      <Pressable
                        key={chip.value}
                        onPress={() => setFilters({ ...filters, kategori: chip.value })}
                        bg={isActive ? (mode === 'dark' ? '#1e3a8a' : '#dbeafe') : (mode === 'dark' ? '#374151' : '#f3f4f6')}
                        px={4}
                        py={2}
                        rounded="full"
                        mb={2}
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="Quicksand-SemiBold"
                          color={isActive ? (mode === 'dark' ? '#60a5fa' : '#2563eb') : subtitleColor}
                        >
                          {chip.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Search Filter */}
              <VStack space={2}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Pencarian
                </Text>
                
                <VStack space={2}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: mode === 'dark' ? '#111827' : '#f9fafb',
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 44,
                  }}>
                    <SearchNormal size={18} color={subtitleColor} style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="Cari kode pengajuan..."
                      value={filters.kode}
                      onChangeText={(text) => setFilters({ ...filters, kode: text })}
                      style={{
                        flex: 1,
                        color: textColor,
                        fontSize: 14,
                        fontFamily: 'Poppins-Light',
                        paddingVertical: 0,
                      }}
                      placeholderTextColor={subtitleColor}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      editable={true}
                      selectTextOnFocus={true}
                      blurOnSubmit={true}
                    />
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: mode === 'dark' ? '#111827' : '#f9fafb',
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 44,
                  }}>
                    <SearchNormal size={18} color={subtitleColor} style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="Cari narasi/keterangan..."
                      value={filters.narasi}
                      onChangeText={(text) => setFilters({ ...filters, narasi: text })}
                      style={{
                        flex: 1,
                        color: textColor,
                        fontSize: 14,
                        fontFamily: 'Poppins-Light',
                        paddingVertical: 0,
                      }}
                      placeholderTextColor={subtitleColor}
                      autoCapitalize="sentences"
                      autoCorrect={false}
                      returnKeyType="done"
                      editable={true}
                      selectTextOnFocus={true}
                      blurOnSubmit={true}
                    />
                  </View>
                </VStack>
              </VStack>

              {/* Date Range Filter */}
              <VStack space={2}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Tanggal Transaksi
                </Text>
                
                <HStack space={2}>
                  <VStack flex={1} space={1}>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                      Dari
                    </Text>
                    <Pressable
                      onPress={() => setShowDatePicker({ visible: true, type: 'start' })}
                      borderWidth={1}
                      borderColor={borderColor}
                      rounded="lg"
                      p={3}
                      bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                    >
                      <HStack alignItems="center" space={2}>
                        <Calendar size={16} color={subtitleColor} />
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={textColor}>
                          {filters.date_start ? moment(filters.date_start).format('DD MMM YYYY') : 'Pilih tanggal'}
                        </Text>
                      </HStack>
                    </Pressable>
                  </VStack>

                  <VStack flex={1} space={1}>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                      Sampai
                    </Text>
                    <Pressable
                      onPress={() => setShowDatePicker({ visible: true, type: 'end' })}
                      borderWidth={1}
                      borderColor={borderColor}
                      rounded="lg"
                      p={3}
                      bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                    >
                      <HStack alignItems="center" space={2}>
                        <Calendar size={16} color={subtitleColor} />
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={textColor}>
                          {filters.date_end ? moment(filters.date_end).format('DD MMM YYYY') : 'Pilih tanggal'}
                        </Text>
                      </HStack>
                    </Pressable>
                  </VStack>
                </HStack>
              </VStack>

              {/* Amount Range Filter */}
              <VStack space={2}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Range Amount
                </Text>
                
                <HStack space={2}>
                  <VStack flex={1} space={1}>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                      Min Amount
                    </Text>
                    <Pressable
                      borderWidth={1}
                      borderColor={borderColor}
                      rounded="lg"
                      p={3}
                      bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                    >
                      <Text 
                        fontSize="xs" 
                        fontFamily="Poppins-Light" 
                        color={filters.min_amount ? textColor : subtitleColor}
                      >
                        {filters.min_amount ? `Rp ${parseInt(filters.min_amount).toLocaleString('id-ID')}` : 'Min amount'}
                      </Text>
                    </Pressable>
                  </VStack>

                  <VStack flex={1} space={1}>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                      Max Amount
                    </Text>
                    <Pressable
                      borderWidth={1}
                      borderColor={borderColor}
                      rounded="lg"
                      p={3}
                      bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                    >
                      <Text 
                        fontSize="xs" 
                        fontFamily="Poppins-Light" 
                        color={filters.max_amount ? textColor : subtitleColor}
                      >
                        {filters.max_amount ? `Rp ${parseInt(filters.max_amount).toLocaleString('id-ID')}` : 'Max amount'}
                      </Text>
                    </Pressable>
                  </VStack>
                </HStack>
              </VStack>

              {/* Action Buttons */}
              <HStack space={2} pt={2}>
                <Button
                  flex={1}
                  variant="outline"
                  onPress={handleResetFilter}
                  borderColor={mode === 'dark' ? '#4b5563' : '#d1d5db'}
                  _text={{
                    fontFamily: 'Quicksand-SemiBold',
                    fontSize: 'sm',
                    color: textColor
                  }}
                  _pressed={{
                    bg: mode === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                >
                  Reset
                </Button>
                <Button
                  flex={1}
                  bg={mode === 'dark' ? '#2563eb' : '#3b82f6'}
                  onPress={handleApplyFilter}
                  _text={{
                    fontFamily: 'Quicksand-SemiBold',
                    fontSize: 'sm'
                  }}
                  _pressed={{
                    bg: mode === 'dark' ? '#1e40af' : '#2563eb'
                  }}
                >
                  Terapkan Filter
                </Button>
              </HStack>
            </VStack>
          </ScrollView>
        </VStack>
      </KeyboardAvoidingView>

      {showDatePicker.visible && (
        <DateTimePicker
          value={
            showDatePicker.type === 'start' && filters.date_start
              ? new Date(filters.date_start)
              : showDatePicker.type === 'end' && filters.date_end
              ? new Date(filters.date_end)
              : new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </Modal>
  );
};

export default FilterPengajuanDanaModal;
