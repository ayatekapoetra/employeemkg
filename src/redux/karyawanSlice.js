import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getKaryawan = createAsyncThunk(
    'list/karyawan',
    async () => {
        const local = await AsyncStorage.getItem("@karyawan")
        if(!local){
            const resp = await apiFetch.get('karyawan')
            await AsyncStorage.setItem("@karyawan", JSON.stringify(resp.data.data))
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

const karyawanSlice = createSlice({
    name: 'list/karyawan',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getKaryawan.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getKaryawan.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getKaryawan.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default karyawanSlice.reducer