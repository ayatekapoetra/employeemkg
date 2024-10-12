import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getWaitPart = createAsyncThunk(
    'list/waiting-part',
    async (body) => {
        try {
            const resp = await apiFetch.post(`report-berkas-monitoring/wait-part`, body)
            return resp.data
        } catch (error) {
            console.log(error);
            return null
            
        }
    }
)

const initialState = {
    loadwaitpart: false,
    error: null,
    waitpart: null
};

const waitPartSlice = createSlice({
    name: 'list/waiting-part',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getWaitPart.pending, (state) => {
            state.loadwaitpart = true
            state.waitpart = null
            state.error = null
        })
        .addCase(getWaitPart.fulfilled, (state, action) => {
            console.log("action --- ", action);
            state.loadwaitpart = false
            state.waitpart = action.payload
            state.error = action.payload.message
        })
        .addCase(getWaitPart.rejected, (state, action) => {
            console.log("rejected", action);
            state.loadwaitpart = false
            state.error = action.error.code
        })
    }
})

export default waitPartSlice.reducer