import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
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
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.LOKASI_PIT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
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

export const clearLokasiPitCache = createAsyncThunk(
  'lokasiPit/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Lokasi pit cache cleared');
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
      state.data = null;
      state.error = null;
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
      })
      .addCase(clearLokasiPitCache.fulfilled, state => {
        state.data = null;
      });
  },
});

export const { clearLokasiPitData } = lokasiPitSlice.actions;
export default lokasiPitSlice.reducer;
