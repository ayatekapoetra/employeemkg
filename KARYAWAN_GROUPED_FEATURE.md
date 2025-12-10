# Grouped Karyawan List by Section - UI Feature

## 📋 Overview
Menampilkan list operator/driver dengan grouping berdasarkan **section** (Operator, Driver), dan menampilkan section + NIK sebagai subtext untuk memberikan context yang lebih jelas.

---

## 🎯 Objective

### Before:
```
┌────────────────────────────────┐
│  Ahmad - 12345              ›  │
├────────────────────────────────┤
│  Budi - 67890               ›  │
├────────────────────────────────┤
│  Candra - 11111             ›  │
├────────────────────────────────┤
│  Dedi - 22222               ›  │
└────────────────────────────────┘
```
- Nama dan NIK digabung dalam satu line
- Tidak ada grouping
- Sulit membedakan operator vs driver

### After:
```
┌────────────────────────────────┐
│  DRIVER                        │  ← Section Header
├────────────────────────────────┤
│  Ahmad                      ›  │
│  driver • 12345                │  ← Section + NIK
├────────────────────────────────┤
│  Budi                       ›  │
│  driver • 67890                │
├────────────────────────────────┤
│  OPERATOR                      │  ← Section Header
├────────────────────────────────┤
│  Candra                     ›  │
│  operator • 11111              │
├────────────────────────────────┤
│  Dedi                       ›  │
│  operator • 22222              │
└────────────────────────────────┘
```
- ✅ Grouped by section (Driver, Operator)
- ✅ Clear visual hierarchy
- ✅ Section + NIK as subtext
- ✅ Easy to scan and find

---

## 🔧 Implementation

### 1. Group Function

```javascript
const groupBySection = (data) => {
  const grouped = data.reduce((acc, item) => {
    const section = item.section || 'Lainnya';
    const sectionKey = section.charAt(0).toUpperCase() + section.slice(1);
    
    if (!acc[sectionKey]) {
      acc[sectionKey] = [];
    }
    acc[sectionKey].push(item);
    return acc;
  }, {});
  
  return Object.keys(grouped)
    .sort()  // Alphabetical order
    .map(section => ({
      section,
      data: grouped[section]
    }));
};
```

**Logic:**
1. Group items by `section` field
2. Capitalize first letter (driver → Driver)
3. Sort sections alphabetically
4. Return array of `{ section, data }` objects

---

### 2. Compute Grouped Data

```javascript
const groupedKaryawan = showModal.type === 'karyawan' && filteredData.length > 0
  ? groupBySection(filteredData)
  : [];
```

**Only for karyawan type:**
- If type is `karyawan` → Apply grouping
- If other types → Empty array (use regular list)

---

### 3. Conditional Rendering

```javascript
<ScrollView style={styles.modalList}>
  {showModal.type === 'karyawan' && groupedKaryawan.length > 0 ? (
    // Grouped list for karyawan
    groupedKaryawan.map((group, groupIndex) => (
      <View key={groupIndex}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{group.section}</Text>
        </View>
        
        {/* Items in this section */}
        {group.data.map((item) => (
          <TouchableOpacity key={item.id} style={styles.modalItem}>
            <View style={styles.modalItemContent}>
              <Text style={styles.modalItemText}>{item.nama}</Text>
              <Text style={styles.modalItemSubtext}>
                {item.section} • {item.nik || item.id}
              </Text>
            </View>
            <Text style={styles.modalItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    ))
  ) : (
    // Regular list for other types (lokasi, equipment, etc)
    filteredData.map((item) => (
      <TouchableOpacity key={item.id} style={styles.modalItem}>
        ...
      </TouchableOpacity>
    ))
  )}
</ScrollView>
```

---

### 4. Styles

#### Section Header:
```javascript
sectionHeader: {
  backgroundColor: isDark ? '#374151' : '#F5F5F5',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: isDark ? '#4b5563' : '#E0E0E0',
},

sectionHeaderText: {
  fontSize: 13,
  fontWeight: '600',
  color: isDark ? '#9ca3af' : '#666',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
```

#### Item Subtext (section + NIK):
```javascript
modalItemSubtext: {
  fontSize: 12,
  color: isDark ? '#9ca3af' : '#666',
  marginTop: 2,
},
```

---

## 🎨 Visual Design

### Typography Hierarchy:
1. **Section Header**
   - Font Size: 13px
   - Font Weight: 600 (semi-bold)
   - Transform: UPPERCASE
   - Letter Spacing: 0.5px
   - Color: Muted/secondary

2. **Karyawan Name** (Main Text)
   - Font Size: 14px
   - Font Weight: 500 (medium)
   - Color: Primary

