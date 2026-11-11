import { Calendar, CloseSquare } from 'iconsax-react-native';
import moment from 'moment';
import { Badge, Button, HStack, Spinner, Text, VStack } from 'native-base';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import apiClient from '../../../services/api/client';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { BottomSheetSelect } from '../components/FilterPurchaseRequestModal';
import { usePurchaseOrderTheme } from './components';
import { DEFAULT_FILTERS, getPurchaseOrderError, getRelationName, normalizePurchaseOrderFilters, unwrapPurchaseOrder } from './utils';

const MASTER_ENDPOINTS = {
  bisnis: API_ENDPOINTS.BISNIS_UNIT.LIST,
  cabang: API_ENDPOINTS.CABANG.LIST,
  gudang: API_ENDPOINTS.GUDANG.LIST,
};

export default function FilterPurchaseOrderModal({ visible, filters, onClose, onApply }) {
  const theme = usePurchaseOrderTheme();
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [options, setOptions] = useState({ bisnis: [], cabang: [], gudang: [] });
  const [loading, setLoading] = useState(false);
  const [masterError, setMasterError] = useState('');
  const [dateError, setDateError] = useState('');
  const [dateField, setDateField] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (visible) {
      setDraft(normalizePurchaseOrderFilters(filters));
      setDateError('');
      setDateField(null);
    }
  }, [visible, filters]);

  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    setLoading(true);
    setMasterError('');
    setOptions({ bisnis: [], cabang: [], gudang: [] });
    Promise.allSettled(Object.entries(MASTER_ENDPOINTS).map(async ([key, endpoint]) => {
      const response = await apiClient.get(endpoint, {
        signal: controller.signal,
        params: key === 'bisnis' ? { my_units: true } : {},
      });
      const rows = unwrapPurchaseOrder(response.data);
      return [key, Array.isArray(rows) ? rows : rows?.data || []];
    })).then(results => {
      if (controller.signal.aborted) return;
      setOptions(Object.fromEntries(results.map((result, index) => result.status === 'fulfilled'
        ? result.value : [Object.keys(MASTER_ENDPOINTS)[index], []])));
      const failed = results.find(result => result.status === 'rejected');
      if (failed) setMasterError(getPurchaseOrderError(failed.reason, 'Sebagian pilihan filter gagal dimuat.'));
      setLoading(false);
    });
    return () => controller.abort();
  }, [visible, retry]);

  const change = (field, value) => {
    setDraft(current => ({
      ...current,
      [field]: value,
      ...(field === 'bisnis_id' ? { cabang_id: '', gudang_id: '' } : {}),
      ...(field === 'cabang_id' ? { gudang_id: '' } : {}),
    }));
    setDateError('');
  };

  const apply = () => {
    if (draft.date_start && draft.date_end && draft.date_start > draft.date_end) {
      setDateError('Tanggal akhir harus sama dengan atau setelah tanggal mulai.');
      return;
    }
    onApply(normalizePurchaseOrderFilters(draft));
  };

  const selectOptions = (rows, label) => [
    { label: `Semua ${label}`, value: '' },
    ...rows.filter(row => row.id != null).map(row => ({
      label: String(getRelationName(row)),
      value: String(row.id),
      subtitle: row.bisnis ? getRelationName(row.bisnis) : '',
    })),
  ];
  const cabang = options.cabang.filter(row => !draft.bisnis_id || !row.bisnis_id || String(row.bisnis_id) === draft.bisnis_id);
  const gudang = options.gudang.filter(row => (!draft.bisnis_id || !row.bisnis_id || String(row.bisnis_id) === draft.bisnis_id)
    && (!draft.cabang_id || !row.cabang_id || String(row.cabang_id) === draft.cabang_id));
  const inputStyle = { backgroundColor: theme.input, color: theme.text, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, fontFamily: 'Poppins-Regular', fontSize: 14 };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} accessibilityLabel="Tutup filter" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' }}>
          <HStack justifyContent="space-between" alignItems="center" p={5}>
            <Text fontSize="xl" fontFamily="Quicksand-Bold" color={theme.text}>Filter Purchase Order</Text>
            <Pressable onPress={onClose} accessibilityLabel="Tutup filter"><CloseSquare size={28} color={theme.muted} /></Pressable>
          </HStack>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            <VStack space={4}>
              <VStack space={2}>
                <Text fontSize="sm" color={theme.muted} fontFamily="Poppins-Regular">Status Dokumen</Text>
                <Badge alignSelf="flex-start" colorScheme="info" rounded="full" px={4} py={2}>Verify — Menunggu Verifikasi</Badge>
              </VStack>
              {loading && <HStack space={2}><Spinner size="sm" /><Text color={theme.muted} fontSize="xs">Memuat pilihan filter...</Text></HStack>}
              {masterError ? <VStack space={2}><Text color={theme.muted} fontSize="xs">{masterError}</Text><Button size="sm" variant="outline" onPress={() => setRetry(value => value + 1)}>Muat Ulang Pilihan</Button></VStack> : null}
              <BottomSheetSelect label="Bisnis Unit" value={draft.bisnis_id} options={selectOptions(options.bisnis, 'Bisnis')} onSelect={value => change('bisnis_id', value)} mode={theme.mode} placeholder="Pilih bisnis unit" />
              <HStack space={2}>
                <VStack flex={1}><BottomSheetSelect label="Cabang" value={draft.cabang_id} options={selectOptions(cabang, 'Cabang')} onSelect={value => change('cabang_id', value)} mode={theme.mode} placeholder="Pilih cabang" /></VStack>
                <VStack flex={1}><BottomSheetSelect label="Gudang" value={draft.gudang_id} options={selectOptions(gudang, 'Gudang')} onSelect={value => change('gudang_id', value)} mode={theme.mode} placeholder="Pilih gudang" /></VStack>
              </HStack>
              <VStack space={2}>
                <Text fontSize="sm" color={theme.muted} fontFamily="Poppins-Regular">Prioritas</Text>
                <HStack space={2} flexWrap="wrap">
                  {[['', 'Semua'], ['P1', 'P1 - Tinggi'], ['P2', 'P2 - Sedang'], ['P3', 'P3 - Rendah'], ['urgent', 'Urgent']].map(([value, label]) => (
                    <Pressable key={value} onPress={() => change('prioritas', value)} style={{ paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, borderRadius: 20, borderWidth: 1, borderColor: draft.prioritas === value ? theme.accent : theme.border, backgroundColor: draft.prioritas === value ? theme.summary : theme.input }}>
                      <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={theme.text}>{label}</Text>
                    </Pressable>
                  ))}
                </HStack>
              </VStack>
              {[['kode', 'Kode PO / PR', 'Cari berdasarkan kode PO atau PR...'], ['narasi', 'Narasi / Keterangan', 'Cari berdasarkan keterangan...']].map(([field, label, placeholder]) => (
                <VStack key={field} space={2}>
                  <Text fontSize="sm" color={theme.muted} fontFamily="Poppins-Regular">{label}</Text>
                  <TextInput value={draft[field]} onChangeText={value => change(field, value)} placeholder={placeholder} placeholderTextColor={theme.muted} style={inputStyle} accessibilityLabel={label} />
                </VStack>
              ))}
              <VStack space={2}>
                <Text fontSize="sm" color={theme.muted} fontFamily="Poppins-Regular">Rentang Tanggal Request</Text>
                <HStack space={2}>
                  {[['date_start', 'Mulai'], ['date_end', 'Akhir']].map(([field, label]) => (
                    <VStack key={field} flex={1} space={1}>
                      <Text color={theme.muted} fontSize="xs">{label}</Text>
                      <Pressable onPress={() => setDateField(field)} style={inputStyle} accessibilityLabel={`Pilih tanggal ${label.toLowerCase()}`}>
                        <HStack alignItems="center" justifyContent="space-between"><Text color={theme.text} fontSize="xs">{draft[field] ? moment(draft[field]).format('DD/MM/YYYY') : 'Pilih'}</Text><Calendar size={16} color={theme.muted} /></HStack>
                      </Pressable>
                      {draft[field] ? <Button size="xs" variant="ghost" onPress={() => change(field, '')}>Hapus</Button> : null}
                    </VStack>
                  ))}
                </HStack>
                {dateError ? <Text color="red.500" fontSize="xs">{dateError}</Text> : null}
              </VStack>
            </VStack>
          </ScrollView>
          <HStack p={5} space={3} borderTopWidth={1} borderColor={theme.border}>
            <Button flex={1} variant="outline" onPress={() => { setDraft({ ...DEFAULT_FILTERS }); setDateError(''); }}>Reset</Button>
            <Button flex={2} onPress={apply}>Terapkan Filter</Button>
          </HStack>
        </View>
      </KeyboardAvoidingView>
      <DateTimePickerModal
        isVisible={Boolean(dateField)}
        mode="date"
        date={dateField && draft[dateField] ? moment(draft[dateField], 'YYYY-MM-DD').toDate() : new Date()}
        onConfirm={date => { if (dateField) change(dateField, moment(date).format('YYYY-MM-DD')); setDateField(null); }}
        onCancel={() => setDateField(null)}
      />
    </Modal>
  );
}
