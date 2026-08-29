import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowRight2,
  Building,
  Calendar,
  Clock,
  Truck,
  User,
  CloseCircle,
  TickCircle,
  Send2,
  Edit2,
} from 'iconsax-react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import { AppScreen, HeaderScreen } from '../../../src/components/common'
import CustomAlert from '../../../src/components/common/CustomAlert'
import StatusBadge from './components/StatusBadge'
import ProgressTrack from './components/ProgressTrack'
import {
  formatDateTime,
  formatNow,
  getRouteLabel,
  getThemeColors,
  meterTypeFromEquipment,
} from './utils'
import {
  arriveMobilizationItem,
  cancelMobilizationDocument,
  cancelMobilizationItem,
  clearMobilizationDetail,
  dispatchMobilizationItem,
  getMobilizationDetail,
} from '../../../src/store/slices/equipmentMobilizationSlice'

const ACTION_CONFIG = {
  dispatch: {
    title: 'Catat Dispatch',
    subtitle: 'Unit mulai dikirim dari cabang asal',
    confirmLabel: 'Simpan Dispatch',
    colorKey: 'warning',
  },
  arrive: {
    title: 'Catat Arrival',
    subtitle: 'Unit tiba di cabang tujuan',
    confirmLabel: 'Simpan Arrival',
    colorKey: 'success',
  },
  cancel: {
    title: 'Batalkan Item',
    subtitle: 'Pembatalan wajib menyertakan alasan',
    confirmLabel: 'Batalkan Item',
    colorKey: 'danger',
  },
}

