import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@oprdrv';

export const getOprDrv = createAsyncThunk(
  'oprdrv/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached oprdrv data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching oprdrv from API...');
      const resp = await apiClient.get(API_ENDPOINTS.KARYAWAN.OPRDRV);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      console.log('[OprDrv] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching oprdrv:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOprDrvOffline = createAsyncThunk(
  'oprdrv/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[OprDrv] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getOprDrv();
      if (dbData && dbData.length > 0) {
        console.log('[OprDrv] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[OprDrv] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[OprDrv] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[OprDrv] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearOprDrvCache = createAsyncThunk(
  'oprdrv/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await database.clear('master_oprdrv');
      console.log('[OprDrv] Cache cleared');
    } catch (error) {
      console.error('[OprDrv] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const oprdrvSlice = createSlice({
  name: 'oprdrv',
  initialState,
  reducers: {
    clearOprDrv: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
    // Add a direct data setter for Redux injector
    setOprDrvData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getOprDrv.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOprDrv.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getOprDrv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getOprDrvOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getOprDrvOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearOprDrvCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearOprDrv } = oprdrvSlice.actions;
export default oprdrvSlice.reducer;
