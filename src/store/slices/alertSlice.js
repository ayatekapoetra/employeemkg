import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  show: false,
  status: 'info',
  title: '',
  subtitle: '',
  duration: 3000,
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.show = true;
      state.status = action.payload.status || 'info';
      state.title = action.payload.title || '';
      state.subtitle = action.payload.subtitle || '';
      state.duration = action.payload.duration || 3000;
    },
    hideAlert: (state) => {
      state.show = false;
      state.status = 'info';
      state.title = '';
      state.subtitle = '';
    },
    applyAlert: (state, action) => {
      state.show = action.payload.show || false;
      state.status = action.payload.status || 'info';
      state.title = action.payload.title || '';
      state.subtitle = action.payload.subtitle || '';
      state.duration = action.payload.duration || 3000;
    },
  },
});

export const { showAlert, hideAlert, applyAlert } = alertSlice.actions;
export default alertSlice.reducer;
