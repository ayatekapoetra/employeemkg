# Redux Backend Alignment - API Response Normalization

## 📋 Overview
Menyesuaikan Redux slices dengan response format backend yang menggunakan `rows` bukan `data`, serta menambahkan cache clear functionality untuk konsistensi.

---

## 🎯 Problem Identified

### Backend Response Format:
```javascript
{
  "diagnostic": {
    "ver": 3.0,
    "error": false
  },
  "rows": [...]  // ← Backend uses "rows"
}
```

### Redux Slice (BEFORE):
```javascript
const data = resp.data?.data || resp.data || [];
// ❌ Mencari "data" field, tapi backend return "rows"
```

---

## 🔧 Changes Made

### 1. **oprdrvSlice.js** (Operator/Driver)

#### Endpoint Verified:
- ✅ `GET /master/karyawan/oprdrv`
- ✅ Response: `{ diagnostic, rows }`
- ✅ Includes relations: `bisnis`, `cabang` (with `area`)

#### Changes:
```javascript
// BEFORE
const data = resp.data?.data || resp.data || [];

// AFTER  
const data = resp.data?.rows || resp.data?.data || resp.data || [];
```

**Added:**
- ✅ `CACHE_KEY` constant
- ✅ `forceRefresh` parameter
- ✅ `clearOprDrvCache()` thunk
- ✅ Consistent structure with other slices

---

### 2. **equipmentSlice.js** (Equipment)

#### Endpoint Verified:
- ✅ `GET /master/equipment/produksi`
- ✅ Response: `{ diagnostic, rows }`
- ✅ Includes filter: `kategori IN ['HE', 'DT', 'LT', 'LV']`

#### Changes:
```javascript
// BEFORE
const data = resp.data?.data || resp.data || [];

// AFTER
const data = resp.data?.rows || resp.data?.data || resp.data || [];
```

**Added:**
- ✅ `CACHE_KEY` constant
- ✅ `forceRefresh` parameter
- ✅ `clearEquipmentCache()` thunk

---

### 3. **lokasiPitSlice.js** (Already Fixed)

#### Endpoint Verified:
- ✅ `GET /master/lokasi-kerja/list`
- ✅ Response: `{ diagnostic, rows, page, perPage, total, lastPage }`
- ✅ **IMPORTANT:** Includes `cabang` relation with `area` field

#### Backend Service:
```javascript
await LokasiKerja.query()
  .with('cabang', que => que.select(['id', 'area', 'kode', 'nama']))
  .where(buildWhere)
  .fetch()
```

**Status:** ✅ Already consistent (updated in previous session)

---

### 4. **kegiatanPitSlice.js** (Already Fixed)

#### Endpoint Verified:
- ✅ `GET /master/kegiatan-kerja/list`
- ✅ Response: `{ diagnostic, rows, page, perPage, total, lastPage }`

**Status:** ✅ Already consistent (updated in previous session)

---

### 5. **penyewaSlice.js** (Already Fixed)

#### Endpoint Verified:
- ✅ `GET /master/penyewa/list`
- ✅ Response format varies, handled by normalization

**Status:** ✅ Already consistent (updated in previous session)

---

## 📊 Response Normalization Pattern

### Fallback Chain (Priority Order):
```javascript
const data = resp.data?.rows ||      // 1st: Backend standard (most common)
             resp.data?.data ||      // 2nd: Alternative format
             resp.data ||            // 3rd: Direct array
             [];                     // 4th: Fallback empty array
```

### Why This Order?
1. **`rows`** - Backend standard for list endpoints
2. **`data`** - Alternative format, some endpoints use this
3. **`resp.data`** - Direct array (rare, but possible)
4. **`[]`** - Safe fallback, prevents undefined errors

---

## 🔍 Backend Response Examples

### Example 1: Operator/Driver (oprdrv)
```javascript
// GET /master/karyawan/oprdrv
{
  "diagnostic": {
    "ver": 3.0,
    "error": false
  },
  "rows": [
    {
      "id": 1,
      "nama": "Ahmad",
      "nik": "12345",
      "section": "operator",
      "cabang_id": 5,
      "cabang": {
        "id": 5,
        "area": "Jakarta",
        "kode": "JKT",
        "nama": "Jakarta Utara"
      },
      "bisnis": {
        "id": 1,
        "initial": "MKG",
        "name": "PT MKG"
      }
    }
  ]
}
```

### Example 2: Equipment
```javascript
// GET /master/equipment/produksi
{
  "diagnostic": {
    "ver": 3.0,
    "error": false,
    "length": 25
  },
  "rows": [
    {
      "id": 1,
      "kode": "DT-001",
      "nama": "Dump Truck 001",
      "kategori": "DT",
      "tipe": "Hino 500",
      "cabang_id": 5,
      "aktif": "Y"
    }
  ]
}
```

