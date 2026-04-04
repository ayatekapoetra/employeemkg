import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Edit, Trash, Truck, User, Flag, Building, Clock, InfoCircle } from 'iconsax-react-native'

import AppScreen from '../../../src/components/common/AppScreen'
import HeaderScreen from '../../../src/components/common/HeaderScreen'
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect'
import CustomAlert from '../../../src/components/common/CustomAlert'
import { COLORS } from '../../../src/constants/colors'
import { getActivityPlanDetail, updateActivityPlan, deleteActivityPlan } from '../../../src/store/slices/activityPlanSlice'
import { getKaryawan } from '../../../src/store/slices/karyawanSlice'
import { getEquipment } from '../../../src/store/slices/equipmentSlice'
import { getKegiatanPit } from '../../../src/store/slices/kegiatanPitSlice'
import { getLokasiPit } from '../../../src/store/slices/lokasiPitSlice'
import { getCabang } from '../../../src/store/slices/cabangSlice'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

const STATUS_OPTIONS = [
  { key: 'BEROPERASI', label: 'BEROPERASI', subtitle:'' },
  { key: 'STANDBY', label: 'STANDBY', subtitle:'' },
  { key: 'NO JOB', label: 'NO JOB', subtitle:'' },
  { key: 'NO OPERATOR', label: 'NO OPERATOR', subtitle:'' },
  { key: 'NO DRIVER', label: 'NO DRIVER', subtitle:'' },
  { key: 'BREAKDOWN', label: 'BREAKDOWN', subtitle:'' },
]

const SHIFT_OPTIONS = [
  { key: 'PAGI', label: 'PAGI' },
  { key: 'MALAM', label: 'MALAM' },
]

const CTG_OPTIONS = [
  { key: 'HE', label: 'HE (Alat Berat)' },
  { key: 'DT', label: 'DT (Dumptruck)' },
]

const STATUS_NO_KARYAWAN = ['NO OPERATOR', 'NO DRIVER'] // Status yang tidak memerlukan karyawan_id sama sekali
const PRIMARY_COLOR = COLORS?.primary || '#1d4ed8'
const DISABLED_COLOR = COLORS?.disabled || '#9ca3af'
const DANGER_COLOR = COLORS?.danger || '#ef4444'

