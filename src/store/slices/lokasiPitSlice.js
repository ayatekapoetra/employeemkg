import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@lokasi-pit';

export const getLokasiPit = createAsyncThunk(
  'lokasiPit/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[LokasiPit] Fetching from API...', params);

      // 1. FETCH FROM API
      const resp = await apiClient.get(API_ENDPOINTS.LOKASI_PIT.LIST, { params });
      const apiData = resp.data?.rows || resp.data?.data || [];
      console.log('[LokasiPit] API response:', apiData.length, 'items');

      if (Array.isArray(apiData) && apiData.length > 0) {
        // 2. SYNC TO SQLITE (Primary Storage)
        try {
          const syncResult = await database.syncLokasiPit(apiData);
          console.log('[LokasiPit] Synced to SQLite:', syncResult.successCount, 'items');
        } catch (sqliteError) {
          console.warn('[LokasiPit] SQLite sync failed:', sqliteError.message);
        }

        // 3. SAVE TO ASYNCSTORAGE (Fallback)
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiData));
          console.log('[LokasiPit] Saved to AsyncStorage');
        } catch (storageError) {
          console.warn('[LokasiPit] AsyncStorage save failed:', storageError.message);
        }
      }

      // 4. RETURN TO REDUX (Runtime)
      return { data: apiData, source: 'api' };
    } catch (error) {
      console.error('[LokasiPit] Error fetching from API:', error);

      // FALLBACK: Try SQLite first
      try {
        const dbData = await database.getLokasiPit();
        if (dbData && dbData.length > 0) {
          console.log('[LokasiPit] Loaded from SQLite fallback:', dbData.length, 'items');
          return { data: dbData, source: 'sqlite' };
        }
      } catch (dbError) {
        console.warn('[LokasiPit] SQLite fallback failed:', dbError.message);
      }

      // FALLBACK: Try AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('[LokasiPit] Loaded from AsyncStorage fallback:', parsed.length, 'items');
          return { data: parsed, source: 'asyncstorage' };
        }
      } catch (storageError) {
        console.warn('[LokasiPit] AsyncStorage fallback failed:', storageError.message);
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getLokasiPitOffline = createAsyncThunk(
  'lokasiPit/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[LokasiPit] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getLokasiPit();
      if (dbData && dbData.length > 0) {
        console.log('[LokasiPit] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[LokasiPit] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[LokasiPit] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[LokasiPit] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearLokasiPitCache = createAsyncThunk(
  'lokasiPit/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_lokasipit');
      console.log('[LokasiPit] Cache cleared');
    } catch (error) {
      console.error('[LokasiPit] Error clearing cache:', error);
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

const lokasiPitSlice = createSlice({
  name: 'lokasiPit',
  initialState,
  reducers: {
    clearLokasiPitData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getLokasiPit.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLokasiPit.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'api';
        state.error = null;
        state.lastSync = Date.now();
      })
      .addCase(getLokasiPit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getLokasiPitOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getLokasiPitOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearLokasiPitCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearLokasiPitData } = lokasiPitSlice.actions;
export default lokasiPitSlice.reducer;
