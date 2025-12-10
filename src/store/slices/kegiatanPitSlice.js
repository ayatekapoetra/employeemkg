import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@kegiatan-pit';

export const getKegiatanPit = createAsyncThunk(
  'kegiatanPit/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.KEGIATAN_PIT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching kegiatan pit:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearKegiatanPitCache = createAsyncThunk(
  'kegiatanPit/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Kegiatan pit cache cleared');
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const kegiatanPitSlice = createSlice({
  name: 'kegiatanPit',
  initialState,
  reducers: {
    clearKegiatanPitData: state => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getKegiatanPit.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKegiatanPit.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getKegiatanPit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearKegiatanPitCache.fulfilled, state => {
        state.data = null;
      });
  },
});

export const { clearKegiatanPitData } = kegiatanPitSlice.actions;
export default kegiatanPitSlice.reducer;
