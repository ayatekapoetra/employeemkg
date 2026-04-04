import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@lokasi-pit';

export const getLokasiPit = createAsyncThunk(
  'lokasiPit/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached lokasi pit data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching lokasi pit from API...');
      const resp = await apiClient.get(API_ENDPOINTS.LOKASI_PIT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      console.log('[LokasiPit] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching lokasi pit:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
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
  data: null,
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
    // Add a direct data setter for Redux injector
    setLokasiPitData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
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
        state.data = action.payload.data;
        state.error = null;
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
