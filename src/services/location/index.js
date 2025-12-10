import * as Location from 'expo-location';
import { Platform } from 'react-native';

export class LocationService {
  static async getCurrentLocation() {
    try {
      console.log('📍 LocationService: Requesting permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();

      console.log('📍 Permission status:', status);
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      console.log('📍 Getting current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      console.log('✅ Location retrieved:', {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('❌ LocationService error:', error.message);
      
      // For iOS Simulator, provide helpful error message
      if (Platform.OS === 'ios' && __DEV__) {
        console.warn('💡 iOS Simulator: Set location via Features → Location → Custom Location');
        console.warn('💡 Or use script: ./set-simulator-location.sh kopi-kebun');
      }
      
      throw error;
    }
  }

  static async getLocationAddress(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        return addresses[0];
      }

      return null;
    } catch (error) {
      console.error('Error getting location address:', error);
      return null;
    }
  }

  static async watchPosition(callback) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (location) => {
          const position = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };
          callback(position);
        }
      );
    } catch (error) {
      console.error('Error watching position:', error);
      throw error;
    }
  }
}
