import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const initialState = {
  loading: false,
  error: null,
  data: [],
};

export const getEventCategories = createAsyncThunk(
  'eventCtg/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.EVENT.CATEGORIES);
      const rows = resp.data?.rows;
      const data = rows?.data || rows || resp.data || [];
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

const eventCtgSlice = createSlice({
  name: 'eventCtg',
  initialState,
  reducers: {
    clearEventCategories: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEventCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventCategories.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      })
      .addCase(getEventCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEventCategories } = eventCtgSlice.actions;
export default eventCtgSlice.reducer;
