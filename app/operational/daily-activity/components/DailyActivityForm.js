import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import moment from 'moment'
import { Add, Calendar, CloseCircle, Edit, Trash } from 'iconsax-react-native'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { AppScreen, BottomSheetSelect, HeaderScreen } from '../../../../src/components/common'
import { getEquipment } from '../../../../src/store/slices/equipmentSlice'
import { getPenyewa } from '../../../../src/store/slices/penyewaSlice'
import { getLokasiPit } from '../../../../src/store/slices/lokasiPitSlice'
import { getKegiatanPit } from '../../../../src/store/slices/kegiatanPitSlice'
import { getMaterialRitase } from '../../../../src/store/slices/materialRitaseSlice'
import { getPengawas } from '../../../../src/store/slices/pengawasSlice'
import { getOprDrv } from '../../../../src/store/slices/oprdrvSlice'
import { getShift } from '../../../../src/store/slices/shiftSlice'
import { createDailyActivity, getDailyActivityAccess, getDailyActivityDetail, updateDailyActivity } from '../../../../src/store/slices/dailyActivitySlice'
import apiClient from '../../../../src/services/api/client'
import { API_ENDPOINTS } from '../../../../src/services/api/endpoints'
import { CATEGORIES, normalize, STATUSES, themeColors, UNIT_CATEGORIES, WEATHER } from '../utils'

const freshBatch = (status = 'beroperasi', date = moment().format('YYYY-MM-DD'), shift = '1') => ({
  id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, status, sequence: '',
  start_time: `${date} ${shift === '2' ? '18:00:00' : '07:00:00'}`,
  finish_time: shift === '2' ? `${moment(date).add(1, 'day').format('YYYY-MM-DD')} 06:00:00` : `${date} 18:00:00`,
  kegiatan_id: '', kegiatan_name: '', material_id: '', material_name: '', pengawas_id: '', pengawas_name: '', issue_breakdown: '', note: '', equipment_ids: [], equipment_assignments: {},
})

const option = (item, kind) => ({
  id: String(item.id),
  nama: kind === 'equipment' ? (item.kode || item.kode_unit || item.nama || `EQ-${item.id}`) : (item.nama || item.name || item.description || `${kind} ${item.id}`),
  subtitle: kind === 'equipment'
    ? [item.kategori || item.ctg, item.model || item.manufaktur].filter(Boolean).join(' · ')
    : kind === 'pit'
      ? [item.type, item.cabang?.nama || item.cabang_nama || item.cabang || item.area].filter(Boolean).join(' · ')
      : (item.kode || item.nik || item.section || ''),
  raw: item,
})

const groupDetail = (items = []) => {
  const groups = new Map()
  items.forEach((item) => {
    const key = [item.status, item.sequence, item.start_time, item.finish_time, item.kegiatan_id, item.material_id, item.pengawas_id, item.issue_breakdown, item.note].join('|')
    if (!groups.has(key)) groups.set(key, { ...freshBatch(item.status), ...item, id: `loaded-${key}`, equipment_ids: [], equipment_assignments: {} })
    const group = groups.get(key)
    if (item.equipment_id) {
      const id = String(item.equipment_id)
      group.equipment_ids.push(id)
      group.equipment_assignments[id] = { karyawan_id: String(item.karyawan_id || ''), karyawan_name: item.karyawan_name || '', hm_km_bd: String(item.hm_km_bd || '') }
    }
  })
  return [...groups.values()]
}

