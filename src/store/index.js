import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import alertReducer from './slices/alertSlice';
import karyawanReducer from './slices/karyawanSlice';

const isDevelopment = __DEV__;

const store = configureStore({
  reducer: {
    auth: authReducer,
    themes: themeReducer,
    alert: alertReducer,
    karyawan: karyawanReducer,
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
