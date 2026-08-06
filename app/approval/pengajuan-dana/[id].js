import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Calendar, User, Building, Location, Money,
  DocumentText, TickCircle, CloseCircle, InfoCircle, CloseSquare,
  ArrowLeft2, ArrowRight2, Copy, DocumentUpload
} from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Badge, Center, HStack, Pressable, ScrollView, Spinner, Text, VStack, Modal, Button, TextArea, useToast } from 'native-base';
import { TouchableOpacity, RefreshControl, Image, Dimensions, Linking } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';

moment.locale('id');

const { width, height } = Dimensions.get('window');

const DEFAULT_DETAIL_PERMISSIONS = {
  can_read: false,
  can_insert: false,
  can_update: false,
  can_remove: false,
  can_approve: false,
  can_verify: false,
  can_reject: false,
  can_return: false,
  can_validate: false,
  can_upload_attachment: false,
};

const isPdfAttachment = file => String(file?.datatype || '').toLowerCase() === 'pdf' || String(file?.url || '').toLowerCase().endsWith('.pdf');

export default function PengajuanDanaDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pengajuan, setPengajuan] = useState(null);
  const [permissions, setPermissions] = useState(DEFAULT_DETAIL_PERMISSIONS);
  const [detailError, setDetailError] = useState(null);
  const [permissionsError, setPermissionsError] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('info');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const toast = useToast();

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';
  const imageFiles = (pengajuan?.files || []).filter(file => !isPdfAttachment(file));

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setDetailError(null);
    setPermissionsError(null);
    setPermissionsLoaded(false);

    try {
      const [detailResult, permissionsResult] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.PENGAJUAN.DETAIL(id)),
        apiClient.get(API_ENDPOINTS.PENGAJUAN.PERMISSIONS(id))
      ]);

      if (detailResult.status === 'fulfilled' && detailResult.value.data.success) {
        setPengajuan(detailResult.value.data.data);
      } else {
        const error = detailResult.status === 'rejected'
          ? detailResult.reason
          : new Error(detailResult.value.data?.message || 'Gagal memuat detail Pengajuan Dana');
        setDetailError(error);
      }

      if (permissionsResult.status === 'fulfilled' && permissionsResult.value.data.success) {
        setPermissions({
          ...DEFAULT_DETAIL_PERMISSIONS,
          ...permissionsResult.value.data?.data?.permissions,
        });
        setPermissionsLoaded(true);
      } else {
        const error = permissionsResult.status === 'rejected'
          ? permissionsResult.reason
          : new Error(permissionsResult.value.data?.message || 'Gagal memuat hak akses Pengajuan Dana');
        setPermissionsError(error);
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    setPengajuan(null);
    fetchDetail();
  }, [fetchDetail]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const handleUploadAttachment = async () => {
    if (attachmentLoading || !permissions.can_upload_attachment) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/gif'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const oversized = result.assets.find(file => Number(file.size || 0) > 10 * 1024 * 1024);
    if (oversized) {
      toast.show({ description: `${oversized.name} melebihi batas 10 MB`, placement: 'top', bg: '#dc2626' });
      return;
    }

    const formData = new FormData();
    result.assets.forEach((file, index) => {
      formData.append('lampiran', {
        uri: file.uri,
        name: file.name || `nota-${index + 1}.jpg`,
        type: file.mimeType || 'image/jpeg',
      });
    });

    try {
      setAttachmentLoading(true);
      const response = await apiClient.post(API_ENDPOINTS.PENGAJUAN.ATTACHMENTS(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!response.data?.success) throw new Error(response.data?.message || 'Gagal mengunggah nota tambahan');

      toast.show({ description: response.data.message || 'Nota tambahan berhasil diunggah', placement: 'top', bg: '#059669' });
      await fetchDetail();
    } catch (error) {
      toast.show({ description: error?.response?.data?.message || error.message || 'Gagal mengunggah nota tambahan', placement: 'top', bg: '#dc2626' });
    } finally {
      setAttachmentLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient.post(API_ENDPOINTS.PENGAJUAN.APPROVE(id), {
        items: pengajuan.items,
        notes: ''
      });

      if (response.data.success) {
        toast.show({
          description: 'Pengajuan dana berhasil diapprove',
          placement: 'top',
          duration: 3000,
          bg: mode === 'dark' ? '#10b981' : '#059669',
          _text: { color: 'white' }
        });
        fetchDetail();
      }
    } catch (error) {
      console.error('Error approving:', error);
      toast.show({
        description: error.response?.data?.message || 'Gagal approve pengajuan dana',
        placement: 'top',
        duration: 3000,
        bg: mode === 'dark' ? '#ef4444' : '#dc2626',
        _text: { color: 'white' }
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.show({
        description: 'Alasan penolakan harus diisi',
        placement: 'top',
        duration: 3000,
        bg: mode === 'dark' ? '#f59e0b' : '#d97706',
        _text: { color: 'white' }
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiClient.post(API_ENDPOINTS.PENGAJUAN.REJECT(id), {
        reason: rejectReason
      });

      if (response.data.success) {
        setShowRejectModal(false);
        setRejectReason('');
        toast.show({
          description: 'Pengajuan dana berhasil ditolak',
          placement: 'top',
          duration: 3000,
          bg: mode === 'dark' ? '#ef4444' : '#dc2626',
          _text: { color: 'white' }
        });
        fetchDetail();
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.show({
        description: error.response?.data?.message || 'Gagal reject pengajuan dana',
        placement: 'top',
        duration: 3000,
        bg: mode === 'dark' ? '#ef4444' : '#dc2626',
        _text: { color: 'white' }
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient.post(API_ENDPOINTS.PENGAJUAN.VERIFY(id));

      if (response.data.success) {
        toast.show({
          description: 'Pengajuan dana berhasil diverifikasi',
          placement: 'top',
          duration: 3000,
          bg: mode === 'dark' ? '#3b82f6' : '#2563eb',
          _text: { color: 'white' }
        });
        fetchDetail();
      }
    } catch (error) {
      console.error('Error verifying:', error);
      toast.show({
        description: error.response?.data?.message || 'Gagal verify pengajuan dana',
        placement: 'top',
        duration: 3000,
        bg: mode === 'dark' ? '#ef4444' : '#dc2626',
        _text: { color: 'white' }
      });
    } finally {
      setActionLoading(false);
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
        label: 'Paid', 
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
          fontSize: 11, 
          fontFamily: 'Quicksand-SemiBold' 
        }}
        rounded="md"
        px={3}
        py={1}
      >
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return `Rp ${parseFloat(amount).toLocaleString('id-ID')}`;
  };

  const handleCopyKode = async () => {
    if (pengajuan?.kode) {
      await Clipboard.setStringAsync(pengajuan.kode);
      toast.show({
        description: 'Kode pengajuan berhasil disalin',
        placement: 'top',
        duration: 2000,
        bg: mode === 'dark' ? '#10b981' : '#059669',
        _text: { color: 'white' }
      });
    }
  };



  const renderInfoTab = () => (
    <VStack space={4} p={4}>
      <VStack
        bg={cardBg}
        p={4}
        rounded="xl"
        borderWidth={1}
        borderColor={borderColor}
        space={3}
      >
        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
          Informasi Pengajuan
        </Text>

        <Pressable onPress={handleCopyKode}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center" flex={1}>
              <DocumentText size={16} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Kode Pengajuan
              </Text>
            </HStack>
            <HStack space={2} alignItems="center">
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
                {pengajuan?.kode || '-'}
              </Text>
              <Copy size={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
            </HStack>
          </HStack>
        </Pressable>

        <VStack 
          pt={2} 
          borderTopWidth={1} 
          borderTopColor={borderColor}
        />

        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={2} alignItems="center" flex={1}>
            <Building size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Bisnis Unit
            </Text>
          </HStack>
          <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
            {pengajuan?.bisnis?.name || '-'}
          </Text>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={2} alignItems="center" flex={1}>
            <Location size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Cabang
            </Text>
          </HStack>
          <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
            {pengajuan?.cabang?.nama || '-'}
          </Text>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={2} alignItems="center" flex={1}>
            <Calendar size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Tanggal Transaksi
            </Text>
          </HStack>
          <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
            {pengajuan?.trx_date ? moment(pengajuan.trx_date).format('DD MMMM YYYY') : '-'}
          </Text>
        </HStack>

        <VStack 
          pt={3} 
          borderTopWidth={1} 
          borderTopColor={borderColor}
          space={2}
        >
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
            Keterangan
          </Text>
          <Text fontSize="sm" fontFamily="Quicksand-Medium" color={textColor}>
            {pengajuan?.narasi || 'Tidak ada keterangan'}
          </Text>
        </VStack>
      </VStack>

      <VStack
        bg={cardBg}
        p={4}
        rounded="xl"
        borderWidth={1}
        borderColor={borderColor}
        space={3}
      >
        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
          Dibuat Oleh
        </Text>

        <VStack space={2}>
          <HStack space={2} alignItems="center">
            <User size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Dibuat oleh
            </Text>
          </HStack>
          <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor} pl={6}>
            {pengajuan?.creator 
              ? (pengajuan.creator.nama_lengkap || pengajuan.creator.name || pengajuan.creator.nama || pengajuan.creator.username || 'Tidak diketahui')
              : 'Data creator tidak tersedia'}
          </Text>
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} pl={6}>
            {pengajuan?.created_at ? moment(pengajuan.created_at).format('DD MMMM YYYY, HH:mm') : 'Tanggal tidak tersedia'}
          </Text>
        </VStack>
      </VStack>

      {((pengajuan?.files && pengajuan.files.length > 0) || permissions.can_upload_attachment) && (
        <VStack
          bg={cardBg}
          p={4}
          rounded="xl"
          borderWidth={1}
          borderColor={borderColor}
          space={3}
        >
          <HStack justifyContent="space-between" alignItems="center" space={2}>
            <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
              Lampiran ({pengajuan?.files?.length || 0})
            </Text>
            {permissions.can_upload_attachment && (
              <Button size="sm" leftIcon={<DocumentUpload size={16} color="#ffffff" />} isLoading={attachmentLoading} onPress={handleUploadAttachment}>
                Upload Nota
              </Button>
            )}
          </HStack>

          <HStack flexWrap="wrap" space={2}>
            {pengajuan.files.map((file, index) => (
              <Pressable 
                key={index}
                onPress={() => {
                  if (isPdfAttachment(file)) {
                    Linking.openURL(file.url);
                    return;
                  }
                  setSelectedImageIndex(imageFiles.findIndex(image => image.id === file.id));
                  setShowImageViewer(true);
                }}
                width={(width - 64) / 3}
                height={100}
                mb={2}
              >
                {isPdfAttachment(file) ? (
                  <Center flex={1} bg={mode === 'dark' ? '#374151' : '#f3f4f6'} rounded="lg">
                    <DocumentText size={28} color={subtitleColor} />
                    <Text mt={1} fontSize="xs" color={subtitleColor}>PDF</Text>
                  </Center>
                ) : (
                  <Image
                    source={{ uri: file.url }}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    resizeMode="cover"
                  />
                )}
              </Pressable>
            ))}
          </HStack>
        </VStack>
      )}
    </VStack>
  );

  const renderItemsTab = () => (
    <VStack space={3} p={4}>
      {pengajuan?.items && pengajuan.items.map((item, index) => (
        <VStack
          key={index}
          bg={cardBg}
          p={4}
          rounded="xl"
          borderWidth={1}
          borderColor={borderColor}
          space={3}
        >
          <HStack justifyContent="space-between">
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Item #{index + 1}
            </Text>
          </HStack>

          <VStack space={2}>
            <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
              {item.coa?.coa_name || item.coa?.nama || 'COA tidak ditemukan'}
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {item.coa?.kode || '-'}
            </Text>
          </VStack>

          <HStack 
            bg={mode === 'dark' ? '#111827' : '#f9fafb'}
            p={3}
            rounded="lg"
            justifyContent="space-between"
          >
            <VStack flex={1}>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Qty × Harga
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                {item.qty} × {formatCurrency(item.harga)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Subtotal
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                {formatCurrency(item.total)}
              </Text>
            </VStack>
          </HStack>

          {item.potongan > 0 && (
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Potongan
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-Medium" color="#ef4444">
                - {formatCurrency(item.potongan)}
              </Text>
            </HStack>
          )}

          {item.ppn > 0 && (
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                PPN ({item.ppn}%)
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-Medium" color={textColor}>
                {formatCurrency(item.ppn_rp)}
              </Text>
            </HStack>
          )}

          <HStack 
            justifyContent="space-between" 
            alignItems="center"
            pt={2}
            borderTopWidth={1}
            borderTopColor={borderColor}
          >
            <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
              Grand Total
            </Text>
            <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#10b981' : '#059669'}>
              {formatCurrency(item.grandtotal)}
            </Text>
          </HStack>

          {item.nm_penerima && (
            <VStack 
              pt={2}
              borderTopWidth={1}
              borderTopColor={borderColor}
              space={1}
            >
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Penerima
              </Text>
              <Text fontSize="sm" fontFamily="Quicksand-Medium" color={textColor}>
                {item.nm_penerima}
              </Text>
              {item.no_rekening && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  {item.nm_bank} - {item.no_rekening}
                </Text>
              )}
            </VStack>
          )}

          {item.narasi && (
            <VStack space={1}>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Keterangan
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-Medium" color={textColor}>
                {item.narasi}
              </Text>
            </VStack>
          )}
        </VStack>
      ))}

      <VStack
        bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
        p={4}
        rounded="xl"
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Text 
            fontSize="sm" 
            fontFamily="Quicksand-Bold" 
            color={mode === 'dark' ? '#d1fae5' : '#065f46'}
          >
            Total Keseluruhan
          </Text>
          <Text 
            fontSize="xl" 
            fontFamily="Quicksand-Bold" 
            color={mode === 'dark' ? '#6ee7b7' : '#047857'}
          >
            {formatCurrency(pengajuan?.total)}
          </Text>
        </HStack>
        <Text 
          fontSize="xs" 
          fontFamily="Poppins-Light" 
          color={mode === 'dark' ? '#d1fae5' : '#065f46'}
          mt={1}
        >
          Total dari {pengajuan?.items?.length || 0} item
        </Text>
      </VStack>
    </VStack>
  );

  const renderHistoryTab = () => (
    <VStack space={3} p={4}>
      <VStack
        bg={cardBg}
        p={4}
        rounded="xl"
        borderWidth={1}
        borderColor={borderColor}
      >
        <VStack space={4}>
          <HStack space={3} alignItems="flex-start">
            <VStack alignItems="center">
              <VStack
                bg={mode === 'dark' ? '#10b981' : '#d1fae5'}
                p={2}
                rounded="full"
              >
                <TickCircle size={20} color={mode === 'dark' ? '#d1fae5' : '#059669'} variant="Bold" />
              </VStack>
              {(pengajuan?.status === 'approval' || pengajuan?.status === 'close') && (
                <VStack h={8} w={0.5} bg={borderColor} />
              )}
            </VStack>

            <VStack flex={1}>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Created
              </Text>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {pengajuan?.creator 
                  ? `by ${pengajuan.creator.nama_lengkap || pengajuan.creator.name || pengajuan.creator.nama || pengajuan.creator.username || 'Unknown User'}`
                  : 'by Unknown User (data tidak tersedia)'}
              </Text>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {pengajuan?.created_at ? moment(pengajuan.created_at).format('DD MMM YYYY, HH:mm') : 'Tanggal tidak tersedia'}
              </Text>
            </VStack>
          </HStack>

          {(pengajuan?.status === 'approval' || pengajuan?.status === 'close') && (
            <HStack space={3} alignItems="flex-start">
              <VStack alignItems="center">
                <VStack
                  bg={mode === 'dark' ? '#3b82f6' : '#dbeafe'}
                  p={2}
                  rounded="full"
                >
                  <TickCircle size={20} color={mode === 'dark' ? '#dbeafe' : '#2563eb'} variant="Bold" />
                </VStack>
                {pengajuan?.status === 'close' && (
                  <VStack h={8} w={0.5} bg={borderColor} />
                )}
              </VStack>

              <VStack flex={1}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Approved
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  {pengajuan?.checker 
                    ? `by ${pengajuan.checker.nama_lengkap || pengajuan.checker.name || pengajuan.checker.nama || pengajuan.checker.username || 'Unknown User'}`
                    : 'by Unknown User'}
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  {pengajuan?.checked_at ? moment(pengajuan.checked_at).format('DD MMM YYYY, HH:mm') : 'Belum ada tanggal approval'}
                </Text>
              </VStack>
            </HStack>
          )}

          {pengajuan?.status === 'close' && (
            <HStack space={3} alignItems="flex-start">
              <VStack
                bg={mode === 'dark' ? '#10b981' : '#d1fae5'}
                p={2}
                rounded="full"
              >
                <Money size={20} color={mode === 'dark' ? '#d1fae5' : '#059669'} variant="Bold" />
              </VStack>

              <VStack flex={1}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Verified & Paid
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  {pengajuan?.validator 
                    ? `by ${pengajuan.validator.nama_lengkap || pengajuan.validator.name || pengajuan.validator.nama || pengajuan.validator.username || 'Unknown User'}`
                    : 'by Unknown User'}
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  {pengajuan?.validated_at ? moment(pengajuan.validated_at).format('DD MMM YYYY, HH:mm') : 'Belum ada tanggal verifikasi'}
                </Text>
              </VStack>
            </HStack>
          )}

          {pengajuan?.status === 'reject' && (
            <HStack space={3} alignItems="flex-start">
              <VStack
                bg={mode === 'dark' ? '#7f1d1d' : '#fee2e2'}
                p={2}
                rounded="full"
              >
                <CloseCircle size={20} color={mode === 'dark' ? '#fee2e2' : '#dc2626'} variant="Bold" />
              </VStack>

              <VStack flex={1}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Rejected
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  by {pengajuan?.rejector || '-'}
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  {pengajuan?.rejected_at ? moment(pengajuan.rejected_at).format('DD MMM YYYY, HH:mm') : '-'}
                </Text>
              </VStack>
            </HStack>
          )}
        </VStack>
      </VStack>
    </VStack>
  );

  if (loading) {
    return (
      <AppScreen>
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
              Detail Pengajuan Dana
            </Text>
          </HStack>

          <LoadingHauler
            message="Memuat detail..."
            subMessage="Mengambil detail pengajuan dana dari server"
            type="default"
          />
        </VStack>
      </AppScreen>
    );
  }

  if ((permissionsLoaded && !permissions.can_read) || (!pengajuan && detailError)) {
    const isDenied = permissionsLoaded && !permissions.can_read;
    return (
      <AppScreen>
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>Detail Pengajuan Dana</Text>
          </HStack>
          <Center flex={1} px={6}>
            <InfoCircle size={64} color={subtitleColor} variant="Bulk" />
            <Text mt={4} fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>
              {isDenied ? 'Akses ditolak' : 'Gagal memuat detail'}
            </Text>
            <Text mt={1} textAlign="center" fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
              {isDenied
                ? 'Anda tidak memiliki hak akses untuk melihat Pengajuan Dana ini.'
                : 'Terjadi kesalahan saat mengambil detail. Silakan coba lagi.'}
            </Text>
            {!isDenied && <Button mt={5} onPress={fetchDetail}>Coba Lagi</Button>}
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
            Detail Pengajuan Dana
          </Text>
        </HStack>

        {(permissionsError || detailError) && (
          <VStack mx={4} mt={4} p={3} rounded="lg" bg={mode === 'dark' ? '#78350f' : '#fef3c7'}>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fde68a' : '#92400e'}>
              {permissionsError
                ? 'Hak akses tindakan gagal dimuat. Detail tetap ditampilkan, tetapi tindakan dinonaktifkan.'
                : 'Pembaruan detail gagal. Data terakhir yang berhasil dimuat tetap ditampilkan.'}
            </Text>
            <Pressable mt={2} onPress={fetchDetail}>
              <Text fontSize="xs" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fbbf24' : '#b45309'}>
                Coba Lagi
              </Text>
            </Pressable>
          </VStack>
        )}

        <VStack
          bg={mode === 'dark' ? '#7c2d12' : '#ea580c'}
          p={4}
          space={2}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
              Total Amount
            </Text>
            {getStatusBadge(pengajuan?.status)}
          </HStack>
          <Text fontSize="2xl" fontFamily="Quicksand-Bold" color="#ffffff">
            {formatCurrency(pengajuan?.total)}
          </Text>
        </VStack>

        <HStack 
          bg={cardBg} 
          p={1} 
          m={4} 
          rounded="xl" 
          borderWidth={1} 
          borderColor={borderColor}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('info')}
          >
            <VStack
              bg={selectedTab === 'info' ? (mode === 'dark' ? '#374151' : '#f3f4f6') : 'transparent'}
              py={2}
              rounded="lg"
              alignItems="center"
            >
              <Text 
                fontSize="xs" 
                fontFamily="Quicksand-SemiBold"
                color={selectedTab === 'info' ? textColor : subtitleColor}
              >
                Info
              </Text>
            </VStack>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('items')}
          >
            <VStack
              bg={selectedTab === 'items' ? (mode === 'dark' ? '#374151' : '#f3f4f6') : 'transparent'}
              py={2}
              rounded="lg"
              alignItems="center"
            >
              <Text 
                fontSize="xs" 
                fontFamily="Quicksand-SemiBold"
                color={selectedTab === 'items' ? textColor : subtitleColor}
              >
                Items
              </Text>
            </VStack>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('history')}
          >
            <VStack
              bg={selectedTab === 'history' ? (mode === 'dark' ? '#374151' : '#f3f4f6') : 'transparent'}
              py={2}
              rounded="lg"
              alignItems="center"
            >
              <Text 
                fontSize="xs" 
                fontFamily="Quicksand-SemiBold"
                color={selectedTab === 'history' ? textColor : subtitleColor}
              >
                History
              </Text>
            </VStack>
          </TouchableOpacity>
        </HStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          {selectedTab === 'info' && renderInfoTab()}
          {selectedTab === 'items' && renderItemsTab()}
          {selectedTab === 'history' && renderHistoryTab()}
        </ScrollView>

        {pengajuan && !permissionsError && (permissions.can_approve || permissions.can_verify || permissions.can_reject) && (
          <VStack
            bg={cardBg}
            p={4}
            space={2}
            borderTopWidth={1}
            borderTopColor={borderColor}
          >
            {permissions.can_approve && (
              <HStack space={2}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={handleApprove}
                  disabled={actionLoading}
                >
                  <VStack
                    bg={mode === 'dark' ? '#065f46' : '#10b981'}
                    py={3}
                    rounded="xl"
                    alignItems="center"
                  >
                    {actionLoading ? (
                      <Spinner size="sm" color="#ffffff" />
                    ) : (
                      <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                        Approve
                      </Text>
                    )}
                  </VStack>
                </TouchableOpacity>

                {permissions.can_reject && (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    <VStack
                      bg={mode === 'dark' ? '#7f1d1d' : '#ef4444'}
                      py={3}
                      rounded="xl"
                      alignItems="center"
                    >
                      <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                        Reject
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                )}
              </HStack>
            )}

            {permissions.can_verify && (
              <HStack space={2}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={handleVerify}
                  disabled={actionLoading}
                >
                  <VStack
                    bg={mode === 'dark' ? '#1e40af' : '#3b82f6'}
                    py={3}
                    rounded="xl"
                    alignItems="center"
                  >
                    {actionLoading ? (
                      <Spinner size="sm" color="#ffffff" />
                    ) : (
                      <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                        Verify & Payment
                      </Text>
                    )}
                  </VStack>
                </TouchableOpacity>

                {permissions.can_reject && (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    <VStack
                      bg={mode === 'dark' ? '#7f1d1d' : '#ef4444'}
                      py={3}
                      rounded="xl"
                      alignItems="center"
                    >
                      <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                        Reject
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                )}
              </HStack>
            )}

            {!permissions.can_approve && !permissions.can_verify && permissions.can_reject && (
              <TouchableOpacity
                onPress={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <VStack
                  bg={mode === 'dark' ? '#7f1d1d' : '#ef4444'}
                  py={3}
                  rounded="xl"
                  alignItems="center"
                >
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                    Reject
                  </Text>
                </VStack>
              </TouchableOpacity>
            )}
          </VStack>
        )}

        <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Alasan Penolakan</Modal.Header>
            <Modal.Body>
              <VStack space={3}>
                <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                  Mohon isi alasan penolakan pengajuan dana ini:
                </Text>
                <TextArea
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder="Masukkan alasan penolakan..."
                  h={100}
                  autoCompleteType={undefined}
                />
              </VStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="gray"
                  onPress={() => setShowRejectModal(false)}
                >
                  Batal
                </Button>
                <Button
                  colorScheme="danger"
                  onPress={handleReject}
                  isLoading={actionLoading}
                >
                  Tolak
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>

        <Modal 
          isOpen={showImageViewer} 
          onClose={() => setShowImageViewer(false)}
          size="full"
        >
          <Modal.Content 
            width={width} 
            height={height}
            bg="black"
            m={0}
            borderRadius={0}
          >
            <VStack flex={1} bg="black">
              <HStack 
                p={4} 
                justifyContent="space-between" 
                alignItems="center"
                bg="rgba(0,0,0,0.8)"
                zIndex={9999}
              >
                <Text fontSize="md" fontFamily="Quicksand-SemiBold" color="white">
                  {selectedImageIndex + 1} / {imageFiles.length}
                </Text>
                <Pressable 
                  onPress={() => {
                    setShowImageViewer(false);
                  }}
                  p={2}
                  _pressed={{ opacity: 0.7 }}
                >
                  <CloseSquare size={32} color="white" variant="Bold" />
                </Pressable>
              </HStack>

              <Center flex={1}>
                {imageFiles[selectedImageIndex] && (
                  <Image
                    source={{ uri: imageFiles[selectedImageIndex].url }}
                    style={{
                      width: width,
                      height: height - 100,
                    }}
                    resizeMode="contain"
                  />
                )}
              </Center>

              {imageFiles.length > 1 && (
                <HStack 
                  justifyContent="space-between" 
                  alignItems="center"
                  p={4}
                  bg="rgba(0,0,0,0.8)"
                  zIndex={9999}
                >
                  <Pressable
                    onPress={() => {
                      if (selectedImageIndex > 0) {
                        setSelectedImageIndex(selectedImageIndex - 1);
                      }
                    }}
                    disabled={selectedImageIndex === 0}
                    opacity={selectedImageIndex === 0 ? 0.3 : 1}
                    p={2}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <ArrowLeft2 size={32} color="white" variant="Bold" />
                  </Pressable>

                  <Text fontSize="sm" fontFamily="Poppins-Light" color="white">
                    {selectedImageIndex + 1} / {imageFiles.length}
                  </Text>

                  <Pressable
                    onPress={() => {
                      if (selectedImageIndex < imageFiles.length - 1) {
                        setSelectedImageIndex(selectedImageIndex + 1);
                      }
                    }}
                    disabled={selectedImageIndex === imageFiles.length - 1}
                    opacity={selectedImageIndex === imageFiles.length - 1 ? 0.3 : 1}
                    p={2}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <ArrowRight2 size={32} color="white" variant="Bold" />
                  </Pressable>
                </HStack>
              )}
            </VStack>
          </Modal.Content>
        </Modal>
      </VStack>
    </AppScreen>
  );
}
