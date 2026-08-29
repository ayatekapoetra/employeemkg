import React, { useEffect, useState } from 'react'
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { BottomSheetSelect } from '../../../../src/components/common'
import { emptyFilters, STATUSES, themeColors, UNIT_CATEGORIES } from '../utils'

export default function FilterBottomSheet({ visible, value, sites, pits, contractors, onClose, onApply }) {
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const theme = themeColors(mode)
  const [form, setForm] = useState({ ...emptyFilters, ...value })
  const [dateField, setDateField] = useState('')
  useEffect(() => { if (visible) setForm({ ...emptyFilters, ...value }) }, [visible, value])
  if (!visible) return null
  const field = (key, next) => setForm((prev) => ({ ...prev, [key]: next || '' }))
  return <Modal transparent visible animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' }}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      <View style={{ maxHeight: '88%', padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.card }}>
        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18, color: theme.text, marginBottom: 14 }}>Filter Daily Activity</Text>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', marginBottom: 8 }}>Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {[{ id: '', label: 'Semua', color: theme.primary }, ...STATUSES].map((item) => <TouchableOpacity key={item.id || 'all'} onPress={() => field('status', item.id)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: item.color, backgroundColor: form.status === item.id ? item.color : theme.surface }}><Text style={{ color: form.status === item.id ? '#FFF' : theme.text, fontFamily: 'Quicksand-Bold' }}>{item.label}</Text></TouchableOpacity>)}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {[['date_from', 'Dari'], ['date_to', 'Sampai']].map(([key, label]) => <TouchableOpacity key={key} onPress={() => setDateField(key)} style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.surface }}><Text style={{ color: theme.muted, fontSize: 11 }}>{label}</Text><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>{form[key] ? moment(form[key]).format('DD MMM YYYY') : 'Pilih tanggal'}</Text></TouchableOpacity>)}
          </View>
          <BottomSheetSelect label="Shift" placeholder="Semua shift" value={form.shift_id} options={[{ id: '1', nama: 'Shift Pagi' }, { id: '2', nama: 'Shift Malam' }]} onChange={(v) => field('shift_id', v)} />
          <View style={{ height: 10 }} /><BottomSheetSelect label="Kategori Unit" placeholder="Semua kategori" value={form.ctgunit} options={UNIT_CATEGORIES} onChange={(v) => field('ctgunit', v)} />
          <View style={{ height: 10 }} /><BottomSheetSelect label="Site Penyewa" placeholder="Semua site" value={form.lokasi_site_id} options={sites} onChange={(v) => field('lokasi_site_id', v)} />
          <View style={{ height: 10 }} /><BottomSheetSelect label="Lokasi Pit" placeholder="Semua pit" value={form.lokasi_pit_id} options={pits} onChange={(v) => field('lokasi_pit_id', v)} />
          <View style={{ height: 10 }} /><BottomSheetSelect label="Kontraktor" placeholder="Semua kontraktor" value={form.kontraktor} options={contractors} onChange={(v) => field('kontraktor', v)} />
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity onPress={() => { onApply(emptyFilters); onClose() }} style={{ flex: 1, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 14 }}><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>Reset</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { onApply(form); onClose() }} style={{ flex: 1.4, padding: 14, alignItems: 'center', backgroundColor: theme.primary, borderRadius: 14 }}><Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>Terapkan</Text></TouchableOpacity>
        </View>
      </View>
      {!!dateField && <DateTimePicker value={form[dateField] ? moment(form[dateField]).toDate() : new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, date) => { if (event?.type !== 'dismissed' && date) field(dateField, moment(date).format('YYYY-MM-DD')); setDateField('') }} />}
    </View>
  </Modal>
}
