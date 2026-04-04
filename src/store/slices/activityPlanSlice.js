import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '../../services/api/client'
import { API_ENDPOINTS } from '../../services/api/endpoints'

// Initial state
const initialState = {
  loading: false,
  error: null,
  data: [],
  currentActivityPlan: null,
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    lastPage: 1,
  },
  filters: {
    date_ops: '',
    shift: '',
    status: '',
    ctg: '',
    equipment_id: '',
    karyawan_id: '',
    lokasi_id: '',
    lokasi_to: '',
    cabang_id: '',
    keterangan: '',
    aktif: 'Y',
  },
}

/**
 * Get activity plan list with filters
 */
export const getActivityPlanList = createAsyncThunk(
  'activityPlan/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[ActivityPlan] Fetching list with params:', params)
      const resp = await apiClient.get(API_ENDPOINTS.ACTIVITY_PLAN.LIST, { params })
      console.log('[ActivityPlan] List response:', resp.data)
      return resp.data?.rows || resp.data || { data: [], total: 0 }
    } catch (error) {
      console.error('[ActivityPlan] Error fetching list:', error)
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Get activity plan detail
 */
export const getActivityPlanDetail = createAsyncThunk(
  'activityPlan/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[ActivityPlan] Fetching detail for ID:', id)
      const resp = await apiClient.get(API_ENDPOINTS.ACTIVITY_PLAN.DETAIL(id))
      console.log('[ActivityPlan] Detail response:', resp.data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      console.error('[ActivityPlan] Error fetching detail:', error)
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Create new activity plan
 */
export const createActivityPlan = createAsyncThunk(
  'activityPlan/create',
  async (data, { rejectWithValue }) => {
    try {
      console.log('[ActivityPlan] Creating with data:', data)
      const resp = await apiClient.post(API_ENDPOINTS.ACTIVITY_PLAN.CREATE, data)
      console.log('[ActivityPlan] Create response:', resp.data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      console.error('[ActivityPlan] Error creating:', error)
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Create activity plan in bulk
 */
export const createActivityPlanBulk = createAsyncThunk(
  'activityPlan/createBulk',
  async (payload, { rejectWithValue }) => {
    try {
      console.log('[ActivityPlan] Creating BULK with data:', payload)
      const resp = await apiClient.post(API_ENDPOINTS.ACTIVITY_PLAN.BULK_CREATE, payload)
      console.log('[ActivityPlan] Create BULK response:', resp.data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      console.error('[ActivityPlan] Error creating BULK:', error)
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Update activity plan
 */
export const updateActivityPlan = createAsyncThunk(
  'activityPlan/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const url = API_ENDPOINTS.ACTIVITY_PLAN.UPDATE(id)
      console.log('[ActivityPlan] Updating ID:', id, 'with data:', data)
      console.log('[ActivityPlan] Update URL:', url)
      
      // Use the data directly as payload
      const payload = data
      
      console.log('[ActivityPlan] Sending payload:', payload)
      const resp = await apiClient.post(url, payload)
      console.log('[ActivityPlan] Update response:', resp.data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      console.error('[ActivityPlan] Error updating:', error)
      console.error('[ActivityPlan] Error response data:', error.response?.data)
      console.error('[ActivityPlan] Error status:', error.response?.status)
      console.error('[ActivityPlan] Error headers:', error.response?.headers)
      
      // Get detailed error message
      const errorMessage = error.response?.data?.message || 
                            error.response?.data?.diagnostic?.message || 
                            error.response?.data?.errors?.join(', ') || 
                            error.message || 
                            'Gagal memperbarui data'
      
      return rejectWithValue(errorMessage)
    }
  }
)

/**
 * Delete activity plan (soft delete)
 */
export const deleteActivityPlan = createAsyncThunk(
  'activityPlan/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[ActivityPlan] Deleting ID:', id)
      const resp = await apiClient.post(API_ENDPOINTS.ACTIVITY_PLAN.DELETE(id))
      console.log('[ActivityPlan] Delete response:', resp.data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      console.error('[ActivityPlan] Error deleting:', error)
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

// Slice
const activityPlanSlice = createSlice({
  name: 'activityPlan',
  initialState,
  reducers: {
    clearActivityPlanData: (state) => {
      state.currentActivityPlan = null
      state.error = null
    },
    setActivityPlanFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetActivityPlanFilters: (state) => {
      state.filters = initialState.filters
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Get list
    builder
      .addCase(getActivityPlanList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getActivityPlanList.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        
        // Handle pagination data
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.data = action.payload.data
          state.pagination = {
            page: action.payload.current_page || 1,
            perPage: action.payload.per_page || 25,
            total: action.payload.total || 0,
            lastPage: action.payload.last_page || 1,
          }
        } else if (Array.isArray(action.payload)) {
          state.data = action.payload
          state.pagination = {
            page: 1,
            perPage: 25,
            total: action.payload.length,
            lastPage: 1,
          }
        } else {
          state.data = []
          state.pagination = initialState.pagination
        }
      })
      .addCase(getActivityPlanList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.data = []
      })

    // Get detail
    builder
      .addCase(getActivityPlanDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getActivityPlanDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentActivityPlan = action.payload
        state.error = null
      })
      .addCase(getActivityPlanDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.currentActivityPlan = null
      })

    // Create
    builder
      .addCase(createActivityPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createActivityPlan.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createActivityPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update
    builder
      .addCase(updateActivityPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateActivityPlan.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updateActivityPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete
    builder
      .addCase(deleteActivityPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteActivityPlan.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteActivityPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Create bulk
    builder
      .addCase(createActivityPlanBulk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createActivityPlanBulk.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createActivityPlanBulk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const {
  clearActivityPlanData,
  setActivityPlanFilters,
  resetActivityPlanFilters,
  clearError,
} = activityPlanSlice.actions

// Export reducer
export default activityPlanSlice.reducer
