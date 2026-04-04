# Fix: MasterDataProgress Always Showing on App Restart

## 🐛 Problem
Component `MasterDataProgress` selalu tampil setiap kali aplikasi dibuka/restart, padahal seharusnya hanya tampil:
1. **Sekali setelah login** - Auto-sync pertama kali setelah user login
2. **Manual trigger** - Ketika user klik tombol di `DownloadDataScreen`

## 🔍 Root Cause
Di file `app/_layout.js`, terdapat `useEffect` yang **selalu** memanggil `downloadMasterDataToSQLite()` setiap kali ada perubahan `authToken`:

```javascript
useEffect(() => {
  const checkAndDownloadData = async () => {
    if (!isMounted || masterDataLoaded || activeQueue || autoSyncDisabled) return;
    const token = authToken || await AsyncStorage.getItem('@token');
    if (!token) return;
    await downloadMasterDataToSQLite(); // ⚠️ Selalu dipanggil
  };
  checkAndDownloadData();
}, [authToken, masterDataLoaded, activeQueue, autoSyncDisabled]);
```

**Issue:**
- Flag `autoSyncDisabled` awalnya `false` saat app restart
- Flag baru di-load dari AsyncStorage setelah beberapa saat
- Selama gap waktu ini, download tetap jalan

## ✅ Solution

### 1. Change Default `autoSyncDisabled` State
**File:** `app/_layout.js:49`

```javascript
// BEFORE
const [autoSyncDisabled, setAutoSyncDisabled] = useState(false);

// AFTER
const [autoSyncDisabled, setAutoSyncDisabled] = useState(true); // Default TRUE
const [autoSyncInitialized, setAutoSyncInitialized] = useState(false);
```

**Alasan:** Default ke `true` mencegah auto-sync berjalan sebelum flag di-load dari storage.

---

### 2. Improved Auto-Sync Flag Loading
**File:** `app/_layout.js:205-240`

```javascript
useEffect(() => {
  const loadAutoSyncFlag = async () => {
    try {
      const storedFlag = await AsyncStorage.getItem('@masterDataAutoSyncDisabled');
      const lastFetch = await AsyncStorage.getItem('@masterDataLastFetch');
      
      // Logic:
      // 1. If lastFetch exists → auto-sync DISABLED (already synced before)
      // 2. If storedFlag === 'true' → auto-sync DISABLED
      // 3. If storedFlag === 'false' → auto-sync ENABLED (set by login)
      // 4. If no flags → auto-sync DISABLED (default)
      
      if (lastFetch) {
        setAutoSyncDisabled(true);
      } else if (storedFlag === 'true') {
        setAutoSyncDisabled(true);
      } else if (storedFlag === 'false') {
        setAutoSyncDisabled(false); // Enabled by login
      } else {
        setAutoSyncDisabled(true);
      }
      
      setAutoSyncInitialized(true);
    } catch (error) {
      setAutoSyncDisabled(true);
      setAutoSyncInitialized(true);
    }
  };
  loadAutoSyncFlag();
}, []);
```

---

### 3. Enable Auto-Sync Only After Login
**File:** `src/store/slices/authSlice.js:117-131`

```javascript
// Set flag after successful login
await AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'false');
console.log('✅ Auto-sync ENABLED after login');

return { 
  // ... other data
  triggerAutoSync: true, // Flag untuk trigger auto-sync
};
```

**File:** `app/_layout.js:243-255` (New useEffect)

```javascript
// Watch for login success - reload auto-sync flag
useEffect(() => {
  const reloadAutoSyncFlag = async () => {
    if (authToken) {
      const storedFlag = await AsyncStorage.getItem('@masterDataAutoSyncDisabled');
      if (storedFlag === 'false') {
        console.log('[AppContent] ✅ Auto-sync enabled by login');
        setAutoSyncDisabled(false);
        setMasterDataLoaded(false);
      }
    }
  };
  reloadAutoSyncFlag();
}, [authToken]);
```

---

### 4. Disable Auto-Sync on Logout
**File:** `src/store/slices/authSlice.js:169-181`

```javascript
logout: (state) => {
  state.user = null;
  state.token = null;
  state.karyawan = null;
  state.error = null;
  AsyncStorage.removeItem('@token');
  AsyncStorage.removeItem('@user');
  AsyncStorage.removeItem('@employee');
  // Reset auto-sync on logout
  AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'true');
  console.log('🔒 Logout - auto-sync DISABLED');
},
```

---

### 5. Wait for Initialization Before Auto-Download
**File:** `app/_layout.js:258-289`

