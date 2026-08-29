import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '../../services/api/client'
import { API_ENDPOINTS } from '../../services/api/endpoints'

const getErrorMessage = (error, fallback) => {
  const diagnostic = error?.response?.data?.diagnostic
  const diagnosticMessage = typeof diagnostic?.message === 'string'
    ? diagnostic.message
    : (typeof diagnostic?.error === 'string' ? diagnostic.error : null)

  return diagnosticMessage
    || error?.response?.data?.message
    || error?.message
    || fallback
}

const initialState = {
  list: [],
  total: 0,
  page: 1,
  lastPage: 1,
  loading: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  mutationLoading: false,
  mutationError: null,
  actionLoadingByItem: {},
  permissions: {
    can_read: false,
    can_insert: false,
    can_update: false,
    can_remove: false,
    can_validate: false,
    can_approve: false,
    can_accept: false,
  },
  permissionsLoading: false,
  permissionsError: null,
  filters: {
    status: '',
    movement_date_start: '',
    movement_date_end: '',
    origin_branch_id: '',
    destination_branch_id: '',
    origin_tenant_id: '',
    destination_tenant_id: '',
    equipment_id: '',
    search: '',
  },
}

export const getMobilizationAccess = createAsyncThunk(
  'equipmentMobilization/getAccess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT_MOBILIZATION.ACCESS)
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal memuat akses mobilisasi')
      }
      return response.data?.rows?.permissions || response.data?.rows || {}
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal memuat akses mobilisasi'))
    }
  }
)

export const getMobilizationList = createAsyncThunk(
  'equipmentMobilization/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT_MOBILIZATION.LIST, { params })
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal memuat daftar mobilisasi')
      }
      return response.data?.rows || { data: [], total: 0, page: 1, lastPage: 1 }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal memuat daftar mobilisasi'))
    }
  }
)

export const getMobilizationDetail = createAsyncThunk(
  'equipmentMobilization/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT_MOBILIZATION.DETAIL(id))
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal memuat detail mobilisasi')
      }
      return response.data?.rows || null
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal memuat detail mobilisasi'))
    }
  }
)

export const createMobilization = createAsyncThunk(
  'equipmentMobilization/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EQUIPMENT_MOBILIZATION.CREATE, payload)
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal membuat mobilisasi')
      }
      return response.data?.rows || null
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal membuat mobilisasi'))
    }
  }
)

export const dispatchMobilizationItem = createAsyncThunk(
  'equipmentMobilization/dispatchItem',
  async ({ id, itemId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.EQUIPMENT_MOBILIZATION.DISPATCH(id, itemId),
        data
      )
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mencatat dispatch')
      }
      return { id, itemId, result: response.data?.rows || null }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal mencatat dispatch'))
    }
  }
)

export const arriveMobilizationItem = createAsyncThunk(
  'equipmentMobilization/arriveItem',
  async ({ id, itemId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.EQUIPMENT_MOBILIZATION.ARRIVE(id, itemId),
        data
      )
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mencatat arrival')
      }
      return { id, itemId, result: response.data?.rows || null }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal mencatat arrival'))
    }
  }
)

export const cancelMobilizationItem = createAsyncThunk(
  'equipmentMobilization/cancelItem',
  async ({ id, itemId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.EQUIPMENT_MOBILIZATION.CANCEL_ITEM(id, itemId),
        { reason }
      )
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal membatalkan item')
      }
      return { id, itemId, result: response.data?.rows || null }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal membatalkan item'))
    }
  }
)

export const cancelMobilizationDocument = createAsyncThunk(
  'equipmentMobilization/cancelDocument',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.EQUIPMENT_MOBILIZATION.CANCEL(id),
        { reason }
      )
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal membatalkan dokumen')
      }
      return response.data?.rows || null
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Gagal membatalkan dokumen'))
    }
  }
)

const equipmentMobilizationSlice = createSlice({
  name: 'equipmentMobilization',
  initialState,
  reducers: {
    setMobilizationFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearMobilizationDetail: (state) => {
      state.detail = null
      state.detailError = null
    },
    clearMobilizationError: (state) => {
      state.error = null
      state.detailError = null
      state.mutationError = null
      state.permissionsError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMobilizationAccess.pending, (state) => {
        state.permissionsLoading = true
        state.permissionsError = null
      })
      .addCase(getMobilizationAccess.fulfilled, (state, action) => {
        state.permissionsLoading = false
        state.permissions = {
          ...state.permissions,
          ...action.payload,
        }
      })
      .addCase(getMobilizationAccess.rejected, (state, action) => {
        state.permissionsLoading = false
        state.permissionsError = action.payload
      })

      .addCase(getMobilizationList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMobilizationList.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload?.data || []
        state.total = action.payload?.total || 0
        state.page = action.payload?.page || 1
        state.lastPage = action.payload?.lastPage || 1
      })
      .addCase(getMobilizationList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(getMobilizationDetail.pending, (state) => {
        state.detailLoading = true
        state.detailError = null
      })
      .addCase(getMobilizationDetail.fulfilled, (state, action) => {
        state.detailLoading = false
        state.detail = action.payload
      })
      .addCase(getMobilizationDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.detailError = action.payload
      })

      .addCase(createMobilization.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
      })
      .addCase(createMobilization.fulfilled, (state, action) => {
        state.mutationLoading = false
        if (action.payload) {
          state.list = [action.payload, ...state.list]
          state.detail = action.payload
        }
      })
      .addCase(createMobilization.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError = action.payload
      })

      .addCase(dispatchMobilizationItem.pending, (state, action) => {
        const itemId = action.meta.arg.itemId
        state.actionLoadingByItem[itemId] = true
        state.mutationError = null
      })
      .addCase(dispatchMobilizationItem.fulfilled, (state, action) => {
        const itemId = action.payload.itemId
        state.actionLoadingByItem[itemId] = false
      })
      .addCase(dispatchMobilizationItem.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId
        state.actionLoadingByItem[itemId] = false
        state.mutationError = action.payload
      })

      .addCase(arriveMobilizationItem.pending, (state, action) => {
        const itemId = action.meta.arg.itemId
        state.actionLoadingByItem[itemId] = true
        state.mutationError = null
      })
      .addCase(arriveMobilizationItem.fulfilled, (state, action) => {
        const itemId = action.payload.itemId
        state.actionLoadingByItem[itemId] = false
      })
      .addCase(arriveMobilizationItem.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId
        state.actionLoadingByItem[itemId] = false
        state.mutationError = action.payload
      })

      .addCase(cancelMobilizationItem.pending, (state, action) => {
        const itemId = action.meta.arg.itemId
        state.actionLoadingByItem[itemId] = true
        state.mutationError = null
      })
      .addCase(cancelMobilizationItem.fulfilled, (state, action) => {
        const itemId = action.payload.itemId
        state.actionLoadingByItem[itemId] = false
      })
      .addCase(cancelMobilizationItem.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId
        state.actionLoadingByItem[itemId] = false
        state.mutationError = action.payload
      })

      .addCase(cancelMobilizationDocument.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
      })
      .addCase(cancelMobilizationDocument.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.detail = action.payload
      })
      .addCase(cancelMobilizationDocument.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError = action.payload
      })
  },
})

export const {
  setMobilizationFilters,
  clearMobilizationDetail,
  clearMobilizationError,
} = equipmentMobilizationSlice.actions

export default equipmentMobilizationSlice.reducer
