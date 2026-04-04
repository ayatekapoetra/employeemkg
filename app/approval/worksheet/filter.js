import React, { useEffect, useMemo, useState } from 'react';
import { Modal, TouchableOpacity, ScrollView, View } from 'react-native';
import { VStack, HStack, Text } from 'native-base';
import { CloseSquare, TickCircle, Calendar, User, ArrowDown2 } from 'iconsax-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect';

const STATUS_OPTIONS = [
  { label: 'Semua', value: '', color: '#6b7280', colorDark: '#9ca3af' },
  { label: 'Pending', value: 'P', color: '#f59e0b', colorDark: '#92400e' },
  { label: 'Approved', value: 'A', color: '#10b981', colorDark: '#065f46' },
  { label: 'Rejected', value: 'R', color: '#ef4444', colorDark: '#991b1b' },
];

const FilterModal = ({
  showFilterModal,
  setShowFilterModal,
  filterDraft,
  setFilterDraft,
  applyFilter,
  resetFilter,
  isFilterActive,
  karyawanList,
  textColor,
  mode,
  cardBg,
  COLORS,
}) => {
  const [filters, setFilters] = useState({ ...filterDraft });
  const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false });

  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    if (showFilterModal) {
      setFilters({ ...filterDraft });
      setShowDatePicker({ type: null, visible: false });
    }
  }, [showFilterModal, filterDraft]);

  if (!showFilterModal) return null;

  const handleDateConfirm = (date) => {
    const formatted = date ? date.toISOString().slice(0, 10) : '';
    if (showDatePicker.type === 'start') {
      setFilters((prev) => ({ ...prev, startdate: formatted }));
    } else {
      setFilters((prev) => ({ ...prev, enddate: formatted }));
    }
    setShowDatePicker({ type: null, visible: false });
  };

  const handleApply = () => {
    const next = { ...filters };
    setFilterDraft(next);
    applyFilter(next);
  };

  return (
    <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <View
          style={{
            backgroundColor: cardBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            flex: 1,
          }}
        >
          <HStack justifyContent="space-between" alignItems="center" p={5} pb={3}>
            <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
              Filter Worksheet
            </Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <CloseSquare size={28} color={labelColor} />
            </TouchableOpacity>
          </HStack>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
            <VStack space={4} px={5}>
              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Status
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={2}>
                    {STATUS_OPTIONS.map((option) => {
                      const isActive = filters.status === option.value;
                      return (
                        <TouchableOpacity key={option.value} onPress={() => setFilters((prev) => ({ ...prev, status: option.value }))} activeOpacity={0.7}>
                          <HStack
                            alignItems="center"
                            space={2}
                            px={3}
                            py={2}
                            bg={isActive ? (mode === 'dark' ? option.colorDark : option.color) : (mode === 'dark' ? '#374151' : '#f9fafb')}
                            borderWidth={1}
                            borderColor={isActive ? (mode === 'dark' ? option.colorDark : option.color) : (mode === 'dark' ? '#4b5563' : '#e5e7eb')}
                            borderRadius={12}
                          >
                            <TickCircle size={18} color={isActive ? '#ffffff' : labelColor} variant={isActive ? 'Bold' : 'Outline'} />
                            <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={isActive ? '#ffffff' : textColor}>
                              {option.label}
                            </Text>
                          </HStack>
                        </TouchableOpacity>
                      );
                    })}
                  </HStack>
                </ScrollView>
              </VStack>

              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Rentang Tanggal
                </Text>
                <HStack space={3}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker({ type: 'start', visible: true })}
                    style={{
                      flex: 1,
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <HStack space={2} alignItems="center">
                      <Calendar size={18} color={labelColor} />
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={filters.startdate ? textColor : labelColor}>
                        {filters.startdate || 'Mulai'}
                      </Text>
                    </HStack>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowDatePicker({ type: 'end', visible: true })}
                    style={{
                      flex: 1,
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <HStack space={2} alignItems="center">
                      <Calendar size={18} color={labelColor} />
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={filters.enddate ? textColor : labelColor}>
                        {filters.enddate || 'Selesai'}
                      </Text>
                    </HStack>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </HStack>
              </VStack>

              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Crew
                </Text>

                <BottomSheetSelect
                  label="Crew"
                  placeholder="Pilih crew"
                  value={filters.crew_id ? filters.crew_id.toString() : ''}
                  options={karyawanList.map((k) => ({ id: k.id?.toString() || '', nama: k.nama || '[No Name]', subtitle: k.area || '' }))}
                  onChange={(val) => setFilters((prev) => ({ ...prev, crew_id: val ? Number(val) : null }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />
              </VStack>

              <HStack mt={4} space={3}>
                <TouchableOpacity
                  onPress={resetFilter}
                  disabled={!isFilterActive()}
                  style={{
                    flex: 1,
                    backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                    opacity: isFilterActive() ? 1 : 0.5,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'Quicksand-Bold', color: textColor }}>
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleApply}
                  style={{
                    flex: 2,
                    backgroundColor: mode === 'dark' ? '#1e40af' : '#2563eb',
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#ffffff' }}>
                    Terapkan Filter
                  </Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </ScrollView>

          <DateTimePickerModal
            isVisible={showDatePicker.visible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker({ type: null, visible: false })}
            date={showDatePicker.type === 'start'
              ? (filters.startdate ? new Date(filters.startdate) : new Date())
              : (filters.enddate ? new Date(filters.enddate) : new Date())}
            maximumDate={new Date()}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
