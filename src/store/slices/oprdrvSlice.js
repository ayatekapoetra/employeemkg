import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@oprdrv';

export const getOprDrv = createAsyncThunk(
  'oprdrv/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[OprDrv] Fetching from API...', params);

      // 1. FETCH FROM API
      const resp = await apiClient.get(API_ENDPOINTS.KARYAWAN.OPRDRV, { params });
      const apiData = resp.data?.rows || resp.data?.data || [];
      console.log('[OprDrv] API response:', apiData.length, 'items');

      if (Array.isArray(apiData) && apiData.length > 0) {
        // 2. SYNC TO SQLITE (Primary Storage)
        try {
          const syncResult = await database.syncOprDrv(apiData);
          console.log('[OprDrv] Synced to SQLite:', syncResult.successCount, 'items');
        } catch (sqliteError) {
          console.warn('[OprDrv] SQLite sync failed:', sqliteError.message);
        }

        // 3. SAVE TO ASYNCSTORAGE (Fallback)
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiData));
          console.log('[OprDrv] Saved to AsyncStorage');
        } catch (storageError) {
          console.warn('[OprDrv] AsyncStorage save failed:', storageError.message);
        }
      }

      // 4. RETURN TO REDUX (Runtime)
      return { data: apiData, source: 'api' };
    } catch (error) {
      console.error('[OprDrv] Error fetching from API:', error);

      // FALLBACK: Try SQLite first
      try {
        const dbData = await database.getOprDrv();
        if (dbData && dbData.length > 0) {
          console.log('[OprDrv] Loaded from SQLite fallback:', dbData.length, 'items');
          return { data: dbData, source: 'sqlite' };
        }
      } catch (dbError) {
        console.warn('[OprDrv] SQLite fallback failed:', dbError.message);
      }

      // FALLBACK: Try AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('[OprDrv] Loaded from AsyncStorage fallback:', parsed.length, 'items');
          return { data: parsed, source: 'asyncstorage' };
        }
      } catch (storageError) {
        console.warn('[OprDrv] AsyncStorage fallback failed:', storageError.message);
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOprDrvOffline = createAsyncThunk(
  'oprdrv/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[OprDrv] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getOprDrv();
      if (dbData && dbData.length > 0) {
        console.log('[OprDrv] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[OprDrv] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[OprDrv] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[OprDrv] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearOprDrvCache = createAsyncThunk(
  'oprdrv/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_oprdrv');
      console.log('[OprDrv] Cache cleared');
    } catch (error) {
      console.error('[OprDrv] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
  lastSync: null,
  dataSource: 'none', // 'api' | 'sqlite' | 'asyncstorage' | 'none'
};

const oprdrvSlice = createSlice({
  name: 'oprdrv',
  initialState,
  reducers: {
    clearOprDrv: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getOprDrv.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOprDrv.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'api';
        state.error = null;
        state.lastSync = Date.now();
      })
      .addCase(getOprDrv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getOprDrvOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getOprDrvOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearOprDrvCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearOprDrv } = oprdrvSlice.actions;
export default oprdrvSlice.reducer;