### Example 3: Lokasi Kerja (with cabang)
```javascript
// GET /master/lokasi-kerja/list
{
  "diagnostic": {
    "ver": 3.0,
    "error": false
  },
  "rows": [
    {
      "id": 1,
      "nama": "Pit 1",
      "abbr": "P1",
      "type": "pit",
      "cabang_id": 5,
      "cabang": {
        "id": 5,
        "area": "Jakarta",  // ← Used for filtering
        "kode": "JKT",
        "nama": "Jakarta Utara"
      },
      "aktif": "Y"
    }
  ],
  "page": 1,
  "perPage": 25,
  "total": 50,
  "lastPage": 2
}
```

---

## ✅ Consistency Checklist

All master data slices now follow the same pattern:

| Slice | Endpoint | Response Format | Cache | Force Refresh | Clear Cache |
|-------|----------|----------------|-------|---------------|-------------|
| **oprdrvSlice** | `/master/karyawan/oprdrv` | `rows` | ✅ | ✅ | ✅ |
| **equipmentSlice** | `/master/equipment/produksi` | `rows` | ✅ | ✅ | ✅ |
| **lokasiPitSlice** | `/master/lokasi-kerja/list` | `rows` | ✅ | ✅ | ✅ |
| **kegiatanPitSlice** | `/master/kegiatan-kerja/list` | `rows` | ✅ | ✅ | ✅ |
| **penyewaSlice** | `/master/penyewa/list` | `rows/data` | ✅ | ✅ | ✅ |

---

## 🎨 Consistent Slice Structure

### Standard Template:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const CACHE_KEY = '@slice-name';

// Fetch data with cache
export const getData = createAsyncThunk(
  'sliceName/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached) };
        }
      }

      const resp = await apiClient.get(API_ENDPOINTS.SLICE_NAME.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];
      
      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching data:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Clear cache
export const clearCache = createAsyncThunk(
  'sliceName/clearCache',
  async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const sliceNameSlice = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    clearData: state => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCache.fulfilled, state => {
        state.data = null;
      });
  },
});

export const { clearData } = sliceNameSlice.actions;
export default sliceNameSlice.reducer;
```

---

## 🧪 Testing Scenarios

### Test 1: Normal Fetch (First Time)
```
Given: No cached data
When: dispatch(getOprDrv())
Then: 
  - Fetch from API
  - Response has "rows" field
  - Data cached to AsyncStorage
  - Redux state updated with data
```

### Test 2: Cached Data
```
Given: Data exists in AsyncStorage
When: dispatch(getOprDrv())
Then:
  - Return cached data immediately
  - No API call made
  - Redux state updated with cached data
```

### Test 3: Force Refresh
```
Given: Cached data exists
When: dispatch(getOprDrv(true))  // forceRefresh = true
Then:
  - Ignore cache
  - Fetch fresh data from API
  - Update cache with new data
  - Redux state updated
```

### Test 4: Clear Cache
```
Given: Cached data exists
When: dispatch(clearOprDrvCache())
Then:
  - Remove data from AsyncStorage
  - Redux state.data set to null
  - Next fetch will call API
```

### Test 5: API Error with Cache Fallback
```
Given: Cached data exists + API down
When: dispatch(getOprDrv(true))
Then:
  - API call fails
  - Fallback to cached data
  - Redux state updated with cached data
  - No error thrown to user
```

### Test 6: API Error without Cache
```
Given: No cached data + API down
When: dispatch(getOprDrv())
Then:
  - API call fails
  - No fallback available
  - Redux state.error set
  - Empty array returned
