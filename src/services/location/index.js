import * as Location from 'expo-location';
import { Platform } from 'react-native';

export class LocationService {
  static async getCurrentLocation() {
    try {
      console.log('📍 LocationService: Requesting permissions...');
      
      // Add delay for Android to prevent immediate crash
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();

      console.log('📍 Permission status:', status);
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      console.log('📍 Getting current position...');
      
      // Use lower accuracy for Android to prevent crashes
      const accuracy = Platform.OS === 'android' ? Location.Accuracy.Balanced : Location.Accuracy.High;
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: accuracy,
        timeInterval: 5000,
        distanceInterval: 10,
        // Add timeout for Android
        ...(Platform.OS === 'android' && { 
          maximumAge: 60000, // Accept location up to 1 minute old
        }),
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
      
      // For Android, provide more specific error handling
      if (Platform.OS === 'android') {
        if (error.message.includes('Location services are disabled')) {
          throw new Error('Please enable location services in device settings');
        } else if (error.message.includes('Location permission was denied')) {
          throw new Error('Please grant location permission in app settings');
        } else if (error.message.includes('timeout')) {
          throw new Error('Location request timed out. Please try again');
        }
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
