import { useRouter } from 'expo-router';
import { ArrowDown2, ArrowRight2, ArrowUp2, Box, Calendar, Filter, FilterSearch, ShoppingCart, TickCircle, User } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Badge, Center, HStack, Pressable, ScrollView, Spinner, Text, VStack } from 'native-base';
import { TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';
import FilterPurchaseRequestModal from '../../../src/features/approval/components/FilterPurchaseRequestModal';

moment.locale('id');

export default function ApprovalPurchaseRequest() {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const userProfile = useSelector(state => state.userProfile)?.value || {};

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const [filters, setFilters] = useState({
    status: 'active',
    bisnis_id: '',
    cabang_id: '',
    gudang_id: '',
    prioritas: '',
    date_ro_start: '',
    date_ro_end: '',
    kode: '',
    description: '',
  });

  const ITEMS_PER_PAGE = 25;

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const fetchPurchaseRequests = async (pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.bisnis_id) params.append('bisnis_id', filters.bisnis_id);
      if (filters.cabang_id) params.append('cabang_id', filters.cabang_id);
      if (filters.gudang_id) params.append('gudang_id', filters.gudang_id);
      if (filters.prioritas) params.append('prioritas', filters.prioritas);
      if (filters.date_ro_start) params.append('date_ro_start', filters.date_ro_start);
      if (filters.date_ro_end) params.append('date_ro_end', filters.date_ro_end);
      if (filters.kode) params.append('kode', filters.kode);
      if (filters.description) params.append('description', filters.description);
      params.append('page', pageNum);
      params.append('limit', ITEMS_PER_PAGE);

      const url = `${API_ENDPOINTS.PURCHASE_REQUEST.LIST}?${params.toString()}`;
      const response = await apiClient.get(url);

      if (response.data?.diagnostic?.error === false) {
        const newData = response.data.rows || [];
        const total = response.data.total || newData.length;

        if (isLoadMore) {
          setPurchaseRequests(prev => [...prev, ...newData]);
        } else {
          setPurchaseRequests(newData);
        }

        setTotalData(total);
        setHasMore(newData.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setPurchaseRequests([]);
    fetchPurchaseRequests(1, false);
  }, [filters]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchPurchaseRequests(1, false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPurchaseRequests(nextPage, true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: mode === 'dark' ? '#92400e' : '#fef3c7', text: mode === 'dark' ? '#fbbf24' : '#d97706' };
      case 'approved':
        return { bg: mode === 'dark' ? '#1e40af' : '#dbeafe', text: mode === 'dark' ? '#60a5fa' : '#2563eb' };
      case 'finish':
        return { bg: mode === 'dark' ? '#065f46' : '#d1fae5', text: mode === 'dark' ? '#6ee7b7' : '#059669' };
      default:
        return { bg: mode === 'dark' ? '#374151' : '#f3f4f6', text: mode === 'dark' ? '#9ca3af' : '#6b7280' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'tinggi':
      case 'high':
        return { bg: mode === 'dark' ? '#991b1b' : '#fee2e2', text: mode === 'dark' ? '#fca5a5' : '#dc2626' };
      case 'sedang':
      case 'medium':
        return { bg: mode === 'dark' ? '#92400e' : '#fef3c7', text: mode === 'dark' ? '#fbbf24' : '#d97706' };
      default:
        return { bg: mode === 'dark' ? '#065f46' : '#d1fae5', text: mode === 'dark' ? '#6ee7b7' : '#059669' };
    }
  };

  const canValidate = userProfile?.usertype === 'procurement' || userProfile?.usertype === 'procurment';
  const canApprove = ['developer', 'pjo', 'direktur', 'administrator', 'keuangan'].includes(userProfile?.usertype);

  const handleFilterApply = () => {
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setFilters({
      status: 'active',
      bisnis_id: '',
      cabang_id: '',
      gudang_id: '',
      prioritas: '',
      date_ro_start: '',
      date_ro_end: '',
      kode: '',
      description: '',
    });
  };

  const handleCardPress = (item) => {
    router.push({
      pathname: '/approval/purchase-request/detail',
      params: { id: item.id }
    });
  };

  const renderPurchaseCard = (item) => {
    const statusColor = getStatusColor(item.status);
    const priorityColor = getPriorityColor(item.prioritas);

    const itemsCount = item.items?.length || 0;
    const validatedCount = item.items?.filter(i => i.date_validated)?.length || 0;
    const approvedCount = item.items?.filter(i => i.date_approved)?.length || 0;

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
        >
          <HStack justifyContent="space-between" alignItems="flex-start">
            <HStack space={3} flex={1}>
              <VStack
                bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
                p={3}
                rounded="xl"
                justifyContent="center"
                alignItems="center"
              >
                <ShoppingCart size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
              </VStack>

              <VStack flex={1} space={1}>
                <Text
                  fontSize="lg"
                  fontFamily="Quicksand-Bold"
                  color={textColor}
                  numberOfLines={1}
                >
                  {item.kode}
                </Text>
                <Text
                  fontSize="xs"
                  fontFamily="Poppins-Regular"
                  color={subtitleColor}
                  numberOfLines={2}
                >
                  {item.description || '-'}
                </Text>
              </VStack>
            </HStack>

            <VStack space={1} alignItems="flex-end">
              <Badge
                bg={statusColor.bg}
                rounded="md"
                _text={{
                  fontSize: 9,
                  fontFamily: 'Quicksand-SemiBold',
                  color: statusColor.text,
                }}
              >
                {item.status?.toUpperCase()}
              </Badge>
              {item.prioritas && (
                <Badge
                  bg={priorityColor.bg}
                  rounded="md"
                  _text={{
                    fontSize: 9,
                    fontFamily: 'Quicksand-SemiBold',
                    color: priorityColor.text,
                  }}
                >
                  {item.prioritas?.toUpperCase()}
                </Badge>
              )}
            </VStack>
          </HStack>

          <HStack space={3} flexWrap="wrap">
            <HStack space={1} alignItems="center">
              <Calendar size={14} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {moment(item.date_ro).format('DD MMM YYYY')}
              </Text>
            </HStack>

            <HStack space={1} alignItems="center">
              <Box size={14} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {itemsCount} item
              </Text>
            </HStack>
          </HStack>

          <VStack 
            bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}
            p={2}
            rounded="lg"
            space={1}
          >
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Progress:
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
                Validated: {validatedCount}/{itemsCount} | Approved: {approvedCount}/{itemsCount}
              </Text>
            </HStack>

            <HStack space={1} alignItems="center">
              <VStack flex={1} bg={mode === 'dark' ? '#374151' : '#e5e7eb'} h={1.5} rounded="full">
                <VStack 
                  w={`${itemsCount > 0 ? (approvedCount / itemsCount * 100) : 0}%`}
                  bg={mode === 'dark' ? '#059669' : '#10b981'}
                  h={1.5}
                  rounded="full"
                />
              </VStack>
            </HStack>
          </VStack>

          <HStack justifyContent="space-between" alignItems="center" mt={1}>
            <HStack space={1} alignItems="center">
              <User size={14} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {item.creator?.name || item.creator?.nama || item.creator?.username || item.creator?.fullname || '-'}
              </Text>
            </HStack>

            <HStack space={1} alignItems="center">
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
                Lihat Detail
              </Text>
              <ArrowRight2 size={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
            </HStack>
          </HStack>
        </VStack>
      </Pressable>
    );
  };

  return (
    <AppScreen>
      <HeaderScreen 
        title="Purchase Request" 
        onBack={() => router.back()} 
        onThemes={true}
        onNotification={true}
      />

      <VStack flex={1} bg={backgroundColor}>
        <VStack p={4} space={4}>
          {!isHeaderCollapsed && (
            <VStack
              bg={mode === 'dark' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'}
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
                    Total Purchase Request
                  </Text>
                  <Text
                    fontSize="3xl"
                    fontFamily="Quicksand-Bold"
                    color="#ffffff"
                  >
                    {totalData > 0 ? totalData : purchaseRequests.length}
                  </Text>
                </VStack>
                <VStack
                  bg="rgba(255,255,255,0.2)"
                  p={3}
                  rounded="xl"
                >
                  <ShoppingCart size={32} color="#ffffff" variant="Bold" />
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
                    Aktif
                  </Text>
                  <Text fontSize="lg" fontFamily="Quicksand-Bold" color="#ffffff">
                    {purchaseRequests.filter(item => item.status === 'active').length}
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
                    {purchaseRequests.filter(item => item.status === 'approved').length}
                  </Text>
                </VStack>

                <VStack 
                  flex={1}
                  bg="rgba(255,255,255,0.15)"
                  p={2}
                  rounded="lg"
                >
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
                    Selesai
                  </Text>
                  <Text fontSize="lg" fontFamily="Quicksand-Bold" color="#ffffff">
                    {purchaseRequests.filter(item => item.status === 'finish').length}
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
                Daftar Purchase Request
              </Text>
              <Text
                fontSize="xs"
                fontFamily="Poppins-Light"
                color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                {purchaseRequests.length} dari {totalData > 0 ? totalData : purchaseRequests.length} purchase request
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
          data={purchaseRequests}
          renderItem={({ item }) => renderPurchaseCard(item)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            loading ? (
              <LoadingHauler
                message="Memuat data..."
                subMessage="Mengambil daftar purchase request dari server"
                type="default"
              />
            ) : (
              <Center py={10}>
                <FilterSearch size={64} color={subtitleColor} variant="Bulk" />
                <Text mt={3} fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
                  Tidak ada purchase request yang sesuai filter
                </Text>
              </Center>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <Center py={4}>
                <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
                <Text mt={2} fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Memuat lebih banyak...
                </Text>
              </Center>
            ) : null
          }
          ItemSeparatorComponent={() => <VStack h={3} />}
        />
      </VStack>

      <FilterPurchaseRequestModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFilterChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
        onApply={handleFilterApply}
        onReset={handleResetFilter}
      />
    </AppScreen>
  );
}
