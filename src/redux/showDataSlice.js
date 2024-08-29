import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';

console.log(nanoid());

export const showDataFetch = createAsyncThunk(
    'showData',
    async ( uri ) => {
        let resp = null
        try {
            resp = await apiFetch.get(uri)
            // console.log('<<<<<<<<<<', resp);
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
    data: null
};

const showDataSlice = createSlice({
    name: 'showData',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(showDataFetch.pending, (state) => {
            state.loading = true
            state.error = null
            state.data = []
        })
        .addCase(showDataFetch.fulfilled, (state, action) => {
            // console.log("action --------- ", action);
            state.loading = false
            if(!action?.payload?.diagnostic?.error){
                state.error = null
                state.data = action.payload.data
            }else{
                state.error = "ERR_BAD_RESPONSE"
                state.data = null
            }
        })
        .addCase(showDataFetch.rejected, (state, action) => {
            // console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default showDataSlice.reducer