import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const getPenugasan = createAsyncThunk('penugasan/getList', async (params = null, { rejectWithValue }) => {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.TASKS.LIST, { params });
    
    if (resp?.data?.data) {
      return resp.data;
    } else {
      return resp.data;
    }
  } catch (error) {
    console.error('Error fetching penugasan:', error);
    return rejectWithValue({
      data: [],
      diagnostic: { error: true, message: error.message || 'ERR_BAD_REQUEST' },
    });
  }
});

const initialState = {
  loading: false,
  error: null,
  data: [],
};

const penugasanSlice = createSlice({
  name: 'penugasan',
  initialState,
  reducers: {
    clearPenugasan: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPenugasan.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPenugasan.fulfilled, (state, action) => {
        state.loading = false;
        if (!action?.payload?.diagnostic?.error) {
          state.error = null;
          state.data = action.payload.data || [];
        } else {
          state.error = 'ERR_BAD_RESPONSE';
          state.data = [];
        }
      })
      .addCase(getPenugasan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.diagnostic?.message || action.error.message;
        state.data = [];
      });
  },
});

export const { clearPenugasan } = penugasanSlice.actions;
export default penugasanSlice.reducer;
