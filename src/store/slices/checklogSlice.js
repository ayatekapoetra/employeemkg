import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import { compressSelfiePhoto } from '../../utils/imageUtils';

export const checkIn = createAsyncThunk('checklog/checkIn', async (data, { rejectWithValue, getState }) => {
  try {
    console.log('Sending check-in request...', data);
    
    const state = getState();
    const user = state.auth.user;
    const karyawan = state.auth.karyawan;
    
    const employeeId = karyawan?.id || user?.karyawan?.id;
    const employeePin = karyawan?.pin || user?.karyawan?.pin;
    
    const formData = new FormData();
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('jarak', data.jarak);
    
    if (employeeId) {
      formData.append('karyawan_id', employeeId);
    }
    if (employeePin) {
      formData.append('pin', employeePin);
    }
    
    let photoToUpload = data.photo;
    if (data.photo) {
      // Compress photo before upload to reduce network payload
      console.log('[CheckIn] Compressing selfie photo...');
      try {
        photoToUpload = await compressSelfiePhoto(data.photo, {
          maxWidth: 640,    // Selffies don't need to be large
          maxHeight: 640,   // Maintain aspect ratio
          quality: 0.6,     // 60% quality is sufficient for attendance photos
        });
        console.log('[CheckIn] Photo compression completed');
      } catch (compressError) {
        console.warn('[CheckIn] Compression failed, using original photo:', compressError?.message);
        photoToUpload = data.photo;
      }
      
      formData.append('photo', {
        uri: photoToUpload.uri,
        type: 'image/jpeg',
        name: 'checklog.jpg',
      });
    }

    const resp = await apiClient.post(API_ENDPOINTS.CHECKLOG.CHECK_IN, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return resp.data;
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.diagnostic) {
      return {
        diagnostic: error.response.data.diagnostic,
        data: error.response.data.data || null,
      };
    }
    
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const checkOut = createAsyncThunk('checklog/checkOut', async (data, { rejectWithValue, getState }) => {
  try {
    console.log('Sending check-out request...', data);
    
    const state = getState();
    const user = state.auth.user;
    const karyawan = state.auth.karyawan;
    
    console.log('Auth state:', {
      hasUser: !!user,
      hasKaryawan: !!karyawan,
      userKaryawan: user?.karyawan,
      karyawanId: karyawan?.id,
      karyawanNama: karyawan?.nama,
    });
    
    const employeeId = karyawan?.id || user?.karyawan?.id;
    const employeePin = karyawan?.pin || user?.karyawan?.pin;
    
    const formData = new FormData();
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('jarak', data.jarak);
    
    if (employeeId) {
      formData.append('karyawan_id', employeeId);
    }
    if (employeePin) {
      formData.append('pin', employeePin);
    }
    
    let photoToUpload = data.photo;
    if (data.photo) {
      // Compress photo before upload to reduce network payload
      console.log('[CheckOut] Compressing selfie photo...');
      try {
        photoToUpload = await compressSelfiePhoto(data.photo, {
          maxWidth: 640,    // Selffies don't need to be large
          maxHeight: 640,   // Maintain aspect ratio
          quality: 0.6,     // 60% quality is sufficient for attendance photos
        });
        console.log('[CheckOut] Photo compression completed');
      } catch (compressError) {
        console.warn('[CheckOut] Compression failed, using original photo:', compressError?.message);
        photoToUpload = data.photo;
      }
      
      formData.append('photo', {
        uri: photoToUpload.uri,
        type: 'image/jpeg',
        name: 'checklog.jpg',
      });
    }

    const resp = await apiClient.post(API_ENDPOINTS.CHECKLOG.CHECK_OUT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return resp.data;
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.diagnostic) {
      return {
        diagnostic: error.response.data.diagnostic,
        data: error.response.data.data || null,
      };
    }
    
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getTodayChecklog = createAsyncThunk('checklog/getToday', async (_, { rejectWithValue }) => {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.CHECKLOG.TODAY);
    return resp.data;
  } catch (error) {
    console.error('Error fetching today checklog:', error);
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  loading: false,
  error: null,
  todayChecklog: null,
  lastCheckIn: null,
  lastCheckOut: null,
};

const checklogSlice = createSlice({
  name: 'checklog',
  initialState,
  reducers: {
    clearChecklog: state => {
      state.error = null;
      state.lastCheckIn = null;
      state.lastCheckOut = null;
    },
    clearTodayChecklog: state => {
      state.todayChecklog = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(checkIn.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCheckIn = action.payload.data;
        state.error = null;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkOut.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCheckOut = action.payload.data;
        state.error = null;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTodayChecklog.fulfilled, (state, action) => {
        state.todayChecklog = action.payload.data;
      });
  },
});

export const { clearChecklog, clearTodayChecklog } = checklogSlice.actions;
export default checklogSlice.reducer;
