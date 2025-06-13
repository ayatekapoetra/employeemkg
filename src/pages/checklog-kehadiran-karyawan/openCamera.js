import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat
} from 'react-native-vision-camera';

const OpenCameraScreen = ( { postCheckIn, postCheckOut, metode } ) => {
    console.log('---------------------\n', metode);
    
  const camera = useRef(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  useEffect(() => {
    const getPermission = async () => {
      if (!hasPermission) {
        const permission = await requestPermission();
        if (!permission) {
          Alert.alert('Permission Denied', 'Camera permission is required');
        }
      }
    };
    
    getPermission();
  }, [hasPermission, requestPermission]);

  const format = useCameraFormat(device, [
        { photoResolution: { width: 1280, height: 720 } }, // HD instead of Full HD
        { photoQualityBalance: 'speed' }, // Prioritize speed over quality
    ])

  const takePicture = async () => {
    try {
      if (camera.current && device) {
        const photo = await camera.current.takePhoto({
          quality: 70,
        });

        if(metode === 'in'){
            postCheckIn(photo, metode)
        }else{
            postCheckOut(photo, metode)
        }

      } else {
        Alert.alert('Error', 'Camera not ready');
      }
    } catch (error) {
      console.error('Take picture error:', error);
      Alert.alert('Error', `Failed to take picture: ${error.message}`);
    }
  };

  // Loading state
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  // No device found
  if (device == null) {
    return (
      <View style={styles.container}>
        <Text>No camera device available</Text>
        <Text>Make sure you're testing on a physical device</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format} // Apply format
        isActive={hasPermission}
        photo={true}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default OpenCameraScreen;