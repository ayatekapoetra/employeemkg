import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, TextInput, TouchableOpacity, View, RefreshControl } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { HStack, VStack, Text } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'expo-router'
import moment from 'moment'
import { Copy, Filter, ArrowRight2, SearchNormal1 } from 'iconsax-react-native'

import { AppScreen, HeaderScreen } from '../../../src/components/common'
import { COLORS } from '../../../src/constants/colors'
import { getWorkOrderList } from '../../../src/store/slices/workOrderSlice'
import FilterBottomSheet from './components/FilterBottomSheet'

const STATUS_OPTIONS = [
  { code: 'WT', label: 'Wait Teknisi', color: '#fbbf24' },
  { code: 'WS', label: 'Wait Services', color: '#f472b6' },
  { code: 'WP', label: 'Wait Part', color: '#f59e0b' },
  { code: 'WV', label: 'Wait Vendor', color: '#c084fc' },
  { code: 'WTT', label: 'Wait Transport', color: '#a78bfa' },
  { code: 'IP', label: 'In Progress', color: '#60a5fa' },
  { code: 'DONE', label: 'Selesai', color: '#34d399' },
]

const statusStyle = (mode, code) => {
  const found = STATUS_OPTIONS.find((s) => s.code === code)
  const base = found?.color || '#e5e7eb'
  const text = mode === 'dark' ? '#fff' : '#0f172a'
  return {
    bg: mode === 'dark' ? base + '33' : base + '33',
    border: base,
    text: text,
  }
}

export default function WorkOrderListScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const { data, loading, error } = useSelector((state) => state.workorder)

  const [search, setSearch] = useState('')
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState({
    status: ['WT'],
    cabang_id: '',
    equipment_id: '',
    lokasi_id: '',
    startdate: '',
    enddate: '',
    search_kode: '',
    search_issue: '',
  })
  const hasActiveFilters = useMemo(() => {
    const f = filters
    const hasStatus = Array.isArray(f.status) && f.status.length > 0 && !(f.status.length === 1 && f.status[0] === 'WT')
    return hasStatus || f.cabang_id || f.equipment_id || f.lokasi_id || f.startdate || f.enddate || f.search_kode || f.search_issue || search
  }, [filters, search])
  const [refreshing, setRefreshing] = useState(false)

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1]
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280'
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff'
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb'

  const fetchList = useCallback(async (override = {}) => {
    const nextFilters = override.filters || filters
    const params = {
      search: override.search ?? search,
      search_kode: nextFilters.search_kode || undefined,
      search_issue: nextFilters.search_issue || undefined,
      status: Array.isArray(nextFilters.status) ? nextFilters.status.join(',') : nextFilters.status,
      cabang_id: nextFilters.cabang_id || undefined,
      equipment_id: nextFilters.equipment_id || undefined,
      lokasi_id: nextFilters.lokasi_id || undefined,
      startdate: nextFilters.startdate || undefined,
      enddate: nextFilters.enddate || undefined,
    }
    await dispatch(getWorkOrderList(params))
  }, [dispatch, search, filters])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchList()
    setRefreshing(false)
  }

  const toggleStatus = (code) => {
    setFilters((prev) => {
      const arr = Array.isArray(prev.status) ? prev.status : []
      const nextStatus = arr.includes(code) ? arr.filter((s) => s !== code) : [...arr, code]
      const next = { ...prev, status: nextStatus }
      fetchList({ filters: next })
      return next
    })
  }

  const renderItem = ({ item }) => {
    const st = statusStyle(mode, item.status)
    const copyKode = async () => {
      if (!item.kode_wo) return
      await Clipboard.setStringAsync(item.kode_wo)
    }
    return (
      <TouchableOpacity onPress={() => router.push({ pathname: '/operational/work-order/[id]', params: { id: item.id } })}>
        <VStack
          space={2}
          p={4}
          mx={3}
          mb={3}
          bg={cardBg}
          borderWidth={1}
          borderColor={cardBorder}
          borderRadius={14}
          shadow={1}
          style={{
            shadowColor: mode === 'dark' ? '#000' : '#d1d5db',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <VStack space={1} flex={1}>
              <HStack alignItems={'center'}>
                <Text
                  fontFamily="Quicksand-Bold"
                  fontSize="md"
                  color={textColor}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  flex={1}
                >
                  {item.equipment?.kode || item.unit || '-'}
                </Text>
                <HStack
                  px={3}
                  py={0.5}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor={st.border}
                  bg={st.bg}
                  alignItems="center"
                  space={1}
                >
                  <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={st.text}>
                    {item.status || '-'}
                  </Text>
                </HStack>
              </HStack>
              <HStack alignItems="center" space={2}>
                {item.kode_wo ? (
                  <TouchableOpacity onPress={copyKode} style={{ padding: 2}}>
                    <Copy size={16} color='red'/>
                  </TouchableOpacity>
                ) : null}
                <Text fontFamily="Poppins-Regular" fontSize="xs" color={textColor} numberOfLines={1} style={{ lineHeight: 14 }}>
                  {item.kode_wo || 'WO -'}
                </Text>
              </HStack>
              <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor} numberOfLines={1} style={{ lineHeight: 14 }}>
                {item.breakdown.breakdown_at ? moment(item.breakdown.breakdown_at, 'DD-MM-YYYY HH:mm').format('dddd, DD MMMM YYYY') : '-'}
              </Text>
            </VStack>
            
          </HStack>

          <Text fontFamily="Poppins-SemiBold" fontSize="sm" color={textColor} numberOfLines={2}>
            {item.problem_issue || '-'}
          </Text>

          <HStack justifyContent="space-between" alignItems="center" mt={1}>
            <VStack space={1} flex={1}>
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Start: {item.services_at ? moment(item.services_at, ['YYYY-MM-DD HH:mm:ss','DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm') : '-'}
              </Text>
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Ready: {item.ready_at ? moment(item.ready_at, ['YYYY-MM-DD HH:mm:ss','DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm') : '-'}
              </Text>
            </VStack>
            <ArrowRight2 size={18} color={subtitleColor} />
          </HStack>
        </VStack>
      </TouchableOpacity>
    )
  }

  const listEmpty = !loading ? (
    <VStack alignItems="center" mt={10} space={2}>
      <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>Tidak ada Work Order</Text>
      <Text fontFamily="Poppins-Regular" fontSize="sm" color={subtitleColor}>Coba ubah status atau kata kunci</Text>
    </VStack>
  ) : null

  return (
    <AppScreen>
      <HeaderScreen title="Work Order" onBack={() => router.back()} onThemes onNotification />
      <HStack space={2} my={2} mx={4} alignItems="center">
        <VStack flex={1}>
          <Text color={textColor} fontFamily={"Poppins-SemiBold"} fontSize={16}>
            Daftar Work Order Equipment
          </Text>
          <Text color={textColor} fontFamily={"Poppins-Light"} fontSize={12}>
            Pull to refresh data
          </Text>
        </VStack>
        <TouchableOpacity
          style={{ height: 40, width: 40, borderRadius: 5 }}
          onPress={() => setFilterVisible(true)}>
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
        data={data}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
          />
        }
        contentContainerStyle={{ paddingBottom: 24, backgroundColor }}
        ListEmptyComponent={listEmpty}
      />

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        currentFilters={filters}
        onApply={(f) => {
          setFilters(f)
          setSearch('')
          fetchList({ filters: f, search: '' })
        }}
      />
    </AppScreen>
  )
}
