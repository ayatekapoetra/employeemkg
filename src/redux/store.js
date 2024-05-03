import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import themeReducer from './themeSlice'
import authReducer from './authSlice'
import alertReducer from './alertSlice'
import permohonanSlice from './permohonanSlice'

import izinSakitSlice from './izinSakitSlice'
import izinCutiSlice from './izinCutiSlice'
import izinAlphaSlice from './izinAlphaSlice'

export default configureStore({
    reducer: {
      themes: themeReducer,
      auth: authReducer,
      myalert: alertReducer,
      // permohonan: permohonanSlice,
      dataSakit: izinSakitSlice,
      dataCuti: izinCutiSlice,
      dataAlpha: izinAlphaSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  })