import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '../../services/api/client'
import { API_ENDPOINTS } from '../../services/api/endpoints'

// Initial state
const initialState = {
  loading: false,
  error: null,
  data: [],
  approvalData: [],
  currentCrewWorksheet: null,
  stats: null,
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
    cabang_id: '',
    area: '',
    karyawan_id: '',
    aktif: 'Y',
  },
}

/**
 * Get crew worksheet list with filters
 */
export const getCrewWorksheetList = createAsyncThunk(
  'crewWorksheet/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.CREW_WORKSHEET.LIST, { params })
      
      if (!resp.data) {
        console.log('⚠️ No response data received');
        return []
      }
      
      // Handle different response structures from backend with new service pattern
      if (resp.data?.diagnostic?.error) {
        // Error response from service
        return rejectWithValue(resp.data.diagnostic.message || 'Service error');
      }
      
      if (resp.data?.data) {
        return resp.data.data
      } else if (resp.data?.rows) {
        return resp.data.rows
      } else if (Array.isArray(resp.data)) {
        return resp.data
      } else {
        return []
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Get crew worksheet approval list
 */
export const getCrewWorksheetApprovalList = createAsyncThunk(
  'crewWorksheet/getApprovalList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.CREW_WORKSHEET.APPROVAL_LIST, { params })

      if (!resp.data) {
        console.log('⚠️ No response data received');
        return []
      }

      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Service error')
      }

      if (resp.data?.data) {
        return resp.data.data
      } else if (resp.data?.rows) {
        return resp.data.rows
      } else if (Array.isArray(resp.data)) {
        return resp.data
      }
      return []
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Get crew worksheet detail
 */
export const getCrewWorksheetDetail = createAsyncThunk(
  'crewWorksheet/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.CREW_WORKSHEET.DETAIL(id))
      return resp.data?.rows || resp.data || null
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Get crew worksheet statistics
 */
export const getCrewWorksheetStats = createAsyncThunk(
  'crewWorksheet/getStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 API Call to:', API_ENDPOINTS.CREW_WORKSHEET.STATS);
      console.log('📋 Stats Params:', JSON.stringify(params, null, 2));
      
      const resp = await apiClient.get(API_ENDPOINTS.CREW_WORKSHEET.STATS, { params })
      
      console.log('✅ Stats API Response received:', {
        status: resp.status,
        data: resp.data
      });
      
      return resp.data?.rows || resp.data || null
    } catch (error) {
      console.error('❌ Stats API Error:', error);
      console.error('❌ Stats Error details:', {
        message: error.message,
        response: JSON.stringify(error.response?.data, null, 2),
        status: error.response?.status
      });
      
      // Return null for stats API errors - no mock data
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Get crew worksheets by supervisor
 */
export const getCrewWorksheetBySupervisor = createAsyncThunk(
  'crewWorksheet/getBySupervisor',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 API Call to:', API_ENDPOINTS.CREW_WORKSHEET.BY_SUPERVISOR);
      console.log('📋 Supervisor Params:', JSON.stringify(params, null, 2));
      
      const resp = await apiClient.get(API_ENDPOINTS.CREW_WORKSHEET.BY_SUPERVISOR, { params })
      
      console.log('✅ Supervisor API Response received:', {
        status: resp.status,
        data: resp.data
      });
      
      return resp.data?.rows || resp.data || []
    } catch (error) {
      console.error('❌ Supervisor API Error:', error);
      console.error('❌ Supervisor Error details:', {
        message: error.message,
        response: JSON.stringify(error.response?.data, null, 2),
        status: error.response?.status
      });
      
      // Return empty array for supervisor API errors - no mock data
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

/**
 * Create new crew worksheet
 */
export const createCrewWorksheet = createAsyncThunk(
  'crewWorksheet/create',
  async (data, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.CREW_WORKSHEET.CREATE, data)
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Create failed')
      }
      
      return resp.data?.data || resp.data || null
    } catch (error) {
      const errorMessage = error.response?.data?.diagnostic?.message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Create failed'
      return rejectWithValue(errorMessage)
    }
  }
)

/**
 * Update crew worksheet
 */
export const updateCrewWorksheet = createAsyncThunk(
  'crewWorksheet/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const url = API_ENDPOINTS.CREW_WORKSHEET.UPDATE(id)
      const resp = await apiClient.post(url, data)
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Update failed')
      }
      
      return resp.data?.data || resp.data || null
    } catch (error) {
      const errorMessage = error.response?.data?.diagnostic?.message || 
                           error.response?.data?.message || 
                           error.response?.data?.errors?.join(', ') || 
                           error.message || 
                           'Update failed'
      
      return rejectWithValue(errorMessage)
    }
  }
)

/**
 * Approve crew worksheet
 */
