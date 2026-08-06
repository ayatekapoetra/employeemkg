import { useRouter } from 'expo-router';
import { ArrowDown2, ArrowLeft, ArrowRight2, ArrowUp2, Calendar, Filter, Money, User, DocumentText } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Badge, Button, Center, HStack, Pressable, Spinner, Text, VStack } from 'native-base';
import { TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';
import FilterPengajuanDanaModal from '../../../src/features/approval/components/FilterPengajuanDanaModal';
import usePengajuanDanaAccess from '../../../src/hooks/usePengajuanDanaAccess';

moment.locale('id');

const ITEMS_PER_PAGE = 25;

export default function ApprovalPengajuanDana() {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { permissions, loading: accessLoading, error: accessError, retry: retryAccess } = usePengajuanDanaAccess();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pengajuanList, setPengajuanList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [listError, setListError] = useState(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [summary, setSummary] = useState({
    total_all: 0,
    open: 0,
    approval: 0,
    verified: 0,
    rejected: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    kategori: '',
    kode: '',
    narasi: '',
    min_amount: '',
    max_amount: '',
    date_start: '',
    date_end: '',
    bisnis_unit_id: '',
  });

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  const fetchPengajuan = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (!permissions.can_read) return;

    try {
      setListError(null);
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.kategori) params.append('kategori', filters.kategori);
      if (filters.kode) params.append('kode', filters.kode);
      if (filters.narasi) params.append('narasi', filters.narasi);
      if (filters.min_amount) params.append('min_amount', filters.min_amount);
      if (filters.max_amount) params.append('max_amount', filters.max_amount);
      if (filters.date_start) params.append('date_start', filters.date_start);
      if (filters.date_end) params.append('date_end', filters.date_end);
      if (filters.bisnis_unit_id) params.append('bisnis_unit_id', filters.bisnis_unit_id);
      params.append('page', pageNum);
      params.append('limit', ITEMS_PER_PAGE);

      const response = await apiClient.get(`${API_ENDPOINTS.PENGAJUAN.LIST}?${params.toString()}`);

      if (response.data.success) {
        const newData = response.data.data || [];

        if (isLoadMore) {
          setPengajuanList(prev => [...prev, ...newData]);
        } else {
          setPengajuanList(newData);
        }

        const pagination = response.data.pagination || {};
        setTotalData(pagination.total || 0);

        if (response.data.summary) {
          setSummary(response.data.summary);
        }

        setPage(pageNum);
        setHasMore(Number(pagination.page || pageNum) < Number(pagination.lastPage || 1));
      } else {
        throw new Error(response.data?.message || 'Gagal memuat daftar Pengajuan Dana');
      }
    } catch (error) {
      console.error('Error fetching pengajuan dana:', error);
      setListError(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [filters, permissions.can_read]);

  useEffect(() => {
    if (!accessLoading && !accessError && permissions.can_read) {
      fetchPengajuan(1, false);
    }
  }, [accessLoading, accessError, fetchPengajuan, permissions.can_read]);

  const handleRefresh = () => {
    if (!permissions.can_read) return;
    setRefreshing(true);
    setPage(1);
    fetchPengajuan(1, false);
  };

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (permissions.can_read && !loadingMore && hasMore) {
      fetchPengajuan(page + 1, true);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { 
        label: 'Open', 
        color: mode === 'dark' ? '#f59e0b' : '#d97706',
        bg: mode === 'dark' ? '#78350f' : '#fef3c7'
      },
      approval: { 
        label: 'Approved', 
        color: mode === 'dark' ? '#3b82f6' : '#2563eb',
        bg: mode === 'dark' ? '#1e3a8a' : '#dbeafe'
      },
      close: { 
        label: 'Wait Payment', 
        color: mode === 'dark' ? '#10b981' : '#059669',
        bg: mode === 'dark' ? '#064e3b' : '#d1fae5'
      },
      reject: { 
        label: 'Rejected', 
        color: mode === 'dark' ? '#ef4444' : '#dc2626',
        bg: mode === 'dark' ? '#7f1d1d' : '#fee2e2'
      },
    };

    const config = statusConfig[status] || statusConfig.open;

    return (
      <Badge
        bg={config.bg}
        _text={{ 
          color: config.color, 
          fontSize: 10, 
          fontFamily: 'Quicksand-SemiBold' 
        }}
        rounded="md"
        px={2}
        py={0.5}
      >
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return `Rp ${parseFloat(amount).toLocaleString('id-ID')}`;
  };

  const renderPengajuanCard = ({ item }) => (
    <Pressable
      onPress={() => router.push(`/approval/pengajuan-dana/${item.id}`)}
      mb={3}
    >
      <VStack
        bg={cardBg}
        rounded="xl"
        shadow={2}
        borderWidth={1}
        borderColor={borderColor}
        p={4}
        space={3}
      >
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack flex={1} space={1}>
            <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
              {item.kode || '-'}
            </Text>
            <Text 
              fontSize="xs" 
              fontFamily="Poppins-Light" 
              color={subtitleColor}
              numberOfLines={2}
            >
              {item.narasi || 'Tidak ada keterangan'}
            </Text>
          </VStack>
          <VStack space={1} alignItems="flex-end">
            {getStatusBadge(item.status)}
          </VStack>
        </HStack>

        <HStack 
          bg={mode === 'dark' ? '#111827' : '#f9fafb'} 
          p={3} 
          rounded="lg"
          justifyContent="space-between"
          alignItems="center"
        >
          <VStack flex={1}>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Total Amount
            </Text>
            <Text 
              fontSize="lg" 
              fontFamily="Quicksand-Bold" 
              color={mode === 'dark' ? '#10b981' : '#059669'}
            >
              {formatCurrency(item.total)}
            </Text>
          </VStack>
          {item.kategori && (
            <Badge
              bg={mode === 'dark' ? '#374151' : '#e5e7eb'}
              _text={{ 
                color: mode === 'dark' ? '#9ca3af' : '#6b7280', 
                fontSize: 9,
                fontFamily: 'Poppins-Light'
              }}
              rounded="md"
              px={2}
            >
              {item.kategori === 'reimburse' ? 'Reimburse' : 'Direct Paid'}
            </Badge>
          )}
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={4} flex={1}>
            <HStack space={1} alignItems="center">
              <DocumentText size={14} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {item.items_count || 0} items
              </Text>
            </HStack>
            {item.files_count > 0 && (
              <HStack space={1} alignItems="center">
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  📎 {item.files_count} files
                </Text>
              </HStack>
            )}
          </HStack>

          <HStack space={1} alignItems="center">
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
              Detail
            </Text>
            <ArrowRight2 size={14} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
          </HStack>
        </HStack>

        <HStack 
          pt={2} 
          borderTopWidth={1} 
          borderTopColor={borderColor}
          justifyContent="space-between"
        >
          <HStack space={1} alignItems="center">
            <User size={12} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {item.creator?.name || item.creator?.nama || item.creator?.username || '-'}
            </Text>
          </HStack>
          <HStack space={1} alignItems="center">
            <Calendar size={12} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {item.trx_date ? moment(item.trx_date).format('DD MMM YYYY') : '-'}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Pressable>
  );

  const renderListFooter = () => {
    if (!loadingMore) return null;
    return (
      <Center py={4}>
        <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
      </Center>
    );
  };

  const renderEmptyList = () => (
    <Center py={10}>
      <Money size={64} color={subtitleColor} variant="Bulk" />
      <Text mt={4} fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>
        Tidak ada pengajuan dana
      </Text>
      <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
        Belum ada data yang dapat ditampilkan
      </Text>
    </Center>
  );

  if (accessLoading || (loading && page === 1)) {
    return (
      <AppScreen>
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
              Pengajuan Dana
            </Text>
          </HStack>
          <LoadingHauler
            message={accessLoading ? 'Memeriksa hak akses...' : 'Memuat data...'}
            subMessage={accessLoading ? 'Memastikan akses Pengajuan Dana' : 'Mengambil daftar pengajuan dana dari server'}
            type="default"
          />
        </VStack>
      </AppScreen>
    );
  }

  if (accessError || !permissions.can_read || listError) {
    const isDenied = !accessError && !permissions.can_read;
    const message = isDenied ? 'Akses ditolak' : 'Gagal memuat Pengajuan Dana';
    const description = isDenied
      ? 'Anda tidak memiliki hak akses untuk melihat Pengajuan Dana.'
      : 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.';

    return (
      <AppScreen>
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>Pengajuan Dana</Text>
          </HStack>
          <Center flex={1} px={6}>
            <Money size={64} color={subtitleColor} variant="Bulk" />
            <Text mt={4} fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>{message}</Text>
            <Text mt={1} textAlign="center" fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>{description}</Text>
            {!isDenied && (
              <Button mt={5} bg={mode === 'dark' ? '#1e40af' : '#2563eb'} onPress={() => {
                if (accessError) retryAccess().catch(() => {});
                else fetchPengajuan(1, false);
              }}>
                Coba Lagi
              </Button>
            )}
          </Center>
        </VStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
            Pengajuan Dana
          </Text>
        </HStack>

      <VStack flex={1} bg={backgroundColor}>
        <VStack p={4} space={4}>
          {!isHeaderCollapsed && (
            <VStack
              bg={mode === 'dark' ? '#7c2d12' : '#ea580c'}
              p={5}
              rounded="2xl"
              shadow={3}
              space={3}
            >
              <HStack alignItems="center" justifyContent="space-between">
                <VStack>
                  <Text
                    fontSize="xs"
                    fontFamily="Poppins-Light"
                    color="#ffffff"
                    opacity={0.9}
                  >
                    Total Pengajuan Dana
                  </Text>
                  <Text
                    fontSize="3xl"
                    fontFamily="Quicksand-Bold"
                    color="#ffffff"
                  >
                    {totalData}
                  </Text>
                </VStack>
                <VStack
                  bg="rgba(255,255,255,0.2)"
                  p={3}
                  rounded="xl"
                >
                  <Money size={32} color="#ffffff" variant="Bold" />
                </VStack>
              </HStack>

              <HStack space={2}>
                <VStack 
                  flex={1}
                  bg="rgba(255,255,255,0.15)"
                  p={2}
                  rounded="lg"
                >
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
                    Open
                  </Text>
                  <Text fontSize="lg" fontFamily="Quicksand-Bold" color="#ffffff">
                    {summary.open}
                  </Text>
                </VStack>

                <VStack 
                  flex={1}
                  bg="rgba(255,255,255,0.15)"
                  p={2}
                  rounded="lg"
                >
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
                    Approved
                  </Text>
                  <Text fontSize="lg" fontFamily="Quicksand-Bold" color="#ffffff">
                    {summary.approval}
                  </Text>
                </VStack>

                <VStack 
                  flex={1}
                  bg="rgba(255,255,255,0.15)"
                  p={2}
                  rounded="lg"
                >
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
                    Verified
                  </Text>
                  <Text fontSize="lg" fontFamily="Quicksand-Bold" color="#ffffff">
                    {summary.verified}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          )}

          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <VStack>
              <Text
                fontSize="sm"
                fontFamily="Quicksand-SemiBold"
                color={textColor}
              >
                Daftar Pengajuan Dana
              </Text>
              <Text
                fontSize="xs"
                fontFamily="Poppins-Light"
                color={subtitleColor}
              >
                {pengajuanList.length} dari {totalData} pengajuan
              </Text>
            </VStack>

            <HStack space={2}>
              <TouchableOpacity
                onPress={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                style={{
                  backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                }}
              >
                {isHeaderCollapsed ? (
                  <ArrowDown2 size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
                ) : (
                  <ArrowUp2 size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                style={{
                  backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                }}
              >
                <Filter size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} variant="Bold" />
              </TouchableOpacity>
            </HStack>
          </HStack>
        </VStack>

        <FlatList
          data={pengajuanList}
          renderItem={renderPengajuanCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyList}
        />
      </VStack>

      <FilterPengajuanDanaModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
        currentFilters={filters}
      />
      </VStack>
    </AppScreen>
  );
}
