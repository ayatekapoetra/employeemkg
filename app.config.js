const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Config plugin: tambahkan android:usesCleartextTraffic dan network_security_config
 * agar HTTP (cleartext) dapat diakses di Android untuk development lokal.
 * Ini diperlukan karena android/ di-.gitignore dan di-generate ulang oleh prebuild.
 */
function withCleartextHttp(config) {
  // 1. Tambahkan attribute ke AndroidManifest.xml
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    const app = manifest.manifest.application[0];

    app.$['android:usesCleartextTraffic'] = 'true';
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';

    return mod;
  });

  // 2. Buat file res/xml/network_security_config.xml
  config = withDangerousMod(config, [
    'android',
    (mod) => {
      const xmlDir = path.join(mod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      const xmlFile = path.join(xmlDir, 'network_security_config.xml');

      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      fs.writeFileSync(
        xmlFile,
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
`
      );

      return mod;
    },
  ]);

  return config;
}

function resolveGoogleServicesFile() {
  const fromEnv = process.env.GOOGLE_SERVICES_JSON;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  // Local fallback for prebuild/dev (credentials/ is gitignored)
  const localCandidates = [
    path.resolve(__dirname, 'credentials/google-services.json'),
    path.resolve(__dirname, 'google-services.json'),
  ];
  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function resolveAPNsKeyFile() {
  const fromEnv = process.env.EXPO_PUBLIC_IOS_APNS_KEY_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  // Local fallback for prebuild/dev (credentials/ is gitignored)
  const localCandidates = [
    path.resolve(__dirname, 'credentials/AuthKey_7H3ZQPPXQX.p8'),
    path.resolve(__dirname, 'AuthKey_7H3ZQPPXQX.p8'),
  ];
  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

// Dynamic Expo config to inject public envs
module.exports = ({ config }) => {
  const googleServicesFile = resolveGoogleServicesFile();
  const apnsKeyFile = resolveAPNsKeyFile();

  return {
    ...config,
    ios: {
      ...(config.ios || {}),
      ...(apnsKeyFile ? {
        appleTeamId: 'ZZXA4KQS76',
        bundleIdentifier: 'com.ayateka.appemployee',
      } : {}),
    },
    android: {
      ...(config.android || {}),
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
    plugins: [
      ...(config.plugins || []),
      withCleartextHttp,
      [
        'expo-notifications',
        {
          iosMode: 'production',
          color: '#0A7EA4',
          defaultChannel: 'default',
          ...(apnsKeyFile ? {
            appleTeamId: 'ZZXA4KQS76',
            apnsKey: apnsKeyFile,
            apnsKeyId: '7H3ZQPPXQX',
          } : {}),
        },
      ],
    ],
    extra: {
      ...(config.extra || {}),
      // Core environment variables
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
      EXPO_PUBLIC_ABSENSI_API_URL: process.env.EXPO_PUBLIC_ABSENSI_API_URL,
      TOKEN_ABSENSI: process.env.TOKEN_ABSENSI,

      // App version configuration
      EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.2.33',
      EXPO_PUBLIC_BUILD_NUMBER: process.env.EXPO_PUBLIC_BUILD_NUMBER || '39',
      EXPO_PUBLIC_OTA_UPDATE_VERSION: process.env.EXPO_PUBLIC_OTA_UPDATE_VERSION || '1',
      EXPO_PUBLIC_OTA_CHANNEL: process.env.EXPO_PUBLIC_OTA_CHANNEL || 'proemployeeapp',

      // Optional: Google Maps API Keys
      EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
      EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,

      // Debug markers
      hasGoogleServicesFile: Boolean(googleServicesFile),
      hasAPNsKeyFile: Boolean(apnsKeyFile),
    },
  };
};
