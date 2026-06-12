import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import SQLiteService from '../../database/SQLiteService';

const CACHE_KEY = '@pengawas';

export const getPengawas = createAsyncThunk(
  'pengawas/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      console.log('🚀 getPengawas thunk started with forceRefresh:', forceRefresh);
      
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached pengawas data');
          const parsedData = JSON.parse(cached);
          console.log('Cached data length:', parsedData.length);
          return { data: parsedData };
        }
      }

      try {
        const resp = await apiClient.get(API_ENDPOINTS.PENGAWAS.LIST);
        
        let data = resp.data?.rows || resp.data?.data || resp.data || [];
        
        if (data.length > 0) {
          console.log('👤 First pengawas item:', JSON.stringify(data[0], null, 2));
        }

        if (data && Array.isArray(data) && data.length > 0) {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
          console.log('💾 Pengawas data saved to AsyncStorage');
        } else {
          console.warn('⚠️ No pengawas data to save');
        }
        
        console.log('🎯 Returning pengawas data from thunk:', data.length, 'items');
        return { data };
        
      } catch (apiError) {
        console.error('❌ API Error fetching pengawas:', apiError);
        
        // Fallback to cached data
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('🔄 Using cached pengawas data as fallback');
          return { data: JSON.parse(cached) };
        }
        
        return rejectWithValue(apiError.response?.data?.message || apiError.message);
      }
      
    } catch (error) {
      console.error('❌ General error fetching pengawas:', error);
      return rejectWithValue(error.message || 'Failed to fetch pengawas data');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const pengawasSlice = createSlice({
  name: 'pengawas',
  initialState,
  reducers: {
    clearPengawas: state => {
      state.data = [];
      state.error = null;
    },
    setPengawasData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPengawas.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPengawas.fulfilled, (state, action) => {
        console.log('✅ Pengawas thunk fulfilled, setting data...');
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getPengawas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { clearPengawas } = pengawasSlice.actions;
export default pengawasSlice.reducer;

export const clearPengawasSQLite = () => async (dispatch) => {
  try {
    await SQLiteService.init();
    await SQLiteService.clear('master_pengawas');
    dispatch(clearPengawas());
    console.log('✅ Pengawas data cleared from SQLite');
  } catch (error) {
    console.error('❌ Error clearing pengawas data:', error);
  }
};