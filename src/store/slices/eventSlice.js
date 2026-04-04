import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const initialState = {
  loading: false,
  error: null,
  data: [],
  categories: [],
  currentEvent: null,
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    lastPage: 1,
  },
};

/**
 * Get event list with filters
 */
export const getEventList = createAsyncThunk(
  'event/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[Event] Fetching list with params:', params);
      const resp = await apiClient.get(API_ENDPOINTS.EVENT.LIST, { params });
      console.log('[Event] List response:--------------', resp);
      return resp.data?.rows || resp.data || { data: [], total: 0 };
    } catch (error) {
      console.error('[Event] Error fetching list:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);



/**
 * Get event categories
 */
export const getEventCategories = createAsyncThunk(
  'event/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Event] Fetching categories');
      const resp = await apiClient.get(API_ENDPOINTS.EVENT.CATEGORIES);
      console.log('[Event] Categories response:', resp.data);
      return resp.data?.rows || resp.data || [];
    } catch (error) {
      console.error('[Event] Error fetching categories:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Get event detail
 */
export const getEventDetail = createAsyncThunk(
  'event/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[Event] Fetching detail for ID:', id);
      const resp = await apiClient.get(API_ENDPOINTS.EVENT.DETAIL(id));
      console.log('[Event] Detail response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Event] Error fetching detail:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Create new event
 */
export const createEvent = createAsyncThunk(
  'event/create',
  async (data, { rejectWithValue }) => {
    try {
      console.log('[Event] Creating event with data:', data);
      const resp = await apiClient.post(API_ENDPOINTS.EVENT.CREATE, data);
      console.log('[Event] Create response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Event] Error creating event:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Update event
 */
export const updateEvent = createAsyncThunk(
  'event/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('[Event] Updating event ID:', id, 'with data:', data);
      const resp = await apiClient.post(API_ENDPOINTS.EVENT.UPDATE(id), data);
      console.log('[Event] Update response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Event] Error updating event:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Finish event
 */
export const finishEvent = createAsyncThunk(
  'event/finish',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('[Event] Finishing event ID:', id, 'with data:', data);
      const resp = await apiClient.post(API_ENDPOINTS.EVENT.FINISH(id), data);
      console.log('[Event] Finish response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Event] Error finishing event:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Delete event
 */
export const deleteEvent = createAsyncThunk(
  'event/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[Event] Deleting event ID:', id);
      const resp = await apiClient.post(API_ENDPOINTS.EVENT.DELETE(id));
      console.log('[Event] Delete response:', resp.data);
      return { id, data: resp.data?.rows || resp.data };
    } catch (error) {
      console.error('[Event] Error deleting event:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
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
      // Get List
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

      

      // Get Categories
      .addCase(getEventCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getEventCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Detail
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

      // Create Event
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

      // Update Event
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

      // Finish Event
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

      // Delete Event
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

export const { clearEvents, clearError, setCurrentEvent } = eventSlice.actions;

export default eventSlice.reducer;