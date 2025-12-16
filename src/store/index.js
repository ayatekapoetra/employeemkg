import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import alertReducer from './slices/alertSlice';
import karyawanReducer from './slices/karyawanSlice';
import oprdrvReducer from './slices/oprdrvSlice';
import penugasanReducer from './slices/penugasanSlice';
import equipmentReducer from './slices/equipmentSlice';
import equipmentPlanReducer from './slices/equipmentPlanSlice';
import equipmentDraftPlanReducer from './slices/equipmentDraftPlanSlice';
import checklogReducer from './slices/checklogSlice';
import gudangReducer from './slices/gudangSlice';
import barangReducer from './slices/barangSlice';
import penyewaReducer from './slices/penyewaSlice';
import lokasiPitReducer from './slices/lokasiPitSlice';
import kegiatanPitReducer from './slices/kegiatanPitSlice';
import shiftReducer from './slices/shiftSlice';
import pemasokReducer from './slices/pemasokSlice';
import barangRackReducer from './slices/barangRackSlice';

import tugasReducer from './slices/tugasSlice';
import pengajuanReducer from './slices/pengajuanSlice';

const isDevelopment = __DEV__;

const store = configureStore({
  reducer: {
    auth: authReducer,
    themes: themeReducer,
    alert: alertReducer,
    karyawan: karyawanReducer,
    oprdrv: oprdrvReducer,
    datapenugasan: penugasanReducer,
    equipment: equipmentReducer,
    equipmentPlan: equipmentPlanReducer,
    equipmentDraftPlan: equipmentDraftPlanReducer,
    checklog: checklogReducer,
    gudang: gudangReducer,
    barang: barangReducer,
    penyewa: penyewaReducer,
    lokasikerja: lokasiPitReducer,
    kegiatankerja: kegiatanPitReducer,
    shift: shiftReducer,
    pemasok: pemasokReducer,
    barangrack: barangRackReducer,
    tugas: tugasReducer,
    datapengajuan: pengajuanReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/restoreSession/fulfilled'],
      },
    });

    if (isDevelopment) {
      return middleware.concat(logger);
    }

    return middleware;
  },
  devTools: isDevelopment,
});

export default store;
