import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@penyewa';

export const getPenyewa = createAsyncThunk(
  'penyewa/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.PENYEWA.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
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

export const clearPenyewaCache = createAsyncThunk(
  'penyewa/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Penyewa cache cleared');
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const penyewaSlice = createSlice({
  name: 'penyewa',
  initialState,
  reducers: {
    clearPenyewaData: state => {
      state.data = [];
      state.error = null;
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
      })
      .addCase(clearPenyewaCache.fulfilled, state => {
        state.data = [];
      });
  },
});

export const { clearPenyewaData } = penyewaSlice.actions;
export default penyewaSlice.reducer;
