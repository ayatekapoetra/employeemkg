import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@pemasok';

export const getPemasok = createAsyncThunk(
  'pemasok/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached pemasok data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching pemasok from API...');
      const resp = await apiClient.get(API_ENDPOINTS.PEMASOK.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      console.log('[Pemasok] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching pemasok:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
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
  data: null,
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
    // Add a direct data setter for Redux injector
    setPemasokData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
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
        state.data = action.payload.data;
        state.error = null;
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
