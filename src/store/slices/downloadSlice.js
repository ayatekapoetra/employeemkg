import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { injectDataToRedux } from '../reduxInjector';

// Helper function to update Redux state - Simple approach
const updateReduxState = async (dataType, data, dispatch) => {
  console.log(`[ReduxHelper] Updating Redux state for ${dataType} with ${data.length} items`);
  
  try {
    // The most reliable way: create a temporary fulfilled action for each slice
    // This mimics what happens when a thunk succeeds
    
    let actionType;
    switch(dataType) {
      case 'karyawan':
        actionType = 'karyawan/getList/fulfilled';
        break;
      case 'gudang':
        actionType = 'gudang/getList/fulfilled';
        break;
      case 'barang':
        actionType = 'barang/getList/fulfilled';
        break;
      case 'penyewa':
        actionType = 'penyewa/getList/fulfilled';
        break;
      case 'shift':
        actionType = 'shift/getList/fulfilled';
        break;
      case 'kegiatanpit':
        actionType = 'kegiatanPit/getList/fulfilled';
        break;
      case 'lokasipit':
        actionType = 'lokasiPit/getList/fulfilled';
        break;
      case 'oprdrv':
        actionType = 'oprdrv/getList/fulfilled';
        break;
      case 'equipment':
        actionType = 'equipment/getList/fulfilled';
        break;
      case 'pemasok':
        actionType = 'pemasok/getList/fulfilled';
        break;
      default:
        actionType = `${dataType}/getList/fulfilled`;
    }
    
    const action = {
      type: actionType,
      payload: { data },
      meta: {
        arg: undefined,
        requestId: `manual-${Date.now()}`,
        requestStatus: 'fulfilled'
      }
    };
    
    console.log(`[ReduxHelper] Dispatching action: ${action.type}`);
    
    // First, let's simulate the pending state
    dispatch({ type: action.type.replace('/fulfilled', '/pending') });
    
    // Then dispatch the fulfilled action
    setTimeout(() => {
      dispatch(action);
      console.log(`[ReduxHelper] ✅ Redux state updated for ${dataType}`);
    }, 10);
    
  } catch (error) {
    console.error(`[ReduxHelper] ❌ Failed to update Redux state for ${dataType}:`, error);
  }
};

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

      // Ensure SQLite ready (fail fast after timeout so UI tidak hang)
      try {
        const initTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('init-timeout')), 2000));
        await Promise.race([database.ensureInitialized(), initTimeout]);
      } catch (e) {
        console.warn('[Download] SQLite init skipped/timeout:', e?.message || e);
      }

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

      // Sync to SQLite if sync function exists (heavy datasets handled non-blocking)
      const shouldBackgroundSync = true; // always background to avoid blocking UI/progress
      const runSync = async () => {
        if (apiData.length === 0 || !config.syncFn) return;
        console.log(`[Download] Starting SQLite sync for ${dataType}...`);
        console.log(`[Download] Data sample for ${dataType}:`, JSON.stringify(apiData[0]).substring(0, 300));
        const syncTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('sync-timeout')), shouldBackgroundSync ? 3000 : 5000));
        const syncResult = await Promise.race([config.syncFn(apiData), syncTimeout]);
        console.log(`[Download] ✅ Synced ${dataType} to SQLite:`, {
          successCount: syncResult.successCount,
          errorCount: syncResult.errorCount,
          errors: syncResult.errors?.slice(0, 3)
        });
        if (syncResult.errorCount > 0) {
          console.warn(`[Download] ⚠️ ${dataType} had ${syncResult.errorCount} sync errors`);
        }
      };

      if (shouldBackgroundSync) {
        runSync().catch(syncError => {
          console.warn(`[Download] ⚠️ Background SQLite sync failed for ${dataType}:`, syncError?.message || syncError);
        });
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

      // STEP 1: Update Redux state immediately (for responsive UI)
      console.log(`[Download] STEP 1: Updating Redux state for ${dataType} with ${apiData.length} items`);
      console.log(`[Download] Data sample:`, JSON.stringify(apiData[0] || null).substring(0, 200));
      
      // Use Redux injector for reliable state update
      console.log(`[Download] Using Redux injector for ${dataType}`);
      const injected = injectDataToRedux(dataType, apiData);
      
      if (injected) {
        console.log(`[Download] ✅ Redux state updated via injector for ${dataType}`);
      } else {
        console.log(`[Download] ⚠️ Redux injector failed, trying normal action dispatch for ${dataType}`);
        // Fallback to normal action dispatch
        await updateReduxState(dataType, apiData, dispatch);
      }

      // STEP 2: Save to AsyncStorage (backup)
      console.log(`[Download] STEP 2: Saving ${dataType} to AsyncStorage...`);
      try {
        await AsyncStorage.setItem(config.cacheKey, JSON.stringify(apiData));
        console.log(`[Download] ✅ ${dataType} saved to AsyncStorage`);
      } catch (storageError) {
        console.warn(`[Download] ⚠️ AsyncStorage save failed for ${dataType}:`, storageError.message);
      }

      // STEP 3: Sync to SQLite in background (non-blocking)
      console.log(`[Download] STEP 3: Starting background SQLite sync for ${dataType}...`);
      if (apiData.length > 0 && config.syncFn) {
        // Don't wait for SQLite sync - do it in background
        config.syncFn(apiData).then(syncResult => {
          console.log(`[Download] ✅ Background SQLite sync completed for ${dataType}:`, {
            successCount: syncResult.successCount,
            errorCount: syncResult.errorCount
          });
        }).catch(syncError => {
          console.warn(`[Download] ⚠️ Background SQLite sync failed for ${dataType}:`, syncError.message);
        });
      }

      return { dataType, data: apiData, count: apiData.length, reduxUpdated: true };

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
