import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const getBarang = createAsyncThunk(
  'barang/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching barang from API...', params);
      const resp = await apiClient.get(API_ENDPOINTS.BARANG.LIST, { params });
      console.log('Barang response:', resp.data);
      return resp.data;
    } catch (error) {
      console.error('Error fetching barang:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBarangDetail = createAsyncThunk(
  'barang/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Fetching barang detail:', id);
      const resp = await apiClient.get(API_ENDPOINTS.BARANG.DETAIL(id));
      return resp.data;
    } catch (error) {
      console.error('Error fetching barang detail:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
  selectedBarang: null,
};

const barangSlice = createSlice({
  name: 'barang',
  initialState,
  reducers: {
    clearBarangData: state => {
      state.data = [];
      state.error = null;
    },
    clearSelectedBarang: state => {
      state.selectedBarang = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getBarang.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBarang.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.error = null;
      })
      .addCase(getBarang.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getBarangDetail.fulfilled, (state, action) => {
        state.selectedBarang = action.payload.data;
      });
  },
});

export const { clearBarangData, clearSelectedBarang } = barangSlice.actions;
export default barangSlice.reducer;
