import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@cabang';

export const getCabang = createAsyncThunk(
  'cabang/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached cabang data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching cabang from API...');
      const resp = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      console.log('[Cabang] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching cabang:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getCabangOffline = createAsyncThunk(
  'cabang/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Cabang] Loading offline data...');

      // 1. TRY ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[Cabang] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[Cabang] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[Cabang] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearCabangCache = createAsyncThunk(
  'cabang/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log('[Cabang] Cache cleared');
    } catch (error) {
      console.error('[Cabang] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const cabangSlice = createSlice({
  name: 'cabang',
  initialState,
  reducers: {
    clearCabang: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCabang.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCabang.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getCabang.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getCabangOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getCabangOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCabangCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearCabang } = cabangSlice.actions;
export default cabangSlice.reducer;