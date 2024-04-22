import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import themeReducer from './themeSlice'

export default configureStore({
    reducer: {
      themes: themeReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  })