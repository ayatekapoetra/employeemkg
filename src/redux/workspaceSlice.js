import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import apiFetch from '../helpers/ApiFetch';

console.log(nanoid());

export const getWorkspace = createAsyncThunk(
    'workspace',
    async () => {
        let resp = null
        try {
            resp = await apiFetch.get('/bisnis-unit/show')
            if(resp?.data){
                return resp.data
            }else{
                return resp.data
            }
        } catch (error) {
            console.log(error);
            return {
                data: null,
                diagnostic: {error: true, message: "ERR_BAD_REQUEST"}
            }
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    data: null
};

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getWorkspace.pending, (state) => {
            state.loading = true
            state.error = null
            state.data = null
        })
        .addCase(getWorkspace.fulfilled, (state, action) => {
            // console.log("action --------- ", action.payload);
            state.loading = false
            if(!action?.payload?.diagnostic?.error){
                state.error = null
                state.data = action.payload
            }else{
                state.error = "ERR_BAD_RESPONSE"
                state.data = []
            }
        })
        .addCase(getWorkspace.rejected, (state, action) => {
            // console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default workspaceSlice.reducer