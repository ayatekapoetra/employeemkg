import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';
import moment from 'moment';

console.log(nanoid());

export const getPurchaseRequest = createAsyncThunk(
    'purchase/request',
    async (params) => {
        let resp = null
        try {
            resp = await apiFetch.get('purchasing-request', { params: params })
            console.log('xx--xx', resp);
            if(resp?.data?.data){
                return resp.data
            }else{
                return resp.data
            }
        } catch (error) {
            console.log(error);
            return {
                data: [],
                diagnostic: {error: true, message: "ERR_BAD_REQUEST"}
            }
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    data: []
};

const purchaseRequestSlice = createSlice({
    name: 'purchase/request',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getPurchaseRequest.pending, (state) => {
            state.loading = true
            state.error = null
            state.data = []
        })
        .addCase(getPurchaseRequest.fulfilled, (state, action) => {
            state.loading = false
            if(!action?.payload?.diagnostic?.error){
                state.error = null
                state.data = action.payload.data
            }else{
                state.error = "ERR_BAD_RESPONSE"
                state.data = []
            }
        })
        .addCase(getPurchaseRequest.rejected, (state, action) => {
            // console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default purchaseRequestSlice.reducer