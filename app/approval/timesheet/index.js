import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { VStack, HStack, Text, Badge, Pressable, Center, Spinner, useToast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import { getPenyewa } from '../../../src/store/slices/penyewaSlice';
import { getEquipment } from '../../../src/store/slices/equipmentSlice';
import { getShift } from '../../../src/store/slices/shiftSlice';
import { getOprDrv } from '../../../src/store/slices/oprdrvSlice';
import { Calendar, Clock, User, TruckFast, Filter } from 'iconsax-react-native';
import { View, RefreshControl, FlatList } from 'react-native';
import moment from 'moment';
import 'moment/locale/id';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';
import FilterTimesheetModal from '../../../src/features/approval/components/FilterTimesheetModal';

moment.locale('id');

const mergeUniqueTimesheets = (currentItems, incomingItems) => {
  const seen = new Set();

  return [...currentItems, ...incomingItems].filter((item, index) => {
    const uniqueKey = item?.id != null
      ? `id-${item.id}`
      : `fallback-${item?.kode || 'unknown'}-${item?.date_ops || item?.tanggal || index}`;

    if (seen.has(uniqueKey)) {
      return false;
    }

    seen.add(uniqueKey);
    return true;
  });
};

export default function ApprovalTimesheet() {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [approvalList, setApprovalList] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    status: 'W',
    startdate: '',
    enddate: '',
    penyewa_id: '',
    equipment_id: '',
    shift_id: '',
    karyawan_id: '',
  });
  const [tempFilter, setTempFilter] = useState({
    status: 'W',
    startdate: moment().startOf('month').format('YYYY-MM-DD'),
    enddate: moment().endOf('month').format('YYYY-MM-DD'),
    penyewa_id: '',
    equipment_id: '',
    shift_id: '',
    karyawan_id: '',
  });

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const ITEMS_PER_PAGE = 25;

  const buildQueryParams = useCallback((pageNum = 1) => {
    const params = {
      ...filterParams,
      page: pageNum,
      perPage: ITEMS_PER_PAGE,
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }, [filterParams]);

  const buildQueryString = useCallback((pageNum = 1) => {
    const params = buildQueryParams(pageNum);
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return searchParams.toString();
  }, [buildQueryParams]);

  const fetchCount = useCallback(async () => {
    try {
      const params = buildQueryParams();
      delete params.page;
      delete params.perPage;

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });

      const response = await apiClient.get(`${API_ENDPOINTS.TIMESHEET.APPROVAL_LIST_COUNT}?${searchParams.toString()}`);
      const count = response.data?.count || 0;
      setPendingCount(count);
    } catch {
      // Keep existing count if count API fails.
    }
  }, [buildQueryParams]);

  const fetchApprovals = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const queryString = buildQueryString(pageNum);
        const response = await apiClient.get(`${API_ENDPOINTS.TIMESHEET.APPROVAL_LIST}?${queryString}`);
        const rows = response.data?.rows;
        const data = response.data?.data || rows?.data || rows || [];
        const currentPage = rows?.page || pageNum;
        const hasNextPage = rows?.lastPage
          ? currentPage < rows.lastPage
          : data.length === ITEMS_PER_PAGE;

        if (isLoadMore) {
          setApprovalList(prev => mergeUniqueTimesheets(prev, data));
        } else {
          setApprovalList(data);
        }

        setPage(currentPage);
        setHasMore(hasNextPage);
      } catch {
        // Fallback data for development
        const fallbackData = [
          {
            id: 1,
            kode: 'TS-2024-001',
            tanggal: moment().format('YYYY-MM-DD'),
            date_ops: moment().format('YYYY-MM-DD'),
            starttime: moment().set({hour: 7, minute: 0}).toISOString(),
            endtime: moment().set({hour: 15, minute: 0}).toISOString(),
            status: 'W',
            karyawan: {
              id: 1,
              nama: 'Ahmad Sopir DT-001',
            },
            penyewa: {
              id: 1,
              nama: 'PT Maju Jaya Mining',
            },
            equipment: {
              id: 1,
              kode: 'DT-001',
              model: 'Hino Ranger',
            },
            shift: {
              id: 1,
              nama: 'Shift 1 (Pagi)',
            },
          },
        ];

        if (pageNum === 1) {
          setApprovalList(fallbackData);
          setPage(1);
          setHasMore(false);
        }

        toast.show({
          description: 'Menggunakan data fallback - Backend error',
          duration: 2000,
          bg: 'orange.500',
        });
      }
    } catch {
      if (!isLoadMore) {
        setApprovalList([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [buildQueryString, toast]);

  useEffect(() => {
    // Load master data for filters
    dispatch(getPenyewa());
    dispatch(getEquipment());
    dispatch(getShift());
    dispatch(getOprDrv());
  }, [dispatch]);

  useEffect(() => {
    // Initialize karyawan_id with active user on mount
    if (user?.karyawan?.id) {
      const activeKaryawanId = user.karyawan.id.toString();
      setFilterParams(prev => ({
        ...prev,
        karyawan_id: activeKaryawanId,
      }));
      setTempFilter(prev => ({
        ...prev,
        karyawan_id: activeKaryawanId,
      }));
    }
  }, [user?.karyawan?.id]);

  useEffect(() => {
    // Fetch approvals whenever filterParams changes
    setPage(1);
    setHasMore(true);
    fetchApprovals(1, false);
    fetchCount();
  }, [filterParams, fetchApprovals, fetchCount]);



  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchApprovals(1, false);
    fetchCount();
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore || approvalList.length === 0) {
      return;
    }

    fetchApprovals(page + 1, true);
  };

  const handleOpenFilter = () => {
    setTempFilter({ ...filterParams });
    setShowFilter(true);
  };

  const handleApplyFilter = () => {
    // Copy tempFilter to filterParams
    const appliedFilter = {
      ...tempFilter,
      startdate: tempFilter.startdate,
      enddate: tempFilter.enddate,
    };

    setFilterParams(appliedFilter);
    setShowFilter(false);
  };

  const handleClearFilter = useCallback(() => {
    const activeKaryawanId = user?.karyawan?.id?.toString() || '';

    const defaultFilterParams = {
      status: 'W',
      startdate: '',
      enddate: '',
      penyewa_id: '',
      equipment_id: '',
      shift_id: '',
      karyawan_id: activeKaryawanId,
    };
    const defaultTempFilter = {
      status: 'W',
      startdate: moment().startOf('month').format('YYYY-MM-DD'),
      enddate: moment().endOf('month').format('YYYY-MM-DD'),
      penyewa_id: '',
      equipment_id: '',
      shift_id: '',
      karyawan_id: activeKaryawanId,
    };

    setTempFilter(defaultTempFilter);
    setFilterParams(defaultFilterParams);
    setShowFilter(false);
  }, [user?.karyawan?.id]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterParams.penyewa_id) count++;
    if (filterParams.equipment_id) count++;
    if (filterParams.shift_id) count++;
    if (filterParams.karyawan_id) count++;
    if (filterParams.startdate || filterParams.enddate) count++;
    return count;
  };

  const calculateHours = (starttime, endtime) => {
    if (!starttime || !endtime) return 0;
    const start = moment(starttime);
    const end = moment(endtime);
    const duration = moment.duration(end.diff(start));
    return duration.asHours().toFixed(1);
  };

  const handleCardPress = (item) => {
    router.push({
      pathname: '/approval/timesheet/detail',
      params: { id: item.id }
    });
  };

  const renderTimesheetCard = (item) => {
    const hours = calculateHours(item.starttime, item.endtime);

    return (
      <Pressable
        onPress={() => handleCardPress(item)}
        _pressed={{ opacity: 0.7 }}
      >
        <VStack
          bg={cardBg}
          p={4}
          rounded="xl"
          borderWidth={1}
          borderColor={cardBorder}
          shadow={2}
          space={3}
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack space={3} flex={1}>
            <View
              style={{
                backgroundColor: mode === 'dark' ? '#374151' : '#dbeafe',
                padding: 10,
                borderRadius: 12,
              }}
            >
              <User size={24} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} variant="Bold" />
            </View>

            <VStack flex={1}>
              <Text
                fontSize="md"
                fontFamily="Quicksand-Bold"
                color={textColor}
                numberOfLines={1}
              >
                {item.karyawan?.nama || '-'}
              </Text>
              <Text
                fontSize="xs"
                fontFamily="Poppins-Light"
                color={subtitleColor}
                numberOfLines={1}
              >
                {item.penyewa?.nama || '-'}
              </Text>
            </VStack>
          </HStack>

          <Badge
            colorScheme="warning"
            rounded="md"
            variant="subtle"
            _text={{
              fontSize: 10,
              fontFamily: 'Quicksand-SemiBold',
            }}
          >
            PENDING
          </Badge>
        </HStack>

        <VStack space={2}>
          <HStack space={2} alignItems="center">
            <Calendar size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {moment(item.tanggal || item.date_ops).format('dddd, DD MMMM YYYY')}
            </Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <TruckFast size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {item.equipment?.kode || '-'} • {item.shift?.nama || '-'}
            </Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <Clock size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {moment(item.starttime).format('HH:mm')} - {moment(item.endtime).format('HH:mm')} ({hours} jam)
            </Text>
          </HStack>

          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} italic>
            Kode: {item.kode || '-'}
          </Text>
        </VStack>
      </VStack>
      </Pressable>
    );
  };

  return (
    <AppScreen>
      <HeaderScreen 
        title="Approval Timesheet" 
        onBack={() => router.back()} 
        onThemes={true}
        onNotification={true}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          data={approvalList}
          renderItem={({ item }) => renderTimesheetCard(item)}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          style={{ backgroundColor }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ItemSeparatorComponent={() => <VStack h={3} />}
          ListHeaderComponent={
            <VStack
              space={4}
              mb={4}
            >
              <VStack
                bg={mode === 'dark' ? '#1e3a8a' : '#dbeafe'}
                p={4}
                rounded="xl"
                borderWidth={1}
                borderColor={mode === 'dark' ? '#1e40af' : '#bfdbfe'}
              >
                <HStack alignItems="center" justifyContent="space-between">
                  <VStack flex={1}>
                    <Text
                      fontSize="xs"
                      fontFamily="Poppins-Light"
                      color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}
                    >
                      Menunggu Persetujuan
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontFamily="Quicksand-Bold"
                      color={mode === 'dark' ? '#ffffff' : '#1e3a8a'}
                    >
                      {pendingCount}
                    </Text>
                  </VStack>
                  <HStack px={4} py={2} justifyContent="flex-end">
                    <Pressable
                      onPress={handleOpenFilter}
                      bg={getActiveFilterCount() > 0 ? (mode === 'dark' ? '#3b82f6' : '#2563eb') : 'transparent'}
                      borderWidth={1}
                      borderColor={mode === 'dark' ? '#3b82f6' : '#2563eb'}
                      px={3}
                      py={2}
                      rounded="lg"
                      flexDirection="row"
                      alignItems="center"
                      _pressed={{ opacity: 0.7 }}
                    >
                      <Filter size={18} color={getActiveFilterCount() > 0 ? '#ffffff' : (mode === 'dark' ? '#3b82f6' : '#2563eb')} />
                      <Text 
                        ml={2} 
                        fontSize="sm" 
                        fontFamily="Poppins-Medium"
                        color={getActiveFilterCount() > 0 ? '#ffffff' : (mode === 'dark' ? '#3b82f6' : '#2563eb')}
                      >
                        Filter
                      </Text>
                      {getActiveFilterCount() > 0 && (
                        <Badge
                          ml={2}
                          bg="#ffffff"
                          rounded="full"
                          px={2}
                          _text={{
                            color: mode === 'dark' ? '#3b82f6' : '#2563eb',
                            fontSize: 10,
                            fontFamily: 'Poppins-Bold',
                          }}
                        >
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Pressable>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>
          }
          ListEmptyComponent={
            loading ? (
              <LoadingHauler
                message="Memuat daftar approval..."
                subMessage="Mengambil data timesheet yang menunggu persetujuan"
                type="default"
              />
            ) : (
              <Center py={10}>
                <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                  Tidak ada timesheet yang menunggu persetujuan
                </Text>
              </Center>
            )
          }
        />

        {loadingMore && hasMore ? (
          <Center
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            pointerEvents="none"
          >
            <VStack
              px={5}
              py={4}
              rounded="xl"
              bg={mode === 'dark' ? 'rgba(31,41,55,0.92)' : 'rgba(255,255,255,0.96)'}
              alignItems="center"
              shadow={3}
              borderWidth={1}
              borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'}
            >
              <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              <Text mt={2} fontSize="xs" fontFamily="Poppins-Light" color={textColor}>
                Memuat lebih banyak...
              </Text>
            </VStack>
          </Center>
        ) : null}
      </View>

      <FilterTimesheetModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        tempFilter={tempFilter}
        setTempFilter={setTempFilter}
        mode={mode}
      />
    </AppScreen>
  );
}
