import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';

export class PermissionService {
  static async requestCamera() {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  static async checkCamera() {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === 'granted';
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
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  static async checkMediaLibrary() {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return false;
    }
  }

  static async checkAllPermissions() {
    try {
      const [camera, location, media] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
        MediaLibrary.getPermissionsAsync(),
      ]);

      return {
        camera: camera.granted,
        location: location.granted,
        media: media.granted,
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
}
