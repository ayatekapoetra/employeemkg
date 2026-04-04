import React, { useMemo, useState, useEffect } from 'react'
import { Modal, TouchableOpacity, View, ScrollView, TextInput } from 'react-native'
import { HStack, VStack, Text } from 'native-base'
import { CloseSquare, SearchNormal1, TickCircle } from 'iconsax-react-native'
import { useSelector } from 'react-redux'
import BottomSheetSelect from '../../../../src/components/common/BottomSheetSelect'
import { COLORS } from '../../../../src/constants/colors'

const STATUS_OPTIONS = [
  { label: 'Wait Teknisi', value: 'WT', color: '#fbbf24', colorDark: '#92400e' },
  { label: 'Wait Services', value: 'WS', color: '#f472b6', colorDark: '#831843' },
  { label: 'Wait Part', value: 'WP', color: '#f59e0b', colorDark: '#92400e' },
  { label: 'Wait Vendor', value: 'WV', color: '#c084fc', colorDark: '#6d28d9' },
  { label: 'Wait Transport', value: 'WTT', color: '#a78bfa', colorDark: '#6d28d9' },
  { label: 'In Progress', value: 'IP', color: '#60a5fa', colorDark: '#1d4ed8' },
  { label: 'Selesai', value: 'DONE', color: '#34d399', colorDark: '#065f46' },
]

