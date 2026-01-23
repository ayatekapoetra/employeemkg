import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  downloadStatus: {}, // { barang: 'success', gudang: 'error', ... }
  isDownloading: false,
  lastSyncTime: null,
  errors: {}, // { barang: 'Network error', ... }
  dataCounts: {}, // { barang: 15, gudang: 3, ... }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to sync data to Redux after SQLite/AsyncStorage update
const syncToRedux = async (dataType, data) => {
  // This will be handled by the respective slice's getXXXOffline or similar
  // We just need to ensure the data is stored and can be loaded
  console.log(`[Download] ${dataType} synced to storage, count: ${data.length}`);
};

// Download specific data type
export const downloadSpecificData = createAsyncThunk(
  'download/downloadSpecificData',
  async (dataType, { rejectWithValue, dispatch }) => {
    try {
      console.log(`[Download] Starting download for: ${dataType}`);

      // Define endpoints and configurations
      const dataConfigs = {
        'barang': {
          endpoint: API_ENDPOINTS.BARANG.LIST,
          syncFn: database.syncBarang.bind(database),
          cacheKey: '@barang',
        },
        // 'barangrack' - removed: API endpoint rack-barang does not exist on backend
        'equipment': {
          endpoint: API_ENDPOINTS.EQUIPMENT.LIST,
          syncFn: database.syncEquipment.bind(database),
          cacheKey: '@equipment',
        },
        'lokasipit': {
          endpoint: API_ENDPOINTS.LOKASI_PIT.LIST,
          syncFn: database.syncLokasiPit.bind(database),
          cacheKey: '@lokasipit',
        },
        'oprdrv': {
          endpoint: API_ENDPOINTS.KARYAWAN.OPRDRV,
          syncFn: database.syncOprDrv.bind(database),
          cacheKey: '@oprdrv',
        },
        'pemasok': {
          endpoint: API_ENDPOINTS.PEMASOK.LIST,
          syncFn: database.syncPemasok.bind(database),
          cacheKey: '@pemasok',
        },
        'penyewa': {
          endpoint: API_ENDPOINTS.PENYEWA.LIST,
          syncFn: database.syncPenyewa.bind(database),
          cacheKey: '@penyewa',
        },
        'shift': {
          endpoint: API_ENDPOINTS.SHIFT.LIST,
          syncFn: database.syncShift.bind(database),
          cacheKey: '@shift',
        },
        'gudang': {
          endpoint: API_ENDPOINTS.GUDANG.LIST,
          syncFn: database.syncGudang.bind(database),
          cacheKey: '@gudang',
        },
        'karyawan': {
          endpoint: API_ENDPOINTS.KARYAWAN.LIST,
          syncFn: database.syncKaryawan.bind(database),
          cacheKey: '@karyawan',
        },
        'kegiatanpit': {
          endpoint: API_ENDPOINTS.KEGIATAN_PIT.LIST,
          syncFn: database.syncKegiatanPit.bind(database),
          cacheKey: '@kegiatan-pit',
        },
      };

      const config = dataConfigs[dataType];
      if (!config) {
        throw new Error(`Unknown data type: ${dataType}`);
      }

      // Fetch data from API (with retry for large payloads)
      const isLargeData = dataType === 'equipment';
      const maxAttempts = isLargeData ? 2 : 1;
      const requestTimeout = isLargeData ? 120000 : undefined;
      let response = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`[Download] Fetching ${dataType} from ${config.endpoint} (attempt ${attempt}/${maxAttempts})...`);
          response = await apiClient.get(config.endpoint, requestTimeout ? { timeout: requestTimeout } : undefined);
          break;
        } catch (error) {
          const isTimeout = error.code === 'ECONNABORTED';
          if (!isTimeout || attempt === maxAttempts) {
            throw error;
          }
          console.warn(`[Download] ${dataType} timeout, retrying after delay...`);
          await wait(2000);
        }
      }

      // Extract data from response
      let apiData = response.data?.rows || response.data?.data || response.data || [];

      // Ensure we have an array
      if (!Array.isArray(apiData)) {
        if (apiData && typeof apiData === 'object') {
          const arrayProps = Object.keys(apiData).filter(key => Array.isArray(apiData[key]));
          if (arrayProps.length > 0) {
            apiData = apiData[arrayProps[0]];
          } else {
            apiData = [apiData];
          }
        } else {
          apiData = [];
        }
      }

      console.log(`[Download] Fetched ${apiData.length} items for ${dataType}`);

      // Sync to SQLite if sync function exists
      if (apiData.length > 0 && config.syncFn) {
        try {
          console.log(`[Download] Starting SQLite sync for ${dataType}...`);
          console.log(`[Download] Data sample for ${dataType}:`, JSON.stringify(apiData[0]).substring(0, 300));
          const syncResult = await config.syncFn(apiData);
          console.log(`[Download] ✅ Synced ${dataType} to SQLite:`, {
            successCount: syncResult.successCount,
            errorCount: syncResult.errorCount,
            errors: syncResult.errors?.slice(0, 3)
          });
          if (syncResult.error) {
            console.warn(`[Download] ⚠️ SQLite sync had errors:`, syncResult.error);
          }
          if (syncResult.errorCount > 0) {
            console.warn(`[Download] ⚠️ ${dataType} had ${syncResult.errorCount} sync errors`);
          }
        } catch (syncError) {
          console.error(`[Download] ❌ SQLite sync FAILED for ${dataType}:`, syncError.message);
          console.error(`[Download] Error stack:`, syncError.stack);
          // Continue with AsyncStorage fallback
        }
      } else {
        if (!config.syncFn) {
          console.log(`[Download] ⚠️ No sync function for ${dataType}, using AsyncStorage only`);
        }
      }

      // Always save to AsyncStorage as fallback
      if (apiData.length > 0) {
        try {
          await AsyncStorage.setItem(config.cacheKey, JSON.stringify(apiData));
          console.log(`[Download] Saved ${dataType} to AsyncStorage`);
        } catch (storageError) {
          console.warn(`[Download] AsyncStorage save failed for ${dataType}:`, storageError.message);
        }
      }

      return { dataType, data: apiData, count: apiData.length };

    } catch (error) {
      console.error(`[Download] Error downloading ${dataType}:`, error);
      return rejectWithValue({
        dataType,
        error: error.response?.data?.diagnostic?.message ||
                error.response?.data?.message ||
                error.message ||
                'Download failed',
      });
    }
  }
);

