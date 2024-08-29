import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getGudang = createAsyncThunk(
    'list/gudang',
    async () => {
        const local = await AsyncStorage.getItem("@gudang")
        if(!local){
            const resp = await apiFetch.get('gudang')
            await AsyncStorage.setItem("@gudang", JSON.stringify(resp.data.data))
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

const gudangSlice = createSlice({
    name: 'list/gudang',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getGudang.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getGudang.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getGudang.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default gudangSlice.reducer