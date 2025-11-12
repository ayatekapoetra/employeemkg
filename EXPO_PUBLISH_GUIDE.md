# Expo Publish Guide - employeemkg

## 📱 Project Info

**Owner**: ayateka  
**Slug**: employeemkg  
**Full URL**: exp://exp.host/@ayateka/employeemkg

---

## 🚀 Publishing to Expo

### Method 1: Start with Tunnel (Untuk Testing via Expo Go)

```bash
cd employeemkg

# Start dengan tunnel mode
npx expo start --tunnel

# Atau dengan QR code lebih jelas
npx expo start --tunnel --qr
```

**Features:**
- ✅ Accessible dari mana saja (internet)
- ✅ QR code bisa dibagikan ke team
- ✅ Automatic updates saat dev
- ✅ No need to publish

**Akses:**
1. Scan QR code dengan Expo Go
2. Atau buka URL: exp://exp.host/@ayateka/employeemkg
3. Project langsung bisa diakses

---

### Method 2: EAS Update (Production Updates)

#### Step 1: Install EAS CLI (jika belum)
```bash
npm install -g eas-cli
```

#### Step 2: Login
```bash
eas login
# Username: ayateka
```

#### Step 3: Configure EAS Update
```bash
cd employeemkg
npx expo install expo-updates
```

#### Step 4: Update app.json
Add this to `app.json`:
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

#### Step 5: Publish Update
```bash
# First time setup
eas update:configure

# Publish update
eas update --branch production --message "Initial release"
```

---

### Method 3: Build APK/IPA (Native Build)

#### Build Android APK:
```bash
# Configure (first time)
eas build:configure

# Build APK
eas build --profile preview --platform android

# Build for production
eas build --profile production --platform android
```

#### Build iOS:
```bash
eas build --profile preview --platform ios
```

**Download Build:**
After build complete, download dari:
https://expo.dev/accounts/ayateka/projects/employeemkg/builds

---

## 📦 Current Configuration

### app.json
```json
{
  "expo": {
    "name": "employeemkg",
    "slug": "employeemkg",
    "owner": "ayateka",
    "version": "1.0.0",
    "android": {
      "package": "com.ayateka.employeemkg"
    },
    "ios": {
      "bundleIdentifier": "com.ayateka.employeemkg"
    }
  }
}
```

### eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 🌐 Accessing the App

### Via Expo Go (Development):

**Method 1: QR Code**
```bash
npx expo start --tunnel
# Scan QR code dengan Expo Go app
```

**Method 2: Direct URL**
```
exp://exp.host/@ayateka/employeemkg
```

**Method 3: Expo Go Search**
1. Open Expo Go app
2. Search: "employeemkg"
3. Select: "@ayateka/employeemkg"

---

## 👥 Sharing with Team

### Option 1: QR Code
```bash
npx expo start --tunnel --qr

# Share QR code screenshot
# Team scan dengan Expo Go
```

### Option 2: Direct Link
Share this URL:
```
exp://exp.host/@ayateka/employeemkg
```

### Option 3: Build Link (untuk APK/IPA)
After build:
```
https://expo.dev/accounts/ayateka/projects/employeemkg/builds
```

---

## 🔧 Development Workflow

### For Daily Development:
```bash
# Start local
npx expo start

# Or with tunnel for remote access
npx expo start --tunnel
```

### For Testing on Multiple Devices:
```bash
# Start dengan tunnel
npx expo start --tunnel

# Share QR or URL ke team
```

### For Production Updates:
```bash
# Build native app (first time)
eas build --platform android

# For OTA updates (after native build)
eas update --branch production
```

---

## 📱 App URLs

### Development:
- Local: http://localhost:8081
- Tunnel: Generated ngrok URL
- Expo Go: exp://exp.host/@ayateka/employeemkg

### Production:
- Play Store: (after publish)
- App Store: (after publish)
- Web: https://employeemkg.vercel.app (if deployed)

---

## 🎯 Quick Commands

```bash
# Start development
npm start

# Start with tunnel (remote access)
npm start -- --tunnel

# Clear cache
npm start -- --clear

# Build Android APK
eas build --profile preview --platform android

# Publish OTA update
eas update --branch production --message "Update message"

# Check build status
eas build:list

# Check update status
eas update:list
```

---

## 🔐 Environment Variables

For production, set in EAS:

```bash
# Set secrets
eas secret:create --name GOOGLE_MAPS_API_KEY_ANDROID --value YOUR_KEY
eas secret:create --name GOOGLE_MAPS_API_KEY_IOS --value YOUR_KEY
eas secret:create --name API_URL --value https://your-api.com

# List secrets
eas secret:list
```

---

## 📊 Project Dashboard

**Expo Dashboard:**
https://expo.dev/accounts/ayateka/projects/employeemkg

**Features:**
- View builds history
- Download APK/IPA
- Monitor updates
- Check analytics
- Manage credentials

---

## ⚠️ Important Notes

### 1. Expo Go Limitations:
- ❌ No custom native modules (react-native-maps won't work)
- ❌ No push notifications
- ❌ Limited functionality
- ✅ Good for development/testing only

### 2. For Production:
- **MUST build native app** (eas build)
- Then distribute via Play Store / App Store
- Or internal distribution (APK/IPA direct download)

### 3. OTA Updates:
- Only works AFTER first native build
- Cannot add new native modules
- Good for JS/asset updates only

---

## 🚀 Recommended Workflow

### Phase 1: Development (Now) ✅
```bash
npx expo start --tunnel
# Share with team via QR/URL
```

### Phase 2: Testing
```bash
eas build --profile preview --platform android
# Distribute APK to testers
```

### Phase 3: Production
```bash
eas build --profile production --platform all
# Submit to stores
```

### Phase 4: Updates
```bash
eas update --branch production
# Push OTA updates
```

---

**Created**: November 11, 2025  
**Owner**: @ayateka  
**Project**: employeemkg  
**Status**: ✅ Ready for tunnel mode / EAS builds
