# Setup Project di Expo Dashboard

## ❓ Kenapa Project Belum Muncul di Dashboard?

Project **belum ter-register** di Expo servers. Untuk muncul di dashboard, perlu inisialisasi dengan `eas init`.

---

## 🎯 3 Cara Setup Project di Expo

### ✅ Option 1: Manual via CLI (Recommended)

#### Step 1: Pastikan Sudah Login
```bash
eas whoami
# Output: ayateka ✅
```

Jika belum login:
```bash
eas login
# Enter credentials
```

#### Step 2: Initialize Project
```bash
cd employeemkg
eas init
```

**Interactive Prompts:**
```
? Would you like to create a project for @ayateka/employeemkg?
> Yes

Creating project...
✅ Project created!
```

#### Step 3: Verify
```bash
eas project:info
```

**Output:**
```
Project: employeemkg
Owner: ayateka
ID: xxxx-xxxx-xxxx
```

---

### ✅ Option 2: Via Script (Easy)

```bash
cd employeemkg
./EXPO_SETUP.sh
```

Script akan:
1. Check login status
2. Run `eas init` interactively
3. Show project URLs

---

### ✅ Option 3: Via Web Dashboard

#### Go to Expo Dashboard:
https://expo.dev/accounts/ayateka

#### Click "Create Project"
1. Project name: `employeemkg`
2. Slug: `employeemkg`
3. Owner: `ayateka`
4. Click "Create"

#### Copy Project ID
Setelah create, copy Project ID dari dashboard.

#### Update app.json:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "PASTE_PROJECT_ID_HERE"
      }
    }
  }
}
```

---

## 📊 Setelah Setup

### Project akan muncul di:
https://expo.dev/accounts/ayateka/projects/employeemkg

### Features Available:
- ✅ Build history
- ✅ Update history  
- ✅ Analytics
- ✅ Credentials management
- ✅ Team management

---

## 🚀 Testing Without Dashboard Setup

**Good News:** Anda TIDAK perlu setup dashboard untuk development!

### Cara 1: Tunnel Mode
```bash
cd employeemkg
npx expo start --tunnel
# Scan QR dengan Expo Go
```

### Cara 2: Local Network
```bash
cd employeemkg
npm start
# Scan QR (same WiFi only)
```

**Project tetap bisa diakses via Expo Go tanpa registered di dashboard!**

---

## 🎯 Kapan Perlu Dashboard Setup?

Dashboard setup **WAJIB** untuk:

### ❌ Tidak Perlu (Development):
- Testing di Expo Go ✅
- Local development ✅
- Sharing via QR code ✅
- Tunnel mode ✅

### ✅ Perlu (Production):
- Build native app (APK/IPA) ⚠️
- Publish to stores ⚠️
- EAS Update (OTA) ⚠️
- Team collaboration features ⚠️
- Analytics & monitoring ⚠️

---

## 📝 Step-by-Step: Complete Setup

### 1. Login to EAS
```bash
eas login
# Username: ayateka
# Password: [enter password]
```

### 2. Navigate to Project
```bash
cd employeemkg
```

### 3. Initialize EAS Project
```bash
eas init
```

**Prompts & Answers:**
```
? Would you like to create a project for @ayateka/employeemkg?
→ Select: Yes (press Y + Enter)

? Project name
→ Keep default: employeemkg (press Enter)

Creating project on Expo servers...
✅ Done!
```

### 4. Verify Setup
```bash
eas project:info
```

**Expected Output:**
```
Project Details:
  Name: employeemkg
  Slug: employeemkg  
  Owner: ayateka
  ID: 12345678-1234-1234-1234-123456789abc
  
Dashboard: https://expo.dev/accounts/ayateka/projects/employeemkg
```

### 5. Check app.json
```bash
cat app.json | grep -A 3 "extra"
```

**Should see:**
```json
"extra": {
  "eas": {
    "projectId": "12345678-1234-1234-1234-123456789abc"
  }
}
```

### 6. Commit Changes
```bash
git add app.json
git commit -m "feat: add EAS project ID"
git push origin expo
```

### 7. Access Dashboard
Open browser:
```
https://expo.dev/accounts/ayateka/projects/employeemkg
```

---

## 🔧 Troubleshooting

### Error: "Not logged in"
```bash
eas logout
eas login
# Re-enter credentials
```

### Error: "Project already exists"
```bash
# Project sudah dibuat, tinggal link
eas init
# Select: Link to existing project
```

### Error: "Permission denied"
```bash
# Pastikan account owner benar
eas whoami
# Output harus: ayateka
```

### Error: "Network timeout"
```bash
# Check internet connection
ping expo.dev

# Or use VPN if needed
```

---

## 📱 Quick Start (No Dashboard Needed)

Untuk testing segera **tanpa** setup dashboard:

```bash
cd employeemkg

# Start dengan tunnel
npx expo start --tunnel

# Scan QR dengan Expo Go
# Project langsung jalan! ✅
```

**Dashboard setup bisa dilakukan nanti saat perlu build production.**

---

## 🎯 Recommended Workflow

### For Now (Development Phase):
```bash
# Skip dashboard setup
# Just use tunnel mode
npx expo start --tunnel
```

### When Ready for Production:
```bash
# 1. Setup dashboard
eas init

# 2. Build native app
eas build --profile preview --platform android

# 3. Test APK
# Download dan install di device

# 4. Production build
eas build --profile production --platform android

# 5. Publish to store
eas submit --platform android
```

---

## 📞 Support

Jika ada error saat `eas init`:

1. **Check login**: `eas whoami`
2. **Check internet**: `ping expo.dev`
3. **Update EAS CLI**: `npm install -g eas-cli`
4. **Try again**: `eas init`

---

## 🔗 Useful Links

- **EAS Documentation**: https://docs.expo.dev/eas/
- **EAS Init Guide**: https://docs.expo.dev/eas/cli/#eas-init
- **Expo Dashboard**: https://expo.dev/accounts/ayateka
- **Support**: https://forums.expo.dev

---

## ✅ Summary

**For Development (Now):**
- ❌ Dashboard setup NOT required
- ✅ Just run: `npx expo start --tunnel`
- ✅ Share QR code to team
- ✅ Project works perfectly!

**For Production (Later):**
- ✅ Run: `eas init`
- ✅ Project appears in dashboard
- ✅ Can build native apps
- ✅ Can publish to stores

**Choose based on your needs!** 🚀

---

**Created**: November 11, 2025  
**Last Updated**: November 11, 2025  
**Status**: ✅ Development works without dashboard  
**Dashboard**: Optional for production builds
