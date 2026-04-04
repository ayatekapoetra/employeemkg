import React from 'react';
import { Modal, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { VStack, HStack, Text } from 'native-base';
import moment from 'moment';
import { CloseSquare, TickCircle, Calendar, ArrowDown2, DocumentText, CloseCircle } from 'iconsax-react-native';
import { COLORS } from '../../../../src/constants/colors';

export default function FilterBottomSheet({
  visible,
  onClose,
  mode,
  textColor,
  cardBg,
  filterDraft,
  setFilterDraft,
  setShowDatePicker,
  resetFilter,
  applyFilter,
  isFilterActive,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />

        <View
          style={{
            backgroundColor: cardBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '80%',
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center" mb={2}>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Filter Worksheet
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <CloseSquare size={28} color={COLORS.teks[mode][2]} />
                </TouchableOpacity>
              </HStack>

              {/* Status Filter */}
              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Status
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={2}>
                    {[
                      { label: 'Semua', value: '', color: '#6b7280', colorDark: '#9ca3af' },
                      { label: 'Pending', value: 'P', color: '#f59e0b', colorDark: '#92400e' },
                      { label: 'Approved', value: 'A', color: '#10b981', colorDark: '#065f46' },
                      { label: 'Rejected', value: 'R', color: '#ef4444', colorDark: '#991b1b' },
                    ].map((option) => {
                      const isActive = filterDraft.status === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => setFilterDraft({ ...filterDraft, status: option.value })}
                          activeOpacity={0.7}
                        >
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
                            <TickCircle size={18} color={isActive ? '#ffffff' : COLORS.teks[mode][2]} variant={isActive ? 'Bold' : 'Outline'} />
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

              {/* Date Range Filter */}
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
                      <Calendar size={18} color={COLORS.teks[mode][2]} />
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={filterDraft.startdate ? textColor : COLORS.teks[mode][2]}>
                        {filterDraft.startdate ? moment(filterDraft.startdate).format('DD MMM YYYY') : 'Mulai'}
                      </Text>
                    </HStack>
                    <ArrowDown2 size={16} color={COLORS.teks[mode][2]} />
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
                      <Calendar size={18} color={COLORS.teks[mode][2]} />
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={filterDraft.enddate ? textColor : COLORS.teks[mode][2]}>
                        {filterDraft.enddate ? moment(filterDraft.enddate).format('DD MMM YYYY') : 'Selesai'}
                      </Text>
                    </HStack>
                    <ArrowDown2 size={16} color={COLORS.teks[mode][2]} />
                  </TouchableOpacity>
                </HStack>
              </VStack>

              {/* Keterangan Filter */}
              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Keterangan
                </Text>
                <View
                  style={{
                    backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                    borderWidth: 1,
                    borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <HStack alignItems="flex-start">
                    <DocumentText size={18} color={COLORS.teks[mode][2]} style={{ marginTop: 2 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        color: textColor,
                        fontSize: 14,
                        fontFamily: 'Poppins-Regular',
                        marginLeft: 8,
                        minHeight: 40,
                      }}
                      placeholder="Cari keterangan..."
                      placeholderTextColor={COLORS.teks[mode][2]}
                      value={filterDraft.keterangan}
                      onChangeText={(text) => setFilterDraft({ ...filterDraft, keterangan: text })}
                      multiline={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    {filterDraft.keterangan ? (
                      <TouchableOpacity onPress={() => setFilterDraft({ ...filterDraft, keterangan: '' })} style={{ marginLeft: 8, marginTop: 8 }}>
                        <CloseCircle size={16} color={COLORS.teks[mode][2]} />
                      </TouchableOpacity>
                    ) : null}
                  </HStack>
                </View>
              </VStack>

              {/* Action Buttons */}
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
                  onPress={applyFilter}
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
        </View>
      </View>
    </Modal>
  );
}