```

---

## 📊 Data Validation

### Backend Requirements:

#### 1. Operator/Driver (`/master/karyawan/oprdrv`)
**MUST include:**
- ✅ `cabang` relation with `area` field
- ✅ `bisnis` relation
- ✅ Fields: `id`, `nama`, `nik`, `section`

#### 2. Equipment (`/master/equipment/produksi`)
**MUST include:**
- ✅ Fields: `id`, `kode`, `nama`, `kategori`, `tipe`
- ✅ `cabang_id` for potential filtering
- ✅ Only production equipment (HE, DT, LT, LV)

#### 3. Lokasi Kerja (`/master/lokasi-kerja/list`)
**MUST include:**
- ✅ `cabang` relation with `area`, `nama` fields
- ✅ Fields: `id`, `nama`, `type`, `abbr`
- ✅ **CRITICAL:** `cabang.area` used for filtering

#### 4. Kegiatan Kerja (`/master/kegiatan-kerja/list`)
**MUST include:**
- ✅ Fields: `id`, `nama`, `kode`

---

## 💡 Benefits of Alignment

### 1. **Consistent Data Handling**
- All slices handle response the same way
- Predictable behavior across app
- Easier to debug

### 2. **Reliable Caching**
- All master data cached properly
- Faster app performance
- Works offline with cached data

### 3. **Error Resilience**
- Fallback to cache on API errors
- Graceful degradation
- Better user experience

### 4. **Maintainability**
- Single pattern to follow
- Easy to add new slices
- Clear documentation

### 5. **Developer Experience**
- Force refresh when needed
- Clear cache functionality
- Consistent API across slices

---

## 🔧 Backend Verification Commands

### Test Operator/Driver Endpoint:
```bash
curl -X GET "https://api.example.com/api/master/karyawan/oprdrv" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json"
```

**Expected:**
```json
{
  "diagnostic": { "error": false },
  "rows": [
    {
      "id": 1,
      "nama": "Ahmad",
      "cabang": {
        "area": "Jakarta",
        "nama": "Jakarta Utara"
      }
    }
  ]
}
```

### Test Equipment Endpoint:
```bash
curl -X GET "https://api.example.com/api/master/equipment/produksi" \
     -H "Authorization: Bearer {token}"
```

**Expected:**
```json
{
  "diagnostic": { "error": false },
  "rows": [
    {
      "id": 1,
      "kode": "DT-001",
      "kategori": "DT"
    }
  ]
}
```

### Test Lokasi Endpoint:
```bash
curl -X GET "https://api.example.com/api/master/lokasi-kerja/list" \
     -H "Authorization: Bearer {token}"
```

**Expected:**
```json
{
  "diagnostic": { "error": false },
  "rows": [
    {
      "id": 1,
      "nama": "Pit 1",
      "cabang": {
        "area": "Jakarta",
        "nama": "Jakarta Utara"
      }
    }
  ]
}
```

---

## ⚠️ Important Notes

### 1. Lokasi Cabang Relation
**CRITICAL:** Lokasi kerja filter depends on `cabang.area`
```javascript
// Backend MUST eager load:
.with('cabang', que => que.select(['id', 'area', 'kode', 'nama']))
```

If `cabang` not loaded:
- Filter will fail silently
- User sees all locations (no filter)

### 2. Cache Keys
Each slice uses unique cache key:
- `@oprdrv`
- `@equipment`
- `@lokasi-pit`
- `@kegiatan-pit`
- `@penyewa`

**DO NOT** reuse cache keys between slices!

### 3. Force Refresh Usage
Use `forceRefresh` when:
- User pulls to refresh
- Data might be stale
- After CRUD operations on master data

```javascript
// Normal fetch (uses cache)
dispatch(getOprDrv());

// Force fresh data
dispatch(getOprDrv(true));
```

### 4. Clear Cache Usage
Clear cache when:
- User logs out
- Master data updated
- Switching environments (dev/prod)

```javascript
dispatch(clearOprDrvCache());
dispatch(clearEquipmentCache());
```

---

## 📚 Related Files

### Modified:
- `employeemkg/src/store/slices/oprdrvSlice.js` - ✅ Updated
- `employeemkg/src/store/slices/equipmentSlice.js` - ✅ Updated
- `employeemkg/src/store/slices/lokasiPitSlice.js` - ✅ Already consistent
- `employeemkg/src/store/slices/kegiatanPitSlice.js` - ✅ Already consistent
- `employeemkg/src/store/slices/penyewaSlice.js` - ✅ Already consistent

### Backend (Reference):
- `be/app/Controllers/Http/master/KaryawanController.js`
- `be/app/Controllers/Http/master/EquipmentController.js`
- `be/app/Controllers/Http/master/LokasiKerjaController.js`
- `be/app/Controllers/Http/master/KegiatanKerjaController.js`
- `be/app/Services/Master/LokasiMiningServices.js`

---

## ✅ Final Checklist

- [x] oprdrvSlice normalized to use `rows`
- [x] equipmentSlice normalized to use `rows`
- [x] lokasiPitSlice verified (already uses `rows`)
- [x] kegiatanPitSlice verified (already uses `rows`)
- [x] penyewaSlice verified (handles both `rows` and `data`)
- [x] All slices have `CACHE_KEY` constant
- [x] All slices have `forceRefresh` parameter
- [x] All slices have `clearCache` thunk
- [x] All slices have consistent structure
- [x] Backend endpoints verified
- [x] Backend relations verified (especially `cabang.area`)
- [x] Documentation complete

---

**Created:** December 3, 2024  
**Status:** ✅ Complete  
**Version:** 1.0

**Impact:** All Redux slices now properly aligned with backend API response format, ensuring reliable data fetching and caching.
