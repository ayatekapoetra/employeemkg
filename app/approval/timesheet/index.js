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
import { View, RefreshControl, Alert, StyleSheet } from 'react-native';
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

  // Redux state for debugging filter options
  const penyewaState = useSelector(state => state.penyewa);
  const equipmentState = useSelector(state => state.equipment);
  const shiftState = useSelector(state => state.shift);
  const oprdrvState = useSelector(state => state.oprdrv);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [approvalList, setApprovalList] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
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
      console.log('🔢 Fetching pending count...');

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
      console.log('🔢 Pending count:', count);
      setPendingCount(count);
    } catch (error) {
      console.error('❌ Error fetching pending count:', error);
      // Fallback to local count if API fails
      setPendingCount(approvalList.length);
    }
  }, [filterParams, approvalList.length]);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching timesheet approvals for supervisor:', user?.karyawan?.id);
      console.log('📋 Current filterParams:', filterParams);

      // OPTION 1: Try API endpoint
      try {
        // Build query params with filters
        const params = { ...filterParams };

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        console.log('🔍 Final params sent to API:', params);
        console.log('🌐 API Endpoint:', API_ENDPOINTS.TIMESHEET.APPROVAL_LIST);
        console.log('🌐 Full Request URL:', `${API_ENDPOINTS.TIMESHEET.APPROVAL_LIST}?${new URLSearchParams(params).toString()}`);

        const response = await apiClient.get(API_ENDPOINTS.TIMESHEET.APPROVAL_LIST, { params });

        const data = response.data?.data || response.data?.rows?.data || response.data?.rows || [];
        console.log('📊 Timesheet approvals found:', data.length);
        console.log('📊 Full Response Structure:', {
          'response.data?.data': !!response.data?.data,
          'response.data?.rows?.data': !!response.data?.rows?.data,
          'response.data?.rows': !!response.data?.rows,
          'dataLength': data.length
        });

        if (data.length > 0) {
          console.log('📄 Sample data (first item):', JSON.stringify(data[0], null, 2));

          // Log karyawan_id comparison if filter is active
          if (params.karyawan_id) {
            console.log('🔍 Filter karyawan_id:', params.karyawan_id, '(Type:', typeof params.karyawan_id, ')');
            data.forEach((item, idx) => {
              const itemKaryawanId = item.karyawan?.id || item.karyawan_id;
              const itemKaryawanIdType = typeof itemKaryawanId;
              const match = itemKaryawanId?.toString() === params.karyawan_id?.toString();
              console.log(`📋 Item ${idx + 1}:`, {
                nama: item.karyawan?.nama || item.nama_karyawan,
                karyawan_id: itemKaryawanId,
                idType: itemKaryawanIdType,
                matches: match,
                'item.karyawan_id.toString()': itemKaryawanId?.toString(),
                'params.karyawan_id.toString()': params.karyawan_id?.toString()
              });
            });
          }
        } else {
          console.warn('⚠️ No data returned from API with the following filters:');
          console.warn('⚠️ Filters:', JSON.stringify(params, null, 2));
        }

        setApprovalList(data);
      } catch (apiError) {
        console.error('═══════════════════════════════════════════════════════════════');
        console.error('❌ API ERROR DETAILS:');
        console.error('❌ Error Message:', apiError.message);
        console.error('❌ Error Response:', apiError.response?.data);
        console.error('❌ Error Status:', apiError.response?.status);
        console.error('❌ Request URL:', apiError.config?.url);
        console.error('❌ Request Params:', apiError.config?.params);
        console.error('═══════════════════════════════════════════════════════════════');
        console.warn('⚠️ API endpoint not ready, using dummy data');
        console.warn('⚠️ API Error:', apiError.response?.data?.error?.message);

        // OPTION 2: Dummy data fallback (comment out when API is ready)
        const dummyData = [
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
          {
            id: 2,
            kode: 'TS-2024-002',
            tanggal: moment().format('YYYY-MM-DD'),
            date_ops: moment().format('YYYY-MM-DD'),
            starttime: moment().set({hour: 7, minute: 30}).toISOString(),
            endtime: moment().set({hour: 16, minute: 0}).toISOString(),
            status: 'W',
            karyawan: {
              id: 2,
              nama: 'Budi Operator EX-001',
            },
            penyewa: {
              id: 1,
              nama: 'PT Maju Jaya Mining',
            },
            equipment: {
              id: 2,
              kode: 'EX-001',
              model: 'Komatsu PC200',
            },
            shift: {
              id: 1,
              nama: 'Shift 1 (Pagi)',
            },
          },
        ];

        setApprovalList(dummyData);

        toast.show({
          description: 'Menggunakan data dummy - Backend belum siap',
          duration: 2000,
          bg: 'orange.500',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching timesheet approvals:', error);
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
      console.log('👤 Initializing filter with active user:', activeKaryawanId);
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

  const handleApprove = async (item) => {
    Alert.alert(
      'Konfirmasi Approval',
      `Setujui timesheet ${item.karyawan?.nama || 'karyawan ini'}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Setujui',
          onPress: async () => {
            try {
              setActionLoading(item.id);
              console.log('✅ Approving timesheet:', item.id);

              try {
                await apiClient.put(API_ENDPOINTS.TIMESHEET.APPROVE(item.id), {
                  status: 'A', // A = Approved
                  approved_by: user?.karyawan?.id,
                });

                toast.show({
                  description: 'Timesheet berhasil disetujui',
                  duration: 2000,
                  bg: 'green.500',
                });
              } catch (apiError) {
                console.warn('⚠️ API approve endpoint not ready');
                // Simulate success for dummy data
                toast.show({
                  description: '[DEMO] Timesheet approved (API belum siap)',
                  duration: 2000,
                  bg: 'blue.500',
                });
              }

              fetchApprovals();
            } catch (error) {
              console.error('❌ Error approving timesheet:', error);
              toast.show({
                description: error.response?.data?.message || 'Gagal menyetujui timesheet',
                duration: 3000,
                bg: 'red.500',
              });
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (item) => {
    Alert.alert(
      'Konfirmasi Penolakan',
      `Tolak timesheet ${item.karyawan?.nama || 'karyawan ini'}?\nTimesheet akan dikembalikan untuk diperbaiki.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tolak',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(item.id);
              console.log('❌ Rejecting timesheet:', item.id);

              try {
                await apiClient.put(API_ENDPOINTS.TIMESHEET.REJECT(item.id), {
                  status: 'R', // R = Retry/Rejected
                  rejected_by: user?.karyawan?.id,
                });

                toast.show({
                  description: 'Timesheet ditolak, operator/driver akan memperbaiki',
                  duration: 2000,
                  bg: 'orange.500',
                });
              } catch (apiError) {
                console.warn('⚠️ API reject endpoint not ready');
                // Simulate success for dummy data
                toast.show({
                  description: '[DEMO] Timesheet rejected (API belum siap)',
                  duration: 2000,
                  bg: 'blue.500',
                });
              }

              fetchApprovals();
            } catch (error) {
              console.error('❌ Error rejecting timesheet:', error);
              toast.show({
                description: error.response?.data?.message || 'Gagal menolak timesheet',
                duration: 3000,
                bg: 'red.500',
              });
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApprovals();
    fetchCount();
  };

  const handleOpenFilter = () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔽 OPENING FILTER MODAL');
    console.log('📋 Current filterParams:', filterParams);

    // Log Redux state for debugging
    console.log('🏢 Penyewa Redux State:', {
      loading: penyewaState?.loading,
      dataCount: penyewaState?.data?.length || 0,
      sample: penyewaState?.data?.slice(0, 3).map(p => ({ id: p.id, idType: typeof p.id, nama: p.nama }))
    });
    console.log('🚜 Equipment Redux State:', {
      loading: equipmentState?.loading,
      dataCount: equipmentState?.data?.length || 0,
      sample: equipmentState?.data?.slice(0, 3).map(e => ({ id: e.id, idType: typeof e.id, kode: e.kode }))
    });
    console.log('⏰ Shift Redux State:', {
      loading: shiftState?.loading,
      dataCount: shiftState?.data?.length || 0,
      sample: shiftState?.data?.slice(0, 3).map(s => ({ id: s.id, idType: typeof s.id, nama: s.nama }))
    });
    console.log('👤 OprDrv Redux State:', {
      loading: oprdrvState?.loading,
      dataCount: oprdrvState?.data?.length || 0,
      sample: oprdrvState?.data?.slice(0, 5).map(o => ({ id: o.id, idType: typeof o.id, nama: o.nama }))
    });

    console.log('📋 Setting tempFilter to:', { ...filterParams });
    console.log('═══════════════════════════════════════════════════════════════');

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

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 APPLYING FILTER - Details:');
    console.log('🔍 Status:', appliedFilter.status);
    console.log('🔍 Start Date:', appliedFilter.startdate);
    console.log('🔍 End Date:', appliedFilter.enddate);
    console.log('🔍 Penyewa ID:', appliedFilter.penyewa_id, '(Type:', typeof appliedFilter.penyewa_id, ')');
    console.log('🔍 Equipment ID:', appliedFilter.equipment_id, '(Type:', typeof appliedFilter.equipment_id, ')');
    console.log('🔍 Shift ID:', appliedFilter.shift_id, '(Type:', typeof appliedFilter.shift_id, ')');
    console.log('🔍 Karyawan ID:', appliedFilter.karyawan_id, '(Type:', typeof appliedFilter.karyawan_id, ')');

    // Log the actual selected items from Redux
    const penyewa = penyewaState?.data || [];
    const equipment = equipmentState?.data || [];
    const shift = shiftState?.data || [];
    const oprdrv = oprdrvState?.data || [];

    if (appliedFilter.penyewa_id) {
      const selectedPenyewa = penyewa.find(p => p.id.toString() === appliedFilter.penyewa_id.toString());
      console.log('🏢 Selected Penyewa:', selectedPenyewa);
    }
    if (appliedFilter.equipment_id) {
      const selectedEquipment = equipment.find(e => e.id.toString() === appliedFilter.equipment_id.toString());
      console.log('🚜 Selected Equipment:', selectedEquipment);
    }
    if (appliedFilter.shift_id) {
      const selectedShift = shift.find(s => s.id.toString() === appliedFilter.shift_id.toString());
      console.log('⏰ Selected Shift:', selectedShift);
    }
    if (appliedFilter.karyawan_id) {
      const selectedKaryawan = oprdrv.find(k => k.id.toString() === appliedFilter.karyawan_id.toString());
      console.log('👤 Selected Karyawan:', selectedKaryawan);
    }

    console.log('═══════════════════════════════════════════════════════════════');

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

    console.log('🔄 Resetting filter to active user:', activeKaryawanId);
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
          style={styles.filterButton}
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

const styles = StyleSheet.create({
  filterButton: {
    // styles handled by NativeBase props
  },
});