export const approveCrewWorksheet = createAsyncThunk(
  'crewWorksheet/approve',
  async ({ id, comment = '' }, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.CREW_WORKSHEET.APPROVE(id), { komentar_spv: comment })
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Approve failed')
      }
      
      if (resp.data?.error) {
        return rejectWithValue(resp.data.message || 'Approve failed')
      }
      
      return resp.data?.data || resp.data || null
    } catch (error) {
      // Handle different error response formats
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Format: { status: 403, error: true, message: "...", data: null }
        if (errorData.error && errorData.message) {
          return rejectWithValue(errorData.message)
        }
        
        // Format: { diagnostic: { error: true, message: "..." } }
        if (errorData.diagnostic?.error && errorData.diagnostic.message) {
          return rejectWithValue(errorData.diagnostic.message)
        }
        
        // Format: { message: "..." }
        if (errorData.message) {
          return rejectWithValue(errorData.message)
        }
      }
      
      return rejectWithValue(error.message || 'Approve failed')
    }
  }
)

/**
 * Reject crew worksheet
 */
export const rejectCrewWorksheet = createAsyncThunk(
  'crewWorksheet/reject',
  async ({ id, comment = '' }, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.CREW_WORKSHEET.REJECT(id), { komentar_spv: comment })
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Reject failed')
      }
      
      if (resp.data?.error) {
        return rejectWithValue(resp.data.message || 'Reject failed')
      }
      
      return resp.data?.data || resp.data || null
    } catch (error) {
      // Handle different error response formats
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Format: { status: 403, error: true, message: "...", data: null }
        if (errorData.error && errorData.message) {
          return rejectWithValue(errorData.message)
        }
        
        // Format: { diagnostic: { error: true, message: "..." } }
        if (errorData.diagnostic?.error && errorData.diagnostic.message) {
          return rejectWithValue(errorData.diagnostic.message)
        }
        
        // Format: { message: "..." }
        if (errorData.message) {
          return rejectWithValue(errorData.message)
        }
      }
      
      return rejectWithValue(error.message || 'Reject failed')
    }
  }
)

/**
 * Delete crew worksheet (soft delete)
 */
export const deleteCrewWorksheet = createAsyncThunk(
  'crewWorksheet/delete',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.CREW_WORKSHEET.DELETE(id))
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Delete failed')
      }
      
      return resp.data?.data || resp.data || null
    } catch (error) {
      const errorMessage = error.response?.data?.diagnostic?.message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Delete failed'
      return rejectWithValue(errorMessage)
    }
  }
)

// Slice
const crewWorksheetSlice = createSlice({
  name: 'crewWorksheet',
  initialState,
  reducers: {
    clearCrewWorksheetData: (state) => {
      state.currentCrewWorksheet = null
      state.stats = null
      state.error = null
    },
    setCrewWorksheetFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetCrewWorksheetFilters: (state) => {
      state.filters = initialState.filters
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Get list
    builder
      .addCase(getCrewWorksheetList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCrewWorksheetList.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        
        // Handle response data from new service pattern
        if (Array.isArray(action.payload)) {
          state.data = action.payload
          state.pagination = {
            page: 1,
            perPage: 25,
            total: action.payload.length,
            lastPage: 1,
          }
        } else if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.data = action.payload.data
          state.pagination = {
            page: action.payload.current_page || 1,
            perPage: action.payload.per_page || 25,
            total: action.payload.total || 0,
            lastPage: action.payload.last_page || 1,
          }
        } else if (action.payload?.rows && Array.isArray(action.payload.rows)) {
          state.data = action.payload.rows
          state.pagination = {
            page: action.payload.current_page || 1,
            perPage: action.payload.per_page || 25,
            total: action.payload.total || 0,
            lastPage: action.payload.last_page || 1,
          }
        } else {
          state.data = []
          state.pagination = initialState.pagination
        }
      })
      .addCase(getCrewWorksheetList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.data = []
      })

    // Get approval list
    builder
      .addCase(getCrewWorksheetApprovalList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCrewWorksheetApprovalList.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.approvalData = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(getCrewWorksheetApprovalList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.approvalData = []
      })

    // Get detail
    builder
      .addCase(getCrewWorksheetDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCrewWorksheetDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentCrewWorksheet = action.payload
        state.error = null
      })
      .addCase(getCrewWorksheetDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.currentCrewWorksheet = null
      })

    // Get stats
    builder
      .addCase(getCrewWorksheetStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCrewWorksheetStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(getCrewWorksheetStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.stats = null
      })

    // Get by supervisor
    builder
      .addCase(getCrewWorksheetBySupervisor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCrewWorksheetBySupervisor.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(getCrewWorksheetBySupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.data = []
      })

    // Create
    builder
      .addCase(createCrewWorksheet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCrewWorksheet.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createCrewWorksheet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update
    builder
      .addCase(updateCrewWorksheet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCrewWorksheet.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updateCrewWorksheet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Approve
    builder
      .addCase(approveCrewWorksheet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveCrewWorksheet.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(approveCrewWorksheet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Reject
    builder
      .addCase(rejectCrewWorksheet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectCrewWorksheet.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(rejectCrewWorksheet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete
    builder
      .addCase(deleteCrewWorksheet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCrewWorksheet.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteCrewWorksheet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const {
  clearCrewWorksheetData,
  setCrewWorksheetFilters,
  resetCrewWorksheetFilters,
  clearError,
} = crewWorksheetSlice.actions

// Export reducer
export default crewWorksheetSlice.reducer
