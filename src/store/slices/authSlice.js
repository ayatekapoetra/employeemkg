import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

// Import master data thunks
import { getKaryawan } from './karyawanSlice';
import { getGudang } from './gudangSlice';
import { getBarang } from './barangSlice';
import { getLokasiPit } from './lokasiPitSlice';
import { getOprDrv } from './oprdrvSlice';
import { getEquipment } from './equipmentSlice';
import { getPemasok } from './pemasokSlice';
import { getPenyewa } from './penyewaSlice';
import { getShift as getShiftData } from './shiftSlice';
import { getKegiatanPit } from './kegiatanPitSlice';
import { getKoordinatChecklog } from './koordinatChecklogSlice';
import { getCabang } from './cabangSlice';

const initialState = {
  user: null,
  karyawan: null,
  token: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      
      if (credentials.username === 'demo' && credentials.password === 'demo123') {
        console.log('Using DEMO login mode (backend not available)');
        const demoToken = 'demo-token-' + Date.now();
        const demoEmployee = {
          id: 1,
          nama: 'Demo User',
          nik: '12345',
          phone: '081234567890',
          section: 'Demo',
          cabang: {
            id: 1,
            nama: 'Cabang Demo',
            area: 'Area Demo',
          },
        };
        const demoUser = {
          id: 1,
          username: 'demo',
          usertype: 'Supervisor',
          karyawan: {
            id: 1,
            nama: 'Demo User',
            pin: '12345',
            cabang: {
              id: 1,
              nama: 'Cabang Demo',
              area: 'Area Demo',
            },
            area: 'Area Demo',
          },
        };
        
        await AsyncStorage.setItem('@token', demoToken);
        await AsyncStorage.setItem('@user', JSON.stringify(demoUser));
        await AsyncStorage.setItem('@employee', JSON.stringify(demoEmployee));
        
        // Enable auto-sync after successful demo login
        await AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'false');
        console.log('✅ Auto-sync ENABLED after demo login');
        
        console.log('Demo login success!');
        return { 
          diagnostic: { error: false },
          data: { token: demoToken }, 
          user: demoUser, 
          employee: demoEmployee,
          message: 'Login berhasil',
          triggerAutoSync: true, // Flag to trigger auto-sync
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_MOBILE, credentials);
      
      if (!response || !response.data) {
        return rejectWithValue('Server tidak merespons dengan benar');
      }
      
      if (response?.data?.diagnostic?.error) {
        const errorMsg = response.data.diagnostic.message || 'Login gagal';
        return rejectWithValue(errorMsg);
      }

      // Coba beberapa kemungkinan struktur response
      const authToken = response?.data?.data?.token || 
                       response?.data?.token || 
                       response?.data?.authToken;
      const authUser = response?.data?.user || 
                      response?.data?.data?.user || 
                      response?.data?.userData;
      const employee = response?.data?.employee || 
                      response?.data?.data?.employee || 
                      response?.data?.employeeData;

      if (!authToken) {
        const errorMsg = 'Token tidak ditemukan dalam response server';
        return rejectWithValue(errorMsg);
      }

      if (!authUser) {
        const errorMsg = 'Data user tidak ditemukan dalam response server';
        return rejectWithValue(errorMsg);
      }

      const userWithEmployee = {
        ...authUser,
        karyawan: employee ? {
          id: employee.id,
          nama: employee.nama,
          pin: employee.pin,
          phone: employee.phone,
          section: employee.section,
          cabang_id: employee.cabang_id,
          cabang: employee.cabang || null,
          area: employee.cabang?.area || employee.area || null,
        } : null,
      };

      

      await AsyncStorage.setItem('@token', authToken);
      await AsyncStorage.setItem('@user', JSON.stringify(userWithEmployee));
      await AsyncStorage.setItem('@employee', JSON.stringify(employee));
      
      // Enable auto-sync after successful login
      // This will trigger the MasterDataProgress to show
      await AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'false');
      return { 
        diagnostic: response.data.diagnostic,
        data: { token: authToken }, 
        user: userWithEmployee, 
        employee: employee,
        message: 'Login berhasil',
        triggerAutoSync: true, // Flag to trigger auto-sync
      };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        return rejectWithValue('Backend tidak tersedia. Gunakan username: "demo" dan password: "demo123" untuk demo mode.');
      }
      
      const message = error.response?.data?.diagnostic?.message || error.response?.data?.message || error.message || 'Login gagal, silakan coba lagi';
      return rejectWithValue(message);
    }
  }
);

