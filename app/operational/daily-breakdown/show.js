import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { Modal, VStack, HStack, Button, Center } from 'native-base';
import { TickCircle, CloseCircle, User } from 'iconsax-react-native';
import moment from 'moment';

import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import {
  getBreakdownDetail,
  updateBreakdown,
  deleteBreakdown,
} from '../../../src/store/slices/breakdownSlice';
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect';
import { validateBreakdownForm } from '../../../src/utils/dailyBreakdown/utils';
import database from '../../../src/database/SQLiteService';
import { getKaryawan } from '../../../src/store/slices/karyawanSlice';

const STATUS_OPTIONS = {
  WT: { label: 'Wait Teknisi', color: '#fbbf24' },
  WS: { label: 'Wait Services', color: '#f472b6' },
  WP: { label: 'Wait Part', color: '#f59e0b' },
  WV: { label: 'Wait Vendor', color: '#c084fc' },
  WTT: { label: 'Wait Transport', color: '#a78bfa' },
  IP: { label: 'In Progress', color: '#60a5fa' },
  DONE: { label: 'Selesai', color: '#34d399' },
};

export default function ShowBreakdownScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();

  const mode = useSelector((state) => state.themes)?.value || 'light';
  const { currentBreakdown } = useSelector((state) => state.breakdown);
  const equipmentRedux = useSelector((state) => state.equipment);
  const lokasiRedux = useSelector((state) => state.lokasikerja);
  const shiftRedux = useSelector((state) => state.shift);
  const karyawanRedux = useSelector((state) => state.karyawan);

  const [formData, setFormData] = useState({
    equipment_id: '',
    equipment_label: '',
    lokasi_id: '',
    lokasi_label: '',
    pengawas_id: '',
    pengawas_label: '',
    shift_id: '',
    shift_label: '',
    breakdown_at: new Date(),
    smu: '',
    category: '',
    items: [],
  });

  const [errors, setErrors] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [datePicker, setDatePicker] = useState({ visible: false, mode: 'date' });
  const [equipmentLocal, setEquipmentLocal] = useState([]);
  const [lokasiLocal, setLokasiLocal] = useState([]);
  const [shiftLocal, setShiftLocal] = useState([]);
  const [karyawanLocal, setKaryawanLocal] = useState([]);
  const [modalState, setModalState] = useState({ visible: false, type: 'info', title: '', message: '' });
  const [confirmState, setConfirmState] = useState({ visible: false, title: '', message: '', onConfirm: null });

  const backgroundColor = mode === 'dark' ? COLORS.container?.dark || '#1f2437' : COLORS.container?.light || '#f5f5f5';
  const cardColor = mode === 'dark' ? '#1f2437' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#2f3247' : '#e5e7eb';
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const dateFormats = [
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm',
    'YYYY-MM-DD',
    'DD-MM-YYYY HH:mm:ss',
    'DD-MM-YYYY HH:mm',
    'DD-MM-YYYY',
    moment.ISO_8601,
  ];

  const parseDateValue = (value) => {
    if (!value) return new Date();
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const m = moment(value, dateFormats, true);
    if (m.isValid()) return m.toDate();
    const fallback = moment(value);
    return fallback.isValid() ? fallback.toDate() : new Date();
  };

  useEffect(() => {
    const loadLocal = async () => {
      try {
        const eq = await database.getAll('master_equipment');
        const lok = await database.getAll('master_lokasipit');
        const shift = await database.getShift();
        let kary = await database.getKaryawan?.();
        if (!kary || kary.length === 0) {
          kary = await database.getOprDrv?.();
        }
        setEquipmentLocal(Array.isArray(eq) ? eq : []);
        setLokasiLocal(Array.isArray(lok) ? lok : []);
        setShiftLocal(Array.isArray(shift) ? shift : []);
        setKaryawanLocal(Array.isArray(kary) ? kary : []);
      } catch (e) {
        console.warn('[ShowBreakdown] loadLocal error:', e?.message || e);
      }
    };
    loadLocal();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params.id) return;
      setLoadingDetail(true);
      try {
        await dispatch(getBreakdownDetail(params.id)).unwrap();
      } catch (err) {
        Alert.alert('Error', err?.message || 'Gagal memuat data breakdown');
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [dispatch, params.id]);

  // Pastikan data karyawan (pengawas) tersedia dari Redux
  useEffect(() => {
    const data = karyawanRedux?.data;
    const hasData = Array.isArray(data)
      ? data.length > 0
      : Array.isArray(data?.rows)
        ? data.rows.length > 0
        : Array.isArray(data?.data)
          ? data.data.length > 0
          : false;
    if (!karyawanRedux?.loading && !hasData) {
      dispatch(getKaryawan());
    }
  }, [dispatch, karyawanRedux?.data, karyawanRedux?.loading]);

  useEffect(() => {
    if (!currentBreakdown || !params.id) return;
    if (String(currentBreakdown.id) !== String(params.id)) return;

    // Debug: Log current breakdown data structure
    console.log('[ShowBreakdown] Current breakdown:', {
      id: currentBreakdown.id,
      itemsCount: currentBreakdown.items?.length,
      firstItem: currentBreakdown.items?.[0]
    });

    const firstItem = currentBreakdown.items?.[0] || {};
    const breakdownDate = currentBreakdown.breakdown_at || currentBreakdown.breakdown_datetime;
const mappedItems = Array.isArray(currentBreakdown.items)
      ? currentBreakdown.items.map((it, idx) => ({
          id: it.id?.toString() || `${idx + 1}`,
          problem_issue: it.problem_issue || it.problem || '',
          category: it.category || firstItem.category || '',
          kode_wo: it.kode_wo || '',
          teknisi: it.teknisi || null,
          status: it.status || null,
          // The work order ID should be the same as the breakdown item ID
          wo_id: it.id?.toString() || null,
          // Include actions data if available
          actions: Array.isArray(it.actions) ? it.actions : [],
        }))
      : [];

    setFormData({
      equipment_id: currentBreakdown.equipment_id?.toString() || '',
      equipment_label:
        currentBreakdown.equipment?.kode ||
        currentBreakdown.equipment?.kode_unit ||
        currentBreakdown.equipment?.code ||
        currentBreakdown.equipment?.nama ||
        '',
      lokasi_id: currentBreakdown.lokasi_id?.toString() || '',
      lokasi_label: currentBreakdown.lokasi?.nama || currentBreakdown.lokasi?.name || '',
      pengawas_id: currentBreakdown.pengawas_id?.toString() || '',
      pengawas_label: currentBreakdown.pengawas?.nama || currentBreakdown.pengawas?.name || '',
      shift_id: currentBreakdown.shift_id?.toString() || '',
      shift_label: currentBreakdown.shift?.nama || currentBreakdown.shift?.name || '',
      breakdown_at: parseDateValue(breakdownDate),
      smu: currentBreakdown.smu ? String(currentBreakdown.smu) : '',
      category: firstItem.category || '',
      items: mappedItems.length
        ? mappedItems
        : [
          {
            id: firstItem.id?.toString() || '1',
            problem_issue: firstItem.problem_issue || firstItem.problem || '',
            category: firstItem.category || '',
            kode_wo: firstItem.kode_wo || '',
            teknisi: firstItem.teknisi || null,
            status: firstItem.status || null,
            wo_id: firstItem.id?.toString() || null,
          },
        ],
    });
  }, [currentBreakdown, params.id]);

  const equipmentOptions = useMemo(() => {
    let data = equipmentRedux?.data || [];
    if (!Array.isArray(data)) data = data?.rows || data?.data || data?.equipment || [];
    if (!data?.length && equipmentLocal?.length) data = equipmentLocal;
    if (!data || data.length === 0) return [];

    return data
      .map((item) => {
        const id = item.id?.toString() || item.kode_unit?.toString() || item.kode?.toString() || '';
        if (!id) return null;
        const kode = item.kode_unit || item.kode_equipment || item.code || item.kode || '';
        const nama = item.nama_unit || item.nama_equipment || item.name || item.nama || '';
        const subtitle = [item.manufaktur || item.manufacturer || '', item.model || '']
          .filter(Boolean)
          .join(' - ');
        return {
          id,
          nama: kode || nama || '[No Name]',
          subtitle,
        };
      })
      .filter(Boolean);
  }, [equipmentRedux?.data, equipmentLocal]);

  const lokasiOptions = useMemo(() => {
    let data = lokasiRedux?.data || [];
    if (!Array.isArray(data) && lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
      data = lokasiRedux.data.rows || lokasiRedux.data.data || [];
    }
    if (!data?.length && lokasiLocal?.length) data = lokasiLocal;
    if (!data || data.length === 0) return [];

    return data
      .map((item) => {
        const id = item.id?.toString() || item.kode_lokasi?.toString() || item.kode?.toString() || '';
        if (!id) return null;
        const cabangNama = item.cabang?.nama || item.cabang?.name || item.nama_cabang || item.cabang_name || '';
        const typeLokasi = item.type || item.tipe || item.jenis || '';
        const subtitle = [typeLokasi, cabangNama].filter(Boolean).join(' • ');
        return {
          id,
          nama: item.nama_lokasi || item.nama || item.lokasi || '[No Name]',
          subtitle,
        };
      })
      .filter(Boolean);
  }, [lokasiRedux?.data, lokasiLocal]);

  const shiftOptions = useMemo(() => {
    let data = shiftRedux?.data || [];
    if (!Array.isArray(data)) data = data?.rows || data?.data || [];
    if ((!data || data.length === 0) && Array.isArray(shiftRedux?.master_shift)) {
      data = shiftRedux.master_shift;
    }
    if ((!data || data.length === 0) && Array.isArray(shiftRedux?.sqlite_shift)) {
      data = shiftRedux.sqlite_shift;
    }
    if ((!data || data.length === 0) && shiftLocal.length) data = shiftLocal;
    if (!data || data.length === 0) return [];

    return data
      .map((item) => {
        const id = item.id?.toString() || '';
        if (!id) return null;
        const nama = item.nama || item.name || item.shift_name || item.kode || '';
        const subtitle = (item.start_shift || item.start || '') && (item.end_shift || item.end || '')
          ? `${item.start_shift || item.start} - ${item.end_shift || item.end}`
          : '';
        return { id, nama: nama || '[No Name]', subtitle };
      })
      .filter(Boolean);
  }, [shiftRedux?.data, shiftRedux?.master_shift, shiftRedux?.sqlite_shift, shiftLocal]);

  const pengawasOptions = useMemo(() => {
    let data = karyawanRedux?.data || [];
    if (!Array.isArray(data)) data = data?.rows || data?.data || [];
    if ((!data || data.length === 0) && karyawanLocal.length) data = karyawanLocal;
    if (!data || data.length === 0) return [];

    const allowed = ['pengawas', 'koordinator', 'korlap', 'pjo', 'supervisor', 'spv', 'services', 'service', 'svc'];
    return data
      .filter((item) => {
        const dynamicFields = Object.keys(item || {})
          .filter((key) => /section|jabatan|role|position|usertype/i.test(key))
          .map((key) => (item[key] || '').toString().toLowerCase());
        return dynamicFields.some((val) => allowed.some((a) => val.includes(a)));
      })
      .map((item) => {
        const id = item.id?.toString() || item.karyawan_id?.toString() || '';
        if (!id) return null;
        return {
          id,
          nama: item.nama || item.name || item.fullname || '[No Name]',
          subtitle: item.section || item.section_name || item.jabatan || '',
        };
      })
      .filter(Boolean);
  }, [karyawanRedux?.data, karyawanLocal]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUpdate = async () => {
    const fallbackCategory = formData.category || formData.items?.[0]?.category || 'OTHER';
    const sanitizedItems = (formData.items.length ? formData.items : [{ problem_issue: '' }]).map((it, idx) => ({
      id: it.id,
      category: it.category || fallbackCategory,
      problem_issue: it.problem_issue?.trim() || `Issue ${idx + 1}`,
      kode_wo: it.kode_wo,
    }));

    const validationPayload = {
      equipment_id: formData.equipment_id,
      lokasi_id: formData.lokasi_id,
      pengawas_id: formData.pengawas_id,
      breakdown_at: formData.breakdown_at,
      category: fallbackCategory,
      items: sanitizedItems.map((it) => ({ problem_issue: it.problem_issue })),
    };

    const validation = validateBreakdownForm(validationPayload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validasi Gagal', 'Lengkapi field wajib sebelum update.');
      return;
    }

    const breakdownAtValue = formData.breakdown_at
      ? moment(formData.breakdown_at).format('YYYY-MM-DD HH:mm:ss')
      : null;

    const payload = {
      equipment_id: formData.equipment_id,
      lokasi_id: formData.lokasi_id,
      pengawas_id: formData.pengawas_id,
      shift_id: formData.shift_id,
      breakdown_at: breakdownAtValue,
      smu: formData.smu ? parseFloat(formData.smu) : null,
      items: sanitizedItems,
    };

    setSubmitting(true);
    try {
      await dispatch(updateBreakdown({ id: params.id, data: payload })).unwrap();
      setModalState({
        visible: true,
        type: 'success',
        title: 'Berhasil Diperbarui',
        message: 'Data breakdown berhasil diupdate.',
        onClose: () => router.back(),
      });
    } catch (err) {
      setModalState({
        visible: true,
        type: 'error',
        title: 'Gagal Update',
        message: err?.message || 'Tidak dapat memperbarui breakdown',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderReadOnly = (icon, label, value, helper) => (
    <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.readonlyRow, { borderColor: cardBorder }]}>
        <Ionicons name={icon} size={18} color={subtitleColor} />
        <Text style={[styles.readonlyText, { color: textColor }]} numberOfLines={1}>
          {value || '-'}
        </Text>
      </View>
      {helper ? (
        <Text style={[styles.helperText, { color: subtitleColor }]}>{helper}</Text>
      ) : null}
    </View>
  );

  if (loadingDetail) {
    return (
      <AppScreen>
        <HeaderScreen title="Update Breakdown" onBack={() => router.back()} onThemes onNotification />
        <View style={[styles.loadingWrap, { backgroundColor }]}>
          <ActivityIndicator size="large" color={mode === 'dark' ? '#60a5fa' : COLORS.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <HeaderScreen
        title="Update Breakdown"
        onBack={() => router.back()}
        onThemes
        onNotification
      />

      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>Equipment *</Text>
          <BottomSheetSelect
            label="Equipment"
            value={formData.equipment_id?.toString()}
            options={equipmentOptions}
            onChange={(val) => {
              const option = equipmentOptions.find((o) => o.id === val);
              updateField('equipment_id', val || '');
              updateField('equipment_label', option?.nama || '');
            }}
            mode={mode}
            placeholder="Pilih equipment"
            allowClear
            displayKey="nama"
            displaySubKey="subtitle"
          />
          {errors.equipment_id ? (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.equipment_id}</Text>
          ) : null}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>Lokasi Kerja *</Text>
          <BottomSheetSelect
            label="Lokasi"
            value={formData.lokasi_id?.toString()}
            options={lokasiOptions}
            onChange={(val) => {
              const option = lokasiOptions.find((o) => o.id === val);
              updateField('lokasi_id', val || '');
              updateField('lokasi_label', option?.nama || '');
            }}
            mode={mode}
            placeholder="Pilih lokasi"
            allowClear
            displayKey="nama"
            displaySubKey="subtitle"
          />
          {errors.lokasi_id ? (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.lokasi_id}</Text>
          ) : null}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>Shift</Text>
          <BottomSheetSelect
            label="Shift"
            value={formData.shift_id?.toString()}
            options={shiftOptions}
            onChange={(val) => {
              const option = shiftOptions.find((o) => o.id === val);
              updateField('shift_id', val || '');
              updateField('shift_label', option?.nama || '');
            }}
            mode={mode}
            placeholder="Pilih shift"
            allowClear
            displayKey="nama"
            displaySubKey="subtitle"
          />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>Pengawas *</Text>
          <BottomSheetSelect
            label="Pengawas"
            value={formData.pengawas_id?.toString()}
            options={pengawasOptions}
            onChange={(val) => {
              const option = pengawasOptions.find((o) => o.id === val);
              updateField('pengawas_id', val || '');
              updateField('pengawas_label', option?.nama || '');
            }}
            mode={mode}
            placeholder="Pilih pengawas"
            allowClear
            displayKey="nama"
            displaySubKey="subtitle"
          />
          {errors.pengawas_id ? (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.pengawas_id}</Text>
          ) : null}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>Tanggal & Waktu *</Text>
          <View style={styles.rowGap}>
            <TouchableOpacity
              style={[styles.inputRow, { borderColor: cardBorder }]}
              onPress={() => setDatePicker({ visible: true, mode: 'date' })}
            >
              <Ionicons name="calendar-outline" size={18} color={subtitleColor} />
              <Text style={[styles.inputText, { color: textColor }]}>
                {moment(parseDateValue(formData.breakdown_at)).format('DD MMM YYYY')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.inputRow, { borderColor: cardBorder }]}
              onPress={() => setDatePicker({ visible: true, mode: 'time' })}
            >
              <Ionicons name="time-outline" size={18} color={subtitleColor} />
              <Text style={[styles.inputText, { color: textColor }]}>
                {moment(parseDateValue(formData.breakdown_at)).format('HH:mm')}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.breakdown_at ? (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.breakdown_at}</Text>
          ) : null}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>SMU (Hour Meter)</Text>
          <TextInput
            style={[styles.input, { borderColor: cardBorder, color: textColor }]}
            placeholder="Contoh: 1234"
            placeholderTextColor={subtitleColor}
            keyboardType="decimal-pad"
            value={formData.smu}
            onChangeText={(val) => updateField('smu', val)}
          />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textColor }]}>Problem Issue *</Text>
          {(formData.items && formData.items.length > 0 ? formData.items : [{ id: '1', problem_issue: '' }]).map((it, idx) => (
            <View key={it.id || idx} style={{ marginBottom: 12 }}>
              {/* Work Order Header with Navigation */}
              {it.kode_wo ? (
                <TouchableOpacity
                  onPress={() => it.id && router.push({
                    pathname: '/operational/work-order/[id]',
                    params: { id: it.id.toString() }
                  })}
                  style={{ marginBottom: 8 }}
                >
                  <HStack alignItems={'center'} justifyContent={'space-between'}>
                    <HStack space={2}>
                      <Text style={[styles.helperText, { color: subtitleColor }]}>
                        {idx + 1}. Work Order:
                      </Text>
                      <Text style={[styles.workOrderCode, { color: textColor }]}>
                        {it.kode_wo}
                      </Text>
                    </HStack>
                    <HStack alignItems={'center'}>
                      {it.kode_wo && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                          
                          {it.status && (
                            <View style={[
                              styles.statusBadge,
                              {
                                backgroundColor: STATUS_OPTIONS[it.status]?.color + '20' || '#e5e7eb20',
                                borderColor: STATUS_OPTIONS[it.status]?.color || '#9ca3af'
                              }
                            ]}>
                              <Text style={[
                                styles.statusText,
                                { color: STATUS_OPTIONS[it.status]?.color || '#6b7280' }
                              ]}>
                                {STATUS_OPTIONS[it.status]?.label || it.status}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                      <Ionicons name="chevron-forward" size={16} color={subtitleColor} />
                    </HStack>
                  </HStack>
                  {/* Technician and Status Row */}
                  
                </TouchableOpacity>
              ) : (
                <Text style={[styles.helperText, { color: subtitleColor, marginBottom: 6 }]}>
                  {idx + 1}. Issue Detail
                </Text>
              )}

              <TextInput
                style={[styles.textArea, { borderColor: cardBorder, color: textColor }]}
                placeholder="Tuliskan detail kerusakan"
                placeholderTextColor={subtitleColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={it.problem_issue}
                onChangeText={(val) => {
                  setFormData((prev) => {
                    const next = { ...prev, items: [...prev.items] };
                    next.items[idx] = { ...next.items[idx], problem_issue: val };
                    return next;
                  });
                }}
              />
              

                {/* Actions List */}
                {it.kode_wo && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.helperText, { color: subtitleColor, fontSize: 11, marginBottom: 4 }]}>
                      Catatan Teknisi {it.actions && it.actions.length > 0 ? `(${it.actions.length}):` : ':'}
                    </Text>
                    
                    {it.actions && it.actions.length > 0 ? (
                      it.actions.map((act, i) => (
                        <View key={i} style={{ 
                          backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb', 
                          borderRadius: 8, 
                          padding: 8, 
                          marginBottom: i < it.actions.length - 1 ? 4 : 0,
                          borderWidth: 0.5,
                          borderColor: cardBorder 
                        }}>
                          <Text style={[styles.helperText, { color: textColor, fontSize: 11, marginBottom: 2 }]}>
                            {act.narasi || '-'}
                          </Text>
                          <HStack space={8} alignItems={'center'}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <User size={10} color={subtitleColor} />
                              <Text style={[styles.helperText, { color: subtitleColor, fontSize: 10 }]}>
                                {act.karyawan?.nama || act.karyawan?.name || '-'}
                              </Text>
                            </View>
                            {act.starttime && (
                              <Text style={[styles.helperText, { color: subtitleColor, fontSize: 10 }]}>
                                {moment(act.starttime, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm')}
                              </Text>
                            )}
                          </HStack>
                        </View>
                      ))
                    ) : (
                      <View style={{ 
                        backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb', 
                        borderRadius: 8, 
                        padding: 8,
                        borderWidth: 0.5,
                        borderColor: cardBorder 
                      }}>
                        <Text style={[styles.helperText, { color: subtitleColor, fontSize: 10 }]}>
                          Belum ada catatan teknisi
                        </Text>
                      </View>
                    )}
                  </View>
                )}
            </View>
          ))}
          {errors.items ? (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.items}</Text>
          ) : null}
        </View>

        <View
          style={[
            styles.noteBox,
            {
              backgroundColor: mode === 'dark' ? '#1f2937' : '#ecfeff',
              borderColor: mode === 'dark' ? '#0ea5e9' : '#67e8f9',
            },
          ]}
        >
          <Ionicons name="information-circle-outline" size={18} color={mode === 'dark' ? '#38bdf8' : '#0284c7'} />
          <Text style={[styles.noteText, { color: textColor }]}>
            Pastikan data sesuai sebelum menekan tombol Update. Perubahan langsung tersimpan ke sistem.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.deleteButton, { opacity: submitting ? 0.6 : 1 }]}
            onPress={() => {
              setConfirmState({
                visible: true,
                title: 'Hapus Breakdown',
                message: 'Yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan.',
                onConfirm: async () => {
                  try {
                    setSubmitting(true);
                    await dispatch(deleteBreakdown(params.id)).unwrap();
                    setModalState({
                      visible: true,
                      type: 'success',
                      title: 'Berhasil Dihapus',
                      message: 'Data breakdown sudah dihapus.',
                      onClose: () => router.back(),
                    });
                  } catch (err) {
                    setModalState({
                      visible: true,
                      type: 'error',
                      title: 'Gagal Hapus',
                      message: err?.message || 'Tidak dapat menghapus data',
                    });
                  } finally {
                    setSubmitting(false);
                    setConfirmState((prev) => ({ ...prev, visible: false }));
                  }
                },
              });
            }}
            disabled={submitting}
          >
            <View style={styles.btnContentRow}>
              <Ionicons name="trash" size={18} color={'#ef4444'} />
              <Text style={styles.deleteButtonText}>Hapus</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: submitting ? '#fcd34daa' : (COLORS.warning || '#f59e0b') }]}
            onPress={handleUpdate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnContentRow}>
                <Ionicons name="save" size={18} color="#ffffff" />
                <Text style={styles.updateButtonText}>Update</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={datePicker.visible}
        mode={datePicker.mode}
        date={parseDateValue(formData.breakdown_at)}
        onConfirm={(date) => {
          setDatePicker({ visible: false, mode: 'date' });
          updateField('breakdown_at', date);
        }}
        onCancel={() => setDatePicker({ visible: false, mode: 'date' })}
      />

      {/* Info Modal (success/error) */}
      <Modal isOpen={modalState.visible} onClose={() => setModalState((prev) => ({ ...prev, visible: false }))} size="md">
        <Modal.Content maxWidth="420" bg={cardColor} borderRadius={20}>
          <Modal.Body p={6}>
            <VStack space={4} alignItems="center">
              <Center w={20} h={20} bg={mode === 'dark' ? '#111827' : '#f8fafc'} rounded="full">
                {modalState.type === 'success' ? (
                  <TickCircle size={38} color={mode === 'dark' ? '#22c55e' : '#16a34a'} variant="Bold" />
                ) : (
                  <CloseCircle size={38} color={mode === 'dark' ? '#f87171' : '#ef4444'} variant="Bold" />
                )}
              </Center>
              <VStack alignItems="center" space={2}>
                <Text style={{ fontSize: 18, fontFamily: 'Quicksand-Bold', color: textColor, textAlign: 'center' }}>
                  {modalState.title || (modalState.type === 'success' ? 'Berhasil' : 'Terjadi Kesalahan')}
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Poppins-Light', color: subtitleColor, textAlign: 'center' }}>
                  {modalState.message || (modalState.type === 'success' ? 'Data tersimpan.' : 'Tidak dapat memproses permintaan.')}
                </Text>
              </VStack>
              <Button
                mt={2}
                w="full"
                bg={modalState.type === 'success' ? (mode === 'dark' ? '#16a34a' : '#22c55e') : (mode === 'dark' ? '#ef4444' : '#dc2626')}
                _pressed={{ bg: modalState.type === 'success' ? (mode === 'dark' ? '#15803d' : '#16a34a') : (mode === 'dark' ? '#b91c1c' : '#b91c1c') }}
                onPress={() => {
                  setModalState((prev) => ({ ...prev, visible: false }));
                  if (modalState.onClose) modalState.onClose();
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

      {/* Confirm Modal (delete) */}
      <Modal isOpen={confirmState.visible} onClose={() => setConfirmState((prev) => ({ ...prev, visible: false }))} size="md">
        <Modal.Content maxWidth="420" bg={cardColor} borderRadius={20}>
          <Modal.Body p={6}>
            <VStack space={4} alignItems="center">
              <Center w={20} h={20} bg={mode === 'dark' ? '#2f1b1b' : '#fef2f2'} rounded="full">
                <Ionicons name="warning" size={28} color={mode === 'dark' ? '#f87171' : '#dc2626'} />
              </Center>
              <VStack alignItems="center" space={2}>
                <Text style={{ fontSize: 18, fontFamily: 'Quicksand-Bold', color: textColor, textAlign: 'center' }}>
                  {confirmState.title || 'Konfirmasi Hapus'}
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Poppins-Light', color: subtitleColor, textAlign: 'center' }}>
                  {confirmState.message || 'Tindakan ini tidak dapat dibatalkan.'}
                </Text>
              </VStack>
              <HStack space={3} w="full">
                <Button
                  flex={1}
                  variant="outline"
                  borderColor={mode === 'dark' ? '#6b7280' : '#d1d5db'}
                  onPress={() => setConfirmState((prev) => ({ ...prev, visible: false }))}
                  rounded="xl"
                >
                  <Text style={{ color: subtitleColor, fontFamily: 'Quicksand-SemiBold' }}>Batal</Text>
                </Button>
                <Button
                  flex={1}
                  bg={mode === 'dark' ? '#dc2626' : '#ef4444'}
                  _pressed={{ bg: mode === 'dark' ? '#b91c1c' : '#dc2626' }}
                  onPress={() => {
                    const action = confirmState.onConfirm;
                    if (action) action();
                  }}
                  rounded="xl"
                >
                  <Text style={{ color: '#ffffff', fontFamily: 'Quicksand-Bold' }}>Hapus</Text>
                </Button>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workOrderCode: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    // textDecorationLine: 'underline',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  readonlyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    // marginTop: 6,
  },
  rowGap: {
    flexDirection: 'row',
    gap: 10,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  inputText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 6,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 14,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  updateButton: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
  },
  deleteButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: .5,
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    elevation: 0,
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 15,
    fontFamily: 'Quicksand-Bold',
    letterSpacing: 0.2,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
