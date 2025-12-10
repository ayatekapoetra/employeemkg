# Display Cabang Name in Lokasi Bottomsheet - UI Feature

## 📋 Overview
Menampilkan nama cabang di bawah setiap item lokasi kerja di bottomsheet picker untuk memberikan context yang lebih jelas kepada user.

---

## 🎯 Objective

### Before:
```
┌────────────────────────────────┐
│  Pit 1                      ›  │
├────────────────────────────────┤
│  Pit 2                      ›  │
├────────────────────────────────┤
│  Stockpile A                ›  │
└────────────────────────────────┘
```

### After:
```
┌────────────────────────────────┐
│  Pit 1                      ›  │
│  Jakarta Utara                 │
├────────────────────────────────┤
│  Pit 2                      ›  │
│  Jakarta Selatan               │
├────────────────────────────────┤
│  Stockpile A                ›  │
│  Jakarta Pusat                 │
└────────────────────────────────┘
```

**Benefit:** User langsung tahu lokasi tersebut berada di cabang mana tanpa perlu menebak.

---

## 🔧 Implementation

### 1. UI Structure Update

#### Before:
```jsx
<TouchableOpacity style={styles.modalItem}>
  <Text style={styles.modalItemText}>{item.nama}</Text>
  <Text style={styles.modalItemArrow}>›</Text>
</TouchableOpacity>
```

#### After:
```jsx
<TouchableOpacity style={styles.modalItem}>
  <View style={styles.modalItemContent}>
    <Text style={styles.modalItemText}>{item.nama}</Text>
    {(showModal.type === 'lokasi' || showModal.type === 'lokasi_to') && 
     item.cabang?.nama && (
      <Text style={styles.modalItemSubtext}>{item.cabang.nama}</Text>
    )}
  </View>
  <Text style={styles.modalItemArrow}>›</Text>
</TouchableOpacity>
```

---

### 2. Conditional Rendering

Nama cabang **hanya ditampilkan** untuk:
- ✅ `showModal.type === 'lokasi'` (Lokasi Awal)
- ✅ `showModal.type === 'lokasi_to'` (Lokasi Tujuan)

Nama cabang **TIDAK ditampilkan** untuk:
- ❌ Equipment
- ❌ Operator/Driver
- ❌ Penyewa
- ❌ Shift
- ❌ Kegiatan

**Reason:** Equipment, Operator, dll sudah ada informasi yang cukup (kode, nik, dll). Hanya lokasi yang perlu context cabang.

---

### 3. Styles

#### New Styles Added:
```javascript
modalItemContent: {
  flex: 1,
  flexDirection: 'column',
  gap: 4,                    // Space between title & subtitle
},

modalItemText: {
  fontSize: 14,
  color: isDark ? '#e5e7eb' : '#333',
  fontWeight: '500',         // Slightly bold for main text
},

modalItemSubtext: {
  fontSize: 12,              // Smaller than main text
  color: isDark ? '#9ca3af' : '#666',  // Muted color
  marginTop: 2,
},

modalItemArrow: {
  fontSize: 20,
  color: isDark ? '#9ca3af' : '#999',
  fontWeight: '300',
  marginLeft: 12,            // Add spacing from content
},
```

---

## 🎨 Visual Design

### Typography Hierarchy:
1. **Main Text** (Nama Lokasi)
   - Font Size: 14px
   - Font Weight: 500 (medium)
   - Color: Primary text color

2. **Subtext** (Nama Cabang)
   - Font Size: 12px
   - Font Weight: 400 (regular)
   - Color: Secondary/muted text color

### Spacing:
- Gap between main text & subtext: 4px
- Vertical padding per item: 16px
- Arrow margin from content: 12px

### Colors:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Main Text | `#333` | `#e5e7eb` |
| Subtext | `#666` | `#9ca3af` |
| Arrow | `#999` | `#9ca3af` |

---

## 📊 Data Flow

### Requirement:
Backend **MUST** include `cabang` relation in lokasi data:

