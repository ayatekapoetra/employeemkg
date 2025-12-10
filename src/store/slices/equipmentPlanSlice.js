import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const getEquipmentPlanList = createAsyncThunk(
  'equipmentPlan/getList',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('📡 [equipmentPlanSlice] Fetching equipment plan list with params:', params);
      console.log('📡 [equipmentPlanSlice] API Endpoint:', API_ENDPOINTS.EQUIPMENT_PLAN.LIST);
      
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT_PLAN.LIST, { params });
      
      console.log('✅ [equipmentPlanSlice] API Response:', {
        status: response.status,
        diagnostic: response.data?.diagnostic,
        rowsType: typeof response.data?.rows,
        rowsIsArray: Array.isArray(response.data?.rows),
        rowsData: response.data?.rows?.data,
        rowsDataLength: Array.isArray(response.data?.rows?.data) ? response.data.rows.data.length : 'not array',
      });
      
      if (response.data?.diagnostic?.error) {
        console.error('❌ [equipmentPlanSlice] API returned error:', response.data.diagnostic.message);
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengambil data equipment plan');
      }
      
      const result = response.data?.rows || { data: [] };
      console.log('📦 [equipmentPlanSlice] Returning data:', result);
      return result;
    } catch (error) {
      console.error('❌ [equipmentPlanSlice] Error fetching equipment plan:', {
        message: error.message,
        response: error.response?.data,
      });
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const getMyEquipmentPlans = createAsyncThunk(
  'equipmentPlan/getMyPlans',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT_PLAN.MY_PLANS, { params });
      
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengambil data equipment plan');
      }
      
      return response.data?.rows || { data: [] };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const acceptEquipmentPlan = createAsyncThunk(
  'equipmentPlan/accept',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EQUIPMENT_PLAN.ACCEPT(id));
      
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal menerima equipment plan');
      }
      
      return response.data?.rows;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const rejectEquipmentPlan = createAsyncThunk(
  'equipmentPlan/reject',
  async ({ id, reject_reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EQUIPMENT_PLAN.REJECT(id), { reject_reason });
      
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal menolak equipment plan');
      }
      
      return response.data?.rows;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const getEquipmentPlanDetail = createAsyncThunk(
  'equipmentPlan/getDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT_PLAN.DETAIL(id));
      
      if (response.data?.diagnostic?.error) {
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengambil detail equipment plan');
      }
      
      return response.data?.rows;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const updateEquipmentPlan = createAsyncThunk(
  'equipmentPlan/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('📤 [equipmentPlanSlice] Updating equipment plan:', { id, data });
      
      const response = await apiClient.post(API_ENDPOINTS.EQUIPMENT_PLAN.UPDATE(id), data);
      
      if (response.data?.diagnostic?.error) {
        console.error('❌ [equipmentPlanSlice] Update failed:', response.data.diagnostic.message);
        return rejectWithValue(response.data.diagnostic.message || 'Gagal mengupdate equipment plan');
      }
      
      console.log('✅ [equipmentPlanSlice] Update success:', response.data?.rows);
      return response.data?.rows;
    } catch (error) {
      console.error('❌ [equipmentPlanSlice] Error updating:', error);
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const deleteEquipmentPlan = createAsyncThunk(
  'equipmentPlan/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🗑️ [equipmentPlanSlice] Deleting equipment plan:', id);
      
      const response = await apiClient.delete(API_ENDPOINTS.EQUIPMENT_PLAN.DELETE(id));
      
      if (response.data?.diagnostic?.error) {
        console.error('❌ [equipmentPlanSlice] Delete failed:', response.data.diagnostic.message);
        return rejectWithValue(response.data.diagnostic.message || 'Gagal menghapus equipment plan');
      }
      
      console.log('✅ [equipmentPlanSlice] Delete success');
      return id;
    } catch (error) {
      console.error('❌ [equipmentPlanSlice] Error deleting:', error);
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

const initialState = {
  data: [],
  total: 0,
  page: 1,
  lastPage: 1,
  loading: false,
  error: null,
  acceptLoading: false,
  acceptError: null,
  rejectLoading: false,
  rejectError: null,
  detailData: null,
  detailLoading: false,
  detailError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

const equipmentPlanSlice = createSlice({
  name: 'equipmentPlan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.acceptError = null;
      state.rejectError = null;
      state.detailError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearData: (state) => {
      state.data = [];
      state.total = 0;
      state.page = 1;
      state.lastPage = 1;
    },
    clearDetailData: (state) => {
      state.detailData = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEquipmentPlanList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipmentPlanList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.lastPage = action.payload.lastPage || 1;
        console.log('✅ [equipmentPlanSlice] State updated after fulfilled:', {
          dataLength: state.data.length,
          total: state.total,
          page: state.page,
          firstItem: state.data[0],
        });
      })
      .addCase(getEquipmentPlanList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getMyEquipmentPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyEquipmentPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.lastPage = action.payload.lastPage || 1;
      })
      .addCase(getMyEquipmentPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(acceptEquipmentPlan.pending, (state) => {
        state.acceptLoading = true;
        state.acceptError = null;
      })
      .addCase(acceptEquipmentPlan.fulfilled, (state, action) => {
        state.acceptLoading = false;
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(acceptEquipmentPlan.rejected, (state, action) => {
        state.acceptLoading = false;
        state.acceptError = action.payload;
      })
      
      .addCase(rejectEquipmentPlan.pending, (state) => {
        state.rejectLoading = true;
        state.rejectError = null;
      })
      .addCase(rejectEquipmentPlan.fulfilled, (state, action) => {
        state.rejectLoading = false;
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(rejectEquipmentPlan.rejected, (state, action) => {
        state.rejectLoading = false;
        state.rejectError = action.payload;
      })
      
      .addCase(getEquipmentPlanDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(getEquipmentPlanDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailData = action.payload;
      })
      .addCase(getEquipmentPlanDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })
      
      .addCase(updateEquipmentPlan.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateEquipmentPlan.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.detailData = action.payload;
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateEquipmentPlan.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      .addCase(deleteEquipmentPlan.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEquipmentPlan.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.data = state.data.filter(item => item.id !== action.payload);
        if (state.detailData?.id === action.payload) {
          state.detailData = null;
        }
      })
      .addCase(deleteEquipmentPlan.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearError, clearData, clearDetailData } = equipmentPlanSlice.actions;
export default equipmentPlanSlice.reducer;