3. **Section + NIK** (Subtext)
   - Font Size: 12px
   - Font Weight: 400 (regular)
   - Format: `{section} • {nik}`
   - Color: Muted/secondary

### Color Scheme:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Section Header BG | `#F5F5F5` | `#374151` |
| Section Header Text | `#666` | `#9ca3af` |
| Main Text | `#333` | `#e5e7eb` |
| Subtext | `#666` | `#9ca3af` |

---

## 📊 Data Structure

### Backend Response (Expected):
```javascript
{
  "diagnostic": { "error": false },
  "rows": [
    {
      "id": 1,
      "nama": "Ahmad",
      "nik": "12345",
      "section": "driver",  // ← Used for grouping
      "cabang_id": 5,
      "cabang": {
        "id": 5,
        "area": "Jakarta",
        "nama": "Jakarta Utara"
      }
    },
    {
      "id": 2,
      "nama": "Budi",
      "nik": "67890",
      "section": "driver",
      "cabang_id": 5
    },
    {
      "id": 3,
      "nama": "Candra",
      "nik": "11111",
      "section": "operator",
      "cabang_id": 5
    }
  ]
}
```

### Grouped Output:
```javascript
[
  {
    section: "Driver",
    data: [
      { id: 1, nama: "Ahmad", nik: "12345", section: "driver" },
      { id: 2, nama: "Budi", nik: "67890", section: "driver" }
    ]
  },
  {
    section: "Operator",
    data: [
      { id: 3, nama: "Candra", nik: "11111", section: "operator" }
    ]
  }
]
```

---

## 🧪 Testing Scenarios

### Test Case 1: Normal Grouping
```
Given: 3 drivers, 5 operators
When: User opens "Operator/Driver" picker
Then: 
  - Section "DRIVER" shown first (alphabetically)
  - 3 drivers listed under DRIVER section
  - Section "OPERATOR" shown second
  - 5 operators listed under OPERATOR section
```

### Test Case 2: Search with Grouping
```
Given: User types "Ahmad" in search
When: List is filtered
Then:
  - Only items matching "Ahmad" shown
  - Section headers still displayed
  - If section becomes empty, it's hidden
```

### Test Case 3: Empty Section
```
Given: No drivers in data, only operators
When: List is displayed
Then:
  - Only "OPERATOR" section shown
  - "DRIVER" section not displayed
```

### Test Case 4: Missing Section Field
```
Given: Some items don't have "section" field
When: Grouping is applied
Then:
  - Items without section go to "Lainnya" group
  - "LAINNYA" section shown at end (after sorting)
```

### Test Case 5: Section Capitalization
```
Given: Backend returns "driver" (lowercase)
When: Grouping is applied
Then:
  - Section header displays "Driver" (capitalized)
  - Consistent capitalization across all sections
```

### Test Case 6: Other Pickers (Non-Karyawan)
```
Given: User opens "Equipment" picker
When: List is displayed
Then:
  - NO grouping applied
  - Regular flat list shown
  - No section headers
```

---

## 🔍 Grouping Logic Details

### Section Value Transformation:
```javascript
const section = item.section || 'Lainnya';
// "driver" → "Driver"
// "operator" → "Operator"
// undefined → "Lainnya"

const sectionKey = section.charAt(0).toUpperCase() + section.slice(1);
```

### Sort Order:
- Sections sorted **alphabetically**
- Example order: `Driver`, `Operator`, `Pengawas`
- If you want custom order, modify the sort:

```javascript
const sectionOrder = { Driver: 1, Operator: 2, Lainnya: 3 };
return Object.keys(grouped)
  .sort((a, b) => (sectionOrder[a] || 99) - (sectionOrder[b] || 99))
  .map(...);
```

---

## 📱 Responsive Behavior

### Section Header:
```
┌─────────────────────────────────────────┐
│  [Section Header - Full Width]          │
│    DRIVER                                │
├─────────────────────────────────────────┤
│  [Item]                                  │
│    Ahmad                              › │
│    driver • 12345                        │
└─────────────────────────────────────────┘
```

- Section header spans full width
- Sticky/fixed at top when scrolling (optional enhancement)
- Clear visual separation from items

---

## 💡 Benefits

### 1. **Better Organization**
- Clear grouping by role (Driver vs Operator)
- Easy to find specific role
- Reduces cognitive load

### 2. **Improved Scanning**
- Section headers as visual anchors
- Quick navigation to desired section
- Alphabetical order for predictability

### 3. **More Context**
- Section displayed in subtext
- NIK displayed for verification
- No information overload

### 4. **Consistent with Lokasi**
- Similar pattern: main text + subtext
- Familiar UX across different pickers
- Professional appearance

