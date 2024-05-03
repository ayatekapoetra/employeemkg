import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import themeReducer from './themeSlice'
import authReducer from './authSlice'
import alertReducer from './alertSlice'
import permohonanSlice from './permohonanSlice'

export default configureStore({
    reducer: {
      themes: themeReducer,
      auth: authReducer,
      myalert: alertReducer,
      permohonan: permohonanSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  })