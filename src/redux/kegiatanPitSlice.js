import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getKegiatanPit = createAsyncThunk(
    'list/kegiatan-pit',
    async () => {
        const local = await AsyncStorage.getItem("@kegiatan-pit")
        if(!local){
            const resp = await apiFetch.get('kegiatan-mining')
            await AsyncStorage.setItem("@kegiatan-pit", JSON.stringify(resp.data.data))
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

const kegiatanPitSlice = createSlice({
    name: 'list/kegiatan-pit',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getKegiatanPit.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getKegiatanPit.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getKegiatanPit.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default kegiatanPitSlice.reducer