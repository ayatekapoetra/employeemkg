import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StorageService } from '../../services';

const initialState = {
  value: 'dark',
  loading: false,
};

export const loadTheme = createAsyncThunk(
  'theme/loadTheme',
  async () => {
    try {
      const theme = await StorageService.getData('theme');
      return theme || 'dark';
    } catch (error) {
      return 'dark';
    }
  }
);

export const saveTheme = createAsyncThunk(
  'theme/saveTheme',
  async (theme) => {
    try {
      await StorageService.setData('theme', theme);
      return theme;
    } catch (error) {
      throw error;
    }
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.value = state.value === 'dark' ? 'light' : 'dark';
      StorageService.setData('theme', state.value);
    },
    setTheme: (state, action) => {
      state.value = action.payload;
      StorageService.setData('theme', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTheme.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(loadTheme.rejected, (state) => {
        state.loading = false;
        state.value = 'dark';
      })
      .addCase(saveTheme.fulfilled, (state, action) => {
        state.value = action.payload;
      });
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
