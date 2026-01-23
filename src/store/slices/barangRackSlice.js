import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@rack';

export const getBarangRack = createAsyncThunk(
  'barangRack/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[BarangRack] Fetching from API...', params);

      // 1. FETCH FROM API
      const resp = await apiClient.get('rack-barang', { params });
      const apiData = resp.data?.data || resp.data?.rows || [];
      console.log('[BarangRack] API response:', apiData.length, 'items');

      if (Array.isArray(apiData) && apiData.length > 0) {
        // 2. SYNC TO SQLITE (Primary Storage)
        try {
          const syncResult = await database.syncBarangRack(apiData);
          console.log('[BarangRack] Synced to SQLite:', syncResult.successCount, 'items');
        } catch (sqliteError) {
          console.warn('[BarangRack] SQLite sync failed:', sqliteError.message);
        }

        // 3. SAVE TO ASYNCSTORAGE (Fallback)
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiData));
          console.log('[BarangRack] Saved to AsyncStorage');
        } catch (storageError) {
          console.warn('[BarangRack] AsyncStorage save failed:', storageError.message);
        }
      }

      // 4. RETURN TO REDUX (Runtime)
      return { data: apiData, source: 'api' };
    } catch (error) {
      console.error('[BarangRack] Error fetching from API:', error);

      // FALLBACK: Try SQLite first
      try {
        const dbData = await database.getBarangRack();
        if (dbData && dbData.length > 0) {
          console.log('[BarangRack] Loaded from SQLite fallback:', dbData.length, 'items');
          return { data: dbData, source: 'sqlite' };
        }
      } catch (dbError) {
        console.warn('[BarangRack] SQLite fallback failed:', dbError.message);
      }

      // FALLBACK: Try AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('[BarangRack] Loaded from AsyncStorage fallback:', parsed.length, 'items');
          return { data: parsed, source: 'asyncstorage' };
        }
      } catch (storageError) {
        console.warn('[BarangRack] AsyncStorage fallback failed:', storageError.message);
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBarangRackOffline = createAsyncThunk(
  'barangRack/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[BarangRack] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getBarangRack();
      if (dbData && dbData.length > 0) {
        console.log('[BarangRack] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[BarangRack] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[BarangRack] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[BarangRack] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearBarangRackCache = createAsyncThunk(
  'barangRack/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_barangrack');
      console.log('[BarangRack] Cache cleared');
    } catch (error) {
      console.error('[BarangRack] Error clearing cache:', error);
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

const barangRackSlice = createSlice({
  name: 'barangRack',
  initialState,
  reducers: {
    clearBarangRackData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getBarangRack.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBarangRack.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'api';
        state.error = null;
        state.lastSync = Date.now();
      })
      .addCase(getBarangRack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getBarangRackOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getBarangRackOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearBarangRackCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearBarangRackData } = barangRackSlice.actions;
export default barangRackSlice.reducer;
