import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { HStack, VStack } from 'native-base'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Verify, CloseCircle, AddSquare } from 'iconsax-react-native'

import { AppScreen, HeaderScreen } from '../../../src/components/common'
import { COLORS } from '../../../src/constants/colors'
import { createActivityPlan, createActivityPlanBulk } from '../../../src/store/slices/activityPlanSlice'
import { getKaryawan } from '../../../src/store/slices/karyawanSlice'
import { getEquipment } from '../../../src/store/slices/equipmentSlice'
import { getKegiatanPit } from '../../../src/store/slices/kegiatanPitSlice'
import { getLokasiPit } from '../../../src/store/slices/lokasiPitSlice'
import { getCabang } from '../../../src/store/slices/cabangSlice'
import CustomAlert from '../../../src/components/common/CustomAlert'
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import LoadingHauler from '../../../src/components/common/LoadingHauler'

const STATUS_OPTIONS = [
  { key: 'BEROPERASI', label: 'BEROPERASI' },
  { key: 'STANDBY', label: 'STANDBY' },
  { key: 'NO JOB', label: 'NO JOB' },
  { key: 'NO OPERATOR', label: 'NO OPERATOR' },
  { key: 'NO DRIVER', label: 'NO DRIVER' },
  { key: 'BREAKDOWN', label: 'BREAKDOWN' },
]

const SHIFT_OPTIONS = [
  { key: 'PAGI', label: 'PAGI' },
  { key: 'MALAM', label: 'MALAM' },
]

const CTG_OPTIONS = [
  { key: 'HE', label: 'HE (Alat Berat)' },
  { key: 'DT', label: 'DT (Dumptruck)' },
]

const STATUS_KARYAWAN_OPTIONAL = ['NO OPERATOR', 'NO DRIVER', 'BREAKDOWN', 'STANDBY']
const DANGER_COLOR = COLORS?.danger || '#ef4444'
const PRIMARY_COLOR = COLORS?.primary || '#1d4ed8'
const DISABLED_COLOR = COLORS?.disabled || '#9ca3af'

