import { useLocalSearchParams, useRouter } from 'expo-router';
import { Edit, Save2, TickCircle, User } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Badge, Button, Center, Divider, HStack, ScrollView, Spinner, Text, VStack } from 'native-base';
import { useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import BottomSheetModal from './components/BottomSheetModal';
import ItemInfoCard from './components/ItemInfoCard';
import PricingSection from './components/PricingSection';
import ValidationFormFields from './components/ValidationFormFields';
import ValidationModal from './components/ValidationModal';
import useApproveItem from './hooks/useApproveItem';

moment.locale('id');

export default function PurchaseRequestApprove() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const auth = useSelector(state => state.auth) || {};
  const userProfileRedux = useSelector(state => state.userProfile)?.value || {};
  const userProfile = auth?.user || userProfileRedux;

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
  } = useApproveItem(params, userProfile);

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

  const filteredBarangList = useMemo(() => {
    if (!searchQuery) return barangList;
    const query = searchQuery.toLowerCase();
    return barangList.filter(barang => {
      const nama = (barang.nama || barang.nama_barang || '').toLowerCase();
      const kode = (barang.kode || barang.kode_barang || '').toLowerCase();
      return nama.includes(query) || kode.includes(query);
    });
  }, [barangList, searchQuery]);

  const filteredPemasokList = useMemo(() => {
    if (!searchQuery) return pemasokList;
    const query = searchQuery.toLowerCase();
    return pemasokList.filter(pemasok => {
      const nama = (pemasok.nama || pemasok.nama_pemasok || '').toLowerCase();
      const alamat = (pemasok.alamat || '').toLowerCase();
      return nama.includes(query) || alamat.includes(query);
    });
  }, [pemasokList, searchQuery]);

  const filteredEquipmentList = useMemo(() => {
    if (!searchQuery) return equipmentList;
    const query = searchQuery.toLowerCase();
    return equipmentList.filter(equipment => {
      const nama = (equipment.nama || equipment.nama_equipment || '').toLowerCase();
      const kode = (equipment.kode || equipment.kode_equipment || '').toLowerCase();
      return nama.includes(query) || kode.includes(query);
    });
  }, [equipmentList, searchQuery]);

  const qtyDiminta = useMemo(() => parseFloat(item?.qty_req) || 0, [item]);
  const qtyDisetujui = useMemo(() => parseFloat(formData.qty_acc) || 0, [formData.qty_acc]);
  const hargaSatuan = useMemo(() => parseFloat(formData.harga) || 0, [formData.harga]);
  const ppnAmount = useMemo(() => parseFloat(formData.ppn) || 0, [formData.ppn]);
  const totalHarga = useMemo(() => qtyDisetujui * hargaSatuan, [qtyDisetujui, hargaSatuan]);
  const grandTotal = useMemo(() => totalHarga + ppnAmount, [totalHarga, ppnAmount]);

  const openBottomSheet = useCallback((type, title) => {
    setShowModal({ visible: true, type, title });
  }, []);

  const handleSelectItem = useCallback((item) => {
    const { type } = showModal;
    if (type === 'barang') {
      setFormData(prev => ({ ...prev, barang_id: item.id.toString() }));
      if (fieldErrors.barang_id) {
        setFieldErrors(prev => ({ ...prev, barang_id: false }));
      }
    } else if (type === 'pemasok') {
      setFormData(prev => ({ ...prev, pemasok_id: item.id.toString() }));
      if (fieldErrors.pemasok_id) {
        setFieldErrors(prev => ({ ...prev, pemasok_id: false }));
      }
    } else if (type === 'equipment') {
      setFormData(prev => ({ ...prev, equipment_id: item.id.toString() }));
    }
    setShowModal({ visible: false, type: '', title: '' });
  }, [showModal, fieldErrors]);

  const handleLoadMoreBarang = useCallback(() => {
    if (!loadingMoreBarang && hasMoreBarang) {
      const nextPage = barangPage + 1;
      setBarangPage(nextPage);
      fetchBarangList(nextPage, true);
    }
  }, [loadingMoreBarang, hasMoreBarang, barangPage, fetchBarangList]);

  const handleLoadMorePemasok = useCallback(() => {
    if (!loadingMorePemasok && hasMorePemasok) {
      const nextPage = pemasokPage + 1;
      setPemasokPage(nextPage);
      fetchPemasokList(nextPage, true);
    }
  }, [loadingMorePemasok, hasMorePemasok, pemasokPage, fetchPemasokList]);

  const handleLoadMoreEquipment = useCallback(() => {
    if (!loadingMoreEquipment && hasMoreEquipment) {
      const nextPage = equipmentPage + 1;
      setEquipmentPage(nextPage);
      fetchEquipmentList(nextPage, true);
    }
  }, [loadingMoreEquipment, hasMoreEquipment, equipmentPage, fetchEquipmentList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItemDetail();
  }, [fetchItemDetail]);

  if (loading || !item) {
    return (
      <AppScreen backgroundColor={backgroundColor}>
        <HeaderScreen title="Update Item" onBack={() => router.back()} />
        <LoadingHauler
          message="Memuat data..."
          subMessage="Mengambil data item untuk update"
          type="default"
        />
      </AppScreen>
    );
  }

  return (
      <AppScreen backgroundColor={backgroundColor}>
        <HeaderScreen title="Update Item" onBack={() => router.back()} />

      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
          />
        }
      >
        <VStack p={4} space={4} pb={8}>

          {/* Item Info Card */}
          <ItemInfoCard
            mode={mode}
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            item={item}
            selectedBarang={selectedBarang}
            qtyDiminta={qtyDiminta}
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

          {/* Update Info */}
          <VStack
            bg={mode === 'dark' ? '#1e3a8a' : '#dbeafe'}
            p={4}
            rounded="2xl"
            borderWidth={1}
            borderColor={mode === 'dark' ? '#1e40af' : '#93c5fd'}
            space={3}
          >
            <HStack space={2} alignItems="center">
              <Edit size={18} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                Informasi Update
              </Text>
            </HStack>

            <Divider bg={mode === 'dark' ? '#1e40af' : '#93c5fd'} />

            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={2} alignItems="center">
                <User size={16} color={mode === 'dark' ? '#93c5fd' : '#2563eb'} />
                <Text fontSize="sm" fontFamily="Poppins-Light" color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}>
                  Diupdate oleh
                </Text>
              </HStack>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#1e3a8a'}>
                {userProfile?.name || userProfile?.username || '-'}
              </Text>
            </HStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" fontFamily="Poppins-Light" color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}>
                Tanggal & Waktu
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#1e3a8a'}>
                {moment().format('DD MMM YYYY, HH:mm')}
              </Text>
            </HStack>
          </VStack>

          {/* Submit Button */}
          <Button
            onPress={() => handleSubmit(router)}
            isLoading={saving}
            isLoadingText="Menyimpan perubahan..."
            isDisabled={saving}
            bg={mode === 'dark' ? '#1e40af' : '#2563eb'}
            _pressed={{ bg: mode === 'dark' ? '#1e3a8a' : '#1d4ed8' }}
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
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>

          <VStack space={1} pb={2}>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
              * Field dengan tanda bintang wajib diisi
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#93c5fd' : '#2563eb'} textAlign="center">
              ℹ️ Anda dapat mengupdate data item tanpa mengubah status approval
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
        onScroll={handleLoadMoreBarang}
      />

      {/* Validation Modal */}
      <ValidationModal
        visible={validationModal.visible}
        type={validationModal.type}
        title={validationModal.title}
        message={validationModal.message}
        onConfirm={validationModal.onConfirm}
        onCancel={() => setValidationModal(prev => ({ ...prev, visible: false }))}
        mode={mode}
      />
    </AppScreen>
  );
}