export default function DailyActivityForm({ editId }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const auth = useSelector((state) => state.auth)
  const daily = useSelector((state) => state.dailyActivity)
  const masters = useSelector((state) => ({ equipment: state.equipment, sites: state.penyewa, pits: state.lokasikerja, activities: state.kegiatankerja, materials: state.materialRitase, supervisors: state.pengawas, operators: state.oprdrv, shifts: state.shift }))
  const theme = themeColors(mode)
  const employee = auth?.karyawan || auth?.user?.karyawan || {}
  const [header, setHeader] = useState({ date_ops: moment().format('YYYY-MM-DD'), shift_id: '1', lokasi_site_id: '', lokasi_site_nama: '', lokasi_pit_id: '', lokasi_pit_nama: '', kontraktor: '', cuaca: '', category_id: '', ctgunit: '', notes: '' })
  const [batches, setBatches] = useState([])
  const [draft, setDraft] = useState(freshBatch())
  const [activeStatus, setActiveStatus] = useState('beroperasi')
  const [picker, setPicker] = useState({ field: '', equipmentId: '' })
  const [timeField, setTimeField] = useState('')
  const [editingBatchId, setEditingBatchId] = useState('')
  const [initializing, setInitializing] = useState(!!editId)
  const [contractors, setContractors] = useState([])

  useEffect(() => {
    if (!editId) dispatch(getDailyActivityAccess())
    dispatch(getEquipment()); dispatch(getPenyewa()); dispatch(getLokasiPit(true)); dispatch(getKegiatanPit()); dispatch(getMaterialRitase()); dispatch(getPengawas()); dispatch(getOprDrv()); dispatch(getShift())
    apiClient.get(API_ENDPOINTS.BISNIS_UNIT.LIST).then((response) => {
      const data = response.data?.rows || response.data?.data || response.data || []
      setContractors(normalize(data).map((item) => ({ id: String(item.initial || item.id), nama: [item.initial, item.name || item.nama].filter(Boolean).join(' - ') })))
    }).catch(() => setContractors([]))
  }, [dispatch, editId])
  useEffect(() => {
    if (!editId) return
    dispatch(getDailyActivityAccess()).unwrap().then((access) => {
      if (access?.can_read !== true || access?.can_update !== true) throw new Error('Anda tidak memiliki akses update Daily Activity')
      return dispatch(getDailyActivityDetail(editId)).unwrap()
    }).then((data) => {
      const source = data?.data || data || {}
      const h = source.header || {}
      setHeader({ date_ops: h.date_ops || moment().format('YYYY-MM-DD'), shift_id: String(h.shift_id || '1'), lokasi_site_id: String(h.lokasi_site_id || ''), lokasi_site_nama: h.lokasi_site_nama || '', lokasi_pit_id: String(h.lokasi_pit_id || ''), lokasi_pit_nama: h.lokasi_pit_nama || '', kontraktor: h.kontraktor || '', cuaca: h.cuaca || '', category_id: h.category_id || '', ctgunit: h.ctgunit || '', notes: h.notes || '' })
      setBatches(groupDetail(source.items || []))
    }).catch((error) => Alert.alert('Gagal', String(error))).finally(() => setInitializing(false))
  }, [dispatch, editId])

  const options = useMemo(() => ({
    equipment: normalize(masters.equipment?.data).map((x) => option(x, 'equipment')),
    site: normalize(masters.sites?.data).map((x) => option(x, 'site')),
    pit: normalize(masters.pits?.data).map((x) => option(x, 'pit')),
    kegiatan: normalize(masters.activities?.data).map((x) => option(x, 'kegiatan')),
    material: normalize(masters.materials?.data).map((x) => option(x, 'material')),
    pengawas: normalize(masters.supervisors?.data).map((x) => option(x, 'pengawas')),
    operator: normalize(masters.operators?.data).map((x) => option(x, 'operator')),
    shift: [{ id: '1', nama: 'Shift Pagi' }, { id: '2', nama: 'Shift Malam' }],
  }), [masters])
  const allowedEquipment = useMemo(() => options.equipment.filter((x) => {
    const category = String(x.raw?.kategori || x.raw?.ctg || '').toUpperCase()
    if (header.ctgunit === 'HE' && category && category !== 'HE') return false
    if (header.ctgunit === 'DT' && category && category !== 'DT') return false
    if (String(header.ctgunit).toUpperCase() === 'DRILL' && category && !['AD', 'MD', 'DRILL'].includes(category)) return false
    return true
  }), [options.equipment, header.ctgunit])
  const usedElsewhere = useMemo(() => new Set(batches.filter((x) => x.id !== editingBatchId).flatMap((x) => x.equipment_ids.map(String))), [batches, editingBatchId])
  const selectedEquipment = draft.equipment_ids.map((id) => allowedEquipment.find((x) => x.id === String(id))).filter(Boolean)
  const patchHeader = (key, value, selected) => setHeader((prev) => ({ ...prev, [key]: value || '', ...(key === 'lokasi_site_id' ? { lokasi_site_nama: selected?.nama || '' } : {}), ...(key === 'lokasi_pit_id' ? { lokasi_pit_nama: selected?.nama || '' } : {}) }))
  const patchDraft = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }))
  const chooseNamed = (key, nameKey, value, list) => { const selected = list.find((x) => x.id === String(value)); setDraft((prev) => ({ ...prev, [key]: value || '', [nameKey]: selected?.nama || '' })) }
  const setStatus = (value) => {
    setActiveStatus(value)
    setDraft((prev) => ({
      ...prev,
      status: value,
      material_id: value === 'beroperasi' ? prev.material_id : '',
      material_name: value === 'beroperasi' ? prev.material_name : '',
      pengawas_id: value === 'breakdown' ? prev.pengawas_id : '',
      pengawas_name: value === 'breakdown' ? prev.pengawas_name : '',
      issue_breakdown: value === 'breakdown' ? prev.issue_breakdown : '',
    }))
  }

  const toggleEquipment = (id) => setDraft((prev) => {
    const exists = prev.equipment_ids.includes(id)
    const ids = exists ? prev.equipment_ids.filter((value) => value !== id) : [...prev.equipment_ids, id]
    const assignments = { ...prev.equipment_assignments }
    if (exists) delete assignments[id]
    return { ...prev, equipment_ids: ids, equipment_assignments: assignments }
  })
  const assign = (equipmentId, value) => { const person = options.operator.find((x) => x.id === String(value)); setDraft((prev) => ({ ...prev, equipment_assignments: { ...prev.equipment_assignments, [equipmentId]: { ...(prev.equipment_assignments[equipmentId] || {}), karyawan_id: value || '', karyawan_name: person?.nama || '' } } })) }
  const hm = (equipmentId, value) => setDraft((prev) => ({ ...prev, equipment_assignments: { ...prev.equipment_assignments, [equipmentId]: { ...(prev.equipment_assignments[equipmentId] || {}), hm_km_bd: value } } }))

  const validateBatch = () => {
    if (!draft.start_time || !draft.finish_time || !moment(draft.finish_time).isAfter(moment(draft.start_time))) return 'Waktu selesai harus setelah waktu mulai'
    if (!draft.kegiatan_id) return 'Kegiatan wajib dipilih'
    if (!draft.equipment_ids.length) return 'Pilih minimal 1 equipment'
    if (draft.equipment_ids.some((id) => usedElsewhere.has(String(id)))) return 'Equipment sudah digunakan pada batch/status lain'
    if (draft.status === 'breakdown' && !draft.issue_breakdown.trim()) return 'Issue breakdown wajib diisi'
    if (draft.status === 'breakdown' && draft.equipment_ids.some((id) => !String(draft.equipment_assignments[id]?.hm_km_bd || '').trim())) return 'HM/KM wajib diisi untuk setiap equipment breakdown'
    return ''
  }
  const saveBatch = () => {
    const error = validateBatch(); if (error) return Alert.alert('Validasi Batch', error)
    if (editingBatchId) setBatches((prev) => prev.map((x) => x.id === editingBatchId ? { ...draft, id: editingBatchId } : x))
    else setBatches((prev) => [...prev, draft])
    setEditingBatchId(''); setDraft(freshBatch(activeStatus, header.date_ops, header.shift_id))
  }
  const editBatch = (batch) => { setEditingBatchId(batch.id); setActiveStatus(batch.status); setDraft({ ...batch, equipment_ids: [...batch.equipment_ids], equipment_assignments: { ...batch.equipment_assignments } }) }
  const validateAll = () => {
    if (!header.date_ops || !header.shift_id || !header.lokasi_site_id || !header.lokasi_pit_id || !header.kontraktor.trim() || !header.cuaca || !header.category_id || !header.ctgunit) return 'Lengkapi seluruh informasi umum yang wajib'
    if (!batches.length) return 'Tambahkan minimal 1 batch status'
    const ids = batches.flatMap((x) => x.equipment_ids.map(String)); if (new Set(ids).size !== ids.length) return 'Equipment harus unik di seluruh status'
    return ''
  }
  const payloadBatches = () => batches.map((batch) => ({ status: batch.status, sequence: batch.sequence, start_time: moment(batch.start_time).format('YYYY-MM-DD HH:mm:ss'), finish_time: moment(batch.finish_time).format('YYYY-MM-DD HH:mm:ss'), kegiatan_id: batch.kegiatan_id, kegiatan_name: batch.kegiatan_name, material_id: batch.material_id, material_name: batch.material_name, pengawas_id: batch.pengawas_id, pengawas_name: batch.pengawas_name, issue_breakdown: batch.issue_breakdown, note: batch.note, equipment_ids: batch.equipment_ids, equipment_assignments: batch.equipment_assignments }))
  const submit = async () => {
    const error = validateAll(); if (error) return Alert.alert('Validasi', error)
    const headerPayload = { ...header, shift_id: Number(header.shift_id), author_id: employee?.id || 0, cabang_id: employee?.cabang_id || employee?.cabang?.id || 0 }
    try {
      if (editId) await dispatch(updateDailyActivity({ id: editId, header: headerPayload, batches: payloadBatches() })).unwrap()
      else await dispatch(createDailyActivity({ ...headerPayload, items: payloadBatches() })).unwrap()
      Alert.alert('Berhasil', `Daily Activity berhasil ${editId ? 'diperbarui' : 'disimpan'}`, [{ text: 'OK', onPress: () => router.replace('/operational/daily-activity') }])
    } catch (err) { Alert.alert('Gagal Menyimpan', String(err)) }
  }
  const permitted = editId ? daily.permissions?.can_update === true : daily.permissions?.can_insert === true
  const fieldStyle = { color: theme.text, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12, fontFamily: 'Quicksand-Medium' }
  const Label = ({ children }) => <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 13, marginBottom: 6 }}>{children}</Text>

  if (initializing) return <AppScreen><HeaderScreen title="Edit Daily Activity" onBack={() => router.back()} onThemes /><ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} /></AppScreen>
  return <AppScreen><HeaderScreen title={editId ? 'Edit Daily Activity' : 'Buat Daily Activity'} onBack={() => router.back()} onThemes />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {!daily.permissionsLoading && !permitted && <View style={{ padding: 14, borderRadius: 12, backgroundColor: mode === 'dark' ? '#7F1D1D' : '#FEE2E2', marginBottom: 14 }}><Text style={{ color: theme.danger, fontFamily: 'Quicksand-Bold' }}>Anda tidak memiliki akses {editId ? 'update' : 'insert'} Daily Activity.</Text></View>}
      <View style={{ padding: 14, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}><Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 17 }}>Informasi Umum</Text><Text style={{ color: theme.muted, fontSize: 12, marginBottom: 14 }}>Header berlaku untuk semua batch status</Text>
        <Label>Tanggal Operasional *</Label><TouchableOpacity onPress={() => setTimeField('date_ops')} style={{ ...fieldStyle, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}><Text style={{ color: theme.text }}>{moment(header.date_ops).format('DD MMMM YYYY')}</Text><Calendar size={18} color={theme.primary} /></TouchableOpacity>
          <BottomSheetSelect label="Shift *" placeholder="Pilih shift" value={header.shift_id} options={options.shift} onChange={(v) => patchHeader('shift_id', v)} /><View style={{ height: 10 }} />
        <BottomSheetSelect label="Site Penyewa *" placeholder="Pilih site" value={header.lokasi_site_id} options={options.site} onChange={(v, selected) => patchHeader('lokasi_site_id', v, selected || options.site.find((x) => x.id === String(v)))} /><View style={{ height: 10 }} />
        <BottomSheetSelect label="Lokasi Pit *" placeholder="Pilih pit" value={header.lokasi_pit_id} options={options.pit} onChange={(v, selected) => patchHeader('lokasi_pit_id', v, selected || options.pit.find((x) => x.id === String(v)))} /><View style={{ height: 10 }} />
        <BottomSheetSelect label="Kontraktor Mining *" placeholder="Pilih kontraktor" value={contractors.find((item) => item.nama === header.kontraktor)?.id || ''} options={contractors} onChange={(v) => patchHeader('kontraktor', contractors.find((item) => item.id === String(v))?.nama || '')} /><View style={{ height: 10 }} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <BottomSheetSelect label="Cuaca *" placeholder="Pilih cuaca" value={header.cuaca} options={WEATHER} onChange={(v) => patchHeader('cuaca', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <BottomSheetSelect label="Kategori Unit *" placeholder="Pilih kategori unit" value={header.ctgunit} options={UNIT_CATEGORIES} onChange={(v) => patchHeader('ctgunit', v)} />
          </View>
        </View>
        <BottomSheetSelect label="Kategori Kegiatan *" placeholder="Pilih kategori" value={header.category_id} options={CATEGORIES} onChange={(v) => patchHeader('category_id', v)} /><View style={{ height: 10 }} />
        <Label>Catatan Umum</Label><TextInput multiline value={header.notes} onChangeText={(v) => patchHeader('notes', v)} placeholder="Catatan opsional" placeholderTextColor={theme.muted} style={{ ...fieldStyle, minHeight: 70, textAlignVertical: 'top' }} />
      </View>

      <View style={{ padding: 14, marginTop: 14, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}><Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 17 }}>{editingBatchId ? 'Edit Batch' : 'Tambah Batch Status'}</Text><View style={{ flexDirection: 'row', gap: 7, marginVertical: 12 }}>{STATUSES.map((x) => <TouchableOpacity key={x.id} onPress={() => setStatus(x.id)} style={{ flex: 1, padding: 9, alignItems: 'center', borderRadius: 10, backgroundColor: activeStatus === x.id ? x.color : theme.surface, borderWidth: 1, borderColor: x.color }}><Text style={{ color: activeStatus === x.id ? '#FFF' : theme.text, fontFamily: 'Quicksand-Bold', fontSize: 11 }}>{x.label}</Text></TouchableOpacity>)}</View>
        <Label>Sequence</Label><TextInput value={draft.sequence} keyboardType="numeric" onChangeText={(v) => patchDraft('sequence', v)} placeholder="Nomor urut" placeholderTextColor={theme.muted} style={{ ...fieldStyle, marginBottom: 10 }} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>{[['start_time', 'Waktu Mulai'], ['finish_time', 'Waktu Selesai']].map(([key, label]) => <TouchableOpacity key={key} onPress={() => setTimeField(key)} style={{ ...fieldStyle, flex: 1 }}><Text style={{ color: theme.muted, fontSize: 10 }}>{label}</Text><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 12 }}>{moment(draft[key]).format('DD MMM, HH:mm')}</Text></TouchableOpacity>)}</View>
        <BottomSheetSelect label="Kegiatan *" placeholder="Pilih kegiatan" value={draft.kegiatan_id} options={options.kegiatan.filter((x) => { const sub = String(x.raw?.subctg || '').toLowerCase(); return activeStatus === 'beroperasi' ? !['standby', 'breakdown'].includes(sub) : !sub || sub === activeStatus })} onChange={(v) => chooseNamed('kegiatan_id', 'kegiatan_name', v, options.kegiatan)} />
        {activeStatus === 'beroperasi' && <><View style={{ height: 10 }} /><BottomSheetSelect label="Material" placeholder="Pilih material" value={draft.material_id} options={options.material} onChange={(v) => chooseNamed('material_id', 'material_name', v, options.material)} /></>}
        {activeStatus === 'breakdown' && <><View style={{ height: 10 }} /><BottomSheetSelect label="Pengawas" placeholder="Pilih pengawas" value={draft.pengawas_id} options={options.pengawas} onChange={(v) => chooseNamed('pengawas_id', 'pengawas_name', v, options.pengawas)} /><View style={{ height: 10 }} /><Label>Issue Breakdown *</Label><TextInput multiline value={draft.issue_breakdown} onChangeText={(v) => patchDraft('issue_breakdown', v)} placeholder="Jelaskan kerusakan" placeholderTextColor={theme.muted} style={{ ...fieldStyle, minHeight: 65, textAlignVertical: 'top' }} /></>}
        <View style={{ height: 10 }} /><Label>Keterangan</Label><TextInput multiline value={draft.note} onChangeText={(v) => patchDraft('note', v)} placeholder="Keterangan batch" placeholderTextColor={theme.muted} style={{ ...fieldStyle, minHeight: 55, textAlignVertical: 'top' }} />
        <TouchableOpacity onPress={() => setPicker({ field: 'equipment', equipmentId: '' })} style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', padding: 12, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.primary }}><Add size={18} color={theme.primary} /><Text style={{ color: theme.primary, fontFamily: 'Quicksand-Bold' }}>Pilih Multi Equipment ({draft.equipment_ids.length})</Text></TouchableOpacity>
        {selectedEquipment.map((eq) => <View key={eq.id} style={{ padding: 11, marginTop: 9, borderRadius: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>{eq.nama}</Text><Text style={{ color: theme.muted, fontSize: 11 }}>{eq.subtitle || '-'}</Text></View><TouchableOpacity onPress={() => toggleEquipment(eq.id)}><CloseCircle size={20} color={theme.danger} /></TouchableOpacity></View><View style={{ marginTop: 9 }}><BottomSheetSelect label="Operator/Driver" placeholder="Pilih operator" value={draft.equipment_assignments[eq.id]?.karyawan_id || ''} options={options.operator} onChange={(v) => assign(eq.id, v)} /></View>{activeStatus === 'breakdown' && <><View style={{ height: 8 }} /><Label>HM/KM Breakdown *</Label><TextInput value={draft.equipment_assignments[eq.id]?.hm_km_bd || ''} keyboardType="decimal-pad" onChangeText={(v) => hm(eq.id, v)} placeholder="HM/KM saat breakdown" placeholderTextColor={theme.muted} style={fieldStyle} /></>}</View>)}
        <TouchableOpacity onPress={saveBatch} style={{ padding: 14, alignItems: 'center', marginTop: 13, borderRadius: 14, backgroundColor: theme.primary }}><Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>{editingBatchId ? 'Terapkan Perubahan Batch' : 'Tambahkan Batch'}</Text></TouchableOpacity>
      </View>

      <View style={{ padding: 14, marginTop: 14, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}><Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 17 }}>Ringkasan Batch ({batches.length})</Text>{batches.map((batch, index) => { const meta = STATUSES.find((x) => x.id === batch.status); return <View key={batch.id} style={{ padding: 12, marginTop: 10, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: meta?.color, backgroundColor: theme.surface }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View style={{ flex: 1 }}><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>#{index + 1} {meta?.label} · {batch.equipment_ids.length} Unit</Text><Text style={{ color: theme.muted, fontSize: 12 }}>{batch.kegiatan_name} · {moment(batch.start_time).format('HH:mm')} - {moment(batch.finish_time).format('HH:mm')}</Text></View><TouchableOpacity onPress={() => editBatch(batch)} style={{ marginRight: 10 }}><Edit size={19} color="#2563EB" /></TouchableOpacity><TouchableOpacity onPress={() => setBatches((prev) => prev.filter((x) => x.id !== batch.id))}><Trash size={19} color={theme.danger} /></TouchableOpacity></View></View> })}</View>
      <TouchableOpacity disabled={!permitted || daily.mutationLoading} onPress={submit} style={{ padding: 16, alignItems: 'center', marginTop: 16, borderRadius: 15, backgroundColor: permitted ? '#10B981' : theme.muted, opacity: daily.mutationLoading ? 0.6 : 1 }}><Text style={{ color: '#FFF', fontFamily: 'Poppins-Bold' }}>{daily.mutationLoading ? 'Menyimpan Online...' : editId ? 'Update Daily Activity' : 'Simpan Daily Activity Online'}</Text></TouchableOpacity>
    </ScrollView></KeyboardAvoidingView>
    <DateTimePickerModal isVisible={!!timeField} mode={timeField === 'date_ops' ? 'date' : 'datetime'} date={timeField === 'date_ops' ? moment(header.date_ops).toDate() : moment(draft[timeField] || undefined).toDate()} onCancel={() => setTimeField('')} onConfirm={(date) => { if (timeField === 'date_ops') patchHeader('date_ops', moment(date).format('YYYY-MM-DD')); else patchDraft(timeField, moment(date).format('YYYY-MM-DD HH:mm:ss')); setTimeField('') }} />
    <Modal transparent visible={picker.field === 'equipment'} animationType="slide" onRequestClose={() => setPicker({ field: '', equipmentId: '' })}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' }}><TouchableOpacity style={{ flex: 1 }} onPress={() => setPicker({ field: '', equipmentId: '' })} /><View style={{ maxHeight: '72%', padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.card }}><Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 17, marginBottom: 10 }}>Pilih Equipment</Text><ScrollView>{allowedEquipment.map((eq) => { const selected = draft.equipment_ids.includes(eq.id); const blocked = usedElsewhere.has(eq.id); return <TouchableOpacity key={eq.id} disabled={blocked} onPress={() => toggleEquipment(eq.id)} style={{ padding: 13, marginBottom: 7, borderRadius: 12, borderWidth: 1, borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? (mode === 'dark' ? '#78350F' : '#FEF3C7') : theme.surface, opacity: blocked ? 0.35 : 1 }}><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>{selected ? '✓ ' : ''}{eq.nama}</Text><Text style={{ color: theme.muted, fontSize: 11 }}>{blocked ? 'Sudah digunakan pada batch lain' : eq.subtitle}</Text></TouchableOpacity> })}</ScrollView><TouchableOpacity onPress={() => setPicker({ field: '', equipmentId: '' })} style={{ alignItems: 'center', padding: 14, marginTop: 8, borderRadius: 14, backgroundColor: theme.primary }}><Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>Selesai</Text></TouchableOpacity></View></View></Modal>
  </AppScreen>
}
