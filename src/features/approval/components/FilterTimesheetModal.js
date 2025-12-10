import { ArrowDown2, Calendar, CloseSquare, SearchNormal1, TickCircle } from 'iconsax-react-native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector } from 'react-redux';
import 'moment/locale/id';

moment.locale('id');

// Penyewa Bottom Sheet Component
const PenyewaBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const penyewaRedux = useSelector(state => state.penyewa);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const penyewaList = useMemo(() => {
    if (Array.isArray(penyewaRedux?.data)) {
      return penyewaRedux.data;
    }
    return [];
  }, [penyewaRedux?.data]);

  const filteredPenyewa = useMemo(() => {
    if (!searchQuery) return penyewaList;
    const searchLower = searchQuery.toLowerCase();
    return penyewaList.filter(item => 
      (item.nama || '').toLowerCase().includes(searchLower)
    );
  }, [penyewaList, searchQuery]);

  const handleSelect = useCallback((penyewa) => {
    onSelect(penyewa.id.toString());
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
        marginHorizontal: 20,
      }}
    >
      <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
        {item.nama || '[No Name]'}
      </Text>
    </TouchableOpacity>
  ), [handleSelect, mode, textColor]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Penyewa
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {penyewaList.length} penyewa tersedia
                </Text>
              </VStack>
              <TouchableOpacity onPress={onClose}>
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
                placeholder="Cari penyewa..."
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
            data={filteredPenyewa}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <VStack py={10} alignItems="center">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor} textAlign="center">
                  {searchQuery ? 'Penyewa tidak ditemukan' : 'Tidak ada data penyewa'}
                </Text>
              </VStack>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Equipment Bottom Sheet Component
const EquipmentBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const equipmentRedux = useSelector(state => state.equipment);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const equipmentList = useMemo(() => {
    if (Array.isArray(equipmentRedux?.data)) {
      return equipmentRedux.data;
    }
    return [];
  }, [equipmentRedux?.data]);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery) return equipmentList;
    const searchLower = searchQuery.toLowerCase();
    return equipmentList.filter(item => 
      (item.kode || '').toLowerCase().includes(searchLower) ||
      (item.nama || '').toLowerCase().includes(searchLower)
    );
  }, [equipmentList, searchQuery]);

  const handleSelect = useCallback((equipment) => {
    onSelect(equipment.id.toString());
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
        marginHorizontal: 20,
      }}
    >
      <HStack space={3} alignItems="center">
        <VStack space={0.5} flex={1}>
          <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
            {item.kode || '[No Code]'}
          </Text>
          <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
            {item.nama || '[No Name]'}
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  ), [handleSelect, mode, textColor, labelColor]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Equipment
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {equipmentList.length} equipment tersedia
                </Text>
              </VStack>
              <TouchableOpacity onPress={onClose}>
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
                placeholder="Cari equipment..."
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
            data={filteredEquipment}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <VStack py={10} alignItems="center">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor} textAlign="center">
                  {searchQuery ? 'Equipment tidak ditemukan' : 'Tidak ada data equipment'}
                </Text>
              </VStack>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Shift Bottom Sheet Component
const ShiftBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const shiftRedux = useSelector(state => state.shift);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const shiftList = useMemo(() => {
    if (Array.isArray(shiftRedux?.data)) {
      return shiftRedux.data;
    }
    return [];
  }, [shiftRedux?.data]);

  const filteredShift = useMemo(() => {
    if (!searchQuery) return shiftList;
    const searchLower = searchQuery.toLowerCase();
    return shiftList.filter(item => 
      (item.nama || '').toLowerCase().includes(searchLower)
    );
  }, [shiftList, searchQuery]);

  const handleSelect = useCallback((shift) => {
    onSelect(shift.id.toString());
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
        marginHorizontal: 20,
      }}
    >
      <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
        {item.nama || '[No Name]'}
      </Text>
    </TouchableOpacity>
  ), [handleSelect, mode, textColor]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Shift
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {shiftList.length} shift tersedia
                </Text>
              </VStack>
              <TouchableOpacity onPress={onClose}>
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
                placeholder="Cari shift..."
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
            data={filteredShift}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <VStack py={10} alignItems="center">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor} textAlign="center">
                  {searchQuery ? 'Shift tidak ditemukan' : 'Tidak ada data shift'}
                </Text>
              </VStack>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// OprDrv Bottom Sheet Component
const OprDrvBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const oprdrvRedux = useSelector(state => state.oprdrv);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const oprdrvList = useMemo(() => {
    if (Array.isArray(oprdrvRedux?.data)) {
      return oprdrvRedux.data;
    }
    return [];
  }, [oprdrvRedux?.data]);

  const filteredOprDrv = useMemo(() => {
    if (!searchQuery) return oprdrvList;
    const searchLower = searchQuery.toLowerCase();
    return oprdrvList.filter(item => 
      (item.nama || '').toLowerCase().includes(searchLower) ||
      (item.section?.nama || '').toLowerCase().includes(searchLower)
    );
  }, [oprdrvList, searchQuery]);

  const handleSelect = useCallback((oprdrv) => {
    onSelect(oprdrv.id.toString());
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => {
    const section = item.section?.nama || '';
    const role = item.driver === 'Y' ? 'Driver' : 'Operator';
    
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={{
          backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
          marginBottom: 8,
          marginHorizontal: 20,
        }}
      >
        <VStack space={0.5}>
          <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
            {item.nama || '[No Name]'}
          </Text>
          <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
            {section ? `${section} - ${role}` : role}
          </Text>
        </VStack>
      </TouchableOpacity>
    );
  }, [handleSelect, mode, textColor, labelColor]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Operator/Driver
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {oprdrvList.length} operator/driver tersedia
                </Text>
              </VStack>
              <TouchableOpacity onPress={onClose}>
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
                placeholder="Cari operator/driver..."
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
            data={filteredOprDrv}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <VStack py={10} alignItems="center">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor} textAlign="center">
                  {searchQuery ? 'Operator/Driver tidak ditemukan' : 'Tidak ada data operator/driver'}
                </Text>
              </VStack>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Main Filter Modal Component
