import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { injectDataToRedux } from '../reduxInjector';
import database from '../../database/SQLiteService';

/**
 * Load data dari SQLite ke Redux state dengan fallback ke AsyncStorage
 * Priority: SQLite → AsyncStorage → Redux
 */
export const loadSQLiteDataToRedux = createAsyncThunk(
  'app/loadSQLiteDataToRedux',
  async (_, { dispatch, getState }) => {
    console.log('🔄 Starting loadSQLiteDataToRedux with SQLite fallback...');
    
    // Log current Redux state before loading
    const currentState = getState();
    console.log('📊 Current Redux state before loading:');
    Object.keys(currentState).forEach(key => {
      if (currentState[key]?.data) {
        console.log(`  - ${key}: ${currentState[key].data.length} items`);
      }
    });
    
    // Define data configurations
    const dataConfigs = [
      { key: 'karyawan', cacheKey: '@karyawan', slice: 'karyawan', name: 'Karyawan' },
      { key: 'pengawas', cacheKey: '@pengawas', slice: 'pengawas', name: 'Pengawas' },
      { key: 'gudang', cacheKey: '@gudang', slice: 'gudang', name: 'Gudang' },
      { key: 'barang', cacheKey: '@barang', slice: 'barang', name: 'Barang' },
      { key: 'penyewa', cacheKey: '@penyewa', slice: 'penyewa', name: 'Penyewa' },
      { key: 'shift', cacheKey: '@shift', slice: 'shift', name: 'Shift' },
      { key: 'kegiatanpit', cacheKey: '@kegiatan-pit', slice: 'kegiatanPit', name: 'Kegiatan Pit' },
      { key: 'lokasipit', cacheKey: '@lokasipit', legacyCacheKeys: ['@lokasi-pit'], slice: 'lokasiPit', name: 'Lokasi Pit' },
      { key: 'oprdrv', cacheKey: '@oprdrv', slice: 'oprdrv', name: 'Operator/Driver' },
      { key: 'equipment', cacheKey: '@equipment', slice: 'equipment', name: 'Equipment' },
      { key: 'pemasok', cacheKey: '@pemasok', slice: 'pemasok', name: 'Pemasok' },
    ];

    let successCount = 0;
    const totalConfigs = dataConfigs.length;

    for (const config of dataConfigs) {
      try {
        console.log(`📥 Loading ${config.name} (Priority: SQLite → AsyncStorage)...`);
        
        let data = null;
        let source = 'unknown';

        // STEP 1: Try to get from SQLite first
        try {
          await database.ensureInitialized();
          const sqliteData = await database.getAll(`master_${config.key}`);
          if (sqliteData && sqliteData.length > 0) {
            data = sqliteData;
            source = 'SQLite';
            console.log(`✅ ${config.name}: Found ${sqliteData.length} items in SQLite`);
          } else {
            console.log(`⚠️ ${config.name}: No data in SQLite, trying AsyncStorage...`);
          }
        } catch (sqliteError) {
          console.log(`⚠️ ${config.name}: SQLite error (${sqliteError.message}), trying AsyncStorage...`);
        }

        // STEP 2: Fallback to AsyncStorage if SQLite empty or failed
        if (!data) {
          try {
            const keysToTry = [config.cacheKey, ...(config.legacyCacheKeys || [])].filter(Boolean);
            let storageData = null;
            let usedKey = null;
            for (const key of keysToTry) {
              storageData = await AsyncStorage.getItem(key);
              if (storageData) {
                usedKey = key;
                break;
              }
            }
            if (storageData) {
              const parsedData = JSON.parse(storageData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                data = parsedData;
                source = 'AsyncStorage';
                // Migrate legacy key to canonical so form + download stay in sync
                if (usedKey && usedKey !== config.cacheKey) {
                  await AsyncStorage.setItem(config.cacheKey, JSON.stringify(parsedData));
                  await AsyncStorage.removeItem(usedKey);
                }
                console.log(`✅ ${config.name}: Found ${parsedData.length} items in AsyncStorage`);
              } else {
                console.log(`⚠️ ${config.name}: AsyncStorage empty or invalid`);
              }
            } else {
              console.log(`⚠️ ${config.name}: No data in AsyncStorage`);
            }
          } catch (storageError) {
            console.error(`❌ ${config.name}: AsyncStorage error:`, storageError.message);
          }
        }

        // STEP 3: Update Redux state if we have data
        if (data && data.length > 0) {
          console.log(`🔄 ${config.name}: Updating Redux with ${data.length} items from ${source}`);
          
          // Define the exact action types for each slice
          const actionTypes = {
            'karyawan': 'karyawan/getList/fulfilled',
            'pengawas': 'pengawas/getList/fulfilled', 
            'gudang': 'gudang/getList/fulfilled',
            'barang': 'barang/getList/fulfilled',
            'penyewa': 'penyewa/getList/fulfilled',
            'shift': 'shift/getList/fulfilled',
            'kegiatanpit': 'kegiatanPit/getList/fulfilled',
            'lokasipit': 'lokasiPit/getList/fulfilled',
            'oprdrv': 'oprdrv/getList/fulfilled',
            'equipment': 'equipment/getList/fulfilled',
            'pemasok': 'pemasok/getList/fulfilled',
          };
          
          const actionType = actionTypes[config.key];
          
          if (actionType) {
            console.log(`[AppSlice] Using Redux injector for ${config.name}`);
            const injected = injectDataToRedux(config.key, data);
            
            if (injected) {
              console.log(`✅ ${config.name}: Redux updated via injector from ${source}`);
              successCount++;
              

            } else {
              console.log(`⚠️ ${config.name}: Redux injector failed, trying normal action dispatch`);
              // Fallback to normal action dispatch
              dispatch({ 
                type: actionType, 
                payload: { data } 
              });
              console.log(`✅ ${config.name}: Redux updated from ${source} (fallback)`);
              successCount++;
            }
          } else {
            console.log(`⚠️ ${config.name}: No action type defined, skipping Redux update`);
          }
        } else {
          console.log(`❌ ${config.name}: No data available in SQLite or AsyncStorage`);
        }

      } catch (error) {
        console.error(`❌ Failed to load ${config.name}:`, error);
      }
    }

    console.log(`📊 LoadSQLiteDataToRedux completed: ${successCount}/${totalConfigs} successful`);
    return successCount;
  }
);

const initialState = {
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSQLiteDataToRedux.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSQLiteDataToRedux.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(loadSQLiteDataToRedux.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = appSlice.actions;
export default appSlice.reducer;