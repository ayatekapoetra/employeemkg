import React, { useState, useEffect, useCallback, Fragment, useMemo } from 'react'
import { View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { HStack, Text, VStack, Pressable } from 'native-base'
import { useRouter } from 'expo-router'
import { Filter, Calendar, Clock, Location } from 'iconsax-react-native'
import { useSelector, useDispatch } from 'react-redux'
import { COLORS } from '../../../src/constants/colors'

import { AppScreen, HeaderScreen } from '../../../src/components/common'
import { getActivityPlanList } from '../../../src/store/slices/activityPlanSlice'
import { getKaryawan } from '../../../src/store/slices/karyawanSlice'
import { getEquipment } from '../../../src/store/slices/equipmentSlice'
import { getLokasiPit } from '../../../src/store/slices/lokasiPitSlice'
import { getCabang } from '../../../src/store/slices/cabangSlice'
import FilterBottomSheet from './components/FilterBottomSheet'
import LoadingHauler from '../../../src/components/common/LoadingHauler'
import moment from 'moment'

const STATUS_OPTIONS = [
  { key: 'BEROPERASI', label: 'BEROPERASI', color: '#22c55e', colorDark: '#166534' },
  { key: 'STANDBY', label: 'STANDBY', color: '#3b82f6', colorDark: '#1d4ed8' },
  { key: 'NO JOB', label: 'NO JOB', color: '#f59e0b', colorDark: '#92400e' },
  { key: 'NO OPERATOR', label: 'NO OPERATOR', color: '#8b5cf6', colorDark: '#6d28d9' },
  { key: 'NO DRIVER', label: 'NO DRIVER', color: '#8b5cf6', colorDark: '#6d28d9' },
  { key: 'BREAKDOWN', label: 'BREAKDOWN', color: '#ef4444', colorDark: '#991b1b' },
]

const SHIFT_OPTIONS = [
  { key: 'PAGI', label: 'PAGI' },
  { key: 'MALAM', label: 'MALAM' },
]

const CTG_OPTIONS = [
  { key: 'HE', label: 'HE (Alat Berat)' },
  { key: 'DT', label: 'DT (Dumptruck)' },
]

export default function EquipmentPlanScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.activityPlan);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: '',
    shift: '',
    ctg: '',
    equipment_id: '',
    karyawan_id: '',
    lokasi_id: '',
    cabang_id: ''
  });

  const mode = useSelector(state => state.themes)?.value || 'light';
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;

  const equipmentRedux = useSelector((state) => state.equipment)
  const karyawanRedux = useSelector((state) => state.karyawan)
  const lokasiRedux = useSelector((state) => state.lokasiPit)
  const cabangRedux = useSelector((state) => state.cabang)

  useEffect(() => {
    dispatch(getEquipment())
    dispatch(getKaryawan())
    dispatch(getLokasiPit())
    dispatch(getCabang())
  }, [dispatch])

  // Fungsi untuk mendapatkan status text dan warna
  const getStatusInfo = (statusCode) => {
    switch (statusCode) {
      case 'BEROPERASI':
        return {
          text: 'BEROPERASI',
          textIndo: 'BEROPERASI',
          bgColor: '#d1fae5', // green-100
          textColor: '#065f46', // green-800
          bgColorDark: '#064e3b',
          textColorDark: '#d1fae5'
        };
      case 'STANDBY':
        return {
          text: 'STANDBY',
          textIndo: 'STANDBY',
          bgColor: '#dbeafe', // blue-100
          textColor: '#1e40af', // blue-800
          bgColorDark: '#1e3a8a',
          textColorDark: '#dbeafe'
        };
      case 'NO JOB':
        return {
          text: 'NO JOB',
          textIndo: 'NO JOB',
          bgColor: '#fef3c7', // yellow-100
          textColor: '#92400e', // yellow-800
          bgColorDark: '#451a03',
          textColorDark: '#fef3c7'
        };
      case 'NO OPERATOR':
        return {
          text: 'NO OPERATOR',
          textIndo: 'NO OPERATOR',
          bgColor: '#fef9c3', // yellow-100
          textColor: '#854d0e', // amber-800
          bgColorDark: '#78350f',
          textColorDark: '#fef3c7'
        };
      case 'NO DRIVER':
        return {
          text: 'NO DRIVER',
          textIndo: 'NO DRIVER',
          bgColor: '#fef9c3', // yellow-100
          textColor: '#854d0e', // amber-800
          bgColorDark: '#78350f',
          textColorDark: '#fef3c7'
        };
      case 'BREAKDOWN':
        return {
          text: 'BREAKDOWN',
          textIndo: 'BREAKDOWN',
          bgColor: '#fee2e2', // red-100
          textColor: '#991b1b', // red-800
          bgColorDark: '#7f1d1d',
          textColorDark: '#fee2e2'
        };
      default:
        return {
          text: 'Unknown',
          textIndo: 'Unknown',
          bgColor: '#f3f4f6', // gray-100
          textColor: '#1f2937', // gray-800
          bgColorDark: '#374151',
          textColorDark: '#f3f4f6'
        };
    }
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    const f = selectedFilters
    return f.status || f.shift || f.ctg || f.equipment_id || f.karyawan_id || f.lokasi_id || f.cabang_id
  }, [selectedFilters])

  // Fungsi untuk load data
  const fetchData = useCallback(async (overrideFilters) => {
    const effectiveFilters = overrideFilters || selectedFilters;
    console.log('[EquipmentPlan] Fetching data with filters:', effectiveFilters);
    try {
      const params = {
        status: effectiveFilters.status || undefined,
        shift: effectiveFilters.shift || undefined,
        ctg: effectiveFilters.ctg || undefined,
        equipment_id: effectiveFilters.equipment_id || undefined,
        karyawan_id: effectiveFilters.karyawan_id || undefined,
        lokasi_id: effectiveFilters.lokasi_id || undefined,
        cabang_id: effectiveFilters.cabang_id || undefined,
      }

      await dispatch(getActivityPlanList(params)).unwrap();
      console.log('[EquipmentPlan] Data fetched successfully');
    } catch (err) {
      console.error('[EquipmentPlan] Error fetching data:', err);
    }
  }, [dispatch, selectedFilters]);

  // Load data saat component mount
  useEffect(() => {
    console.log('[EquipmentPlan] Component mounted, fetching data...');
    fetchData();
  }, [fetchData]);

  // Fungsi untuk refresh
  const onRefresh = async () => {
    console.log('[EquipmentPlan] Refreshing data...');
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    console.log('[EquipmentPlan] Refresh completed');
  };

  // Fungsi untuk apply filter
  const handleApplyFilter = async (newFilters) => {
    console.log('[EquipmentPlan] Applying filters:', newFilters);
    setSelectedFilters(newFilters);
    setFilterVisible(false);
    await fetchData(newFilters);
  };

  // Render item untuk FlatList
  const renderEquipmentPlanItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const manuf = item.equipment?.manufaktur || item.equipment?.manufacturer || ''
    const model = item.equipment?.model || ''
    const subtitleEquip = [manuf, model].filter(Boolean).join(' - ') || '-'
    const cabangNama = item.cabang?.nama || item.cabang?.name || '-'
    const area = item.cabang?.area || item.cabang?.area_name || item.cabang?.cabang?.area || '-'
    const bisnis = item.cabang?.bisnis?.nama || item.cabang?.bisnis?.name || item.cabang?.bisnis?.initial || '-'
    const cabangSubtitle = `${area || '-'} - ${bisnis || '-'}`
    return (
      <Pressable
        onPress={() => router.push(`/operational/equipment-plan/${item.id}`)}
        _pressed={{ opacity: 0.7 }}>
        <VStack
          p={4}
          mx={2}
          mb={2}
          bg={cardBg}
          rounded="xl"
          borderWidth={1}
          borderColor={cardBorder}>
          <VStack flex={1}>
            <HStack justifyContent={"space-between"} alignItems={"flex-start"}>
              <Text color={textColor} fontFamily={"Poppins-Bold"} fontSize={16}>
                {item.equipment?.kode || `EQ-${item.equipment_id}`}
              </Text>
              {/* Status Badge */}
              <View style={{
                backgroundColor: mode === 'dark' ? statusInfo.bgColorDark : statusInfo.bgColor,
                paddingHorizontal: 12,
                paddingVertical: 2,
                borderRadius: 8,
                marginLeft: 8
              }}>
                <Text style={{
                  color: mode === 'dark' ? statusInfo.textColorDark : statusInfo.textColor,
                  fontSize: 11,
                  fontWeight: '600'
                }}>
                  {statusInfo.textIndo}
                </Text>
              </View>
            </HStack>
            <Text color={subtitleColor} fontSize={11}>
              {subtitleEquip}
            </Text>
            <Text color={subtitleColor} fontSize={11}>
              Cabang: {cabangNama}  ·  {cabangSubtitle}
            </Text>
            <HStack space={3} justifyContent={'space-between'}>
              <HStack alignItems={'center'} space={1}>
                <Calendar size={14} color={textColor} />
                <Text color={textColor} fontSize={12}>
                  {item.date_ops ? moment(item.date_ops).format('DD MMM YYYY') : '-'}
                </Text>
              </HStack>
              <HStack alignItems={'center'} space={1}>
                <Clock size={14} color={textColor} />
                <Text color={textColor} fontSize={12}>
                  Shift {item.shift || '-'}
                </Text>
              </HStack>
            </HStack>
            <VStack
              p={2}
              mt={2}
              rounded={'md'}
              justifyContent="space-between"
              bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}>
              <VStack flex={1}>
                <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
                  {item.kegiatan?.nama || '-'}
                </Text>
                <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={subtitleColor}>
                  {item.keterangan || ''}
                </Text>
              </VStack>
            </VStack>
            <HStack mt={2} alignItems={'center'} space={1}>
              <Location size={14} color={textColor} />
              <Text color={textColor} fontSize={12}>
                {item.lokasi?.nama || '-'}
                {item.lokasiTujuan?.nama && ` → ${item.lokasiTujuan.nama}`}
              </Text>
            </HStack>
          </VStack>

        </VStack>
      </Pressable>
    );
  };

  // Header component untuk FlatList
  const ListHeaderComponent = () => (
    <View style={{ padding: 10 }}>
      {/* Loading State */}
      {loading && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: '#6b7280' }}>
            Memuat data...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={{
          backgroundColor: '#fee2e2',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#ef4444'
        }}>
          <Text style={{ color: '#991b1b', fontSize: 14, fontWeight: 'bold' }}>
            Error: {error}
          </Text>
        </View>
      )}

      <HStack justifyContent={"space-between"} alignItems={"center"} mb={2}>
        <VStack>
          <Text color={textColor} fontFamily={"Poppins-SemiBold"} fontSize={16}>
            Equipment Activity Plan
          </Text>
          <Text color={textColor} fontFamily={"Poppins-Light"} fontSize={12}>
            Pull to refresh data
          </Text>
        </VStack>
      </HStack>
    </View>
  );

  // Empty component untuk FlatList
  const ListEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#6b7280', fontSize: 14 }}>
          Tidak ada data aktivitas equipment
        </Text>
      </View>
    );
  };

  return (
    <Fragment>
      <AppScreen>
        <HeaderScreen
          title="Equipment Activity Plan"
          onBack={() => router.back()}
          onThemes={true}
          onNotification={true}
        />
        <HStack mt={3} mx={3} space={2}>
          <HStack
            flex={1}
            rounded={'md'}
            borderWidth={.5}
            borderColor={mode === 'dark' ? '#6ee7b7' : '#059669'}
            bg={mode === 'dark' ? '#065f46' : '#d1fae5'}>
            <TouchableOpacity
              onPress={() => router.push('/operational/equipment-plan/create')}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
              <Text color={mode === 'dark' ? '#6ee7b7' : '#059669'}>Buat Equipment Plan</Text>
            </TouchableOpacity>
          </HStack>
          <TouchableOpacity
            style={{ height: 40, width: 40, borderRadius: 5 }}
            onPress={() => {
              console.log('[EquipmentPlan] Filter button pressed');
              setFilterVisible(true);
            }}
          >
            <VStack
              p={2}
              flex={1}
              bg={hasActiveFilters ? '#3b82f6' : (mode === 'dark' ? '#1e40af' : '#dbeafe')}
              justifyContent={'center'}
              alignItems={'center'}
              rounded={'md'}
              position="relative"
            >
              <Filter color={hasActiveFilters ? '#ffffff' : textColor} />
              {hasActiveFilters && (
                <View style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: '#ef4444',
                  borderRadius: 6,
                  width: 12,
                  height: 12,
                }} />
              )}
            </VStack>
          </TouchableOpacity>
        </HStack>
        <FlatList
          data={data || []}
          renderItem={renderEquipmentPlanItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </AppScreen>

      {/* Filter Bottom Sheet - Outside AppScreen for proper Modal rendering */}
      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => {
          console.log('[EquipmentPlan] Closing filter');
          setFilterVisible(false);
        }}
        onApply={handleApplyFilter}
        currentFilters={selectedFilters}
      />
    </Fragment>
  );
}
