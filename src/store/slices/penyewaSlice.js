import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@penyewa';

export const getPenyewa = createAsyncThunk(
  'penyewa/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached penyewa data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching penyewa from API...');
      const resp = await apiClient.get(API_ENDPOINTS.PENYEWA.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      console.log('[Penyewa] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching penyewa:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPenyewaOffline = createAsyncThunk(
  'penyewa/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Penyewa] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getPenyewa();
      if (dbData && dbData.length > 0) {
        console.log('[Penyewa] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[Penyewa] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[Penyewa] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[Penyewa] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearPenyewaCache = createAsyncThunk(
  'penyewa/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_penyewa');
      console.log('[Penyewa] Cache cleared');
    } catch (error) {
      console.error('[Penyewa] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const penyewaSlice = createSlice({
  name: 'penyewa',
  initialState,
  reducers: {
    clearPenyewaData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPenyewa.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPenyewa.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getPenyewa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getPenyewaOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getPenyewaOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearPenyewaCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearPenyewaData } = penyewaSlice.actions;
export default penyewaSlice.reducer;
