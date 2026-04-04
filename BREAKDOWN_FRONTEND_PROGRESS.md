# Daily Breakdown Frontend Implementation Progress

**Status:** 🚧 IN PROGRESS (40% Complete)  
**Date:** 2026-03-14

---

## ✅ COMPLETED

### 1. Redux State Management
- ✅ **`src/store/slices/breakdownSlice.js`** - CREATED
  - 8 async thunks (getList, getMyList, getToday, getStatistics, getDetail, create, update, delete)
  - Complete state management
  - Error handling
  - Pagination support

- ✅ **`src/store/index.js`** - UPDATED
  - Added breakdownReducer to store

### 2. API Endpoints
- ✅ **`src/services/api/endpoints.js`** - UPDATED
  - Added BREAKDOWN endpoints object
  - 8 endpoints configured

### 3. Folder Structure
- ✅ **`app/operational/daily-breakdown/`** - EXISTS
  - `index.js` - Main screen (needs update)
  - `components/` - Created (empty)

---

## ⏳ PENDING - Files to Create

### 1. Main Screens (Priority: HIGH)

```
app/operational/daily-breakdown/
├── index.js          ⏳ UPDATE - Dashboard with statistics
├── list.js           ⏳ CREATE - Breakdown list with filter
├── create.js         ⏳ CREATE - Create breakdown form  
├── detail.js         ⏳ CREATE - Breakdown detail view
└── edit.js           ⏳ CREATE - Edit breakdown form
```

### 2. Reusable Components (Priority: MEDIUM)

```
app/operational/daily-breakdown/components/
├── BreakdownCard.js          ⏳ CREATE - List item card
├── BreakdownStatusBadge.js   ⏳ CREATE - Status indicator
├── CategoryBadge.js          ⏳ CREATE - Category badge
├── StatCard.js               ⏳ CREATE - Statistics card (reuse existing)
├── FilterModal.js            ⏳ CREATE - Filter modal
├── EquipmentPicker.js        ⏳ CREATE - Equipment selection
├── LokasiPicker.js           ⏳ CREATE - Location selection
└── KategoriPicker.js         ⏳ CREATE - Category selection
```

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Core Screens (Next Steps)

1. **Update `index.js`** - Dashboard Screen
   ```javascript
   - Display statistics cards (total, by status, by kategori)
   - Quick actions (Create, View All, Today)
   - Recent breakdowns list
   - Chart/visualization (optional)
   ```

2. **Create `list.js`** - List Screen
   ```javascript
   - FlatList with BreakdownCard
   - Pull to refresh
   - Filter button (status, kategori, date range)
   - Search functionality
   - Pagination
   - Navigate to detail on tap
   ```

3. **Create `create.js`** - Create Form
   ```javascript
   - Equipment picker (required)
   - Location picker (required)
   - Category picker (required)
   - Breakdown datetime (required)
   - SMU input (optional)
   - Problem description
   - Multiple items support
   - Validation
   - Submit button
   ```

4. **Create `detail.js`** - Detail View
   ```javascript
   - Breakdown header info
   - Equipment details
   - Items list
   - Teknisi assigned
   - Actions history
   - Edit button
   - Delete button
   ```

5. **Create `edit.js`** - Edit Form
   ```javascript
   - Pre-filled form
   - Update status
   - Update items
   - Add notes/comments
   - Submit button
   ```

### Phase 2: Components

1. **BreakdownCard.js** - List Item
   ```javascript
   - Equipment name & code
   - Status badge
   - Category badge
   - Breakdown time
   - Location
   - Problem preview
   - Tap to navigate
   ```

2. **StatusBadge.js** - Status Indicator
   ```javascript
   - Color-coded badges
   - 0 = Red (Waiting)
   - 1 = Orange (Waiting Part)
   - 8 = Blue (In Progress)
   - 9 = Green (Completed)
   ```

3. **CategoryBadge.js** - Category Indicator
   ```javascript
   - Icon + text
   - MECHANICAL = 🔧
   - ELECTRICAL = ⚡
   - HYDRAULIC = 💧
   - ENGINE = 🏭
   ```

### Phase 3: Features

1. **Filter & Search**
   - Filter by status
   - Filter by category
   - Filter by date range
   - Filter by equipment
   - Filter by location

2. **Offline Support** (Future)
   - SQLite sync
   - Offline create/edit
   - Auto-sync when online

---

## 🎨 DESIGN SYSTEM

### Colors (Based on COLORS constant)

```javascript
// Light Mode
background: '#F5F5F5'
card: '#ffffff'
border: '#e5e7eb'
text: '#1f2937'
subtitle: '#6b7280'

// Dark Mode  
background: '#2f313e'
card: '#3a3c4a'
border: '#5e5f6cff'
text: '#f3f4f6'
subtitle: '#9ca3af'
```

### Status Colors

```javascript
status: {
  0: { bg: '#fee2e2', text: '#991b1b', label: 'Waiting' },
  1: { bg: '#fed7aa', text: '#9a3412', label: 'Waiting Part' },
  8: { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
  9: { bg: '#d1fae5', text: '#065f46', label: 'Completed' }
}
```

### Category Colors

```javascript
category: {
  MECHANICAL: { color: '#3b82f6', icon: '🔧' },
  ELECTRICAL: { color: '#f59e0b', icon: '⚡' },
  HYDRAULIC: { color: '#06b6d4', icon: '💧' },
  ENGINE: { color: '#ef4444', icon: '🏭' },
  TIRE: { color: '#8b5cf6', icon: '🚗' },
  OTHER: { color: '#6b7280', icon: '🛠️' }
}
```

---

## 📐 SCREEN LAYOUTS

### Dashboard (index.js)

