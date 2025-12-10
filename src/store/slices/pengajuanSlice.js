import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';

export const getPengajuan = createAsyncThunk(
  'pengajuan/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching pengajuan dana from API...', params);
      const resp = await apiClient.get('pengajuan-dana', { params });
      console.log('Pengajuan response:', resp.data);
      return resp.data;
    } catch (error) {
      console.error('Error fetching pengajuan:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createPengajuan = createAsyncThunk(
  'pengajuan/create',
  async (data, { rejectWithValue }) => {
    try {
      console.log('Creating pengajuan dana...', data);
      const resp = await apiClient.post('pengajuan-dana', data);
      console.log('Create pengajuan response:', resp.data);
      return resp.data;
    } catch (error) {
      console.error('Error creating pengajuan:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePengajuan = createAsyncThunk(
  'pengajuan/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('Updating pengajuan dana...', id, data);
      const resp = await apiClient.put(`pengajuan-dana/${id}`, data);
      console.log('Update pengajuan response:', resp.data);
      return resp.data;
    } catch (error) {
      console.error('Error updating pengajuan:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const pengajuanSlice = createSlice({
  name: 'pengajuan',
  initialState,
  reducers: {
    clearPengajuanData: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPengajuan.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPengajuan.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.error = null;
      })
      .addCase(getPengajuan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(createPengajuan.pending, state => {
        state.loading = true;
      })
      .addCase(createPengajuan.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createPengajuan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePengajuan.pending, state => {
        state.loading = true;
      })
      .addCase(updatePengajuan.fulfilled, state => {
        state.loading = false;
      })
      .addCase(updatePengajuan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPengajuanData } = pengajuanSlice.actions;
export default pengajuanSlice.reducer;