// Load master data after successful login
export const loadMasterDataAfterLogin = createAsyncThunk(
  'auth/loadMasterDataAfterLogin',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('🚀 Starting master data load after login...');
      
      // Define master data to load with priority order
      const masterDataLoaders = [
        { name: 'Karyawan', loader: () => dispatch(getKaryawan()) },
        { name: 'Gudang', loader: () => dispatch(getGudang()) },
        { name: 'Shift', loader: () => dispatch(getShiftData()) },
        { name: 'Kegiatan Pit', loader: () => dispatch(getKegiatanPit()) },
        { name: 'Lokasi Pit', loader: () => dispatch(getLokasiPit()) },
        { name: 'Koordinat Checklog', loader: () => dispatch(getKoordinatChecklog()) },
        { name: 'Cabang', loader: () => dispatch(getCabang()) },
        { name: 'Operator/Driver', loader: () => dispatch(getOprDrv()) },
        { name: 'Equipment', loader: () => dispatch(getEquipment()) },
      ];
      
      // Add additional data for non-pengawas users
      const userJson = await AsyncStorage.getItem('@user');
      const user = userJson ? JSON.parse(userJson) : null;
      const isPengawas = user?.usertype?.toLowerCase() === 'pengawas';
      
      if (!isPengawas) {
        masterDataLoaders.push(
          { name: 'Barang', loader: () => dispatch(getBarang()) },
          { name: 'Pemasok', loader: () => dispatch(getPemasok()) },
          { name: 'Penyewa', loader: () => dispatch(getPenyewa()) }
        );
      }
      
      console.log(`📋 Loading ${masterDataLoaders.length} master data types...`);
      
      // Load all master data in parallel
      const results = await Promise.allSettled(
        masterDataLoaders.map(async ({ name, loader }) => {
          try {
            console.log(`📥 Loading ${name}...`);

            await loader(); // Just await the dispatch, no need to unwrap
            console.log(`✅ ${name} loaded successfully`);
            
            // Special verification for Karyawan
            if (name === 'Karyawan') {
              setTimeout(() => {
                const state = require('../index').default.getState();
                const karyawanState = state.karyawan;

              }, 500);
            }
            
            return { name, success: true };
          } catch (error) {
            console.error(`❌ Failed to load ${name}:`, error.message);
            return { name, success: false, error: error.message };
          }
        })
      );
      
      // Log results
      const successful = results.filter(r => r.value.success).length;
      const failed = results.filter(r => !r.value.success).length;
      
      console.log(`🎯 Master data load completed: ${successful} successful, ${failed} failed`);
      
      // Additional check: Verify Redux state actually has data
      setTimeout(() => {
        console.log('🔍 Verifying Redux state data after master data load...');
        const verification = verifyReduxStateData();
        
        if (verification.slicesWithData < verification.totalSlices) {
          console.warn('⚠️ Some slices still lack data - may need additional loading');
        } else {
          console.log('✅ All master data slices have been populated');
        }
      }, 1000);
      
      return {
        successful,
        failed,
        total: masterDataLoaders.length,
        results: results.map(r => r.value)
      };
      
    } catch (error) {
      console.error('❌ Error loading master data after login:', error);
      return rejectWithValue(error.message || 'Failed to load master data');
    }
  }
);

// Helper function to verify Redux state data
const verifyReduxStateData = () => {
  try {
    const state = require('../index').default.getState();
    const slicesToCheck = [
      { name: 'Karyawan', key: 'karyawan' },
      { name: 'Gudang', key: 'gudang' },
      { name: 'Shift', key: 'shift' },
      { name: 'Kegiatan Pit', key: 'kegiatankerja' },
      { name: 'Lokasi Pit', key: 'lokasikerja' },
      { name: 'Koordinat Checklog', key: 'koordinatChecklog' },
      { name: 'Cabang', key: 'cabang' },
      { name: 'Operator/Driver', key: 'oprdrv' },
      { name: 'Equipment', key: 'equipment' },
    ];

    let slicesWithData = 0;
    let totalDataCount = 0;

    slicesToCheck.forEach(({ key }) => {
      const sliceState = state[key];
      const items = sliceState?.data;
      if (Array.isArray(items) && items.length > 0) {
        slicesWithData += 1;
        totalDataCount += items.length;
      }
    });

    return { slicesWithData, totalSlices: slicesToCheck.length, totalDataCount };
  } catch (error) {
    console.error('❌ Error verifying Redux state:', error);
    return { slicesWithData: 0, totalSlices: 0, totalDataCount: 0 };
  }
};

