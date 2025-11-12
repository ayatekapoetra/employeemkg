# Troubleshooting Guide

## "This screen doesn't exist" Error

### Masalah:
Error muncul saat navigasi ke screen tertentu (contoh: Checklog)

### Penyebab Umum:
1. **Cache Issue** - Metro bundler cache lama
2. **Route tidak terdaftar** - Screen belum di-register di _layout.js
3. **File path salah** - Import path tidak benar
4. **Hot reload issue** - Changes tidak ter-reload

---

## ✅ Solusi 1: Clear Cache (Paling Sering Berhasil)

### Method 1: Clear dengan flag
```bash
cd employeemkg
npm start -- --clear
```

### Method 2: Manual clear
```bash
cd employeemkg
rm -rf .expo
rm -rf node_modules/.cache
npm start
```

### Method 3: Full clean (jika masih error)
```bash
cd employeemkg
rm -rf .expo
rm -rf node_modules/.cache
rm -rf node_modules
npm install
npm start
```

---

## ✅ Solusi 2: Restart Metro Bundler

### Di Terminal:
1. Stop server (Ctrl+C)
2. Kill port 8081:
```bash
lsof -ti:8081 | xargs kill -9
```
3. Start ulang:
```bash
npm start
```

### Di Expo Go App:
1. Shake device
2. Pilih "Reload"
3. Atau close app dan scan QR ulang

---

## ✅ Solusi 3: Verifikasi Route Configuration

### Check 1: File exists
```bash
ls app/checklog.js
# Should exist
```

### Check 2: File registered in _layout.js
```javascript
// app/_layout.js
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="checklog" options={{ headerShown: false }} /> ✅
  <Stack.Screen name="+not-found" options={{ headerShown: false }} />
</Stack>
```

### Check 3: Export correct
```javascript
// app/checklog.js
import ChecklogScreen from '../src/features/attendance/screens/ChecklogScreen';
export default ChecklogScreen; ✅
```

### Check 4: Navigation correct
```javascript
// app/(tabs)/home.js
router.push('/checklog'); ✅
// NOT: router.push('checklog') ❌
// NOT: router.push('/checklog/') ❌
```

---

## ✅ Solusi 4: Watchman Issue

### Clear Watchman Cache:
```bash
watchman watch-del-all
```

### Reset Watchman:
```bash
watchman watch-del '/path/to/employeemkg'
watchman watch-project '/path/to/employeemkg'
```

---

## Common Errors & Solutions

### Error: "Unable to resolve module"
**Solution:**
```bash
npm install
npm start -- --clear
```

### Error: "Screen X doesn't exist"
**Solution:**
1. Check file exists in `app/` directory
2. Check registered in `app/_layout.js`
3. Clear cache
4. Restart Metro

### Error: "Element type is invalid"
**Solution:**
1. Check export/import statements
2. Verify component returns valid JSX
3. Check for circular imports

### Error: Metro bundler port in use
**Solution:**
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

---

## Development Tips

### 1. Always Use Clear Cache When:
- Adding new screens
- Changing route configuration
- After git pull
- Weird navigation errors

### 2. Proper Navigation:
```javascript
// ✅ Correct
router.push('/checklog')
router.push('/(tabs)/home')

// ❌ Wrong
router.push('checklog')
router.push('/checklog/')
router.navigate('checklog')
```

### 3. Debugging Navigation:
```javascript
// Add console logs
console.log('Navigating to checklog...');
router.push('/checklog');
console.log('Navigation executed');

// Check current route
import { usePathname } from 'expo-router';
const pathname = usePathname();
console.log('Current route:', pathname);
```

---

## Expo Go Specific Issues

### Issue: White screen after navigation
**Solution:**
1. Check console for errors
2. Reload app (shake > reload)
3. Clear cache and restart

### Issue: Changes not reflecting
**Solution:**
1. Save file (Cmd+S / Ctrl+S)
2. Wait 2-3 seconds for hot reload
3. If not working, reload app
4. If still not working, restart Metro

---

## Cache Locations

### Expo Cache:
```
employeemkg/.expo/
```

### Metro Cache:
```
node_modules/.cache/
```

### iOS Simulator Cache:
```
~/Library/Developer/CoreSimulator/Caches/
```

### Android Emulator Cache:
```
~/.android/avd/
```

---

## Quick Commands Reference

```bash
# Clear cache and start
npm start -- --clear

# Kill port 8081
lsof -ti:8081 | xargs kill -9

# Clear all caches
rm -rf .expo node_modules/.cache

# Full reinstall
rm -rf node_modules package-lock.json
npm install

# Watchman reset
watchman watch-del-all

# Check what's using port 8081
lsof -i:8081
```

---

## When to Contact Support

If after trying all solutions above, error still persists:

1. **Check GitHub Issues**: https://github.com/ayatekapoetra/employeemkg/issues
2. **Create Issue** with:
   - Error message (screenshot/text)
   - Steps to reproduce
   - Expo Go version
   - Device info (iOS/Android, version)
   - Output of `npm start`

---

## Prevention Best Practices

### 1. Regular Cache Clear
```bash
# Before starting dev session
npm start -- --clear
```

### 2. Proper Git Workflow
```bash
git pull origin expo
rm -rf node_modules
npm install
npm start -- --clear
```

### 3. Keep Dependencies Updated
```bash
npx expo install --check
npx expo install --fix
```

---

**Last Updated**: November 11, 2025  
**Status**: Active maintenance  
**Applies to**: Expo Router v54, React Native SDK 51+
