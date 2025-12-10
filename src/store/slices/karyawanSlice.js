import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const getKaryawan = createAsyncThunk('karyawan/getList', async (_, { rejectWithValue }) => {
  try {
    const local = await AsyncStorage.getItem('@karyawan');
    if (!local) {
      const resp = await apiClient.get(API_ENDPOINTS.KARYAWAN.LIST);
      const data = resp.data?.data || resp.data || [];
      if (data && data.length > 0) {
        await AsyncStorage.setItem('@karyawan', JSON.stringify(data));
      }
      return { data };
    } else {
      return {
        data: JSON.parse(local),
      };
    }
  } catch (error) {
    console.error('Error fetching karyawan:', error);
    const local = await AsyncStorage.getItem('@karyawan');
    if (local) {
      return { data: JSON.parse(local) };
    }
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const karyawanSlice = createSlice({
  name: 'karyawan',
  initialState,
  reducers: {
    clearKaryawan: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getKaryawan.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKaryawan.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getKaryawan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearKaryawan } = karyawanSlice.actions;
export default karyawanSlice.reducer;
