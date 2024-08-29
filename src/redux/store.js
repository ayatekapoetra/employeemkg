import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import themeReducer from './themeSlice'
import authReducer from './authSlice'
import alertReducer from './alertSlice'
import fetchDataSlice from './fetchDataSlice'
import showDataSlice from './showDataSlice'

import fetchTimeSheetSlice from './fetchTimeSheet'
import fetchPengajuanSlice from './fetchPengajuanSlice'
import fetchPurchaseRequestSlice from './fetchPurchaseRequestSlice'

import izinSakitSlice from './izinSakitSlice'
import izinCutiSlice from './izinCutiSlice'
import izinAlphaSlice from './izinAlphaSlice'

import tugasSlice from './tugasSlice'
import penyewaSlice from './penyewaSlice'
import lokasiPitSlice from './lokasiPitSlice'
import kegiatanPitSlice from './kegiatanPitSlice'
import equipmentSlice from './equipmentSlice'
import gudangSlice from './gudangSlice'
import barangSlice from './barangSlice'
import barangRackSlice from './barangRackSlice'

export default configureStore({
    reducer: {
      themes: themeReducer,
      auth: authReducer,
      myalert: alertReducer,
      dataSakit: izinSakitSlice,
      dataCuti: izinCutiSlice,
      dataAlpha: izinAlphaSlice,
      fetchData: fetchDataSlice,
      showData: showDataSlice,
      tugas: tugasSlice,
      penyewa: penyewaSlice,
      pit: lokasiPitSlice,
      kegiatan: kegiatanPitSlice,
      equipment: equipmentSlice,
      gudang: gudangSlice,
      barang: barangSlice,
      rack: barangRackSlice,
      timesheet: fetchTimeSheetSlice,
      pengajuan: fetchPengajuanSlice,
      purchaseRequest: fetchPurchaseRequestSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  })