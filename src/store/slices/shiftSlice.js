import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const getShift = createAsyncThunk(
  'shift/getShift',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHIFT.LIST);
      
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengambil data shift');
      }
      
      return response.data?.rows || response.data?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShift.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = shiftSlice.actions;
export default shiftSlice.reducer;
