import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getWaitOrder = createAsyncThunk(
    'list/waiting-order',
    async (body) => {
        try {
            const resp = await apiFetch.post(`report-berkas-monitoring/wait-order`, body)
            return resp.data
        } catch (error) {
            console.log(error);
            return null
            
        }
    }
)

const initialState = {
    loadwaitorder: false,
    error: null,
    waitorder: null
};

const waitOrderSlice = createSlice({
    name: 'list/waiting-order',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getWaitOrder.pending, (state) => {
            state.loadwaitorder = true
            state.waitorder = null
            state.error = null
        })
        .addCase(getWaitOrder.fulfilled, (state, action) => {
            console.log("action --- ", action);
            state.loadwaitorder = false
            state.waitorder = action.payload
            state.error = action.payload.message
        })
        .addCase(getWaitOrder.rejected, (state, action) => {
            console.log("rejected", action);
            state.loadwaitorder = false
            state.error = action.error.code
        })
    }
})

export default waitOrderSlice.reducer