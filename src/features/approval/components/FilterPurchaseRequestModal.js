import { ArrowDown2, Calendar, CloseSquare, SearchNormal1 } from 'iconsax-react-native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector } from 'react-redux';
import apiClient from '../../../services/api/client';
import { API_ENDPOINTS } from '../../../services/api/endpoints';

const BottomSheetSelect = ({ label, value, options, onSelect, mode, placeholder }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  
  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item.value);
        setShowOptions(false);
        setSearchQuery('');
      }}
      style={{
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 8,
        backgroundColor: value === item.value 
          ? (mode === 'dark' ? '#374151' : '#dbeafe')
          : (mode === 'dark' ? '#1f2937' : '#f9fafb'),
        borderRadius: 10,
        borderWidth: value === item.value ? 2 : 1,
        borderColor: value === item.value 
          ? (mode === 'dark' ? '#60a5fa' : '#2563eb')
          : (mode === 'dark' ? '#374151' : '#e5e7eb'),
      }}
    >
      <Text
        fontSize="sm"
        fontFamily={value === item.value ? 'Quicksand-Bold' : 'Poppins-Regular'}
        color={value === item.value ? (mode === 'dark' ? '#60a5fa' : '#2563eb') : textColor}
      >
        {item.label}
      </Text>
      {item.subtitle && (
        <Text
          fontSize="xs"
          fontFamily="Poppins-Light"
          color={labelColor}
          style={{ marginTop: 4 }}
        >
          {item.subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <VStack space={2}>
      <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        style={{
          backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
          borderWidth: 1,
          borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
          borderRadius: 8,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text 
          fontSize="sm" 
          fontFamily="Poppins-Regular" 
          color={selectedOption ? textColor : labelColor}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ArrowDown2 size={16} color={labelColor} />
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowOptions(false);
          setSearchQuery('');
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowOptions(false);
            setSearchQuery('');
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <VStack space={3} p={5} pb={0}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                    {label}
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                    {filteredOptions.length} opsi tersedia
                  </Text>
                </VStack>
                <TouchableOpacity onPress={() => {
                  setShowOptions(false);
                  setSearchQuery('');
                }}>
                  <CloseSquare size={28} color={labelColor} />
                </TouchableOpacity>
              </HStack>

              <HStack
                alignItems="center"
                space={2}
                px={3}
                py={2}
                bg={mode === 'dark' ? '#374151' : '#f9fafb'}
                borderWidth={1}
                borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
                borderRadius={12}
              >
                <SearchNormal1 size={20} color={labelColor} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cari..."
                  placeholderTextColor={labelColor}
                  style={{
                    flex: 1,
                    color: textColor,
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    padding: 8,
                  }}
                />
              </HStack>
            </VStack>

            <FlatList
              data={filteredOptions}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              ListEmptyComponent={
                <VStack alignItems="center" justifyContent="center" py={10}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Tidak ada data ditemukan
                  </Text>
                </VStack>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </VStack>
  );
};

const FilterPurchaseRequestModal = ({ visible, onClose, filters, onFilterChange, onApply, onReset }) => {
  const mode = useSelector(state => state.themes)?.value || 'light';
  const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false });

  const bisnisunitRedux = useSelector(state => state.bisnisunit);
  const cabangRedux = useSelector(state => state.cabang);
  const gudangRedux = useSelector(state => state.gudang);

  const [bisnisUnitList, setBisnisUnitList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [gudangList, setGudangList] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchBisnisUnit();
      fetchCabang();
      fetchGudang();
    }
  }, [visible]);

  const fetchBisnisUnit = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BISNIS_UNIT.LIST);
      if (response.data?.diagnostic?.error === false) {
        setBisnisUnitList(response.data.rows || []);
      }
    } catch (error) {
      console.error('Error fetching bisnis unit:', error);
    }
  };

  const fetchCabang = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
      if (response.data?.diagnostic?.error === false) {
        setCabangList(response.data.rows || []);
      }
    } catch (error) {
      console.error('Error fetching cabang:', error);
    }
  };

  const fetchGudang = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GUDANG.LIST);
      if (response.data?.diagnostic?.error === false) {
        setGudangList(response.data.rows || []);
      }
    } catch (error) {
      console.error('Error fetching gudang:', error);
    }
  };

  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

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
      label: 'Aktif', 
      value: 'active',
      bg: mode === 'dark' ? '#92400e' : '#fef3c7',
      text: mode === 'dark' ? '#fbbf24' : '#d97706',
      activeBg: mode === 'dark' ? '#78350f' : '#fde68a',
      activeText: mode === 'dark' ? '#fbbf24' : '#b45309',
    },
    { 
      label: 'Approved', 
      value: 'approved',
      bg: mode === 'dark' ? '#1e40af' : '#dbeafe',
      text: mode === 'dark' ? '#60a5fa' : '#2563eb',
      activeBg: mode === 'dark' ? '#1e3a8a' : '#bfdbfe',
      activeText: mode === 'dark' ? '#60a5fa' : '#1e40af',
    },
    { 
      label: 'Selesai', 
      value: 'finish',
      bg: mode === 'dark' ? '#065f46' : '#d1fae5',
      text: mode === 'dark' ? '#6ee7b7' : '#059669',
      activeBg: mode === 'dark' ? '#064e3b' : '#a7f3d0',
      activeText: mode === 'dark' ? '#6ee7b7' : '#047857',
    },
  ];

  const prioritasChips = [
    { 
      label: 'Semua', 
      value: '',
      bg: mode === 'dark' ? '#374151' : '#f3f4f6',
      text: mode === 'dark' ? '#9ca3af' : '#6b7280',
      activeBg: mode === 'dark' ? '#4b5563' : '#e5e7eb',
      activeText: mode === 'dark' ? '#d1d5db' : '#374151',
    },
    { 
      label: 'Tinggi', 
      value: 'tinggi',
      bg: mode === 'dark' ? '#991b1b' : '#fee2e2',
      text: mode === 'dark' ? '#fca5a5' : '#dc2626',
      activeBg: mode === 'dark' ? '#7f1d1d' : '#fecaca',
      activeText: mode === 'dark' ? '#fca5a5' : '#b91c1c',
    },
    { 
      label: 'Sedang', 
      value: 'sedang',
      bg: mode === 'dark' ? '#92400e' : '#fef3c7',
      text: mode === 'dark' ? '#fbbf24' : '#d97706',
      activeBg: mode === 'dark' ? '#78350f' : '#fde68a',
      activeText: mode === 'dark' ? '#fbbf24' : '#b45309',
    },
    { 
      label: 'Rendah', 
      value: 'rendah',
      bg: mode === 'dark' ? '#065f46' : '#d1fae5',
      text: mode === 'dark' ? '#6ee7b7' : '#059669',
      activeBg: mode === 'dark' ? '#064e3b' : '#a7f3d0',
      activeText: mode === 'dark' ? '#6ee7b7' : '#047857',
    },
  ];

  const bisnisOptions = useMemo(() => {
    const defaultOption = [{ label: 'Semua Bisnis', value: '' }];
    
    let dataSource = bisnisUnitList;
    if (bisnisunitRedux?.data && bisnisUnitList.length === 0) {
      dataSource = Array.isArray(bisnisunitRedux.data) 
        ? bisnisunitRedux.data 
        : bisnisunitRedux.data.rows || [];
    }
    
    if (dataSource.length === 0) return defaultOption;
    
    const options = dataSource.map(item => ({
      label: item.name || item.nama || item.initial,
      value: item.id?.toString() || '',
    }));
    
    return [...defaultOption, ...options];
  }, [bisnisunitRedux?.data, bisnisUnitList]);

  const cabangOptions = useMemo(() => {
    const defaultOption = [{ label: 'Semua Cabang', value: '', subtitle: '' }];
    
    let dataSource = cabangList;
    if (cabangRedux?.data && cabangList.length === 0) {
      dataSource = Array.isArray(cabangRedux.data) 
        ? cabangRedux.data 
        : cabangRedux.data.rows || [];
    }
    
    if (dataSource.length === 0) return defaultOption;
    
    const options = dataSource.map(item => {
      const cabangName = item.nama || item.name || item.initial;
      const bisnisName = item.bisnis?.name || item.bisnis?.nama || item.bisnis?.initial || '';
      
      return {
        label: cabangName,
        value: item.id?.toString() || '',
        subtitle: bisnisName,
      };
    });
    
    return [...defaultOption, ...options];
  }, [cabangRedux?.data, cabangList]);

  const gudangOptions = useMemo(() => {
    const defaultOption = [{ label: 'Semua Gudang', value: '', subtitle: '' }];
    
    let dataSource = gudangList;
    if (gudangRedux?.data && gudangList.length === 0) {
      dataSource = Array.isArray(gudangRedux.data) 
        ? gudangRedux.data 
        : gudangRedux.data.rows || [];
    }
    
    if (dataSource.length === 0) return defaultOption;
    
    const options = dataSource.map(item => {
      const gudangName = item.nama || item.name || item.kode;
      const cabangName = item.cabang?.nama || item.cabang?.name || '';
      const bisnisName = item.bisnis?.name || item.bisnis?.nama || item.bisnis?.initial || '';
      
      // Combine cabang and bisnis for subtitle
      let subtitle = '';
      if (cabangName && bisnisName) {
        subtitle = `${cabangName} • ${bisnisName}`;
      } else if (cabangName) {
        subtitle = cabangName;
      } else if (bisnisName) {
        subtitle = bisnisName;
      }
      
      return {
        label: gudangName,
        value: item.id?.toString() || '',
        subtitle: subtitle,
      };
    });
    
    return [...defaultOption, ...options];
  }, [gudangRedux?.data, gudangList]);

  const handleDateConfirm = (date) => {
    const formatted = moment(date).format('YYYY-MM-DD');
    if (showDatePicker.type === 'start') {
      onFilterChange('date_ro_start', formatted);
    } else {
      onFilterChange('date_ro_end', formatted);
    }
    setShowDatePicker({ type: null, visible: false });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            flex: 1,
          }}
        >
          <HStack justifyContent="space-between" alignItems="center" p={5} pb={3}>
            <Text
              fontSize="xl"
              fontFamily="Quicksand-Bold"
              color={textColor}
            >
              Filter Purchase Request
            </Text>
            <TouchableOpacity onPress={onClose}>
              <CloseSquare size={28} color={labelColor} />
            </TouchableOpacity>
          </HStack>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
              <VStack space={4}>
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Status
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    {statusChips.map((chip) => {
                      const isSelected = filters.status === chip.value;
                      return (
                        <TouchableOpacity
                          key={chip.value}
                          onPress={() => onFilterChange('status', chip.value)}
                          style={{
                            backgroundColor: isSelected ? chip.activeBg : chip.bg,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            marginBottom: 8,
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? chip.activeText : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: isSelected ? 'Quicksand-Bold' : 'Quicksand-SemiBold',
                              color: isSelected ? chip.activeText : chip.text,
                            }}
                          >
                            {chip.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </HStack>
                </VStack>

                <BottomSheetSelect
                  label="Bisnis Unit"
                  value={filters.bisnis_id}
                  options={bisnisOptions}
                  onSelect={(value) => onFilterChange('bisnis_id', value)}
                  mode={mode}
                  placeholder="Pilih bisnis unit"
                />

                <HStack space={2}>
                  <VStack flex={1}>
                    <BottomSheetSelect
                      label="Cabang"
                      value={filters.cabang_id}
                      options={cabangOptions}
                      onSelect={(value) => onFilterChange('cabang_id', value)}
                      mode={mode}
                      placeholder="Pilih cabang"
                    />
                  </VStack>

                  <VStack flex={1}>
                    <BottomSheetSelect
                      label="Gudang"
                      value={filters.gudang_id}
                      options={gudangOptions}
                      onSelect={(value) => onFilterChange('gudang_id', value)}
                      mode={mode}
                      placeholder="Pilih gudang"
                    />
                  </VStack>
                </HStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Prioritas
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    {prioritasChips.map((chip) => {
                      const isSelected = filters.prioritas === chip.value;
                      return (
                        <TouchableOpacity
                          key={chip.value}
                          onPress={() => onFilterChange('prioritas', chip.value)}
                          style={{
                            backgroundColor: isSelected ? chip.activeBg : chip.bg,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            marginBottom: 8,
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? chip.activeText : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: isSelected ? 'Quicksand-Bold' : 'Quicksand-SemiBold',
                              color: isSelected ? chip.activeText : chip.text,
                            }}
                          >
                            {chip.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </HStack>
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Kode PR
                  </Text>
                  <TextInput
                    value={filters.kode}
                    onChangeText={(value) => onFilterChange('kode', value)}
                    placeholder="Cari berdasarkan kode..."
                    placeholderTextColor={labelColor}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      color: textColor,
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                    }}
                  />
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Deskripsi
                  </Text>
                  <TextInput
                    value={filters.description}
                    onChangeText={(value) => onFilterChange('description', value)}
                    placeholder="Cari berdasarkan deskripsi..."
                    placeholderTextColor={labelColor}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      color: textColor,
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                    }}
                  />
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Rentang Tanggal
                  </Text>
                  <HStack space={2}>
                    <VStack flex={1} space={1}>
                      <Text fontSize="xs" fontFamily="Poppins-Light" color={labelColor}>
                        Mulai
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker({ type: 'start', visible: true })}
                        style={{
                          backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                          borderWidth: 1,
                          borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                          borderRadius: 8,
                          padding: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="Poppins-Regular"
                          color={filters.date_ro_start ? textColor : labelColor}
                          numberOfLines={1}
                        >
                          {filters.date_ro_start ? moment(filters.date_ro_start).format('DD/MM/YY') : 'Pilih'}
                        </Text>
                        <Calendar size={14} color={labelColor} />
                      </TouchableOpacity>
                    </VStack>

                    <VStack flex={1} space={1}>
                      <Text fontSize="xs" fontFamily="Poppins-Light" color={labelColor}>
                        Akhir
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker({ type: 'end', visible: true })}
                        style={{
                          backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                          borderWidth: 1,
                          borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                          borderRadius: 8,
                          padding: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="Poppins-Regular"
                          color={filters.date_ro_end ? textColor : labelColor}
                          numberOfLines={1}
                        >
                          {filters.date_ro_end ? moment(filters.date_ro_end).format('DD/MM/YY') : 'Pilih'}
                        </Text>
                        <Calendar size={14} color={labelColor} />
                      </TouchableOpacity>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 20,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: mode === 'dark' ? '#3a3c4e' : '#e5e7eb',
            }}
          >
            <TouchableOpacity
              onPress={onReset}
              style={{
                flex: 1,
                backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Quicksand-Bold',
                  color: textColor,
                }}
              >
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onApply}
              style={{
                flex: 2,
                backgroundColor: mode === 'dark' ? '#1e40af' : '#2563eb',
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Quicksand-Bold',
                  color: '#ffffff',
                }}
              >
                Terapkan Filter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker.visible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker({ type: null, visible: false })}
        date={showDatePicker.type === 'start' 
          ? (filters.date_ro_start ? new Date(filters.date_ro_start) : new Date())
          : (filters.date_ro_end ? new Date(filters.date_ro_end) : new Date())
        }
      />
    </Modal>
  );
};

export default FilterPurchaseRequestModal;
