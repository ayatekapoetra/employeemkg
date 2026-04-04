import { ArrowDown2, Calendar, CloseSquare, TickCircle } from 'iconsax-react-native'
import moment from 'moment'
import { HStack, Text, VStack } from 'native-base'
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useSelector } from 'react-redux'
import database from '../../../../src/database/SQLiteService'
import BottomSheetSelect from '../../../../src/components/common/BottomSheetSelect'

const STATUS_OPTIONS = [
  { label: 'Tunggu Teknisi', value: 0, color: '#fbbf24', colorDark: '#92400e' },
  { label: 'Tunggu Spare Part', value: 1, color: '#f472b6', colorDark: '#831843' },
  { label: 'Sedang Dikerjakan', value: 8, color: '#60a5fa', colorDark: '#1e40af' },
  { label: 'Selesai', value: 9, color: '#34d399', colorDark: '#065f46' },
]

const FilterBottomSheet = ({ visible, onClose, onApply, currentFilters = {} }) => {
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const cabangRedux = useSelector((state) => state.cabang)
  const equipmentRedux = useSelector((state) => state.equipment)
  const lokasiRedux = useSelector((state) => state.lokasikerja)

  const [cabangLocal, setCabangLocal] = useState([])
  const [equipmentLocal, setEquipmentLocal] = useState([])
  const [lokasiLocal, setLokasiLocal] = useState([])

  const [filters, setFilters] = useState({
    status: [],
    cabang_id: '',
    equipment_id: '',
    lokasi_id: '',
    startdate: '',
    enddate: '',
    ...currentFilters,
  })

  const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false })

  useEffect(() => {
    if (!visible) {
      setShowDatePicker({ type: null, visible: false })
    }
  }, [visible])

  useEffect(() => {
    const loadCabangFallback = async () => {
      try {
        let data = []
        if (Array.isArray(cabangRedux?.data) && cabangRedux.data.length > 0) return
        if (cabangRedux?.data && typeof cabangRedux.data === 'object') {
          const tmp = cabangRedux.data.rows || cabangRedux.data.data
          if (Array.isArray(tmp) && tmp.length > 0) return
        }
        data = await database.getAll('master_cabang')
        setCabangLocal(Array.isArray(data) ? data : [])
      } catch (e) {
        console.warn('[FilterBottomSheet] loadCabangFallback error:', e?.message || e)
      }
    }
    if (visible) {
      loadCabangFallback()
    }
  }, [visible, cabangRedux?.data])

  useEffect(() => {
    const loadEquipmentFallback = async () => {
      try {
        let data = []
        if (Array.isArray(equipmentRedux?.data) && equipmentRedux.data.length > 0) return
        if (equipmentRedux?.data && typeof equipmentRedux.data === 'object') {
          const tmp = equipmentRedux.data.rows || equipmentRedux.data.data || equipmentRedux.data.equipment
          if (Array.isArray(tmp) && tmp.length > 0) return
        }
        data = await database.getAll('master_equipment')
        setEquipmentLocal(Array.isArray(data) ? data : [])
      } catch (e) {
        console.warn('[FilterBottomSheet] loadEquipmentFallback error:', e?.message || e)
      }
    }
    if (visible) {
      loadEquipmentFallback()
    }
  }, [visible, equipmentRedux?.data])

  useEffect(() => {
    const loadLokasiFallback = async () => {
      try {
        let data = []
        if (Array.isArray(lokasiRedux?.data) && lokasiRedux.data.length > 0) return
        if (lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
          const tmp = lokasiRedux.data.rows || lokasiRedux.data.data
          if (Array.isArray(tmp) && tmp.length > 0) return
        }
        data = await database.getAll('master_lokasipit')
        setLokasiLocal(Array.isArray(data) ? data : [])
      } catch (e) {
        console.warn('[FilterBottomSheet] loadLokasiFallback error:', e?.message || e)
      }
    }
    if (visible) {
      loadLokasiFallback()
    }
  }, [visible, lokasiRedux?.data])

  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937'
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280'

  const cabangOptions = useMemo(() => {
    let data = cabangRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || []
    if ((!data || data.length === 0) && cabangLocal.length > 0) {
      data = cabangLocal
    }
    if (!data || data.length === 0) return []
    return data
      .map((item) => ({
        label: item.nama || item.nama_cabang || item.name || '[No Name]',
        value: item.id?.toString() || item.kode_cabang?.toString() || item.kode?.toString() || '',
        subtitle: item.bisnis?.nama || item.bisnis?.name || item.bisnis?.initial || item.kode || item.kode_cabang || '',
        area: item.area || item.cabang?.area || item.mas_cabang?.area || item.area_name || '',
      }))
      .filter((opt) => opt.value)
  }, [cabangRedux?.data, cabangLocal])

  const equipmentOptions = useMemo(() => {
    let data = equipmentRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || data?.equipment || []
    if ((!data || data.length === 0) && equipmentLocal.length > 0) {
      data = equipmentLocal
    }
    if (!data || data.length === 0) return []

    return data
      .map((item) => ({
        label: item.kode || item.abbr || item.kode_unit || item.nama || item.nama_unit || '[No Name]',
        value: item.id?.toString() || item.kode_unit?.toString() || item.kode?.toString() || '',
        subtitle: item.kode || item.kode_unit || item.abbr || '',
        model: item.model || item.tipe || item.type || '',
        manufaktur: item.manufaktur || item.manufacturer || item.brand || '',
        abbr: item.abbr || item.kode || item.kode_unit || '',
      }))
      .filter((opt) => opt.value)
      .sort((a, b) => (a.abbr || '').localeCompare(b.abbr || ''))
  }, [equipmentRedux?.data, equipmentLocal])

  const lokasiOptions = useMemo(() => {
    let data = lokasiRedux?.data || []
    if (!Array.isArray(data) && lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
      data = lokasiRedux.data.rows || lokasiRedux.data.data || []
    }
    if ((!data || data.length === 0) && lokasiLocal.length > 0) {
      data = lokasiLocal
    }
    if (!data || data.length === 0) return []
    return data
      .map((item) => ({
        label: item.nama_lokasi || item.nama || item.lokasi || '[No Name]',
        value: item.id?.toString() || item.kode_lokasi?.toString() || item.kode?.toString() || '',
        subtitle: item.keterangan || item.deskripsi || '',
      }))
      .filter((opt) => opt.value)
  }, [lokasiRedux?.data, lokasiLocal])

  const handleStatusToggle = (val) => {
    setFilters((prev) => {
      const arr = Array.isArray(prev.status) ? prev.status : []
      return arr.includes(val)
        ? { ...prev, status: arr.filter((s) => s !== val) }
        : { ...prev, status: [...arr, val] }
    })
  }

  const handleDateConfirm = (date) => {
    const formatted = moment(date).format('YYYY-MM-DD')
    if (showDatePicker.type === 'start') {
      setFilters((prev) => ({ ...prev, startdate: formatted }))
    } else {
      setFilters((prev) => ({ ...prev, enddate: formatted }))
    }
    setShowDatePicker({ type: null, visible: false })
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    const reset = {
      status: [],
      cabang_id: '',
      equipment_id: '',
      lokasi_id: '',
      startdate: '',
      enddate: '',
    }
    setFilters(reset)
    onApply(reset)
    onClose()
  }

  const isFiltered = useMemo(() => {
    const hasStatus = Array.isArray(filters.status) && filters.status.length > 0
    return hasStatus || filters.cabang_id || filters.equipment_id || filters.lokasi_id || filters.startdate || filters.enddate
  }, [filters])

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', flex: 1 }}>
          <HStack justifyContent="space-between" alignItems="center" p={5} pb={3}>
            <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
              Filter Daily Breakdown
            </Text>
            <TouchableOpacity onPress={onClose}>
              <CloseSquare size={28} color={labelColor} />
            </TouchableOpacity>
          </HStack>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
            <VStack space={4} px={5}>
              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                  Status Breakdown
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={2}>
                    {STATUS_OPTIONS.map((opt) => {
                      const isActive = filters.status.includes(opt.value)
                      return (
                        <TouchableOpacity key={opt.value} onPress={() => handleStatusToggle(opt.value)} activeOpacity={0.7}>
                          <HStack
                            alignItems="center"
                            space={2}
                            px={3}
                            py={2}
                            bg={isActive ? (mode === 'dark' ? opt.colorDark : opt.color) : (mode === 'dark' ? '#374151' : '#f9fafb')}
                            borderWidth={1}
                            borderColor={isActive ? (mode === 'dark' ? opt.colorDark : opt.color) : (mode === 'dark' ? '#4b5563' : '#e5e7eb')}
                            borderRadius={12}
                          >
                            <TickCircle size={18} color={isActive ? '#ffffff' : labelColor} variant={isActive ? 'Bold' : 'Outline'} />
                            <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={isActive ? '#ffffff' : textColor}>
                              {opt.label}
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
                  Cabang / Lokasi / Equipment
                </Text>

                <BottomSheetSelect
                  label="Cabang"
                  placeholder="Pilih cabang"
                  value={filters.cabang_id?.toString()}
                  options={cabangOptions.map((o) => ({ id: o.value, nama: o.label, subtitle: o.subtitle }))}
                  onChange={(val) => setFilters((prev) => ({ ...prev, cabang_id: val || '' }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />

                <BottomSheetSelect
                  label="Equipment"
                  placeholder="Pilih equipment"
                  value={filters.equipment_id?.toString()}
                  options={equipmentOptions.map((o) => ({
                    id: o.value,
                    nama: o.label,
                    subtitle: [o.model, o.manufaktur].filter(Boolean).join(' - '),
                  }))}
                  onChange={(val) => setFilters((prev) => ({ ...prev, equipment_id: val || '' }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />

                <BottomSheetSelect
                  label="Lokasi"
                  placeholder="Pilih lokasi"
                  value={filters.lokasi_id?.toString()}
                  options={lokasiOptions.map((o) => ({ id: o.value, nama: o.label, subtitle: o.subtitle }))}
                  onChange={(val) => setFilters((prev) => ({ ...prev, lokasi_id: val || '' }))}
                  displayKey="nama"
                  displaySubKey="subtitle"
                  allowClear
                />
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

          <DateTimePickerModal
            isVisible={showDatePicker.visible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker({ type: null, visible: false })}
            date={showDatePicker.type === 'start'
              ? (filters.startdate ? new Date(filters.startdate) : new Date())
              : (filters.enddate ? new Date(filters.enddate) : new Date())
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default FilterBottomSheet
