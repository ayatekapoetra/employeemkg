import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getVerifyOrder = createAsyncThunk(
    'list/verify-order',
    async (body) => {
        try {
            const resp = await apiFetch.post(`report-berkas-monitoring/verify-order`, body)
            return resp.data
        } catch (error) {
            console.log(error);
            return null
            
        }
    }
)

const initialState = {
    loadverifyorder: false,
    error: null,
    verifyorder: null
};

const verifyOrderSlice = createSlice({
    name: 'list/verify-order',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getVerifyOrder.pending, (state) => {
            state.loadverifyorder = true
            state.verifyorder = null
            state.error = null
        })
        .addCase(getVerifyOrder.fulfilled, (state, action) => {
            console.log("action --- ", action);
            state.loadverifyorder = false
            state.verifyorder = action.payload
            state.error = action.payload.message
        })
        .addCase(getVerifyOrder.rejected, (state, action) => {
            console.log("rejected", action);
            state.loadverifyorder = false
            state.error = action.error.code
        })
    }
})

export default verifyOrderSlice.reducer