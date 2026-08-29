import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@material_ritase';

export const getMaterialRitase = createAsyncThunk(
  'materialRitase/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached material ritase data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching material ritase from API...');
      const resp = await apiClient.get(API_ENDPOINTS.MATERIAL_RITASE.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];

      console.log('[MaterialRitase] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }

      return { data };
    } catch (error) {
      console.warn('Error fetching material ritase:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getMaterialRitaseOffline = createAsyncThunk(
  'materialRitase/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[MaterialRitase] Loading offline data...');
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[MaterialRitase] Loaded from AsyncStorage:', parsed.length, 'items');
        return { data: parsed, source: 'asyncstorage' };
      }

      console.warn('[MaterialRitase] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[MaterialRitase] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearMaterialRitaseCache = createAsyncThunk(
  'materialRitase/clearCache',
  async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log('[MaterialRitase] Cache cleared');
    } catch (error) {
      console.error('[MaterialRitase] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
  dataSource: 'none',
  lastSync: null,
};

const materialRitaseSlice = createSlice({
  name: 'materialRitase',
  initialState,
  reducers: {
    clearMaterialRitaseData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
    setMaterialRitaseData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getMaterialRitase.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterialRitase.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getMaterialRitase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getMaterialRitaseOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getMaterialRitaseOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearMaterialRitaseCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearMaterialRitaseData, setMaterialRitaseData } = materialRitaseSlice.actions;
export default materialRitaseSlice.reducer;