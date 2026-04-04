import { useSelector, useDispatch } from 'react-redux';
import {
  getCrewWorksheetList,
  getCrewWorksheetApprovalList,
  getCrewWorksheetStats,
  getCrewWorksheetBySupervisor,
  getCrewWorksheetDetail,
  createCrewWorksheet,
  updateCrewWorksheet,
  approveCrewWorksheet,
  rejectCrewWorksheet,
  deleteCrewWorksheet,
  setCrewWorksheetFilters,
  clearError,
} from '../../store/slices/crewWorksheetSlice';

export const useCrewWorksheet = () => {
  const dispatch = useDispatch();
  const crewWorksheet = useSelector(state => state.crewWorksheet) || {};
  const auth = useSelector(state => state.auth) || {};
  
  const { 
    data = [], 
    approvalData = [],
    loading = false, 
    error = null, 
    stats = null, 
    currentCrewWorksheet = null,
    pagination = {},
    filters = {}
  } = crewWorksheet;
  
  const { user } = auth;
  const employeeId = auth.karyawan?.id;

  // Get approval count from stats
  const approvalCount = stats?.pending_count || 0;
  
  // Ensure data is an array before filtering
  const dataArray = Array.isArray(data) ? data : [];
  
  // Debug logging to understand data structure
  if (dataArray.length > 0) {
    console.log('📊 Raw API data received:', dataArray.length, 'items');
  } else {
    console.log('⚠️ No data received from API');
  }
  
  // Get my worksheets (assuming API already filtered by current user)
  const approvalList = Array.isArray(approvalData) ? approvalData : [];
  const myWorksheets = dataArray;
  
  console.log('✅ FINAL myWorksheets data:', myWorksheets.length, 'items');
  
  // Get worksheets needing approval
  const approvalWorksheets = dataArray.filter(worksheet => {
    const needsApproval = worksheet.status === 'P' || 
                         worksheet.status === 'pending' || 
                         worksheet.status === 'submitted' ||
                         worksheet.status === 'waiting_approval';
    return needsApproval;
  });

  const fetchMyWorksheets = (extraFilters = {}) => {
    const baseFilters = {
      karyawan_id: employeeId || user?.id,
      aktif: 'Y',
    };
    const nextFilters = { ...baseFilters, ...extraFilters };

    dispatch(setCrewWorksheetFilters(nextFilters));
    return dispatch(getCrewWorksheetList(nextFilters));
  };

  const fetchApprovalWorksheets = () => {
    return dispatch(getCrewWorksheetBySupervisor({ 
      supervisor_id: user?.id,
      status: 'pending'
    }));
  };

  const fetchApprovalList = (extraFilters = {}) => {
    const baseFilters = {
      spv_id: employeeId || user?.id,
      aktif: 'Y',
    };
    const nextFilters = { ...baseFilters, ...extraFilters };
    dispatch(setCrewWorksheetFilters(nextFilters));
    return dispatch(getCrewWorksheetApprovalList(nextFilters));
  };

  const fetchStats = (extraFilters = {}) => {
    // TODO: Fix backend stats API - currently returning 500 error
    // Disable stats temporarily to focus on main data
    console.log('🚨 Stats API disabled due to backend error');
    return Promise.resolve(null);
  };

  // Mock data for development when API is not available
  const getMockData = () => {
    return {
      myWorksheets: [
        {
          id: 1,
          tanggal: '2024-03-24',
          status: 'P',
          jam_lembur: 2.5,
          keterangan: 'Pekerjaan normal',
          cabang_id: 1,
          area: 'Site A'
        },
        {
          id: 2,
          tanggal: '2024-03-23',
          status: 'A',
          jam_lembur: 1.5,
          keterangan: 'Pekerjaan overtime',
          cabang_id: 1,
          area: 'Site A'
        }
      ],
      approvalWorksheets: [
        {
          id: 3,
          tanggal: '2024-03-24',
          status: 'P',
          jam_lembur: 3.0,
          keterangan: 'Menunggu approval',
          cabang_id: 2,
          area: 'Site B'
        }
      ],
      stats: {
        total: 3,
        pending: 2,
        approved: 1,
        rejected: 0,
        total_overtime: 7.0
      }
    };
  };

  const createWorksheet = async (worksheetData) => {
    try {
      const result = await dispatch(createCrewWorksheet(worksheetData));
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.payload;
    } catch (error) {
      throw error;
    }
  };

  const updateWorksheet = async (id, worksheetData) => {
    try {
      const result = await dispatch(updateCrewWorksheet({ id, data: worksheetData }));
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.payload;
    } catch (error) {
      throw error;
    }
  };

  const approveWorksheet = async (id, comment = '') => {
    try {
      const result = await dispatch(approveCrewWorksheet(id, comment));
      
      if (result.error) {
        // The actual error message is in result.payload (set by rejectWithValue)
        if (result.payload) {
          throw new Error(result.payload);
        }
        throw new Error('Failed to approve worksheet');
      }
      
      return result.payload;
    } catch (error) {
      throw error;
    }
  };

  const rejectWorksheet = async (id, comment = '') => {
    try {
      const result = await dispatch(rejectCrewWorksheet(id, comment));
      
      if (result.error) {
        // The actual error message is in result.payload (set by rejectWithValue)
        if (result.payload) {
          throw new Error(result.payload);
        }
        throw new Error('Failed to reject worksheet');
      }
      
      return result.payload;
    } catch (error) {
      throw error;
    }
  };

  const deleteWorksheet = async (id) => {
    try {
      const result = await dispatch(deleteCrewWorksheet(id));
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.payload;
    } catch (error) {
      throw error;
    }
  };

  const getWorksheetDetail = async (id) => {
    try {
      const result = await dispatch(getCrewWorksheetDetail(id));
      
      if (result?.error) {
        return null;
      }
      
      return result?.payload ?? null;
    } catch (error) {
      return null;
    }
  };

  const clearErrors = () => {
    dispatch(clearError());
  };

  const setFilters = (newFilters) => {
    dispatch(setCrewWorksheetFilters(newFilters));
  };

  const resetFilters = () => {
    dispatch(setCrewWorksheetFilters({ 
      ...filters, 
      startdate: '', 
      enddate: '', 
      shift: '', 
      status: '',
      keterangan: '',
      cabang_id: '', 
      area: '' 
    }));
  };

  return {
    myWorksheets,
    approvalList,
    approvalWorksheets,
    loading,
    error,
    approvalCount,
    stats,
    pagination,
    filters,
    currentCrewWorksheet,
    fetchMyWorksheets,
    fetchApprovalList,
    fetchApprovalWorksheets,
    fetchStats,
    getWorksheetDetail,
    createWorksheet,
    updateWorksheet,
    approveWorksheet,
    rejectWorksheet,
    deleteWorksheet,
    clearErrors,
    setFilters,
    resetFilters,
  };
};
