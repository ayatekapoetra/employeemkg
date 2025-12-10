# Operator/Driver Area Filter - Feature Update

## 📋 Overview
Menambahkan filter berdasarkan **area** untuk operator/driver (sama seperti lokasi kerja), dan menyederhanakan tampilan dengan menghapus NIK dari subtext.

---

## 🎯 Changes Made

### Change 1: Remove NIK from Subtext

#### Before:
```
┌────────────────────────────────┐
│  DRIVER                        │
├────────────────────────────────┤
│  Ahmad                      ›  │
│  driver • 12345                │  ← NIK displayed
├────────────────────────────────┤
│  Budi                       ›  │
│  driver • 67890                │  ← NIK displayed
└────────────────────────────────┘
```

#### After:
```
┌────────────────────────────────┐
│  DRIVER                        │
├────────────────────────────────┤
│  Ahmad                      ›  │
│  driver                        │  ← Only section
├────────────────────────────────┤
│  Budi                       ›  │
│  driver                        │  ← Only section
└────────────────────────────────┘
```

**Reason:** 
- NIK tidak diperlukan untuk selection
- Cleaner UI
- Fokus pada nama dan role (section)

---

### Change 2: Filter by Area (Like Lokasi)

#### Filter Logic:
```javascript
case 'karyawan':
  data = oprdrvData.filter(karyawan => {
    if (!userArea) return true;  // Fallback: show all
    return karyawan.cabang?.area === userArea;
  });
  break;
```

#### Behavior:
- ✅ User dengan area "Jakarta" → Hanya lihat operator/driver dari area "Jakarta"
- ✅ User tanpa area → Lihat semua operator/driver
- ✅ Sama persis seperti filter lokasi kerja

---

## 🔧 Implementation Details

### 1. Filter in openPicker()

```javascript
const openPicker = (type, title) => {
  let data = [];
  const userArea = user?.karyawan?.area;
  
  switch (type) {
    case 'karyawan':
      data = oprdrvData.filter(karyawan => {
        if (!userArea) return true;
        return karyawan.cabang?.area === userArea;
      });
      break;
      
    case 'lokasi':
    case 'lokasi_to':
      data = lokasiData.filter(lokasi => {
        if (!userArea) return true;
        return lokasi.cabang?.area === userArea;
      });
      break;
  }
  
  setShowModal({ visible: true, type, data, title });
};
```

**Consistent Pattern:**
- Both `karyawan` and `lokasi` use same filter logic
- Both check `item.cabang?.area === userArea`
- Both have fallback behavior

---

### 2. Subtext Simplified

```javascript
// BEFORE
<Text style={styles.modalItemSubtext}>
  {item.section} • {item.nik || item.id}
</Text>

// AFTER
<Text style={styles.modalItemSubtext}>
  {item.section}
</Text>
```

**Changes:**
- ❌ Removed: `• {item.nik || item.id}`
- ✅ Kept: `{item.section}` only

---

### 3. Enhanced Logging

```javascript
console.log('🔍 Area Filter Info:', {
  userArea,
  userCabang: user?.karyawan?.cabang?.nama,
  lokasi: {
    total: lokasiData.length,
    filtered: filteredLokasi.length,
    items: '...'
  },
  oprdrv: {
    total: oprdrvData.length,
    filtered: filteredOprDrv.length,
    driver: filteredOprDrv.filter(k => k.section === 'driver').length,
    operator: filteredOprDrv.filter(k => k.section === 'operator').length,
    items: filteredOprDrv.map(k => `${k.nama} (${k.section})`).slice(0, 3).join(', ')
  }
});
```

**Output Example:**
```
🔍 Area Filter Info: {
  userArea: 'Jakarta',
  userCabang: 'Jakarta Utara',
  lokasi: {
    total: 50,
    filtered: 18,
    items: 'Pit 1 (Jakarta Utara), Pit 2 (Jakarta Selatan), ...'
  },
  oprdrv: {
    total: 80,
    filtered: 25,
    driver: 10,
    operator: 15,
    items: 'Ahmad (driver), Budi (driver), Candra (operator), ...'
  }
}
```

---

## 📊 Data Requirements

### Backend Response MUST Include:

```javascript
{
  "diagnostic": { "error": false },
  "rows": [
    {
      "id": 1,
      "nama": "Ahmad",
      "section": "driver",
      "cabang_id": 5,
      "cabang": {                    // ← REQUIRED for filter
        "id": 5,
        "area": "Jakarta",           // ← CRITICAL!
        "kode": "JKT",
        "nama": "Jakarta Utara"
      }
    }
  ]
}
```

**Critical Fields:**
1. ✅ `cabang` relation - MUST be loaded
2. ✅ `cabang.area` - Used for filtering
3. ✅ `section` - Used for grouping and subtext

---

## 🎯 Use Cases

### Scenario 1: Jakarta User
```
Given: User with area = "Jakarta"
And: Database has:
  - 5 drivers in Jakarta
  - 3 drivers in Bandung
  - 10 operators in Jakarta
  - 5 operators in Bandung

When: User opens "Operator/Driver" picker

Then: User sees:
  DRIVER (5 items)
    - Ahmad (driver)
    - Budi (driver)
    - ... (3 more)
  
  OPERATOR (10 items)
    - Candra (operator)
    - Dedi (operator)
    - ... (8 more)

Total: 15 items (only Jakarta area)
```

### Scenario 2: Cross-Area Data Isolation
```
Given: 
  - User A (area = "Jakarta")
  - User B (area = "Bandung")

When: User A opens picker
Then: Sees only Jakarta operator/drivers

When: User B opens picker
Then: Sees only Bandung operator/drivers

Result: Complete data isolation by area
```

### Scenario 3: Multi-Cabang in Same Area
```
Given: Area "Jakarta" has 3 cabang:
  - Jakarta Utara (10 drivers)
  - Jakarta Selatan (8 drivers)
  - Jakarta Pusat (5 drivers)

When: User with area="Jakarta" opens picker

Then: Sees ALL drivers from all 3 cabang (23 total)
      Because they all have area = "Jakarta"
```

---

## 💡 Benefits

### 1. **Consistent Filtering**
- ✅ Lokasi filtered by area
- ✅ Operator/Driver filtered by area
- ✅ Same logic, predictable behavior

### 2. **Data Isolation**
- Users only see relevant operators/drivers
- Prevents cross-area assignments
- Better operational clarity

### 3. **Cleaner UI**
- Removed unnecessary NIK
- Focus on essential info (name + role)
- Less cluttered

### 4. **Flexible Multi-Cabang**
- One area can have multiple cabang
- User sees operators from ALL cabang in their area
- Natural geographical grouping

### 5. **Better UX**
- Shorter lists (filtered)
- Faster selection
- No confusion with irrelevant data

---

## 🔍 Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Filter** | None (show all) | By area (like lokasi) |
| **Subtext** | `driver • 12345` | `driver` |
| **List Length** | 80 items (all) | 25 items (area only) |
| **Data Isolation** | ❌ None | ✅ By area |
| **Consistency** | ❌ Different from lokasi | ✅ Same as lokasi |
| **UI Clutter** | More (NIK shown) | Less (NIK hidden) |

---

## 🧪 Testing Scenarios

### Test Case 1: Area Filter Applied
```
Given: User area = "Jakarta"
And: 80 total operators (25 Jakarta, 55 others)
When: User opens "Operator/Driver" picker
Then:
  - Only 25 operators shown
  - All have cabang.area = "Jakarta"
  - Console log shows filtered: 25
```

### Test Case 2: No Area (Fallback)
```
Given: User area = null
When: User opens picker
Then:
  - All 80 operators shown
  - No filter applied
  - App doesn't crash
```

### Test Case 3: Empty Result
```
Given: User area = "Kalimantan"
And: No operators with cabang.area = "Kalimantan"
When: User opens picker
Then:
  - Show empty state message
  - "Tidak ada operator/driver untuk area Kalimantan"
```

### Test Case 4: Grouped + Filtered
```
Given: User area = "Jakarta"
And: Filtered result has 10 drivers, 15 operators
When: List is displayed
Then:
  DRIVER section shows 10 items
  OPERATOR section shows 15 items
  Grouping maintained after filtering
```

### Test Case 5: Search + Filter + Group
```
Given: User area = "Jakarta" (25 filtered items)
When: User types "Ahmad" in search
Then:
  - Search applies to 25 filtered items
  - Results grouped by section
  - Only matching items shown
```