export default function EquipmentPlanDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const dispatch = useDispatch()

  const mode = useSelector((state) => state.themes)?.value || 'light'
  const { loading, currentActivityPlan } = useSelector((state) => state.activityPlan)
  const equipmentRedux = useSelector((state) => state.equipment)
  const karyawanRedux = useSelector((state) => state.karyawan)
  const kegiatanRedux = useSelector((state) => state.kegiatankerja)
  const lokasiRedux = useSelector((state) => state.lokasikerja)
  const cabangRedux = useSelector((state) => state.cabang)

  const [formData, setFormData] = useState({
    date_ops: new Date(),
    shift: 'PAGI',
    status: 'BEROPERASI',
    ctg: 'DT',
    cabang_id: '',
    equipment_id: '',
    karyawan_id: '',
    kegiatan_id: '',
    lokasi_id: '',
    lokasi_to: '',
    keterangan: '',
  })

  const [errors, setErrors] = useState({})
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [alertState, setAlertState] = useState({ visible: false, type: 'info', title: '', message: '', buttons: [] })

  useEffect(() => {
    const loadDetail = async () => {
      if (!params.id) return
      setLoadingDetail(true)
      try {
        await dispatch(getActivityPlanDetail(params.id)).unwrap()
      } catch (error) {
        setAlertState({
          visible: true,
          type: 'error',
          title: 'Gagal memuat data',
          message: error.message || 'Terjadi kesalahan saat memuat detail',
          buttons: [{ text: 'Kembali', onPress: () => router.back() }],
        })
      } finally {
        setLoadingDetail(false)
      }
    }
    loadDetail()
  }, [dispatch, params.id, router])

  useEffect(() => {
    dispatch(getEquipment())
    dispatch(getKaryawan())
    dispatch(getKegiatanPit())
    dispatch(getLokasiPit())
    dispatch(getCabang())
  }, [dispatch])

  useEffect(() => {
    if (currentActivityPlan && String(currentActivityPlan.id) === String(params.id)) {
      const dateOps = currentActivityPlan.date_ops ? new Date(currentActivityPlan.date_ops) : new Date()
      setFormData({
        date_ops: dateOps,
        shift: currentActivityPlan.shift || 'PAGI',
        status: currentActivityPlan.status || 'BEROPERASI',
        ctg: currentActivityPlan.ctg || 'DT',
        cabang_id: currentActivityPlan.cabang_id?.toString() || '',
        equipment_id: currentActivityPlan.equipment_id?.toString() || '',
        karyawan_id: currentActivityPlan.karyawan_id?.toString() || '',
        kegiatan_id: currentActivityPlan.kegiatan_id?.toString() || '',
        lokasi_id: currentActivityPlan.lokasi_id?.toString() || '',
        lokasi_to: currentActivityPlan.lokasi_to?.toString() || '',
        keterangan: currentActivityPlan.keterangan || '',
      })
    }
  }, [currentActivityPlan, params.id])

  const equipmentOptions = useMemo(() => {
    const data = equipmentRedux?.data || []
    const list = Array.isArray(data) ? data : data?.rows || data?.data || []
    const base = (list || []).map((eq) => ({
      id: eq.id?.toString(),
      nama: eq.kode || eq.nama || `EQ-${eq.id}`,
      subtitle: [eq.manufaktur || eq.manufacturer, eq.model].filter(Boolean).join(' - ') || (eq.kategori || eq.ctg || ''),
      ctg: (eq.kategori || eq.ctg || '').toString().toUpperCase(),
    })).filter(Boolean)
    if (!formData.ctg) return base
    const filtered = base.filter((eq) => eq.ctg === formData.ctg.toUpperCase())
    return filtered.length ? filtered : base
  }, [equipmentRedux?.data, formData.ctg])

  const karyawanOptions = useMemo(() => {
    const data = karyawanRedux?.data || []
    const list = Array.isArray(data) ? data : data?.rows || data?.data || []
    return list
      .map((kar) => {
        const nama = kar.nama || kar.name || ''
        const section = kar.section || kar.jabatan || kar.position || ''
        const phone = kar.phone || kar.hp || kar.telepon || kar.no_hp || ''
        const subtitle = [section, phone].filter(Boolean).join(' - ')
        return { id: kar.id?.toString(), nama, subtitle }
      })
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }))
  }, [karyawanRedux?.data])

  const kegiatanOptions = useMemo(() => {
    const raw = kegiatanRedux?.data
    const data = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.rows)
        ? raw.rows
        : Array.isArray(raw?.data)
          ? raw.data
          : []

    const mapped = data
      .map((kg, idx) => {
        const id = (kg?.id || kg?.kegiatan_id || kg?.kode || kg?.code || kg?.uuid || kg?.uid || idx).toString()
        const nama = kg?.nama || kg?.name || kg?.kegiatan || kg?.title || kg?.abbr || `Kegiatan ${idx + 1}`
        const grup = (kg?.grpequipment || kg?.grup_equipment || kg?.group_equipment || kg?.grup || kg?.kategori || kg?.type || kg?.category || '').toString().toUpperCase()
        const narasi = kg?.narasi || kg?.deskripsi || kg?.description || kg?.note || kg?.keterangan || ''
        const subtitle = [grup, narasi].filter(Boolean).join(' - ')
        return { id, nama, subtitle, grup }
      })
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }))

    const target = (formData.ctg || '').toString().toUpperCase()
    if (!target) return mapped
    const filtered = mapped.filter((k) => k.grup === target)
    return filtered.length ? filtered : mapped
  }, [kegiatanRedux?.data, formData.ctg])

  const lokasiOptions = useMemo(() => {
    let data = lokasiRedux?.data || []
    if (!Array.isArray(data) && data) data = data.rows || data.data || []
    return (data || []).map((lok) => {
      const id = lok.id?.toString() || lok.kode_lokasi?.toString() || lok.kode?.toString()
      if (!id) return null
      const nama = lok.nama || lok.lokasi || lok.nama_lokasi || ''
      const tipe = lok.type || lok.tipe || lok.jenis || ''
      const cabangNama = lok.cabang?.nama || lok.cabang?.name || lok.cabang_name || ''
      const subtitle = [cabangNama, tipe].filter(Boolean).join(' - ')
      return { id, nama, subtitle }
    }).filter(Boolean)
  }, [lokasiRedux?.data])

  const cabangOptions = useMemo(() => {
    let data = cabangRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || []
    return (data || [])
      .map((cab) => {
        const id = cab.id?.toString()
        if (!id) return null
        const nama = cab.nama || cab.name || cab.nama_cabang || '[No Name]'
        const area = cab.area || cab.cabang?.area || cab.mas_cabang?.area || cab.area_name || 'Area'
        const bisnis = cab.bisnis?.nama || cab.bisnis?.name || cab.bisnis?.initial || cab.nama_bisnis || cab.bisnis_unit?.nama || cab.bisnis_unit?.name || cab.bisnis_unit?.initial || 'Bisnis'
        const subtitle = [area, bisnis].filter(Boolean).join(' - ')
        return { id, nama, subtitle }
      })
      .filter(Boolean)
  }, [cabangRedux?.data])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.date_ops) newErrors.date_ops = 'Tanggal operasi wajib diisi'
    if (!formData.shift) newErrors.shift = 'Shift wajib dipilih'
    if (!formData.status) newErrors.status = 'Status wajib dipilih'
    if (!formData.ctg) newErrors.ctg = 'Kategori wajib dipilih'
    if (!formData.cabang_id) newErrors.cabang_id = 'Cabang wajib dipilih'
    if (!formData.equipment_id) newErrors.equipment_id = 'Equipment wajib dipilih'
    if (!formData.lokasi_id) newErrors.lokasi_id = 'Lokasi wajib dipilih'
    if (formData.ctg === 'DT' && formData.status === 'BEROPERASI' && !formData.lokasi_to) newErrors.lokasi_to = 'Lokasi tujuan wajib diisi'
    
    // Only validate karyawan_id if status doesn't explicitly forbid it
    if (!STATUS_NO_KARYAWAN.includes(formData.status) && !formData.karyawan_id) {
      newErrors.karyawan_id = 'Operator/Driver wajib dipilih'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdate = async () => {
    if (!validateForm()) {
      setAlertState({ visible: true, type: 'error', title: 'Validasi Gagal', message: 'Lengkapi field yang wajib diisi', buttons: [{ text: 'OK' }] })
      return
    }
    
    try {
      console.log('[handleUpdate] Form data before formatting:', formData)
      
      // Format the payload properly - kirim semua field apa adanya, biarkan backend yang validasi
      const payload = {
        date_ops: formData.date_ops.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        shift: formData.shift,
        status: formData.status,
        ctg: formData.ctg,
        cabang_id: formData.cabang_id,
        equipment_id: formData.equipment_id,
        karyawan_id: formData.karyawan_id || '', // Kirim apa adanya, jangan ubah berdasarkan status
        kegiatan_id: formData.kegiatan_id || '',
        lokasi_id: formData.lokasi_id,
        lokasi_to: formData.lokasi_to || '',
        keterangan: formData.keterangan || ''
      }
      
      console.log('[handleUpdate] Payload to be sent:', payload)
      
      await dispatch(updateActivityPlan({ id: params.id, data: payload })).unwrap()
      setAlertState({ visible: true, type: 'success', title: 'Berhasil', message: 'Data aktivitas equipment berhasil diperbarui', buttons: [{ text: 'OK', onPress: () => router.back() }] })
    } catch (error) {
      console.error('[handleUpdate] Error:', error)
      console.error('[handleUpdate] Error response:', error.response?.data)
      console.error('[handleUpdate] Error status:', error.response?.status)
      
      // Extract detailed error message
      let errorMessage = 'Gagal memperbarui data'
      if (error.response?.data) {
        const errorData = error.response.data
        errorMessage = errorData.message || 
                      errorData.diagnostic?.message || 
                      errorData.errors?.join(', ') || 
                      errorData.error ||
                      'Gagal memperbarui data'
      }
      
      setAlertState({ visible: true, type: 'error', title: 'Gagal', message: errorMessage, buttons: [{ text: 'Tutup' }] })
    }
  }

  const handleDelete = () => {
    setAlertState({
      visible: true,
      type: 'warning',
      title: 'Hapus Data',
      message: 'Apakah Anda yakin ingin menghapus data ini?',
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: async () => {
            try {
              await dispatch(deleteActivityPlan(params.id)).unwrap()
              setAlertState({ visible: true, type: 'success', title: 'Berhasil', message: 'Data berhasil dihapus', buttons: [{ text: 'OK', onPress: () => router.back() }] })
            } catch (error) {
              setAlertState({ visible: true, type: 'error', title: 'Gagal', message: error.message || 'Gagal menghapus data', buttons: [{ text: 'Tutup' }] })
            }
          }
        }
      ]
    })
  }

  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'ctg') {
        next.equipment_id = ''
        next.kegiatan_id = ''
        if (value === 'HE') next.lokasi_to = ''
      }
      // Jangan hapus karyawan_id saat status berubah, biarkan backend yang menangani
      return next
    })
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  console.log('formData-----', formData);
  

