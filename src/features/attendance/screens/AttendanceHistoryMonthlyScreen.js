import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import moment from 'moment';
import 'moment/locale/id';
import { useDispatch, useSelector } from 'react-redux';
import ImageViewing from 'react-native-image-viewing';
import {
  ArrowLeft2,
  ArrowRight2,
  Calendar as CalendarIcon,
  Clock,
  LoginCurve,
  LogoutCurve,
  Profile,
  TickCircle,
  Warning2,
  CloseCircle,
  InfoCircle,
  Hospital,
  Location,
  FilterSearch,
} from 'iconsax-react-native';

import { AppScreen, HeaderScreen, LoadingHauler, BottomSheetSelect } from '../../../components/common';
import { COLORS } from '../../../constants/colors';
import apiClient from '../../../services/api/client';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { getKaryawan } from '../../../store/slices/karyawanSlice';
import { getCabang } from '../../../store/slices/cabangSlice';

moment.locale('id');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FILTER_ALLOWED_USERTYPES = ['developer', 'administrator', 'pjo', 'hrd'];
const EMPTY_FILTER = { bisnis_id: null, site_id: null, karyawan_id: null };
const PHOTO_BASE_URL = 'https://cdn.makkuragatama.id';

function resolvePhotoUri(path) {
  if (!path) return null;
  if (String(path).startsWith('http')) return path;
  return `${PHOTO_BASE_URL.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

function normalizeMonthlyPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const calendar = (payload.calendar || []).map(day => ({
    ...day,
    photo_in: resolvePhotoUri(day.photo_in),
    photo_out: resolvePhotoUri(day.photo_out),
    karyawan: day.karyawan
      ? {
          ...day.karyawan,
          nama: day.karyawan.nama || day.karyawan.fullname || null,
        }
      : day.karyawan,
  }));

  const detailsByDate = {};
  calendar.forEach(day => {
    if (day?.date) detailsByDate[day.date] = day;
  });

  if (payload.detailsByDate && typeof payload.detailsByDate === 'object') {
    Object.keys(payload.detailsByDate).forEach(key => {
      const d = payload.detailsByDate[key];
      if (!d) return;
      detailsByDate[key] = {
        ...d,
        photo_in: resolvePhotoUri(d.photo_in),
        photo_out: resolvePhotoUri(d.photo_out),
        karyawan: d.karyawan
          ? { ...d.karyawan, nama: d.karyawan.nama || d.karyawan.fullname || null }
          : d.karyawan,
      };
    });
  }

  const summary = {
    hadir: Number(payload.summary?.hadir) || 0,
    terlambat: Number(payload.summary?.terlambat) || 0,
    cuti: Number(payload.summary?.cuti) || 0,
    izin: Number(payload.summary?.izin) || 0,
    sakit: Number(payload.summary?.sakit) || 0,
    absen: Number(payload.summary?.absen) || 0,
    libur: Number(payload.summary?.libur) || 0,
    totalHariKerja: Number(payload.summary?.totalHariKerja) || 0,
    totalHari: Number(payload.summary?.totalHari) || calendar.length,
    persentaseKehadiran: Number(payload.summary?.persentaseKehadiran) || 0,
  };

  const karyawan = payload.karyawan
    ? {
        ...payload.karyawan,
        nama: payload.karyawan.nama || payload.karyawan.fullname || null,
      }
    : null;

  return {
    month: payload.month,
    monthName: payload.monthName,
    karyawan,
    filters: payload.filters || null,
    summary,
    calendar,
    detailsByDate,
  };
}

const STATUS_META = {
  hadir: { key: 'hadir', label: 'Hadir', short: 'H', color: '#22c55e', bgLight: 'rgba(34,197,94,0.14)', bgDark: 'rgba(34,197,94,0.2)' },
  terlambat: { key: 'terlambat', label: 'Terlambat', short: 'T', color: '#f59e0b', bgLight: 'rgba(245,158,11,0.14)', bgDark: 'rgba(245,158,11,0.2)' },
  cuti: { key: 'cuti', label: 'Cuti', short: 'C', color: '#3b82f6', bgLight: 'rgba(59,130,246,0.14)', bgDark: 'rgba(59,130,246,0.2)' },
  izin: { key: 'izin', label: 'Izin', short: 'I', color: '#a855f7', bgLight: 'rgba(168,85,247,0.14)', bgDark: 'rgba(168,85,247,0.2)' },
  sakit: { key: 'sakit', label: 'Sakit', short: 'S', color: '#ec4899', bgLight: 'rgba(236,72,153,0.14)', bgDark: 'rgba(236,72,153,0.2)' },
  absen: { key: 'absen', label: 'Alpha', short: 'A', color: '#ef4444', bgLight: 'rgba(239,68,68,0.14)', bgDark: 'rgba(239,68,68,0.2)' },
  libur: { key: 'libur', label: 'Libur', short: 'L', color: '#94a3b8', bgLight: 'rgba(148,163,184,0.16)', bgDark: 'rgba(148,163,184,0.18)' },
};

function useThemeTokens(isDark) {
  return {
    pageBg: isDark ? '#1e2030' : '#f1f5f9',
    cardBg: isDark ? COLORS.card.dark : COLORS.card.light,
    text: isDark ? COLORS.teks.dark[1] : COLORS.teks.light[1],
    muted: isDark ? COLORS.teks.dark[2] : COLORS.teks.light[2],
    border: isDark ? COLORS.line.dark[1] : COLORS.line.light[1],
    accent: isDark ? '#60a5fa' : '#2563eb',
    panelBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
  };
}

const StatPill = React.memo(function StatPill({ label, value, color, isDark }) {
  return (
    <VStack flex={1} minW="30%" p={3} rounded="2xl" bg={isDark ? 'rgba(255,255,255,0.04)' : '#fff'} borderWidth={1} borderColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'} space={1}>
      <HStack alignItems="center" space={1.5}>
        <Box w={2} h={2} rounded="full" bg={color} />
        <Text fontSize={11} fontFamily="Poppins-Regular" color={isDark ? '#94a3b8' : '#64748b'}>{label}</Text>
      </HStack>
      <Text fontSize={22} fontFamily="Quicksand-Bold" color={isDark ? '#F5F5F5' : '#0f172a'}>{value}</Text>
    </VStack>
  );
});

const LegendItem = React.memo(function LegendItem({ meta, isDark }) {
  return (
    <HStack alignItems="center" space={1.5} mr={3} mb={2}>
      <Box w={3} h={3} rounded="md" bg={isDark ? meta.bgDark : meta.bgLight} borderWidth={1} borderColor={meta.color} />
      <Text fontSize={11} fontFamily="Poppins-Regular" color={isDark ? '#94a3b8' : '#64748b'}>{meta.label}</Text>
    </HStack>
  );
});

const MonthCalendarGrid = React.memo(function MonthCalendarGrid({ calendar, monthKey, isDark, onDayPress, t }) {
  const start = moment(monthKey, 'YYYY-MM').startOf('month');
  const startPad = start.day();
  const daysInMonth = start.daysInMonth();
  const dayMap = new Map((calendar || []).map(day => [day.date, day]));
  const cells = [];

  for (let i = 0; i < startPad; i += 1) cells.push({ key: `pad-${i}`, empty: true });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = `${monthKey}-${String(d).padStart(2, '0')}`;
    const dayData = dayMap.get(date) || { date, day: d, status: null };
    cells.push({ key: date, empty: false, dayData });
  }

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const todayStr = moment().format('YYYY-MM-DD');

  return (
    <Box bg={t.cardBg} rounded="2xl" p={3.5} borderWidth={1} borderColor={t.border} style={styles.cardShadow}>
      <HStack mb={3} flexWrap="wrap">
        {Object.values(STATUS_META).map(meta => <LegendItem key={meta.key} meta={meta} isDark={isDark} />)}
      </HStack>
      <HStack mb={2}>
        {weekDays.map(w => (
          <Center key={w} flex={1} py={1}>
            <Text fontSize={11} fontFamily="Quicksand-Bold" color={isDark ? '#e2e8f0' : '#334155'}>{w}</Text>
          </Center>
        ))}
      </HStack>
      <Box flexDirection="row" flexWrap="wrap">
        {cells.map(cell => {
          if (cell.empty) return <Box key={cell.key} width="14.285%" aspectRatio={1} p={0.5} />;
          const { dayData } = cell;
          const meta = dayData.status ? STATUS_META[dayData.status] : null;
          const isToday = dayData.date === todayStr;
          const bg = meta
            ? (isDark ? meta.bgDark : meta.bgLight)
            : isToday
              ? (isDark ? 'rgba(96,165,250,0.22)' : 'rgba(37,99,235,0.12)')
              : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)');
          const borderC = meta
            ? meta.color
            : isToday
              ? t.accent
              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)');
          const dayNumberColor = meta
            ? (isDark ? '#ffffff' : meta.color)
            : isToday
              ? (isDark ? '#93c5fd' : '#1d4ed8')
              : (isDark ? '#f8fafc' : '#0f172a');
          const statusLabelColor = meta ? (isDark ? '#f8fafc' : meta.color) : dayNumberColor;
          return (
            <Box key={cell.key} width="14.285%" aspectRatio={1} p={0.5}>
              <TouchableOpacity activeOpacity={0.75} onPress={() => onDayPress(dayData)} style={{ flex: 1 }}>
                <Center flex={1} rounded="xl" bg={bg} borderWidth={1.5} borderColor={borderC}>
                  <Text fontSize={14} fontFamily="Quicksand-Bold" color={dayNumberColor} style={{ textShadowColor: isDark ? 'rgba(0,0,0,0.45)' : 'transparent', textShadowRadius: isDark ? 2 : 0 }}>{dayData.day}</Text>
                  {meta ? <Text fontSize={9} fontFamily="Quicksand-Bold" color={statusLabelColor} mt={0.5} opacity={isDark ? 0.95 : 1}>{meta.short}</Text> : null}
                </Center>
              </TouchableOpacity>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

function DetailModal({ visible, onClose, dayData, isDark, onPreviewPhoto }) {
  const t = useThemeTokens(isDark);
  if (!visible) return null;
  const meta = dayData?.status ? STATUS_META[dayData.status] : null;
  const dateLabel = dayData?.date ? moment(dayData.date).locale('id').format('dddd, DD MMMM YYYY') : '-';
  const fmt = (val) => {
    if (!val) return '--:--';
    const m = moment(val, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true);
    return m.isValid() ? m.format('HH:mm') : '--:--';
  };
  const duration = (() => {
    if (!dayData?.checklog_in || !dayData?.checklog_out) return null;
    const a = moment(dayData.checklog_in);
    const b = moment(dayData.checklog_out);
    if (!a.isValid() || !b.isValid()) return null;
    const mins = b.diff(a, 'minutes');
    if (mins < 0) return null;
    return `${Math.floor(mins / 60)}j ${mins % 60}m`;
  })();
  const viaLabel = via => (via === 'M' ? 'Mesin' : via === 'A' ? 'Mobile' : '-');
  const PhotoBlock = ({ title, time, photo, via, accent, Icon }) => (
    <VStack flex={1} space={2} alignItems="center">
      <HStack alignItems="center" space={1}><Icon size={16} color={accent} variant="Bulk" /><Text fontSize={12} fontFamily="Quicksand-Bold" color={t.muted}>{title}</Text></HStack>
      <TouchableOpacity activeOpacity={0.85} disabled={!photo} onPress={() => photo && onPreviewPhoto(photo)}>
        <Box w={28} h={28} rounded="2xl" overflow="hidden" borderWidth={2} borderColor={photo ? accent : t.border} bg={t.panelBg} alignItems="center" justifyContent="center">
          {photo ? <Image source={{ uri: photo }} style={styles.detailPhoto} resizeMode="cover" /> : <Profile size={28} color={isDark ? '#64748b' : '#94a3b8'} variant="Bulk" />}
        </Box>
      </TouchableOpacity>
      <Text fontSize={22} fontFamily="Quicksand-Bold" color={t.text}>{time}</Text>
      <Box px={2.5} py={0.5} rounded="full" bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}><Text fontSize={10} fontFamily="Quicksand-SemiBold" color={t.muted}>{viaLabel(via)}</Text></Box>
    </VStack>
  );
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Box flex={1} bg="rgba(0,0,0,0.55)" justifyContent="flex-end">
        <Box bg={t.cardBg} borderTopRadius={28} maxH="88%" pb={6}>
          <Center pt={3} pb={1}><Box w={10} h={1} rounded="full" bg={isDark ? '#4b5563' : '#d1d5db'} /></Center>
          <HStack px={5} py={3} alignItems="center" justifyContent="space-between" borderBottomWidth={1} borderBottomColor={t.border}>
            <VStack flex={1} pr={3}><Text fontSize={18} fontFamily="Quicksand-Bold" color={t.text}>Detail Kehadiran</Text><Text fontSize={13} fontFamily="Poppins-Regular" color={t.muted}>{dateLabel}</Text></VStack>
            {meta ? <Box px={3} py={1} rounded="full" bg={isDark ? meta.bgDark : meta.bgLight}><Text fontSize={12} fontFamily="Quicksand-Bold" color={meta.color}>{meta.label}</Text></Box> : null}
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 10 }}><Box w={9} h={9} rounded="full" bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'} alignItems="center" justifyContent="center"><CloseCircle size={18} color={t.muted} variant="Bold" /></Box></TouchableOpacity>
          </HStack>
          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {!dayData || (!dayData.status && !dayData.checklog_in) ? (
              <Center py={10}><InfoCircle size={36} color={t.muted} variant="Bulk" /><Text mt={3} fontFamily="Poppins-Regular" color={t.muted}>Belum ada data untuk tanggal ini</Text></Center>
            ) : (
              <VStack space={4}>
                <HStack alignItems="center" space={3} p={3.5} rounded="2xl" bg={t.panelBg} borderWidth={1} borderColor={t.border}><Center w={12} h={12} rounded="full" bg={isDark ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.1)'}><Profile size={24} color={t.accent} variant="Bulk" /></Center><VStack flex={1}><Text fontSize={15} fontFamily="Quicksand-Bold" color={t.text}>{dayData.karyawan?.nama || 'Karyawan'}</Text><Text fontSize={12} fontFamily="Poppins-Regular" color={t.muted}>PIN {dayData.pin || '-'} · Shift {dayData.shift || '-'}</Text></VStack></HStack>
                {(dayData.checklog_in || dayData.checklog_out || ['hadir', 'terlambat'].includes(dayData.status)) && (
                  <Box p={4} rounded="2xl" bg={t.panelBg} borderWidth={1} borderColor={t.border}><HStack alignItems="stretch" space={3}><PhotoBlock title="MASUK" time={fmt(dayData.checklog_in)} photo={dayData.photo_in} via={dayData.via_in} accent={isDark ? '#34d399' : '#059669'} Icon={LoginCurve} /><Box w={0.5} bg={t.border} alignSelf="stretch" /><PhotoBlock title="PULANG" time={fmt(dayData.checklog_out)} photo={dayData.photo_out} via={dayData.via_out} accent={isDark ? '#60a5fa' : '#2563eb'} Icon={LogoutCurve} /></HStack></Box>
                )}
                <VStack space={2.5}>
                  {duration ? <HStack p={3.5} rounded="2xl" bg={t.panelBg} borderWidth={1} borderColor={t.border} alignItems="center" space={3}><Center w={10} h={10} rounded="xl" bg={isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}><Clock size={20} color="#6366f1" variant="Bulk" /></Center><VStack><Text fontSize={11} fontFamily="Poppins-Regular" color={t.muted}>Durasi kerja</Text><Text fontSize={15} fontFamily="Quicksand-Bold" color={t.text}>{duration}</Text></VStack></HStack> : null}
                  {dayData.terlambat === 'Y' ? <HStack p={3.5} rounded="2xl" bg={isDark ? STATUS_META.terlambat.bgDark : STATUS_META.terlambat.bgLight} borderWidth={1} borderColor={STATUS_META.terlambat.color} alignItems="center" space={3}><Warning2 size={22} color={STATUS_META.terlambat.color} variant="Bulk" /><VStack><Text fontSize={11} fontFamily="Poppins-Regular" color={STATUS_META.terlambat.color}>Keterlambatan</Text><Text fontSize={15} fontFamily="Quicksand-Bold" color={STATUS_META.terlambat.color}>{dayData.durasi_keterlambatan || 0} menit</Text></VStack></HStack> : null}
                  {dayData.lokasi ? <HStack p={3.5} rounded="2xl" bg={t.panelBg} borderWidth={1} borderColor={t.border} alignItems="center" space={3}><Center w={10} h={10} rounded="xl" bg={isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.12)'}><Location size={20} color="#f59e0b" variant="Bulk" /></Center><VStack flex={1}><Text fontSize={11} fontFamily="Poppins-Regular" color={t.muted}>Lokasi</Text><Text fontSize={14} fontFamily="Quicksand-Bold" color={t.text}>{dayData.lokasi}</Text></VStack></HStack> : null}
                  {dayData.note ? <HStack p={3.5} rounded="2xl" bg={t.panelBg} borderWidth={1} borderColor={t.border} alignItems="flex-start" space={3}><Center w={10} h={10} rounded="xl" bg={isDark ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.15)'}>{dayData.status === 'sakit' ? <Hospital size={20} color="#ec4899" variant="Bulk" /> : <InfoCircle size={20} color={t.muted} variant="Bulk" />}</Center><VStack flex={1}><Text fontSize={11} fontFamily="Poppins-Regular" color={t.muted}>Catatan</Text><Text fontSize={13} fontFamily="Poppins-Regular" color={t.text}>{dayData.note}</Text></VStack></HStack> : null}
                </VStack>
              </VStack>
            )}
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  );
}

function AttendanceFilterSheet({ visible, onClose, isDark, draft, setDraft, onApply, onReset, bisnisOptions, siteOptions, karyawanOptions }) {
  const t = useThemeTokens(isDark);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);
  const closeSheet = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }).start(() => onClose());
  };
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeSheet}>
      <Box flex={1} justifyContent="flex-end"><Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <Animated.View style={[styles.sheetContainer, { backgroundColor: t.cardBg, maxHeight: SCREEN_HEIGHT * 0.78, transform: [{ translateY: slideAnim }] }]}>
          <Center pt={3} pb={1}><Box w={10} h={1} rounded="full" bg={isDark ? '#4b5563' : '#d1d5db'} /></Center>
          <HStack px={4} py={3} alignItems="center" justifyContent="space-between" borderBottomWidth={1} borderBottomColor={t.border}><HStack alignItems="center" space={2}><FilterSearch size={20} color={t.accent} variant="Bold" /><VStack><Text fontSize={16} fontFamily="Quicksand-Bold" color={t.text}>Filter Kehadiran</Text><Text fontSize={11} fontFamily="Poppins-Regular" color={t.muted}>Bisnis · Site · Karyawan</Text></VStack></HStack><TouchableOpacity onPress={closeSheet} hitSlop={10}><CloseCircle size={22} color={t.muted} variant="Bold" /></TouchableOpacity></HStack>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <VStack space={4}>
              <BottomSheetSelect label="Bisnis Unit" placeholder="Semua bisnis unit" value={draft.bisnis_id} options={bisnisOptions} onChange={id => setDraft(prev => ({ ...prev, bisnis_id: id, site_id: null, karyawan_id: null }))} displayKey="nama" displaySubKey="subtitle" />
              <BottomSheetSelect label="Site / Cabang" placeholder="Semua site" value={draft.site_id} options={siteOptions} onChange={id => setDraft(prev => ({ ...prev, site_id: id, karyawan_id: null }))} displayKey="nama" displaySubKey="subtitle" />
              <BottomSheetSelect label="Karyawan" placeholder="Semua karyawan" value={draft.karyawan_id} options={karyawanOptions} onChange={id => setDraft(prev => ({ ...prev, karyawan_id: id }))} displayKey="nama" displaySubKey="subtitle" />
              <HStack space={3} mt={2}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.85} onPress={onReset}><Center py={3.5} rounded="xl" borderWidth={1} borderColor={t.border} bg={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}><Text fontFamily="Quicksand-Bold" color={t.muted}>Reset</Text></Center></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.85} onPress={() => { onApply(draft); closeSheet(); }}><Center py={3.5} rounded="xl" bg={t.accent}><Text fontFamily="Quicksand-Bold" color="#fff">Terapkan</Text></Center></TouchableOpacity>
              </HStack>
            </VStack>
          </ScrollView>
        </Animated.View>
      </Box>
    </Modal>
  );
}

export default function AttendanceHistoryMonthlyScreen() {
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const isDark = mode === 'dark';
  const authUser = useSelector(state => state.auth?.user || null);
  const authKaryawan = useSelector(state => state.auth?.karyawan || state.auth?.user?.karyawan || null);
  const rawCabangList = useSelector(state => state.cabang?.data);
  const rawKaryawanList = useSelector(state => state.karyawan?.data);
  const cabangList = useMemo(() => rawCabangList || [], [rawCabangList]);
  const karyawanList = useMemo(() => rawKaryawanList || [], [rawKaryawanList]);
  const t = useThemeTokens(isDark);
  const usertype = String(authUser?.usertype || '').toLowerCase();
  const canUseFilter = FILTER_ALLOWED_USERTYPES.includes(usertype);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filter, setFilter] = useState({ ...EMPTY_FILTER });
  const [draftFilter, setDraftFilter] = useState({ ...EMPTY_FILTER });
  const [bisnisList, setBisnisList] = useState([]);
  const [monthData, setMonthData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!canUseFilter) return;
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      if (!Array.isArray(karyawanList) || karyawanList.length === 0) dispatch(getKaryawan());
      if (!Array.isArray(cabangList) || cabangList.length === 0) dispatch(getCabang());
      (async () => {
        try {
          const resp = await apiClient.get(API_ENDPOINTS.BISNIS_UNIT.LIST);
          const rows = resp.data?.rows || resp.data?.data || [];
          if (isMounted) setBisnisList(Array.isArray(rows) ? rows : []);
        } catch (err) {
          console.warn('[AttendanceHistory] fetch bisnis unit failed:', err?.message || err);
        }
      })();
    }, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [canUseFilter, dispatch, cabangList, karyawanList]);

  const bisnisOptions = useMemo(() => (bisnisList || []).map(item => {
    const id = item.id?.toString();
    if (!id) return null;
    return { id, nama: item.nama || item.name || item.initial || `Bisnis ${id}`, subtitle: item.initial || item.kode || '' };
  }).filter(Boolean), [bisnisList]);

  const siteOptions = useMemo(() => {
    let list = Array.isArray(cabangList) ? cabangList : [];
    if (draftFilter.bisnis_id) {
      list = list.filter(c => {
        const cBid = c.bisnis_id ?? c.bisnis?.id ?? c.bisnis_unit_id ?? c.bisnis_unit?.id;
        return cBid != null && String(cBid) === String(draftFilter.bisnis_id);
      });
    }
    return list.map(item => {
      const id = item.id?.toString();
      if (!id) return null;
      const bisnisName = item.bisnis?.nama || item.bisnis?.name || item.bisnis_unit?.nama || item.nama_bisnis || '';
      return { id, nama: item.nama || item.name || `Site ${id}`, subtitle: [item.area || '', bisnisName].filter(Boolean).join(' · '), bisnis_id: item.bisnis_id ?? item.bisnis?.id ?? item.bisnis_unit_id ?? item.bisnis_unit?.id ?? null };
    }).filter(Boolean);
  }, [cabangList, draftFilter.bisnis_id]);

  const karyawanOptions = useMemo(() => {
    let rows = Array.isArray(karyawanList) ? karyawanList : karyawanList?.rows || [];
    const activeSite = draftFilter.site_id;
    const activeBisnis = draftFilter.bisnis_id;
    if (activeSite) {
      rows = rows.filter(k => {
        const kidSite = k.cabang_id ?? k.site_id ?? k.cabang?.id ?? k.site?.id ?? null;
        return kidSite != null && String(kidSite) === String(activeSite);
      });
    } else if (activeBisnis) {
      const siteIds = (Array.isArray(cabangList) ? cabangList : []).filter(c => {
        const cBid = c.bisnis_id ?? c.bisnis?.id ?? c.bisnis_unit_id ?? c.bisnis_unit?.id;
        return cBid != null && String(cBid) === String(activeBisnis);
      }).map(c => String(c.id));
      if (siteIds.length > 0) {
        rows = rows.filter(k => {
          const kidSite = k.cabang_id ?? k.site_id ?? k.cabang?.id ?? k.site?.id;
          return kidSite != null && siteIds.includes(String(kidSite));
        });
      }
    }
    return rows.map(item => {
      const id = item.id?.toString();
      if (!id) return null;
      return { id, nama: item.nama || item.name || `Karyawan ${id}`, subtitle: [item.pin ? `PIN ${item.pin}` : '', item.nik || '', item.section || ''].filter(Boolean).join(' · '), pin: item.pin, raw: item };
    }).filter(Boolean).sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }));
  }, [karyawanList, cabangList, draftFilter.site_id, draftFilter.bisnis_id]);

  const selectedFilterKaryawan = useMemo(() => {
    if (!filter.karyawan_id) return null;
    const found = (Array.isArray(karyawanList) ? karyawanList : []).find(k => String(k.id) === String(filter.karyawan_id));
    return found || { id: filter.karyawan_id, nama: `Karyawan #${filter.karyawan_id}` };
  }, [filter.karyawan_id, karyawanList]);

  const activeKaryawanForData = canUseFilter && selectedFilterKaryawan ? selectedFilterKaryawan : authKaryawan;
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filter.bisnis_id) n += 1;
    if (filter.site_id) n += 1;
    if (filter.karyawan_id) n += 1;
    return n;
  }, [filter]);

  const openFilterSheet = () => {
    setDraftFilter({ ...filter });
    setFilterSheetVisible(true);
  };

  const handleApplyFilter = next => {
    setFilter({ bisnis_id: next.bisnis_id || null, site_id: next.site_id || null, karyawan_id: next.karyawan_id || null });
  };

  const handleResetFilter = () => {
    setDraftFilter({ ...EMPTY_FILTER });
    setFilter({ ...EMPTY_FILTER });
  };

  const filterChipLabels = useMemo(() => {
    const chips = [];
    if (filter.bisnis_id) {
      const b = bisnisOptions.find(x => String(x.id) === String(filter.bisnis_id));
      chips.push({ key: 'bisnis_id', label: b?.nama || `Bisnis #${filter.bisnis_id}` });
    }
    if (filter.site_id) {
      const s = (Array.isArray(cabangList) ? cabangList : []).find(x => String(x.id) === String(filter.site_id));
      chips.push({ key: 'site_id', label: s?.nama || `Site #${filter.site_id}` });
    }
    if (filter.karyawan_id) {
      chips.push({ key: 'karyawan_id', label: selectedFilterKaryawan?.nama || `Karyawan #${filter.karyawan_id}` });
    }
    return chips;
  }, [filter, bisnisOptions, cabangList, selectedFilterKaryawan]);

  const gallery = useMemo(() => {
    if (!selectedDay) return [];
    const list = [];
    if (selectedDay.photo_in) list.push({ uri: selectedDay.photo_in, label: 'Foto Masuk' });
    if (selectedDay.photo_out) list.push({ uri: selectedDay.photo_out, label: 'Foto Pulang' });
    return list;
  }, [selectedDay]);

  const fetchMonthlyHris = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = { month: selectedMonth };
      if (filter.karyawan_id) params.karyawan_id = filter.karyawan_id;
      else if (authKaryawan?.id) params.karyawan_id = authKaryawan.id;
      if (filter.site_id) params.site_id = filter.site_id;
      if (filter.bisnis_id) params.bisnis_id = filter.bisnis_id;
      const resp = await apiClient.get(API_ENDPOINTS.ATTENDANCE.MONTHLY_HRIS, { params });
      if (resp.data?.diagnostic?.error) throw new Error(resp.data.diagnostic.message || 'Gagal memuat data kehadiran');
      const payload = normalizeMonthlyPayload(resp.data?.data || resp.data);
      if (!payload?.calendar || !payload?.summary) throw new Error('Format data kehadiran bulanan tidak valid');
      setMonthData(payload);
    } catch (err) {
      console.error('[AttendanceHistory] HRIS fetch failed:', err?.message || err);
      setMonthData(null);
      setFetchError(err?.response?.data?.diagnostic?.message || err?.response?.data?.message || err?.message || 'Gagal memuat data kehadiran bulanan');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, filter, authKaryawan]);

  useEffect(() => {
    fetchMonthlyHris();
  }, [fetchMonthlyHris]);

  const handlePreviousMonth = () => setSelectedMonth(moment(selectedMonth, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
  const handleNextMonth = () => {
    const next = moment(selectedMonth, 'YYYY-MM').add(1, 'month');
    if (next.isSameOrBefore(moment(), 'month')) setSelectedMonth(next.format('YYYY-MM'));
  };
  const handleDayPress = dayData => {
    const fromMap = dayData?.date && monthData?.detailsByDate?.[dayData.date];
    const detail = fromMap || dayData || null;
    if (detail) setSelectedDay({ ...detail, photo_in: resolvePhotoUri(detail.photo_in), photo_out: resolvePhotoUri(detail.photo_out) });
    else setSelectedDay(null);
    setDetailVisible(true);
  };
  const openPreview = uri => {
    const resolved = resolvePhotoUri(uri);
    if (!resolved) return;
    const idx = gallery.findIndex(g => g.uri === resolved);
    setPreviewIndex(idx >= 0 ? idx : 0);
    setPreviewVisible(true);
  };

  const s = monthData?.summary || { hadir: 0, terlambat: 0, cuti: 0, izin: 0, sakit: 0, absen: 0, libur: 0, totalHariKerja: 0, persentaseKehadiran: 0 };
  const displayKaryawan = monthData?.karyawan || activeKaryawanForData || { nama: 'Karyawan', pin: '-' };

  return (
    <AppScreen>
      <VStack h="full" bg={t.pageBg}>
        <HeaderScreen title="Absensi Bulanan" showBack onThemes onNotification onFilter={canUseFilter ? openFilterSheet : undefined} />
        <ScrollView style={{ backgroundColor: t.pageBg }} contentContainerStyle={{ padding: 14, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMonthlyHris} tintColor={t.text} />} showsVerticalScrollIndicator={false}>
          {canUseFilter ? (
            <HStack mb={3} alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
              <TouchableOpacity onPress={openFilterSheet} activeOpacity={0.85}>
                <HStack px={3} py={2} rounded="full" alignItems="center" space={1.5} bg={activeFilterCount > 0 ? (isDark ? 'rgba(96,165,250,0.2)' : 'rgba(37,99,235,0.12)') : t.cardBg} borderWidth={1} borderColor={activeFilterCount > 0 ? t.accent : t.border}><FilterSearch size={14} color={activeFilterCount > 0 ? t.accent : t.muted} variant="Bold" /><Text fontSize={11} fontFamily="Quicksand-Bold" color={activeFilterCount > 0 ? t.accent : t.muted}>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</Text></HStack>
              </TouchableOpacity>
              {filterChipLabels.map(chip => <Box key={chip.key} px={2.5} py={1.5} rounded="full" bg={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'} borderWidth={1} borderColor={t.border}><Text fontSize={11} fontFamily="Poppins-Regular" color={t.text} numberOfLines={1}>{chip.label}</Text></Box>)}
              {activeFilterCount > 0 ? <TouchableOpacity onPress={handleResetFilter} hitSlop={8}><Text fontSize={11} fontFamily="Quicksand-Bold" color={STATUS_META.absen.color}>Hapus</Text></TouchableOpacity> : null}
            </HStack>
          ) : null}

          <HStack mb={3} p={3.5} rounded="2xl" bg={t.cardBg} borderWidth={1} borderColor={t.border} alignItems="center" space={3} style={styles.cardShadow}>
            <Center w={12} h={12} rounded="full" bg={isDark ? 'rgba(96,165,250,0.18)' : 'rgba(37,99,235,0.12)'}><Profile size={26} color={t.accent} variant="Bulk" /></Center>
            <VStack flex={1}><Text fontSize={15} fontFamily="Quicksand-Bold" color={t.text} numberOfLines={1}>{displayKaryawan?.nama || 'Karyawan'}</Text><Text fontSize={12} fontFamily="Poppins-Regular" color={t.muted}>PIN {displayKaryawan?.pin || '-'} · {monthData?.monthName || selectedMonth}</Text></VStack>
            <VStack alignItems="flex-end"><Text fontSize={20} fontFamily="Quicksand-Bold" color={t.accent}>{s.persentaseKehadiran}%</Text><Text fontSize={10} fontFamily="Poppins-Regular" color={t.muted}>kehadiran</Text></VStack>
          </HStack>

          <HStack mb={3} p={2} rounded="2xl" bg={t.cardBg} borderWidth={1} borderColor={t.border} alignItems="center" justifyContent="space-between" style={styles.cardShadow}>
            <TouchableOpacity onPress={handlePreviousMonth} hitSlop={12} style={styles.navBtn}><ArrowLeft2 size={22} color={t.text} variant="Bold" /></TouchableOpacity>
            <HStack alignItems="center" space={2}><CalendarIcon size={18} color={t.accent} variant="Bulk" /><Text fontSize={16} fontFamily="Quicksand-Bold" color={t.text}>{moment(selectedMonth, 'YYYY-MM').locale('id').format('MMMM YYYY')}</Text></HStack>
            <TouchableOpacity onPress={handleNextMonth} disabled={moment(selectedMonth, 'YYYY-MM').isSame(moment(), 'month')} hitSlop={12} style={[styles.navBtn, moment(selectedMonth, 'YYYY-MM').isSame(moment(), 'month') && { opacity: 0.35 }]}><ArrowRight2 size={22} color={t.text} variant="Bold" /></TouchableOpacity>
          </HStack>

          <HStack flexWrap="wrap" mb={2} space={2} style={{ rowGap: 8 }}>
            <StatPill label="Hadir" value={s.hadir} color={STATUS_META.hadir.color} isDark={isDark} />
            <StatPill label="Terlambat" value={s.terlambat} color={STATUS_META.terlambat.color} isDark={isDark} />
            <StatPill label="Alpha" value={s.absen} color={STATUS_META.absen.color} isDark={isDark} />
          </HStack>
          <HStack flexWrap="wrap" mb={3} space={2} style={{ rowGap: 8 }}>
            <StatPill label="Cuti" value={s.cuti} color={STATUS_META.cuti.color} isDark={isDark} />
            <StatPill label="Izin" value={s.izin} color={STATUS_META.izin.color} isDark={isDark} />
            <StatPill label="Sakit" value={s.sakit} color={STATUS_META.sakit.color} isDark={isDark} />
          </HStack>

          <Box mb={3} p={4} rounded="2xl" bg={t.cardBg} borderWidth={1} borderColor={t.border} style={styles.cardShadow}><HStack alignItems="center" justifyContent="space-between"><VStack space={1} flex={1} pr={3}><Text fontSize={13} fontFamily="Quicksand-Bold" color={t.text}>Ringkasan bulan ini</Text><Text fontSize={12} fontFamily="Poppins-Regular" color={t.muted}>{s.hadir + s.terlambat} hari hadir dari {s.totalHariKerja} hari kerja</Text><HStack mt={2} space={3} flexWrap="wrap"><HStack alignItems="center" space={1}><TickCircle size={14} color={STATUS_META.hadir.color} variant="Bold" /><Text fontSize={11} color={t.muted} fontFamily="Poppins-Regular">On-time {s.hadir}</Text></HStack><HStack alignItems="center" space={1}><Warning2 size={14} color={STATUS_META.terlambat.color} variant="Bold" /><Text fontSize={11} color={t.muted} fontFamily="Poppins-Regular">Telat {s.terlambat}</Text></HStack></HStack></VStack><Center w={20} h={20} rounded="full" borderWidth={6} borderColor={t.accent} bg={isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.08)'}><Text fontSize={16} fontFamily="Quicksand-Bold" color={t.accent}>{s.persentaseKehadiran}%</Text></Center></HStack></Box>

          {loading ? (
            <Center py={12}><LoadingHauler message="Memuat kehadiran bulanan..." type="default" /></Center>
          ) : fetchError ? (
            <Center py={12} px={4}><InfoCircle size={36} color={STATUS_META.absen.color} variant="Bulk" /><Text mt={3} fontFamily="Quicksand-Bold" color={t.text} textAlign="center">Gagal memuat data</Text><Text mt={1} fontSize={12} fontFamily="Poppins-Regular" color={t.muted} textAlign="center">{fetchError}</Text><TouchableOpacity onPress={fetchMonthlyHris} style={{ marginTop: 16 }}><Box px={5} py={2.5} rounded="xl" bg={t.accent}><Text color="#fff" fontFamily="Quicksand-Bold">Coba lagi</Text></Box></TouchableOpacity></Center>
          ) : !monthData ? (
            <Center py={12}><Text fontFamily="Poppins-Regular" color={t.muted}>Tidak ada data kehadiran</Text></Center>
          ) : (
            <MonthCalendarGrid calendar={monthData.calendar || []} monthKey={selectedMonth} isDark={isDark} onDayPress={handleDayPress} t={t} />
          )}
        </ScrollView>

        {detailVisible ? <DetailModal visible={detailVisible} onClose={() => setDetailVisible(false)} dayData={selectedDay} isDark={isDark} onPreviewPhoto={openPreview} /> : null}
        {canUseFilter && filterSheetVisible ? <AttendanceFilterSheet visible={filterSheetVisible} onClose={() => setFilterSheetVisible(false)} isDark={isDark} draft={draftFilter} setDraft={setDraftFilter} onApply={handleApplyFilter} onReset={() => { handleResetFilter(); setFilterSheetVisible(false); }} bisnisOptions={bisnisOptions} siteOptions={siteOptions} karyawanOptions={karyawanOptions} /> : null}
        {previewVisible && gallery.length > 0 ? (
          <ImageViewing images={gallery} imageIndex={previewIndex} visible={previewVisible} onRequestClose={() => setPreviewVisible(false)} swipeToCloseEnabled doubleTapToZoomEnabled presentationStyle="overFullScreen" backgroundColor="rgba(0,0,0,0.95)"
            HeaderComponent={({ imageIndex }) => (<HStack px={4} pt={12} pb={2} alignItems="center" justifyContent="space-between" bg="rgba(0,0,0,0.4)"><VStack><Text color="#fff" fontSize={14} fontFamily="Quicksand-Bold">{gallery[imageIndex]?.label || 'Foto'}</Text><Text color="rgba(255,255,255,0.7)" fontSize={11} fontFamily="Poppins-Regular">{selectedDay?.karyawan?.nama || ''}</Text></VStack><TouchableOpacity onPress={() => setPreviewVisible(false)}><Box px={3} py={1.5} rounded="full" bg="rgba(255,255,255,0.15)"><Text color="#fff" fontSize={12} fontFamily="Quicksand-SemiBold">Tutup</Text></Box></TouchableOpacity></HStack>)}
            FooterComponent={({ imageIndex }) => (<HStack position="absolute" bottom={10} alignSelf="center" bg="rgba(0,0,0,0.55)" px={4} py={1.5} rounded="full"><Text color="#fff" fontSize={12} fontFamily="Poppins-Regular">{(imageIndex ?? 0) + 1} / {gallery.length || 1}</Text></HStack>)}
          />
        ) : null}
      </VStack>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailPhoto: {
    width: '100%',
    height: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});