```javascript
useEffect(() => {
  let isMounted = true;

  const checkAndDownloadData = async () => {
    // ⚠️ Don't run until auto-sync flag is initialized
    if (!autoSyncInitialized) {
      console.log('[AppContent] Auto-sync not initialized yet, skipping...');
      return;
    }

    if (!isMounted || masterDataLoaded || activeQueue || autoSyncDisabled) {
      return;
    }

    const token = authToken || await AsyncStorage.getItem('@token');
    if (!token) return;

    console.log('[AppContent] Auto-downloading master data');
    await downloadMasterDataToSQLite();
  };

  checkAndDownloadData();

  return () => {
    isMounted = false;
  };
}, [authToken, masterDataLoaded, activeQueue, autoSyncDisabled, autoSyncInitialized]);
```

---

### 6. Improved Manual Trigger from DownloadDataScreen
**File:** `app/setting/download-data-screen.js:94-107`

```javascript
const handleClearTimestamp = async () => {
  try {
    await AsyncStorage.removeItem('@masterDataLastFetch');
    await AsyncStorage.setItem('@masterDataAutoSyncDisabled', 'false');
    console.log('🔄 Manual trigger: Emitting masterDataAutoSyncReset event');
    DeviceEventEmitter.emit('masterDataAutoSyncReset');
    Alert.alert(
      'Auto-Sync Diaktifkan', 
      'Progress bar akan muncul dan mulai mendownload data. Kembali ke Home untuk melihat progress.',
      [{ text: 'OK' }]
    );
  } catch (error) {
    Alert.alert('Error', 'Gagal mengaktifkan auto-sync');
  }
};
```

---

## 🎯 Flow Setelah Fix

### **Skenario 1: Fresh Install / First Login**
```
1. User buka app → autoSyncDisabled = true (default)
2. User login → authSlice set flag ke 'false'
3. _layout.js detect login → reload flag → set autoSyncDisabled = false
4. useEffect trigger → downloadMasterDataToSQLite() → Progress bar muncul ✅
5. Download selesai → set flag ke 'true' → Progress bar hilang
6. App restart → flag = 'true' → Progress bar TIDAK muncul ✅
```

### **Skenario 2: App Restart (Already Logged In)**
```
1. User buka app → autoSyncDisabled = true (default)
2. loadAutoSyncFlag() → check '@masterDataAutoSyncDisabled' = 'true'
3. setAutoSyncDisabled(true)
4. setAutoSyncInitialized(true)
5. useEffect check → autoSyncDisabled = true → SKIP download
6. Progress bar TIDAK muncul ✅
```

### **Skenario 3: Manual Trigger dari DownloadDataScreen**
```
1. User buka DownloadDataScreen
2. User klik "Download dengan Progress Bar"
3. Set flag ke 'false' → emit 'masterDataAutoSyncReset' event
4. _layout.js handle event → call downloadMasterDataToSQLite(true)
5. Progress bar muncul ✅
6. Download selesai → flag kembali ke 'true'
```

### **Skenario 4: Logout**
```
1. User logout
2. authSlice set flag ke 'true'
3. Clear token & user data
4. Navigate ke login page
5. Progress bar TIDAK muncul ✅
```

---

## 🧪 Testing Checklist

- [x] Fresh install → Login → Progress bar muncul 1x
- [x] Close app → Reopen → Progress bar TIDAK muncul
- [x] Manual trigger dari DownloadDataScreen → Progress bar muncul
- [x] Logout → Login lagi → Progress bar muncul 1x
- [x] App restart setelah download selesai → Progress bar TIDAK muncul

---

## 📝 Files Modified

1. `app/_layout.js` - Main logic untuk auto-sync control
2. `src/store/slices/authSlice.js` - Enable auto-sync after login, disable on logout
3. `app/setting/download-data-screen.js` - Manual trigger dengan feedback lebih jelas

---

## 🔧 AsyncStorage Flags Used

| Key | Value | Description |
|-----|-------|-------------|
| `@masterDataAutoSyncDisabled` | `'true'` / `'false'` | Control auto-sync behavior |
| `@masterDataLastFetch` | timestamp | Track last successful sync |
| `@token` | JWT token | User authentication |

---

## 💡 Key Improvements

1. **Default to Disabled** - Prevent auto-sync until explicitly enabled
2. **Initialization Flag** - Wait for flags to load before deciding
3. **Login Trigger** - Only enable after successful login
4. **Logout Reset** - Disable auto-sync on logout
5. **Better Feedback** - Clear user messaging in DownloadDataScreen

---

## ⚠️ Important Notes

- Progress bar sekarang **HANYA** muncul saat:
  - Pertama kali login (sekali saja)
  - Manual trigger dari DownloadDataScreen
- App restart **TIDAK** akan memicu progress bar lagi
- Flag `@masterDataLastFetch` tetap digunakan untuk track last sync time
- Manual trigger tetap berfungsi untuk re-download data kapan saja

---

**Date:** 2026-03-12  
**Status:** ✅ Fixed and Tested
