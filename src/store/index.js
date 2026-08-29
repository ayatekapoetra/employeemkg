import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { setReduxStore } from './reduxInjector';

import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import alertReducer from './slices/alertSlice';
import karyawanReducer from './slices/karyawanSlice';
import pengawasReducer from './slices/pengawasSlice';
import oprdrvReducer from './slices/oprdrvSlice';
import penugasanReducer from './slices/penugasanSlice';
import equipmentReducer from './slices/equipmentSlice';
import equipmentPlanReducer from './slices/equipmentPlanSlice';
import equipmentDraftPlanReducer from './slices/equipmentDraftPlanSlice';
import checklogReducer from './slices/checklogSlice';
import gudangReducer from './slices/gudangSlice';
import barangReducer from './slices/barangSlice';
import materialRitaseReducer from './slices/materialRitaseSlice';
import penyewaReducer from './slices/penyewaSlice';
import lokasiPitReducer from './slices/lokasiPitSlice';
import kegiatanPitReducer from './slices/kegiatanPitSlice';
import shiftReducer from './slices/shiftSlice';
import pemasokReducer from './slices/pemasokSlice';
import barangRackReducer from './slices/barangRackSlice';
import cabangReducer from './slices/cabangSlice';

import tugasReducer from './slices/tugasSlice';
import pengajuanReducer from './slices/pengajuanSlice';
import koordinatChecklogReducer from './slices/koordinatChecklogSlice';
import downloadReducer from './slices/downloadSlice';
import breakdownReducer from './slices/breakdownSlice';
import workOrderReducer from './slices/workOrderSlice';
import activityPlanReducer from './slices/activityPlanSlice';
import crewWorksheetReducer from './slices/crewWorksheetSlice';
import appReducer from './slices/appSlice';
import eventHistoryReducer from './slices/eventHistorySlice';
import eventCtgReducer from './slices/eventCtgSlice';
import equipmentMobilizationReducer from './slices/equipmentMobilizationSlice';
import dailyActivityReducer from './slices/dailyActivitySlice';

const isDevelopment = __DEV__;

const store = configureStore({
  reducer: {
    auth: authReducer,
    themes: themeReducer,
    alert: alertReducer,
    karyawan: karyawanReducer,
    pengawas: pengawasReducer,
    oprdrv: oprdrvReducer,
    datapenugasan: penugasanReducer,
    equipment: equipmentReducer,
    equipmentPlan: equipmentPlanReducer,
    equipmentDraftPlan: equipmentDraftPlanReducer,
    checklog: checklogReducer,
    gudang: gudangReducer,
    barang: barangReducer,
    materialRitase: materialRitaseReducer,
    penyewa: penyewaReducer,
    lokasikerja: lokasiPitReducer,
    kegiatankerja: kegiatanPitReducer,
    shift: shiftReducer,
    pemasok: pemasokReducer,
    barangrack: barangRackReducer,
    cabang: cabangReducer,
    tugas: tugasReducer,
    datapengajuan: pengajuanReducer,
    koordinatChecklog: koordinatChecklogReducer,
    download: downloadReducer,
    breakdown: breakdownReducer,
    workorder: workOrderReducer,
    activityPlan: activityPlanReducer,
    crewWorksheet: crewWorksheetReducer,
    app: appReducer,
    eventHistory: eventHistoryReducer,
    eventCtg: eventCtgReducer,
    equipmentMobilization: equipmentMobilizationReducer,
    dailyActivity: dailyActivityReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/login/fulfilled', 
          'auth/restoreSession/fulfilled',
          'auth/loadMasterDataAfterLogin/pending',
          'auth/loadMasterDataAfterLogin/fulfilled',
          'auth/loadMasterDataAfterLogin/rejected',
          'auth/loadSQLiteToReduxAfterSync/pending',
          'auth/loadSQLiteToReduxAfterSync/fulfilled',
          'auth/loadSQLiteToReduxAfterSync/rejected',
          'download/downloadSpecificData/pending',
          'download/downloadSpecificData/fulfilled',
          'download/downloadSpecificData/rejected',
          'download/downloadAllMasterData/pending',
          'download/downloadAllMasterData/fulfilled',
          'download/downloadAllMasterData/rejected',
          'app/loadSQLiteDataToRedux/pending',
          'app/loadSQLiteDataToRedux/fulfilled',
          'app/loadSQLiteDataToRedux/rejected',
        ],
      },
    });

    if (isDevelopment) {
      return middleware.concat(logger);
    }

    return middleware;
  },
  devTools: isDevelopment,
});

// Setup Redux injector with store reference
setReduxStore(store);

export default store;
