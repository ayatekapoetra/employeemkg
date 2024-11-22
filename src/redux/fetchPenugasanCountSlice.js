import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';
import moment from 'moment';

console.log(nanoid());

export const countPenugasan = createAsyncThunk(
    'penugasan/count',
    async () => {
        let resp = null
        try {
            resp = await apiFetch.get('penugasan', { params: { group: 'assigned', status: 'active'}})
            if(resp?.data){
                return resp.data.data.length
            }else{
                return resp.data.length || 0
            }
        } catch (error) {
            console.log(error);
            return {
                data: 0,
                diagnostic: {error: true, message: "ERR_BAD_REQUEST"}
            }
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    data: 0
};

const penugasanCountSlice = createSlice({
    name: 'penugasan/count',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(countPenugasan.pending, (state) => {
            state.loading = true
            state.error = null
            state.data = []
        })
        .addCase(countPenugasan.fulfilled, (state, action) => {
            // console.log('XXX---ACTION---XXXX', action.payload);
            state.loading = false
            if(!action?.payload?.diagnostic?.error){
                state.error = null
                state.data = action.payload
            }else{
                
                state.error = "ERR_BAD_RESPONSE"
                state.data = 0
            }
        })
        .addCase(countPenugasan.rejected, (state, action) => {
            // console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default penugasanCountSlice.reducer