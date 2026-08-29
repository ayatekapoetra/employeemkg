import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { Calendar, CloseSquare, SearchNormal1, TickCircle } from 'iconsax-react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import BottomSheetSelect from '../../../../src/components/common/BottomSheetSelect'
import { getStatusMeta, getThemeColors } from '../utils'

const STATUS_OPTIONS = [
  { key: '', label: 'Semua' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_TRANSIT', label: 'Transit' },
  { key: 'ARRIVED', label: 'Tiba' },
  { key: 'CANCELLED', label: 'Batal' },
]

const normalizeList = (raw) => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.rows)) return raw.rows
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  return []
}

const emptyFilters = {
  search: '',
  status: '',
  movement_date_start: '',
  movement_date_end: '',
  origin_branch_id: '',
  destination_branch_id: '',
  origin_tenant_id: '',
  destination_tenant_id: '',
  equipment_id: '',
}

export default function FilterBottomSheet({
  visible,
  onClose,
  onApply,
  currentFilters = {},
}) {
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const theme = getThemeColors(mode)
  const cabangRedux = useSelector((state) => state.cabang)
  const penyewaRedux = useSelector((state) => state.penyewa)
  const equipmentRedux = useSelector((state) => state.equipment)

  const [filters, setFilters] = useState({ ...emptyFilters, ...currentFilters })
  const [datePicker, setDatePicker] = useState({ visible: false, field: null })

  useEffect(() => {
    if (visible) {
      setFilters({ ...emptyFilters, ...currentFilters })
    }
  }, [visible, currentFilters])

  const cabangOptions = useMemo(() => (
    normalizeList(cabangRedux?.data).map((item) => ({
      id: String(item.id),
      nama: item.nama || item.name || `Cabang ${item.id}`,
      subtitle: [item.area, item.kode].filter(Boolean).join(' · '),
    }))
  ), [cabangRedux?.data])

  const penyewaOptions = useMemo(() => (
    normalizeList(penyewaRedux?.data).map((item) => ({
      id: String(item.id),
      nama: item.nama || item.name || `Penyewa ${item.id}`,
      subtitle: item.abbr || item.kode || '',
    }))
  ), [penyewaRedux?.data])

  const equipmentOptions = useMemo(() => (
    normalizeList(equipmentRedux?.data).map((item) => ({
      id: String(item.id),
      nama: item.kode || item.identity || `EQ-${item.id}`,
      subtitle: [item.kategori || item.ctg, item.model || item.manufaktur].filter(Boolean).join(' · '),
    }))
  ), [equipmentRedux?.data])

  const updateField = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || '' }))
  }

  const handleApply = () => {
    onApply?.({
      ...filters,
      search: String(filters.search || '').trim(),
    })
    onClose?.()
  }

  const handleReset = () => {
    setFilters({ ...emptyFilters })
    onApply?.({ ...emptyFilters })
    onClose?.()
  }

  const openDate = (field) => setDatePicker({ visible: true, field })

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setDatePicker({ visible: false, field: null })
      if (event?.type === 'dismissed') return
    }
    if (!selectedDate || !datePicker.field) return
    updateField(datePicker.field, moment(selectedDate).format('YYYY-MM-DD'))
    if (Platform.OS === 'ios') {
      setDatePicker({ visible: false, field: null })
    }
  }

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '88%',
            paddingBottom: 18,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingBottom: 8 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontFamily: 'Quicksand-Bold' }}>
              Filter Mobilisasi
            </Text>
            <TouchableOpacity onPress={onClose}>
              <CloseSquare size={26} color={theme.subtitle} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
            <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 8 }}>
              Cari Nomor Dokumen
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 48,
                backgroundColor: theme.surface,
                marginBottom: 16,
              }}
            >
              <SearchNormal1 size={18} color={theme.subtitle} />
              <TextInput
                value={filters.search}
                onChangeText={(value) => updateField('search', value)}
                placeholder="Contoh: MOB/2608/..."
                placeholderTextColor={theme.muted}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: theme.text,
                  fontFamily: 'Quicksand-Medium',
                  fontSize: 14,
                }}
              />
            </View>

            <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 8 }}>
              Status Dokumen
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {STATUS_OPTIONS.map((opt) => {
                const active = String(filters.status || '') === String(opt.key || '')
                const meta = opt.key ? getStatusMeta(opt.key) : { accent: theme.primary }
                return (
                  <TouchableOpacity
                    key={opt.key || 'all'}
                    onPress={() => updateField('status', opt.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: active ? (meta.accent || theme.primary) : theme.surface,
                      borderWidth: 1,
                      borderColor: active ? (meta.accent || theme.primary) : theme.border,
                    }}
                  >
                    <TickCircle size={16} color={active ? '#FFF' : theme.subtitle} variant={active ? 'Bold' : 'Outline'} />
                    <Text style={{ color: active ? '#FFF' : theme.text, fontFamily: 'Quicksand-Bold', fontSize: 12 }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Poppins-Bold', marginBottom: 8 }}>
              Rentang Tanggal Mulai
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                { field: 'movement_date_start', label: 'Dari' },
                { field: 'movement_date_end', label: 'Sampai' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.field}
                  onPress={() => openDate(item.field)}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold' }}>{item.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: filters[item.field] ? theme.text : theme.muted, fontFamily: 'Quicksand-Bold', fontSize: 13 }}>
                      {filters[item.field] ? moment(filters[item.field]).format('DD MMM YYYY') : 'Pilih tanggal'}
                    </Text>
                    <Calendar size={16} color={theme.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <BottomSheetSelect
              label="Cabang Asal"
              placeholder="Semua cabang asal"
              value={filters.origin_branch_id}
              options={cabangOptions}
              onChange={(value) => updateField('origin_branch_id', value)}
            />
            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Cabang Tujuan"
              placeholder="Semua cabang tujuan"
              value={filters.destination_branch_id}
              options={cabangOptions}
              onChange={(value) => updateField('destination_branch_id', value)}
            />
            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Penyewa Asal"
              placeholder="Semua penyewa asal"
              value={filters.origin_tenant_id}
              options={penyewaOptions}
              onChange={(value) => updateField('origin_tenant_id', value)}
            />
            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Penyewa Tujuan"
              placeholder="Semua penyewa tujuan"
              value={filters.destination_tenant_id}
              options={penyewaOptions}
              onChange={(value) => updateField('destination_tenant_id', value)}
            />
            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Equipment"
              placeholder="Semua equipment"
              value={filters.equipment_id}
              options={equipmentOptions}
              onChange={(value) => updateField('equipment_id', value)}
            />
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={handleReset}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.surface,
              }}
            >
              <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={{
                flex: 1.3,
                height: 48,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.primary,
              }}
            >
              <Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {datePicker.visible && (
        <DateTimePicker
          value={
            filters[datePicker.field]
              ? moment(filters[datePicker.field], 'YYYY-MM-DD').toDate()
              : new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </Modal>
  )
}

export { emptyFilters }
