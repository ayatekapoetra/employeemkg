import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch'

console.log(nanoid());

export const getEvent = createAsyncThunk(
    'list/event',
    async () => {
        const local = await AsyncStorage.getItem("@event")
        if(!local){
            const resp = await apiFetch.get('event')
            await AsyncStorage.setItem("@event", JSON.stringify(resp.data.data))
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

const eventSlice = createSlice({
    name: 'list/event',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getEvent.pending, (state) => {
            state.loading = true
            state.data = null
            state.error = null
        })
        .addCase(getEvent.fulfilled, (state, action) => {
            // console.log("action --- ", action);
            state.loading = false
            state.data = action.payload.data
            state.error = action.payload.message
        })
        .addCase(getEvent.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default eventSlice.reducer