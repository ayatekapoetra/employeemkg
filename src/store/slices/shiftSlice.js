import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@shift';

export const getShift = createAsyncThunk(
  'shift/getShift',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Shift] Fetching from API...');

      // 1. FETCH FROM API
      const response = await apiClient.get(API_ENDPOINTS.SHIFT.LIST);
      const apiData = response.data?.rows || response.data?.data || [];

      console.log('[Shift] API response:', apiData.length, 'items');

      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengambil data shift');
      }

      if (Array.isArray(apiData) && apiData.length > 0) {
        // 2. SYNC TO SQLITE (Primary Storage)
        try {
          const syncResult = await database.syncShift(apiData);
          console.log('[Shift] Synced to SQLite:', syncResult.successCount, 'items');
        } catch (sqliteError) {
          console.warn('[Shift] SQLite sync failed:', sqliteError.message);
        }

        // 3. SAVE TO ASYNCSTORAGE (Fallback)
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiData));
          console.log('[Shift] Saved to AsyncStorage');
        } catch (storageError) {
          console.warn('[Shift] AsyncStorage save failed:', storageError.message);
        }
      }

      // 4. RETURN TO REDUX (Runtime)
      return { data: apiData, source: 'api' };
    } catch (error) {
      console.error('[Shift] Error fetching from API:', error);

      // FALLBACK: Try SQLite first
      try {
        const dbData = await database.getShift();
        if (dbData && dbData.length > 0) {
          console.log('[Shift] Loaded from SQLite fallback:', dbData.length, 'items');
          return { data: dbData, source: 'sqlite' };
        }
      } catch (dbError) {
        console.warn('[Shift] SQLite fallback failed:', dbError.message);
      }

      // FALLBACK: Try AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('[Shift] Loaded from AsyncStorage fallback:', parsed.length, 'items');
          return { data: parsed, source: 'asyncstorage' };
        }
      } catch (storageError) {
        console.warn('[Shift] AsyncStorage fallback failed:', storageError.message);
      }

      return rejectWithValue(
        error.response?.data?.diagnostic?.message ||
        error.response?.data?.message ||
        error.message
      );
    }
  }
);

export const getShiftOffline = createAsyncThunk(
  'shift/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Shift] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getShift();
      if (dbData && dbData.length > 0) {
        console.log('[Shift] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[Shift] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[Shift] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[Shift] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearShiftCache = createAsyncThunk(
  'shift/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_shift');
      console.log('[Shift] Cache cleared');
    } catch (error) {
      console.error('[Shift] Error clearing cache:', error);
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
  lastSync: null,
  dataSource: 'none' // 'api' | 'sqlite' | 'asyncstorage' | 'none'
};

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearShiftData: (state) => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShift.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'api';
        state.error = null;
        state.lastSync = Date.now();
      })
      .addCase(getShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getShiftOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getShiftOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearShiftCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearError, clearShiftData } = shiftSlice.actions;
export default shiftSlice.reducer;
