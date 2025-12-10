import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
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
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.KARYAWAN.OPRDRV);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
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

export const clearOprDrvCache = createAsyncThunk(
  'oprdrv/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
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
      state.data = null;
      state.error = null;
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
      })
      .addCase(clearOprDrvCache.fulfilled, state => {
        state.data = null;
      });
  },
});

export const { clearOprDrv } = oprdrvSlice.actions;
export default oprdrvSlice.reducer;
