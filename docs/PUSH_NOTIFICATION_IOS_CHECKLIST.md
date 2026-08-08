# Push Notification iOS Configuration Checklist

## ✅ Configuration Status

### 1. Apple Developer Account
- [x] APNs Key dibuat di Apple Developer Console
  - Key ID: `7H3ZQPPXQX`
  - File: `credentials/AuthKey_7H3ZQPPXQX.p8`
- [x] App ID configured untuk push notifications
  - Bundle ID: `com.ayateka.appemployee`
  - Team ID: `ZZXA4KQS76`
- [x] Push Notifications capability enabled di Apple Developer

### 2. Expo/EAS Configuration
- [x] `app.json` - iOS config:
  ```json
  {
    "ios": {
      "bundleIdentifier": "com.ayateka.appemployee",
      "appleTeamId": "ZZXA4KQS76",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
  ```
- [x] `app.config.js` - APNs plugin configured:
  ```javascript
  ['expo-notifications', {
    iosMode: 'production',
    apnsKey: 'credentials/AuthKey_7H3ZQPPXQX.p8',
    apnsKeyId: '7H3ZQPPXQX',
    appleTeamId: 'ZZXA4KQS76',
  }]
  ```
- [x] `eas.json` - Production build config:
  ```json
  {
    "production": {
      "ios": {
        "credentialsSource": "remote"
      }
    }
  }
  ```

### 3. Backend Configuration
- [ ] Firebase Cloud Messaging (FCM) configured
  - File: `credentials/employeemkg-*-firebase-adminsdk-*.json`
  - Upload ke Firebase Console: ✅ Already done
- [ ] Backend API endpoint untuk register push token
  - Endpoint: `/mobile/push/register`
  - App code: `app_emp`
- [ ] Backend API endpoint untuk send notification
  - Endpoint: `/app-notifications/send` (atau via service)

### 4. App Code Configuration
- [x] Permission request on app launch
  - File: `app/_layout.js`
  - Function: `requestPermissionOnAppLaunch()`
- [x] Push token registration
  - File: `src/services/notifications/index.js`
  - Function: `registerForPushNotifications()`
- [x] Notification handler configured
  - `shouldShowBanner: true`
  - `shouldShowList: true`
  - `shouldPlaySound: true`
  - `shouldSetBadge: true` ✅ (Updated)
- [x] Android notification channel created
  - Channel ID: `default`
  - Importance: `MAX`

### 5. Badge Configuration
- [x] Badge count fetch from API
  - Endpoint: `/app-notifications/unread-count`
  - Params: `app=app_emp`
- [x] Badge refresh mechanism
  - AppState listener (foreground)
  - DeviceEventEmitter (navigate)
  - Auth token check
- [x] iOS app icon badge update
  - `Notifications.setBadgeCountAsync(count)` with permission check
- [x] Badge display in UI
  - Component: `NotificationButton`
  - Location: Header bell icon
  - Threshold: 99+

### 6. Deep Link Configuration
- [x] Notification tap handler
  - File: `src/services/notifications/index.js`
  - Function: `resolveDeepLink()`
- [x] Supported link types:
  - `app_notification` → `/notifications/<uuid>`
  - `timesheet_approval` → `/approval/timesheet`
  - `crew_worksheet` → `/approval`
  - `broadcast` → `/(tabs)/home`

## 🔧 Environment Variables

Required untuk build production:

```bash
# .env.production
EXPO_PUBLIC_IOS_APNS_KEY_PATH=/path/to/AuthKey_7H3ZQPPXQX.p8
```

Atau set saat build:

```bash
EXPO_PUBLIC_IOS_APNS_KEY_PATH=credentials/AuthKey_7H3ZQPPXQX.p8 eas build --platform ios
```

## 📋 Pre-Build Checklist

Sebelum build untuk TestFlight:

1. **Verify APNs Key File**
   ```bash
   ls -la credentials/AuthKey_7H3ZQPPXQX.p8
   # Should exist and be readable
   ```