const FilterBottomSheet = ({ visible, onClose, onApply, currentFilters = {} }) => {
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const cabangRedux = useSelector((state) => state.cabang)
  const equipmentRedux = useSelector((state) => state.equipment)
  const lokasiRedux = useSelector((state) => state.lokasikerja)

  const [filters, setFilters] = useState({
    status: ['WT'],
    cabang_id: '',
    equipment_id: '',
    lokasi_id: '',
    startdate: '',
    enddate: '',
    search_kode: '',
    search_issue: '',
    ...currentFilters,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937'
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280'
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff'
  const overlayBg = 'rgba(0,0,0,0.5)'
  const chipInactiveBg = mode === 'dark' ? '#1f2937' : '#f9fafb'
  const chipInactiveBorder = mode === 'dark' ? '#4b5563' : '#e5e7eb'
  const chipActiveText = '#ffffff'
  const searchBg = mode === 'dark' ? '#374151' : '#f9fafb'
  const searchBorder = mode === 'dark' ? '#4b5563' : '#e5e7eb'

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...currentFilters }))
  }, [currentFilters])

  const cabangOptions = useMemo(() => {
    let data = cabangRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || []
    return (data || [])
      .map((item) => ({
        id: item.id?.toString() || item.kode_cabang?.toString() || item.kode?.toString() || '',
        nama: item.nama || item.nama_cabang || item.name || '[No Name]',
        subtitle: item.bisnis?.nama || item.bisnis?.initial || '',
      }))
      .filter((opt) => opt.id)
  }, [cabangRedux?.data])

  const equipmentOptions = useMemo(() => {
    let data = equipmentRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || data?.equipment || []
    return (data || [])
      .map((item) => ({
        id: item.id?.toString() || item.kode_unit?.toString() || item.kode?.toString() || '',
        nama: item.kode || item.abbr || item.kode_unit || item.nama || '[No Name]',
        subtitle: [item.model || item.tipe || item.type || '', item.manufaktur || item.manufacturer || item.brand || ''].filter(Boolean).join(' - '),
        abbr: item.abbr || item.kode || item.kode_unit || '',
      }))
      .filter((opt) => opt.id)
      .sort((a, b) => (a.abbr || '').localeCompare(b.abbr || ''))
  }, [equipmentRedux?.data])

  const lokasiOptions = useMemo(() => {
    let data = lokasiRedux?.data || []
    if (!Array.isArray(data) && lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
      data = lokasiRedux.data.rows || lokasiRedux.data.data || []
    }
    return (data || [])
      .map((item) => ({
        id: item.id?.toString() || item.kode_lokasi?.toString() || item.kode?.toString() || '',
        nama: item.nama_lokasi || item.nama || item.lokasi || '[No Name]',
        subtitle: item.keterangan || item.deskripsi || '',
      }))
      .filter((opt) => opt.id)
  }, [lokasiRedux?.data])

  const handleStatusToggle = (val) => {
    setFilters((prev) => {
      const arr = Array.isArray(prev.status) ? prev.status : []
      return arr.includes(val)
        ? { ...prev, status: arr.filter((s) => s !== val) }
        : { ...prev, status: [...arr, val] }
    })
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    const reset = { status: ['WT'], cabang_id: '', equipment_id: '', lokasi_id: '', startdate: '', enddate: '', search_kode: '', search_issue: '' }
    setFilters(reset)
    onApply(reset)
    onClose()
  }

  const isFiltered = useMemo(() => {
    const hasStatus = Array.isArray(filters.status) && filters.status.length > 0 && !(filters.status.length === 1 && filters.status[0] === 'WT')
    return hasStatus || filters.cabang_id || filters.equipment_id || filters.lokasi_id || filters.startdate || filters.enddate || filters.search_kode || filters.search_issue
  }, [filters])

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: overlayBg, justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', flex: 1 }}>
          <HStack justifyContent="space-between" alignItems="center" p={5} pb={3}>
            <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
              Filter Work Order
            </Text>
            <TouchableOpacity onPress={onClose}>
              <CloseSquare size={28} color={labelColor} />
            </TouchableOpacity>
          </HStack>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
            <VStack space={4} px={5}>
              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Status Work Order
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={2}>
                    {STATUS_OPTIONS.map((opt) => {
                      const isActive = filters.status.includes(opt.value)
                      const activeBg = mode === 'dark' ? opt.colorDark : opt.color
                      const inactiveBg = chipInactiveBg
                      const activeBorder = mode === 'dark' ? opt.colorDark : opt.color
                      const inactiveBorder = chipInactiveBorder
                      const activeText = chipActiveText
                      const inactiveText = labelColor
                      return (
                        <TouchableOpacity key={opt.value} onPress={() => handleStatusToggle(opt.value)} activeOpacity={0.7}>
                          <HStack
                            alignItems="center"
                            space={2}
                            px={3}
                            py={2}
                            bg={isActive ? activeBg : inactiveBg}
                            borderWidth={1}
                            borderColor={isActive ? activeBorder : inactiveBorder}
                            borderRadius={12}
                          >
                            <TickCircle size={18} color={isActive ? activeText : labelColor} variant={isActive ? 'Bold' : 'Outline'} />
                            <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={isActive ? activeText : inactiveText}>
                              {opt.value} • {opt.label}
                            </Text>
                          </HStack>
                        </TouchableOpacity>
                      )
                    })}
                  </HStack>
                </ScrollView>
              </VStack>

              <VStack space={3}>
            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
              Cabang / Equipment / Lokasi
            </Text>

                <BottomSheetSelect
                  label="Cabang"
                  placeholder="Pilih cabang"
                  value={filters.cabang_id?.toString()}
                  options={cabangOptions}
                  onChange={(val) => setFilters((prev) => ({ ...prev, cabang_id: val || '' }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />

                <BottomSheetSelect
                  label="Equipment"
                  placeholder="Pilih equipment"
                  value={filters.equipment_id?.toString()}
                  options={equipmentOptions.map((o) => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                  onChange={(val) => setFilters((prev) => ({ ...prev, equipment_id: val || '' }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />

                <BottomSheetSelect
                  label="Lokasi"
                  placeholder="Pilih lokasi"
                  value={filters.lokasi_id?.toString()}
                  options={lokasiOptions}
                  onChange={(val) => setFilters((prev) => ({ ...prev, lokasi_id: val || '' }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />

                <VStack space={3}>
                  <VStack space={2}>
                    <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>Cari Kode WO</Text>
                    <HStack
                      alignItems="center"
                      space={2}
                      px={3}
                      py={2}
                      bg={searchBg}
                      borderWidth={1}
                      borderColor={searchBorder}
                      borderRadius={12}
                    >
                      <SearchNormal1 size={20} color={labelColor} />
                      <TextInput
                        value={filters.search_kode}
                        onChangeText={(v) => setFilters((prev) => ({ ...prev, search_kode: v }))}
                        placeholder="Cari kode WO"
                        placeholderTextColor={labelColor}
                        style={{ flex: 1, color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14, padding: 6 }}
                      />
                    </HStack>
                  </VStack>

                  <VStack space={2}>
                    <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>Cari Issue</Text>
                    <HStack
                      alignItems="center"
                      space={2}
                      px={3}
                      py={2}
                      bg={searchBg}
                      borderWidth={1}
                      borderColor={searchBorder}
                      borderRadius={12}
                    >
                      <SearchNormal1 size={20} color={labelColor} />
                      <TextInput
                        value={filters.search_issue}
                        onChangeText={(v) => setFilters((prev) => ({ ...prev, search_issue: v }))}
                        placeholder="Cari problem issue"
                        placeholderTextColor={labelColor}
                        style={{ flex: 1, color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14, padding: 6 }}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </VStack>

              <HStack mt={4} space={3}>
                <TouchableOpacity
                  onPress={handleReset}
                  disabled={!isFiltered}
                  style={{
                    flex: 1,
                    backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                    opacity: isFiltered ? 1 : 0.5,
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
                  onPress={handleApply}
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
              </HStack>
            </VStack>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default FilterBottomSheet
