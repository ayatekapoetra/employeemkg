import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const initialState = {
  loading: false,
  error: null,
  data: [],
  statistics: null,
  currentBreakdown: null,
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    lastPage: 1,
  },
};

/**
 * Get breakdown list with filters
 */
export const getBreakdownList = createAsyncThunk(
  'breakdown/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Fetching list with params:', params);
      const resp = await apiClient.get(API_ENDPOINTS.BREAKDOWN.LIST, { params });
      console.log('[Breakdown] List response:', resp.data);
      return resp.data?.rows || resp.data || { data: [], total: 0 };
    } catch (error) {
      console.error('[Breakdown] Error fetching list:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Get my breakdown list (auto-filter by user's cabang)
 */
export const getMyBreakdownList = createAsyncThunk(
  'breakdown/getMyList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Fetching my list with params:', params);
      const resp = await apiClient.get(API_ENDPOINTS.BREAKDOWN.MY_LIST, { params });
      console.log('[Breakdown] My list response:', resp.data);
      return resp.data?.rows || resp.data || { data: [], total: 0 };
    } catch (error) {
      console.error('[Breakdown] Error fetching my list:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Get today's breakdown
 */
export const getTodayBreakdown = createAsyncThunk(
  'breakdown/getToday',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Fetching today breakdown');
      const resp = await apiClient.get(API_ENDPOINTS.BREAKDOWN.TODAY);
      console.log('[Breakdown] Today response:', resp.data);
      return resp.data?.rows || resp.data || { data: [], total: 0 };
    } catch (error) {
      console.error('[Breakdown] Error fetching today:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Get breakdown statistics
 */
export const getBreakdownStatistics = createAsyncThunk(
  'breakdown/getStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Fetching statistics with params:', params);
      const resp = await apiClient.get(API_ENDPOINTS.BREAKDOWN.STATISTICS, { params });
      console.log('[Breakdown] Statistics response:', resp.data);
      return resp.data?.rows || resp.data || {};
    } catch (error) {
      console.error('[Breakdown] Error fetching statistics:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Get breakdown detail
 */
export const getBreakdownDetail = createAsyncThunk(
  'breakdown/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Fetching detail for ID:', id);
      const resp = await apiClient.get(API_ENDPOINTS.BREAKDOWN.DETAIL(id));
      console.log('[Breakdown] Detail response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Breakdown] Error fetching detail:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Create new breakdown
 */
export const createBreakdown = createAsyncThunk(
  'breakdown/create',
  async (data, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Creating breakdown with data:', data);
      const resp = await apiClient.post(API_ENDPOINTS.BREAKDOWN.CREATE, data);
      console.log('[Breakdown] Create response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Breakdown] Error creating breakdown:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Update breakdown
 */
export const updateBreakdown = createAsyncThunk(
  'breakdown/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Updating breakdown ID:', id, 'with data:', data);
      const resp = await apiClient.post(API_ENDPOINTS.BREAKDOWN.UPDATE(id), data);
      console.log('[Breakdown] Update response:', resp.data);
      return resp.data?.rows || resp.data || null;
    } catch (error) {
      console.error('[Breakdown] Error updating breakdown:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

/**
 * Delete breakdown
 */
export const deleteBreakdown = createAsyncThunk(
  'breakdown/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[Breakdown] Deleting breakdown ID:', id);
      const resp = await apiClient.post(API_ENDPOINTS.BREAKDOWN.DELETE(id));
      console.log('[Breakdown] Delete response:', resp.data);
      return { id, data: resp.data?.rows || resp.data };
    } catch (error) {
      console.error('[Breakdown] Error deleting breakdown:', error);
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message);
    }
  }
);

const breakdownSlice = createSlice({
  name: 'breakdown',
  initialState,
  reducers: {
    clearBreakdown: (state) => {
      state.data = [];
      state.error = null;
      state.currentBreakdown = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBreakdown: (state, action) => {
      state.currentBreakdown = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get List
      .addCase(getBreakdownList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBreakdownList.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.data = Array.isArray(payload) ? payload : (payload.data || []);
        state.pagination = {
          page: action.payload.page || 1,
          perPage: action.payload.perPage || 25,
          total: action.payload.total || 0,
          lastPage: action.payload.lastPage || 1,
        };
      })
      .addCase(getBreakdownList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get My List
      .addCase(getMyBreakdownList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyBreakdownList.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.data = Array.isArray(payload) ? payload : (payload.data || []);
        state.pagination = {
          page: action.payload.page || 1,
          perPage: action.payload.perPage || 25,
          total: action.payload.total || 0,
          lastPage: action.payload.lastPage || 1,
        };
      })
      .addCase(getMyBreakdownList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Today
      .addCase(getTodayBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.data = Array.isArray(payload) ? payload : (payload.data || []);
      })
      .addCase(getTodayBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Statistics
      .addCase(getBreakdownStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBreakdownStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getBreakdownStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Detail
      .addCase(getBreakdownDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBreakdownDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBreakdown = action.payload;
      })
      .addCase(getBreakdownDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBreakdown = action.payload;
        // Optionally add to list
        if (action.payload && state.data) {
          state.data.unshift(action.payload);
        }
      })
      .addCase(createBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBreakdown = action.payload;
        // Update in list if exists
        if (action.payload && state.data) {
          const index = state.data.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
        }
      })
      .addCase(updateBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from list
        if (action.payload && state.data) {
          state.data = state.data.filter(item => item.id !== action.payload.id);
        }
      })
      .addCase(deleteBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBreakdown, clearError, setCurrentBreakdown } = breakdownSlice.actions;
export default breakdownSlice.reducer;
