import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@pemasok';

export const getPemasok = createAsyncThunk(
  'pemasok/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[Pemasok] Fetching from API...', params);

      // 1. FETCH FROM API
      const resp = await apiClient.get(API_ENDPOINTS.PEMASOK.LIST, { params });
      const apiData = resp.data?.rows || resp.data?.data || [];
      console.log('[Pemasok] API response:', apiData.length, 'items');

      if (Array.isArray(apiData) && apiData.length > 0) {
        // 2. SYNC TO SQLITE (Primary Storage)
        try {
          const syncResult = await database.syncPemasok(apiData);
          console.log('[Pemasok] Synced to SQLite:', syncResult.successCount, 'items');
        } catch (sqliteError) {
          console.warn('[Pemasok] SQLite sync failed:', sqliteError.message);
        }

        // 3. SAVE TO ASYNCSTORAGE (Fallback)
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiData));
          console.log('[Pemasok] Saved to AsyncStorage');
        } catch (storageError) {
          console.warn('[Pemasok] AsyncStorage save failed:', storageError.message);
        }
      }

      // 4. RETURN TO REDUX (Runtime)
      return { data: apiData, source: 'api' };
    } catch (error) {
      console.error('[Pemasok] Error fetching from API:', error);

      // FALLBACK: Try SQLite first
      try {
        const dbData = await database.getPemasok();
        if (dbData && dbData.length > 0) {
          console.log('[Pemasok] Loaded from SQLite fallback:', dbData.length, 'items');
          return { data: dbData, source: 'sqlite' };
        }
      } catch (dbError) {
        console.warn('[Pemasok] SQLite fallback failed:', dbError.message);
      }

      // FALLBACK: Try AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('[Pemasok] Loaded from AsyncStorage fallback:', parsed.length, 'items');
          return { data: parsed, source: 'asyncstorage' };
        }
      } catch (storageError) {
        console.warn('[Pemasok] AsyncStorage fallback failed:', storageError.message);
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPemasokOffline = createAsyncThunk(
  'pemasok/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Pemasok] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getPemasok();
      if (dbData && dbData.length > 0) {
        console.log('[Pemasok] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[Pemasok] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[Pemasok] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[Pemasok] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearPemasokCache = createAsyncThunk(
  'pemasok/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_pemasok');
      console.log('[Pemasok] Cache cleared');
    } catch (error) {
      console.error('[Pemasok] Error clearing cache:', error);
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

const pemasokSlice = createSlice({
  name: 'pemasok',
  initialState,
  reducers: {
    clearPemasokData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPemasok.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPemasok.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'api';
        state.error = null;
        state.lastSync = Date.now();
      })
      .addCase(getPemasok.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getPemasokOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getPemasokOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearPemasokCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearPemasokData } = pemasokSlice.actions;
export default pemasokSlice.reducer;
