# Google Maps Configuration

## API Keys (from old project)

### Android
```
AIzaSyDgpw4bFVEE_z6YzlgbiGvxMa9BegDVCMM
```

### iOS
```
AIzaSyCYMnlvt-xY5PrinwHmw6qGRfPzD6_sZxA
```

---

## Setup Instructions

### Option 1: Using Expo Prebuild (Recommended for Production)

1. **Install react-native-maps via Expo:**
```bash
npx expo install react-native-maps
```

2. **Update app.json:**
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyCYMnlvt-xY5PrinwHmw6qGRfPzD6_sZxA"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyDgpw4bFVEE_z6YzlgbiGvxMa9BegDVCMM"
        }
      }
    },
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "AIzaSyDgpw4bFVEE_z6YzlgbiGvxMa9BegDVCMM"
        }
      ]
    ]
  }
}
```

3. **Generate native code:**
```bash
npx expo prebuild
```

4. **Run native build:**
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

### Option 2: Using EAS Build (Cloud Build)

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
eas login
```

2. **Configure build:**
```bash
eas build:configure
```

3. **Add secrets to EAS:**
```bash
eas secret:create --name GOOGLE_MAPS_API_KEY_ANDROID --value AIzaSyDgpw4bFVEE_z6YzlgbiGvxMa9BegDVCMM
eas secret:create --name GOOGLE_MAPS_API_KEY_IOS --value AIzaSyCYMnlvt-xY5PrinwHmw6qGRfPzD6_sZxA
```

4. **Build:**
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

---

### Option 3: Development Without Maps (Current)

For Expo Go testing:
- Maps will show placeholder
- GPS coordinates still displayed
- Distance calculation still works
- No native build needed

---

## Verification

After native build, maps should display:
- ✅ User location marker
- ✅ Office location marker(s)
- ✅ Radius circle (100m)
- ✅ Google Maps tiles

## Troubleshooting

**Maps not showing:**
1. Check API key is correct
2. Verify permissions (Location, Internet)
3. Check Android/iOS manifest has API key
4. Ensure billing enabled on Google Cloud Console
5. Verify Maps SDK enabled

**Placeholder still showing:**
- You're running in Expo Go (needs native build)
- Run `npx expo prebuild` and `npx expo run:android`

---

**Last Updated**: November 11, 2025
