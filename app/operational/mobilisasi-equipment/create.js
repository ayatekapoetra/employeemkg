import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Calendar, AddSquare, Trash, TickCircle, Clock } from 'iconsax-react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { AppScreen, HeaderScreen, BottomSheetSelect } from '../../../src/components/common'
import CustomAlert from '../../../src/components/common/CustomAlert'
import { getEquipment } from '../../../src/store/slices/equipmentSlice'
import { getPenyewa } from '../../../src/store/slices/penyewaSlice'
import { getCabang } from '../../../src/store/slices/cabangSlice'
import { getKaryawan } from '../../../src/store/slices/karyawanSlice'
import { createMobilization } from '../../../src/store/slices/equipmentMobilizationSlice'
import { filterPengantarKaryawan, formatDateTime, getThemeColors } from './utils'

const normalizeList = (raw) => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.rows)) return raw.rows
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  return []
}

export default function CreateMobilisasiEquipmentScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const theme = getThemeColors(mode)

  const equipmentRedux = useSelector((state) => state.equipment)
  const penyewaRedux = useSelector((state) => state.penyewa)
  const cabangRedux = useSelector((state) => state.cabang)
  const karyawanRedux = useSelector((state) => state.karyawan)
  const { mutationLoading } = useSelector((state) => state.equipmentMobilization)

  const [form, setForm] = useState({
    started_at: new Date(),
    origin_branch_id: '',
    destination_branch_id: '',
    origin_tenant_id: '',
    destination_tenant_id: '',
    notes: '',
  })
  // [{ equipment_id, karyawan_id }]
  const [selectedItems, setSelectedItems] = useState([])
  const [pickerEquipmentId, setPickerEquipmentId] = useState('')
  const [saveAs, setSaveAs] = useState('open') // draft | open
  const [dateVisible, setDateVisible] = useState(false)
  const [errors, setErrors] = useState({})
  const [alertState, setAlertState] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  })

  useEffect(() => {
    dispatch(getEquipment())
    dispatch(getPenyewa())
    dispatch(getCabang())
    dispatch(getKaryawan())
  }, [dispatch])

  const cabangOptions = useMemo(() => normalizeList(cabangRedux?.data).map((item) => ({
    id: String(item.id),
    nama: item.nama || item.name || `Cabang ${item.id}`,
    subtitle: [item.area, item.bisnis?.nama || item.bisnis?.initial || item.kode].filter(Boolean).join(' · '),
  })), [cabangRedux?.data])

  const penyewaOptions = useMemo(() => normalizeList(penyewaRedux?.data).map((item) => ({
    id: String(item.id),
    nama: item.nama || item.name || `Penyewa ${item.id}`,
    subtitle: item.abbr || item.kode || '',
  })), [penyewaRedux?.data])

  const karyawanOptions = useMemo(() => (
    filterPengantarKaryawan(normalizeList(karyawanRedux?.data))
      .map((item) => ({
        id: String(item.id),
        nama: item.nama || item.name || `Karyawan ${item.id}`,
        subtitle: [item.section || item.jabatan, item.phone || item.no_hp || item.hp].filter(Boolean).join(' · '),
      }))
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }))
  ), [karyawanRedux?.data])

  const equipmentMap = useMemo(() => {
    const map = new Map()
    normalizeList(equipmentRedux?.data).forEach((item) => map.set(String(item.id), item))
    return map
  }, [equipmentRedux?.data])

  const equipmentOptions = useMemo(() => {
    const selected = new Set(selectedItems.map((item) => String(item.equipment_id)))
    return normalizeList(equipmentRedux?.data)
      .filter((item) => !selected.has(String(item.id)))
      .map((item) => ({
        id: String(item.id),
        nama: item.kode || item.identity || `EQ-${item.id}`,
        subtitle: [item.kategori || item.ctg, item.model || item.manufaktur].filter(Boolean).join(' · '),
      }))
  }, [equipmentRedux?.data, selectedItems])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const addEquipment = (id) => {
    if (!id) return
    setSelectedItems((prev) => {
      if (prev.some((item) => String(item.equipment_id) === String(id))) return prev
      return [...prev, { equipment_id: String(id), karyawan_id: '' }]
    })
    setPickerEquipmentId('')
    if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }))
  }

  const removeEquipment = (id) => {
    setSelectedItems((prev) => prev.filter((item) => String(item.equipment_id) !== String(id)))
  }

  const updateItemKaryawan = (equipmentId, karyawanId) => {
    setSelectedItems((prev) => prev.map((item) => (
      String(item.equipment_id) === String(equipmentId)
        ? { ...item, karyawan_id: karyawanId || '' }
        : item
    )))
  }

  const validate = () => {
    const next = {}
    if (!form.started_at) next.started_at = 'Waktu mulai wajib diisi'
    if (!form.origin_branch_id) next.origin_branch_id = 'Cabang asal wajib dipilih'
    if (!form.destination_branch_id) next.destination_branch_id = 'Cabang tujuan wajib dipilih'
    if (!form.origin_tenant_id) next.origin_tenant_id = 'Penyewa asal wajib dipilih'
    if (!form.destination_tenant_id) next.destination_tenant_id = 'Penyewa tujuan wajib dipilih'
    if (
      form.origin_tenant_id
      && form.destination_tenant_id
      && form.origin_branch_id
      && form.destination_branch_id
      && String(form.origin_tenant_id) === String(form.destination_tenant_id)
      && String(form.origin_branch_id) === String(form.destination_branch_id)
    ) {
      next.destination_branch_id = 'Asal dan tujuan tidak boleh sama'
    }
    if (selectedItems.length < 1) next.items = 'Minimal pilih 1 equipment'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      setAlertState({
        visible: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Lengkapi data header dan minimal 1 equipment',
        buttons: [{ text: 'OK' }],
      })
      return
    }

    const finalSaveAs = saveAs === 'open' ? 'open' : 'draft'

    try {
      const payload = {
        started_at: moment(form.started_at).format('YYYY-MM-DD HH:mm:ss'),
        movement_date: moment(form.started_at).format('YYYY-MM-DD'),
        origin_branch_id: Number(form.origin_branch_id),
        destination_branch_id: Number(form.destination_branch_id),
        origin_tenant_id: Number(form.origin_tenant_id),
        destination_tenant_id: Number(form.destination_tenant_id),
        notes: form.notes?.trim() ? form.notes.trim() : null,
        save_as: finalSaveAs,
        request_id: `mob-mobile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        items: selectedItems.map((item) => {
          const equipmentId = Number(item.equipment_id)
          const karyawanId = item.karyawan_id ? Number(item.karyawan_id) : null
          return {
            equipment_id: equipmentId,
            ...(karyawanId ? { karyawan_id: karyawanId } : { karyawan_id: null }),
          }
        }),
      }

      if (payload.items.some((item) => !Number.isFinite(item.equipment_id) || item.equipment_id <= 0)) {
        throw new Error('Terdapat equipment tidak valid pada daftar item')
      }

      const created = await dispatch(createMobilization(payload)).unwrap()
      const createdId = created?.id
      if (!createdId) {
        throw new Error('Response create tidak valid: id dokumen kosong')
      }

      const isOpen = String(created?.status || '').toUpperCase() === 'OPEN' || finalSaveAs === 'open'
      setAlertState({
        visible: true,
        type: 'success',
        title: isOpen ? 'Dokumen Dibuka' : 'Draft Tersimpan',
        message: `Dokumen ${created?.document_no || createdId} berhasil ${isOpen ? 'dibuat dan di-open' : 'disimpan sebagai draft'}`,
        buttons: [{
          text: 'Lihat Detail',
          onPress: () => router.replace(`/operational/mobilisasi-equipment/${createdId}`),
        }],
      })
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : (error?.message || error?.payload || 'Gagal membuat dokumen mobilisasi')
      setAlertState({
        visible: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: String(message),
        buttons: [{ text: 'Tutup' }],
      })
    }
  }

  const FieldError = ({ message }) => message ? (
    <Text style={{ color: theme.danger, fontSize: 11, fontFamily: 'Quicksand-Medium', marginTop: 4 }}>{message}</Text>
  ) : null

  return (
    <AppScreen>
      <HeaderScreen title="Buat Mobilisasi" onBack={() => router.back()} onThemes />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 16 }}>Informasi Rute</Text>
            <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12, marginTop: 2, marginBottom: 12 }}>
              Satu dokumen = cabang & penyewa asal/tujuan untuk multi equipment
            </Text>

            <TouchableOpacity
              onPress={() => setDateVisible(true)}
              style={{
                borderWidth: 1,
                borderColor: errors.started_at ? theme.danger : theme.border,
                borderRadius: 12,
                padding: 12,
                backgroundColor: theme.surface,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold' }}>
                Waktu Mulai Mobilisasi
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 14 }}>
                  {formatDateTime(form.started_at)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color={theme.primary} />
                  <Clock size={16} color={theme.primary} />
                </View>
              </View>
              <FieldError message={errors.started_at} />
            </TouchableOpacity>

            <BottomSheetSelect
              label="Cabang Asal"
              placeholder="Pilih cabang asal"
              value={form.origin_branch_id}
              options={cabangOptions}
              onChange={(value) => updateField('origin_branch_id', value || '')}
            />
            <FieldError message={errors.origin_branch_id} />

            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Penyewa Asal"
              placeholder="Pilih penyewa asal"
              value={form.origin_tenant_id}
              options={penyewaOptions}
              onChange={(value) => updateField('origin_tenant_id', value || '')}
            />
            <FieldError message={errors.origin_tenant_id} />

            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Cabang Tujuan"
              placeholder="Pilih cabang tujuan"
              value={form.destination_branch_id}
              options={cabangOptions}
              onChange={(value) => updateField('destination_branch_id', value || '')}
            />
            <FieldError message={errors.destination_branch_id} />

            <View style={{ height: 10 }} />
            <BottomSheetSelect
              label="Penyewa Tujuan"
              placeholder="Pilih penyewa tujuan"
              value={form.destination_tenant_id}
              options={penyewaOptions}
              onChange={(value) => updateField('destination_tenant_id', value || '')}
            />
            <FieldError message={errors.destination_tenant_id} />

            <View style={{ marginTop: 12 }}>
              <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold', marginBottom: 6 }}>Catatan</Text>
              <TextInput
                value={form.notes}
                onChangeText={(value) => updateField('notes', value)}
                placeholder="Catatan opsional"
                placeholderTextColor={theme.muted}
                multiline
                style={{
                  minHeight: 80,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  padding: 12,
                  color: theme.text,
                  backgroundColor: theme.surface,
                  textAlignVertical: 'top',
                  fontFamily: 'Quicksand-Medium',
                }}
              />
            </View>
          </View>

          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 16 }}>Daftar Equipment</Text>
                <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12 }}>
                  {selectedItems.length} unit dipilih · karyawan optional
                </Text>
              </View>
              <AddSquare size={22} color={theme.primary} />
            </View>

            <View style={{ marginTop: 12 }}>
              <BottomSheetSelect
                label="Tambah Equipment"
                placeholder="Pilih equipment"
                value={pickerEquipmentId}
                options={equipmentOptions}
                onChange={(value) => addEquipment(value)}
              />
              <FieldError message={errors.items} />
            </View>

            <View style={{ marginTop: 12, gap: 10 }}>
              {selectedItems.map((row) => {
                const item = equipmentMap.get(String(row.equipment_id)) || {}
                return (
                  <View
                    key={row.equipment_id}
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 13 }}>
                          {item.kode || item.identity || `EQ-${row.equipment_id}`}
                        </Text>
                        <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 11, marginTop: 2 }}>
                          {[item.kategori || item.ctg, item.model || item.manufaktur].filter(Boolean).join(' · ') || '-'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeEquipment(row.equipment_id)}>
                        <Trash size={18} color={theme.danger} />
                      </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 10 }}>
                      <BottomSheetSelect
                        label="Karyawan Pengantar (opsional)"
                        placeholder="Pilih karyawan"
                        value={row.karyawan_id}
                        options={karyawanOptions}
                        onChange={(value) => updateItemKaryawan(row.equipment_id, value || '')}
                      />
                    </View>
                  </View>
                )
              })}

              {selectedItems.length === 0 && (
                <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                  <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12 }}>
                    Belum ada equipment dipilih
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              backgroundColor: theme.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
            }}
          >
            <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 15 }}>Mode Penyimpanan</Text>
            <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12, marginTop: 2, marginBottom: 12 }}>
              Pilih simpan sebagai draft atau langsung open dokumen
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { key: 'draft', title: 'Draft', desc: 'Bisa diedit dulu' },
                { key: 'open', title: 'Open', desc: 'Siap diproses' },
              ].map((option) => {
                const active = saveAs === option.key
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setSaveAs(option.key)}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: active ? theme.primary : theme.border,
                      backgroundColor: active ? (mode === 'dark' ? '#1E3A8A' : '#DBEAFE') : theme.surface,
                      padding: 12,
                    }}
                  >
                    <Text style={{ color: active ? theme.primary : theme.text, fontFamily: 'Quicksand-Bold', fontSize: 13 }}>
                      {option.title}
                    </Text>
                    <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 11, marginTop: 2 }}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={mutationLoading}
            style={{
              marginTop: 14,
              backgroundColor: mutationLoading ? theme.muted : theme.primary,
              borderRadius: 16,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <TickCircle size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontFamily: 'Quicksand-Bold', fontSize: 14 }}>
              {mutationLoading
                ? 'Menyimpan...'
                : (saveAs === 'open' ? 'Simpan & Open Dokumen' : 'Simpan Draft')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={dateVisible}
        mode="datetime"
        date={form.started_at}
        onConfirm={(date) => {
          updateField('started_at', date)
          setDateVisible(false)
        }}
        onCancel={() => setDateVisible(false)}
      />

      <CustomAlert
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        isDark={mode === 'dark'}
        onDismiss={() => setAlertState((prev) => ({ ...prev, visible: false }))}
      />
    </AppScreen>
  )
}
