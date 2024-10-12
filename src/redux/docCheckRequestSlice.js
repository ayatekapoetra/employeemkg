import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getCheckRequst = createAsyncThunk(
    'list/check-request',
    async (body) => {
        try {
            const resp = await apiFetch.post(`report-berkas-monitoring/validate-request`, body)
            return resp.data
        } catch (error) {
            console.log(error);
            return null
            
        }
    }
)

const initialState = {
    loadcheck: false,
    error: null,
    checkreq: null
};

const checkRequestSlice = createSlice({
    name: 'list/check-request',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getCheckRequst.pending, (state) => {
            state.loadcheck = true
            state.checkreq = null
            state.error = null
        })
        .addCase(getCheckRequst.fulfilled, (state, action) => {
            console.log("action --- ", action);
            state.loadcheck = false
            state.checkreq = action.payload
            state.error = action.payload.message
        })
        .addCase(getCheckRequst.rejected, (state, action) => {
            console.log("rejected", action);
            state.loadcheck = false
            state.error = action.error.code
        })
    }
})

export default checkRequestSlice.reducer