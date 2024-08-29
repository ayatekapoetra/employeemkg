import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getLokasiPit = createAsyncThunk(
    'list/lokasi-pit',
    async () => {
        const local = await AsyncStorage.getItem("@lokasi-pit")
        if(!local){
            const resp = await apiFetch.get('lokasi-kerja')
            await AsyncStorage.setItem("@lokasi-pit", JSON.stringify(resp.data.data))
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
    name: 'list/lokasi-pit',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getLokasiPit.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getLokasiPit.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getLokasiPit.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default penyewaSlice.reducer