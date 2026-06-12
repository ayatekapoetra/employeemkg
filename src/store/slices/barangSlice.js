import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

const CACHE_KEY = '@barang';

export const getBarang = createAsyncThunk(
  'barang/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached barang data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching barang from API...');
      const resp = await apiClient.get(API_ENDPOINTS.BARANG.LIST);
      const data = resp.data?.data || resp.data?.rows || resp.data || [];
      
      console.log('[Barang] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.warn('Error fetching barang:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBarangOffline = createAsyncThunk(
  'barang/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Barang] Loading offline data...');

      // 1. TRY SQLITE FIRST
      // const dbData = await database.getBarang();
      // if (dbData && dbData.length > 0) {
      //   console.log('[Barang] Loaded from SQLite:', dbData.length, 'items');
      //   return { data: dbData, source: 'sqlite' };
      // }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[Barang] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[Barang] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[Barang] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const getBarangDetail = createAsyncThunk(
  'barang/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Fetching barang detail:', id);
      const resp = await apiClient.get(API_ENDPOINTS.BARANG.DETAIL(id));
      return resp.data;
    } catch (error) {
      console.error('Error fetching barang detail:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearBarangCache = createAsyncThunk(
  'barang/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_barang');
      console.log('[Barang] Cache cleared');
    } catch (error) {
      console.error('[Barang] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
  selectedBarang: null,
};

const barangSlice = createSlice({
  name: 'barang',
  initialState,
  reducers: {
    clearBarangData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
    clearSelectedBarang: state => {
      state.selectedBarang = null;
    },
    // Add a direct data setter for Redux injector
    setBarangData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getBarang.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBarang.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getBarang.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getBarangOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getBarangOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBarangDetail.fulfilled, (state, action) => {
        state.selectedBarang = action.payload.data;
      })
      .addCase(clearBarangCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearBarangData, clearSelectedBarang } = barangSlice.actions;
export default barangSlice.reducer;
