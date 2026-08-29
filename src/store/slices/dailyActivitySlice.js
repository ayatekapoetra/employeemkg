import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '../../services/api/client'
import { API_ENDPOINTS } from '../../services/api/endpoints'

const message = (error, fallback) => (
  error?.response?.data?.diagnostic?.message
  || error?.response?.data?.message
  || error?.message
  || fallback
)

const rows = (response) => {
  const body = response?.data || {}
  if (body?.diagnostic?.error) throw new Error(body.diagnostic.message || 'Permintaan gagal')
  return body.rows ?? body.data ?? body
}

export const getDailyActivityAccess = createAsyncThunk('dailyActivity/access', async (_, { rejectWithValue }) => {
  try {
    const data = rows(await apiClient.get(API_ENDPOINTS.DAILY_ACTIVITY.ACCESS))
    return data?.permissions || data || {}
  } catch (error) {
    return rejectWithValue(message(error, 'Gagal memuat akses Daily Activity'))
  }
})

export const getDailyActivityList = createAsyncThunk('dailyActivity/list', async (params = {}, { rejectWithValue }) => {
  try {
    return rows(await apiClient.get(API_ENDPOINTS.DAILY_ACTIVITY.LIST, { params }))
  } catch (error) {
    return rejectWithValue(message(error, 'Gagal memuat Daily Activity'))
  }
})

export const getDailyActivityDetail = createAsyncThunk('dailyActivity/detail', async (id, { rejectWithValue }) => {
  try {
    return rows(await apiClient.get(API_ENDPOINTS.DAILY_ACTIVITY.DETAIL(id)))
  } catch (error) {
    return rejectWithValue(message(error, 'Gagal memuat detail Daily Activity'))
  }
})

export const createDailyActivity = createAsyncThunk('dailyActivity/create', async (payload, { rejectWithValue }) => {
  try {
    return rows(await apiClient.post(API_ENDPOINTS.DAILY_ACTIVITY.CREATE, payload))
  } catch (error) {
    return rejectWithValue(message(error, 'Gagal menyimpan Daily Activity'))
  }
})

export const updateDailyActivity = createAsyncThunk('dailyActivity/update', async ({ id, header, batches }, { rejectWithValue }) => {
  try {
    for (const status of ['beroperasi', 'standby', 'breakdown']) {
      await apiClient.post(API_ENDPOINTS.DAILY_ACTIVITY.UPDATE(id, status), {
        ...header,
        items: batches.filter((batch) => batch.status === status),
      })
    }
    return id
  } catch (error) {
    return rejectWithValue(message(error, 'Gagal memperbarui Daily Activity'))
  }
})

export const deleteDailyActivity = createAsyncThunk('dailyActivity/delete', async (id, { rejectWithValue }) => {
  try {
    await apiClient.post(API_ENDPOINTS.DAILY_ACTIVITY.DELETE(id))
    return id
  } catch (error) {
    return rejectWithValue(message(error, 'Gagal menghapus Daily Activity'))
  }
})

const initialState = {
  list: [], total: 0, loading: false, error: null,
  detail: null, detailLoading: false, detailError: null,
  mutationLoading: false, mutationError: null,
  permissions: { can_read: false, can_insert: false, can_update: false, can_remove: false },
  permissionsLoading: false, permissionsError: null,
  filters: { status: '', shift_id: '', ctgunit: '', date_from: '', date_to: '', lokasi_site_id: '', lokasi_pit_id: '', kontraktor: '' },
}

const slice = createSlice({
  name: 'dailyActivity',
  initialState,
  reducers: {
    setDailyActivityFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    clearDailyActivityDetail: (state) => { state.detail = null; state.detailError = null },
  },
  extraReducers: (builder) => builder
    .addCase(getDailyActivityAccess.pending, (state) => { state.permissionsLoading = true; state.permissionsError = null })
    .addCase(getDailyActivityAccess.fulfilled, (state, action) => { state.permissionsLoading = false; state.permissions = { ...state.permissions, ...action.payload } })
    .addCase(getDailyActivityAccess.rejected, (state, action) => { state.permissionsLoading = false; state.permissionsError = action.payload })
    .addCase(getDailyActivityList.pending, (state) => { state.loading = true; state.error = null })
    .addCase(getDailyActivityList.fulfilled, (state, action) => {
      const payload = action.payload || {}
      state.loading = false
      state.list = Array.isArray(payload) ? payload : (payload.data || payload.rows || [])
      state.total = payload.total || state.list.length
    })
    .addCase(getDailyActivityList.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.list = [] })
    .addCase(getDailyActivityDetail.pending, (state) => { state.detailLoading = true; state.detailError = null })
    .addCase(getDailyActivityDetail.fulfilled, (state, action) => { state.detailLoading = false; state.detail = action.payload })
    .addCase(getDailyActivityDetail.rejected, (state, action) => { state.detailLoading = false; state.detailError = action.payload })
    .addMatcher((action) => /dailyActivity\/(create|update|delete)\/pending$/.test(action.type), (state) => { state.mutationLoading = true; state.mutationError = null })
    .addMatcher((action) => /dailyActivity\/(create|update|delete)\/fulfilled$/.test(action.type), (state) => { state.mutationLoading = false })
    .addMatcher((action) => /dailyActivity\/(create|update|delete)\/rejected$/.test(action.type), (state, action) => { state.mutationLoading = false; state.mutationError = action.payload }),
})

export const { setDailyActivityFilters, clearDailyActivityDetail } = slice.actions
export default slice.reducer
