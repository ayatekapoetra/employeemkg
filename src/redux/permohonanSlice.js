import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';

console.log(nanoid());

export const permohonan = createAsyncThunk(
    'permohonan/izin',
    async ( { type, qstring } ) => {
        let resp = null
        try {
            resp = await apiFetch.get(`hrd/permohonan-izin-${type}`, { params: qstring })
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

const permohonanSlice = createSlice({
    name: 'permohonan/izin',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(permohonan.pending, (state) => {
            state.loading = true
            state.error = null
            state.data = []
        })
        .addCase(permohonan.fulfilled, (state, action) => {
            // console.log("action --------- ", action);
            state.loading = false
            if(!action?.payload?.diagnostic?.error){
                state.error = null
                state.data = action.payload.data
            }else{
                state.error = "ERR_BAD_RESPONSE"
                state.data = []
            }
        })
        .addCase(permohonan.rejected, (state, action) => {
            // console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default permohonanSlice.reducer