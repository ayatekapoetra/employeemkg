import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSelector, useDispatch } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import moment from 'moment'
import { Modal, VStack, HStack, Button, Center } from 'native-base'
import { TickCircle, CloseCircle } from 'iconsax-react-native'
import { COLORS } from '../../../src/constants/colors'
import { createBreakdown } from '../../../src/store/slices/breakdownSlice'
import { getKaryawan } from '../../../src/store/slices/karyawanSlice'
import { getPenyewa } from '../../../src/store/slices/penyewaSlice'
import { KATEGORI } from '../../../src/utils/dailyBreakdown/constants'
import { validateBreakdownForm, formatDateTime } from '../../../src/utils/dailyBreakdown/utils'
import CategoryBadge from './components/CategoryBadge'
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect'
import database from '../../../src/database/SQLiteService'
import { AppScreen, HeaderScreen } from '../../../src/components/common'

const shiftKerja = [
    {
        "id": 1,
        "kode": "I",
        "nama": "Shift 1",
        "start_shift": "07:00:00",
        "start_int": 7,
        "end_shift": "19:00:00"
    },
    {
        "id": 2,
        "kode": "II",
        "nama": "Shift 2",
        "start_shift": "19:00:00",
        "start_int": 19,
        "end_shift": "07:00:00",
    },
    {
        "id": 3,
        "kode": "X",
        "nama": "Shift Normal",
        "start_shift": "08:00:00",
        "start_int": 8,
        "end_shift": "17:00:00",
    }
]

