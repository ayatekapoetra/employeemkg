import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import themeReducer from './themeSlice'
import authReducer from './authSlice'
import alertReducer from './alertSlice'
import fetchDataSlice from './fetchDataSlice'
import showDataSlice from './showDataSlice'

import izinSakitSlice from './izinSakitSlice'
import izinCutiSlice from './izinCutiSlice'
import izinAlphaSlice from './izinAlphaSlice'

export default configureStore({
    reducer: {
      themes: themeReducer,
      auth: authReducer,
      myalert: alertReducer,
      dataSakit: izinSakitSlice,
      dataCuti: izinCutiSlice,
      dataAlpha: izinAlphaSlice,
      fetchData: fetchDataSlice,
      showData: showDataSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  })