### 5. **Scalability**
- Easy to add new sections (e.g., "Pengawas")
- Grouping automatically handles new sections
- No hardcoding required

---

## 🎯 Use Cases

### Scenario 1: Supervisor Creating Plan
```
Supervisor needs to assign a driver for DT-001
→ Opens "Operator/Driver" picker
→ Sees "DRIVER" section at top
→ Quickly finds available driver
→ Selects driver
```

### Scenario 2: Finding Specific Operator
```
Supervisor needs operator "Budi"
→ Opens picker
→ Searches "Budi"
→ Sees section "OPERATOR • 12345"
→ Confirms correct person
→ Selects
```

### Scenario 3: Verifying NIK
```
Supervisor unsure if "Ahmad" is the right person
→ Opens picker
→ Sees "Ahmad" with "driver • 12345"
→ Checks NIK matches record
→ Confirms and selects
```

---

## 🔄 Future Enhancements

### 1. Badge Count per Section
```
┌────────────────────────────────┐
│  DRIVER (3)                 ▼  │  ← Show count
├────────────────────────────────┤
```

### 2. Collapsible Sections
```
┌────────────────────────────────┐
│  DRIVER (3)                 ▲  │  ← Tap to collapse
├────────────────────────────────┤
│  OPERATOR (5)               ▼  │  ← Expanded
│    Candra                      │
│    Dedi                        │
└────────────────────────────────┘
```

### 3. Sticky Section Headers
- Section header stays at top while scrolling through section
- Better orientation in long lists

### 4. Section Indicators
```
┌────────────────────────────────┐
│  🚗 DRIVER                     │  ← Icon for section
├────────────────────────────────┤
│  👷 OPERATOR                   │
└────────────────────────────────┘
```

### 5. Filter by Section
```
[All] [Driver] [Operator]  ← Tab filter at top
```

---

## ⚠️ Important Notes

### 1. Backend Data Requirement
**MUST include `section` field:**
```javascript
{
  "id": 1,
  "nama": "Ahmad",
  "nik": "12345",
  "section": "driver"  // ← REQUIRED
}
```

If `section` is missing:
- Items go to "Lainnya" group
- Still functional, but not ideal

### 2. Section Values
Backend should return consistent values:
- ✅ `"driver"`
- ✅ `"operator"`
- ✅ `"pengawas"` (if applicable)
- ❌ Avoid variations like `"Driver"`, `"DRIVER"`, etc.

Frontend handles capitalization automatically.

### 3. Performance
For large lists (100+ items):
- Consider pagination
- Or implement virtualized list
- Current implementation works well for < 100 items

### 4. Search Behavior
Search filters items, then groups remaining items:
```javascript
// 1. Filter by search
const filteredData = showModal.data.filter(...)

// 2. Group filtered results
const groupedKaryawan = groupBySection(filteredData)
```

Empty sections are automatically hidden.

---

## 📊 Impact Analysis

### Before:
- **Flat list:** All karyawan mixed together
- **Hard to scan:** Need to read every name
- **No context:** Only name + NIK in one line

### After:
- **Organized:** Clear sections for Driver/Operator
- **Easy scanning:** Jump to desired section
- **Better context:** Section + NIK as separate info
- **Professional:** Cleaner, more structured UI

### Metrics:
- **Information Density:** Same, but better organized
- **Cognitive Load:** Reduced (clear grouping)
- **Selection Speed:** Faster (jump to section)
- **User Satisfaction:** Improved (clearer UI)

---

## 📚 Related Files

### Modified:
- `employeemkg/app/penugasan/create.js` - Main implementation

### Functions Added:
- `groupBySection(data)` - Grouping logic
- Grouped rendering in modal

### Styles Added:
- `sectionHeader` - Section header container
- `sectionHeaderText` - Section header text

### Lines Changed: ~50 lines
- Grouping function: +15 lines
- Grouped rendering: +25 lines
- Styles: +10 lines

---

## ✅ Testing Checklist

- [ ] Karyawan picker shows grouped list (by section)
- [ ] Section headers display correctly (capitalized)
- [ ] Section + NIK shown as subtext
- [ ] Sections sorted alphabetically
- [ ] Search filters and maintains grouping
- [ ] Empty sections not displayed
- [ ] Items without section go to "Lainnya"
- [ ] Other pickers (equipment, lokasi) use regular list
- [ ] Dark mode colors correct
- [ ] Selection works correctly
- [ ] NIK displayed correctly (or ID if NIK missing)

---

**Created:** December 3, 2024  
**Status:** ✅ Implemented  
**Version:** 1.0

**Visual Impact:** HIGH - Significantly improves organization and scanning for karyawan selection
