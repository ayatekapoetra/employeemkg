import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

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
        
        console.log('Demo login success!');
        return { 
          diagnostic: { error: false },
          data: { token: demoToken }, 
          user: demoUser, 
          employee: demoEmployee,
          message: 'Login berhasil' 
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_MOBILE, credentials);

      console.log('Login response:', JSON.stringify(response.data, null, 2));
      
      if (response?.data?.diagnostic?.error) {
        const errorMsg = response.data.diagnostic.message || 'Login gagal';
        console.error('Login error from API:', errorMsg);
        return rejectWithValue(errorMsg);
      }

      const authToken = response?.data?.data?.token;
      const authUser = response?.data?.user;
      const employee = response?.data?.employee;

      if (!authToken) {
        const errorMsg = response.data?.message || 'Token tidak ditemukan dalam response';
        console.error('Auth token missing:', errorMsg);
        return rejectWithValue(errorMsg);
      }

      if (!authUser) {
        const errorMsg = response.data?.message || 'Data user tidak ditemukan dalam response';
        console.error('Auth user missing:', errorMsg);
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

      console.log('========================================');
      console.log('Auth - Employee Data Structure:');
      console.log('========================================');
      console.log('employee.nama:', employee?.nama);
      console.log('employee.cabang:', employee?.cabang);
      console.log('employee.cabang?.area:', employee?.cabang?.area);
      console.log('employee.area:', employee?.area);
      console.log('Final area value:', userWithEmployee.karyawan?.area);
      console.log('Full employee data:', JSON.stringify(employee, null, 2));
      console.log('========================================');

      await AsyncStorage.setItem('@token', authToken);
      await AsyncStorage.setItem('@user', JSON.stringify(userWithEmployee));
      await AsyncStorage.setItem('@employee', JSON.stringify(employee));

      console.log('Login success! Token and user saved.');
      return { 
        diagnostic: response.data.diagnostic,
        data: { token: authToken }, 
        user: userWithEmployee, 
        employee: employee,
        message: 'Login berhasil' 
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
        console.log('Login fulfilled payload:', JSON.stringify(action.payload, null, 2));
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
          
          console.log('Setting auth state:', { 
            hasToken: !!token, 
            hasUser: !!user, 
            hasEmployee: !!employee,
            employeeId: employee?.id,
            employeeName: employee?.nama,
            userKaryawan: user?.karyawan,
            userKaryawanArea: user?.karyawan?.area,
            employeeArea: employee?.cabang?.area || employee?.area
          });
          
          state.token = token;
          state.user = user;
          state.karyawan = employee;
          state.error = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        console.log('Login rejected:', action);
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
        
        console.log('========================================');
        console.log('Session Restored - Auth State:');
        console.log('========================================');
        console.log('user.karyawan.area:', action.payload.user?.karyawan?.area);
        console.log('karyawan.cabang.area:', action.payload.employee?.cabang?.area);
        console.log('karyawan.area:', action.payload.employee?.area);
        console.log('========================================');
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
