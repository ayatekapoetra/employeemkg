import { createSlice } from '@reduxjs/toolkit'

export const alertSlice = createSlice({
    name: 'alert',
    initialState: {
        show: false,
        status: null,
        title: null,
        subtitle: null
    },
    reducers: {
        applyAlert: (state, action) => {
            console.log("ALERT ACTION --", action);
            state.show = true
            state.status = action.payload.status
            state.title = action.payload.title
            state.subtitle = action.payload.subtitle
        },
        closeAlert: state => {
            state.show = false
            state.status = null
            state.title = null
            state.subtitle = null
        },
    }
})

// Action creators are generated for each case reducer function
export const { closeAlert, applyAlert } = alertSlice.actions

export default alertSlice.reducer