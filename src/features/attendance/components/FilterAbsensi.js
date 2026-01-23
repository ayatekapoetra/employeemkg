import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TouchableOpacity, Modal, FlatList, TextInput, View, StyleSheet, Keyboard } from 'react-native';
import { VStack, Text, HStack, Button } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarSearch, CalendarTick, UserSearch, CloseSquare, SearchNormal1 } from 'iconsax-react-native';
import moment from 'moment';
import { DatePickerModal } from '../../../components/common';
import { getKaryawan } from '../../../store/slices/karyawanSlice';

// Separate KaryawanItem component to prevent re-renders
const KaryawanItem = React.memo(({ item, isSelected, onSelect, mode, borderColor, sheetItemBg, textColor, labelColor }) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      style={{
        backgroundColor: isSelected ? (mode === 'dark' ? '#374151' : '#e5e7eb') : sheetItemBg,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: borderColor,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text
            fontSize="sm"
            fontFamily="Quicksand-Bold"
            color={textColor}
            numberOfLines={1}
          >
            {item.nama}
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Poppins-Regular"
            color={labelColor}
          >
            {item.section || '-'}
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Poppins-Regular"
            color={labelColor}
          >
            {item.ktp || '-'}
          </Text>
        </View>
        {isSelected && (
          <Text fontSize={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

// Separate BottomSheet component
const KaryawanBottomSheet = ({ 
  visible, 
  onClose, 
  karyawanList, 
  filteredKaryawan,
  karyawanSearch,
  setKaryawanSearch,
  qstring, 
  onSelectKaryawan, 
  onClearKaryawan,
  mode 
}) => {
  const inputRef = useRef(null);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const borderColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const sheetItemBg = mode === 'dark' ? '#374151' : '#f9fafb';

  const handleSelect = useCallback((item) => {
    onSelectKaryawan(item);
  }, [onSelectKaryawan]);

  const listData = useMemo(() => {
    return filteredKaryawan;
  }, [filteredKaryawan]);

  const renderItem = useCallback(({ item }) => {
    const isSelected = qstring.karyawan?.id === item.id;
    return (
      <KaryawanItem
        item={item}
        isSelected={isSelected}
        onSelect={handleSelect}
        mode={mode}
        borderColor={borderColor}
        sheetItemBg={sheetItemBg}
        textColor={textColor}
        labelColor={labelColor}
      />
    );
  }, [qstring.karyawan, handleSelect, mode, borderColor, sheetItemBg, textColor, labelColor]);

  const keyExtractor = useCallback((item) => item.id?.toString() || 'all', []);

  const ListEmptyComponent = useCallback(() => (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <Text
        fontSize="sm"
        fontFamily="Poppins-Regular"
        color={labelColor}
        textAlign="center"
      >
        {karyawanSearch ? 'Karyawan tidak ditemukan' : 'Tidak ada data karyawan'}
      </Text>
    </View>
  ), [karyawanSearch, labelColor]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheetContainer, { backgroundColor: cardBg }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                Pilih Karyawan
              </Text>
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                {karyawanList.length} karyawan tersedia
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <CloseSquare size={28} color={labelColor} />
            </TouchableOpacity>
          </View>

          {/* Search Input - Using pure React Native View */}
          <View style={[styles.searchContainer, { backgroundColor: sheetItemBg, borderColor: borderColor }]}>
            <SearchNormal1 size={20} color={labelColor} />
            <TextInput
              ref={inputRef}
              value={karyawanSearch}
              onChangeText={setKaryawanSearch}
              placeholder="Cari nama karyawan..."
              placeholderTextColor={labelColor}
              style={[styles.searchInput, { color: textColor }]}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {karyawanSearch.length > 0 && (
              <TouchableOpacity onPress={() => setKaryawanSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ color: labelColor, fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <FlatList
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={false}
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

// Usertype yang diizinkan untuk select karyawan
const ALLOWED_USERTYPES = ['developer', 'administrator', 'hrd', 'pjo', 'direktur', 'wadir', 'pengawas', 'koordinator'];

export default function FilterAbsensi({ onApplyFilter, setFilter, qstring, setQstring }) {
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes).value;
  const { user } = useSelector(state => state.auth);
  const karyawanList = useSelector(state => state.karyawan?.data) || [];
  const [openKaryawan, setOpenKaryawan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [karyawanSearch, setKaryawanSearch] = useState('');

  // Check if user can select karyawan
  const userType = (user?.usertype || '').toLowerCase();
  const canSelectKaryawan = ALLOWED_USERTYPES.includes(userType);

  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const lineColor = mode === 'dark' ? '#3a3c4a' : '#e5e7eb';
  const borderColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const sheetItemBg = mode === 'dark' ? '#374151' : '#f9fafb';

  const filteredKaryawan = useMemo(() => {
    return karyawanList.filter(item =>
      String(item?.nama || '').toLowerCase().includes(karyawanSearch.toLowerCase())
    );
  }, [karyawanList, karyawanSearch]);

  useEffect(() => {
    if (!karyawanList || karyawanList.length === 0) {
      dispatch(getKaryawan());
    }
  }, [dispatch]);

  const openKaryawanSheet = useCallback(() => {
    setKaryawanSearch('');
    setOpenKaryawan(true);
  }, []);

  const closeKaryawanSheet = useCallback(() => {
    setOpenKaryawan(false);
    setKaryawanSearch('');
  }, []);

  const handleSelectKaryawan = useCallback((item) => {
    setQstring({
      ...qstring,
      karyawan_id: item?.id || '',
      karyawan: item || null,
    });
    closeKaryawanSheet();
  }, [qstring, closeKaryawanSheet]);

  const handleClearKaryawan = useCallback(() => {
    setQstring({
      ...qstring,
      karyawan_id: '',
      karyawan: null,
    });
    closeKaryawanSheet();
  }, [qstring, closeKaryawanSheet]);

  const onResetHandle = async () => {
    setQstring({
      karyawan_id: user?.karyawan?.id,
      karyawan: user?.karyawan,
      dateStart: moment().add(-1, 'month').format('YYYY-MM-DD'),
      dateEnd: moment().format('YYYY-MM-DD'),
      verify_sts: '',
      approve_sts: '',
    });
    onApplyFilter();
    setFilter(false);
  };

  return (
    <VStack h="full">
      <VStack px={3} py={2} flex={1} rounded="md" borderWidth={1} borderColor={borderColor}>
        {canSelectKaryawan && (
          <VStack h="75px" borderBottomWidth={0.5} borderBottomColor={lineColor}>
            <Text fontFamily="Poppins-Regular" color={textColor}>
              Karyawan :
            </Text>
            <TouchableOpacity onPress={openKaryawanSheet}>
              <HStack py={2} space={2} alignItems="center">
                <UserSearch size="32" color="#555555" variant="Bulk" />
                <Text fontSize={20} fontFamily="Poppins-Bold" color={labelColor}>
                  {qstring.karyawan?.nama || 'Pilih Karyawan'}
                </Text>
              </HStack>
            </TouchableOpacity>
          </VStack>
        )}

        <VStack mt={2} h="75px" borderBottomWidth={0.5} borderBottomColor={lineColor}>
          <Text fontFamily="Poppins-Regular" color={textColor}>
            Mulai Tanggal :
          </Text>
          <TouchableOpacity onPress={() => setShowStartDate(true)}>
            <HStack py={2} space={2} alignItems="center">
              <CalendarSearch size="32" color="#555555" variant="Bulk" />
              <Text fontSize={20} fontFamily="Poppins-Bold" color={labelColor}>
                {moment(qstring.dateStart).format('dddd, DD MMMM YYYY')}
              </Text>
            </HStack>
          </TouchableOpacity>
        </VStack>

        <DatePickerModal
          isOpen={showStartDate}
          onClose={() => setShowStartDate(false)}
          onConfirm={(date) => setQstring({ ...qstring, dateStart: moment(date).format('YYYY-MM-DD') })}
          date={new Date(qstring.dateStart)}
          title="Mulai Tanggal"
        />

        <VStack mt={2} h="75px" borderBottomWidth={0.5} borderBottomColor={lineColor}>
          <Text fontFamily="Poppins-Regular" color={textColor}>
            Hingga Tanggal :
          </Text>
          <TouchableOpacity onPress={() => setShowEndDate(true)}>
            <HStack py={2} space={2} alignItems="center">
              <CalendarTick size="32" color="#555555" variant="Bulk" />
              <Text fontSize={20} fontFamily="Poppins-Bold" color={labelColor}>
                {moment(qstring.dateEnd).format('dddd, DD MMMM YYYY')}
              </Text>
            </HStack>
          </TouchableOpacity>
        </VStack>

        <DatePickerModal
          isOpen={showEndDate}
          onClose={() => setShowEndDate(false)}
          onConfirm={(date) => setQstring({ ...qstring, dateEnd: moment(date).format('YYYY-MM-DD') })}
          date={new Date(qstring.dateEnd)}
          title="Hingga Tanggal"
        />


      </VStack>

      <HStack space={2} mt={3}>
        <Button flex={1} bg="muted.400" onPress={onResetHandle} _text={{ fontFamily: 'Poppins-SemiBold' }}>
          Reset
        </Button>
        <Button flex={1} bg="error.600" onPress={onApplyFilter} _text={{ fontFamily: 'Poppins-SemiBold' }}>
          Terapkan
        </Button>
      </HStack>

      {/* Bottom Sheet - Pilih Karyawan (only for allowed usertypes) */}
      {canSelectKaryawan && (
        <KaryawanBottomSheet
          visible={openKaryawan}
          onClose={closeKaryawanSheet}
          karyawanList={karyawanList}
          filteredKaryawan={filteredKaryawan}
          karyawanSearch={karyawanSearch}
          setKaryawanSearch={setKaryawanSearch}
          qstring={qstring}
          onSelectKaryawan={handleSelectKaryawan}
          onClearKaryawan={handleClearKaryawan}
          mode={mode}
        />
      )}
    </VStack>
  );
}
