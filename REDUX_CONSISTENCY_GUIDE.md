# Redux Consistency Guide - Employee MKG Mobile

## 📋 Overview
Panduan ini menjelaskan struktur dan pola konsisten untuk Redux slices di aplikasi Employee MKG Mobile.

---

## 🎯 Pola Konsisten Redux Slice

### 1. Import Order (Wajib Urutan Ini)
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
```

### 2. Naming Convention

#### State Properties
- **Master Data Slices** (GET only):
  ```javascript
  {
    loading: false,    // Loading state untuk GET request
    error: null,       // Error message untuk GET request
    data: null,        // Array atau object data utama
  }
  ```

- **Transactional Slices** (GET + POST/PUT/DELETE):
  ```javascript
  {
    loading: false,        // Loading untuk GET request
    error: null,           // Error untuk GET request
    data: [],              // Array data utama
    
    createLoading: false,  // Loading untuk POST/CREATE
    createError: null,     // Error untuk POST/CREATE
    
    updateLoading: false,  // Loading untuk PUT/UPDATE
    updateError: null,     // Error untuk PUT/UPDATE
    
    deleteLoading: false,  // Loading untuk DELETE
    deleteError: null,     // Error untuk DELETE
  }
  ```

#### Thunk Action Names
- **Pattern**: `'sliceName/actionType'`
- **Examples**:
  - `'equipment/getList'`
  - `'equipmentPlan/create'`
  - `'penyewa/clearCache'`

### 3. Caching Strategy (Master Data)

**Master data** = Data yang jarang berubah (equipment, lokasi, penyewa, operator, dll)

```javascript
const CACHE_KEY = '@slice-name';

export const getData = createAsyncThunk(
  'sliceName/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      // 1. Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached) };
        }
      }

      // 2. Fetch from API
      const resp = await apiClient.get(API_ENDPOINTS.SLICE_NAME.LIST);
      
      // 3. Normalize response (handle different API response formats)
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      // 4. Cache the data
      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // 5. Fallback to cache on error
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
```

**Cache Clear Function** (Optional):
```javascript
export const clearCache = createAsyncThunk(
  'sliceName/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
);
```

### 4. Response Normalization

Backend API bisa mengembalikan data dengan format berbeda:
- `{ data: [...] }` - Format standard
- `{ rows: [...] }` - Format alternatif
- `[...]` - Direct array

**Normalisasi dengan fallback chain:**
```javascript
const data = resp.data?.rows || resp.data?.data || resp.data || [];
```

### 5. Error Handling

#### For GET Requests
```javascript
.addCase(getData.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.data = []; // Reset to empty array
})
```

#### For POST/PUT/DELETE Requests
```javascript
.addCase(createData.rejected, (state, action) => {
  state.createLoading = false;
  state.createError = action.payload;
})
```

**Error message priority:**
```javascript
error.response?.data?.diagnostic?.message || 
error.response?.data?.message || 
error.message
```

### 6. Reducer Actions (Clear Functions)

```javascript
reducers: {
  clearData: state => {
    state.data = [];
    state.error = null;
  },
  clearCreateError: state => {
    state.createError = null;
  },
  clearUpdateError: state => {
    state.updateError = null;
  },
  clearDeleteError: state => {
    state.deleteError = null;
  },
}
```

---

## 📝 Complete Example: Master Data Slice

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@equipment';

export const getEquipment = createAsyncThunk(
  'equipment/getList', 
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearEquipmentCache = createAsyncThunk(
  'equipment/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    clearEquipment: state => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getEquipment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearEquipmentCache.fulfilled, state => {
        state.data = null;
      });
  },
});

export const { clearEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
```

---

## 📝 Complete Example: Transactional Slice