// Download all master data
export const downloadAllMasterData = createAsyncThunk(
  'download/downloadAllMasterData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('[Download] Starting download all master data...');

      const dataTypes = [
        'barang', 'equipment', 'lokasipit', 'oprdrv',
        'pemasok', 'penyewa', 'shift', 'gudang', 'karyawan', 'kegiatanpit'
      ];

      const results = [];

      for (const dataType of dataTypes) {
        try {
          const result = await dispatch(downloadSpecificData(dataType)).unwrap();
          results.push({ success: true, ...result });
        } catch (error) {
          console.error(`[Download] Failed to download ${dataType}:`, error);
          results.push({ success: false, dataType: error.dataType, error: error.error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      console.log(`[Download] All master data download completed: ${successCount} success, ${failCount} failed`);

      return results;

    } catch (error) {
      console.error('[Download] Error in downloadAllMasterData:', error);
      return rejectWithValue(error.message || 'Failed to download master data');
    }
  }
);

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    clearDownloadStatus: (state) => {
      state.downloadStatus = {};
      state.errors = {};
      state.dataCounts = {};
    },
    setDownloadStatus: (state, action) => {
      const { dataType, status } = action.payload;
      state.downloadStatus[dataType] = status;
    },
    clearError: (state, action) => {
      const dataType = action.payload;
      if (state.errors[dataType]) {
        delete state.errors[dataType];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // downloadSpecificData
      .addCase(downloadSpecificData.pending, (state, action) => {
        const dataType = action.meta.arg;
        state.downloadStatus[dataType] = 'loading';
        if (state.errors[dataType]) {
          delete state.errors[dataType];
        }
      })
      .addCase(downloadSpecificData.fulfilled, (state, action) => {
        const { dataType, count } = action.payload;
        state.downloadStatus[dataType] = 'success';
        state.dataCounts[dataType] = count;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(downloadSpecificData.rejected, (state, action) => {
        const { dataType, error } = action.payload;
        state.downloadStatus[dataType] = 'error';
        state.errors[dataType] = error;
      })

      // downloadAllMasterData
      .addCase(downloadAllMasterData.pending, (state) => {
        state.isDownloading = true;
        // Set all to loading initially
        const dataTypes = [
          'barang', 'equipment', 'lokasipit', 'oprdrv',
          'pemasok', 'penyewa', 'shift', 'gudang', 'karyawan', 'kegiatanpit'
        ];
        dataTypes.forEach(type => {
          state.downloadStatus[type] = 'loading';
        });
      })
      .addCase(downloadAllMasterData.fulfilled, (state, action) => {
        state.isDownloading = false;
        state.lastSyncTime = new Date().toISOString();

        // Update status and counts based on results
        action.payload.forEach(result => {
          if (result.success) {
            state.downloadStatus[result.dataType] = 'success';
            state.dataCounts[result.dataType] = result.count;
          } else {
            state.downloadStatus[result.dataType] = 'error';
            state.errors[result.dataType] = result.error;
          }
        });
      })
      .addCase(downloadAllMasterData.rejected, (state, action) => {
        state.isDownloading = false;
        // Set all to error on overall failure
        const dataTypes = [
          'barang', 'equipment', 'lokasipit', 'oprdrv',
          'pemasok', 'penyewa', 'shift', 'gudang', 'karyawan', 'kegiatanpit'
        ];
        dataTypes.forEach(type => {
          state.downloadStatus[type] = 'error';
          state.errors[type] = action.payload;
        });
      });
  },
});

export const {
  clearDownloadStatus,
  setDownloadStatus,
  clearError
} = downloadSlice.actions;

export default downloadSlice.reducer;
