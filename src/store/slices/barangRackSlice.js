import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';

const CACHE_KEY = '@rack';

export const getBarangRack = createAsyncThunk(
  'barangRack/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached rack data');
          return { data: JSON.parse(cached), fromCache: true };
        }
      }

      console.log('Fetching rack from API...');
      const resp = await apiClient.get('rack-barang');
      
      if (resp.data?.data) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(resp.data.data));
      }
      
      return resp.data;
    } catch (error) {
      console.error('Error fetching rack:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached), fromCache: true };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearBarangRackCache = createAsyncThunk(
  'barangRack/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Rack cache cleared');
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const barangRackSlice = createSlice({
  name: 'barangRack',
  initialState,
  reducers: {
    clearBarangRackData: state => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getBarangRack.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBarangRack.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getBarangRack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearBarangRackCache.fulfilled, state => {
        state.data = null;
      });
  },
});

export const { clearBarangRackData } = barangRackSlice.actions;
export default barangRackSlice.reducer;
