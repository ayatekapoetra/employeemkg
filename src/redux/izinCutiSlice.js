import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';

console.log(nanoid());

export const getCuti = createAsyncThunk(
    'izin/cuti',
    async ( { qstring } ) => {
        let resp = null
        try {
            resp = await apiFetch.get("hrd/permohonan-izin-cuti", {params: qstring})
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

const sakitSlice = createSlice({
    name: 'izin/cuti',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getCuti.pending, (state) => {
            state.loading = true
            state.error = null
            state.data = []
        })
        .addCase(getCuti.fulfilled, (state, action) => {
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
        .addCase(getCuti.rejected, (state, action) => {
            // console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default sakitSlice.reducer