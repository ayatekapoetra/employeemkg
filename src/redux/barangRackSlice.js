import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getBarangRack = createAsyncThunk(
    'list/rack',
    async () => {
        const local = await AsyncStorage.getItem("@rack")
        if(!local){
            const resp = await apiFetch.get('rack-barang')
            await AsyncStorage.setItem("@rack", JSON.stringify(resp.data.data))
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

const barangRackSlice = createSlice({
    name: 'list/rack',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getBarangRack.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getBarangRack.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getBarangRack.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default barangRackSlice.reducer