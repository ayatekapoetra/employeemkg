/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Clipboard,
  Modal,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import { VStack, HStack, Text, Center, Modal as NBModal } from 'native-base';
import { AppScreen } from '../../src/components/common';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Trash,
  Clock,
  CloseCircle,
  TickCircle,
  Warning2,
  Copy,
} from 'iconsax-react-native';
import { COLORS } from '../../src/constants/colors';
import database from '../../src/database/SQLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RESET_OPTIONS = [
  {
    id: 'master',
    title: 'Reset Master Data',
    description: 'Hapus semua master data (barang, equipment, shift, dll)',
    icon: '🗃️',
    color: '#3B82F6'
  },
  {
    id: 'checklog',
    title: 'Reset Koordinat Checklog',
    description: 'Hapus semua data koordinat checklog',
    icon: '📍',
    color: '#8B5CF6'
  },
  {
    id: 'all',
    title: 'Reset Semua Data',
    description: 'Hapus SEMUA data dari local database',
    icon: '🗑️',
    color: '#EF4444'
  }
];

const SAMPLE_QUERIES = [
  {
    name: 'List Semua Tabel',
    query: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  },
  {
    name: 'Hitung Jumlah Data SEMUA Tabel',
    query: "SELECT 'master_barang' as tabel, COUNT(*) as jumlah FROM master_barang UNION ALL SELECT 'master_barangrack', COUNT(*) FROM master_barangrack UNION ALL SELECT 'master_equipment', COUNT(*) FROM master_equipment UNION ALL SELECT 'master_lokasipit', COUNT(*) FROM master_lokasipit UNION ALL SELECT 'master_oprdrv', COUNT(*) FROM master_oprdrv UNION ALL SELECT 'master_pemasok', COUNT(*) FROM master_pemasok UNION ALL SELECT 'master_penyewa', COUNT(*) FROM master_penyewa UNION ALL SELECT 'master_shift', COUNT(*) FROM master_shift UNION ALL SELECT 'koordinat_checklogs', COUNT(*) FROM koordinat_checklogs"
  },
  {
    name: 'Cek Data Barang (All)',
    query: 'SELECT * FROM master_barang LIMIT 20'
  },
  {
    name: 'Cek Struktur Tabel Barang',
    query: 'PRAGMA table_info(master_barang)'
  },
  {
    name: 'Cek Data Equipment',
    query: 'SELECT * FROM master_equipment LIMIT 10'
  },
  {
    name: 'Cek Koordinat Checklog',
    query: 'SELECT * FROM koordinat_checklogs ORDER BY created_at DESC LIMIT 10'
  },
  {
    name: 'Cek Shift',
    query: 'SELECT * FROM master_shift LIMIT 10'
  },
  {
    name: 'Cek Lokasi Pit',
    query: 'SELECT * FROM master_lokasipit LIMIT 10'
  },
  {
    name: 'Test Insert Manual',
    query: "INSERT INTO master_barang (id, nama, kode, kategori, satuan, stok, aktif) VALUES ('TEST001', 'Test Barang', 'T001', 'Test', 'pcs', 10, 'Y')"
  },
  {
    name: 'Cek Data Test',
    query: 'SELECT * FROM master_barang WHERE id = "TEST001"'
  },
  {
    name: 'Hapus Data Test',
    query: 'DELETE FROM master_barang WHERE id = "TEST001"'
  }
];

