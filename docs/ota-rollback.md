# OTA Updates - Rollback Procedures

## Quick Rollback (Recommended)

### Method 1: Revert via EAS CLI

1. List recent updates:
   ```bash
   eas update:list --channel proemployeeapp
   ```

2. Find the last stable update ID from the list

3. Revert to previous stable version:
   ```bash
   eas update:revert --channel proemployeeapp --update-id <PREVIOUS_UPDATE_ID>
   ```

### Method 2: Publish Previous Version

1. Checkout to previous stable commit:
   ```bash
   git checkout <commit-hash>
   ```

2. Increment build numbers (version stays same, build number increases):
   ```json
   {
     "expo": {
       "version": "1.2.26",  // Previous version
       "ios": { "buildNumber": "29" },  // Increment
       "android": { "versionCode": 29 }  // Increment
     }
   }
   ```

3. Build and publish:
   ```bash
   eas build --profile production --platform android
   eas update --branch proemployeeapp --message "Rollback to 1.2.26"
   ```

## Emergency Disable

If OTA causes critical issues:

### Option A: Disable OTA via EAS Dashboard
1. Go to: https://expo.dev/accounts/ayateka/projects/employeemkg/updates
2. Find the problematic update
3. Click "Disable" or set channel to fallback

### Option B: Switch Channel
```bash
# Point channel to empty/safe branch
eas channel:edit proemployeeapp --branch empty
```

## Monitoring OTA Updates

Check OTA status in production:
```bash
# View update history
eas update:list --channel proemployeeapp

# View update details
eas update:view <update-id>
```

## Current OTA Channels

| Environment | Channel Name | Purpose |
|-------------|--------------|---------|
| Development | `devemployeeapp` | Testing new features |
| Preview | `prevemployeeapp` | Pre-production testing |
| Production | `proemployeeapp` | Live releases |

## Version Tracking

Current OTA marker: `OTA 1.2.27-01`

Always update OTA marker when releasing new version.