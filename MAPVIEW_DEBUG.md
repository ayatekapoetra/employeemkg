# MapView Force Close Debug Guide

## Penyebab Force Close:
1. ✅ Google Maps API Key tidak ada di AndroidManifest (FIXED)
2. ⚠️  Provider PROVIDER_GOOGLE mungkin tidak compatible
3. ⚠️  showsUserLocation require permission di runtime
4. ⚠️  Marker dengan custom image bisa crash

## Solusi Bertahap:

### Step 1: Disable MapView Sementara
Tambahkan `false &&` di depan kondisi MapView untuk test app tanpa map

### Step 2: Enable MapView Minimal
Gunakan MapView tanpa marker dan props kompleks:
```jsx
<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  }}
/>
```

### Step 3: Add Markers
Setelah MapView stabil, tambahkan marker satu-satu

### Step 4: Test Build
```bash
cd android && ./gradlew clean
cd ..
npx expo run:android
```

## Cek Logs:
```bash
adb logcat | grep -i "maps\|google\|fatal"
```

## Alternative: Gunakan Expo Location Map
Jika tetap crash, consider menggunakan static map dari Google Maps Static API