export default function SQLiteQueryScreen() {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';

  // States
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';
  const inputBg = mode === 'dark' ? '#111827' : '#f9fafb';
  const inputColor = mode === 'dark' ? '#e5e7eb' : '#111827';

  // Validate query
  const validateQuery = useCallback((sql) => {
    const upperQuery = sql.trim().toUpperCase();
    const dangerousKeywords = ['DROP', 'TRUNCATE', 'ALTER TABLE'];

    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        return {
          valid: false,
          message: `Query berbahaya terdeteksi: ${keyword}. Operasi ini tidak diizinkan.`
        };
      }
    }

    if (upperQuery.length === 0) {
      return {
        valid: false,
        message: 'Query tidak boleh kosong'
      };
    }

    if (upperQuery.startsWith('PRAGMA TABLE_INFO(') && upperQuery.includes(')')) {
      return { valid: true };
    }

    return { valid: true };
  }, []);

  // Execute query
  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Masukkan query SQL terlebih dahulu');
      return;
    }

    const validation = validateQuery(query);
    if (!validation.valid) {
      Alert.alert('Query Ditolak', validation.message);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      await database.ensureInitialized();

      const upperQuery = query.trim().toUpperCase();

      console.log('[SQLite Query] Executing:', query);
      console.log('[SQLite Query] Upper:', upperQuery);

      if (upperQuery.startsWith('SELECT')) {
        const data = await database.getAllAsync(query);
        const endTime = Date.now();
        console.log('[SQLite Query] Result:', data);
        console.log('[SQLite Query] Row count:', data.length);
        setExecutionTime(endTime - startTime);
        setResult({
          type: 'SELECT',
          data: data,
          rowCount: data.length
        });
      } else if (upperQuery.startsWith('PRAGMA TABLE_INFO(')) {
        const data = await database.getAllAsync(query);
        const endTime = Date.now();
        console.log('[SQLite Query] PRAGMA Result:', data);
        setExecutionTime(endTime - startTime);
        setResult({
          type: 'PRAGMA',
          data: data,
          rowCount: data.length
        });
      } else if (
        upperQuery.startsWith('INSERT') ||
        upperQuery.startsWith('UPDATE') ||
        upperQuery.startsWith('DELETE')
      ) {
        const execResult = await database.runAsync(query);
        const endTime = Date.now();
        console.log('[SQLite Query] DML Result:', execResult);
        setExecutionTime(endTime - startTime);
        setResult({
          type: 'DML',
          changes: execResult.changes,
          lastInsertRowId: execResult.lastInsertRowId
        });
      } else {
        throw new Error('Query type tidak didukung. Gunakan SELECT, INSERT, UPDATE, DELETE, atau PRAGMA TABLE_INFO');
      }
    } catch (err) {
      const endTime = Date.now();
      console.error('[SQLite Query] Error:', err);
      setExecutionTime(endTime - startTime);
      setError(err.message || 'Terjadi kesalahan saat menjalankan query');
    } finally {
      setLoading(false);
    }
  }, [query, validateQuery]);

  // Clear all
  const clearAll = useCallback(() => {
    setQuery('');
    setResult(null);
    setError(null);
    setExecutionTime(0);
  }, []);

  // Load tables
  const loadTables = useCallback(async () => {
    if (tables.length > 0) {
      setShowTables(!showTables);
      return;
    }

    try {
      setTablesLoading(true);
      await database.ensureInitialized();
      const rows = await database.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
      );
      setTables(rows.map(r => r.name));
      setShowTables(true);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat daftar tabel');
    } finally {
      setTablesLoading(false);
    }
  }, [tables.length, showTables]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    try {
      Clipboard.setString(text);
      Alert.alert('Disalin', `${text} disalin ke clipboard`);
    } catch (e) {
      Alert.alert('Error', 'Gagal menyalin ke clipboard');
    }
  }, []);

  // Check AsyncStorage data
  const checkAsyncStorageData = useCallback(async () => {
    try {
      const keys = ['@barang', '@equipment', '@shift', '@lokasipit', '@oprdrv', '@penyewa', '@pemasok', '@gudang', '@karyawan'];
      const storageData = {};

      for (const key of keys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            storageData[key] = {
              count: parsed.length,
              sample: parsed.length > 0 ? parsed[0] : null
            };
          } else {
            storageData[key] = { count: 0, sample: null };
          }
        } catch (e) {
          storageData[key] = { count: 0, error: e.message };
        }
      }

      // Show result
      let message = '📦 AsyncStorage Data:\n\n';
      for (const [key, data] of Object.entries(storageData)) {
        if (data.count > 0) {
          message += `✅ ${key}: ${data.count} items\n`;
          if (data.sample && data.sample.id) {
            message += `   Sample ID: ${data.sample.id}\n`;
          }
        } else {
          message += `❌ ${key}: 0 items\n`;
        }
      }

      Alert.alert('AsyncStorage Check', message);
    } catch (e) {
      Alert.alert('Error', `Gagal mengecek AsyncStorage: ${e.message}`);
    }
  }, []);

  // Test sync single item
  const testSyncSingleItem = useCallback(async () => {
    try {
      setLoading(true);

      const barangStr = await AsyncStorage.getItem('@barang');
      if (!barangStr) {
        Alert.alert('Error', 'Tidak ada data barang di AsyncStorage. Download dulu!');
        return;
      }

      const barangData = JSON.parse(barangStr);
      if (!Array.isArray(barangData) || barangData.length === 0) {
        Alert.alert('Error', 'Data barang kosong atau invalid format');
        return;
      }

      // Test sync only first item
      const testItem = barangData[0];
      console.log('[Test Sync] Testing with item:', testItem);

      const result = await database.syncBarang([testItem]);

      let message = `📊 Test Sync Result:\n\n`;
      message += `Total items: 1\n`;
      message += `✅ Success: ${result.successCount}\n`;
      message += `❌ Errors: ${result.errorCount}\n`;

      if (result.errors && result.errors.length > 0) {
        message += `\n📋 Error Details:\n`;
        result.errors.forEach((err, idx) => {
          message += `${idx + 1}. ${err}\n`;
        });
      }

      message += `\n📦 Sample Data:\n`;
      message += JSON.stringify(testItem, null, 2);

      Alert.alert('Test Sync Selesai', message);

      // Verify with query
      if (result.successCount > 0) {
        Alert.alert(
          'Verifikasi',
          'Test sync berhasil! Jalankan query "SELECT * FROM master_barang WHERE id = "' + testItem.id + '" untuk verifikasi.'
        );
      }
    } catch (e) {
      Alert.alert('Error', `Test sync gagal: ${e.message}`);
      console.error('[Test Sync] Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual sync from AsyncStorage to SQLite
  const manualSyncToSQLite = useCallback(async () => {
    try {
      setLoading(true);

      const keys = ['@barang', '@equipment', '@shift', '@lokasipit', '@oprdrv', '@penyewa', '@pemasok'];
      let totalSynced = 0;
      let totalFailed = 0;

      for (const key of keys) {
        try {
          const dataStr = await AsyncStorage.getItem(key);
          if (!dataStr) continue;

          const data = JSON.parse(dataStr);
          if (!Array.isArray(data) || data.length === 0) continue;

          // Get table name from cache key
          const tableName = key.replace('@', 'master_').replace('@', 'master_');
          const tableMap = {
            '@barang': 'master_barang',
            '@equipment': 'master_equipment',
            '@shift': 'master_shift',
            '@lokasipit': 'master_lokasipit',
            '@oprdrv': 'master_oprdrv',
            '@penyewa': 'master_penyewa',
            '@pemasok': 'master_pemasok'
          };

          const table = tableMap[key];
          if (!table) continue;

          // Sync to SQLite
          const syncFnMap = {
            'master_barang': database.syncBarang.bind(database),
            'master_equipment': database.syncEquipment.bind(database),
            'master_shift': database.syncShift.bind(database),
            'master_lokasipit': database.syncLokasiPit.bind(database),
            'master_oprdrv': database.syncOprDrv.bind(database),
            'master_penyewa': database.syncPenyewa.bind(database),
            'master_pemasok': database.syncPemasok.bind(database)
          };

          const syncFn = syncFnMap[table];
          if (syncFn) {
            const result = await syncFn(data);
            totalSynced += result.successCount || 0;
            totalFailed += result.errorCount || 0;
            console.log(`[Manual Sync] ${table}: ${result.successCount} success, ${result.errorCount} errors`);
          }
        } catch (e) {
          console.error(`[Manual Sync] Error syncing ${key}:`, e);
          totalFailed++;
        }
      }

      Alert.alert(
        'Manual Sync Selesai',
        `✅ Berhasil: ${totalSynced} data\n❌ Gagal: ${totalFailed} data\n\nCek query "Hitung Jumlah Data" untuk verifikasi.`
      );
    } catch (e) {
      Alert.alert('Error', `Gagal sync manual: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle reset option
  const handleResetOption = useCallback(async (option) => {
    const confirmMessages = {
      master: 'Ini akan menghapus SEMUA master data dari local database. Lanjutkan?',
      checklog: 'Ini akan menghapus SEMUA data koordinat checklog. Lanjutkan?',
      all: 'Ini akan menghapus SEMUA data dari local database. Tindakan ini tidak dapat dibatalkan. Lanjutkan?'
    };

    Alert.alert(
      'Konfirmasi Reset',
      confirmMessages[option.id],
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              closeBottomSheet();

              let result;
              switch (option.id) {
                case 'master':
                  result = await database.clearAllMasterData();
                  break;
                case 'checklog':
                  await database.clear('koordinat_checklogs');
                  result = { success: true, message: 'Data koordinat checklog berhasil dihapus' };
                  break;
                case 'all':
                  await database.clearAll();
                  result = { success: true, message: 'Semua data berhasil dihapus' };
                  break;
              }

              if (result.success !== false) {
                Alert.alert('Berhasil', result.message || 'Data berhasil dihapus');
              } else {
                Alert.alert('Gagal', result.message || 'Gagal menghapus data');
              }
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, []);

  // Open bottom sheet
  const openBottomSheet = useCallback(() => {
    setBottomSheetVisible(true);
    Animated.timing(bottomSheetAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [bottomSheetAnim]);

  // Close bottom sheet
  const closeBottomSheet = useCallback(() => {
    Animated.timing(bottomSheetAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true
    }).start(() => {
      setBottomSheetVisible(false);
    });
  }, [bottomSheetAnim]);

  // Render result table
  const renderResultTable = () => {
    if (!result || (result.type !== 'SELECT' && result.type !== 'PRAGMA')) {
      return null;
    }

    // Handle empty data
    if (!result.data || result.data.length === 0) {
      return (
        <VStack bg={cardBg} p={6} rounded="xl" borderWidth={1} borderColor={borderColor} alignItems="center" space={3}>
          <Text fontSize={40}>📭</Text>
          <VStack alignItems="center" space={1}>
            <Text fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>
              Tidak ada data ditemukan
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
              Query mengembalikan 0 baris. Coba query lain atau pastikan tabel memiliki data.
            </Text>
          </VStack>
        </VStack>
      );
    }

    const columns = Object.keys(result.data[0]);

    return (
      <VStack bg={cardBg} p={0} rounded="xl" borderWidth={1} borderColor={borderColor} overflow="hidden">
        {/* Horizontal Scroll wrapper for entire table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <VStack>
            {/* Table Header */}
            <HStack bg={mode === 'dark' ? '#374151' : '#f3f4f6'} p={3} borderBottomWidth={2} borderBottomColor={borderColor} minWidth="100%">
              {columns.map((col, idx) => (
                <Text key={idx} fontSize="xs" fontFamily="Quicksand-Bold" color={textColor} width={150}>
                  {col}
                </Text>
              ))}
            </HStack>

            {/* Table Body - Vertical Scroll */}
            <ScrollView style={{ maxHeight: 300 }}>
              {result.data.map((row, rowIdx) => (
                <HStack
                  key={rowIdx}
                  p={3}
                  borderBottomWidth={1}
                  borderBottomColor={borderColor}
                  alignItems="flex-start"
                  minWidth="100%"
                >
                  {columns.map((col, colIdx) => (
                    <Text
                      key={colIdx}
                      fontSize="xs"
                      fontFamily="Poppins-Light"
                      color={textColor}
                      width={150}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {row[col] !== null ? String(row[col]) : 'NULL'}
                    </Text>
                  ))}
                </HStack>
              ))}
            </ScrollView>
          </VStack>
        </ScrollView>

        {/* Scroll indicator */}
        <HStack bg={mode === 'dark' ? '#1f2937' : '#f9fafb'} p={2} borderTopWidth={1} borderTopColor={borderColor} justifyContent="center">
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
            ↔️ Scroll horizontal untuk melihat semua kolom • {result.rowCount} baris
          </Text>
        </HStack>
      </VStack>
    );
  };

  // Render DML result
  const renderDMLResult = () => {
    if (!result || result.type !== 'DML') {
      return null;
    }

    return (
      <VStack bg={mode === 'dark' ? '#065f46' : '#d1fae5'} p={4} rounded="xl" borderWidth={1} borderColor={mode === 'dark' ? '#059669' : '#6ee7b7'} space={3}>
        <HStack space={2} alignItems="center">
          <TickCircle size={20} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />
          <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
            Query berhasil dijalankan
          </Text>
        </HStack>

        <HStack space={2} alignItems="center">
          <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
            Affected Rows:
          </Text>
          <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
            {result.changes}
          </Text>
        </HStack>

        {result.lastInsertRowId > 0 && (
          <HStack space={2} alignItems="center">
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
              Last Insert ID:
            </Text>
            <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
              {result.lastInsertRowId}
            </Text>
          </HStack>
        )}
      </VStack>
    );
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
              SQLite Query Tool
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Live query ke database local
            </Text>
          </VStack>
        </HStack>

        {/* Tables Drawer */}
        {showTables && (
          <>
            <VStack
              bg={cardBg}
              position="absolute"
              top={16}
              right={4}
              zIndex={10}
              p={3}
              rounded="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={3}
              maxWidth={280}
              maxHeight={400}
            >
              <HStack justifyContent="space-between" alignItems="center" mb={3}>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                  SQLite Tables
                </Text>
                <TouchableOpacity onPress={() => setShowTables(false)}>
                  <CloseCircle size={16} color={subtitleColor} variant="Bold" />
                </TouchableOpacity>
              </HStack>

              {tablesLoading ? (
                <Center py={4}>
                  <ActivityIndicator size="small" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
                </Center>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {tables.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => copyToClipboard(t)}
                      py={2}
                      borderBottomWidth={1}
                      borderBottomColor={borderColor}
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={textColor}>
                          {t}
                        </Text>
                        <Copy size={12} color={subtitleColor} variant="Bold" />
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </VStack>
            {/* Backdrop */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9 }}
              onPress={() => setShowTables(false)}
            />
          </>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space={4} p={4}>
            {/* Query Input Section */}
            <VStack bg={cardBg} p={4} rounded="xl" borderWidth={1} borderColor={borderColor} space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>
                  SQL Query
                </Text>
                <TouchableOpacity
                  onPress={loadTables}
                  disabled={tablesLoading}
                  style={{
                    backgroundColor: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <HStack space={2} alignItems="center">
                    <Text fontSize={14}>🗄️</Text>
                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#60a5fa' : '#1e40af'}>
                      Tables
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </HStack>

              <TextInput
                style={{
                  backgroundColor: inputBg,
                  color: inputColor,
                  borderColor: borderColor,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  fontFamily: 'Courier',
                  fontSize: 14,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="Masukkan query SQL..."
                placeholderTextColor={subtitleColor}
                multiline
                numberOfLines={6}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <HStack space={3}>
                <TouchableOpacity
                  onPress={executeQuery}
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: mode === 'dark' ? '#3b82f6' : '#2563eb',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                        Executing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Play size={16} color="#ffffff" variant="Bold" />
                      <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                        Execute
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={clearAll}
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderColor: borderColor,
                    borderWidth: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Trash size={16} color={subtitleColor} variant="Bold" />
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={subtitleColor}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </HStack>
            </VStack>

            {/* Sample Queries */}
            <VStack bg={cardBg} p={4} rounded="xl" borderWidth={1} borderColor={borderColor} space={3}>
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Sample Queries
              </Text>
              <VStack space={2}>
                {SAMPLE_QUERIES.map((sample, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setQuery(sample.query)}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                    }}
                  >
                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor} mb={1}>
                      {sample.name}
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} numberOfLines={1}>
                      {sample.query}
                    </Text>
                  </TouchableOpacity>
                ))}
              </VStack>
            </VStack>

            {/* Debugging Info */}
            <VStack bg={mode === 'dark' ? '#1e3a8a' : '#dbeafe'} p={4} rounded="xl" borderWidth={1} borderColor={mode === 'dark' ? '#3b82f6' : '#93c5fd'} space={3}>
              <HStack space={2} alignItems="center">
                <Text fontSize={20}>🔍</Text>
                <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                  Tips Debugging
                </Text>
              </HStack>
              <VStack space={2}>
                <HStack space={2} alignItems="flex-start">
                  <Text fontSize={12}>1️⃣</Text>
                  <VStack flex={1}>
                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                      Cek Jumlah Data
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}>
                      Jalankan query "Hitung Jumlah Data per Tabel" untuk melihat apakah data ada
                    </Text>
                  </VStack>
                </HStack>
                <HStack space={2} alignItems="flex-start">
                  <Text fontSize={12}>2️⃣</Text>
                  <VStack flex={1}>
                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                      Cek Console Logs
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}>
                      Buka console untuk melihat log sync saat download data
                    </Text>
                  </VStack>
                </HStack>
                <HStack space={2} alignItems="flex-start">
                  <Text fontSize={12}>3️⃣</Text>
                  <VStack flex={1}>
                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                      Download Ulang
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}>
                      Kembali ke Download Data Options dan download ulang master data
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>

            {/* Database Management */}
            <VStack bg={cardBg} p={4} rounded="xl" borderWidth={1} borderColor={borderColor} space={3}>
              <Text fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>
                Database Management
              </Text>

              <TouchableOpacity
                onPress={openBottomSheet}
                disabled={loading}
                style={{
                  backgroundColor: mode === 'dark' ? '#78350f' : '#fef3c7',
                  borderColor: mode === 'dark' ? '#f59e0b' : '#92400e',
                  borderWidth: 1,
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text fontSize={20}>🔄</Text>
                <VStack flex={1}>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fde68a' : '#92400e'}>
                    Reset Local Data
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fcd34d' : '#b45309'}>
                    Pilih data yang ingin direset
                  </Text>
                </VStack>
                <Text fontSize={16}>⬆️</Text>
              </TouchableOpacity>

              {/* Manual Sync from AsyncStorage */}
              <TouchableOpacity
                onPress={manualSyncToSQLite}
                disabled={loading}
                style={{
                  backgroundColor: mode === 'dark' ? '#065f46' : '#d1fae5',
                  borderColor: mode === 'dark' ? '#059669' : '#6ee7b7',
                  borderWidth: 1,
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text fontSize={20}>📥</Text>
                <VStack flex={1}>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                    Sync dari AsyncStorage
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#6ee7b7' : '#047857'}>
                    Pindahkan data dari AsyncStorage ke SQLite
                  </Text>
                </VStack>
                {loading ? (
                  <ActivityIndicator size="small" color={mode === 'dark' ? '#059669' : '#059669'} />
                ) : (
                  <Text fontSize={16}>→</Text>
                )}
              </TouchableOpacity>

              {/* Check AsyncStorage Data */}
              <TouchableOpacity
                onPress={checkAsyncStorageData}
                disabled={loading}
                style={{
                  backgroundColor: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
                  borderColor: mode === 'dark' ? '#3b82f6' : '#93c5fd',
                  borderWidth: 1,
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text fontSize={20}>📦</Text>
                <VStack flex={1}>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                    Cek AsyncStorage
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#60a5fa' : '#1e40af'}>
                    Lihat data tersimpan di AsyncStorage
                  </Text>
                </VStack>
                <Text fontSize={16}>🔍</Text>
              </TouchableOpacity>

              {/* Test Sync 1 Item */}
              <TouchableOpacity
                onPress={testSyncSingleItem}
                disabled={loading}
                style={{
                  backgroundColor: mode === 'dark' ? '#7c2d12' : '#fee2e2',
                  borderColor: mode === 'dark' ? '#dc2626' : '#fca5a5',
                  borderWidth: 1,
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text fontSize={20}>🧪</Text>
                <VStack flex={1}>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fee2e2' : '#991b1b'}>
                    Test Sync (1 Item)
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fca5a5' : '#7f1d1d'}>
                    Test sync 1 barang untuk debug error
                  </Text>
                </VStack>
                {loading ? (
                  <ActivityIndicator size="small" color={mode === 'dark' ? '#dc2626' : '#dc2626'} />
                ) : (
                  <Text fontSize={16}>→</Text>
                )}
              </TouchableOpacity>
            </VStack>

            {/* Execution Time */}
            {executionTime > 0 && (
              <HStack
                bg={cardBg}
                p={3}
                rounded="xl"
                borderWidth={1}
                borderColor={borderColor}
                alignItems="center"
                space={2}
              >
                <Clock size={14} color={subtitleColor} variant="Bold" />
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Execution time: {executionTime}ms
                </Text>
              </HStack>
            )}

            {/* Error */}
            {error && (
              <VStack bg="#fee2e2" p={4} rounded="xl" space={2}>
                <HStack space={2} alignItems="center">
                  <Warning2 size={16} color="#dc2626" variant="Bold" />
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#991b1b">
                    Error
                  </Text>
                </HStack>
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#991b1b">
                  {error}
                </Text>
              </VStack>
            )}

            {/* Result */}
            {result && !error && (
              <VStack space={3}>
                <VStack bg={cardBg} p={4} rounded="xl" borderWidth={1} borderColor={borderColor}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="md" fontFamily="Quicksand-SemiBold" color={textColor}>
                      Result
                    </Text>
                    {(result.type === 'SELECT' || result.type === 'PRAGMA') && (
                      <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                        {result.rowCount} row(s)
                      </Text>
                    )}
                  </HStack>
                </VStack>

                {(result.type === 'SELECT' || result.type === 'PRAGMA') && renderResultTable()}
                {result.type === 'DML' && renderDMLResult()}
              </VStack>
            )}

            {/* Warning */}
            <HStack
              bg="#fef3c7"
              p={3}
              rounded="xl"
              space={2}
              alignItems="center"
            >
              <Warning2 size={16} color="#92400e" variant="Bold" />
              <Text fontSize="xs" fontFamily="Poppins-Light" color="#92400e" flex={1}>
                Peringatan: Tool ini untuk debugging saja. Gunakan dengan hati-hati!
              </Text>
            </HStack>

            <VStack h={6} />
          </VStack>
        </ScrollView>

        {/* Bottom Sheet Modal */}
        <Modal
          visible={bottomSheetVisible}
          transparent
          animationType="none"
          onRequestClose={closeBottomSheet}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
            <Pressable style={{ width: '100%', height: '100%' }}>
              <Animated.View
                style={[
                  {
                    backgroundColor: cardBg,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    paddingTop: 12,
                    maxHeight: SCREEN_HEIGHT * 0.6,
                    transform: [{ translateY: bottomSheetAnim }]
                  }
                ]}
              >
                {/* Handle */}
                <Center>
                  <VStack w={10} h={1} bg="#d1d5db" rounded="full" mb={3} />
                </Center>

                {/* Header */}
                <HStack
                  px={4}
                  py={3}
                  borderBottomWidth={1}
                  borderBottomColor={borderColor}
                  alignItems="center"
                  space={3}
                >
                  <Text fontSize={20}>🔄</Text>
                  <VStack flex={1}>
                    <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                      Reset Local Data
                    </Text>
                  </VStack>
                  <TouchableOpacity onPress={closeBottomSheet}>
                    <CloseCircle size={24} color={subtitleColor} variant="Bold" />
                  </TouchableOpacity>
                </HStack>

                {/* Options */}
                <ScrollView showsVerticalScrollIndicator={false} px={4} py={3}>
                  {RESET_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleResetOption(option)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                        borderRadius: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    >
                      <Text fontSize={24} mr={3}>
                        {option.icon}
                      </Text>
                      <VStack flex={1}>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                          {option.title}
                        </Text>
                        <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} mt={1}>
                          {option.description}
                        </Text>
                      </VStack>
                      <Text fontSize={16}>›</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Footer */}
                <VStack
                  px={4}
                  py={3}
                  borderTopWidth={1}
                  borderTopColor={borderColor}
                  bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
                >
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
                    Pilih opsi di atas untuk mereset data lokal
                  </Text>
                </VStack>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </VStack>
    </AppScreen>
  );
}
