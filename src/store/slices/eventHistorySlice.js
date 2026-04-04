import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const initialState = {
  loading: false,
  error: null,
  data: [],
  currentEvent: null,
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    lastPage: 1,
  },
};

export const getEventList = createAsyncThunk(
  'eventHistory/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.EVENT.LIST, { params });
      return resp.data?.rows || resp.data || { data: [], total: 0 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

export const getEventDetail = createAsyncThunk(
  'eventHistory/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.EVENT.DETAIL(id));
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'eventHistory/create',
  async (data, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.EVENT.CREATE, data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'eventHistory/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const resp = await apiClient.put(API_ENDPOINTS.EVENT.UPDATE(id), data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

export const finishEvent = createAsyncThunk(
  'eventHistory/finish',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const resp = await apiClient.put(API_ENDPOINTS.EVENT.FINISH(id), data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'eventHistory/delete',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.EVENT.DELETE(id));
      return { id, data: resp.data?.rows || resp.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

const eventHistorySlice = createSlice({
  name: 'eventHistory',
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.data = [];
      state.error = null;
      state.currentEvent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEventList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventList.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.data = Array.isArray(payload) ? payload : (payload.data || []);
        state.pagination = {
          page: payload.page || 1,
          perPage: payload.perPage || 25,
          total: payload.total || 0,
          lastPage: payload.lastPage || 1,
        };
      })
      .addCase(getEventList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getEventDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(getEventDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.data.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.data.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
          if (state.currentEvent?.id === action.payload.id) {
            state.currentEvent = action.payload;
          }
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(finishEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finishEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.data.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
          if (state.currentEvent?.id === action.payload.id) {
            state.currentEvent = action.payload;
          }
        }
      })
      .addCase(finishEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(item => item.id !== action.payload.id);
        state.pagination.total -= 1;
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEvents, clearError, setCurrentEvent } = eventHistorySlice.actions;

export default eventHistorySlice.reducer;
