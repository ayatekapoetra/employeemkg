import { createSlice } from '@reduxjs/toolkit'
import moment from 'moment';

export const tugasSlice = createSlice({
    name: 'tugas',
    initialState: {
        step: 1,
        type: 'user',
        dateops: moment().format('YYYY-MM-DD'),
        shift: null,
        penyewa: null,
        lokasi: null,
        start_task: moment().format('YYYY-MM-DD'),
        dateline_task: null,
        equipmentTask: [],
        userTask: []
    },
    reducers: {
        applyTugas: (state, action) => {
            console.log("ALERT ACTION --", action);
            state.step = action.payload.step
            state.type = action.payload.type
            state.dateops = action.payload.dateops
            state.shift = action.payload.shift
            state.penyewa = action.payload.penyewa
            state.lokasi = action.payload.lokasi
            state.start_task = action.payload.start_task
            state.dateline_task = action.payload.dateline_task
            state.narasi = action.payload.narasi
            state.equipmentTask = action.payload.equipmentTask
            state.userTask = action.payload.userTask
        },
        clearTugas: state => {
            state.step = 1
            state.type = 'user'
            state.dateops = moment().format('YYYY-MM-DD')
            state.shift = null
            state.penyewa = null
            state.lokasi = null
            state.start_task = null
            state.dateline_task = null
            state.narasi = ''
            state.equipmentTask = []
            state.userTask = []
        },
    }
})

// Action creators are generated for each case reducer function
export const { clearTugas, applyTugas } = tugasSlice.actions

export default tugasSlice.reducer