import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getOption = createAsyncThunk(
    'list/option',
    async () => {
        const local = await AsyncStorage.getItem("@option")
        if(!local){
            const resp = await apiFetch.get('sys-option')
            console.log("API-OPTION--", resp);
            
            await AsyncStorage.setItem("@option", JSON.stringify(resp.data.data))
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

const optionSlice = createSlice({
    name: 'list/option',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getOption.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getOption.fulfilled, (state, action) => {
            console.log("action OPTION--- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getOption.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default optionSlice.reducer