export default function CreateEquipmentPlanScreen() {
  const router = useRouter()
  const dispatch = useDispatch()

  const mode = useSelector((state) => state.themes)?.value || 'light'
  const { loading } = useSelector((state) => state.activityPlan)
  const equipmentRedux = useSelector((state) => state.equipment)
  const karyawanRedux = useSelector((state) => state.karyawan)
  const kegiatanRedux = useSelector((state) => state.kegiatankerja)
  const lokasiRedux = useSelector((state) => state.lokasikerja)
  const cabangRedux = useSelector((state) => state.cabang)

  const [initValue, setInitValue] = useState({
    date_ops: new Date(),
    shift: 'PAGI',
    status: 'BEROPERASI',
    ctg: 'DT',
    cabang_id: '',
    items: [
      {
        id: Date.now().toString(),
        equipment_id: '',
        karyawan_id: '',
        kegiatan_id: '',
        lokasi_id: '',
        lokasi_to: '',
        keterangan: '',
      },
    ],
  })

  const [header, setHeader] = useState({
    date_ops: initValue.date_ops,
    shift: initValue.shift,
    status: initValue.status,
    ctg: initValue.ctg,
    cabang_id: initValue.cabang_id,
  })

  const [items, setItems] = useState(initValue.items)

  const [errors, setErrors] = useState({ header: {}, items: [] })
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [alertState, setAlertState] = useState({ visible: false, type: 'info', title: '', message: '', buttons: [] })

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light
  const cardColor = mode === 'dark' ? '#1f2937' : '#ffffff'
  const cardBorder = mode === 'dark' ? '#2f3247' : '#e5e7eb'
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1]
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280'

  // Load master data
  useEffect(() => {
    dispatch(getEquipment())
    dispatch(getKaryawan())
    dispatch(getKegiatanPit())
    dispatch(getLokasiPit())
    dispatch(getCabang())
  }, [dispatch])

  // Generate options
  const equipmentOptions = useMemo(() => {
    const data = (equipmentRedux && equipmentRedux.data) || []
    if (!header.ctg) return data.map(eq => ({
      id: eq.id?.toString(),
      nama: eq.kode || eq.nama || `EQ-${eq.id}`,
      subtitle: [eq.manufaktur || eq.manufacturer, eq.model].filter(Boolean).join(' - ') || (eq.kategori || eq.ctg || '')
    }))

    return data
      .filter(eq => (eq.kategori || eq.ctg || '') === header.ctg)
      .map(eq => ({
        id: eq.id?.toString(),
        nama: eq.kode || eq.nama || `EQ-${eq.id}`,
        subtitle: [eq.manufaktur || eq.manufacturer, eq.model].filter(Boolean).join(' - ') || (eq.kategori || eq.ctg || '')
      }))
  }, [equipmentRedux?.data, header.ctg])

  const karyawanOptions = useMemo(() => {
    const data = (karyawanRedux && karyawanRedux.data) || []
    return data.map(kar => {
      const nama = kar.nama || kar.name || ''
      const section = kar.section || kar.jabatan || kar.position || ''
      const phone = kar.phone || kar.hp || kar.telepon || kar.no_hp || ''
      const subtitleParts = [section, phone].filter(Boolean)
      return {
        id: kar.id?.toString(),
        nama,
        subtitle: subtitleParts.join(' - ')
      }
    })
  }, [karyawanRedux?.data])

  const operatorDriverOptions = useMemo(() => {
    const keywords = ['operator', 'driver', 'opr', 'drv']
    const filtered = karyawanOptions.filter((opt) => {
      const text = `${opt.nama} ${opt.subtitle}`.toLowerCase()
      return keywords.some((k) => text.includes(k))
    })
    return filtered.sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }))
  }, [karyawanOptions])

  const kegiatanOptions = useMemo(() => {
    const raw = kegiatanRedux?.data
    const data = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.rows)
        ? raw.rows
        : Array.isArray(raw?.data?.data)
          ? raw.data.data
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.list)
              ? raw.list
              : []

    const mapped = data
      .map((kg, idx) => {
        const id = (
          kg?.id ||
          kg?.kegiatan_id ||
          kg?.kode ||
          kg?.code ||
          kg?.uuid ||
          kg?.uid ||
          idx
        ).toString()
        const nama = kg?.nama || kg?.name || kg?.kegiatan || kg?.title || kg?.abbr || `Kegiatan ${idx + 1}`
        const grup = (kg?.grpequipment || kg?.grup_equipment || kg?.group_equipment || kg?.grup || kg?.kategori || kg?.type || kg?.category || '').toString().toUpperCase()
        const narasi = kg?.narasi || kg?.deskripsi || kg?.description || kg?.note || kg?.keterangan || ''
        const subtitle = [grup, narasi].filter(Boolean).join(' - ')
        return { id, nama, subtitle, grup }
      })
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }))

    const target = (header.ctg || '').toString().toUpperCase()
    if (!target) return mapped

    const filtered = mapped.filter((item) => item.grup === target)
    return filtered.length ? filtered : mapped
  }, [kegiatanRedux?.data, header.ctg])

  useEffect(() => {
    const raw = kegiatanRedux?.data
    const len = Array.isArray(raw)
      ? raw.length
      : Array.isArray(raw?.data)
        ? raw.data.length
        : Array.isArray(raw?.rows)
          ? raw.rows.length
          : raw && typeof raw === 'object'
            ? Object.keys(raw).length
            : 0
    console.log('[EquipmentPlan] kegiatanRedux length:', len, 'options length:', kegiatanOptions.length)
    if (kegiatanOptions?.[0]) {
      console.log('[EquipmentPlan] kegiatan sample:', kegiatanOptions[0])
    }
  }, [kegiatanRedux, kegiatanOptions])

  const lokasiOptions = useMemo(() => {
    let data = (lokasiRedux && lokasiRedux.data) || []
    if (!Array.isArray(data) && data) {
      data = data.rows || data.data || []
    }

    return (data || []).map((lok) => {
      const id = lok.id?.toString() || lok.kode_lokasi?.toString() || lok.kode?.toString()
      if (!id) return null
      const nama = lok.nama || lok.lokasi || lok.nama_lokasi || ''
      const tipe = lok.type || lok.tipe || lok.jenis || ''
      const cabangNama = lok.cabang?.nama || lok.cabang?.name || lok.cabang_name || ''
      const subtitle = [tipe, cabangNama].filter(Boolean).join(' - ')
      return { id, nama, subtitle }
    }).filter(Boolean)
  }, [lokasiRedux?.data])

  const cabangOptions = useMemo(() => {
    let data = (cabangRedux && cabangRedux.data) || []
    if (!Array.isArray(data)) {
      data = data?.rows || data?.data || []
    }
    return (data || [])
      .map((cab) => {
        const id = cab.id?.toString()
        if (!id) return null
        const nama = cab.nama || cab.name || cab.nama_cabang || '[No Name]'
        const area = cab.area || cab.cabang?.area || cab.mas_cabang?.area || cab.area_name || 'XXX'
        const bisnis = cab.bisnis?.nama || cab.bisnis?.name || cab.bisnis?.initial || cab.nama_bisnis || cab.bisnis_unit?.nama || cab.bisnis_unit?.name || cab.bisnis_unit?.initial || 'XXX'
        const subtitle = [area || '-', bisnis || '-'].join(' - ')
        return { id, nama, subtitle }
      })
      .filter(Boolean)
  }, [cabangRedux?.data])

  const validateForm = () => {
    const headerErrors = {}
    const itemsErrors = []

    if (!header.date_ops) headerErrors.date_ops = 'Tanggal operasi wajib diisi'
    if (!header.shift) headerErrors.shift = 'Shift wajib dipilih'
    if (!header.status) headerErrors.status = 'Status wajib dipilih'
    if (!header.ctg) headerErrors.ctg = 'Kategori wajib dipilih'
    if (!header.cabang_id) headerErrors.cabang_id = 'Cabang wajib dipilih'

    items.forEach((item, idx) => {
      const e = {}
      if (!item.equipment_id) e.equipment_id = 'Equipment wajib dipilih'
      if (!item.lokasi_id) e.lokasi_id = 'Lokasi wajib dipilih'
      if (header.ctg === 'DT' && header.status === 'BEROPERASI' && !item.lokasi_to) {
        e.lokasi_to = 'Lokasi tujuan wajib diisi untuk DT beroperasi'
      }
      if (!STATUS_KARYAWAN_OPTIONAL.includes(header.status) && !item.karyawan_id) {
        e.karyawan_id = 'Operator/Driver wajib dipilih'
      }
      itemsErrors[idx] = e
    })
    
    setErrors({ header: headerErrors, items: itemsErrors })
    const hasHeaderErr = Object.keys(headerErrors).length > 0
    const hasItemErr = itemsErrors.some((e) => Object.keys(e || {}).length > 0)
    return !hasHeaderErr && !hasItemErr
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setAlertState({
        visible: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Lengkapi field yang wajib diisi',
        buttons: [{ text: 'OK' }],
      })
      return
    }

    try {
      const payload = {
        ...header,
        date_ops: header.date_ops.toISOString().split('T')[0],
        items: items.map((item) => ({ ...item, aktif: 'Y' })),
      }

      try {
        await dispatch(createActivityPlanBulk(payload)).unwrap()
      } catch (errBulk) {
        console.warn('[ActivityPlan] Bulk create failed, fallback to sequential', errBulk)
        for (const item of payload.items) {
          await dispatch(createActivityPlan({ ...header, date_ops: payload.date_ops, ...item })).unwrap()
        }
      }

      setAlertState({
        visible: true,
        type: 'success',
        title: 'Berhasil',
        message: 'Data aktivitas equipment berhasil disimpan',
        buttons: [{ text: 'OK', onPress: () => router.back() }],
      })
    } catch (error) {
      setAlertState({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: error.message || 'Gagal menyimpan data',
        buttons: [{ text: 'Tutup' }],
      })
    }
  }

  const updateHeaderField = (field, value) => {
    setHeader((prev) => ({ ...prev, [field]: value }))
    if (errors.header?.[field]) {
      setErrors((prev) => ({ ...prev, header: { ...prev.header, [field]: undefined } }))
    }
    if (field === 'ctg') {
      // reset lokasi_to in all items if switch to HE
      setItems((prev) => prev.map((it) => ({ ...it, lokasi_to: value === 'HE' ? '' : it.lokasi_to })))
    }
    if (field === 'status') {
      if (STATUS_KARYAWAN_OPTIONAL.includes(value)) {
        setItems((prev) => prev.map((it) => ({ ...it, karyawan_id: '' })))
      }
    }
  }

  const updateItemField = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    setErrors((prev) => {
      const nextItems = [...(prev.items || [])]
      const itemErr = { ...(nextItems[index] || {}) }
      delete itemErr[field]
      nextItems[index] = itemErr
      return { ...prev, items: nextItems }
    })
  }

  // Wrapper for legacy field update (header vs item0)
  const updateField = (field, value, index = null) => {
    const headerFields = ['date_ops', 'shift', 'status', 'ctg', 'cabang_id']
    if (headerFields.includes(field) || index === null) {
      updateHeaderField(field, value)
    } else {
      updateItemField(index, field, value)
    }
  }

  const addItem = () => {
    setItems((prev) => ([
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        equipment_id: '',
        karyawan_id: '',
        kegiatan_id: '',
        lokasi_id: '',
        lokasi_to: '',
        keterangan: '',
      }
    ]))
  }

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => {
      const nextItems = [...(prev.items || [])]
      nextItems.splice(index, 1)
      return { ...prev, items: nextItems }
    })
  }

  return (
    <AppScreen>
      <HeaderScreen
        title="Tambah Aktivitas"
        onBack={() => router.back()}
        onThemes
        onNotification
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor }}
          contentContainerStyle={{ padding: 10, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Ops */}
          <View style={[styles.sectionCard]}>
            <VStack style={[styles.field, {marginBottom: 0}]}>
              <Text style={[styles.label, { color: subtitleColor }]}>Tanggal Operasional</Text>
              <View style={{ flexDirection: 'row', marginTop: 0 }}>
                <TouchableOpacity
                  onPress={() => setDatePickerVisible(true)}
                  style={{
                    flex: 1,
                    backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                    borderWidth: 1,
                    borderColor: cardBorder,
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
                    {header.date_ops ? header.date_ops.toLocaleDateString('id-ID', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    }) : 'Pilih'}
                  </Text>
                  <Calendar size={16} color={subtitleColor} />
                </TouchableOpacity>
              </View>
              {errors.header?.date_ops && (
                <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.header.date_ops}</Text>
              )}
            </VStack>

            <VStack mt={3}>
              <BottomSheetSelect
                label="Cabang"
                placeholder="Pilih cabang"
                value={header.cabang_id?.toString() || ''}
                options={cabangOptions}
                displaySubKey="subtitle"
                onChange={(id) => updateField('cabang_id', id)}
              />
              {errors.header?.cabang_id && (
                <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.header.cabang_id}</Text>
              )}
            </VStack>

            <VStack mt={3}>
              <Text style={[styles.label, { color: textColor }]}>Kategori Equipment *</Text>
              <View style={styles.ctgContainer}>
                {CTG_OPTIONS.map(ctg => (
                  <TouchableOpacity
                    key={ctg.key}
                    style={[
                      styles.ctgButton,
                      {
                        backgroundColor: header.ctg === ctg.key ? PRIMARY_COLOR : (mode === 'dark' ? '#374151' : '#f9fafb'),
                        borderColor: header.ctg === ctg.key ? '#009688' : cardBorder,
                      }
                    ]}
                    onPress={() => updateField('ctg', ctg.key)}
                  >
                    <Text style={[
                      styles.ctgText,
                      { color: header.ctg === ctg.key ? '#FFF' : subtitleColor }
                    ]}>
                      {ctg.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.header?.ctg && (
                <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.header.ctg}</Text>
              )}
            </VStack>

            <VStack mt={3}>
              <Text style={[styles.label, { color: textColor }]}>Shift *</Text>
              <View style={styles.shiftContainer}>
                {SHIFT_OPTIONS.map(shift => (
                  <TouchableOpacity
                    key={shift.key}
                    style={[
                      styles.shiftButton,
                      {
                        backgroundColor: header.shift === shift.key ? PRIMARY_COLOR : (mode === 'dark' ? '#374151' : '#f9fafb'),
                        borderColor: header.shift === shift.key ? '#009688' : cardBorder,
                      }
                    ]}
                    onPress={() => updateField('shift', shift.key)}
                  >
                    <Text style={[
                      styles.shiftText,
                      { color: header.shift === shift.key ? '#FFF' : subtitleColor }
                    ]}>
                      {shift.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.header?.shift && (
                <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.header.shift}</Text>
              )}
            </VStack>

            <VStack mt={3}>
              <BottomSheetSelect
                label="Status *"
                placeholder="Pilih status"
                value={header.status || ''}
                options={STATUS_OPTIONS.map((s) => ({ id: s.key, nama: s.label }))}
                onChange={(id) => updateField('status', id)}
              />
              {errors.header?.status && (
                <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.header.status}</Text>
              )}
            </VStack>
          </View>

          <VStack>
            <HStack p={2} justifyContent={'space-between'} alignItems={'center'}>
              <Text style={[styles.label, { color: textColor }]}>Rencana Details:</Text>
              <TouchableOpacity onPress={addItem}>
                <HStack p={2} space={1} bg={mode === 'dark' ? '#2563eb' : '#1d4ed8'} alignItems={'center'} rounded={'md'}>
                  <AddSquare color='#FFF' size={14} />
                  <Text style={{ color: '#FFF' }}>Tambah</Text>
                </HStack>
              </TouchableOpacity>
            </HStack>
            <VStack space={3}>
              {items.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[
                    styles.sectionCard,
                    {
                      backgroundColor: cardColor,
                      borderColor: cardBorder,
                      paddingHorizontal: 5,
                      paddingVertical: 10,
                    },
                  ]}
                >
                  <HStack justifyContent="space-between" alignItems="center" mb={1} px={1}>
                    <Text style={[styles.label, { color: textColor, marginBottom: 0 }]}>Detail #{index + 1}</Text>
                    <TouchableOpacity
                      disabled={items.length === 1}
                      onPress={() => removeItem(index)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: DANGER_COLOR,
                        backgroundColor: mode === 'dark' ? '#3f1d2e' : '#fee2e2',
                        opacity: items.length === 1 ? 0.4 : 1,
                      }}
                    >
                      <CloseCircle size={16} color={DANGER_COLOR} variant="Bold" />
                      <Text style={{ color: DANGER_COLOR, fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>Hapus</Text>
                    </TouchableOpacity>
                  </HStack>

                  <BottomSheetSelect
                    label="Equipment"
                    placeholder="Pilih equipment"
                    value={item?.equipment_id?.toString() || ''}
                    options={equipmentOptions.map((o) => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                    onChange={(id) => updateItemField(index, 'equipment_id', id)}
                    displaySubKey="subtitle"
                  />
                {errors.items?.[index]?.equipment_id && (
                  <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.items[index].equipment_id}</Text>
                )}

                  <BottomSheetSelect
                    label={`Operator/Driver ${!STATUS_KARYAWAN_OPTIONAL.includes(header.status) ? '*' : ''}`}
                    placeholder="Pilih operator/driver"
                    value={item?.karyawan_id?.toString() || ''}
                    options={operatorDriverOptions.map((o) => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                    onChange={(id) => updateItemField(index, 'karyawan_id', id)}
                    displaySubKey="subtitle"
                    disabled={STATUS_KARYAWAN_OPTIONAL.includes(header.status)}
                  />
                  {errors.items?.[index]?.karyawan_id && (
                    <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.items[index].karyawan_id}</Text>
                  )}

                  <BottomSheetSelect
                    label="Kegiatan"
                    placeholder="Pilih kegiatan"
                    value={item?.kegiatan_id?.toString() || ''}
                    options={kegiatanOptions.map((o) => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                    onChange={(id) => updateItemField(index, 'kegiatan_id', id)}
                    displaySubKey="subtitle"
                    disabled={false}
                  />
                  {errors.items?.[index]?.kegiatan_id && (
                    <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.items[index].kegiatan_id}</Text>
                  )}

                  <BottomSheetSelect
                    label="Lokasi"
                    placeholder="Pilih lokasi"
                    value={item?.lokasi_id?.toString() || ''}
                    options={lokasiOptions.map((o) => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                    onChange={(id) => updateItemField(index, 'lokasi_id', id)}
                    displaySubKey="subtitle"
                  />
                  {errors.items?.[index]?.lokasi_id && (
                    <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.items[index].lokasi_id}</Text>
                  )}

                  <BottomSheetSelect
                    label="Lokasi Tujuan"
                    placeholder="Pilih lokasi tujuan"
                    value={item?.lokasi_to?.toString() || ''}
                    options={lokasiOptions.map((o) => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                    onChange={(id) => updateItemField(index, 'lokasi_to', id)}
                    displaySubKey="subtitle"
                    disabled={!(header.ctg === 'DT' && header.status === 'BEROPERASI')}
                  />
                  {errors.items?.[index]?.lokasi_to && (
                    <Text style={[styles.errorText, { color: DANGER_COLOR }]}>{errors.items[index].lokasi_to}</Text>
                  )}

                  <VStack my={2}>
                    <Text style={[styles.label, { color: textColor }]}>Keterangan</Text>
                    <TextInput
                      style={[
                        styles.textArea,
                        { backgroundColor: cardColor, borderColor: cardBorder, color: textColor },
                      ]}
                      placeholder="Tambahkan keterangan (opsional)"
                      placeholderTextColor={subtitleColor}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={item?.keterangan}
                      onChangeText={(value) => updateItemField(index, 'keterangan', value)}
                    />
                  </VStack>
                </View>
              ))}
            </VStack>
          </VStack>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: loading ? DISABLED_COLOR : PRIMARY_COLOR }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <LoadingHauler size="small" color="#ffffff" />
            ) : (
              <View style={styles.buttonContent}>
                <Verify size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Simpan</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        date={header.date_ops || new Date()}
        onConfirm={(date) => {
          updateHeaderField('date_ops', date)
          setDatePickerVisible(false)
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
  sectionCard: {
    // borderWidth: 1,
    borderRadius: 12,
    // padding: 14,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    minHeight: 100,
  },
  ctgContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ctgButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctgText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  shiftContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shiftText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
  },
  field: {
    marginBottom: 12,
  },
})