// NEW: Load data from SQLite to Redux after SQLite sync is complete
export const loadSQLiteToReduxAfterSync = createAsyncThunk(
  'auth/loadSQLiteToReduxAfterSync',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('🔄 Loading SQLite data to Redux after sync...');
      
      // First, let's check what data is available in SQLite
      const database = await import('../../database/SQLiteService').then(m => m.default);
      await database.init();
      
      const sqliteChecks = [
        { name: 'Karyawan', checker: () => database.getKaryawan() },
        { name: 'Gudang', checker: () => database.getGudang() },
        { name: 'Shift', checker: () => database.getShift() },
        { name: 'Kegiatan Pit', checker: () => database.getKegiatanPit() },
        { name: 'Lokasi Pit', checker: () => database.getLokasiPit() },
        { name: 'Koordinat Checklog', checker: () => database.getKoordinatChecklog() },
        { name: 'Cabang', checker: () => database.getCabang() },
        { name: 'Operator/Driver', checker: () => database.getOprDrv() },
        { name: 'Equipment', checker: () => database.getEquipment() },
      ];
      
      // Add additional data for non-pengawas users
      const userJson = await AsyncStorage.getItem('@user');
      const user = userJson ? JSON.parse(userJson) : null;
      const isPengawas = user?.usertype?.toLowerCase() === 'pengawas';
      
      if (!isPengawas) {
        sqliteChecks.push(
          { name: 'Barang', checker: () => database.getBarang() },
          { name: 'Pemasok', checker: () => database.getPemasok() },
          { name: 'Penyewa', checker: () => database.getPenyewa() }
        );
      }
      
      console.log(`📋 Checking ${sqliteChecks.length} data types in SQLite...`);
      
      // Check what data is available in SQLite
      const availableData = {};
      for (const { name, checker } of sqliteChecks) {
        try {
          const data = await checker();
          if (data && data.length > 0) {
            availableData[name] = data;
            console.log(`✅ Found ${data.length} ${name} in SQLite`);
          } else {
            console.log(`⚠️ No ${name} data in SQLite`);
          }
        } catch (error) {
          console.log(`❌ Error checking ${name} in SQLite:`, error.message);
        }
      }
      
      // Now load data from SQLite to Redux using our direct approach
      const sqliteLoaders = [
        { name: 'Karyawan', loader: () => dispatch(getKaryawan()) },
        { name: 'Gudang', loader: () => dispatch(getGudang()) },
        { name: 'Shift', loader: () => dispatch(getShiftData()) },
        { name: 'Kegiatan Pit', loader: () => dispatch(getKegiatanPit()) },
        { name: 'Lokasi Pit', loader: () => dispatch(getLokasiPit()) },
        { name: 'Koordinat Checklog', loader: () => dispatch(getKoordinatChecklog()) },
        { name: 'Cabang', loader: () => dispatch(getCabang()) },
        { name: 'Operator/Driver', loader: () => dispatch(getOprDrv()) },
        { name: 'Equipment', loader: () => dispatch(getEquipment()) },
      ];
      
      if (!isPengawas) {
        sqliteLoaders.push(
          { name: 'Barang', loader: () => dispatch(getBarang()) },
          { name: 'Pemasok', loader: () => dispatch(getPemasok()) },
          { name: 'Penyewa', loader: () => dispatch(getPenyewa()) }
        );
      }
      
      console.log(`📋 Loading ${sqliteLoaders.length} data types from SQLite to Redux...`);
      
      // Load all data from SQLite to Redux
      const results = await Promise.allSettled(
        sqliteLoaders.map(async ({ name, loader }) => {
          try {
            console.log(`📥 Loading ${name} from SQLite...`);
            await loader(); // Just await the dispatch, no need to unwrap
            
            // Check if Redux state actually has data now
            setTimeout(() => {
              const verification = verifyReduxStateData();
              console.log(`🔍 ${name} Redux check completed`);
            }, 500);
            
            console.log(`✅ ${name} loaded from SQLite to Redux`);
            return { name, success: true };
          } catch (error) {
            console.error(`❌ Failed to load ${name} from SQLite:`, error.message);
            return { name, success: false, error: error.message };
          }
        })
      );
      
      const successful = results.filter(r => r.value.success).length;
      const failed = results.filter(r => !r.value.success).length;
      
      console.log(`🎯 SQLite to Redux load completed: ${successful} successful, ${failed} failed`);
      
      // Final verification
      setTimeout(() => {

      }, 1000);
      
      return {
        successful,
        failed,
        total: sqliteLoaders.length,
        results: results.map(r => r.value)
      };
      
    } catch (error) {
      console.error('❌ Error loading SQLite to Redux:', error);
      return rejectWithValue(error.message || 'Failed to load SQLite to Redux');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const userJson = await AsyncStorage.getItem('@user');
      const employeeJson = await AsyncStorage.getItem('@employee');
      const user = userJson ? JSON.parse(userJson) : null;
      const employee = employeeJson ? JSON.parse(employeeJson) : null;

      if (token && user) {
        console.log('Session restored:', { hasToken: !!token, user: user?.username });
        return { token, user, employee };
      }

      return rejectWithValue('No session found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.karyawan = null;
      state.error = null;
      AsyncStorage.removeItem('@token');
      AsyncStorage.removeItem('@user');
      AsyncStorage.removeItem('@employee');
      // Reset auto-sync flags on logout
      AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'true');
      console.log('🔒 Logout - auto-sync DISABLED');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.token = null;
        state.karyawan = null;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action?.payload?.diagnostic?.error) {
          state.token = null;
          state.user = null;
          state.karyawan = null;
          state.error = action.payload.diagnostic.message;
        } else {
          const token = action.payload.data?.token || action.payload.token;
          const user = action.payload.user;
          const employee = action.payload.employee;
          const triggerAutoSync = action.payload.triggerAutoSync;
          
          state.token = token;
          state.user = user;
          state.karyawan = employee;
          state.error = null;
          
           // If login triggers auto-sync, we need to reload the auto-sync flag in _layout.js
           if (triggerAutoSync) {
             // Auto-sync will be triggered by _layout.js useEffect
           }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.karyawan = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.karyawan = action.payload.employee;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.karyawan = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
