import { useLocalSearchParams, useRouter } from 'expo-router';
import { Edit, Save2, User } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Badge, Button, Center, Divider, HStack, ScrollView, Spinner, Text, VStack } from 'native-base';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import BottomSheetModal from './components/BottomSheetModal';
import ItemInfoCard from './components/ItemInfoCard';
import PricingSection from './components/PricingSection';
import ValidationFormFields from './components/ValidationFormFields';
import ValidationModal from './components/ValidationModal';
import useValidateItem from './hooks/useValidateItem';

moment.locale('id');

export default function PurchaseRequestValidate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const auth = useSelector(state => state.auth) || {};
  const userProfileRedux = useSelector(state => state.userProfile)?.value || {};
  const userProfile = auth?.user || userProfileRedux;

  console.log('=== VALIDATE PAGE DEBUG ===');
  console.log('Auth State:', auth);
  console.log('Auth User:', auth?.user);
  console.log('UserProfile Redux:', userProfileRedux);
  console.log('Final UserProfile:', userProfile);
  console.log('UserType:', userProfile?.usertype);
  console.log('=========================');
  
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const inputBg = mode === 'dark' ? '#1f2937' : '#f9fafb';
  const isDark = mode === 'dark';

  const {
    loading,
    saving,
    refreshing,
    item,
    barangList,
    pemasokList,
    equipmentList,
    loadingBarang,
    loadingPemasok,
    loadingEquipment,
    loadingMoreBarang,
    loadingMorePemasok,
    loadingMoreEquipment,
    barangPage,
    pemasokPage,
    equipmentPage,
    hasMoreBarang,
    hasMorePemasok,
    hasMoreEquipment,
    searchQuery,
    showModal,
    validationModal,
    formData,
    fieldErrors,
    setFormData,
    setFieldErrors,
    setRefreshing,
    setSearchQuery,
    setShowModal,
    setValidationModal,
    setBarangPage,
    setPemasokPage,
    setEquipmentPage,
    setHasMoreBarang,
    setHasMorePemasok,
    setHasMoreEquipment,
    fetchItemDetail,
    fetchBarangList,
    fetchPemasokList,
    fetchEquipmentList,
    handleSubmit,
  } = useValidateItem(params, userProfile);

  const selectedBarang = useMemo(
    () => barangList.find(b => b.id.toString() === formData.barang_id) || item?.barang,
    [barangList, formData.barang_id, item]
  );

  const selectedPemasok = useMemo(
    () => pemasokList.find(p => p.id.toString() === formData.pemasok_id) || item?.pemasok,
    [pemasokList, formData.pemasok_id, item]
  );

  const selectedEquipment = useMemo(
    () => equipmentList.find(e => e.id.toString() === formData.equipment_id) || item?.equipment,
    [equipmentList, formData.equipment_id, item]
  );
  
  const qtyDiminta = parseFloat(item?.qty_req) || 0;
  const qtyDisetujui = parseFloat(formData.qty_acc) || 0;
  const hargaSatuan = parseFloat(formData.harga) || 0;
  const ppnAmount = parseFloat(formData.ppn) || 0;
  const totalHarga = qtyDisetujui * hargaSatuan;
  const grandTotal = totalHarga + ppnAmount;

  const filteredBarangList = useMemo(() => {
    if (!searchQuery) return barangList;
    const query = searchQuery.toLowerCase();
    return barangList.filter(barang => {
      const nama = (barang.nama || barang.nama_barang || '').toLowerCase();
      const kode = (barang.kode || barang.kode_barang || '').toLowerCase();
      return nama.includes(query) || kode.includes(query);
    });
  }, [barangList, searchQuery]);

  const filteredEquipmentList = useMemo(() => {
    if (!searchQuery) return equipmentList;
    const query = searchQuery.toLowerCase();
    return equipmentList.filter(equipment => {
      const nama = (equipment.nama || '').toLowerCase();
      const kode = (equipment.kode || '').toLowerCase();
      const model = (equipment.model || '').toLowerCase();
      return nama.includes(query) || kode.includes(query) || model.includes(query);
    });
  }, [equipmentList, searchQuery]);

  const searchTimeoutRef = useRef(null);
  const allPemasokLoadedRef = useRef(false);

  useEffect(() => {
    if (showModal.type === 'pemasok' && showModal.visible && searchQuery) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        if (!allPemasokLoadedRef.current) {
          setPemasokPage(1);
          setHasMorePemasok(false);
          fetchPemasokList(1, false, searchQuery);
          allPemasokLoadedRef.current = true;
        }
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, showModal.type, showModal.visible]);

  const filteredPemasokList = useMemo(() => {
    if (!searchQuery) {
      return pemasokList;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = pemasokList.filter(pemasok => {
      const nama = (pemasok.nama_pemasok || pemasok.nama || '').toLowerCase();
      const alamat = (pemasok.alamat || '').toLowerCase();
      return nama.includes(query) || alamat.includes(query);
    });
    return filtered;
  }, [pemasokList, searchQuery]);

  const openBottomSheet = useCallback((type, title) => {
    
    setShowModal({ visible: true, type, title });
    setSearchQuery('');
    
    if (type === 'barang') {
      setBarangPage(1);
      setHasMoreBarang(true);
      if (barangList.length === 0) {
        fetchBarangList(1, false);
      }
    } else if (type === 'pemasok') {
      setPemasokPage(1);
      setHasMorePemasok(true);
      if (pemasokList.length === 0) {
        fetchPemasokList(1, false, '');
      }
    } else if (type === 'equipment') {
      setEquipmentPage(1);
      setHasMoreEquipment(true);
      if (equipmentList.length === 0) {
        fetchEquipmentList(1, false);
      }
    }
  }, [barangList.length, pemasokList.length, equipmentList.length, fetchBarangList, fetchPemasokList, fetchEquipmentList]);

  const loadMoreBarang = useCallback(() => {
    if (!loadingMoreBarang && hasMoreBarang && !searchQuery) {
      const nextPage = barangPage + 1;
      setBarangPage(nextPage);
      fetchBarangList(nextPage, true);
    }
  }, [loadingMoreBarang, hasMoreBarang, searchQuery, barangPage]);

  const loadMorePemasok = useCallback(() => {
    if (!loadingMorePemasok && hasMorePemasok) {
      const nextPage = pemasokPage + 1;
      setPemasokPage(nextPage);
      fetchPemasokList(nextPage, true, searchQuery);
    }
  }, [loadingMorePemasok, hasMorePemasok, searchQuery, pemasokPage, fetchPemasokList]);

  const loadMoreEquipment = useCallback(() => {
    if (!loadingMoreEquipment && hasMoreEquipment && !searchQuery) {
      const nextPage = equipmentPage + 1;
      setEquipmentPage(nextPage);
      fetchEquipmentList(nextPage, true);
    }
  }, [loadingMoreEquipment, hasMoreEquipment, searchQuery, equipmentPage]);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const handleScroll = useCallback(({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent)) {
      if (showModal.type === 'barang') {
        loadMoreBarang();
      } else if (showModal.type === 'pemasok') {
        loadMorePemasok();
      } else if (showModal.type === 'equipment') {
        loadMoreEquipment();
      }
    }
  }, [isCloseToBottom, showModal.type, loadMoreBarang, loadMorePemasok, loadMoreEquipment]);

  const handleSelectItem = useCallback((item) => {
    const { type } = showModal;
    if (type === 'barang') {
      setFormData(prev => ({ ...prev, barang_id: item.id.toString() }));
    } else if (type === 'pemasok') {
      setFormData(prev => ({ ...prev, pemasok_id: item.id.toString() }));
    } else if (type === 'equipment') {
      setFormData(prev => ({ ...prev, equipment_id: item.id.toString() }));
    }
    setShowModal({ visible: false, type: '', title: '' });
  }, [showModal]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItemDetail();
  };

  if (loading) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Validasi Item PR" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1} bg={backgroundColor}>
          <Spinner size="lg" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
          <Text mt={2} fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
            Memuat data...
          </Text>
        </Center>
      </AppScreen>
    );
  }

  if (!item) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Validasi Item PR" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1} bg={backgroundColor}>
          <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
            Data item tidak ditemukan
          </Text>
        </Center>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <HeaderScreen 
        title="Validasi Item PR" 
        onBack={() => router.back()} 
        onThemes={true}
      />
      
      <ScrollView
        flex={1}
        bg={backgroundColor}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack p={4} space={4}>
          {/* Header */}
          <VStack
            bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
            p={5}
            rounded="2xl"
            space={2}
            shadow={2}
          >
            <HStack space={3} alignItems="center">
              <VStack
                bg={mode === 'dark' ? '#1e3a8a' : '#2563eb'}
                p={2.5}
                rounded="xl"
              >
                <Edit size={28} color="#ffffff" variant="Bold" />
              </VStack>
              <VStack flex={1}>
                <Text fontSize="lg" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                  Form Validasi Item
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                  Procurement validation form
                </Text>
              </VStack>
              <Badge
                bg={mode === 'dark' ? '#92400e' : '#fef3c7'}
                rounded="lg"
                px={3}
                py={1}
                _text={{
                  fontSize: 10,
                  fontFamily: 'Quicksand-Bold',
                  color: mode === 'dark' ? '#fbbf24' : '#d97706',
                }}
              >
                NEW
              </Badge>
            </HStack>
          </VStack>

          {/* Item Info Card */}
          <ItemInfoCard
            item={item}
            qtyDiminta={qtyDiminta}
            qtyDisetujui={qtyDisetujui}
            mode={mode}
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
          />

          {/* Validation Form Fields */}
          <ValidationFormFields
            mode={mode}
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            inputBg={inputBg}
            loadingBarang={loadingBarang}
            loadingPemasok={loadingPemasok}
            loadingEquipment={loadingEquipment}
            selectedBarang={selectedBarang}
            selectedPemasok={selectedPemasok}
            selectedEquipment={selectedEquipment}
            barangList={barangList}
            pemasokList={pemasokList}
            equipmentList={equipmentList}
            formData={formData}
            fieldErrors={fieldErrors}
            setFormData={setFormData}
            setFieldErrors={setFieldErrors}
            qtyDiminta={qtyDiminta}
            openBottomSheet={openBottomSheet}
          />

          {/* Pricing Section */}
          <PricingSection
            mode={mode}
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            inputBg={inputBg}
            formData={formData}
            setFormData={setFormData}
            qtyDisetujui={qtyDisetujui}
            hargaSatuan={hargaSatuan}
            ppnAmount={ppnAmount}
            totalHarga={totalHarga}
            grandTotal={grandTotal}
          />

          {/* Validation Info */}
          <VStack
            bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
            p={4}
            rounded="xl"
            space={2}
            borderWidth={1}
            borderColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
          >
            <HStack space={2} alignItems="center">
              <User size={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                Informasi Validasi
              </Text>
            </HStack>
            <Divider bg={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                Divalidasi oleh
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                {userProfile?.name || '-'}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                Tanggal & Waktu
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                {moment().format('DD MMM YYYY, HH:mm')}
              </Text>
            </HStack>
          </VStack>

          {/* Submit Button */}
          <Button
            onPress={() => handleSubmit(router)}
            isLoading={saving}
            isLoadingText="Menyimpan validasi..."
            isDisabled={saving}
            bg={mode === 'dark' ? '#10b981' : '#059669'}
            _pressed={{ bg: mode === 'dark' ? '#065f46' : '#047857' }}
            _disabled={{ 
              bg: mode === 'dark' ? '#374151' : '#d1d5db',
              opacity: 0.6 
            }}
            rounded="xl"
            py={4}
            shadow={3}
            _text={{
              fontFamily: 'Quicksand-Bold',
              fontSize: 'md',
            }}
            leftIcon={!saving && <Save2 size={22} color="#ffffff" variant="Bold" />}
            startIcon={saving && <Spinner color="white" size="sm" />}
          >
            {saving ? 'Menyimpan...' : 'Validasi & Simpan Item'}
          </Button>

          <VStack space={1} pb={2}>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
              Pastikan semua data sudah benar sebelum validasi
            </Text>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        visible={showModal.visible}
        type={showModal.type}
        title={showModal.title}
        isDark={isDark}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={() => setShowModal({ visible: false, type: '', title: '' })}
        filteredBarangList={filteredBarangList}
        filteredPemasokList={filteredPemasokList}
        filteredEquipmentList={filteredEquipmentList}
        barangList={barangList}
        pemasokList={pemasokList}
        equipmentList={equipmentList}
        loadingBarang={loadingBarang}
        loadingPemasok={loadingPemasok}
        loadingEquipment={loadingEquipment}
        loadingMoreBarang={loadingMoreBarang}
        loadingMorePemasok={loadingMorePemasok}
        loadingMoreEquipment={loadingMoreEquipment}
        hasMoreBarang={hasMoreBarang}
        hasMorePemasok={hasMorePemasok}
        hasMoreEquipment={hasMoreEquipment}
        onSelectItem={handleSelectItem}
        onScroll={handleScroll}
      />

      {/* Validation Modal */}
      <ValidationModal
        visible={validationModal.visible}
        type={validationModal.type}
        title={validationModal.title}
        message={validationModal.message}
        confirmText={validationModal.type === 'success' ? 'OK' : validationModal.type === 'confirm' ? 'Ya, Validasi' : 'Tutup'}
        cancelText="Batal"
        onConfirm={validationModal.onConfirm}
        onCancel={() => setValidationModal(prev => ({ ...prev, visible: false }))}
        mode={mode}
        showCancel={validationModal.type === 'confirm'}
        loading={saving}
      />
    </AppScreen>
  );
}
