import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { VStack, HStack, Text, Center, Modal, Button } from 'native-base';
import { AppScreen } from '../../src/components/common';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Clock,
  TickCircle,
  Refresh,
  CloseCircle,
} from 'iconsax-react-native';
import { COLORS } from '../../src/constants/colors';
import {
  downloadSpecificData,
  downloadAllMasterData,
  clearDownloadStatus,
} from '../../src/store/slices/downloadSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DownloadDataScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';

  // Redux state
  const { downloadStatus, isDownloading, dataCounts, errors } = useSelector(state => state.download) || {};

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalSummary, setModalSummary] = useState({ success: 0, total: 0 });

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  // Data items available for download
  const dataItems = [
    { key: 'barang', name: 'Barang', icon: 'box' },
    { key: 'barangrack', name: 'Rak Barang', icon: 'layers' },
    { key: 'equipment', name: 'Equipment', icon: 'car' },
    { key: 'lokasipit', name: 'Lokasi Pit', icon: 'location' },
    { key: 'oprdrv', name: 'Operator Driver', icon: 'user' },
    { key: 'pemasok', name: 'Pemasok', icon: 'shopping-cart' },
    { key: 'penyewa', name: 'Penyewa', icon: 'people' },
    { key: 'shift', name: 'Shift', icon: 'clock' },
    { key: 'gudang', name: 'Gudang', icon: 'home' },
    { key: 'karyawan', name: 'Karyawan', icon: 'user-square' },
    { key: 'kegiatanpit', name: 'Kegiatan Pit', icon: 'task' },
  ];

  // Handle download all master data
  const handleDownloadAll = async () => {
    try {
      setRefreshing(true);
      const result = await dispatch(downloadAllMasterData()).unwrap();
      const success = (result || []).filter(r => r.success).length;
      const total = (result || []).length;
      setModalSummary({ success, total });
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Error', error || 'Gagal memperbaharui data');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle download specific item
  const handleDownloadItem = async (itemKey) => {
    try {
      setRefreshing(true);
      await dispatch(downloadSpecificData(itemKey)).unwrap();
      Alert.alert('Sukses', `${itemKey} berhasil didownload`);
    } catch (error) {
      Alert.alert('Error', `Gagal mendownload ${itemKey}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Clear download timestamp to force refresh on next app start
  const handleClearTimestamp = async () => {
    try {
      await AsyncStorage.removeItem('@masterDataLastFetch');
      Alert.alert(
        'Berhasil', 
        'Timestamp dihapus. Progress bar akan muncul saat restart app atau kembali ke Home.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus timestamp');
    }
  };

  // Render icon based on type
  const renderIcon = (iconType, color) => {
    const iconSize = 24;
    const iconProps = { size: iconSize, color, variant: 'Bold' };

    switch (iconType) {
      case 'box':
        return (
          <Text fontSize={iconSize} color={color}>
            📦
          </Text>
        );
      case 'layers':
        return (
          <Text fontSize={iconSize} color={color}>
            📚
          </Text>
        );
      case 'car':
        return (
          <Text fontSize={iconSize} color={color}>
            🚛
          </Text>
        );
      case 'location':
        return (
          <Text fontSize={iconSize} color={color}>
            📍
          </Text>
        );
      case 'user':
        return (
          <Text fontSize={iconSize} color={color}>
            👤
          </Text>
        );
      case 'shopping-cart':
        return (
          <Text fontSize={iconSize} color={color}>
            🛒
          </Text>
        );
      case 'people':
        return (
          <Text fontSize={iconSize} color={color}>
            👥
          </Text>
        );
      case 'clock':
        return (
          <Text fontSize={iconSize} color={color}>
            🕐
          </Text>
        );
      case 'home':
        return (
          <Text fontSize={iconSize} color={color}>
            🏠
          </Text>
        );
      case 'user-square':
        return (
          <Text fontSize={iconSize} color={color}>
            👨‍💼
          </Text>
        );
      case 'task':
        return (
          <Text fontSize={iconSize} color={color}>
            📋
          </Text>
        );
      default:
        return (
          <Text fontSize={iconSize} color={color}>
            ⬇️
          </Text>
        );
    }
  };

  // Render status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <ActivityIndicator size="small" color="#60a5fa" />;
      case 'success':
        return <TickCircle size={20} color="#10b981" variant="Bold" />;
      case 'error':
        return <CloseCircle size={20} color="#ef4444" variant="Bold" />;
      default:
        return <Clock size={20} color={subtitleColor} variant="Bold" />;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'loading':
        return 'Mengunduh...';
      case 'success':
        return 'Berhasil';
      case 'error':
        return 'Gagal';
      default:
        return 'Belum diunduh';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'loading':
        return '#60a5fa';
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return subtitleColor;
    }
  };

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        {/* Header */}
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <VStack flex={1}>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
              Download Master Data
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Download data master untuk penggunaan offline
            </Text>
          </VStack>
        </HStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isDownloading}
              onRefresh={handleDownloadAll}
              tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          <VStack space={4} p={4}>
            {/* Download All Button */}
            <TouchableOpacity
              onPress={handleDownloadAll}
              disabled={refreshing || isDownloading}
              style={{
                backgroundColor: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#3b82f6' : '#93c5fd',
              }}
            >
              <HStack space={4} alignItems="center" justifyContent="center">
                {refreshing || isDownloading ? (
                  <>
                    <ActivityIndicator size="small" color={mode === 'dark' ? '#93c5fd' : '#1e40af'} />
                    <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#dbeafe' : '#1e3a8a'}>
                      Mendownload Semua Data...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text fontSize={24}>⬇️</Text>
                    <VStack>
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#FFF' : '#000'}>
                        Download Semua Master Data
                      </Text>
                      <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'}>
                        Tarik ke bawah untuk refresh semua data
                      </Text>
                    </VStack>
                  </>
                )}
              </HStack>
            </TouchableOpacity>

            {/* Reset Auto-Sync Button - untuk testing progress bar */}
            <TouchableOpacity
              onPress={handleClearTimestamp}
              style={{
                backgroundColor: mode === 'dark' ? '#7c2d12' : '#fff7ed',
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#ea580c' : '#fdba74',
              }}
            >
              <HStack space={3} alignItems="center" justifyContent="center">
                <Text fontSize={18}>🔄</Text>
                <VStack>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fed7aa' : '#9a3412'}>
                    Reset Auto-Sync Timer
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fdba74' : '#c2410c'}>
                    Progress bar akan muncul saat kembali ke Home
                  </Text>
                </VStack>
              </HStack>
            </TouchableOpacity>

            {/* Data Items List */}
            <VStack space={3}>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor} mb={2}>
                Daftar Master Data
              </Text>

              {dataItems.map((item) => {
                const status = downloadStatus?.[item.key];
                const count = dataCounts?.[item.key];
                const error = errors?.[item.key];

                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => handleDownloadItem(item.key)}
                    disabled={status === 'loading'}
                    style={{
                      backgroundColor: cardBg,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: status === 'error' ? '#ef4444' : borderColor,
                    }}
                  >
                    <HStack space={3} alignItems="center" justifyContent="space-between">
                      <HStack space={3} alignItems="center" flex={1}>
                        <Center w={12} h={12} bg={mode === 'dark' ? '#374151' : '#f3f4f6'} rounded="xl">
                          {renderIcon(item.icon, mode === 'dark' ? '#60a5fa' : '#2563eb')}
                        </Center>
                        <VStack flex={1}>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                              {item.name}
                            </Text>
                            {status === 'loading' && (
                              <ActivityIndicator size="small" color="#60a5fa" />
                            )}
                          </HStack>
                          <HStack alignItems="center" space={2} mt={1}>
                            {renderStatusIcon(status)}
                            <Text fontSize="xs" fontFamily="Poppins-Light" color={getStatusColor(status)}>
                              {getStatusText(status)}
                              {count !== undefined && status === 'success' && ` (${count} item)`}
                            </Text>
                          </HStack>
                          {error && (
                            <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444" mt={1}>
                              {error}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <Refresh
                        size={20}
                        color={status === 'loading' ? '#9ca3af' : mode === 'dark' ? '#60a5fa' : '#2563eb'}
                        variant="Bold"
                      />
                    </HStack>
                  </TouchableOpacity>
                );
              })}
            </VStack>

            <VStack h={20} />
          </VStack>
        </ScrollView>

        {/* Success Modal */}
        <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} size="md">
          <Modal.Content maxWidth="400" bg={cardBg} borderRadius={20}>
            <Modal.Body p={6}>
              <VStack space={4} alignItems="center">
                <Center w={20} h={20} bg={mode === 'dark' ? '#065f46' : '#d1fae5'} rounded="full">
                  <Check size={36} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />
                </Center>
                <VStack alignItems="center" space={2}>
                  <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor} textAlign="center">
                    Download Selesai!
                  </Text>
                  <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
                    {modalSummary.success} dari {modalSummary.total} data berhasil didownload
                  </Text>
                </VStack>
                <Button
                  mt={2}
                  w="full"
                  bg={mode === 'dark' ? '#3b82f6' : '#2563eb'}
                  _pressed={{ bg: mode === 'dark' ? '#2563eb' : '#1d4ed8' }}
                  onPress={() => setShowSuccessModal(false)}
                  rounded="xl"
                >
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                    Tutup
                  </Text>
                </Button>
              </VStack>
            </Modal.Body>
          </Modal.Content>
        </Modal>

        {/* Footer - SQLite Query Button */}
        <VStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg={cardBg}
          borderTopWidth={1}
          borderTopColor={borderColor}
          p={4}
          shadow={6}
        >
          <TouchableOpacity
            onPress={() => router.push('/setting/sqlite-query-screen')}
            style={{
              backgroundColor: mode === 'dark' ? '#7c3aed' : '#8b5cf6',
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <VStack flex={1} alignItems="center">
              <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                SQLite Query Tool
              </Text>
              <Text fontSize="xs" fontFamily="Poppins-Light" color="#e9d5ff">
                Live query ke database local
              </Text>
            </VStack>
          </TouchableOpacity>
        </VStack>
      </VStack>
    </AppScreen>
  );
}
