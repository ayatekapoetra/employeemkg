import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export class DeviceService {
  static async getDeviceId() {
    try {
      if (Platform.OS === 'android') {
        const androidId = await Application.getAndroidId();
        return androidId || 'unknown-android';
      } else {
        const iosId = await Application.getIosIdForVendorAsync();
        return iosId || 'unknown-ios';
      }
    } catch (error) {
      console.error('Error getting device ID:', error);
      return 'unknown-device';
    }
  }

  static getDeviceInfo() {
    try {
      return {
        brand: Device.brand,
        modelName: Device.modelName,
        modelId: Device.modelId,
        osName: Device.osName,
        osVersion: Device.osVersion,
        osBuildId: Device.osBuildId,
        deviceName: Device.deviceName,
        deviceType: Device.deviceType,
        manufacturer: Device.manufacturer,
        productName: Device.productName,
        isDevice: Device.isDevice,
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {};
    }
  }

  static getAppInfo() {
    try {
      return {
        version: Application.nativeApplicationVersion,
        buildNumber: Application.nativeBuildVersion,
        bundleId: Application.applicationId,
        appName: Application.applicationName,
      };
    } catch (error) {
      console.error('Error getting app info:', error);
      return {};
    }
  }

  static getAllInfo() {
    return {
      device: this.getDeviceInfo(),
      app: this.getAppInfo(),
    };
  }
}
