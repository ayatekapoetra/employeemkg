import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
// import { OneSignal } from 'react-native-onesignal';
import apiFetch from '../helpers/ApiFetch';

console.log(nanoid());

export const login = createAsyncThunk(
    'auth/login',
    async ( { username, password } ) => {
        console.log(username, password);
        let resp = null
        try {
            resp = await apiFetch.post('signin-employee', {username, password})
            console.log("----------API AUTH---", resp);
            // console.log("API ---", resp.data);
            if(resp?.data?.data?.token){
                await AsyncStorage.setItem('@token', resp?.data?.data?.token)
                await AsyncStorage.setItem('@user', JSON.stringify(resp?.data?.user))

                // const {id, email, handphone} = resp?.data?.user
                // OneSignal.login(`${id}`);
                // OneSignal.User.addEmail(email);
                // OneSignal.User.addSms(handphone);

                return resp.data
            }else{
                return resp.data
            }
    
            
        } catch (error) {
            console.log(error);
            return error?.response?.data
        }
    }
)

const initialState = {
    loading: false,
    error: null,
    token: null,
    user: null
};

const authSlice = createSlice({
    name: 'auth/login',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(login.pending, (state) => {
            state.loading = true
            state.user = null
            state.token = null
            state.error = null
        })
        .addCase(login.fulfilled, (state, action) => {
            console.log("action --- ", action);
            // console.log("PAYLOAD --- ", action.payload);

            state.loading = false
            if(action?.payload?.diagnostic?.error){
                state.token = null
                state.user = null
                state.error = action.payload.diagnostic.message
            }else{
                state.token = action.payload.data.token
                state.user = action.payload.user
                state.error = action.payload.message
            }
        })
        .addCase(login.rejected, (state, action) => {
            console.log("rejected", action);
            state.loading = false
            state.error = action.error.code
        })
    }
})

export default authSlice.reducer