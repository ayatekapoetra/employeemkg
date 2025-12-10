import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  step: 1,
  type: 'user',
  dateops: moment().format('YYYY-MM-DD'),
  shift: null,
  penyewa: null,
  lokasi: null,
  start_task: moment().format('YYYY-MM-DD'),
  dateline_task: null,
  narasi: '',
  equipmentTask: [],
  userTask: [],
};

const tugasSlice = createSlice({
  name: 'tugas',
  initialState,
  reducers: {
    applyTugas: (state, action) => {
      console.log('Applying tugas data:', action.payload);
      state.step = action.payload.step || state.step;
      state.type = action.payload.type || state.type;
      state.dateops = action.payload.dateops || state.dateops;
      state.shift = action.payload.shift;
      state.penyewa = action.payload.penyewa;
      state.lokasi = action.payload.lokasi;
      state.start_task = action.payload.start_task || state.start_task;
      state.dateline_task = action.payload.dateline_task;
      state.narasi = action.payload.narasi || '';
      state.equipmentTask = action.payload.equipmentTask || [];
      state.userTask = action.payload.userTask || [];
    },
    updateTugasStep: (state, action) => {
      state.step = action.payload;
    },
    addEquipmentToTask: (state, action) => {
      state.equipmentTask.push(action.payload);
    },
    removeEquipmentFromTask: (state, action) => {
      state.equipmentTask = state.equipmentTask.filter(
        item => item.id !== action.payload
      );
    },
    addUserToTask: (state, action) => {
      state.userTask.push(action.payload);
    },
    removeUserFromTask: (state, action) => {
      state.userTask = state.userTask.filter(
        item => item.id !== action.payload
      );
    },
    clearTugas: state => {
      state.step = 1;
      state.type = 'user';
      state.dateops = moment().format('YYYY-MM-DD');
      state.shift = null;
      state.penyewa = null;
      state.lokasi = null;
      state.start_task = moment().format('YYYY-MM-DD');
      state.dateline_task = null;
      state.narasi = '';
      state.equipmentTask = [];
      state.userTask = [];
    },
  },
});

export const {
  applyTugas,
  updateTugasStep,
  addEquipmentToTask,
  removeEquipmentFromTask,
  addUserToTask,
  removeUserFromTask,
  clearTugas,
} = tugasSlice.actions;

export default tugasSlice.reducer;
