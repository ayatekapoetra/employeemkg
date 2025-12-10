import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const bulkCreateEquipmentPlan = createAsyncThunk(
  'equipmentDraftPlan/bulkCreate', 
  async (plansData, { rejectWithValue }) => {
    try {
      // Backend expects { plans: [...] } format
      const requestBody = { plans: plansData };
      
      console.log('📤 Sending bulk create request:', {
        totalPlans: plansData.length,
        endpoint: API_ENDPOINTS.EQUIPMENT_PLAN.BULK_CREATE,
        requestBody: requestBody,
        rawPlans: plansData
      });

      const resp = await apiClient.post(API_ENDPOINTS.EQUIPMENT_PLAN.BULK_CREATE, requestBody);
      
      if (resp.data?.diagnostic?.error) {
        console.error('❌ Bulk create failed (diagnostic error):', resp.data.diagnostic.message);
        return rejectWithValue(resp.data.diagnostic.message || 'Gagal membuat equipment plan');
      }
      
      console.log('✅ Bulk create success:', resp.data);
      return resp.data?.rows || resp.data;
    } catch (error) {
      console.error('❌ Error bulk creating equipment plans:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

const initialState = {
  draftAssignments: [],
  bulkCreateLoading: false,
  bulkCreateError: null,
};

const equipmentDraftPlanSlice = createSlice({
  name: 'equipmentDraftPlan',
  initialState,
  reducers: {
    addDraftAssignment: (state, action) => {
      state.draftAssignments.push(action.payload);
      console.log('✅ Draft assignment added to Redux:', {
        total: state.draftAssignments.length,
        newAssignment: action.payload,
        allAssignments: state.draftAssignments
      });
    },
    removeDraftAssignment: (state, action) => {
      const removedItem = state.draftAssignments.find(item => item.id === action.payload);
      state.draftAssignments = state.draftAssignments.filter(item => item.id !== action.payload);
      console.log('🗑️ Draft assignment removed from Redux:', {
        removedId: action.payload,
        removedItem,
        remaining: state.draftAssignments.length
      });
    },
    clearDraftAssignments: (state) => {
      const previousCount = state.draftAssignments.length;
      state.draftAssignments = [];
      console.log('🗑️ All draft assignments cleared from Redux:', {
        previousCount,
        currentCount: 0
      });
    },
    setDraftAssignments: (state, action) => {
      state.draftAssignments = action.payload;
      console.log('📝 Draft assignments set in Redux:', {
        total: state.draftAssignments.length,
        assignments: state.draftAssignments
      });
    },
    clearBulkCreateError: (state) => {
      state.bulkCreateError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(bulkCreateEquipmentPlan.pending, state => {
        state.bulkCreateLoading = true;
        state.bulkCreateError = null;
        console.log('⏳ Bulk create pending...');
      })
      .addCase(bulkCreateEquipmentPlan.fulfilled, (state, action) => {
        state.bulkCreateLoading = false;
        state.bulkCreateError = null;
        // Clear draft assignments after successful bulk create
        state.draftAssignments = [];
        console.log('✅ Bulk create fulfilled, draft cleared');
      })
      .addCase(bulkCreateEquipmentPlan.rejected, (state, action) => {
        state.bulkCreateLoading = false;
        state.bulkCreateError = action.payload;
        console.error('❌ Bulk create rejected:', action.payload);
      });
  },
});

export const { 
  addDraftAssignment,
  removeDraftAssignment,
  clearDraftAssignments,
  setDraftAssignments,
  clearBulkCreateError
} = equipmentDraftPlanSlice.actions;

export default equipmentDraftPlanSlice.reducer;
