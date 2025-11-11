import React, { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { VStack, Button, Image, Text, HStack, Center, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PermissionService } from '../../../services';
import { Camera, FlashCircle, RotateLeft } from 'iconsax-react-native';

const CameraScreen = ({ onCapture, onCancel, onClose, facing: initialFacing = 'front' }) => {
  const [facing, setFacing] = useState(initialFacing);
  const [photo, setPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const hasPermission = await PermissionService.checkCamera();
    if (!hasPermission) {
      await requestPermission();
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const result = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        setPhoto(result);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const handleRetake = () => {
    setPhoto(null);
  };

  const handleUsePhoto = () => {
    if (photo && onCapture) {
      onCapture(photo);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <Center flex={1} bg={isDark ? '#2f313e' : '#F5F5F5'}>
        <Text>Checking camera permission...</Text>
      </Center>
    );
  }

  if (!permission.granted) {
    return (
      <Center flex={1} bg={isDark ? '#2f313e' : '#F5F5F5'} px={6}>
        <VStack space={4} alignItems="center">
          <Camera size={64} color={isDark ? '#9a8f90' : '#b31e02'} variant="Bulk" />
          <Text
            fontSize="lg"
            fontFamily="Quicksand-Bold"
            color={isDark ? '#F5F5F5' : '#2f313e'}
            textAlign="center"
          >
            Camera Permission Required
          </Text>
          <Text
            fontSize="sm"
            fontFamily="Poppins-Light"
            color={isDark ? '#9a8f90' : '#666666'}
            textAlign="center"
          >
            We need access to your camera for attendance check-in
          </Text>
          <Button onPress={requestPermission} colorScheme="primary" mt={4}>
            Grant Permission
          </Button>
          {onCancel && (
            <Button variant="ghost" onPress={onCancel}>
              Cancel
            </Button>
          )}
        </VStack>
      </Center>
    );
  }

  if (photo) {
    return (
      <VStack flex={1} bg="black">
        <Image
          source={{ uri: photo.uri }}
          alt="Captured photo"
          flex={1}
          resizeMode="contain"
        />
        <VStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0,0,0,0.7)"
          p={4}
          space={3}
        >
          <HStack space={3}>
            <Button
              flex={1}
              variant="outline"
              onPress={handleRetake}
              colorScheme="light"
            >
              Retake
            </Button>
            <Button
              flex={1}
              onPress={handleUsePhoto}
              colorScheme="success"
            >
              Use Photo
            </Button>
          </HStack>
          {(onCancel || onClose) && (
            <Button variant="ghost" onPress={onCancel || onClose} colorScheme="light">
              Cancel
            </Button>
          )}
        </VStack>
      </VStack>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleCameraFacing}
            >
              <RotateLeft size={32} color="white" variant="Bulk" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            {(onCancel || onClose) && (
              <Button
                variant="ghost"
                onPress={onCancel || onClose}
                colorScheme="light"
                mb={2}
              >
                Cancel
              </Button>
            )}
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <Text
              fontSize="sm"
              color="white"
              fontFamily="Poppins-Light"
              mt={2}
            >
              Tap to capture
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 10,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});

export default CameraScreen;
