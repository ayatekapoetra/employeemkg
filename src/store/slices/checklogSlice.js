import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import attendanceClient from '../../services/api/attendanceClient';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import { compressSelfiePhoto } from '../../utils/imageUtils';
import deviceIdGenerator from '../../utils/deviceIdGenerator';

/**
 * Kompres foto selfie sebelum upload.
 * Mengembalikan foto yang sudah dikompres, atau foto asli jika gagal.
 */
async function preparePhoto(photo) {
  if (!photo) return null;

  try {
    console.log('[Checklog] Compressing selfie photo...');
    const compressed = await compressSelfiePhoto(photo, {
      maxWidth: 640,
      maxHeight: 640,
      quality: 0.6,
    });
    console.log('[Checklog] Photo compression completed');
    return compressed;
  } catch (err) {
    console.warn('[Checklog] Compression failed, using original photo:', err?.message);
    return photo;
  }
}

/**
 * Bangun payload absensi sebagai JSON fields (untuk dimasukkan ke FormData).
 */
function buildAttendanceFields({ employeeId, statusScan, scan, deviceId }) {
  return {
    type: 'attlog',
    cloud_id: deviceId,
    karyawan_id: String(employeeId),
    data: JSON.stringify({
      pin: null,
      scan,
      status_scan: statusScan,
      verify: 10,
    }),
  };
}

/**
 * Kirim data absensi ke gateway (app-aichat) menggunakan multipart/form-data
 * agar foto bisa ikut terkirim dan gateway dapat memprosesnya ke HRIS.
 */
async function submitAttendanceToGateway({ employeeId, statusScan, photo }) {
  if (!employeeId) {
    throw new Error('Data karyawan tidak ditemukan. Silakan login ulang.');
  }

  const deviceId = await deviceIdGenerator.getDeviceId();
  if (!deviceId) {
    throw new Error('Device ID tidak tersedia. Silakan restart aplikasi dan coba lagi.');
  }

  const fields = buildAttendanceFields({
    employeeId,
    statusScan,
    scan: new Date().toISOString(),
    deviceId,
  });

  const formData = new FormData();
  formData.append('type', fields.type);
  formData.append('cloud_id', fields.cloud_id);
  formData.append('karyawan_id', fields.karyawan_id);
  formData.append('data', fields.data);

  if (photo?.uri) {
    // Tentukan ekstensi dari URI atau default ke jpeg
    const uriParts = photo.uri.split('.');
    const ext = uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `attendance_${Date.now()}.${ext}`;

    formData.append('photo', {
      uri: photo.uri,
      type: mimeType,
      name: fileName,
    });

    console.log('[Checklog] Photo attached to FormData:', fileName);
  } else {
    console.warn('[Checklog] No photo available, request may be rejected by gateway.');
  }

  return attendanceClient.post(API_ENDPOINTS.CHECKLOG.ATTENDANCE_GATEWAY, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

function getHrisSyncFailureMessage(responseData) {
  const hrisSync = responseData?.data?.hris_sync;
  if (!hrisSync || hrisSync.success !== false) return null;

  if (hrisSync.code === 'HRIS_DUPLICATE_ATTENDANCE') {
    return String(hrisSync.message || 'Anda telah melakukan absensi...');
  }

  const syncMessage = String(hrisSync.message || '').trim();
  if (syncMessage) {
    return `Absensi diterima gateway, tetapi gagal tersimpan ke HRIS: ${syncMessage}`;
  }

  return 'Absensi diterima gateway, tetapi gagal tersimpan ke HRIS.';
}

export const checkIn = createAsyncThunk('checklog/checkIn', async (data, { rejectWithValue, getState }) => {
  try {
    console.log('Sending check-in request...');

    const state = getState();
    const user = state.auth.user;
    const karyawan = state.auth.karyawan;
    const employeeId = karyawan?.id || user?.karyawan?.id;

    // Bug fix: simpan hasil kompresi dan teruskan ke gateway
    const photo = await preparePhoto(data.photo);

    const resp = await submitAttendanceToGateway({
      employeeId,
      statusScan: 0,
      photo,
    });

    const hrisSyncFailure = getHrisSyncFailureMessage(resp.data);
    if (hrisSyncFailure) {
      console.warn('[Checklog] HRIS sync failed after check-in:', resp.data?.data?.hris_sync);
      return rejectWithValue(hrisSyncFailure);
    }

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
    console.log('Sending check-out request...');

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

    // Bug fix: simpan hasil kompresi dan teruskan ke gateway
    const photo = await preparePhoto(data.photo);

    const resp = await submitAttendanceToGateway({
      employeeId,
      statusScan: 1,
      photo,
    });

    const hrisSyncFailure = getHrisSyncFailureMessage(resp.data);
    if (hrisSyncFailure) {
      console.warn('[Checklog] HRIS sync failed after check-out:', resp.data?.data?.hris_sync);
      return rejectWithValue(hrisSyncFailure);
    }

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
        state.lastCheckIn = action.payload?.data ?? null;
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
        state.lastCheckOut = action.payload?.data ?? null;
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
