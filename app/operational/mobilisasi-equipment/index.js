import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { Add, Refresh } from 'iconsax-react-native'
import { AppScreen, HeaderScreen } from '../../../src/components/common'
import MobilizationCard from './components/MobilizationCard'
import SummaryStrip from './components/SummaryStrip'
import FilterBottomSheet, { emptyFilters } from './components/FilterBottomSheet'
import { getThemeColors } from './utils'
import { getCabang } from '../../../src/store/slices/cabangSlice'
import { getPenyewa } from '../../../src/store/slices/penyewaSlice'
import { getEquipment } from '../../../src/store/slices/equipmentSlice'
import {
  getMobilizationAccess,
  getMobilizationList,
  setMobilizationFilters,
} from '../../../src/store/slices/equipmentMobilizationSlice'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const buildParams = (nextFilters = {}) => ({
  status: nextFilters.status || undefined,
  search: nextFilters.search || undefined,
  movement_date_start: nextFilters.movement_date_start || undefined,
  movement_date_end: nextFilters.movement_date_end || undefined,
  origin_branch_id: nextFilters.origin_branch_id || undefined,
  destination_branch_id: nextFilters.destination_branch_id || undefined,
  origin_tenant_id: nextFilters.origin_tenant_id || undefined,
  destination_tenant_id: nextFilters.destination_tenant_id || undefined,
  equipment_id: nextFilters.equipment_id || undefined,
  page: 1,
  limit: 50,
})

const countActiveFilters = (nextFilters = {}) => (
  Object.entries(nextFilters).filter(([key, value]) => {
    if (key === 'status' && value === '') return false
    return value !== undefined && value !== null && String(value).trim() !== ''
  }).length
)

export default function MobilisasiEquipmentListScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const theme = getThemeColors(mode)

  const {
    list,
    loading,
    error,
    filters,
    permissions,
    permissionsLoading,
    permissionsError,
  } = useSelector((state) => state.equipmentMobilization)

  const [refreshing, setRefreshing] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  const toggleSummary = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setSummaryExpanded((prev) => !prev)
  }, [])

  const fetchList = useCallback(async (nextFilters = filters) => {
    await dispatch(getMobilizationList(buildParams(nextFilters))).unwrap()
  }, [dispatch, filters])

  useEffect(() => {
    dispatch(getMobilizationAccess())
    dispatch(getCabang())
    dispatch(getPenyewa())
    dispatch(getEquipment())
    fetchList().catch(() => {})
  }, [dispatch, fetchList])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        dispatch(getMobilizationAccess()).unwrap(),
        fetchList(),
      ])
    } catch (_) {
      // handled by slice state
    } finally {
      setRefreshing(false)
    }
  }

  const applyFilters = async (nextFilters) => {
    const merged = { ...emptyFilters, ...nextFilters }
    dispatch(setMobilizationFilters(merged))
    try {
      await fetchList(merged)
    } catch (_) {}
  }

  const applyStatus = async (status) => {
    const next = { ...filters, status: status || '' }
    await applyFilters(next)
  }

  const canCreate = permissionsLoading
    ? false
    : (permissions?.can_insert !== false)

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters])

  const header = useMemo(() => (
    <View style={{ paddingBottom: 8 }}>
      <View style={{ paddingHorizontal: 8, marginBottom: 12 }}>
        <Text style={{ color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-Medium' }}>
          Pantau perpindahan unit antar cabang dan penyewa secara real-time
        </Text>
      </View>

      <SummaryStrip
        list={list}
        mode={mode}
        activeStatus={filters.status || ''}
        onSelectStatus={applyStatus}
        expanded={summaryExpanded}
        onToggleExpanded={toggleSummary}
        onOpenFilter={() => setFilterVisible(true)}
        activeFilterCount={activeFilterCount}
      />

      <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 10 }}>
        {(loading || permissionsLoading) && (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <ActivityIndicator color={theme.primary} />
            <Text style={{ marginTop: 8, color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12 }}>
              Memuat data mobilisasi...
            </Text>
          </View>
        )}

        {!!error && (
          <View
            style={{
              backgroundColor: mode === 'dark' ? '#7F1D1D' : '#FEE2E2',
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: theme.danger,
            }}
          >
            <Text style={{ color: mode === 'dark' ? '#FECACA' : '#991B1B', fontFamily: 'Quicksand-SemiBold' }}>
              {error}
            </Text>
            {String(error || '').toLowerCase().includes('akses') && (
              <Text style={{ color: mode === 'dark' ? '#FECACA' : '#991B1B', fontFamily: 'Quicksand-Medium', fontSize: 11, marginTop: 6 }}>
                Pastikan user memiliki baris aktif di sys_accesspermission (bukan hanya submenu), dengan flag read/insert sesuai kebutuhan.
              </Text>
            )}
            <TouchableOpacity onPress={onRefresh} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Refresh size={14} color={theme.danger} />
              <Text style={{ color: theme.danger, fontFamily: 'Quicksand-Bold', fontSize: 12 }}>Coba lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {!!permissionsError && !error && (
          <View
            style={{
              backgroundColor: mode === 'dark' ? '#78350F' : '#FEF3C7',
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: theme.warning,
            }}
          >
            <Text style={{ color: mode === 'dark' ? '#FDE68A' : '#92400E', fontFamily: 'Quicksand-SemiBold', fontSize: 12 }}>
              {permissionsError}
            </Text>
          </View>
        )}
      </View>
    </View>
  ), [
    list,
    mode,
    theme,
    filters.status,
    activeFilterCount,
    loading,
    permissionsLoading,
    error,
    permissionsError,
    summaryExpanded,
    toggleSummary,
  ])

  return (
    <AppScreen>
      <HeaderScreen
        title="Mobilisasi Equipment"
        onBack={() => router.back()}
        onThemes
        onNotification
      />

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MobilizationCard
            item={item}
            mode={mode}
            onPress={() => router.push(`/operational/mobilisasi-equipment/${item.id}`)}
          />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: theme.text, fontFamily: 'Poppins-SemiBold', fontSize: 15 }}>
                Belum ada dokumen mobilisasi
              </Text>
              <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                Buat dokumen baru atau ubah filter untuk menampilkan data
              </Text>
            </View>
          ) : null
        }
      />

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
        currentFilters={filters}
      />

      {canCreate && (
        <TouchableOpacity
          onPress={() => router.push('/operational/mobilisasi-equipment/create')}
          activeOpacity={0.9}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 28,
            backgroundColor: theme.primary,
            borderRadius: 18,
            paddingHorizontal: 18,
            height: 54,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            shadowColor: theme.primary,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Add size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontFamily: 'Quicksand-Bold', fontSize: 14 }}>Buat Dokumen</Text>
        </TouchableOpacity>
      )}
    </AppScreen>
  )
}
