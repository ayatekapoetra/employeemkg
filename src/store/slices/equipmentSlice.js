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
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached equipment data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching equipment from API...');
      const resp = await apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      console.log('[Equipment] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        try {
          await database.syncEquipment(data);
        } catch (syncErr) {
          console.warn('[Equipment] Failed to sync SQLite:', syncErr?.message || syncErr);
        }
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
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
  data: null,
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
    // Add a direct data setter for Redux injector
    setEquipmentData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
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
        state.data = action.payload.data;
        state.error = null;
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
