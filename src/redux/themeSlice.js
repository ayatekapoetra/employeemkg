import { createSlice, nanoid } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage';

const colorModeManager = {
    get: async () => {
      try {
            let val = await AsyncStorage.getItem("@color-mode")
            return val
      } catch (e) {
            return
      }
    },
    set: async value => {
        try {
            await AsyncStorage.setItem("@color-mode", value)
        } catch (e) {
            console.log(e)
        }
    }
}

export const themeSlice = createSlice({
    name: 'themes',
    initialState: {
      value: 'dark'
    },
    reducers: {
        applyTheme: (state, action) => {
            state.value = action.payload
            colorModeManager.set(action.payload || "dark")
        },
        toggleTheme: state => {
            state.value = state.value == 'dark' ? 'light':'dark'
        },
    }
  })
  
  export const { toggleTheme, applyTheme } = themeSlice.actions
  
  export default themeSlice.reducer