if (loadingDetail) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <ActivityIndicator size="large" color="#1d4ed8" />
      <Text>Loading...</Text>
    </View>
  )
}

return (
    <AppScreen>
      <HeaderScreen title="Detail Aktivitas" onBack={() => router.back()} onThemes onNotification />
      
      <ScrollView style={{ flex: 1, backgroundColor: mode === 'dark' ? COLORS.container.dark : COLORS.container.light }}>
        <View style={{ padding: 16, paddingBottom: 140 }}>
          {/* Summary Card */}
          <View style={{ 
            backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff', 
            borderRadius: 16, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: mode === 'dark' ? '#2f3247' : '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Header with ID */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1] }}>
                Aktivitas Equipment
              </Text>
              <View style={{ 
                backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb'
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  ID: #{params.id}
                </Text>
              </View>
            </View>

            {/* Status Selector */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Status
              </Text>
              <BottomSheetSelect 
                placeholder="Pilih status" 
                value={formData.status || ''} 
                options={STATUS_OPTIONS.map(opt => ({ 
                  id: opt.key, 
                  nama: opt.label,
                  subtitle: opt.subtitle
                }))} 
                onChange={(value) => updateField('status', value)} 
              />
            </View>

            {/* CTG and Shift Row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              {/* CTG Selector */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Kategori
                </Text>
                <BottomSheetSelect 
                  placeholder="Pilih kategori" 
                  value={formData.ctg || ''} 
                  options={CTG_OPTIONS.map(opt => ({ id: opt.key, nama: opt.label }))} 
                  onChange={(value) => updateField('ctg', value)} 
                />
              </View>

              {/* Shift Selector */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Shift
                </Text>
                <BottomSheetSelect 
                  placeholder="Pilih shift" 
                  value={formData.shift || ''} 
                  options={SHIFT_OPTIONS.map(opt => ({ id: opt.key, nama: opt.label }))} 
                  onChange={(value) => updateField('shift', value)} 
                />
              </View>
            </View>

            {/* Date Picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Tanggal Operasi
              </Text>
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#1d4ed8',
                  backgroundColor: mode === 'dark' ? '#374151' : '#f0f9ff'
                }} 
                onPress={() => setDatePickerVisible(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={18} color="#1d4ed8" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1], marginLeft: 10 }}>
                    {formData.date_ops.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#1d4ed8' }}>
                  Ubah ▼
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cabang Info */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Lokasi Cabang
              </Text>
              <BottomSheetSelect 
                placeholder="Pilih cabang" 
                value={formData.cabang_id || ''} 
                options={cabangOptions} 
                displaySubKey="subtitle" 
                onChange={(value) => updateField('cabang_id', value)} 
              />
            </View>
          </View>

          
          <View style={{ 
            backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff', 
            borderRadius: 16, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: mode === 'dark' ? '#2f3247' : '#e5e7eb'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1] }}>
                Informasi Detail
              </Text>
              <InfoCircle size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            </View>

            
            <View style={{ marginBottom: 16 }}>
              <BottomSheetSelect 
                label={'Equipment'}
                placeholder="Pilih equipment" 
                value={formData.equipment_id?.toString() || ''} 
                options={equipmentOptions} 
                displaySubKey="subtitle" 
                onChange={(id) => updateField('equipment_id', id)} 
              />
            </View>

            
            <View style={{ marginBottom: 16 }}>
              <BottomSheetSelect 
                label={'Operator/Driver'}
                placeholder="Pilih operator/driver" 
                value={formData.karyawan_id?.toString() || ''} 
                options={karyawanOptions} 
                displaySubKey="subtitle" 
                disabled={STATUS_NO_KARYAWAN.includes(formData.status)}
                onChange={(id) => updateField('karyawan_id', id)} 
              />
            </View>

            
            <View style={{ marginBottom: 16 }}>
              <BottomSheetSelect 
                label={'Kegiatan'}
                placeholder="Pilih kegiatan" 
                value={formData.kegiatan_id?.toString() || ''} 
                options={kegiatanOptions} 
                displaySubKey="subtitle" 
                onChange={(id) => updateField('kegiatan_id', id)} 
              />
            </View>

            
            <View style={{ marginBottom: 16 }}>
              <BottomSheetSelect 
                label={'Lokasi Asal'}
                placeholder="Pilih lokasi asal" 
                value={formData.lokasi_id?.toString() || ''} 
                options={lokasiOptions} 
                displaySubKey="subtitle" 
                onChange={(id) => updateField('lokasi_id', id)} 
              />
            </View>

            
            {(formData.ctg === 'DT' && formData.status === 'BEROPERASI') && (
              <View style={{ marginBottom: 16 }}>
                <BottomSheetSelect 
                  abel={'Lokasi Tujuan'}
                  placeholder="Pilih lokasi tujuan" 
                  value={formData.lokasi_to?.toString() || ''} 
                  options={lokasiOptions} 
                  displaySubKey="subtitle" 
                  onChange={(id) => updateField('lokasi_to', id)} 
                />
              </View>
            )}

            
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1] }}>
                Keterangan
              </Text>
              <View style={{ 
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                borderColor: mode === 'dark' ? '#2f3247' : '#e5e7eb'
              }}>
                <TextInput
                  placeholder="Tambahkan keterangan (opsional)"
                  placeholderTextColor={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.keterangan}
                  onChangeText={(value) => updateField('keterangan', value)}
                  style={{ color: mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1], fontSize: 14, fontWeight: '400', minHeight: 80 }}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity 
              style={{ 
                flex: 1, 
                marginRight: 6,
                backgroundColor: '#ef4444', 
                borderRadius: 16, 
                paddingVertical: 16, 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
              }}
              onPress={handleDelete}
            >
              <Trash size={20} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>Hapus</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ 
                flex: 1, 
                marginLeft: 6,
                backgroundColor: '#1d4ed8', 
                borderRadius: 16, 
                paddingVertical: 16, 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: '#1d4ed8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
              }}
              onPress={handleUpdate}
            >
              <Edit size={20} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        date={formData.date_ops}
        onConfirm={(date) => {
          setDatePickerVisible(false)
          updateField('date_ops', date)
        }}
        onCancel={() => setDatePickerVisible(false)}
      />

      <CustomAlert
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={() => setAlertState((prev) => ({ ...prev, visible: false }))}
        isDark={mode === 'dark'}
      />
    </AppScreen>
  )
}



const styles = StyleSheet.create({
  // Summary Card
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryId: {
    fontSize: 12,
    fontWeight: '400',
  },

  // Summary Row
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  ctgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ctgText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shiftText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Date Row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },

  // Cabang Info
  cabangInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cabangText: {
    marginLeft: 10,
  },
  cabangName: {
    fontSize: 14,
    fontWeight: '600',
  },
  cabangDetail: {
    fontSize: 12,
    fontWeight: '400',
  },

  // Form Card
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Form Groups
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Keterangan
  keteranganBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  keteranganInput: {
    fontSize: 14,
    fontWeight: '400',
    minHeight: 80,
  },
  
  // Error Text
  errorText: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
  
  // Footer
  footerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
})
