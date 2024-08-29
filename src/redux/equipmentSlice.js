import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getEquipment = createAsyncThunk(
    'list/equipemnt',
    async () => {
        const local = await AsyncStorage.getItem("@equipment")
        if(!local){
            const resp = await apiFetch.get('equipment?isproduksi=true')
            await AsyncStorage.setItem("@equipment", JSON.stringify(resp.data.data))
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

const equipmentSlice = createSlice({
    name: 'list/equipemnt',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getEquipment.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getEquipment.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getEquipment.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default equipmentSlice.reducer