import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@gudang';

export const getGudang = createAsyncThunk(
  'gudang/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached gudang data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching gudang from API...');
      const resp = await apiClient.get(API_ENDPOINTS.GUDANG.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
       
      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching gudang:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearGudangCache = createAsyncThunk(
  'gudang/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Gudang cache cleared');
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const gudangSlice = createSlice({
  name: 'gudang',
  initialState,
  reducers: {
    clearGudangData: state => {
      state.data = [];
      state.error = null;
    },
    // Add a direct data setter for Redux injector
    setGudangData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getGudang.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGudang.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getGudang.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearGudangCache.fulfilled, state => {
        state.data = [];
      });
  },
});

export const { clearGudangData } = gudangSlice.actions;
export default gudangSlice.reducer;
