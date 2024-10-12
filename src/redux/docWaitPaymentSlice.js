import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getWaitPayment = createAsyncThunk(
    'list/waiting-payment',
    async (body) => {
        try {
            const resp = await apiFetch.post(`report-berkas-monitoring/wait-payment`, body)
            return resp.data
        } catch (error) {
            console.log(error);
            return null
            
        }
    }
)

const initialState = {
    loadwaitpay: false,
    error: null,
    waitpayment: null
};

const waitPaymentSlice = createSlice({
    name: 'list/waiting-payment',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getWaitPayment.pending, (state) => {
            state.loadwaitpay = true
            state.waitpayment = null
            state.error = null
        })
        .addCase(getWaitPayment.fulfilled, (state, action) => {
            console.log("action --- ", action);
            state.loadwaitpay = false
            state.waitpayment = action.payload
            state.error = action.payload.message
        })
        .addCase(getWaitPayment.rejected, (state, action) => {
            console.log("rejected", action);
            state.loadwaitpay = false
            state.error = action.error.code
        })
    }
})

export default waitPaymentSlice.reducer