import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getPenyewa = createAsyncThunk(
    'list/penyewa',
    async () => {
        const local = await AsyncStorage.getItem("@penyewa")
        if(!local){
            const resp = await apiFetch.get('penyewa')
            await AsyncStorage.setItem("@penyewa", JSON.stringify(resp.data.data))
            return resp.data
        }else{
            return {
                data: JSON.parse(local)
            }
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    data: null
};

const penyewaSlice = createSlice({
    name: 'list/penyewa',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getPenyewa.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getPenyewa.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getPenyewa.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default penyewaSlice.reducer