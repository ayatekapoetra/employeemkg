# Filter Lokasi Kerja by Area - Feature Documentation

## 📋 Overview
Fitur filter otomatis untuk **Lokasi Kerja** berdasarkan **area** user yang login, memastikan setiap user hanya melihat lokasi kerja yang relevan dengan area mereka.

---

## 🎯 Scope

### Data yang Difilter:
1. ✅ **Lokasi Kerja** - Filtered by `data[].cabang.area === user.karyawan.area`

### Data yang TIDAK Difilter:
- ❌ **Penyewa** - Shared across all areas
- ❌ **Shift** - Static data (Shift 1, 2, 3)
- ❌ **Jenis Kegiatan** - Shared across all areas
- ❌ **Equipment** - Tidak difilter (show all)
- ❌ **Operator/Driver** - Tidak difilter (show all)

---

## 🔧 Implementation

### File Modified:
- `employeemkg/app/penugasan/create.js`

### Changes:

#### 1. Filter Logic in `openPicker()`
```javascript
const openPicker = (type, title) => {
  let data = [];
  const userArea = user?.karyawan?.area;
  
  switch (type) {
    case 'lokasi':
    case 'lokasi_to':
      // Filter lokasi berdasarkan area (bukan cabang_id)
      data = lokasiData.filter(lokasi => {
        if (!userArea) return true; // No filter if area not available
        return lokasi.cabang?.area === userArea;
      });
      break;
      
    case 'equipment':
      // Tidak difilter - show all
      data = equipmentData.map(e => ({ ...e, nama: `${e.kode} - ${e.nama}` }));
      break;
      
    case 'karyawan':
      // Tidak difilter - show all
      data = oprdrvData.map(k => ({ ...k, nama: `${k.nama} - ${k.nik || k.id}` }));
      break;
  }
  
  setShowModal({ visible: true, type, data, title });
};
```

#### 2. Debug Logging (useEffect)
```javascript
useEffect(() => {
  if (user && lokasiData.length > 0) {
    const userArea = user?.karyawan?.area;
    const filteredLokasi = lokasiData.filter(l => l.cabang?.area === userArea);
    
    console.log('📍 Lokasi Filter Info:', {
      userArea,
      userCabang: user?.karyawan?.cabang?.nama,
      lokasi: {
        total: lokasiData.length,
        filtered: filteredLokasi.length,
        items: filteredLokasi.map(l => `${l.nama} (${l.cabang?.nama || '-'})`).slice(0, 5).join(', ')
      }
    });
  }
}, [user, lokasiData]);
```

#### 3. User-Friendly Empty State Messages
```javascript
{showModal.data.length === 0 && 
 (showModal.type === 'lokasi' || showModal.type === 'lokasi_to') && 
 user?.karyawan?.area
  ? `Tidak ada lokasi kerja untuk area ${user.karyawan.area}`
  : 'Tidak ada data'}
```

---

## 📊 Data Flow

### User Login → Data Filter Flow:

```
┌─────────────────┐
│  User Login     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Auth State (Redux)         │
│  - user.karyawan.area       │
│  - user.karyawan.cabang.nama│
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Master Data Fetch                   │
│  - getLokasiPit()  (all)            │
│  - getEquipment()  (all)            │
│  - getOprDrv()     (all)            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Filter Applied in openPicker()              │
│  - lokasiData.filter(item.cabang.area)      │
│  - equipmentData (NO FILTER)                │
│  - oprdrvData (NO FILTER)                   │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Display Filtered Data in Modal              │
│  - Only show lokasi for user's area         │
└──────────────────────────────────────────────┘
```

---

## 🔍 Database Structure

### User → Karyawan → Area
```sql
users
├── id
└── ...

mas_karyawans
├── id
├── user_id (FK → users.id)
├── area (String - e.g., "Jakarta", "Bandung")
├── cabang_id (FK → mas_cabangs.id)
└── ...

mas_cabangs
├── id
├── nama
├── area (String - same as karyawan.area)
└── ...
```

### Lokasi Kerja with Nested Cabang
```sql
mas_lokasikerja
├── id
├── nama
├── cabang_id (FK → mas_cabangs.id)
└── cabang (relation)
    └── area (String)

-- Filter Logic:
-- lokasikerja.cabang.area === user.karyawan.area
```

---

## 🧪 Testing Scenarios

### Test Case 1: User with Valid Area
```
Given: User logged in with area = "Jakarta"
When: User opens "Lokasi Kerja" picker
Then: Should only see locations where lokasi.cabang.area === "Jakarta"
And: Console shows filtered count
```

### Test Case 2: User without Area
```
Given: User logged in but area is null/undefined
When: User opens lokasi picker
Then: Should see ALL locations (no filter applied)
```

### Test Case 3: Empty Filtered Result
```
Given: User logged in with area = "Kalimantan"
And: No locations exist with cabang.area = "Kalimantan"
When: User opens "Lokasi Kerja" picker
Then: Should show message "Tidak ada lokasi kerja untuk area Kalimantan"
```

### Test Case 4: Multiple Users, Different Areas
```
Given: User A (area = "Jakarta")
And: User B (area = "Bandung")

When: User A opens lokasi picker
Then: Sees only locations from cabang with area="Jakarta"
     (Could be from multiple cabang: Jakarta Utara, Jakarta Selatan, etc)

When: User B opens lokasi picker
Then: Sees only locations from cabang with area="Bandung"
```