```javascript
// Redux State: lokasiData
[
  {
    id: 1,
    nama: "Pit 1",
    cabang_id: 5,
    cabang: {              // ← WAJIB!
      id: 5,
      nama: "Jakarta Utara",
      area: "Jakarta"
    }
  },
  {
    id: 2,
    nama: "Pit 2",
    cabang_id: 6,
    cabang: {              // ← WAJIB!
      id: 6,
      nama: "Jakarta Selatan",
      area: "Jakarta"
    }
  }
]
```

### Safe Access with Optional Chaining:
```javascript
{item.cabang?.nama && (
  <Text>{item.cabang.nama}</Text>
)}
```

**Behavior:**
- If `cabang` exists and has `nama` → Display cabang name
- If `cabang` is null/undefined → Hide subtext (no error)
- If `cabang.nama` is empty → Hide subtext

---

## 🧪 Testing Scenarios

### Test Case 1: Normal Display
```
Given: Lokasi data includes cabang.nama
When: User opens "Lokasi Kerja" picker
Then: Each item shows:
      - Line 1: Lokasi name (bold)
      - Line 2: Cabang name (smaller, muted)
```

### Test Case 2: Missing Cabang Data
```
Given: Some lokasi items don't have cabang relation
When: User opens "Lokasi Kerja" picker
Then: Items without cabang show only lokasi name
      (No subtext, no error)
```

### Test Case 3: Other Pickers (Non-Lokasi)
```
Given: User opens "Equipment" picker
When: List is displayed
Then: Only equipment name shown (no subtext)
      Because it's not lokasi type
```

### Test Case 4: Dark Mode
```
Given: App is in dark mode
When: User opens lokasi picker
Then: 
  - Main text: Light gray (#e5e7eb)
  - Subtext: Muted gray (#9ca3af)
  - Readable contrast maintained
```

### Test Case 5: Long Names
```
Given: Cabang name is very long (e.g., "Cabang Jakarta Utara Tanjung Priok")
When: Item is rendered
Then: Text should wrap or truncate gracefully
      (Currently no truncation, relies on layout)
```

---

## 📱 Responsive Behavior

### Layout:
```
┌─────────────────────────────────────────┐
│  [modalItemContent - flex:1]    [Arrow] │
│    Pit 1                            ›   │
│    Jakarta Utara                        │
└─────────────────────────────────────────┘
```

- **modalItemContent** takes available space (flex: 1)
- **Arrow** has fixed width, stays on right
- **Main & subtext** stack vertically with 4px gap

### Flex Behavior:
- Parent: `flexDirection: 'row'` (horizontal layout)
- Content: `flexDirection: 'column'` (vertical stack)
- Arrow: Fixed size, aligned center

---

## 🔍 Implementation Details

### File Modified:
- `employeemkg/app/penugasan/create.js`

### Changes Summary:
1. ✅ Added `<View style={styles.modalItemContent}>` wrapper
2. ✅ Added conditional `<Text style={styles.modalItemSubtext}>`
3. ✅ Added 3 new styles: `modalItemContent`, `modalItemSubtext`, updated `modalItemText`
4. ✅ Conditional rendering based on modal type
5. ✅ Safe access with optional chaining

### Lines Changed: ~15 lines
- Modal item JSX: +8 lines
- Styles: +7 lines

---

## ✅ Benefits

### 1. **Improved Context**
- User immediately knows which cabang the location belongs to
- No confusion between locations with similar names
- Example: "Pit 1" from Jakarta Utara vs "Pit 1" from Jakarta Selatan

### 2. **Better UX**
- Visual hierarchy: Main text → Subtext
- Clear information density
- Easier scanning through list

### 3. **Data Transparency**
- Shows filtered result context
- User understands why certain locations appear
- Aligns with area-based filter

### 4. **Accessibility**
- Clear text size difference
- Color contrast for readability
- Supports dark mode

### 5. **No Performance Impact**
- Simple conditional rendering
- No additional API calls
- Data already loaded in Redux

---

## 💡 Future Enhancements

### 1. Show Area in Addition to Cabang
```
Pit 1
Jakarta Utara • Jakarta
```

### 2. Add Icon for Visual Distinction
```
📍 Pit 1
   Jakarta Utara
```

