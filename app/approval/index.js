import { useRouter } from 'expo-router';
import { VStack, ScrollView, Text, HStack } from 'native-base';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../src/components/common';
import { COLORS } from '../../src/constants/colors';
import ApprovalCard from '../../src/features/approval/components/ApprovalCard';
import { ClipboardTick } from 'iconsax-react-native';
import { View, RefreshControl } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';
import usePengajuanDanaAccess from '../../src/hooks/usePengajuanDanaAccess';

export default function ApprovalManagement() {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const {
    permissions: pengajuanAccess,
    loading: accessLoading,
    retry: retryAccess,
  } = usePengajuanDanaAccess();

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRequested = useRef(false);
  const [counts, setCounts] = useState({
    timesheet: 0,
    purchaseRequest: 0,
    purchaseRequestActive: 0,
    purchaseRequestApproved: 0,
    pengajuanDana: 0,
  });

  const fetchApprovalCounts = useCallback(async (isRefreshing = false, canReadPengajuan = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [timesheetRes, purchaseRequestActiveRes, purchaseRequestApprovedRes, pengajuanDanaRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.TIMESHEET.APPROVAL_LIST_COUNT),
        apiClient.get(`${API_ENDPOINTS.PURCHASE_REQUEST.LIST}?status=active&limit=1`),
        apiClient.get(`${API_ENDPOINTS.PURCHASE_REQUEST.LIST}?status=approved&limit=1`),
        canReadPengajuan
          ? apiClient.get(API_ENDPOINTS.PENGAJUAN.APPROVAL_LIST_COUNT)
          : Promise.resolve(null),
      ]);

      const activeCount = purchaseRequestActiveRes.status === 'fulfilled' ? (purchaseRequestActiveRes.value?.data?.total || 0) : 0;
      const approvedCount = purchaseRequestApprovedRes.status === 'fulfilled' ? (purchaseRequestApprovedRes.value?.data?.total || 0) : 0;

      setCounts({
        timesheet: timesheetRes.status === 'fulfilled' ? (timesheetRes.value?.data?.count || 0) : 0,
        purchaseRequest: activeCount + approvedCount,
        purchaseRequestActive: activeCount,
        purchaseRequestApproved: approvedCount,
        pengajuanDana: canReadPengajuan && pengajuanDanaRes.status === 'fulfilled' ? (pengajuanDanaRes.value?.data?.count || 0) : 0,
      });
    } catch (error) {
      console.error('Error fetching approval counts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!accessLoading) {
      fetchApprovalCounts(refreshRequested.current, pengajuanAccess.can_read);
      refreshRequested.current = false;
    }
  }, [accessLoading, fetchApprovalCounts, pengajuanAccess.can_read]);

  const onRefresh = () => {
    refreshRequested.current = true;
    setRefreshing(true);
    retryAccess().catch(() => {});
  };

  const approvalData = [
    {
      id: 'timesheet',
      title: 'Timesheet',
      description: 'Persetujuan laporan waktu kerja harian karyawan',
      icon: require('../../assets/images/approval-timesheet.png'),
      count: counts.timesheet,
      route: '/approval/timesheet',
      iconBgColor: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
    },
    {
      id: 'worksheet',
      title: 'Worksheet',
      description: 'Persetujuan aktifitas kerja crew operasional',
      icon: require('../../assets/images/absen-tulis.png'),
      count: counts.worksheet || 0,
      route: '/approval/worksheet',
      iconBgColor: mode === 'dark' ? '#31316a' : '#c7c7f0',
    },
    {
      id: 'purchase',
      title: 'Purchase Request',
      description: 'Persetujuan permintaan pembelian barang dan jasa',
      icon: require('../../assets/images/cart-part.png'),
      count: counts.purchaseRequest,
      detailCount: `Active: ${counts.purchaseRequestActive} • Approved: ${counts.purchaseRequestApproved}`,
      route: '/approval/purchase-request',
      iconBgColor: mode === 'dark' ? '#065f46' : '#d1fae5',
    },
    {
      id: 'funds',
      title: 'Pengajuan Dana',
      description: 'Persetujuan pengajuan dana operasional',
      icon: require('../../assets/images/funds.png'),
      count: counts.pengajuanDana,
      route: '/approval/pengajuan-dana',
      iconBgColor: mode === 'dark' ? '#7c2d12' : '#fed7aa',
    },
    
  ].filter(item => item.id !== 'funds' || pengajuanAccess.can_read);

  const totalPending = approvalData.reduce((sum, item) => sum + parseInt(item.count), 0);

  return (
    <AppScreen>
      <HeaderScreen 
        title="Approval Management" 
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
        {loading ? (
          <LoadingHauler
            message="Memuat data..."
            subMessage="Mengambil data approval dari server"
            type="default"
          />
        ) : (
          <VStack p={4} space={4}>
          <VStack
            bg={mode === 'dark' ? '#2a2c3e' : '#f9fafb'}
            p={5}
            rounded="xl"
            borderWidth={1}
            borderColor={mode === 'dark' ? '#3a3c4e' : '#e5e7eb'}
          >
            <HStack alignItems="center" justifyContent="space-between">
              <VStack flex={1}>
                <Text
                  fontSize="sm"
                  fontFamily="Poppins-Light"
                  color={subtitleColor}
                >
                  Total Menunggu Persetujuan
                </Text>
                <Text
                  fontSize="3xl"
                  fontFamily="Quicksand-Bold"
                  color={mode === 'dark' ? '#fbbf24' : '#f59e0b'}
                >
                  {totalPending}
                </Text>
              </VStack>

              <View
                style={{
                  backgroundColor: mode === 'dark' ? '#374151' : '#fef3e2',
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <ClipboardTick
                  size={32}
                  color={mode === 'dark' ? '#fbbf24' : '#f59e0b'}
                  variant="Bold"
                />
              </View>
            </HStack>
          </VStack>

          <VStack space={1} mb={2}>
            <Text
              fontSize="lg"
              fontFamily="Quicksand-Bold"
              color={textColor}
            >
              Jenis Persetujuan
            </Text>
            <Text
              fontSize="xs"
              fontFamily="Poppins-Light"
              color={subtitleColor}
            >
              Pilih kategori untuk melihat daftar approval
            </Text>
          </VStack>

          <VStack space={4}>
            {approvalData.map((item) => (
              <ApprovalCard
                key={item.id}
                title={item.title}
                description={item.description}
                icon={item.icon}
                count={item.count}
                detailCount={item.detailCount}
                iconBgColor={item.iconBgColor}
                textColor={textColor}
                mode={mode}
                onPress={() => router.push(item.route)}
              />
            ))}
          </VStack>

          <VStack
            mt={4}
            p={4}
            bg={mode === 'dark' ? '#1e293b' : '#eff6ff'}
            rounded="xl"
            borderWidth={1}
            borderColor={mode === 'dark' ? '#334155' : '#bfdbfe'}
          >
            <HStack space={2} alignItems="center">
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: mode === 'dark' ? '#60a5fa' : '#3b82f6',
                }}
              />
              <Text
                fontSize="xs"
                fontFamily="Poppins-Light"
                color={mode === 'dark' ? '#93c5fd' : '#1e40af'}
                flex={1}
              >
                Klik pada kartu untuk melihat detail dan melakukan persetujuan
              </Text>
            </HStack>
          </VStack>
        </VStack>
        )}
      </ScrollView>
    </AppScreen>
  );
}
