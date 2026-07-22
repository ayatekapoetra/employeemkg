import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, RefreshControl } from 'react-native';
import { VStack, Text, HStack, Box } from 'native-base';
import { AppScreen, HeaderScreen, LoadingHauler, NoData } from '../../src/components/common';
import { useSelector } from 'react-redux';
import moment from 'moment';
import 'moment/locale/id';
import FilterAbsensi from '../../src/features/attendance/components/FilterAbsensi';
import ListAbsensi from '../../src/features/attendance/components/ListAbsensi';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';
import { COLORS } from '../../src/constants/colors';

moment.locale('id');

function buildDefaultFilter(user, authKaryawan) {
  const karyawan = authKaryawan || user?.karyawan || null;
  return {
    karyawan_id: karyawan?.id || null,
    karyawan,
    dateStart: moment().startOf('month').format('YYYY-MM-DD'),
    dateEnd: moment().format('YYYY-MM-DD'),
    verify_sts: '',
    approve_sts: '',
  };
}

export default function KehadiranScreen() {
  const { user, karyawan: authKaryawan } = useSelector(state => state.auth) || {};
  const mode = useSelector(state => state.themes)?.value || 'light';
  const sectionBg = mode === 'dark' ? '#1e2030' : '#f1f5f9';
  const headerMuted = mode === 'dark' ? COLORS.teks.dark[2] : COLORS.teks.light[2];
  const headerText = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const chipBg = mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.1)';
  const chipText = mode === 'dark' ? '#93c5fd' : '#1d4ed8';

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAbsensi, setFilterAbsensi] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filter, setFilter] = useState(() => buildDefaultFilter(user, authKaryawan));

  // Sinkron default karyawan saat auth siap (login async)
  useEffect(() => {
    if (!filter.karyawan_id && (authKaryawan?.id || user?.karyawan?.id)) {
      setFilter(prev => ({
        ...prev,
        karyawan_id: authKaryawan?.id || user?.karyawan?.id,
        karyawan: authKaryawan || user?.karyawan || prev.karyawan,
      }));
    }
  }, [authKaryawan?.id, user?.karyawan?.id]);

  const sections = useMemo(() => {
    const groups = attendanceHistory.reduce((acc, it) => {
      const d = it.date_ops || '';
      if (!acc[d]) acc[d] = [];
      acc[d].push(it);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => {
        const m = moment(date).locale('id');
        return {
          title: date,
          titleLabel: m.isValid() ? m.format('dddd, DD MMMM YYYY') : date,
          monthLabel: m.isValid() ? m.format('MMMM YYYY') : '',
          count: groups[date].length,
          data: groups[date],
        };
      });
  }, [attendanceHistory]);

  const getDataFetch = useCallback(async params => {
    const karyawanId =
      params?.karyawan_id ||
      params?.karyawan?.id ||
      authKaryawan?.id ||
      user?.karyawan?.id ||
      null;

    const dateStart = params?.dateStart || moment().startOf('month').format('YYYY-MM-DD');
    const dateEnd = params?.dateEnd || moment().format('YYYY-MM-DD');

    if (!karyawanId) {
      setAttendanceHistory([]);
      setErrorMsg('Data karyawan tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const queryParams = {
        karyawan_id: karyawanId,
        page: 1,
        // HRIS mengembalikan scan per baris; pakai limit lebih besar agar range tanggal ter-cover
        limit: 500,
        perPage: 500,
        from: dateStart,
        to: dateEnd,
        startdate: dateStart,
        enddate: dateEnd,
      };

      console.log('[Kehadiran] fetch params:', queryParams);

      const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.DAILY, { params: queryParams });

      if (response.data?.diagnostic?.error) {
        throw new Error(response.data.diagnostic.message || 'Gagal memuat data kehadiran');
      }

      const rows = response.data?.rows || response.data?.data || [];
      setAttendanceHistory(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('[Kehadiran] fetch error:', error?.message || error);
      setAttendanceHistory([]);
      setErrorMsg(
        error?.response?.data?.diagnostic?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Gagal memuat data kehadiran'
      );
    } finally {
      setLoading(false);
    }
  }, [authKaryawan?.id, user?.karyawan?.id]);

  // Initial load + reload saat karyawan auth tersedia
  useEffect(() => {
    const karyawanId = filter.karyawan_id || authKaryawan?.id || user?.karyawan?.id;
    if (karyawanId) {
      getDataFetch({
        ...filter,
        karyawan_id: karyawanId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authKaryawan?.id, user?.karyawan?.id]);

  const onFilterHandle = () => {
    setFilterAbsensi(prev => !prev);
  };

  /**
   * Apply filter — terima override agar tidak stale state
   * (FilterAbsensi memanggil ini setelah setQstring / reset)
   */
  const onApplyFilter = async (overrideFilter = null) => {
    const next = overrideFilter
      ? { ...filter, ...overrideFilter }
      : { ...filter };

    // pastikan karyawan_id selalu sinkron dengan object karyawan
    next.karyawan_id =
      next.karyawan_id ||
      next.karyawan?.id ||
      authKaryawan?.id ||
      user?.karyawan?.id ||
      null;

    setFilter(next);
    setFilterAbsensi(false);
    await getDataFetch(next);
  };

  const onRefreshHandle = async () => {
    await getDataFetch(filter);
  };

  const onShowDetails = item => {
    console.log('Show details:', item);
  };

  const renderSectionHeader = ({ section }) => (
    <HStack
      px={1}
      pt={3}
      pb={1.5}
      alignItems="center"
      justifyContent="space-between"
      bg={sectionBg}
    >
      <VStack>
        <Text fontSize={13} fontFamily="Quicksand-Bold" color={headerText}>
          {section.titleLabel}
        </Text>
        {section.monthLabel ? (
          <Text fontSize={11} fontFamily="Poppins-Regular" color={headerMuted}>
            {section.monthLabel}
          </Text>
        ) : null}
      </VStack>
      <Box px={2.5} py={1} rounded="full" bg={chipBg}>
        <Text fontSize={11} fontFamily="Quicksand-SemiBold" color={chipText}>
          {section.count} catatan
        </Text>
      </Box>
    </HStack>
  );

  if (loading && attendanceHistory.length === 0 && !filterAbsensi) {
    return (
      <AppScreen>
        <VStack h="full">
          <HeaderScreen title="Riwayat Kehadiran Harian" onThemes onFilter={onFilterHandle} onNotification />
          <LoadingHauler />
        </VStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <VStack h="full">
        <HeaderScreen title="Riwayat Kehadiran Harian" onThemes onFilter={onFilterHandle} onNotification />
        <VStack px={3} flex={1} bg={sectionBg}>
          <VStack flex={1}>
            {filterAbsensi ? (
              <FilterAbsensi
                onApplyFilter={onApplyFilter}
                setFilter={setFilterAbsensi}
                qstring={filter}
                setQstring={setFilter}
              />
            ) : loading && attendanceHistory.length === 0 ? (
              <LoadingHauler />
            ) : attendanceHistory && attendanceHistory.length > 0 ? (
              <SectionList
                sections={sections}
                keyExtractor={(item, index) => String(item.id ?? `${item.date_ops}-${index}`)}
                renderItem={({ item }) => <ListAbsensi item={item} onPress={onShowDetails} />}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: sectionBg }}
                contentContainerStyle={{ paddingBottom: 28, backgroundColor: sectionBg }}
                refreshControl={
                  <RefreshControl
                    refreshing={loading}
                    onRefresh={onRefreshHandle}
                    tintColor={mode === 'dark' ? '#F5F5F5' : '#2f313e'}
                  />
                }
              />
            ) : (
              <NoData
                title="Maaf, data tidak ditemukan"
                subtitle={errorMsg || 'Gunakan filter untuk mencari data'}
              />
            )}
          </VStack>
        </VStack>
      </VStack>
    </AppScreen>
  );
}