### 3. Highlight Current User's Cabang
```
Pit 1
Jakarta Utara ← (Your Branch)
```

### 4. Add Badge/Tag
```
Pit 1                    [MINE]
Jakarta Utara
```

### 5. Truncate Long Names with Ellipsis
```javascript
modalItemSubtext: {
  // ... existing styles
  numberOfLines: 1,
  ellipsizeMode: 'tail',
}
```

---

## 🎨 Design Mockup (Text)

### Light Mode:
```
╔═══════════════════════════════════════╗
║ Pilih Lokasi Kerja               ✕   ║
╠═══════════════════════════════════════╣
║ [Search box]                          ║
╠═══════════════════════════════════════╣
║ Pit 1 Jakarta                      ›  ║
║ Jakarta Utara                         ║
╠───────────────────────────────────────╣
║ Pit 2 Jakarta                      ›  ║
║ Jakarta Selatan                       ║
╠───────────────────────────────────────╣
║ Stockpile A                        ›  ║
║ Jakarta Pusat                         ║
╠───────────────────────────────────────╣
║ Dumping Area 1                     ›  ║
║ Jakarta Utara                         ║
╚═══════════════════════════════════════╝
```

### Dark Mode:
Same structure, different colors (darker background, lighter text)

---

## 📊 Impact Analysis

### Before:
- User sees: "Pit 1", "Pit 2", "Stockpile A"
- Problem: Can't distinguish between locations in different cabang
- Extra steps: User might need to check elsewhere which cabang

### After:
- User sees: "Pit 1 \n Jakarta Utara"
- Benefit: Immediate context, informed decision
- Time saved: No need to verify elsewhere

### Metrics:
- **Information Density:** +1 field per item
- **Cognitive Load:** Reduced (more context upfront)
- **Selection Confidence:** Increased
- **User Errors:** Decreased (less confusion)

---

## ⚠️ Important Notes

### 1. Backend Dependency
- **Critical:** Backend MUST eager load `cabang` relation
- If cabang is missing, subtext won't show (graceful degradation)
- Verify API response includes `cabang.nama`

### 2. Performance
- No significant performance impact
- Already loaded in Redux (no extra fetching)
- Simple conditional rendering

### 3. Maintenance
- If cabang structure changes, update optional chaining
- Consider adding fallback text if cabang is missing
- Monitor for missing cabang data in production

---

## 🔧 Backend Verification

### Verify API Response:
```bash
# GET /api/master/lokasi-kerja/list
curl -X GET "https://api.example.com/api/master/lokasi-kerja/list" \
     -H "Authorization: Bearer {token}"
```

### Expected Response:
```json
{
  "diagnostic": {
    "error": false
  },
  "rows": [
    {
      "id": 1,
      "nama": "Pit 1",
      "cabang_id": 5,
      "cabang": {
        "id": 5,
        "nama": "Jakarta Utara",
        "area": "Jakarta"
      }
    }
  ]
}
```

### If `cabang` is Missing:
1. Check backend controller eager loading: `.with('cabang')`
2. Verify database relationship exists
3. Check Lucid model has `cabang()` relation defined

---

## 📚 Related Files

- `employeemkg/app/penugasan/create.js` - Main implementation
- `employeemkg/src/store/slices/lokasiPitSlice.js` - Lokasi data source
- `be/app/Models/Master/LokasiKerja.js` - Backend model
- `be/app/Controllers/Http/Master/LokasiKerjaController.js` - Backend controller

---

## ✅ Testing Checklist

- [ ] Lokasi picker shows cabang name below each item
- [ ] Cabang name is smaller and muted color
- [ ] Equipment picker does NOT show subtext
- [ ] Operator picker does NOT show subtext
- [ ] Dark mode shows correct colors
- [ ] Missing cabang data doesn't cause error
- [ ] Text hierarchy is clear (main > sub)
- [ ] Arrow stays aligned on right
- [ ] Search still works correctly
- [ ] Selection still works correctly

---

**Created:** December 3, 2024  
**Status:** ✅ Implemented  
**Version:** 1.0

**Visual Impact:** HIGH - Significantly improves UX for lokasi selection
