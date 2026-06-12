import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import SQLiteService from '../../database/SQLiteService';

const CACHE_KEY = '@karyawan';

export const getKaryawan = createAsyncThunk(
  'karyawan/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      console.log('🚀🚀🚀 getKaryawan thunk started with forceRefresh:', forceRefresh);
      
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Using cached karyawan data');
          const parsedData = JSON.parse(cached);
          console.log('Cached data length:', parsedData.length);
          return { data: parsedData };
        }
      }

      try {
        const resp = await apiClient.get(API_ENDPOINTS.KARYAWAN.LIST);
        
        let data = resp.data?.rows || resp.data?.data || resp.data || [];
        
        // Log first few items to see structure
        if (data.length > 0) {
          console.log('👤 First karyawan item:', JSON.stringify(data[0], null, 2));
        }
        
        // Apply area mapping like backend controller does
        data = data?.map( m => {
          const mapped = {...m, area: m?.cabang?.area || ''};
          return mapped;
        }) || [];
        
        console.log('✅ Final processed data:', data.length, 'records');

        if (data && Array.isArray(data) && data.length > 0) {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
          console.log('💾 Karyawan data saved to AsyncStorage');
        } else {
          console.warn('⚠️ No karyawan data to save');
        }
        
        console.log('🎯 Returning karyawan data from thunk:', data.length, 'items');
        return { data };
        
      } catch (apiError) {
        console.error('❌ API Error fetching karyawan:', apiError);
        console.error('❌ API Error response:', apiError.response?.data);
        
        // Try to get cached data as fallback
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('🔄 Using cached karyawan data as fallback');
          return { data: JSON.parse(cached) };
        }
        
        return rejectWithValue(apiError.response?.data?.message || apiError.message);
      }
      
    } catch (error) {
      console.error('❌ General error fetching karyawan:', error);
      return rejectWithValue(error.message || 'Failed to fetch karyawan data');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const karyawanSlice = createSlice({
  name: 'karyawan',
  initialState,
  reducers: {
    clearKaryawan: state => {
      state.data = [];
      state.error = null;
    },
    // Add a direct data setter for Redux injector
    setKaryawanData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getKaryawan.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKaryawan.fulfilled, (state, action) => {
        console.log('🔄🔄🔄 Karyawan thunk fulfilled, setting data...');
        console.log('📊 Payload received:', action.payload);
        console.log('📊 Payload data:', action.payload.data);
        console.log('📊 Data type:', typeof action.payload.data);
        console.log('📊 Data length:', action.payload.data?.length);
        
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
        
        console.log('✅✅✅ Karyawan state updated. New data length:', state.data?.length);
      })
      .addCase(getKaryawan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { clearKaryawan } = karyawanSlice.actions;
export default karyawanSlice.reducer;

// Additional async action for clearing SQLite data
export const clearKaryawanSQLite = () => async (dispatch) => {
  try {
    await SQLiteService.init();
    await SQLiteService.clear('master_karyawan');
    dispatch(clearKaryawan());
    console.log('✅ Karyawan data cleared from SQLite');
  } catch (error) {
    console.error('❌ Error clearing karyawan data:', error);
    // Don't throw error, continue with API fetch
  }
};
