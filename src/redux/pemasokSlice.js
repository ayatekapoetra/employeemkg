import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getPemasok = createAsyncThunk(
    'list/pemasok',
    async () => {
        const local = await AsyncStorage.getItem("@pemasok")
        if(!local){
            const resp = await apiFetch.get('pemasok')
            await AsyncStorage.setItem("@pemasok", JSON.stringify(resp.data.data))
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

const pemasokSlice = createSlice({
    name: 'list/pemasok',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getPemasok.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getPemasok.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getPemasok.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default pemasokSlice.reducer