```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

export const getEquipmentPlans = createAsyncThunk(
  'equipmentPlan/getList', 
  async (params = null, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get(API_ENDPOINTS.EQUIPMENT_PLAN.LIST, { params });
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      return { data };
    } catch (error) {
      console.error('Error fetching equipment plans:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createEquipmentPlan = createAsyncThunk(
  'equipmentPlan/create', 
  async (planData, { rejectWithValue }) => {
    try {
      const resp = await apiClient.post(API_ENDPOINTS.EQUIPMENT_PLAN.CREATE, planData);
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Gagal membuat equipment plan');
      }
      
      return resp.data?.rows || resp.data;
    } catch (error) {
      console.error('Error creating equipment plan:', error);
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
      const resp = await apiClient.post(API_ENDPOINTS.EQUIPMENT_PLAN.UPDATE(id), data);
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Gagal update equipment plan');
      }
      
      return resp.data?.rows || resp.data;
    } catch (error) {
      console.error('Error updating equipment plan:', error);
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
      const resp = await apiClient.delete(API_ENDPOINTS.EQUIPMENT_PLAN.DELETE(id));
      
      if (resp.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message || 'Gagal menghapus equipment plan');
      }
      
      return { id };
    } catch (error) {
      console.error('Error deleting equipment plan:', error);
      return rejectWithValue(
        error.response?.data?.diagnostic?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

const equipmentPlanSlice = createSlice({
  name: 'equipmentPlan',
  initialState,
  reducers: {
    clearEquipmentPlans: state => {
      state.data = [];
      state.error = null;
    },
    clearCreateError: state => {
      state.createError = null;
    },
    clearUpdateError: state => {
      state.updateError = null;
    },
    clearDeleteError: state => {
      state.deleteError = null;
    },
  },
  extraReducers: builder => {
    builder
      // GET
      .addCase(getEquipmentPlans.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipmentPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.error = null;
      })
      .addCase(getEquipmentPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      // CREATE
      .addCase(createEquipmentPlan.pending, state => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createEquipmentPlan.fulfilled, state => {
        state.createLoading = false;
        state.createError = null;
      })
      .addCase(createEquipmentPlan.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // UPDATE
      .addCase(updateEquipmentPlan.pending, state => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateEquipmentPlan.fulfilled, state => {
        state.updateLoading = false;
        state.updateError = null;
      })
      .addCase(updateEquipmentPlan.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // DELETE
      .addCase(deleteEquipmentPlan.pending, state => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEquipmentPlan.fulfilled, state => {
        state.deleteLoading = false;
        state.deleteError = null;
      })
      .addCase(deleteEquipmentPlan.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { 
  clearEquipmentPlans, 
  clearCreateError, 
  clearUpdateError, 
  clearDeleteError 
} = equipmentPlanSlice.actions;

export default equipmentPlanSlice.reducer;
```

---

## 🎨 Usage in Components

### 1. Using Master Data Slice
```javascript
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getEquipment } from '../store/slices/equipmentSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const equipment = useSelector(state => state.equipment);
  const equipmentData = Array.isArray(equipment?.data) ? equipment.data : [];

  useEffect(() => {
    dispatch(getEquipment()); // Uses cache if available
    // dispatch(getEquipment(true)); // Force refresh from API
  }, []);

  if (equipment.loading) return <Loading />;
  if (equipment.error) return <Error message={equipment.error} />;

  return (
    <View>
      {equipmentData.map(item => (
        <Text key={item.id}>{item.nama}</Text>
      ))}
    </View>
  );
}
```

### 2. Using Transactional Slice
```javascript
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createEquipmentPlan, clearCreateError } from '../store/slices/equipmentPlanSlice';

function CreatePlanForm() {
  const dispatch = useDispatch();
  const { createLoading, createError } = useSelector(state => state.equipmentPlan);

  useEffect(() => {
    if (createError) {
      Alert.alert('Error', createError);
      dispatch(clearCreateError());
    }
  }, [createError]);

  const handleSubmit = async (formData) => {
    try {
      await dispatch(createEquipmentPlan(formData)).unwrap();
      Alert.alert('Sukses', 'Plan berhasil dibuat');
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <View>
      <Button 
        onPress={handleSubmit} 
        disabled={createLoading}
        title={createLoading ? 'Loading...' : 'Submit'}
      />
    </View>
  );
}
```

---

## ✅ Checklist untuk Slice Baru

- [ ] Import order sesuai panduan
- [ ] Menggunakan `API_ENDPOINTS` dari `endpoints.js`
- [ ] Caching untuk master data (AsyncStorage)
- [ ] Response normalization (rows/data fallback)
- [ ] Error handling konsisten
- [ ] State naming konsisten (loading, error, data, createLoading, dll)
- [ ] Clear error reducers
- [ ] Cache clear thunk (untuk master data)
- [ ] Console.error untuk debugging
- [ ] Fallback ke cache jika API error
- [ ] Array.isArray() check di component

---

## 🔍 Slices yang Sudah Konsisten

✅ **oprdrvSlice.js** - Master data dengan caching
✅ **equipmentSlice.js** - Master data dengan caching
✅ **lokasiPitSlice.js** - Master data dengan caching (updated)
✅ **kegiatanPitSlice.js** - Master data dengan caching (updated)
✅ **penyewaSlice.js** - Master data dengan caching (updated)
✅ **equipmentPlanSlice.js** - Transactional dengan full CRUD (updated)

---

## 📌 Notes

1. **Master Data** = Data yang jarang berubah (equipment, lokasi, penyewa, operator)
   - Wajib ada caching dengan AsyncStorage
   - Wajib ada cache clear function

2. **Transactional Data** = Data yang sering berubah (equipment plan, timesheet, checklog)
   - Tidak perlu caching
   - Pisahkan loading/error state untuk setiap action

3. **Hindari console.log di production** - Gunakan console.error untuk error saja

4. **Selalu gunakan Array.isArray()** di component untuk memastikan data adalah array

---

**Last Updated:** December 3, 2024  
**Version:** 1.0
