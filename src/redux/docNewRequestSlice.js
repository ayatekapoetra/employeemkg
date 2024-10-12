import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getNewRequst = createAsyncThunk(
    'list/new-request',
    async (body) => {
        try {
            const resp = await apiFetch.post(`report-berkas-monitoring/new-request`, body)
            return resp.data
        } catch (error) {
            console.log(error);
            return null
            
        }
    }
)

const initialState = {
    loadnewreq: false,
    error: null,
    newreq: null
};

const newRequestSlice = createSlice({
    name: 'list/new-request',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getNewRequst.pending, (state) => {
            state.loadnewreq = true
            state.newreq = null
            state.error = null
        })
        .addCase(getNewRequst.fulfilled, (state, action) => {
            console.log("action --- ", action);
            state.loadnewreq = false
            state.newreq = action.payload
            state.error = action.payload.message
        })
        .addCase(getNewRequst.rejected, (state, action) => {
            console.log("rejected", action);
            state.loadnewreq = false
            state.newreq = null
            state.error = action.error.code
        })
    }
})

export default newRequestSlice.reducer