import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { StorageService } from '../../services';
import { apiClient } from '../../services/api/client';

export const getKaryawan = createAsyncThunk('list/karyawan', async () => {
  const local = await StorageService.getData('@karyawan');
  if (!local) {
    const resp = await apiClient.get('karyawan');
    await StorageService.setData('@karyawan', resp.data.data);
    return resp.data;
  } else {
    return {
      data: local,
    };
  }
});

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const karyawanSlice = createSlice({
  name: 'list/karyawan',
  initialState,
  reducers: {
    clearKaryawan: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getKaryawan.pending, (state) => {
        state.loading = true;
        state.data = null;
        state.error = null;
      })
      .addCase(getKaryawan.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = action.payload.message;
      })
      .addCase(getKaryawan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code;
      });
  },
});

export const { clearKaryawan } = karyawanSlice.actions;
export default karyawanSlice.reducer;