export default function CreateBreakdownScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const { loading } = useSelector((state) => state.breakdown)
  const equipmentRedux = useSelector((state) => state.equipment)
  const lokasiRedux = useSelector((state) => state.lokasikerja)
  const shiftRedux = useSelector((state) => state.shift)
  const karyawanRedux = useSelector((state) => state.karyawan)
  const penyewaRedux = useSelector((state) => state.penyewa)

  const [formData, setFormData] = useState({
    equipment_id: '',
    lokasi_id: '',
    breakdown_at: new Date(),
    smu: '',
    hmkm_start: '',
    hmkm_end: '',
    shift_id: '',
    pengawas_id: '',
    penyewa_id: '',
    category: '',
    items: [{ problem_issue: '', status: 'WT' }],
  })

  const [errors, setErrors] = useState({})
  const [picker, setPicker] = useState({ type: null, visible: false })
  const [equipmentLocal, setEquipmentLocal] = useState([])
  const [lokasiLocal, setLokasiLocal] = useState([])
  const [shiftLocal, setShiftLocal] = useState([])
  const [karyawanLocal, setKaryawanLocal] = useState([])
  const [penyewaLocal, setPenyewaLocal] = useState([])
  const [modalState, setModalState] = useState({ visible: false, type: 'success', title: '', message: '' })

  const isDark = mode === 'dark'
  const cardBg = isDark ? '#1f2437' : '#ffffff'
  const borderColor = isDark ? '#2f3247' : '#e5e7eb'
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280'
  const textColor = isDark ? COLORS.teks.dark[1] : COLORS.teks.light[1]

  // load local fallback
  useEffect(() => {
    const loadLocal = async () => {
      try {
        const eq = await database.getAll('master_equipment')
        const lok = await database.getAll('master_lokasipit')
        const shift = await database.getShift()
        let kary = await database.getKaryawan?.()
        if (!kary || kary.length === 0) {
          kary = await database.getOprDrv?.()
        }
        const peny = await database.getPenyewa?.()
        setEquipmentLocal(Array.isArray(eq) ? eq : [])
        setLokasiLocal(Array.isArray(lok) ? lok : [])
        setShiftLocal(Array.isArray(shift) ? shift : [])
        setKaryawanLocal(Array.isArray(kary) ? kary : [])
        setPenyewaLocal(Array.isArray(peny) ? peny : [])
      } catch (e) {
        console.warn('[CreateBreakdown] loadLocal error:', e?.message || e)
      }
    }
    loadLocal()
  }, [])

  // ensure karyawan redux populated from API/AsyncStorage
  useEffect(() => {
    const data = karyawanRedux?.data
    const hasData = Array.isArray(data)
      ? data.length > 0
      : Array.isArray(data?.rows)
        ? data.rows.length > 0
        : Array.isArray(data?.data)
          ? data.data.length > 0
          : false
    if (!karyawanRedux?.loading && !hasData) {
      dispatch(getKaryawan())
    }
  }, [dispatch, karyawanRedux?.data, karyawanRedux?.loading])

  // ensure penyewa redux populated from API/AsyncStorage
  useEffect(() => {
    const data = penyewaRedux?.data
    const hasData = Array.isArray(data)
      ? data.length > 0
      : Array.isArray(data?.rows)
        ? data.rows.length > 0
        : Array.isArray(data?.data)
          ? data.data.length > 0
          : false
    if (!penyewaRedux?.loading && !hasData) {
      dispatch(getPenyewa())
    }
  }, [dispatch, penyewaRedux?.data, penyewaRedux?.loading])

  const equipmentOptions = useMemo(() => {
    let data = equipmentRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || data?.equipment || []
    if ((!data || data.length === 0) && equipmentLocal.length) data = equipmentLocal
    if (!data || data.length === 0) return []
    return data
      .map((item) => {
        const id = item.id?.toString() || item.kode_unit?.toString() || item.kode?.toString() || ''
        if (!id) return null
        const kode = item.kode_unit || item.kode_equipment || item.code || item.kode || item.nopol || item.no_polisi || ''
        const nama = item.nama_unit || item.nama_equipment || item.name || item.nama || ''
        const manuf = item.manufaktur || item.manufacturer || ''
        const model = item.model || ''
        const subtitle = [manuf, model].filter(Boolean).join(' - ')
        return { 
          id, 
          nama: kode || nama || '[No Name]',
          subtitle: subtitle
        }
      })
      .filter(Boolean)
  }, [equipmentRedux?.data, equipmentLocal])

  const lokasiOptions = useMemo(() => {
    let data = lokasiRedux?.data || []
    if (!Array.isArray(data) && lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
      data = lokasiRedux.data.rows || lokasiRedux.data.data || []
    }
    if ((!data || data.length === 0) && lokasiLocal.length) data = lokasiLocal
    if (!data || data.length === 0) return []
    return data
      .map((item) => {
        const id = item.id?.toString() || item.kode_lokasi?.toString() || item.kode?.toString() || ''
        if (!id) return null
        const cabangNama = item.cabang?.nama || item.cabang?.name || item.nama_cabang || item.cabang_name || ''
        const typeLokasi = item.type || item.tipe || item.jenis || ''
        const subtitleParts = []
        if (typeLokasi) subtitleParts.push(typeLokasi)
        if (cabangNama) subtitleParts.push(cabangNama)
        return {
          id,
          nama: item.nama_lokasi || item.nama || item.lokasi || '[No Name]',
          subtitle: subtitleParts.join(' - '),
        }
      })
      .filter(Boolean)
  }, [lokasiRedux?.data, lokasiLocal])

  const shiftOptions = useMemo(() => {
    let data = shiftRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || shiftKerja
    if ((!data || data.length === 0) && Array.isArray(shiftRedux?.master_shift)) {
      data = shiftRedux.master_shift
    }
    if ((!data || data.length === 0) && Array.isArray(shiftRedux?.sqlite_shift)) {
      data = shiftRedux.sqlite_shift
    }
    if ((!data || data.length === 0) && shiftLocal.length) {
      data = shiftLocal
    }
    if (!data || data.length === 0) return shiftKerja
    return data.map(item => {
      const id = item.id?.toString() || ''
      if (!id) return null
      const nama = item.nama || item.name || item.shift_name || item.kode || ''
      const start = item.start_shift || item.start || ''
      const end = item.end_shift || item.end || ''
      const subtitle = start && end ? `${start} - ${end}` : ''
      return { id, nama, subtitle }
    }).filter(Boolean)
  }, [shiftRedux?.data, shiftRedux?.master_shift, shiftRedux?.sqlite_shift, shiftLocal])

  const pengawasOptions = useMemo(() => {
    let data = karyawanRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || []
    if ((!data || data.length === 0) && karyawanLocal.length) {
      data = karyawanLocal
    }
    if (!data || data.length === 0) return []

    const allowed = ['pengawas', 'koordinator', 'korlap', 'pjo', 'supervisor', 'spv', 'services', 'service', 'svc']
    const filtered = data.filter(item => {
      const dynamicFields = Object.keys(item || {})
        .filter(key => /section|jabatan|role|position|usertype/i.test(key))
        .map(key => item[key])

      const secText = [
        item.section,
        item.section_name,
        item.sectionName,
        item.seksi,
        item.bagian,
        item.departemen,
        item.department,
        item.divisi,
        item.division,
        item.jabatan,
        item.jabatan_name,
        item.kode_jabatan,
        item.position,
        item.position_name,
        item.job_title,
        item.jobtitle,
        item.role,
        item.role_name,
        item.role_code,
        item.usertype,
        ...dynamicFields,
      ]
        .filter(Boolean)
        .map(val => val.toString().toLowerCase())
        .join(' ')
      if (!secText) return false
      return allowed.some(role => secText.includes(role))
    })

    const listToUse = filtered.length > 0
      ? filtered
      : data.filter(item => {
          const nameText = (item.nama || item.name || '').toString().toLowerCase()
          return nameText.includes('pengawas')
        })

    return listToUse
      .map(item => {
        const id = item.id?.toString() || ''
        if (!id) return null
        const nama = item.nama || item.name || ''
        const section =
          item.section_name ||
          item.section ||
          item.jabatan ||
          item.departemen ||
          item.divisi ||
          item.role ||
          item.position_name ||
          item.job_title ||
          ''
        const cabangName = item.cabang?.nama || item.cabang?.name || item.nama_cabang || ''
        const subtitle = [section, cabangName].filter(Boolean).join(' - ')
        return { id, nama, subtitle }
      })
      .filter(Boolean)
  }, [karyawanRedux?.data, karyawanLocal])

  const penyewaOptions = useMemo(() => {
    let data = penyewaRedux?.data || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || []
    if ((!data || data.length === 0) && penyewaLocal.length) {
      data = penyewaLocal
    }
    if (!data || data.length === 0) return []
    return data
      .map((item) => {
        const id = item.id?.toString() || ''
        if (!id) return null
        const nama = item.nama || item.name || ''
        const abbr = item.abbr || item.kode || ''
        return { id, nama: nama || '[No Name]', subtitle: abbr }
      })
      .filter(Boolean)
  }, [penyewaRedux?.data, penyewaLocal])

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const updateItemProblem = (idx, value) => {
    setFormData(prev => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], problem_issue: value }
      return { ...prev, items }
    })
  }

  const addIssue = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { problem_issue: '', status: 'WT' }] }))
  }

  const removeIssue = (idx) => {
    setFormData(prev => {
      if (prev.items.length <= 1) return prev
      const items = prev.items.filter((_, i) => i !== idx)
      return { ...prev, items }
    })
  }

  const updateCategory = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }))
    if (errors.category) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.category
        return next
      })
    }
  }

  // date/time picker handler
  const handlePickerConfirm = (selected) => {
    if (selected) {
      updateField('breakdown_at', selected)
    }
    setPicker({ type: null, visible: false })
  }

  const handleSubmit = async () => {
    const categoryValue = formData.category || ''
    const breakdownAtValue = formData.breakdown_at
      ? moment(formData.breakdown_at).format('YYYY-MM-DD HH:mm:ss')
      : ''
    const pengawasId = formData.pengawas_id ? formData.pengawas_id.toString() : ''

    if (!formData.penyewa_id) {
      Alert.alert('Validasi', 'Penyewa wajib dipilih')
      return
    }

    const dataToValidate = {
      equipment_id: formData.equipment_id,
      lokasi_id: formData.lokasi_id,
      breakdown_at: breakdownAtValue,
      pengawas_id: pengawasId,
      category: categoryValue,
      items: formData.items.filter(it => it.problem_issue?.trim()),
    }

    // const validation = validateBreakdownForm(dataToValidate)
    
    // if (!validation.isValid) {
    //   setErrors(validation.errors)
    //   Alert.alert('Validation Error', 'Harap isi semua field wajib')
    //   return
    // }

    const payload = {
      equipment_id: formData.equipment_id,
      lokasi_id: formData.lokasi_id,
      breakdown_at: breakdownAtValue,
      smu: null,
      hmkm_start: formData.hmkm_start ? parseFloat(formData.hmkm_start) : 0,
      hmkm_end: 0,
      shift_id: formData.shift_id || null,
      pengawas_id: pengawasId || null,
      penyewa_id: formData.penyewa_id || null,
      category: categoryValue,
      items: formData.items
        .map(it => ({ ...it, problem_issue: it.problem_issue?.trim() || '' }))
        .filter(it => it.problem_issue)
        .map(it => ({
          problem_issue: it.problem_issue,
          status: it.status || 'WT',
          category: categoryValue,
        })),
    }

    try {
      await dispatch(createBreakdown(payload)).unwrap()
      setModalState({
        visible: true,
        type: 'success',
        title: 'Berhasil Disimpan',
        message: 'Breakdown tersimpan. Terima kasih sudah melaporkan dengan detail.',
      })
    } catch (error) {
      console.log('[CreateBreakdown] error response:', error?.response?.data || error?.message || 'unknown error')
      const backendMessage = error?.response?.data?.diagnostic?.message || error?.message || 'Gagal membuat breakdown'
      setModalState({
        visible: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: backendMessage,
      })
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <AppScreen>
      <HeaderScreen
        title="Create Daily Breakdown"
        onBack={() => router.back()}
        onThemes={true}
        onNotification={true}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={RNPlatform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.formContainer, { backgroundColor: isDark ? COLORS.container.dark : COLORS.container.light }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: cardBg, borderColor: borderColor }]}> 
            <View style={[styles.field]}>
              <Text style={[styles.label, { color: subtitleColor }]}>Tanggal & Waktu</Text>
              <View style={[styles.row, { marginTop: 4 }]}>
              <TouchableOpacity
                onPress={() => setPicker({ type: 'datetime', visible: true })}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderWidth: 1,
                  borderColor,
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: 'Poppins-Regular',
                      color: textColor,
                    }}
                    numberOfLines={1}
                  >
                    {formData.breakdown_at ? formatDateTime(formData.breakdown_at) : 'Pilih'}
                  </Text>
                  <Ionicons name="calendar" size={16} color={subtitleColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: cardBg, borderColor: borderColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Informasi Peralatan</Text>
            <BottomSheetSelect
              label="Equipment"
              placeholder="Pilih equipment"
              value={formData.equipment_id?.toString() || ''}
              options={equipmentOptions.map(o => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
              onChange={(id) => updateField('equipment_id', id)}
              displaySubKey="subtitle"
            />

            <BottomSheetSelect
              label="Lokasi"
              placeholder="Pilih lokasi"
              value={formData.lokasi_id?.toString() || ''}
              options={lokasiOptions.map(o => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
              onChange={(id) => updateField('lokasi_id', id)}
              displaySubKey="subtitle"
            />

            <BottomSheetSelect
              label="Shift"
              placeholder="Pilih shift"
              value={formData.shift_id?.toString() || ''}
              options={shiftOptions.map(o => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
              onChange={(id) => updateField('shift_id', id)}
              displaySubKey="subtitle"
            />

            <BottomSheetSelect
              label="Pengawas"
              placeholder="Pilih pengawas"
              value={formData.pengawas_id?.toString() || ''}
              options={pengawasOptions.map(o => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
              onChange={(id) => updateField('pengawas_id', id)}
              displaySubKey="subtitle"
            />

            <BottomSheetSelect
              label="Penyewa *"
              placeholder="Pilih penyewa"
              value={formData.penyewa_id?.toString() || ''}
              options={penyewaOptions.map(o => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
              onChange={(id) => updateField('penyewa_id', id)}
              displaySubKey="subtitle"
            />

            <View style={styles.field}>
              <Text style={[styles.label, { color: subtitleColor }]}>HM/KM Start</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={formData.hmkm_start}
                onChangeText={(text) => updateField('hmkm_start', text)}
                keyboardType="numeric"
                placeholder="Mulai"
                placeholderTextColor={subtitleColor}
              />
            </View>
          </View>
          <View style={[styles.section, { backgroundColor: cardBg, borderColor: borderColor }]}> 
            <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}> 
              <Text style={[styles.sectionTitle, { color: textColor }]}>Permasalahan (Issue)</Text>
              <TouchableOpacity onPress={addIssue} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: isDark ? '#1e40af' : '#dbeafe' }}>
                <Text style={{ color: isDark ? '#93c5fd' : '#1e3a8a', fontSize: 12, fontFamily: 'Poppins-SemiBold' }}>+ Tambah</Text>
              </TouchableOpacity>
            </View>

          {formData.items.map((it, idx) => (
            <View key={idx} style={{ marginTop: 8, gap: 6 }}>
              <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}> 
                <Text style={[styles.label, { color: subtitleColor }]}>Issue #{idx + 1}</Text>
                {formData.items.length > 1 && (
                  <TouchableOpacity onPress={() => removeIssue(idx)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12, fontFamily: 'Poppins-SemiBold' }}>Hapus</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput 
                style={[styles.textArea, { color: textColor, borderColor }]} 
                value={it.problem_issue || ''} 
                onChangeText={(text) => updateItemProblem(idx, text)} 
                multiline 
                numberOfLines={4} 
                placeholder="Tuliskan permasalahan dengan detail" 
                placeholderTextColor={subtitleColor} 
              /> 
            </View>
          ))}
        </View> 

        <View style={{ height: 120 }} /> 
        </ScrollView>

        <DateTimePickerModal
          isVisible={picker.visible}
          mode="datetime"
          onConfirm={handlePickerConfirm}
          onCancel={() => setPicker({ type: null, visible: false })}
          date={formData.breakdown_at}
        />

        <Modal
          isOpen={modalState.visible}
          onClose={() => setModalState(prev => ({ ...prev, visible: false }))}
          size="md"
        >
          <Modal.Content maxWidth="420" bg={cardBg} borderRadius={20}>
            <Modal.Body p={6}>
              <VStack space={4} alignItems="center">
                <Center w={20} h={20} bg={isDark ? '#111827' : '#f1f5f9'} rounded="full">
                  {modalState.type === 'success' ? (
                    <TickCircle size={36} color={isDark ? '#22c55e' : '#16a34a'} variant="Bold" />
                  ) : (
                    <CloseCircle size={36} color={isDark ? '#f87171' : '#ef4444'} variant="Bold" />
                  )}
                </Center>
                <VStack alignItems="center" space={2}>
                  <Text style={{ fontSize: 18, fontFamily: 'Quicksand-Bold', color: textColor, textAlign: 'center' }}>
                    {modalState.title || (modalState.type === 'success' ? 'Berhasil' : 'Gagal')}
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Poppins-Light', color: subtitleColor, textAlign: 'center' }}>
                    {modalState.message || (modalState.type === 'success' ? 'Data tersimpan.' : 'Terjadi kesalahan.')}
                  </Text>
                </VStack>
                <Button
                  mt={2}
                  w="full"
                  bg={modalState.type === 'success' ? (isDark ? '#16a34a' : '#22c55e') : (isDark ? '#ef4444' : '#dc2626')}
                  _pressed={{ bg: modalState.type === 'success' ? (isDark ? '#15803d' : '#16a34a') : (isDark ? '#b91c1c' : '#b91c1c') }}
                  onPress={() => {
                    setModalState(prev => ({ ...prev, visible: false }))
                    if (modalState.type === 'success') {
                      router.back()
                    }
                  }}
                  rounded="xl"
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Quicksand-Bold', color: '#ffffff' }}>
                    {modalState.type === 'success' ? 'Selesai' : 'Mengerti'}
                  </Text>
                </Button>
              </VStack>
            </Modal.Body>
          </Modal.Content>
        </Modal>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: isDark ? '#0b1220' : '#ffffff',
              borderTopColor: borderColor,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              styles.primaryButton,
              {
                backgroundColor: loading ? '#9ca3af' : (isDark ? '#2563eb' : '#1d4ed8'),
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Simpan</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  formContainer: {
    padding: 10,
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#f9fafb',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
