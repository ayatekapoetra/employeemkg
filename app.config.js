// Dynamic Expo config to inject public envs
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    // Core environment variables
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
    EXPO_PUBLIC_ABSENSI_API_URL: process.env.EXPO_PUBLIC_ABSENSI_API_URL,
    
    // Optional: Google Maps API Keys
    EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
    EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
  },
});