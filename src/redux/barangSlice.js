import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getBarang = createAsyncThunk(
    'list/barang',
    async (qstring = null) => {
        try {
            const resp = await apiFetch.get('barang', {params: qstring})
            return resp.data
        } catch (error) {
            console.log(error);
            return {
                data: []
            }
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    data: null
};

const barangSlice = createSlice({
    name: 'list/barang',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getBarang.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getBarang.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getBarang.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default barangSlice.reducer