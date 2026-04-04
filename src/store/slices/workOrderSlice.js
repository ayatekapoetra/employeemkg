import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '../../services/api/client'
import { API_ENDPOINTS } from '../../services/api/endpoints'

const initialState = {
  loading: false,
  error: null,
  data: [],
  detail: null,
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  },
}

export const getWorkOrderList = createAsyncThunk(
  'workorder/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.WORK_ORDER.LIST, { params })
      return resp.data?.rows || resp.data || { data: [], total: 0 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

export const getWorkOrderDetail = createAsyncThunk(
  'workorder/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.WORK_ORDER.SHOW(id))
      return resp.data?.rows || resp.data || null
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

export const updateWorkOrderStatus = createAsyncThunk(
  'workorder/updateStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.WORK_ORDER.UPDATE(id), data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

export const addWorkOrderAction = createAsyncThunk(
  'workorder/addAction',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.WORK_ORDER.ADD_ACTION(id), data)
      return resp.data?.rows || resp.data || null
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

export const deleteWorkOrderAction = createAsyncThunk(
  'workorder/deleteAction',
  async (actionId, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.WORK_ORDER.DELETE_ACTION(actionId))
      return { actionId, resp: resp.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.diagnostic?.message || error.message)
    }
  }
)

const workOrderSlice = createSlice({
  name: 'workorder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWorkOrderList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWorkOrderList.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload
        const rows = Array.isArray(payload.data) ? payload.data : payload.rows || []
        state.data = rows
        state.pagination = {
          page: payload.page || payload.current_page || payload.pagination?.page || 1,
          perPage: payload.per_page || payload.perPage || payload.pagination?.perPage || 20,
          total: payload.total || payload.pagination?.total || rows.length,
          lastPage: payload.last_page || payload.lastPage || payload.pagination?.lastPage || 1,
        }
      })
      .addCase(getWorkOrderList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal memuat work order'
      })
      .addCase(getWorkOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWorkOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.detail = action.payload
      })
      .addCase(getWorkOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal memuat detail work order'
      })
      .addCase(updateWorkOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        const updated = action.payload
        if (!updated) return
        state.data = state.data.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
        // Also update detail if it exists and matches the id
        if (state.detail && state.detail.id === updated.id) {
          state.detail = { ...state.detail, ...updated }
        }
      })
      .addCase(updateWorkOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Gagal mengupdate work order'
      })
      .addCase(addWorkOrderAction.pending, (state) => {
        state.error = null
      })
      .addCase(addWorkOrderAction.fulfilled, (state, action) => {
        const created = action.payload
        if (!created) return
        state.data = state.data.map((item) => {
          if (item.id === created.wo_id) {
            const actions = Array.isArray(item.actions) ? item.actions : []
            return { ...item, actions: [created, ...actions] }
          }
          return item
        })
        // Also update detail if it exists and matches the wo_id
        if (state.detail && state.detail.id === created.wo_id) {
          const actions = Array.isArray(state.detail.actions) ? state.detail.actions : []
          state.detail = { ...state.detail, actions: [created, ...actions] }
        }
      })
      .addCase(addWorkOrderAction.rejected, (state, action) => {
        state.error = action.payload || 'Gagal menambah aksi'
      })
      .addCase(deleteWorkOrderAction.fulfilled, (state, action) => {
        const actionId = action.payload?.actionId
        if (!actionId) return
        state.data = state.data.map((item) => {
          const actions = Array.isArray(item.actions) ? item.actions.filter((a) => a.id !== actionId) : item.actions
          return { ...item, actions }
        })
        // Also update detail if it exists
        if (state.detail && Array.isArray(state.detail.actions)) {
          state.detail = { 
            ...state.detail, 
            actions: state.detail.actions.filter((a) => a.id !== actionId) 
          }
        }
      })
      .addCase(deleteWorkOrderAction.rejected, (state, action) => {
        state.error = action.payload || 'Gagal menghapus aksi'
      })
  },
})

export default workOrderSlice.reducer