```
┌─────────────────────────────────┐
│ Header: Daily Breakdown         │
├─────────────────────────────────┤
│ 📊 Statistics Cards (4)         │
│ ┌───┬───┬───┬───┐              │
│ │ Total │ WT │ WP │ IP │ DONE  │
│ └───┴───┴───┴───┘              │
├─────────────────────────────────┤
│ Quick Actions                   │
│ [➕ Create] [📋 All] [📅 Today] │
├─────────────────────────────────┤
│ Recent Breakdowns               │
│ ┌─────────────────────────────┐ │
│ │ BreakdownCard               │ │
│ │ BreakdownCard               │ │
│ │ BreakdownCard               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### List Screen (list.js)

```
┌─────────────────────────────────┐
│ Header: Breakdown List          │
│ [🔍 Search] [🔽 Filter]         │
├─────────────────────────────────┤
│ FlatList                        │
│ ┌─────────────────────────────┐ │
│ │ BreakdownCard 1             │ │
│ │ BreakdownCard 2             │ │
│ │ BreakdownCard 3             │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [➕] Floating Action Button     │
└─────────────────────────────────┘
```

### Create Screen (create.js)

```
┌─────────────────────────────────┐
│ Header: Create Breakdown        │
├─────────────────────────────────┤
│ ScrollView                      │
│                                 │
│ Equipment *                     │
│ [Select Equipment ▼]            │
│                                 │
│ Location *                      │
│ [Select Location ▼]             │
│                                 │
│ Category *                      │
│ [MECHANICAL ▼]                  │
│                                 │
│ Breakdown Time *                │
│ [2026-03-14 10:30 📅]          │
│                                 │
│ SMU (Optional)                  │
│ [1250.50]                       │
│                                 │
│ Problem Description *           │
│ [Multiline text input]          │
│                                 │
│ [➕ Add Item]                   │
│                                 │
│ [Submit Button]                 │
└─────────────────────────────────┘
```

---

## 🔧 UTILITY FILES NEEDED

### 1. Constants File

```javascript
// app/operational/daily-breakdown/constants.js

export const BREAKDOWN_STATUS = {
  WAITING: 0,
  WAITING_PART: 1,
  IN_PROGRESS: 8,
  COMPLETED: 9,
};

export const ITEM_STATUS = {
  WT: 'Tunggu Teknisi',
  WS: 'Tunggu Services',
  WP: 'Tunggu Spare Part',
  WV: 'Tunggu Vendor',
  WTT: 'Tunggu Transport',
  IP: 'Sedang Dikerjakan',
  DONE: 'Selesai',
};

export const KATEGORI = [
  { value: 'MECHANICAL', label: 'Mechanical', icon: '🔧' },
  { value: 'ELECTRICAL', label: 'Electrical', icon: '⚡' },
  { value: 'HYDRAULIC', label: 'Hydraulic', icon: '💧' },
  { value: 'ENGINE', label: 'Engine', icon: '🏭' },
  { value: 'TIRE', label: 'Tire/Ban', icon: '🚗' },
  { value: 'OTHER', label: 'Other', icon: '🛠️' },
];
```

### 2. Helper Functions

```javascript
// app/operational/daily-breakdown/utils.js

export const getStatusColor = (status, mode) => {
  const colors = {
    0: { light: '#ef4444', dark: '#fca5a5' },
    1: { light: '#f59e0b', dark: '#fbbf24' },
    8: { light: '#3b82f6', dark: '#60a5fa' },
    9: { light: '#10b981', dark: '#6ee7b7' },
  };
  return colors[status]?.[mode] || colors[0][mode];
};

export const getStatusLabel = (status) => {
  const labels = {
    0: 'Waiting',
    1: 'Waiting Part',
    8: 'In Progress',
    9: 'Completed',
  };
  return labels[status] || 'Unknown';
};

export const getCategoryIcon = (kategori) => {
  const icons = {
    MECHANICAL: '🔧',
    ELECTRICAL: '⚡',
    HYDRAULIC: '💧',
    ENGINE: '🏭',
    TIRE: '🚗',
    OTHER: '🛠️',
  };
  return icons[kategori] || '🛠️';
};
```

---

## 📚 NEXT IMMEDIATE STEPS

1. ✅ Redux slice - DONE
2. ✅ API endpoints - DONE
3. ⏭️ **Create constants.js** - Status, kategori definitions
4. ⏭️ **Create utils.js** - Helper functions
5. ⏭️ **Update index.js** - Dashboard with statistics
6. ⏭️ **Create BreakdownCard.js** - Reusable card component
7. ⏭️ **Create StatusBadge.js** - Status indicator
8. ⏭️ **Create list.js** - List screen
9. ⏭️ **Create create.js** - Create form
10. ⏭️ **Create detail.js** - Detail view

---

## 🎯 COMPLETION CHECKLIST

### Redux & API
- [x] breakdownSlice.js created
- [x] endpoints.js updated
- [x] store.js updated

### Screens
- [ ] index.js updated (Dashboard)
- [ ] list.js created
- [ ] create.js created
- [ ] detail.js created
- [ ] edit.js created

### Components
- [ ] BreakdownCard.js
- [ ] StatusBadge.js
- [ ] CategoryBadge.js
- [ ] FilterModal.js
- [ ] Equipment/Location/Category Pickers

### Utilities
- [ ] constants.js
- [ ] utils.js

### Features
- [ ] List with filter
- [ ] Create breakdown
- [ ] View detail
- [ ] Edit breakdown
- [ ] Delete breakdown
- [ ] Statistics dashboard
- [ ] Offline support (future)

---

**Current Progress:** 40%  
**Next Sprint:** Create utility files and main dashboard

**Shall I continue with creating the remaining files?**
