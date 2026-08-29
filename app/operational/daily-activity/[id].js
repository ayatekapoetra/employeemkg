import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Edit, Trash } from 'iconsax-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { AppScreen, HeaderScreen } from '../../../src/components/common'
import { deleteDailyActivity, getDailyActivityAccess, getDailyActivityDetail } from '../../../src/store/slices/dailyActivitySlice'
import { shiftLabel, statusMeta, themeColors } from './utils'

export default function DailyActivityDetailScreen() {
  const { id, status } = useLocalSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const state = useSelector((root) => root.dailyActivity)
  const theme = themeColors(mode)
  const [selectedStatus, setSelectedStatus] = useState(String(status || ''))
  useEffect(() => {
    dispatch(getDailyActivityAccess()).unwrap().then((access) => {
      if (id && access?.can_read === true) dispatch(getDailyActivityDetail(id))
    }).catch(() => {})
  }, [dispatch, id])
  const header = state.detail?.header || state.detail?.data?.header || {}
  const allItems = useMemo(() => state.detail?.items || state.detail?.data?.items || [], [state.detail])
  const statuses = useMemo(() => [...new Set(allItems.map((item) => String(item.status).toLowerCase()))], [allItems])
  useEffect(() => { if (!selectedStatus && statuses.length) setSelectedStatus(statuses[0]) }, [selectedStatus, statuses])
  const items = allItems.filter((item) => String(item.status).toLowerCase() === selectedStatus)
  const meta = statusMeta(selectedStatus)
  const remove = () => Alert.alert('Hapus Daily Activity', 'Seluruh header dan semua status akan dihapus. Lanjutkan?', [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: async () => { try { await dispatch(deleteDailyActivity(id)).unwrap(); router.replace('/operational/daily-activity') } catch (error) { Alert.alert('Gagal', String(error)) } } }])
  return <AppScreen><HeaderScreen title="Detail Daily Activity" onBack={() => router.back()} onThemes />
    {state.detailLoading ? <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} /> : <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
      {!!state.detailError && <Text style={{ color: theme.danger, fontFamily: 'Quicksand-Bold' }}>{state.detailError}</Text>}
      <View style={{ padding: 16, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}><Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', fontSize: 18 }}>{moment(header.date_ops).format('dddd, DD MMMM YYYY')}</Text><Text style={{ color: theme.muted, fontFamily: 'Quicksand-Medium', marginTop: 4 }}>Shift {shiftLabel(header.shift_id)} · {header.ctgunit || '-'} · {header.category_id || '-'}</Text><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold', marginTop: 12 }}>{header.lokasi_site_nama || '-'}</Text><Text style={{ color: theme.muted }}>{header.lokasi_pit_nama || '-'} · {header.kontraktor || '-'}</Text><Text style={{ color: theme.muted, marginTop: 8 }}>{header.cuaca || '-'}{header.notes ? ` · ${header.notes}` : ''}</Text></View>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 14 }}>{statuses.map((value) => { const next = statusMeta(value); return <TouchableOpacity key={value} onPress={() => setSelectedStatus(value)} style={{ flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: selectedStatus === value ? next.color : theme.surface, borderWidth: 1, borderColor: next.color }}><Text style={{ color: selectedStatus === value ? '#FFF' : theme.text, fontFamily: 'Quicksand-Bold', fontSize: 12 }}>{next.label}</Text></TouchableOpacity> })}</View>
      <View style={{ padding: 14, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: meta.color }}><Text style={{ color: theme.text, fontFamily: 'Poppins-Bold', marginBottom: 10 }}>{meta.label} · {items.length} Unit</Text>{items.map((item) => <View key={String(item.item_id || item.id || item.equipment_id)} style={{ padding: 12, marginBottom: 9, borderRadius: 12, backgroundColor: theme.surface }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: theme.text, fontFamily: 'Quicksand-Bold' }}>{item.kdunit || item.equipment?.kode || `Unit ${item.equipment_id}`}</Text><Text style={{ color: theme.muted, fontSize: 12 }}>{moment(item.start_time).format('HH:mm')} - {moment(item.finish_time).format('HH:mm')}</Text></View><Text style={{ color: theme.text, marginTop: 6 }}>{item.kegiatan_name || '-'}</Text>{selectedStatus === 'beroperasi' && <Text style={{ color: theme.muted }}>Material: {item.material_name || '-'}</Text>}<Text style={{ color: theme.muted }}>Operator: {item.karyawan_name || '-'}</Text>{selectedStatus === 'breakdown' && <><Text style={{ color: theme.muted }}>HM/KM: {item.hm_km_bd || '-'}</Text><Text style={{ color: theme.danger }}>Issue: {item.issue_breakdown || '-'}</Text><Text style={{ color: theme.muted }}>Pengawas: {item.pengawas_name || '-'}</Text></>}{!!item.note && <Text style={{ color: theme.muted }}>Catatan: {item.note}</Text>}</View>)}</View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>{state.permissions?.can_update === true && <TouchableOpacity onPress={() => router.push({ pathname: '/operational/daily-activity/edit', params: { id: String(id) } })} style={{ flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', padding: 14, borderRadius: 14, backgroundColor: '#2563EB' }}><Edit size={18} color="#FFF" /><Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>Edit</Text></TouchableOpacity>}{state.permissions?.can_remove === true && <TouchableOpacity disabled={state.mutationLoading} onPress={remove} style={{ flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', padding: 14, borderRadius: 14, backgroundColor: '#DC2626' }}><Trash size={18} color="#FFF" /><Text style={{ color: '#FFF', fontFamily: 'Quicksand-Bold' }}>Hapus</Text></TouchableOpacity>}</View>
    </ScrollView>}
  </AppScreen>
}
