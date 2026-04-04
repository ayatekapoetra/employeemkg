import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCabangData, fetchEquipmentData, fetchLokasiKerjaData } from '../../../../src/redux/actions';

/**
 * Hook untuk mengelola data filter (cabang, equipment, lokasi)
 * dengan menggunakan Redux store untuk caching data
 */
export const useFilterData = () => {
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState({
    cabang: false,
    equipment: false,
    lokasi: false,
  });
  
  const [error, setError] = useState({
    cabang: null,
    equipment: null,
    lokasi: null,
  });

  // Fetch data untuk masing-masing tipe
  const fetchAllData = useCallback(async () => {
    try {
      // Fetch Cabang
      setLoading(prev => ({ ...prev, cabang: true }));
      setError(prev => ({ ...prev, cabang: null }));
      await dispatch(fetchCabangData());
      
      // Fetch Equipment
      setLoading(prev => ({ ...prev, equipment: true }));
      setError(prev => ({ ...prev, equipment: null }));
      await dispatch(fetchEquipmentData());
      
      // Fetch Lokasi
      setLoading(prev => ({ ...prev, lokasi: true }));
      setError(prev => ({ ...prev, lokasi: null }));
      await dispatch(fetchLokasiKerjaData());
      
    } catch (err) {
      console.error('[useFilterData] Error fetching data:', err);
      setError({
        cabang: err.message || 'Gagal memuat data cabang',
        equipment: err.message || 'Gagal memuat data equipment',
        lokasi: err.message || 'Gagal memuat data lokasi',
      });
    } finally {
      setLoading({
        cabang: false,
        equipment: false,
        lokasi: false,
      });
    }
  }, [dispatch]);

  // Fetch individual data
  const fetchCabang = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, cabang: true }));
      setError(prev => ({ ...prev, cabang: null }));
      await dispatch(fetchCabangData());
    } catch (err) {
      console.error('[useFilterData] Error fetching cabang:', err);
      setError(prev => ({ ...prev, cabang: err.message || 'Gagal memuat data cabang' }));
    } finally {
      setLoading(prev => ({ ...prev, cabang: false }));
    }
  }, [dispatch]);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, equipment: true }));
      setError(prev => ({ ...prev, equipment: null }));
      await dispatch(fetchEquipmentData());
    } catch (err) {
      console.error('[useFilterData] Error fetching equipment:', err);
      setError(prev => ({ ...prev, equipment: err.message || 'Gagal memuat data equipment' }));
    } finally {
      setLoading(prev => ({ ...prev, equipment: false }));
    }
  }, [dispatch]);

  const fetchLokasi = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, lokasi: true }));
      setError(prev => ({ ...prev, lokasi: null }));
      await dispatch(fetchLokasiKerjaData());
    } catch (err) {
      console.error('[useFilterData] Error fetching lokasi:', err);
      setError(prev => ({ ...prev, lokasi: err.message || 'Gagal memuat data lokasi' }));
    } finally {
      setLoading(prev => ({ ...prev, lokasi: false }));
    }
  }, [dispatch]);

  // Refresh semua data
  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Fetch functions
    fetchAllData,
    fetchCabang,
    fetchEquipment,
    fetchLokasi,
    refreshData,
  };
};

/**
 * Hook untuk format data filter
 */
export const useFilterFormat = () => {
  // Format status untuk API
  const formatStatusFilter = useCallback((statusArray) => {
    if (!Array.isArray(statusArray) || statusArray.length === 0) {
      return '';
    }
    
    return statusArray.join(',');
  }, []);

  // Format date untuk API
  const formatDateFilter = useCallback((dateString) => {
    if (!dateString) {
      return '';
    }
    
    return dateString; // Already in YYYY-MM-DD format
  }, []);

  // Format filter object untuk API
  const formatApiFilters = useCallback((filters) => {
    const apiFilters = {
      status: formatStatusFilter(filters.status),
      startdate: formatDateFilter(filters.startdate),
      enddate: formatDateFilter(filters.enddate),
    };
    
    // Tambahkan ID fields jika ada
    if (filters.cabang_id) {
      apiFilters.cabang_id = filters.cabang_id;
    }
    
    if (filters.equipment_id) {
      apiFilters.equipment_id = filters.equipment_id;
    }
    
    if (filters.lokasi_id) {
      apiFilters.lokasi_id = filters.lokasi_id;
    }
    
    // Hapus nilai kosong
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === '' || apiFilters[key] === null || apiFilters[key] === undefined) {
        delete apiFilters[key];
      }
    });
    
    return apiFilters;
  }, [formatStatusFilter, formatDateFilter]);

  // Cek apakah filter aktif
  const hasActiveFilters = useCallback((filters) => {
    const hasStatus = Array.isArray(filters.status) && filters.status.length > 0;
    const hasCabang = filters.cabang_id !== null && filters.cabang_id !== undefined;
    const hasEquipment = filters.equipment_id !== null && filters.equipment_id !== undefined;
    const hasLokasi = filters.lokasi_id !== null && filters.lokasi_id !== undefined;
    const hasStartDate = filters.startdate !== '' && filters.startdate !== undefined;
    const hasEndDate = filters.enddate !== '' && filters.enddate !== undefined;
    
    return hasStatus || hasCabang || hasEquipment || hasLokasi || hasStartDate || hasEndDate;
  }, []);

  // Reset filter
  const resetFilters = useCallback(() => {
    return {
      status: [],
      cabang_id: null,
      cabang_nama: '',
      equipment_id: null,
      equipment_nama: '',
      lokasi_id: null,
      lokasi_nama: '',
      startdate: '',
      enddate: '',
    };
  }, []);

  return {
    formatStatusFilter,
    formatDateFilter,
    formatApiFilters,
    hasActiveFilters,
    resetFilters,
  };
};

/**
 * Hook untuk validasi filter
 */
export const useFilterValidation = () => {
  // Validasi rentang tanggal
  const validateDateRange = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) {
      return { valid: true, error: null };
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return {
        valid: false,
        error: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir'
      };
    }
    
    // Cek jika rentang tanggal terlalu jauh (misal 1 tahun)
    const oneYearLater = new Date(start);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    if (end > oneYearLater) {
      return {
        valid: false,
        error: 'Rentang tanggal maksimal 1 tahun'
      };
    }
    
    return { valid: true, error: null };
  }, []);

  // Validasi filter sebelum dikirim ke API
  const validateFilters = useCallback((filters) => {
    const errors = {};
    
    // Validasi tanggal
    if (filters.startdate && filters.enddate) {
      const dateValidation = validateDateRange(filters.startdate, filters.enddate);
      if (!dateValidation.valid) {
        errors.date = dateValidation.error;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [validateDateRange]);

  return {
    validateDateRange,
    validateFilters,
  };
};

export default useFilterData;