const FilterTimesheetModal = ({ 
  visible, 
  onClose, 
  onApply,
  onClear,
  tempFilter,
  setTempFilter,
  mode
}) => {
  const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false });
  const [showPenyewaSheet, setShowPenyewaSheet] = useState(false);
  const [showEquipmentSheet, setShowEquipmentSheet] = useState(false);
  const [showShiftSheet, setShowShiftSheet] = useState(false);
  const [showOprDrvSheet, setShowOprDrvSheet] = useState(false);

  const penyewaData = useSelector(state => state.penyewa?.data || []);
  const equipmentData = useSelector(state => state.equipment?.data || []);
  const shiftData = useSelector(state => state.shift?.data || []);
  const oprdrvData = useSelector(state => state.oprdrv?.data || []);

  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const getSelectedPenyewaLabel = () => {
    if (!tempFilter.penyewa_id) return 'Semua Penyewa';
    const penyewa = penyewaData.find(p => p.id.toString() === tempFilter.penyewa_id);
    return penyewa?.nama || 'Semua Penyewa';
  };

  const getSelectedEquipmentLabel = () => {
    if (!tempFilter.equipment_id) return 'Semua Equipment';
    const equipment = equipmentData.find(e => e.id.toString() === tempFilter.equipment_id);
    return equipment ? `${equipment.kode} - ${equipment.nama}` : 'Semua Equipment';
  };

  const getSelectedShiftLabel = () => {
    if (!tempFilter.shift_id) return 'Semua Shift';
    const shift = shiftData.find(s => s.id.toString() === tempFilter.shift_id);
    return shift?.nama || 'Semua Shift';
  };

  const getSelectedKaryawanLabel = () => {
    if (!tempFilter.karyawan_id) return 'Semua Operator/Driver';
    const karyawan = oprdrvData.find(k => k.id.toString() === tempFilter.karyawan_id);
    if (karyawan) {
      const section = karyawan.section?.nama || '';
      const role = karyawan.driver === 'Y' ? 'Driver' : 'Operator';
      return section ? `${karyawan.nama} (${section} - ${role})` : `${karyawan.nama} (${role})`;
    }
    return 'Semua Operator/Driver';
  };

  const handleDateConfirm = (date) => {
    const formatted = moment(date).format('YYYY-MM-DD');
    if (showDatePicker.type === 'start') {
      setTempFilter({ ...tempFilter, startdate: formatted });
    } else {
      setTempFilter({ ...tempFilter, enddate: formatted });
    }
    setShowDatePicker({ type: null, visible: false });
  };

  const handlePenyewaSelect = (id) => {
    setTempFilter({ ...tempFilter, penyewa_id: id });
  };

  const handleEquipmentSelect = (id) => {
    setTempFilter({ ...tempFilter, equipment_id: id });
  };

  const handleShiftSelect = (id) => {
    setTempFilter({ ...tempFilter, shift_id: id });
  };

  const handleKaryawanSelect = (id) => {
    setTempFilter({ ...tempFilter, karyawan_id: id });
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
          }}
        >
          <VStack space={4} p={5}>
            <HStack justifyContent="space-between" alignItems="center" mb={2}>
              <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                Filter Timesheet
              </Text>
              <TouchableOpacity onPress={onClose}>
                <CloseSquare size={28} color={labelColor} />
              </TouchableOpacity>
            </HStack>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              <VStack space={4}>
                {/* Periode */}
                <HStack space={3}>
                  <VStack space={2} flex={1}>
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                      Tanggal Mulai
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
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={tempFilter.startdate ? textColor : labelColor}>
                        {tempFilter.startdate ? moment(tempFilter.startdate).format('DD MMM YYYY') : 'Pilih tanggal'}
                      </Text>
                      <Calendar size={18} color={labelColor} />
                    </TouchableOpacity>
                  </VStack>

                  <VStack space={2} flex={1}>
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                      Tanggal Akhir
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
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={tempFilter.enddate ? textColor : labelColor}>
                        {tempFilter.enddate ? moment(tempFilter.enddate).format('DD MMM YYYY') : 'Pilih tanggal'}
                      </Text>
                      <Calendar size={18} color={labelColor} />
                    </TouchableOpacity>
                  </VStack>
                </HStack>

                {/* Penyewa */}
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Penyewa
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPenyewaSheet(true)}
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
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={tempFilter.penyewa_id ? textColor : labelColor}>
                      {getSelectedPenyewaLabel()}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                {/* Equipment */}
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Equipment
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEquipmentSheet(true)}
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
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={tempFilter.equipment_id ? textColor : labelColor}>
                      {getSelectedEquipmentLabel()}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                {/* Shift */}
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Shift
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowShiftSheet(true)}
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
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={tempFilter.shift_id ? textColor : labelColor}>
                      {getSelectedShiftLabel()}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                {/* Operator/Driver */}
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Operator/Driver
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowOprDrvSheet(true)}
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
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={tempFilter.karyawan_id ? textColor : labelColor}>
                      {getSelectedKaryawanLabel()}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                {/* Status */}
                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Status
                  </Text>
                  <HStack space={2}>
                    <TouchableOpacity
                      onPress={() => setTempFilter({ ...tempFilter, status: 'W' })}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                        backgroundColor: tempFilter.status === 'W' ? '#f59e0b' : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <Text fontSize="sm" fontFamily="Poppins-Medium" color={tempFilter.status === 'W' ? '#ffffff' : textColor}>
                        Waiting
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTempFilter({ ...tempFilter, status: 'A' })}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                        backgroundColor: tempFilter.status === 'A' ? '#10b981' : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <Text fontSize="sm" fontFamily="Poppins-Medium" color={tempFilter.status === 'A' ? '#ffffff' : textColor}>
                        Approved
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTempFilter({ ...tempFilter, status: 'R' })}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                        backgroundColor: tempFilter.status === 'R' ? '#ef4444' : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <Text fontSize="sm" fontFamily="Poppins-Medium" color={tempFilter.status === 'R' ? '#ffffff' : textColor}>
                        Rejected
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </VStack>
              </VStack>
            </ScrollView>

            {/* Footer Buttons */}
            <HStack space={3} mt={4}>
              <TouchableOpacity
                onPress={onClear}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onApply}
                style={{
                  flex: 1,
                  backgroundColor: mode === 'dark' ? '#3b82f6' : '#2563eb',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                  Terapkan Filter
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>

          {/* Date Picker Modal */}
          <DateTimePickerModal
            isVisible={showDatePicker.visible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker({ type: null, visible: false })}
            date={showDatePicker.type === 'start' && tempFilter.startdate 
              ? moment(tempFilter.startdate).toDate() 
              : showDatePicker.type === 'end' && tempFilter.enddate
              ? moment(tempFilter.enddate).toDate()
              : new Date()
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Bottom Sheets */}
      <PenyewaBottomSheet
        visible={showPenyewaSheet}
        onClose={() => setShowPenyewaSheet(false)}
        onSelect={handlePenyewaSelect}
        mode={mode}
      />

      <EquipmentBottomSheet
        visible={showEquipmentSheet}
        onClose={() => setShowEquipmentSheet(false)}
        onSelect={handleEquipmentSelect}
        mode={mode}
      />

      <ShiftBottomSheet
        visible={showShiftSheet}
        onClose={() => setShowShiftSheet(false)}
        onSelect={handleShiftSelect}
        mode={mode}
      />

      <OprDrvBottomSheet
        visible={showOprDrvSheet}
        onClose={() => setShowOprDrvSheet(false)}
        onSelect={handleKaryawanSelect}
        mode={mode}
      />
    </Modal>
  );
};

export default FilterTimesheetModal;
