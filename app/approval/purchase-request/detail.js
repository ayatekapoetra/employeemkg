import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box, Calendar, CloseCircle, Copy, Edit, RefreshCircle, ShoppingCart, TickCircle, TruckFast, User } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { AlertDialog, Badge, Button, Center, Checkbox, Divider, HStack, Modal, Pressable, ScrollView, Spinner, Text, VStack, useToast } from 'native-base';
import { useEffect, useState } from 'react';
import { Clipboard, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';

moment.locale('id');

export default function PurchaseRequestDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const toast = useToast();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const userProfile = useSelector(state => state.userProfile)?.value || {};
  const auth = useSelector(state => state.auth) || {};
  const user = auth?.user || userProfile;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const fetchDetail = async () => {
    try {
      setLoading(true);
      console.log('=== USER PROFILE DEBUG ===');
      console.log('Auth State:', auth);
      console.log('Auth User:', auth?.user);
      console.log('User Profile (Redux):', userProfile);
      console.log('User (Final):', user);
      console.log('User Type:', user?.usertype);
      console.log('Can Validate:', canValidate);
      console.log('Can Approve:', canApprove);
      console.log('========================');

      const response = await apiClient.get(API_ENDPOINTS.PURCHASE_REQUEST.DETAIL(params.id));

      if (response.data?.diagnostic?.error === false) {
        console.log('='.repeat(80));
        console.log('📦 PURCHASE REQUEST DETAIL - FULL DATA');
        console.log('='.repeat(80));
        console.log(JSON.stringify(response.data.rows, null, 2));
        console.log('='.repeat(80));
        console.log('📦 CREATOR DATA:');
        console.log(JSON.stringify(response.data.rows?.creator, null, 2));
        console.log('='.repeat(80));
        console.log('📦 ITEMS DATA:');
        console.log(JSON.stringify(response.data.rows?.items, null, 2));
        console.log('='.repeat(80));

        if (response.data.rows?.items?.length > 0) {
          console.log('📦 FIRST ITEM DETAILS:');
          console.log('- Barang:', response.data.rows.items[0]?.barang);
          console.log('- Pemasok:', response.data.rows.items[0]?.pemasok);
          console.log('- Equipment:', response.data.rows.items[0]?.equipment);
          console.log('- Validator:', response.data.rows.items[0]?.validator);
          console.log('- Approver:', response.data.rows.items[0]?.approver);
          console.log('- Currency:', response.data.rows.items[0]?.currency);
          console.log('- Kurs:', response.data.rows.items[0]?.kurs);
          console.log('- Harga:', response.data.rows.items[0]?.harga);
          console.log('- PPN (%):', response.data.rows.items[0]?.ppn);
          console.log('- PPN (Rp):', response.data.rows.items[0]?.ppn_rp);
          console.log('- Potongan:', response.data.rows.items[0]?.potongan);
          console.log('- Subtotal:', response.data.rows.items[0]?.subtotal);
          console.log('='.repeat(80));
        }

        setPurchaseRequest(response.data.rows);
      }
    } catch (error) {
      console.error('Error fetching purchase request detail:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const canValidate = ['procurement', 'partadmin', 'partcounter'].includes(user?.usertype);
  const canApprove = ['developer', 'pjo', 'direktur', 'administrator', 'keuangan'].includes(user?.usertype);

  const handleCopyCode = () => {
    Clipboard.setString(purchaseRequest.kode);
    toast.show({
      description: 'Kode berhasil disalin',
      placement: 'top',
      duration: 2000,
      bg: mode === 'dark' ? '#065f46' : '#10b981',
      _description: {
        color: '#ffffff',
        fontFamily: 'Quicksand-SemiBold',
        fontSize: 'sm',
      },
    });
  };

  const handleValidate = (item) => {
    router.push({
      pathname: '/approval/purchase-request/validate',
      params: { 
        itemId: item.id,
        roId: params.id
      }
    });
  };

  const handleUpdate = (item) => {
    router.push({
      pathname: '/approval/purchase-request/edit-item',
      params: { 
        itemId: item.id,
        roId: params.id
      }
    });
  };

  const handleRollback = async (item) => {
    try {
      const isValidated = item.user_validated && item.date_validated;
      const isApproved = item.user_approved && item.date_approved;

      let rollbackType = 'validation';
      let rollbackMessage = 'Rollback Validasi';

      if (isApproved) {
        rollbackType = 'approval';
        rollbackMessage = 'Rollback Approval';
      } else if (isValidated) {
        rollbackType = 'validation';
        rollbackMessage = 'Rollback Validasi';
      }

      console.log('=== ROLLBACK DEBUG ===');
      console.log('Item:', item.id);
      console.log('Is Validated:', isValidated);
      console.log('Is Approved:', isApproved);
      console.log('Rollback Type:', rollbackType);
      console.log('User Type:', user?.usertype);
      console.log('======================');

      const response = await apiClient.post(API_ENDPOINTS.PURCHASE_REQUEST.ROLLBACK, {
        items: [item.id],
        type: rollbackType
      });

      if (response.data?.diagnostic?.error === false) {
        toast.show({
          description: `${rollbackMessage} berhasil`,
          placement: 'top',
          duration: 2000,
          bg: mode === 'dark' ? '#065f46' : '#10b981',
          _description: {
            color: '#ffffff',
            fontFamily: 'Quicksand-SemiBold',
            fontSize: 'sm',
          },
        });
        fetchDetail();
      } else {
        throw new Error(response.data?.diagnostic?.error || response.data?.diagnostic?.message || 'Rollback gagal');
      }
    } catch (error) {
      console.error('=== ROLLBACK ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('======================');

      toast.show({
        description: error.response?.data?.diagnostic?.error || error.message || 'Gagal rollback status',
        placement: 'top',
        duration: 2000,
        bg: mode === 'dark' ? '#991b1b' : '#dc2626',
        _description: {
          color: '#ffffff',
          fontFamily: 'Quicksand-SemiBold',
          fontSize: 'sm',
        },
      });
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleBulkApproveClick = () => {
    if (selectedItems.length === 0) {
      toast.show({
        description: 'Pilih minimal 1 item untuk disetujui',
        placement: 'top',
        duration: 2000,
        bg: mode === 'dark' ? '#92400e' : '#d97706',
        _description: {
          color: '#ffffff',
          fontFamily: 'Quicksand-SemiBold',
          fontSize: 'sm',
        },
      });
      return;
    }
    setShowBulkApproveModal(true);
  };

  const handleBulkApproveConfirm = async () => {
    try {
      setBulkApproving(true);

      const itemsToApprove = selectedItems.map(itemId => ({
        id: itemId
      }));

      const response = await apiClient.put(API_ENDPOINTS.PURCHASE_REQUEST.APPROVE, {
        items: itemsToApprove
      });

      if (response.data?.diagnostic?.error !== false) {
        throw new Error(response.data?.diagnostic?.error || 'Gagal approve items');
      }

      toast.show({
        description: `${selectedItems.length} item berhasil disetujui`,
        placement: 'top',
        duration: 2000,
        bg: mode === 'dark' ? '#065f46' : '#10b981',
        _description: {
          color: '#ffffff',
          fontFamily: 'Quicksand-SemiBold',
          fontSize: 'sm',
        },
      });

      setSelectedItems([]);
      setShowBulkApproveModal(false);
      fetchDetail();
    } catch (error) {
      toast.show({
        description: error.message || 'Gagal menyetujui item',
        placement: 'top',
        duration: 2000,
        bg: mode === 'dark' ? '#991b1b' : '#dc2626',
        _description: {
          color: '#ffffff',
          fontFamily: 'Quicksand-SemiBold',
          fontSize: 'sm',
        },
      });
    } finally {
      setBulkApproving(false);
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

  const renderItemCard = (item, index) => {
    const isNew = !item.user_validated && !item.date_validated;
    const isValidated = item.user_validated && item.date_validated && !item.user_approved && !item.date_approved;
    const isApproved = item.user_validated && item.date_validated && item.user_approved && item.date_approved;
    const isSelected = selectedItems.includes(item.id);
    const canSelect = canApprove && isValidated;



    return (
      <VStack
        key={item.id}
        bg={cardBg}
        p={4}
        mb={5}
        rounded="xl"
        borderWidth={1}
        borderColor={isSelected ? (mode === 'dark' ? '#10b981' : '#059669') : cardBorder}
        space={3}
        position="relative"
      >
        {canSelect && (
          <Pressable
            position="absolute"
            top={-15}
            right={-10}
            zIndex={10}
            onPress={() => toggleItemSelection(item.id)}
            p={1}
          >
            <Checkbox
              value={item.id.toString()}
              isChecked={isSelected}
              onChange={() => toggleItemSelection(item.id)}
              colorScheme="green"
              size="lg"
            />
          </Pressable>
        )}

        <VStack space={2}>
          <HStack space={2} alignItems="flex-start">
            <VStack
              bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
              px={3}
              py={1}
              rounded="lg"
              justifyContent="center"
            >
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                #{index + 1}
              </Text>
            </VStack>

            <Text
              flex={1}
              fontSize="md"
              fontFamily="Quicksand-Bold"
              color={textColor}
              pr={8}
            >
              {item.barang?.nama || item.barang?.nama_barang || item.description || 'Barang belum dipilih'}
            </Text>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} flex={1}>
              {(item.barang?.kode || item.barang?.kode_barang) && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Kode: {item.barang?.kode || item.barang?.kode_barang}
                </Text>
              )}
              {!item.barang && item.barang_id && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Barang ID: {item.barang_id}
                </Text>
              )}
            </HStack>

            <HStack space={1}>
              {isApproved && (
                <Badge
                  bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
                  rounded="md"
                  _text={{
                    fontSize: 9,
                    fontFamily: 'Quicksand-SemiBold',
                    color: mode === 'dark' ? '#6ee7b7' : '#059669',
                  }}
                >
                  APPROVED
                </Badge>
              )}
              {isValidated && (
                <Badge
                  bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
                  rounded="md"
                  _text={{
                    fontSize: 9,
                    fontFamily: 'Quicksand-SemiBold',
                    color: mode === 'dark' ? '#60a5fa' : '#2563eb',
                  }}
                >
                  VALIDATED
                </Badge>
              )}
              {isNew && (
                <Badge
                  bg={mode === 'dark' ? '#92400e' : '#fef3c7'}
                  rounded="md"
                  _text={{
                    fontSize: 9,
                    fontFamily: 'Quicksand-SemiBold',
                    color: mode === 'dark' ? '#fbbf24' : '#d97706',
                  }}
                >
                  NEW
                </Badge>
              )}
            </HStack>
          </HStack>
        </VStack>

        <Divider bg={cardBorder} />

        <VStack space={2}>
          {item.description && (
            <VStack space={1}>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Deskripsi
              </Text>
              <Text fontSize="sm" fontFamily="Poppins-Regular" color={textColor}>
                {item.description}
              </Text>
            </VStack>
          )}

          {(item.equipment || item.equipment_id) && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Equipment
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                {item.equipment?.kode_equipment || item.equipment?.kode || `ID: ${item.equipment_id}` || '-'}
              </Text>
            </HStack>
          )}

          <HStack justifyContent="space-between">
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Qty Diminta
            </Text>
            <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
              {item.qty_req || 0} unit
            </Text>
          </HStack>

          {(isValidated || isApproved) && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Qty Disetujui
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
                {item.qty_acc || 0} unit
              </Text>
            </HStack>
          )}

          {item.pemasok && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Pemasok
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                {item.pemasok?.nama_pemasok || item.pemasok?.nama || '-'}
              </Text>
            </HStack>
          )}

          {item.currency && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Currency
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                {item.currency}
              </Text>
            </HStack>
          )}

          {item.harga > 0 && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Harga Satuan
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#6ee7b7' : '#059669'}>
                {item.currency === 'USD' ? '$' : 'Rp'} {item.harga?.toLocaleString('id-ID') || 0}
              </Text>
            </HStack>
          )}

          {item.ppn > 0 && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                PPN
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                {item.ppn}%
              </Text>
            </HStack>
          )}

          {item.ppn_rp > 0 && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Nilai PPN
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Rp {item.ppn_rp?.toLocaleString('id-ID') || 0}
              </Text>
            </HStack>
          )}

          {item.subtotal > 0 && (
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Subtotal
              </Text>
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#6ee7b7' : '#059669'}>
                {item.currency === 'USD' ? '$' : 'Rp'} {item.subtotal?.toLocaleString('id-ID') || 0}
              </Text>
            </HStack>
          )}
        </VStack>

        {isValidated && (
          <VStack 
            bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}
            p={2}
            rounded="lg"
            space={1}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={1} alignItems="center">
                <User size={14} color={subtitleColor} />
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Divalidasi oleh
                </Text>
              </HStack>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
                {item.validator?.name || item.validator?.nama || item.validator?.username || item.validator?.fullname || '-'}
              </Text>
            </HStack>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="right">
              {moment(item.date_validated).format('dddd, DD MMM YYYY')}
            </Text>
          </VStack>
        )}

        {isApproved && (
          <VStack 
            bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
            p={2}
            rounded="lg"
            space={1}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={1} alignItems="center">
                <TickCircle size={14} color={mode === 'dark' ? '#6ee7b7' : '#059669'} variant="Bold" />
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                  Disetujui oleh
                </Text>
              </HStack>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#065f46'}>
                {item.approver?.name || item.approver?.nama || item.approver?.username || item.approver?.fullname || '-'}
              </Text>
            </HStack>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'} textAlign="right">
              {moment(item.date_approved).format('DD MMM YYYY, HH:mm')}
            </Text>
          </VStack>
        )}

        {canValidate && isNew && (
          <Pressable
            bg={mode === 'dark' ? '#1e40af' : '#2563eb'}
            py={2.5}
            rounded="lg"
            onPress={() => handleValidate(item)}
            _pressed={{ opacity: 0.7 }}
          >
            <HStack space={1} alignItems="center" justifyContent="center">
              <Edit size={18} color="#ffffff" variant="Bold" />
              <Text
                fontSize="sm"
                fontFamily="Quicksand-SemiBold"
                color="#ffffff"
              >
                Validasi Item
              </Text>
            </HStack>
          </Pressable>
        )}

        {canValidate && (isValidated || isApproved) && (
          <HStack space={2}>
            <Pressable
              flex={1}
              bg={mode === 'dark' ? '#1e40af' : '#2563eb'}
              py={2.5}
              rounded="lg"
              onPress={() => handleUpdate(item)}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack space={1} alignItems="center" justifyContent="center">
                <Edit size={16} color="#ffffff" variant="Bold" />
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color="#ffffff">
                  Edit Items
                </Text>
              </HStack>
            </Pressable>
            <Pressable
              flex={1}
              bg={mode === 'dark' ? '#92400e' : '#d97706'}
              py={2.5}
              rounded="lg"
              onPress={() => handleRollback(item)}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack space={1} alignItems="center" justifyContent="center">
                <RefreshCircle size={16} color="#ffffff" variant="Bold" />
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color="#ffffff">
                  Rollback
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        )}

        {!canValidate && isNew && (
          <VStack 
            bg={mode === 'dark' ? '#7c2d12' : '#fef3c7'}
            p={2}
            rounded="lg"
            space={1}
          >
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fed7aa' : '#92400e'}>
              Hanya user procurement yang dapat memvalidasi
            </Text>
          </VStack>
        )}

        {canApprove && isValidated && (
          <HStack space={2}>
            <Pressable
              flex={1}
              bg={mode === 'dark' ? '#1e40af' : '#2563eb'}
              py={2.5}
              rounded="lg"
              onPress={() => handleUpdate(item)}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack space={1} alignItems="center" justifyContent="center">
                <Edit size={16} color="#ffffff" variant="Bold" />
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color="#ffffff">
                  Edit
                </Text>
              </HStack>
            </Pressable>
            <Pressable
              flex={1}
              bg={mode === 'dark' ? '#92400e' : '#d97706'}
              py={2.5}
              rounded="lg"
              onPress={() => handleRollback(item)}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack space={1} alignItems="center" justifyContent="center">
                <RefreshCircle size={16} color="#ffffff" variant="Bold" />
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color="#ffffff">
                  Rollback
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        )}
      </VStack>
    );
  };

  if (loading) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Detail Purchase Request" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <LoadingHauler
          message="Memuat data..."
          subMessage="Mengambil detail purchase request dari server"
          type="default"
        />
      </AppScreen>
    );
  }

  if (!purchaseRequest) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Detail Purchase Request" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1} bg={backgroundColor}>
          <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
            Data tidak ditemukan
          </Text>
        </Center>
      </AppScreen>
    );
  }

  const statusColor = getStatusColor(purchaseRequest.status);
  const priorityColor = getPriorityColor(purchaseRequest.prioritas);

  return (
    <AppScreen>
      <HeaderScreen 
        title="Detail Purchase Request" 
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
            bg={cardBg}
            p={5}
            rounded="2xl"
            borderWidth={1}
            borderColor={cardBorder}
            shadow={3}
            space={3}
          >
            <HStack justifyContent="space-between" alignItems="flex-start">
              <HStack space={3} flex={1}>
                <VStack
                  bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
                  p={3}
                  rounded="xl"
                >
                  <ShoppingCart size={32} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
                </VStack>

                <VStack flex={1}>
                  <HStack space={2} alignItems="center">
                    <Text
                      fontSize="md"
                      fontFamily="Quicksand-Bold"
                      color={textColor}
                    >
                      {purchaseRequest.kode}
                    </Text>
                    <Pressable
                      onPress={handleCopyCode}
                      p={1}
                      rounded="md"
                      bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
                      _pressed={{ opacity: 0.6 }}
                    >
                      <Copy size={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
                    </Pressable>
                  </HStack>
                  <HStack space={1} alignItems="flex-start">
                    <Badge
                      bg={priorityColor.bg}
                      rounded="md"
                      _text={{
                        fontSize: 10,
                        fontFamily: 'Quicksand-SemiBold',
                        color: priorityColor.text,
                      }}
                    >
                      {purchaseRequest.prioritas?.toUpperCase()}
                    </Badge>
                    <Badge
                      bg={statusColor.bg}
                      rounded="md"
                      _text={{
                        fontSize: 10,
                        fontFamily: 'Quicksand-SemiBold',
                        color: statusColor.text,
                      }}
                    >
                      {purchaseRequest.status?.toUpperCase()}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

            </HStack>

            <Divider bg={cardBorder} />

            <VStack space={2}>
              <HStack space={2} alignItems="flex-start">
                <Box size={16} color={subtitleColor} />
                <VStack flex={1}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Deskripsi
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    {purchaseRequest.description || '-'}
                  </Text>
                </VStack>
              </HStack>

              <HStack space={2} alignItems="center">
                <Calendar size={16} color={subtitleColor} />
                <VStack flex={1}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Tanggal Request
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    {moment(purchaseRequest.date_ro).format('DD MMMM YYYY')}
                  </Text>
                </VStack>
              </HStack>

              <HStack space={2} alignItems="center">
                <TruckFast size={16} color={subtitleColor} />
                <VStack flex={1}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Gudang
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    {purchaseRequest.gudang?.nama || '-'}
                  </Text>
                </VStack>
              </HStack>

              <HStack space={2} alignItems="center">
                <User size={16} color={subtitleColor} />
                <VStack flex={1}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Dibuat oleh
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    {purchaseRequest.creator?.name || purchaseRequest.creator?.nama || purchaseRequest.creator?.username || purchaseRequest.creator?.fullname || '-'}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          <VStack space={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                Item Details ({purchaseRequest.items?.length || 0})
              </Text>
            </HStack>

            {purchaseRequest.items?.length === 0 ? (
              <Center py={10}>
                <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                  Tidak ada item
                </Text>
              </Center>
            ) : (
              <VStack space={3}>
                {purchaseRequest.items?.map(renderItemCard)}

                {canApprove && selectedItems.length > 0 && (
                  <VStack
                    bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
                    p={4}
                    rounded="xl"
                    borderWidth={1}
                    borderColor={mode === 'dark' ? '#10b981' : '#059669'}
                    space={3}
                  >
                    <HStack space={2} alignItems="center">
                      <TickCircle size={20} color={mode === 'dark' ? '#6ee7b7' : '#059669'} variant="Bold" />
                      <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                        {selectedItems.length} item dipilih
                      </Text>
                    </HStack>

                    <Button
                      onPress={handleBulkApproveClick}
                      bg={mode === 'dark' ? '#10b981' : '#059669'}
                      _pressed={{ bg: mode === 'dark' ? '#065f46' : '#047857' }}
                      rounded="lg"
                      py={3}
                      leftIcon={<TickCircle size={20} color="#ffffff" variant="Bold" />}
                    >
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                        Approve {selectedItems.length} Item Sekaligus
                      </Text>
                    </Button>
                  </VStack>
                )}
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Bulk Approve Confirmation Modal */}
      <Modal 
        isOpen={showBulkApproveModal} 
        onClose={() => !bulkApproving && setShowBulkApproveModal(false)}
        size="lg"
      >
        <Modal.Content bg={cardBg}>
          <Modal.CloseButton />
          <Modal.Header bg={cardBg} borderBottomWidth={1} borderBottomColor={cardBorder}>
            <HStack space={2} alignItems="center">
              <TickCircle size={24} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />
              <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
                Konfirmasi Bulk Approval
              </Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text fontSize="sm" fontFamily="Poppins-Regular" color={textColor}>
                Anda akan menyetujui <Text fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#10b981' : '#059669'}>{selectedItems.length} item</Text> sekaligus.
              </Text>

              <VStack 
                space={1} 
                bg={mode === 'dark' ? '#1f2937' : '#f9fafb'} 
                p={3} 
                rounded="lg"
              >
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Item yang dipilih:
                </Text>
                {selectedItems.map((itemId, idx) => {
                  const item = purchaseRequest.items.find(i => i.id === itemId);
                  return (
                    <HStack key={itemId} space={2} alignItems="center">
                      <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#10b981' : '#059669'}>
                        •
                      </Text>
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={textColor}>
                        {item?.barang?.nama || item?.barang?.nama_barang || `Item #${idx + 1}`}
                      </Text>
                    </HStack>
                  );
                })}
              </VStack>

              <VStack 
                space={1} 
                bg={mode === 'dark' ? '#7c2d12' : '#fef3c7'} 
                p={3} 
                rounded="lg"
              >
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fed7aa' : '#92400e'}>
                  ⚠️ Perhatian: Data yang sudah disetujui tidak dapat diubah kembali
                </Text>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer bg={cardBg} borderTopWidth={1} borderTopColor={cardBorder}>
            <HStack space={2} flex={1}>
              <Button
                flex={1}
                variant="ghost"
                onPress={() => setShowBulkApproveModal(false)}
                isDisabled={bulkApproving}
                _text={{
                  fontFamily: 'Quicksand-SemiBold',
                  color: subtitleColor,
                }}
              >
                Batal
              </Button>
              <Button
                flex={1}
                bg={mode === 'dark' ? '#10b981' : '#059669'}
                _pressed={{ bg: mode === 'dark' ? '#065f46' : '#047857' }}
                onPress={handleBulkApproveConfirm}
                isLoading={bulkApproving}
                isLoadingText="Menyetujui..."
                isDisabled={bulkApproving}
                _text={{
                  fontFamily: 'Quicksand-Bold',
                  color: '#ffffff',
                }}
                leftIcon={!bulkApproving && <TickCircle size={18} color="#ffffff" variant="Bold" />}
              >
                {bulkApproving ? 'Menyetujui...' : 'Ya, Setujui'}
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </AppScreen>
  );
}
