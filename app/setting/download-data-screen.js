import React, { useState, useMemo } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  DeviceEventEmitter,
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
  SidebarBottom,
  DriverRefresh
} from 'iconsax-react-native';
import { COLORS } from '../../src/constants/colors';
import {
  downloadSpecificData,
  clearDownloadStatus,
  setDownloadStatus,
} from '../../src/store/slices/downloadSlice';
import { loadSQLiteDataToRedux } from '../../src/store/slices/appSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '../../src/database/SQLiteService';
import MasterDataProgress from '../../src/components/common/MasterDataProgress';

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
  const [showMasterProgress, setShowMasterProgress] = useState(false);
  const [masterProgress, setMasterProgress] = useState(0);
  const [currentMasterStep, setCurrentMasterStep] = useState('');
  const [syncedCount, setSyncedCount] = useState(0);

  const backgroundColor = mode === 'dark' ? '#0B1224' : '#f8fafc';
  const textColor = mode === 'dark' ? '#E5E7EB' : '#0f172a';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#475569';
  const cardBg = mode === 'dark' ? '#111827' : '#ffffff';
  const borderColor = mode === 'dark' ? '#1f2937' : '#e2e8f0';
  const accent = mode === 'dark' ? '#60a5fa' : '#2563eb';

  const summary = useMemo(() => {
    const statuses = Object.values(downloadStatus || {});
    const completed = statuses.filter(s => s === 'success').length;
    const failed = statuses.filter(s => s === 'error').length;
    const inProgress = statuses.filter(s => s === 'loading').length;
    return { completed, failed, inProgress };
  }, [downloadStatus]);

  // Data items available for download (aligned with downloadSpecificData config)
  const dataItems = useMemo(() => ([
    { key: 'barang', name: 'Barang', icon: 'box' },
    { key: 'equipment', name: 'Equipment', icon: 'car' },
    { key: 'lokasipit', name: 'Lokasi Pit', icon: 'location' },
    { key: 'oprdrv', name: 'Operator Driver', icon: 'user' },
    { key: 'pemasok', name: 'Pemasok', icon: 'shopping-cart' },
    { key: 'penyewa', name: 'Penyewa', icon: 'people' },
    { key: 'shift', name: 'Shift', icon: 'clock' },
    { key: 'gudang', name: 'Gudang', icon: 'home' },
    { key: 'karyawan', name: 'Karyawan', icon: 'user-square' },
    { key: 'pengawas', name: 'Pengawas', icon: 'user-tick' },
    { key: 'kegiatanpit', name: 'Kegiatan Pit', icon: 'task' },
  ]), []);

  // Handle download all master data
  const handleDownloadAll = async () => {
    const queue = dataItems;
    const totalSteps = queue.length;

    try {
      setRefreshing(true);
      setShowMasterProgress(true);
      setMasterProgress(0);
      setCurrentMasterStep('Menyiapkan ulang data master...');
      setSyncedCount(0);
      setTimeout(() => setMasterProgress(5), 100); // kick-start bar

      // Reset status & clear local caches to force repopulate SQLite
      dispatch(clearDownloadStatus());

      // Ensure DB ready before clearing / syncing (with timeout so UI tidak hang)
      try {
        setCurrentMasterStep('Inisialisasi database lokal...');
        const initTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('init-timeout')), 2000));
        await Promise.race([database.ensureInitialized(), initTimeout]);
        console.log('[DownloadData] SQLite initialized');
      } catch (err) {
        console.warn('[DownloadData] Init DB gagal / timeout, lanjut tanpa blocking:', err?.message || err);
      }

      const storageKeys = [
        '@barang', '@equipment', '@lokasipit', '@oprdrv', '@pemasok',
        '@penyewa', '@shift', '@gudang', '@karyawan', '@kegiatan-pit',
        '@masterDataLastFetch'
      ];

      const masterTables = [
        'master_barang', 'master_equipment', 'master_lokasipit', 'master_oprdrv',
        'master_pemasok', 'master_penyewa', 'master_shift', 'master_gudang',
        'master_karyawan', 'master_kegiatanpit'
      ];

      // Clear cache keys in parallel (non-blocking if some fail)
      await Promise.allSettled(storageKeys.map(key => AsyncStorage.removeItem(key).catch(() => {})));

      // Clear master tables sequentially with timeout guard (1.5s) to prevent hang
      const clearWithTimeout = async (table) => {
        console.log('[DownloadData] Clearing table', table);
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
        await Promise.race([
          database.clear(table),
          timeout,
        ]);
        console.log('[DownloadData] Cleared table', table);
      };

      for (const table of masterTables) {
        try {
          await clearWithTimeout(table);
        } catch (err) {
          console.warn('[DownloadData] Gagal clear table', table, err?.message || err);
        }
      }

      setMasterProgress(12);
      setCurrentMasterStep('Clear cache & SQLite selesai, mulai unduh...');

      let successCount = 0;
      let totalSynced = 0;
      console.log('[DownloadData] Mulai loop download, total langkah:', totalSteps);

      for (let i = 0; i < totalSteps; i++) {
        const item = queue[i];
        const stepLabel = `${item.icon} ${item.name}`;

        dispatch(setDownloadStatus({ dataType: item.key, status: 'loading' }));
        setCurrentMasterStep(`${stepLabel}: mengunduh...`);
        setMasterProgress(Math.min(95, (i / totalSteps) * 100));
        console.log(`[DownloadData] Mulai unduh ${item.key} (${i + 1}/${totalSteps})`);

        try {
          const result = await dispatch(downloadSpecificData(item.key)).unwrap();
          dispatch(setDownloadStatus({ dataType: item.key, status: 'success' }));
          totalSynced += result?.count || 0;
          successCount += 1;
          setSyncedCount(totalSynced);
          setCurrentMasterStep(`${stepLabel}: tersimpan (${result?.count || 0} data)`);
        } catch (err) {
          dispatch(setDownloadStatus({ dataType: item.key, status: 'error' }));
          setCurrentMasterStep(`${stepLabel}: gagal diunduh`);
          console.warn('[DownloadData] Gagal unduh', item.key, err?.message || err);
        }

        setMasterProgress(((i + 1) / totalSteps) * 100);
      }

      setCurrentMasterStep(`Selesai! ${successCount}/${totalSteps} berhasil, ${totalSynced} data tersimpan`);
      setModalSummary({ success: successCount, total: totalSteps });
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowMasterProgress(false);
        setMasterProgress(100);
      }, 1200);
    } catch (error) {
      setCurrentMasterStep('Gagal memperbaharui data');
      Alert.alert('Error', error || 'Gagal memperbaharui data');
      setTimeout(() => setShowMasterProgress(false), 800);
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

  // Clear download timestamp to force refresh and show progress bar
  const handleClearTimestamp = async () => {
    try {
      await AsyncStorage.removeItem('@masterDataLastFetch');
      await AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'false');
      console.log('🔄 Manual trigger: Emitting masterDataAutoSyncReset event');
      DeviceEventEmitter.emit('masterDataAutoSyncReset');
      Alert.alert(
        'Auto-Sync Diaktifkan', 
        'Progress bar akan muncul dan mulai mendownload data. Kembali ke Home untuk melihat progress.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal mengaktifkan auto-sync');
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
      <MasterDataProgress
        visible={showMasterProgress}
        progress={masterProgress}
        currentStep={currentMasterStep}
        syncedCount={syncedCount}
      />
      <VStack flex={1} bg={backgroundColor}>
        {/* Header */}
        <VStack px={4} pt={4} space={4}>
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space={2}>
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={textColor} />
              </TouchableOpacity>
              <VStack>
                <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
                  Download Data
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Offline-first, cepat, & tersinkron
                </Text>
              </VStack>
            </HStack>
            <HStack space={2}>
              <VStack bg={mode === 'dark' ? '#0f172a' : '#e0f2fe'} px={3} py={2} rounded="xl" borderWidth={1} borderColor={borderColor}>
                <Text fontSize="xs" color={subtitleColor} fontFamily="Poppins-SemiBold">Selesai</Text>
                <Text fontSize="md" color={textColor} fontFamily="Quicksand-Bold">{summary.completed}</Text>
              </VStack>
              <VStack bg={mode === 'dark' ? '#1f2937' : '#fff7ed'} px={3} py={2} rounded="xl" borderWidth={1} borderColor={borderColor}>
                <Text fontSize="xs" color={subtitleColor} fontFamily="Poppins-SemiBold">Gagal</Text>
                <Text fontSize="md" color={textColor} fontFamily="Quicksand-Bold">{summary.failed}</Text>
              </VStack>
            </HStack>
          </HStack>

          <VStack
            space={3}
            p={4}
            rounded="2xl"
            borderWidth={1}
            borderColor={borderColor}
            bg={mode === 'dark' ? '#0f172a' : '#e2f3ff'}
          >
            <HStack alignItems="center" justifyContent="space-between">
              <VStack flex={1} space={1}>
                <Text fontSize="xs" color={subtitleColor} fontFamily="Poppins-SemiBold">
                  Status Sinkronisasi
                </Text>
                <Text fontSize="lg" color={textColor} fontFamily="Quicksand-Bold">
                  {isDownloading || refreshing ? 'Sedang berjalan...' : 'Siap mengunduh' }
                </Text>
                <Text fontSize="xs" color={subtitleColor} fontFamily="Poppins-Regular" lineHeight={13}>
                  Pastikan koneksi stabil repopulate data SQLite.
                </Text>
              </VStack>
              <Center bg={mode === 'dark' ? '#172554' : '#dbeafe'} w={12} h={12} rounded="full">
                <Refresh size={22} color={accent} variant="Bold" />
              </Center>
            </HStack>

            <HStack space={2}>
              <TouchableOpacity
                onPress={handleDownloadAll}
                disabled={refreshing || isDownloading}
                style={{
                  flex: 1,
                  backgroundColor: accent,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'justify-between',
                }}
              >
                {refreshing || isDownloading ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <DriverRefresh size={26} color={'#FFF'} variant="Bulk"/>
                )}
                <VStack ml={3}>
                  <Text fontSize="md" fontFamily="Quicksand-Bold" color="#fff">
                    {refreshing || isDownloading ? 'Mengunduh...' : 'Download Data'}
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#e2e8f0" lineHeight={13}>
                    Overwrite cache & SQLite
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearTimestamp}
                style={{
                  width: 54,
                  backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              >
                <SidebarBottom size={26} color={textColor} variant="Bulk"/>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </VStack>

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
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: status === 'error' ? '#ef4444' : borderColor,
                      borderLeftWidth: 4,
                      borderLeftColor: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : accent,
                      shadowColor: '#000',
                      shadowOpacity: 0.06,
                      shadowOffset: { width: 0, height: 3 },
                      shadowRadius: 6,
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
                          <HStack space={2} alignItems="center">
                            {count !== undefined && status === 'success' && (
                              <Text fontSize="2xs" fontFamily="Poppins-SemiBold" color={subtitleColor}>
                                {count} data tersinkron
                              </Text>
                            )}
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

        {/* Footer - Action Buttons */}
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
          space={2}
        >
          {/* SQLite Query Button */}
          <TouchableOpacity
            onPress={() => router.push('/setting/sqlite-query-screen')}
            style={{
              backgroundColor: mode === 'dark' ? '#7c3aed' : '#8b5cf6',
              // paddingVertical: 14,
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <VStack flex={1} alignItems="center">
              <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                SQLite Query Tool
              </Text>
            </VStack>
          </TouchableOpacity>
        </VStack>
      </VStack>
    </AppScreen>
  );
}
