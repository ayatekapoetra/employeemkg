import { 
  configureStore,
  createSerializableStateInvariantMiddleware,
  isPlain,
  Tuple,
} from '@reduxjs/toolkit'
import { Iterable } from 'immutable'
import logger from 'redux-logger'

import workspaceSlice from './workspaceSlice'

import themeReducer from './themeSlice'
import authReducer from './authSlice'
import alertReducer from './alertSlice'
import fetchDataSlice from './fetchDataSlice'
import showDataSlice from './showDataSlice'

import fetchTimeSheetSlice from './fetchTimeSheet'
import fetchPengajuanSlice from './fetchPengajuanSlice'
import fetchPurchaseRequestSlice from './fetchPurchaseRequestSlice'
import fetchDailyEventSlice from './fetchDailyEventSlice'
import fetchPenugasanSlice from './fetchPenugasanSlice'
import fetchPenugasanCountSlice from './fetchPenugasanCountSlice'
import fetchTireUsagesSlice from './fetchTireUsagesSlice'

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
import eventSlice from './eventSlice'
import pemasokSlice from './pemasokSlice'
import karyawanSlice from './karyawanSlice'

import docNewRequestSlice from './docNewRequestSlice'
import docCheckRequestSlice from './docCheckRequestSlice'
import docWaitOrderSlice from './docWaitOrderSlice'
import docVerifyOrderSlice from './docVerifyOrderSlice'
import docWaitPaymentSlice from './docWaitPaymentSlice'
import docWaitPartSlice from './docWaitPartSlice'

import sysOptionSlice from './sysOptionSlice'
import roleOperationSlice from './roleOperationSlice'

// Augment middleware to consider Immutable.JS iterables serializable
// const isSerializable = (value) => Iterable.isIterable(value) || isPlain(value)

// const getEntries = (value) =>
//   Iterable.isIterable(value) ? value.entries() : Object.entries(value)

// const serializableMiddleware = createSerializableStateInvariantMiddleware({
//   isSerializable,
//   getEntries,
// })

export default configureStore({
    reducer: {
      themes: themeReducer,
      auth: authReducer,
      workspaces: workspaceSlice,
      myalert: alertReducer,
      dataSakit: izinSakitSlice,
      dataCuti: izinCutiSlice,
      dataAlpha: izinAlphaSlice,
      fetchData: fetchDataSlice,
      showData: showDataSlice,
      tugas: tugasSlice,
      karyawan: karyawanSlice,
      penyewa: penyewaSlice,
      pit: lokasiPitSlice,
      kegiatan: kegiatanPitSlice,
      equipment: equipmentSlice,
      pemasok: pemasokSlice,
      gudang: gudangSlice,
      barang: barangSlice,
      rack: barangRackSlice,
      event: eventSlice,
      timesheet: fetchTimeSheetSlice,
      pengajuan: fetchPengajuanSlice,
      purchaseRequest: fetchPurchaseRequestSlice,
      dailyEvent: fetchDailyEventSlice,
      penugasan: fetchPenugasanSlice,
      penugasanCount: fetchPenugasanCountSlice, //
      tireUsages: fetchTireUsagesSlice,
      newRequest: docNewRequestSlice,
      checkRequest: docCheckRequestSlice,
      waitOrder: docWaitOrderSlice,
      verifyOrder: docVerifyOrderSlice,
      waitPay: docWaitPaymentSlice,
      waitPart: docWaitPartSlice,
      myoption: sysOptionSlice,
      roles: roleOperationSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    // middleware: () => new Tuple(serializableMiddleware),
    // middleware: () => new Tuple(logger),
  })