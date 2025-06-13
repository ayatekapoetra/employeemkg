import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getRoles = createAsyncThunk(
    'list/roles',
    async (params={isproduksi: 'Y'}) => {
        const local = await AsyncStorage.getItem("@opsroles")
        if(!local){
            const resp = await apiFetch.get('role-penyewa-equipment', {params: params})
            await AsyncStorage.setItem("@opsroles", JSON.stringify(resp.data.data))
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

const roleOperationSlice = createSlice({
    name: 'list/roles',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getRoles.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getRoles.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getRoles.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default roleOperationSlice.reducer