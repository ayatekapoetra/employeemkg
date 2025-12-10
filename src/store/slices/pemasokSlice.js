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
          return { data: JSON.parse(cached), fromCache: true };
        }
      }

      console.log('Fetching pemasok from API...');
      const resp = await apiClient.get(API_ENDPOINTS.PEMASOK.LIST);
      
      if (resp.data?.data) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(resp.data.data));
      }
      
      return resp.data;
    } catch (error) {
      console.error('Error fetching pemasok:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached), fromCache: true };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearPemasokCache = createAsyncThunk(
  'pemasok/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Pemasok cache cleared');
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const pemasokSlice = createSlice({
  name: 'pemasok',
  initialState,
  reducers: {
    clearPemasokData: state => {
      state.data = [];
      state.error = null;
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
      })
      .addCase(clearPemasokCache.fulfilled, state => {
        state.data = [];
      });
  },
});

export const { clearPemasokData } = pemasokSlice.actions;
export default pemasokSlice.reducer;
