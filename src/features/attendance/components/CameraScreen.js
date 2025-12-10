import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Image as RNImage, Platform } from 'react-native';
import { VStack, Text, HStack, Button } from 'native-base';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSelector } from 'react-redux';
import { ArrowLeft2, Camera as CameraIcon, Flash, GalleryAdd } from 'iconsax-react-native';

export default function CameraScreen({ onClose, onCapture, metode = 'in' }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [flash, setFlash] = useState('off');
  const mode = useSelector(state => state.themes).value;

  const backgroundColor = mode === 'dark' ? '#2f313e' : '#F5F5F5';
  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const takePicture = async () => {
    try {
      if (cameraRef.current) {
        const options = {
          quality: 0.7,
          base64: true,
          skipProcessing: false,
        };
        
        const capturedPhoto = await cameraRef.current.takePictureAsync(options);
        console.log('Photo captured:', capturedPhoto.uri);
        setPhoto(capturedPhoto);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const confirmPhoto = () => {
    if (photo) {
      onCapture(photo);
      setPhoto(null);
    }
  };

  const handleClose = () => {
    setPhoto(null);
    onClose();
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text color={textColor}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <VStack space={4} alignItems="center">
          <CameraIcon size={64} color="#b31e02" variant="Bulk" />
          <Text fontSize="lg" fontFamily="Poppins-SemiBold" color={textColor} textAlign="center">
            Izin Kamera Diperlukan
          </Text>
          <Text fontSize="sm" fontFamily="Poppins-Regular" color={textColor} textAlign="center" px={8}>
            Aplikasi memerlukan akses kamera untuk mengambil foto selfie saat checklog
          </Text>
          <Button onPress={requestPermission} bg="error.600" mt={4}>
            <Text color="white" fontFamily="Poppins-SemiBold">
              Berikan Izin Kamera
            </Text>
          </Button>
          <Button variant="ghost" onPress={handleClose} mt={2}>
            <Text color={textColor} fontFamily="Poppins-Regular">
              Batal
            </Text>
          </Button>
        </VStack>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <RNImage source={{ uri: photo.uri }} style={styles.preview} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePhoto} style={styles.headerButton}>
            <ArrowLeft2 size={24} color="#FFF" />
            <Text color="white" fontFamily="Poppins-SemiBold" ml={2}>
              Ulang
            </Text>
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Poppins-SemiBold" color="white">
            Preview Foto
          </Text>
          <View style={{ width: 80 }} />
        </View>

        <View style={styles.bottomControls}>
          <VStack space={3} w="full" px={4}>
            <Button 
              bg="success.600" 
              onPress={confirmPhoto}
              _text={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}
              leftIcon={<GalleryAdd size={24} color="#FFF" variant="Bulk" />}
            >
              Gunakan Foto Ini
            </Button>
            <Button 
              variant="outline" 
              borderColor="white"
              onPress={retakePhoto}
              _text={{ color: 'white', fontFamily: 'Poppins-SemiBold' }}
            >
              Foto Ulang
            </Button>
          </VStack>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        flash={flash}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <ArrowLeft2 size={24} color="#FFF" />
            <Text color="white" fontFamily="Poppins-SemiBold" ml={2}>
              Batal
            </Text>
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Poppins-SemiBold" color="white">
            {metode === 'in' ? 'Check In' : 'Check Out'}
          </Text>
          <TouchableOpacity 
            onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
            style={styles.headerButton}
          >
            <Flash size={24} color={flash === 'on' ? '#f59e0b' : '#FFF'} variant="Bulk" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <VStack alignItems="center" space={4}>
            <Text fontSize="sm" fontFamily="Poppins-Light" color="white" textAlign="center">
              Posisikan wajah Anda di tengah kamera
            </Text>
            
            <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </VStack>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  flipButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
