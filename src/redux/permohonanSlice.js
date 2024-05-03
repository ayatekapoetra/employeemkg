import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';

console.log(nanoid());

export const pengajuan = createAsyncThunk(
    'pengajuan/sakit',
    async ( { username, password } ) => {
        console.log(username, password);
        let resp = null
        try {
            resp = await apiFetch.post('signin-employee', {username, password})
            console.log("----------API AUTH---", resp);
            if(resp?.data?.data){
                return resp.data
            }else{
                return resp.data
            }
            
        } catch (error) {
            console.log(error);
            return error?.response?.data
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    token: null,
    user: null
};

const permohonanSlice = createSlice({
    name: 'pengajuan/sakit',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(pengajuan.pending, (state) => {
            state.loading = true
            state.user = null
            state.token = null
            state.error = null
        })
        .addCase(pengajuan.fulfilled, (state, action) => {
            console.log("action --- ", action);
            // console.log("PAYLOAD --- ", action.payload);

            state.loading = false
            if(action?.payload?.diagnostic?.error){
                state.token = null
                state.user = null
                state.error = action.payload.diagnostic.message
            }else{
                state.token = action.payload.data.token
                state.user = action.payload.user
                state.error = action.payload.message
            }
        })
        .addCase(pengajuan.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default permohonanSlice.reducer