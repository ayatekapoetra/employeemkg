import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@equipment';

export const getEquipment = createAsyncThunk(
  'equipment/getList', 
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearEquipmentCache = createAsyncThunk(
  'equipment/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    clearEquipment: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getEquipment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearEquipmentCache.fulfilled, state => {
        state.data = [];
      });
  },
});

export const { clearEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