export default function MobilisasiEquipmentDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const theme = getThemeColors(mode)

  const {
    detail,
    detailLoading,
    detailError,
    actionLoadingByItem,
    mutationLoading,
    permissions,
  } = useSelector((state) => state.equipmentMobilization)

  const [actionModal, setActionModal] = useState({
    visible: false,
    type: null,
    item: null,
  })
  const [actionForm, setActionForm] = useState({
    datetime: new Date(),
    meter: '',
    meter_type: 'UNKNOWN',
    recipient_name: '',
    notes: '',
    reason: '',
  })
  const [androidPicker, setAndroidPicker] = useState({ visible: false, mode: 'date' })
  const [iosPickerVisible, setIosPickerVisible] = useState(false)
  const [tempDatetime, setTempDatetime] = useState(new Date())
  const [alertState, setAlertState] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  })

  const loadDetail = useCallback(async () => {
    if (!params.id) return
    await dispatch(getMobilizationDetail(params.id)).unwrap()
  }, [dispatch, params.id])

  useEffect(() => {
    loadDetail().catch(() => {})
    return () => {
      dispatch(clearMobilizationDetail())
    }
  }, [dispatch, loadDetail])

  const route = useMemo(() => getRouteLabel(detail || {}), [detail])
  const docPermissions = detail?.permissions || permissions || {}
  const items = detail?.items || []

  const openAction = (type, item) => {
    const defaultTime = new Date()
    setActionForm({
      datetime: defaultTime,
      meter: '',
      meter_type: meterTypeFromEquipment(item?.equipment || {}),
      recipient_name: '',
      notes: '',
      reason: '',
    })
    setTempDatetime(defaultTime)
    setAndroidPicker({ visible: false, mode: 'date' })
    setIosPickerVisible(false)
    setActionModal({ visible: true, type, item })
  }

  const closeAction = () => {
    setAndroidPicker({ visible: false, mode: 'date' })
    setIosPickerVisible(false)
    setActionModal({ visible: false, type: null, item: null })
  }

  const openDatetimePicker = () => {
    const current = actionForm.datetime instanceof Date ? actionForm.datetime : new Date()
    setTempDatetime(current)
    if (Platform.OS === 'android') {
      // Android: pilih tanggal dulu, lalu jam
      setAndroidPicker({ visible: true, mode: 'date' })
    } else {
      setIosPickerVisible(true)
    }
  }

  const onAndroidDatetimeChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      setAndroidPicker({ visible: false, mode: 'date' })
      return
    }

    if (!selectedDate) {
      setAndroidPicker({ visible: false, mode: 'date' })
      return
    }

    if (androidPicker.mode === 'date') {
      // gabungkan tanggal baru + jam yang sedang aktif
      const base = actionForm.datetime instanceof Date ? actionForm.datetime : new Date()
      const merged = new Date(selectedDate)
      merged.setHours(base.getHours(), base.getMinutes(), 0, 0)
      setTempDatetime(merged)
      setActionForm((prev) => ({ ...prev, datetime: merged }))
      // lanjut pilih jam
      setAndroidPicker({ visible: true, mode: 'time' })
      return
    }

    // mode time
    const base = actionForm.datetime instanceof Date ? actionForm.datetime : new Date()
    const merged = new Date(base)
    merged.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0)
    setTempDatetime(merged)
    setActionForm((prev) => ({ ...prev, datetime: merged }))
    setAndroidPicker({ visible: false, mode: 'date' })
  }

  const confirmIosDatetime = () => {
    setActionForm((prev) => ({ ...prev, datetime: tempDatetime || new Date() }))
    setIosPickerVisible(false)
  }

  const datetimeLabel = actionModal.type === 'arrive'
    ? 'Waktu Tiba'
    : actionModal.type === 'dispatch'
      ? 'Waktu Berangkat'
      : 'Waktu Aktual'

  const submitAction = async () => {
    const { type, item } = actionModal
    if (!type || !item || !detail?.id) return

    try {
      if (type === 'dispatch') {
        if (!actionForm.meter) throw new Error('Meter berangkat wajib diisi')
        await dispatch(dispatchMobilizationItem({
          id: detail.id,
          itemId: item.id,
          data: {
            departed_at: moment(actionForm.datetime).format('YYYY-MM-DD HH:mm:ss'),
            departed_meter: Number(actionForm.meter),
            departed_meter_type: actionForm.meter_type || 'UNKNOWN',
            dispatch_notes: actionForm.notes || null,
          },
        })).unwrap()
      }

      if (type === 'arrive') {
        if (!actionForm.meter) throw new Error('Meter tiba wajib diisi')
        if (!actionForm.recipient_name?.trim()) throw new Error('Nama penerima wajib diisi')
        const arrivedAt = actionForm.datetime instanceof Date ? actionForm.datetime : new Date(actionForm.datetime)
        if (!arrivedAt || Number.isNaN(arrivedAt.getTime())) throw new Error('Waktu tiba tidak valid')
        if (item.departed_at && moment(arrivedAt).isBefore(moment(item.departed_at))) {
          throw new Error('Waktu tiba tidak boleh lebih awal dari waktu berangkat')
        }
        await dispatch(arriveMobilizationItem({
          id: detail.id,
          itemId: item.id,
          data: {
            arrived_at: moment(arrivedAt).format('YYYY-MM-DD HH:mm:ss'),
            arrived_meter: Number(actionForm.meter),
            arrived_meter_type: actionForm.meter_type || 'UNKNOWN',
            recipient_name: actionForm.recipient_name.trim(),
            arrival_notes: actionForm.notes || null,
          },
        })).unwrap()
      }

      if (type === 'cancel') {
        if (!actionForm.reason?.trim()) throw new Error('Alasan pembatalan wajib diisi')
        await dispatch(cancelMobilizationItem({
          id: detail.id,
          itemId: item.id,
          reason: actionForm.reason.trim(),
        })).unwrap()
      }

      closeAction()
      await loadDetail()
      setAlertState({
        visible: true,
        type: 'success',
        title: 'Berhasil',
        message: 'Perubahan status item berhasil disimpan',
        buttons: [{ text: 'OK' }],
      })
    } catch (error) {
      setAlertState({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: typeof error === 'string' ? error : (error?.message || 'Gagal memproses aksi'),
        buttons: [{ text: 'Tutup' }],
      })
    }
  }

  const handleCancelDocument = () => {
    setAlertState({
      visible: true,
      type: 'warning',
      title: 'Batalkan Dokumen?',
      message: 'Semua item aktif akan dibatalkan. Lanjutkan?',
      buttons: [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          onPress: async () => {
            try {
              await dispatch(cancelMobilizationDocument({
                id: detail.id,
                reason: `Dibatalkan dari mobile pada ${formatNow()}`,
              })).unwrap()
              await loadDetail()
              setAlertState({
                visible: true,
                type: 'success',
                title: 'Dokumen Dibatalkan',
                message: 'Dokumen mobilisasi berhasil dibatalkan',
                buttons: [{ text: 'OK' }],
              })
            } catch (error) {
              setAlertState({
                visible: true,
                type: 'error',
                title: 'Gagal',
                message: typeof error === 'string' ? error : (error?.message || 'Gagal membatalkan dokumen'),
                buttons: [{ text: 'Tutup' }],
              })
            }
          },
        },
      ],
    })
  }

  const renderItemCard = (item) => {
    const equipment = item.equipment || {}
    const karyawan = item.karyawan || {}
    const loading = !!actionLoadingByItem?.[item.id]
    const headerStatus = String(detail?.status || '').toUpperCase()
    const canDispatch = docPermissions?.can_validate
      && item.status === 'DRAFT'
      && ['DRAFT', 'OPEN', 'IN_TRANSIT'].includes(headerStatus)
    const canArrive = docPermissions?.can_approve && item.status === 'IN_TRANSIT'
    const canCancel = docPermissions?.can_remove && ['DRAFT', 'IN_TRANSIT'].includes(item.status)
    const karyawanName = karyawan.nama || karyawan.name || null

    return (
      <View
        key={item.id}
        style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 15 }}>
              {equipment.kode || equipment.identity || `EQ-${item.equipment_id}`}
            </Text>
            <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 11, marginTop: 2 }}>
              {[equipment.kategori || equipment.ctg, equipment.model || equipment.manufaktur].filter(Boolean).join(' · ') || '-'}
            </Text>
          </View>
          <StatusBadge status={item.status} mode={mode} size="sm" />
        </View>

        <View style={{ marginTop: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <User size={14} color={theme.primary} />
            <Text style={{ color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-Medium', flex: 1 }}>
              Pengantar: {karyawanName || '-'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Send2 size={14} color={theme.warning} />
            <Text style={{ color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-Medium', flex: 1 }}>
              Berangkat: {formatDateTime(item.departed_at)}
              {item.departed_meter != null ? ` · ${item.departed_meter} ${item.departed_meter_type || ''}` : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TickCircle size={14} color={theme.success} />
            <Text style={{ color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-Medium', flex: 1 }}>
              Tiba: {formatDateTime(item.arrived_at)}
              {item.arrived_meter != null ? ` · ${item.arrived_meter} ${item.arrived_meter_type || ''}` : ''}
            </Text>
          </View>
          {!!item.recipient_name && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <User size={14} color={theme.info} />
              <Text style={{ color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-Medium' }}>
                Penerima: {item.recipient_name}
              </Text>
            </View>
          )}
          {item.current_placement_unknown === 'Y' && (
            <View
              style={{
                backgroundColor: mode === 'dark' ? '#78350F' : '#FEF3C7',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: mode === 'dark' ? '#FDE68A' : '#92400E', fontSize: 11, fontFamily: 'Quicksand-SemiBold' }}>
                Placement awal belum diketahui sebelum dispatch ini
              </Text>
            </View>
          )}
        </View>

        {(canDispatch || canArrive || canCancel) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {canDispatch && (
              <TouchableOpacity
                disabled={loading}
                onPress={() => openAction('dispatch', item)}
                style={{
                  backgroundColor: theme.warning,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'Quicksand-Bold', fontSize: 12 }}>Dispatch</Text>
              </TouchableOpacity>
            )}
            {canArrive && (
              <TouchableOpacity
                disabled={loading}
                onPress={() => openAction('arrive', item)}
                style={{
                  backgroundColor: theme.success,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'Quicksand-Bold', fontSize: 12 }}>Arrival</Text>
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity
                disabled={loading}
                onPress={() => openAction('cancel', item)}
                style={{
                  backgroundColor: theme.danger,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'Quicksand-Bold', fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )
  }

  if (detailLoading && !detail) {
    return (
      <AppScreen>
        <HeaderScreen title="Detail Mobilisasi" onBack={() => router.back()} onThemes />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.subtitle, fontFamily: 'Quicksand-Medium' }}>Memuat detail...</Text>
        </View>
      </AppScreen>
    )
  }

  if (detailError && !detail) {
    return (
      <AppScreen>
        <HeaderScreen title="Detail Mobilisasi" onBack={() => router.back()} onThemes />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: theme.danger, fontFamily: 'Poppins-SemiBold', textAlign: 'center' }}>{detailError}</Text>
          <TouchableOpacity
            onPress={() => loadDetail().catch(() => {})}
            style={{ marginTop: 14, backgroundColor: theme.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    )
  }

  const actionCfg = ACTION_CONFIG[actionModal.type] || ACTION_CONFIG.dispatch
  const actionColor = theme[actionCfg.colorKey] || theme.primary

  return (
    <AppScreen>
      <HeaderScreen title="Detail Mobilisasi" onBack={() => router.back()} onThemes onNotification />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 18 }}>
                {detail?.document_no || '-'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Clock size={14} color={theme.subtitle} />
                <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12 }}>
                  Mulai {formatDateTime(detail?.started_at || detail?.movement_date)}
                </Text>
              </View>
            </View>
            <StatusBadge status={detail?.status} mode={mode} />
          </View>

          <View
            style={{
              marginTop: 14,
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 5 }}>
              <Building size={16} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-Bold' }}>ASAL</Text>
                <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Quicksand-SemiBold' }}>{route.origin}</Text>
              </View>
            </View>
            {/* <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <ArrowRight2 size={16} color={theme.primary} />
            </View> */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Truck size={16} color={theme.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-Bold' }}>TUJUAN</Text>
                <Text style={{ color: theme.text, fontSize: 13, fontFamily: 'Quicksand-SemiBold' }}>{route.destination}</Text>
              </View>
            </View>
          </View>

          <ProgressTrack
            item={{
              item_count: items.length,
              draft_count: items.filter((i) => i.status === 'DRAFT').length,
              in_transit_count: items.filter((i) => i.status === 'IN_TRANSIT').length,
              arrived_count: items.filter((i) => i.status === 'ARRIVED').length,
              cancelled_count: items.filter((i) => i.status === 'CANCELLED').length,
            }}
            mode={mode}
          />

          {!!detail?.notes && (
            <Text style={{ marginTop: 12, color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12 }}>
              {detail.notes}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 16 }}>
            Equipment ({items.length})
          </Text>
          {docPermissions?.can_remove && ['DRAFT', 'IN_TRANSIT'].includes(detail?.status) && (
            <TouchableOpacity onPress={handleCancelDocument} disabled={mutationLoading}>
              <Text style={{ color: theme.danger, fontFamily: 'Quicksand-Bold', fontSize: 12 }}>Batalkan Dokumen</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.map(renderItemCard)}
      </ScrollView>

      <Modal visible={actionModal.visible} transparent animationType="slide" onRequestClose={closeAction}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: theme.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 18,
                maxHeight: '88%',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 17 }}>{actionCfg.title}</Text>
                  <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 12, marginTop: 2 }}>
                    {actionCfg.subtitle}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeAction}>
                  <CloseCircle size={24} color={theme.subtitle} />
                </TouchableOpacity>
              </View>

              <Text style={{ marginTop: 12, color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 13 }}>
                {actionModal.item?.equipment?.kode || actionModal.item?.equipment?.identity || `Item #${actionModal.item?.id}`}
              </Text>

              {actionModal.type !== 'cancel' && (
                <>
                  <TouchableOpacity
                    onPress={openDatetimePicker}
                    activeOpacity={0.8}
                    style={{
                      marginTop: 14,
                      borderWidth: 1,
                      borderColor: theme.primary,
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: theme.surface,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold' }}>
                        {datetimeLabel}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Edit2 size={14} color={theme.primary} />
                        <Text style={{ color: theme.primary, fontSize: 11, fontFamily: 'Quicksand-Bold' }}>Ubah</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', fontSize: 15 }}>
                        {moment(actionForm.datetime).format('DD MMM YYYY HH:mm')}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Calendar size={16} color={theme.primary} />
                        <Clock size={16} color={theme.primary} />
                      </View>
                    </View>
                    <Text style={{ color: theme.subtitle, fontSize: 11, fontFamily: 'Quicksand-Medium', marginTop: 6 }}>
                      Default waktu sekarang. Ketuk untuk mengubah tanggal/jam aktual.
                    </Text>
                  </TouchableOpacity>

                  {iosPickerVisible && Platform.OS === 'ios' && (
                    <View
                      style={{
                        marginTop: 10,
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 12,
                        backgroundColor: theme.surface,
                        overflow: 'hidden',
                      }}
                    >
                      <DateTimePicker
                        value={tempDatetime instanceof Date ? tempDatetime : new Date()}
                        mode="datetime"
                        display="spinner"
                        themeVariant={mode === 'dark' ? 'dark' : 'light'}
                        onChange={(_, selectedDate) => {
                          if (selectedDate) setTempDatetime(selectedDate)
                        }}
                        style={{ height: 180 }}
                      />
                      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.border }}>
                        <TouchableOpacity
                          onPress={() => setIosPickerVisible(false)}
                          style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}
                        >
                          <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Bold' }}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={confirmIosDatetime}
                          style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: theme.border }}
                        >
                          <Text style={{ color: theme.primary, fontFamily: 'Quicksand-Bold' }}>Pakai Waktu Ini</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={{ marginTop: 12 }}>
                    <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold', marginBottom: 6 }}>
                      Meter ({actionForm.meter_type || 'UNKNOWN'})
                    </Text>
                    <TextInput
                      value={actionForm.meter}
                      onChangeText={(value) => setActionForm((prev) => ({ ...prev, meter: value.replace(/[^0-9.]/g, '') }))}
                      keyboardType="decimal-pad"
                      placeholder="Contoh: 12045.5"
                      placeholderTextColor={theme.muted}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 48,
                        color: theme.text,
                        backgroundColor: theme.surface,
                        fontFamily: 'Quicksand-Medium',
                      }}
                    />
                  </View>

                  {actionModal.type === 'arrive' && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold', marginBottom: 6 }}>
                        Nama Penerima
                      </Text>
                      <TextInput
                        value={actionForm.recipient_name}
                        onChangeText={(value) => setActionForm((prev) => ({ ...prev, recipient_name: value }))}
                        placeholder="Nama PIC penerima"
                        placeholderTextColor={theme.muted}
                        style={{
                          borderWidth: 1,
                          borderColor: theme.border,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          height: 48,
                          color: theme.text,
                          backgroundColor: theme.surface,
                          fontFamily: 'Quicksand-Medium',
                        }}
                      />
                    </View>
                  )}

                  <View style={{ marginTop: 12 }}>
                    <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold', marginBottom: 6 }}>
                      Catatan
                    </Text>
                    <TextInput
                      value={actionForm.notes}
                      onChangeText={(value) => setActionForm((prev) => ({ ...prev, notes: value }))}
                      placeholder="Catatan opsional"
                      placeholderTextColor={theme.muted}
                      multiline
                      style={{
                        minHeight: 70,
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
                </>
              )}

              {actionModal.type === 'cancel' && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-SemiBold', marginBottom: 6 }}>
                    Alasan Pembatalan
                  </Text>
                  <TextInput
                    value={actionForm.reason}
                    onChangeText={(value) => setActionForm((prev) => ({ ...prev, reason: value }))}
                    placeholder="Tuliskan alasan pembatalan"
                    placeholderTextColor={theme.muted}
                    multiline
                    style={{
                      minHeight: 90,
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
              )}

              <TouchableOpacity
                onPress={submitAction}
                style={{
                  marginTop: 18,
                  backgroundColor: actionColor,
                  borderRadius: 14,
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'Quicksand-Bold', fontSize: 14 }}>
                  {actionCfg.confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {androidPicker.visible && Platform.OS === 'android' && (
        <DateTimePicker
          value={actionForm.datetime instanceof Date ? actionForm.datetime : new Date()}
          mode={androidPicker.mode}
          display="default"
          is24Hour
          onChange={onAndroidDatetimeChange}
        />
      )}

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