2. **Verify Firebase Config**
   ```bash
   ls -la credentials/employeemkg-*-firebase-adminsdk-*.json
   # Should exist for FCM
   ```

3. **Test Local Build**
   ```bash
   eas build --platform ios --local
   # Test di simulator/device sebelum submit
   ```

4. **Verify Expo Project ID**
   - Project ID: `1075cddc-eee7-4b88-a925-365266c5f842`
   - Owner: `ayateka`
   - Slug: `employeemkg`

5. **Check Apple Developer Console**
   - App ID: `com.ayateka.appemployee`
   - Capabilities: Push Notifications ✅
   - Certificates: Distribution ✅
   - Provisioning Profiles: App Store ✅

## 🚀 Build & Deploy Commands

```bash
# 1. Build untuk TestFlight (production)
cd employeemkg
EXPO_PUBLIC_IOS_APNS_KEY_PATH=credentials/AuthKey_7H3ZQPPXQX.p8 \
  eas build --platform ios --profile production

# 2. Submit ke TestFlight
eas submit --platform ios

# 3. Monitor build status
eas build:list

# 4. Verify build configuration
eas build:inspect --platform ios
```

## 🧪 Testing Checklist

Setelah deploy ke TestFlight:

### Permission Flow
- [ ] First launch → permission dialog muncul
- [ ] User Allow → push token registered
- [ ] User Deny → bisa enable di Settings

### Push Notification Delivery
- [ ] Send test notification dari backend
- [ ] Notification muncul di lock screen
- [ ] Notification banner muncul saat app foreground
- [ ] Sound plays (jika enabled)
- [ ] Badge increment di app icon

### Badge Behavior
- [ ] Badge muncul di bell icon header
- [ ] Badge count sesuai dengan unread API
- [ ] Badge berkurang saat buka notification
- [ ] Badge jadi 0 saat mark all read
- [ ] App icon badge (iOS home screen) update otomatis

### Deep Link
- [ ] Tap notification → app terbuka ke detail page
- [ ] Cold start (app terminated) → deep link works
- [ ] Background/foreground → navigation works
- [ ] Invalid UUID → handle gracefully (fallback ke inbox)

## 🔍 Debug Commands

```javascript
// Check permission status
const perm = await Notifications.getPermissionsAsync();
console.log('Permissions:', perm);

// Check push token
const token = await Notifications.getDevicePushTokenAsync();
console.log('Device token:', token);

// Check Expo push token
const expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
console.log('Expo token:', expoToken);

// Manually trigger badge refresh
import { triggerBadgeRefresh } from './src/components/notifications';
triggerBadgeRefresh();

// Set badge manually (iOS only)
await Notifications.setBadgeCountAsync(5);
console.log('Badge set to 5');

// Send test notification (backend)
curl -X POST https://apinext.makkuragatama.id/api/mobile/push/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"app": "app_emp", "message": "Test notification"}'
```

## ⚠️ Common Issues & Solutions

### Issue: Badge tidak muncul di iOS
**Solution:**
- Verify `shouldSetBadge: true` di notification handler
- Check permission granted untuk badge
- Verify APNs key configured di build
- Check iOS Settings → Notifications → Badge enabled

### Issue: Push notification tidak diterima
**Solution:**
- Verify push token registered di backend
- Check Firebase/FCM configuration
- Verify APNs certificate valid (tidak expired)
- Check device token vs sandbox/production environment

### Issue: Deep link tidak bekerja
**Solution:**
- Verify `UIBackgroundModes` includes `remote-notification`
- Check `handleNotificationResponse` implementation
- Verify expo-router navigation works after cold start
- Add delay before navigation (500ms for cold start)

## 📞 Support Contacts

- **Apple Developer Support**: https://developer.apple.com/contact/
- **Expo Support**: https://docs.expo.dev/
- **Firebase Support**: https://firebase.google.com/support
- **Internal Team**: Check dengan backend team untuk API endpoint status

---

Last Updated: 2026-08-08
Version: 1.0
App Version: 1.2.33 (Build 39)
