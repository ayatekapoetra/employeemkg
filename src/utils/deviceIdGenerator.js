import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

/**
 * Enhanced Device ID Generator for APP-EMPLOYEE
 * Provides multiple fallback methods for device identification
 * Uses only Expo modules (expo-application, expo-device)
 */
class DeviceIdGenerator {
  constructor() {
    this.cachedDeviceId = null;
  }

  /**
   * Get device ID with multiple fallback methods
   * @returns {Promise<string>} Device ID
   */
  async getDeviceId() {
    // Return cached ID if available
    if (this.cachedDeviceId) {
      return this.cachedDeviceId;
    }

    try {
      let deviceId;

      if (Platform.OS === 'android') {
        deviceId = await this.getAndroidDeviceId();
      } else if (Platform.OS === 'ios') {
        deviceId = await this.getIOSDeviceId();
      } else {
        deviceId = this.getFallbackDeviceId('web');
      }

      this.cachedDeviceId = deviceId;
      console.log('📱 Device ID generated:', deviceId);
      return deviceId;

    } catch (error) {
      console.error('❌ Error getting device ID:', error);
      const fallbackId = this.getErrorDeviceId();
      this.cachedDeviceId = fallbackId;
      return fallbackId;
    }
  }

  /**
   * Get Android device ID with multiple fallbacks
   * @returns {Promise<string>} Android device ID
   */
  async getAndroidDeviceId() {
    // Method 1: Application.getAndroidId() (most reliable for Expo)
    try {
      const androidId = await Application.getAndroidId();
      if (androidId && androidId !== 'unknown' && androidId.length > 5) {
        console.log('📱 Android ID from Application.getAndroidId():', androidId);
        return androidId;
      }
    } catch (e) {
      console.warn('⚠️ Failed to get Android ID from Application:', e.message);
    }

    // Method 2: Device.deviceId (expo-device)
    try {
      const deviceId = Device.deviceId;
      if (deviceId && deviceId !== 'unknown' && deviceId.length > 5) {
        console.log('📱 Android ID from Device.deviceId:', deviceId);
        return deviceId;
      }
    } catch (e) {
      console.warn('⚠️ Failed to get device ID from expo-device:', e.message);
    }

    // Method 3: Using ApplicationId + Device.modelName
    try {
      const appId = Application.applicationId;
      const modelName = Device.modelName;
      if (appId && modelName) {
        const compositeId = `${appId}-${modelName}-${Date.now()}`;
        console.log('📱 Android ID from composite:', compositeId);
        return compositeId;
      }
    } catch (e) {
      console.warn('⚠️ Failed to get composite ID:', e.message);
    }

    // Fallback for Android
    return this.getFallbackDeviceId('android');
  }

  /**
   * Get iOS device ID with multiple fallbacks
   * @returns {Promise<string>} iOS device ID
   */
  async getIOSDeviceId() {
    // Method 1: Application.applicationId + Device.modelName
    try {
      const appId = Application.applicationId;
      const modelName = Device.modelName;

      if (appId && modelName) {
        // For iOS, use a consistent identifier based on app and device
        const compositeId = `${appId}-${modelName}-${Device.platformApiLevel || 'ios'}`;
        console.log('📱 iOS ID from composite:', compositeId);
        return compositeId;
      }
    } catch (e) {
      console.warn('⚠️ Failed to get composite iOS ID:', e.message);
    }

    // Method 2: Device.deviceId (expo-device)
    try {
      const deviceId = Device.deviceId;
      if (deviceId && deviceId !== 'unknown' && deviceId.length > 5) {
        console.log('📱 iOS ID from Device.deviceId:', deviceId);
        return deviceId;
      }
    } catch (e) {
      console.warn('⚠️ Failed to get device ID from expo-device:', e.message);
    }

    // Method 3: Using ApplicationId + manufacturer
    try {
      const appId = Application.applicationId;
      const manufacturer = Device.manufacturer;
      if (appId && manufacturer) {
        const compositeId = `${appId}-${manufacturer}-${Date.now()}`;
        console.log('📱 iOS ID from manufacturer:', compositeId);
        return compositeId;
      }
    } catch (e) {
      console.warn('⚠️ Failed to get manufacturer-based ID:', e.message);
    }

    // Fallback for iOS
    return this.getFallbackDeviceId('ios');
  }

  /**
   * Generate fallback device ID
   * @param {string} platform - Platform name
   * @returns {string} Fallback device ID
   */
  getFallbackDeviceId(platform) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const fallbackId = `mkg-emp-${platform}-${timestamp}-${random}`;
    console.log('📱 Using fallback device ID:', fallbackId);
    return fallbackId;
  }

  /**
   * Generate error device ID
   * @returns {string} Error device ID
   */
  getErrorDeviceId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const errorId = `mkg-emp-error-${timestamp}-${random}`;
    console.warn('📱 Using error device ID:', errorId);
    return errorId;
  }

  /**
   * Reset cached device ID (for testing purposes)
   */
  resetCache() {
    this.cachedDeviceId = null;
    console.log('📱 Device ID cache reset');
  }

  /**
   * Get device info for debugging
   * @returns {Promise<object>} Device info
   */
  async getDeviceInfo() {
    try {
      const info = {
        platform: Platform.OS,
        model: Device.modelName,
        brand: Device.manufacturer,
        deviceName: Device.deviceName,
        deviceYearClass: Device.deviceYearClass,
        osVersion: Device.osVersion,
        appId: Application.applicationId,
        appVersion: Application.nativeApplicationVersion,
        buildNumber: Application.nativeBuildVersion,
        deviceId: await this.getDeviceId()
      };
      return info;
    } catch (error) {
      console.error('❌ Error getting device info:', error);
      return null;
    }
  }
}

export default new DeviceIdGenerator();
