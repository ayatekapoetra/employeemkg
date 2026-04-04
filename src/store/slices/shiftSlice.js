import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@shift';

export const getShift = createAsyncThunk(
  'shift/getShift',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached shift data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching shift from API...');
      const response = await apiClient.get(API_ENDPOINTS.SHIFT.LIST);
      const data = response.data?.rows || response.data?.data || response.data || [];
      
      console.log('[Shift] API response:', data.length, 'items');

      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengambil data shift');
      }

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching shift:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
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
  loading: false,
  error: null,
  data: null,
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
        state.data = action.payload.data;
        state.error = null;
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
