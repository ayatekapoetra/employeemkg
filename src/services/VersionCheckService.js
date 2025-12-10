import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import apiClient from './api/client';
import { APP_VERSION, APP_BUILD_NUMBER } from '../constants/AppVersion';

class VersionCheckService {
  constructor() {
    console.log('🔧 VersionCheckService constructor called');
    console.log('🔧 Application.nativeApplicationVersion:', Application.nativeApplicationVersion);
    console.log('🔧 Application.nativeBuildVersion:', Application.nativeBuildVersion);
    
    // Check if we're in Expo Go (returns Expo SDK version like "54.0.6")
    const isExpoGo = Application.nativeApplicationVersion?.startsWith('5') && 
                     Application.nativeApplicationVersion?.includes('.');
    
    if (isExpoGo) {
      console.warn('⚠️ Running in Expo Go - Using hardcoded version constants');
      this.currentVersion = APP_VERSION;
      this.currentBuildNumber = APP_BUILD_NUMBER;
    } else {
      // Production/Development Build - Use native values
      this.currentVersion = Application.nativeApplicationVersion || APP_VERSION;
      this.currentBuildNumber = Application.nativeBuildVersion || 
        this.parseBuildFromVersion(Application.nativeApplicationVersion) ||
        APP_BUILD_NUMBER;
    }
    
    console.log('🔧 Final currentVersion:', this.currentVersion);
    console.log('🔧 Final currentBuildNumber:', this.currentBuildNumber);
    this.platform = Platform.OS;
  }

  parseBuildFromVersion(versionString) {
    // Parse "1.2.16" -> 16
    if (!versionString) return '1';
    const parts = versionString.split('.');
    return parts[parts.length - 1] || '1';
  }

  async checkForUpdate() {
    try {
      console.log('📱 Version Check Service Started');
      console.log('📱 Platform:', this.platform);
      console.log('📱 Current Version:', this.currentVersion);
      console.log('📱 nativeApplicationVersion:', Application.nativeApplicationVersion);
      console.log('📱 nativeBuildVersion:', Application.nativeBuildVersion);
      console.log('📱 Current Build Number (used):', this.currentBuildNumber);
      
      const response = await apiClient.get('/mobile/version-check', {
        params: {
          platform: this.platform,
          currentVersion: this.currentVersion,
          buildNumber: this.currentBuildNumber,
          appName: 'employeemkg',  // App identifier for backend
        },
      });

      console.log('📱 API Response:', response.data);
      console.log('📱 Update Available:', response.data?.updateAvailable);
      
      return response.data;
    } catch (error) {
      // Handle 404 gracefully (version check disabled or no config found)
      if (error.response?.status === 404) {
        console.log('ℹ️ Version check: No active version configuration (disabled or not found)');
        return null;
      }
      
      // Log other errors
      console.error('❌ Version check API error:', error.message);
      console.error('❌ Error status:', error.response?.status);
      return null;
    }
  }

  async openStore(storeUrl) {
    let url = storeUrl;
    
    // If no storeUrl provided, use defaults
    if (!url) {
      url = Platform.OS === 'ios'
        ? 'https://testflight.apple.com/join/a1eSpfb3' // TestFlight link
        : 'https://play.google.com/store/apps/details?id=com.employeemkg';
    }
    
    console.log('🔗 Opening store URL:', url);
    console.log('📱 Platform:', Platform.OS);
    
    try {
      // For iOS, try TestFlight deep link first, then fallback to App Store
      if (Platform.OS === 'ios') {
        // Try TestFlight deep link
        const testflightUrl = 'https://testflight.apple.com/join/a1eSpfb3';
        
        console.log('🔗 Trying TestFlight link:', testflightUrl);
        const canOpenTestFlight = await Linking.canOpenURL(testflightUrl);
        
        if (canOpenTestFlight) {
          console.log('✅ Opening TestFlight...');
          await Linking.openURL(testflightUrl);
        } else {
          console.log('⚠️ TestFlight not available, using App Store link');
          // Fallback to App Store or provided URL
          await Linking.openURL(url);
        }
      } else {
        // For Android, use Play Store
        console.log('✅ Opening Play Store...');
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error('❌ Error opening URL:', err);
      
      // Last resort fallback
      try {
        const fallbackUrl = Platform.OS === 'ios'
          ? 'https://testflight.apple.com/join/a1eSpfb3'
          : 'https://play.google.com/store/apps/details?id=com.employeemkg';
        
        console.log('🔗 Trying fallback URL:', fallbackUrl);
        await Linking.openURL(fallbackUrl);
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
      }
    }
  }

  compareVersions(v1, v2) {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const part1 = v1Parts[i] || 0;
      const part2 = v2Parts[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }
}

export default new VersionCheckService();
