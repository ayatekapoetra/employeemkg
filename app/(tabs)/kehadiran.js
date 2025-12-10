import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { VStack } from 'native-base';
import { AppScreen, HeaderScreen, LoadingHauler, NoData } from '../../src/components/common';
import { useSelector } from 'react-redux';
import moment from 'moment';
import FilterAbsensi from '../../src/features/attendance/components/FilterAbsensi';
import ListAbsensi from '../../src/features/attendance/components/ListAbsensi';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';

export default function KehadiranScreen() {
  const { user } = useSelector(state => state.auth);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAbsensi, setFilterAbsensi] = useState(false);
  const [filter, setFilter] = useState({
    karyawan_id: user?.karyawan?.id,
    karyawan: user?.karyawan,
    dateStart: moment().add(-1, 'month').format('YYYY-MM-DD'),
    dateEnd: moment().format('YYYY-MM-DD'),
    verify_sts: '',
    approve_sts: '',
  });

  useEffect(() => {
    getDataFetch(filter);
  }, []);

  const getDataFetch = async (params) => {
    try {
      setLoading(true);
      console.log('Fetching attendance data...', params);
      const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.DAILY, { params });
      const data = response.data?.data || response.data || [];
      setAttendanceHistory(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const onFilterHandle = () => {
    setFilterAbsensi(!filterAbsensi);
  };

  const onApplyFilter = async () => {
    await getDataFetch(filter);
    setFilterAbsensi(!filterAbsensi);
  };

  const onRefreshHandle = async () => {
    await getDataFetch(filter);
  };

  const onShowDetails = (item) => {
    console.log('Show details:', item);
  };

  if (loading) {
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
        <VStack px={3} flex={1}>
          <VStack flex={1}>
            {filterAbsensi ? (
              <FilterAbsensi
                onApplyFilter={onApplyFilter}
                setFilter={setFilterAbsensi}
                qstring={filter}
                setQstring={setFilter}
              />
            ) : (
              <>
                {attendanceHistory && attendanceHistory.length > 0 ? (
                  <FlatList
                    data={attendanceHistory}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefreshHandle} />}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <ListAbsensi item={item} onPress={onShowDetails} />}
                  />
                ) : (
                  <NoData title="Maaf, data tidak ditemukan" subtitle="Gunakan filter untuk mencari data" />
                )}
              </>
            )}
          </VStack>
        </VStack>
      </VStack>
    </AppScreen>
  );
}