### Test Case 5: Same Area, Different Cabang
```
Given: Area "Jakarta" has 3 cabang:
  - Cabang Jakarta Utara (id=1, area="Jakarta")
  - Cabang Jakarta Selatan (id=2, area="Jakarta") 
  - Cabang Jakarta Pusat (id=3, area="Jakarta")

And: User logged in with area = "Jakarta"

When: User opens lokasi picker
Then: Should see locations from ALL 3 cabang
      Because they all have area = "Jakarta"
```

---

## 📝 Console Log Output Example

```javascript
📍 Lokasi Filter Info: {
  userArea: 'Jakarta',
  userCabang: 'Cabang Jakarta Utara',
  lokasi: {
    total: 50,
    filtered: 18,
    items: 'Pit 1 Jakarta (Jakarta Utara), Pit 2 Jakarta (Jakarta Selatan), Stockpile A (Jakarta Pusat), ...'
  }
}
```

**Penjelasan:**
- `userArea`: Area dari karyawan yang login
- `userCabang`: Nama cabang dari karyawan (untuk referensi)
- `lokasi.total`: Total semua lokasi di database
- `lokasi.filtered`: Lokasi yang sesuai dengan area user
- `lokasi.items`: Contoh lokasi yang ditampilkan (nama + cabang)

---

## ⚠️ Important Notes

### 1. Fallback Behavior
If `user.karyawan.area` is not available, the filter returns **ALL data**:
```javascript
if (!userArea) return true; // Show all
```

This ensures the app doesn't break if:
- User data is incomplete
- User hasn't been assigned to an area
- Demo/test accounts
- Area field is null in database

### 2. Performance Consideration
- Filter is applied **client-side** (in the app)
- All lokasi data is fetched first, then filtered
- For large datasets (1000+ locations), consider **server-side filtering**
- Current implementation works well for typical datasets (< 500 locations)

### 3. Data Consistency
- **Critical:** Lokasi data must include `cabang` relation with `area` field
- Backend must eager load: `LokasiKerja.query().with('cabang')`
- If `cabang.area` is null, location won't be filtered (shows to all users)
- Verify data integrity: All cabang should have `area` field populated

### 4. Future Enhancement: Server-Side Filter
For better performance with large datasets:
```javascript
// Instead of fetching all then filtering:
dispatch(getLokasiPit());

// Consider API parameter:
dispatch(getLokasiPit({ area: userArea }));
```

Backend endpoint would be:
```javascript
// GET /api/master/lokasi-kerja/list?area=Jakarta
async LIST(req) {
  const { area } = req.query;
  let query = LokasiKerja.query().with('cabang');
  
  if (area) {
    query.whereHas('cabang', (builder) => {
      builder.where('area', area);
    });
  }
  
  return await query.fetch();
}
```

---

## ✅ Benefits

1. **Data Isolation by Area**
   - Users only see lokasi from their area
   - Prevents confusion with irrelevant locations from other areas
   - Example: Jakarta user won't see Kalimantan locations

2. **Flexible Multi-Cabang per Area**
   - One area can have multiple cabang
   - User sees locations from ALL cabang in their area
   - Example: "Jakarta" user sees locations from Jakarta Utara, Jakarta Selatan, etc.

3. **Security**
   - Reduces risk of cross-area data access
   - Clear data boundaries per area

4. **UX Improvement**
   - Shorter dropdown lists
   - Faster data selection
   - Only relevant locations shown

5. **Operational Clarity**
   - Clear separation by geographical area
   - Easier to manage regional operations
   - Better for audit/tracking by area

6. **Scalability**
   - Works well as company expands to new areas
   - Easy to add new cabang to existing area
   - No code change needed when adding cabang

---

## 🚀 Next Steps

### Optional Enhancements:
1. **Multi-Area Access** (for regional managers)
   - Add `accessible_areas: ['Jakarta', 'Bandung']` to user profile
   - Filter: `item.cabang.area IN accessible_areas`
   - Allow managers to see locations across multiple areas

2. **Cabang-Specific Filter** (more restrictive)
   - For strict isolation, filter by specific `cabang_id`
   - Filter: `item.cabang_id === user.karyawan.cabang_id`
   - User only sees locations from their exact cabang

3. **Dynamic Filter Toggle**
   - Add UI toggle: "Show all areas" (for admin users only)
   - Check user permissions before allowing toggle
   - Show current filter status in UI

4. **Filter Indicator in UI**
   - Show badge: "Area: Jakarta" at top of form
   - Help users understand why they see limited options
   - Add info icon with explanation tooltip

---

## 📚 Related Files

- `employeemkg/app/penugasan/create.js` - Main implementation
- `employeemkg/src/store/slices/lokasiPitSlice.js` - Lokasi data
- `employeemkg/src/store/slices/equipmentSlice.js` - Equipment data
- `employeemkg/src/store/slices/oprdrvSlice.js` - Operator data
- `employeemkg/src/store/slices/authSlice.js` - User/Cabang data

---

**Created:** December 3, 2024  
**Status:** ✅ Implemented & Ready for Testing  
**Version:** 1.0
