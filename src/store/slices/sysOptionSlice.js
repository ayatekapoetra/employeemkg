import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@option';

export const getSysOption = createAsyncThunk(
  'sysOption/get',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached system options');
          return { data: JSON.parse(cached), fromCache: true };
        }
      }

      console.log('Fetching system options from API...');
      const resp = await apiClient.get(API_ENDPOINTS.SYSTEM.OPTIONS);
      
      if (resp.data?.data) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(resp.data.data));
      }
      
      return resp.data;
    } catch (error) {
      console.error('Error fetching system options:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached), fromCache: true };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearSysOptionCache = createAsyncThunk(
  'sysOption/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('System option cache cleared');
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const sysOptionSlice = createSlice({
  name: 'sysOption',
  initialState,
  reducers: {
    clearSysOptionData: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getSysOption.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSysOption.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getSysOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearSysOptionCache.fulfilled, state => {
        state.data = [];
      });
  },
});

export const { clearSysOptionData } = sysOptionSlice.actions;
export default sysOptionSlice.reducer;
