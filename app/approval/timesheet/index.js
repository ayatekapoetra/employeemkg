import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { VStack, HStack, ScrollView, Text, Badge, Pressable, Center, useToast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import { getPenyewa } from '../../../src/store/slices/penyewaSlice';
import { getEquipment } from '../../../src/store/slices/equipmentSlice';
import { getShift } from '../../../src/store/slices/shiftSlice';
import { getOprDrv } from '../../../src/store/slices/oprdrvSlice';
import { Calendar, Clock, User, TickCircle, CloseCircle, TruckFast, Filter } from 'iconsax-react-native';
import { View, RefreshControl, Alert } from 'react-native';
import moment from 'moment';
import 'moment/locale/id';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';
import FilterTimesheetModal from '../../../src/features/approval/components/FilterTimesheetModal';

moment.locale('id');

export default function ApprovalTimesheet() {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { user } = useSelector(state => state.auth);

  // Redux state for filter options
  const penyewaState = useSelector(state => state.penyewa);
  const equipmentState = useSelector(state => state.equipment);
  const shiftState = useSelector(state => state.shift);
  const oprdrvState = useSelector(state => state.oprdrv);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [approvalList, setApprovalList] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

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

  const fetchCount = useCallback(async () => {
    try {
      // Build query params with filters
      const params = { ...filterParams };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await apiClient.get(API_ENDPOINTS.TIMESHEET.APPROVAL_LIST_COUNT, { params });
      const count = response.data?.count || 0;
      setPendingCount(count);
    } catch (error) {
      // Fallback to local count if API fails
      setPendingCount(approvalList.length);
    }
  }, [filterParams, approvalList.length]);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);

      try {
        // Build query params with filters
        const params = { ...filterParams };

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await apiClient.get(API_ENDPOINTS.TIMESHEET.APPROVAL_LIST, { params });
        const data = response.data?.data || response.data?.rows?.data || response.data?.rows || [];

        setApprovalList(data);
      } catch (apiError) {
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

        setApprovalList(fallbackData);

        toast.show({
          description: 'Menggunakan data fallback - Backend error',
          duration: 2000,
          bg: 'orange.500',
        });
      }
    } catch (error) {
      setApprovalList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterParams, user?.karyawan?.id, toast]);

  useEffect(() => {
    // Load master data for filters
    dispatch(getPenyewa());
    dispatch(getEquipment());
    dispatch(getShift());
    dispatch(getOprDrv());
  }, []);

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
    fetchApprovals();
    fetchCount();
  }, [filterParams, fetchApprovals, fetchCount]);



  const onRefresh = () => {
    setRefreshing(true);
    fetchApprovals();
    fetchCount();
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
        key={item.id}
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

      <ScrollView
        flex={1}
        bg={backgroundColor}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack p={4} space={4}>
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

          {loading ? (
            <LoadingHauler
              message="Memuat daftar approval..."
              subMessage="Mengambil data timesheet yang menunggu persetujuan"
              type="default"
            />
          ) : approvalList.length === 0 ? (
            <Center py={10}>
              <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                Tidak ada timesheet yang menunggu persetujuan
              </Text>
            </Center>
          ) : (
            <VStack space={3}>
              {approvalList.map(renderTimesheetCard)}
            </VStack>
          )}
        </VStack>
      </ScrollView>
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


