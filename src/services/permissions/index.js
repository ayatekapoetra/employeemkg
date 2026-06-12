import { requestCameraPermissionsAsync } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class PermissionService {
  static async requestCamera() {
    try {
      // Try to request camera permissions using expo-camera
      if (requestCameraPermissionsAsync) {
        const { status } = await requestCameraPermissionsAsync();
        await AsyncStorage.setItem('@camera_permission', status);
        return status === 'granted';
      } else {
        console.warn('⚠️ requestCameraPermissionsAsync not available');
        return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  static async checkCamera() {
    try {
      // Check from storage first
      const storedStatus = await AsyncStorage.getItem('@camera_permission');
      if (storedStatus) {
        return storedStatus === 'granted';
      }

      // Try to check/request camera permissions
      if (requestCameraPermissionsAsync) {
        const { status } = await requestCameraPermissionsAsync();
        await AsyncStorage.setItem('@camera_permission', status);
        return status === 'granted';
      } else {
        console.warn('⚠️ requestCameraPermissionsAsync not available');
        return false;
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  }

  static async requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async checkLocation() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  static async requestMediaLibrary() {
    // Media library permission is not critical for attendance features
    // Camera can capture photos without needing gallery access
    // Skipping to avoid permission errors
    console.log('⏭️ Skipping media library permission (not required)');
    return true; // Return true to avoid blocking app startup
  }

  static async checkMediaLibrary() {
    // Media library permission is optional
    console.log('⏭️ Skipping media library permission check');
    return false; // Not granted, but won't block features
  }

  /**
   * Check all permissions status
   */
  static async checkAllPermissions() {
    try {
      // Check permissions sequentially to avoid issues
      const location = await Location.getForegroundPermissionsAsync();

      // For camera, check from storage only
      const storedCameraStatus = await AsyncStorage.getItem('@camera_permission');
      const cameraGranted = storedCameraStatus === 'granted';

      // Media library is optional, skip check
      const mediaGranted = false;

      return {
        camera: cameraGranted,
        location: location.granted,
        media: mediaGranted,
      };
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return {
        camera: false,
        location: false,
        media: false,
      };
    }
  }

  /**
   * Request all required permissions for the app
   * Should be called on app startup
   * @returns {Promise<Object>} Object with permission status
   */
  static async requestAllPermissions() {
    try {
      console.log('🔐 [PermissionService] Requesting all permissions...');

      // Request permissions sequentially to avoid overwhelming the user
      const permissions = {};

      // Location permission
      try {
        console.log('📍 Requesting location permission...');
        const locationResult = await Location.requestForegroundPermissionsAsync();
        permissions.location = locationResult.status === 'granted';
        console.log(`✅ Location permission: ${permissions.location ? 'GRANTED' : 'DENIED'}`);
      } catch (error) {
        console.error('❌ Location permission error:', error.message);
        permissions.location = false;
      }

      // Camera permission - use try-catch as it might not be available
      try {
        console.log('📷 Requesting camera permission...');
        if (typeof requestCameraPermissionsAsync === 'function') {
          const cameraResult = await requestCameraPermissionsAsync();
          permissions.camera = cameraResult.status === 'granted';
          await AsyncStorage.setItem('@camera_permission', cameraResult.status);
          console.log(`✅ Camera permission: ${permissions.camera ? 'GRANTED' : 'DENIED'}`);
        } else {
          console.warn('⚠️ requestCameraPermissionsAsync not available, skipping');
          permissions.camera = false;
        }
      } catch (error) {
        console.error('❌ Camera permission error:', error.message);
        permissions.camera = false;
      }

      // Media library permission (optional - not critical for attendance)
      // Skip requesting to avoid AUDIO permission error in AndroidManifest
      console.log('🖼️ Skipping media library permission (not required for attendance)');
      permissions.media = false;

      console.log('🔐 [PermissionService] All permissions requested:', permissions);

      return permissions;
    } catch (error) {
      console.error('❌ [PermissionService] Error requesting permissions:', error);
      return {
        location: false,
        camera: false,
        media: false,
      };
    }
  }

  /**
   * Check if all critical permissions are granted
   * @returns {Promise<boolean>} True if all critical permissions granted
   */
  static async areCriticalPermissionsGranted() {
    const permissions = await this.checkAllPermissions();
    // Only Location and Camera are critical for attendance features
    // Media library is optional (camera can capture photos without gallery access)
    return permissions.location && permissions.camera;
  }
}
