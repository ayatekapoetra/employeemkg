import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@equipment';

export const getEquipment = createAsyncThunk(
  'equipment/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      console.log('[Equipment] Fetching from API...');

      // 1. FETCH FROM API
      const resp = await apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST);
      const apiData = resp.data?.rows || resp.data?.data || resp.data || [];

      console.log('[Equipment] API response:', apiData.length, 'items');

      if (Array.isArray(apiData) && apiData.length > 0) {
        // 2. SYNC TO SQLITE (Primary Storage)
        try {
          const syncResult = await database.syncEquipment(apiData);
          console.log('[Equipment] Synced to SQLite:', syncResult.successCount, 'items');
        } catch (sqliteError) {
          console.warn('[Equipment] SQLite sync failed:', sqliteError.message);
        }

        // 3. SAVE TO ASYNCSTORAGE (Fallback)
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(apiData));
          console.log('[Equipment] Saved to AsyncStorage');
        } catch (storageError) {
          console.warn('[Equipment] AsyncStorage save failed:', storageError.message);
        }
      }

      // 4. RETURN TO REDUX (Runtime)
      return { data: apiData, source: 'api' };
    } catch (error) {
      console.error('[Equipment] Error fetching from API:', error);

      // FALLBACK: Try SQLite first
      try {
        const dbData = await database.getEquipment();
        if (dbData && dbData.length > 0) {
          console.log('[Equipment] Loaded from SQLite fallback:', dbData.length, 'items');
          return { data: dbData, source: 'sqlite' };
        }
      } catch (dbError) {
        console.warn('[Equipment] SQLite fallback failed:', dbError.message);
      }

      // FALLBACK: Try AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('[Equipment] Loaded from AsyncStorage fallback:', parsed.length, 'items');
          return { data: parsed, source: 'asyncstorage' };
        }
      } catch (storageError) {
        console.warn('[Equipment] AsyncStorage fallback failed:', storageError.message);
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getEquipmentOffline = createAsyncThunk(
  'equipment/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Equipment] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getEquipment();
      if (dbData && dbData.length > 0) {
        console.log('[Equipment] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[Equipment] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[Equipment] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[Equipment] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearEquipmentCache = createAsyncThunk(
  'equipment/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_equipment');
      console.log('[Equipment] Cache cleared');
    } catch (error) {
      console.error('[Equipment] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
  lastSync: null,
  dataSource: 'none' // 'api' | 'sqlite' | 'asyncstorage' | 'none'
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    clearEquipment: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getEquipment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'api';
        state.error = null;
        state.lastSync = Date.now();
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getEquipmentOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getEquipmentOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearEquipmentCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