---

## ⚠️ Important Notes

### 1. Backend Dependency
**CRITICAL:** Backend MUST eager load cabang with area:
```javascript
// Backend Service
await Karyawan.query()
  .with('cabang', que => que.select(['id', 'area', 'kode', 'nama']))
  .whereIn('section', ['operator', 'driver'])
  .fetch()
```

If `cabang` or `cabang.area` is missing:
- Filter won't work
- User sees all data (fallback)

### 2. Endpoint Verification
**Endpoint:** `GET /master/karyawan/oprdrv`

**Verify includes cabang:**
```bash
curl -X GET "https://api.example.com/api/master/karyawan/oprdrv" \
     -H "Authorization: Bearer {token}"
```

**Expected:**
```json
{
  "rows": [
    {
      "id": 1,
      "nama": "Ahmad",
      "cabang": {
        "area": "Jakarta"  // ← MUST exist
      }
    }
  ]
}
```

### 3. Filter Consistency
Both lokasi and karyawan now use SAME filter:
```javascript
return item.cabang?.area === userArea;
```

If you need to change filter logic, update BOTH cases.

### 4. NIK Still Available
NIK tidak ditampilkan, tapi masih ada di data:
- Data tetap lengkap di Redux
- NIK bisa digunakan untuk keperluan lain
- Hanya UI yang disederhanakan

---

## 📈 Impact Analysis

### Before Changes:
```
Operator/Driver Picker:
├─ Show: All 80 operators (no filter)
├─ Subtext: "driver • 12345"
└─ User: Must scroll through all to find relevant ones
```

### After Changes:
```
Operator/Driver Picker:
├─ Show: 25 operators (Jakarta area only)
├─ Subtext: "driver" (simpler)
└─ User: Sees only relevant operators, faster selection
```

### Metrics:
- **List Length:** 80 → 25 items (69% reduction)
- **Scan Time:** Faster (shorter list)
- **Selection Accuracy:** Higher (only relevant data)
- **UI Cleanliness:** Improved (removed NIK)
- **Consistency:** Aligned with lokasi filter

---

## 📚 Related Files

### Modified:
- `employeemkg/app/penugasan/create.js`
  - Added area filter for karyawan (line ~142)
  - Removed NIK from subtext (line ~492)
  - Enhanced logging (line ~85)

### Documentation:
- `KARYAWAN_AREA_FILTER.md` (this file)
- `FILTER_CABANG_FEATURE.md` (lokasi filter reference)
- `KARYAWAN_GROUPED_FEATURE.md` (grouping feature)

### Backend (Reference):
- `be/app/Services/Master/KaryawanServices.js` (OPRDRV method)
- `be/app/Controllers/Http/master/KaryawanController.js`

---

## ✅ Summary of Changes

### 1. Filter Logic
```diff
  case 'karyawan':
-   data = oprdrvData;
+   data = oprdrvData.filter(karyawan => {
+     if (!userArea) return true;
+     return karyawan.cabang?.area === userArea;
+   });
    break;
```

### 2. Subtext Display
```diff
  <Text style={styles.modalItemSubtext}>
-   {item.section} • {item.nik || item.id}
+   {item.section}
  </Text>
```

### 3. Logging
```diff
- console.log('📍 Lokasi Filter Info:', { ... });
+ console.log('🔍 Area Filter Info:', {
+   lokasi: { ... },
+   oprdrv: {
+     total, filtered, driver, operator, items
+   }
+ });
```

---

## 🎯 Final Checklist

- [x] Added area filter for operator/driver
- [x] Filter logic same as lokasi (consistent)
- [x] Removed NIK from subtext
- [x] Enhanced logging with oprdrv info
- [x] Fallback behavior (no area = show all)
- [x] Grouping still works with filter
- [x] Search works with filtered data
- [x] Empty state message updated
- [x] Dark mode support maintained
- [x] Backend dependency documented

---

**Created:** December 3, 2024  
**Status:** ✅ Complete  
**Version:** 1.0

**Impact:** 
- **Filter Consistency:** HIGH - Now aligned with lokasi filter
- **UI Cleanliness:** MEDIUM - Removed unnecessary NIK
- **Data Relevance:** HIGH - Users see only area-relevant operators
