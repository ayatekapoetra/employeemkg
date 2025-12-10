import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView, RefreshControl, Linking, Platform, Alert } from 'react-native';
import { VStack, HStack, Text, Center, Badge, Divider, Switch } from 'native-base';
import { AppScreen } from '../../src/components/common';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Camera,
  Location,
  GalleryAdd,
  Setting2,
  TickCircle,
  CloseCircle,
  InfoCircle,
  Lock1,
  Microphone,
  DocumentText
} from 'iconsax-react-native';
import { COLORS } from '../../src/constants/colors';
import * as ExpoCamera from 'expo-camera';
import * as ExpoLocation from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

export default function PermissionsScreen() {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: { granted: false, canAskAgain: true },
    microphone: { granted: false, canAskAgain: true },
    location: { granted: false, canAskAgain: true },
    mediaLibrary: { granted: false, canAskAgain: true },
    files: { granted: false, canAskAgain: true },
  });

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    try {
      setLoading(true);

      // Check Camera Permission
      const cameraStatus = await ExpoCamera.Camera.getCameraPermissionsAsync();
      
      // Check Microphone Permission
      const microphoneStatus = await ExpoCamera.Camera.getMicrophonePermissionsAsync();
      
      // Check Location Permission
      const locationStatus = await ExpoLocation.getForegroundPermissionsAsync();
      
      // Check Media Library Permission
      const mediaLibraryStatus = await MediaLibrary.getPermissionsAsync();
      
      // Check Files/Media Library Permission (using ImagePicker as proxy for file access)
      const filesStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      setPermissions({
        camera: {
          granted: cameraStatus.granted,
          canAskAgain: cameraStatus.canAskAgain,
          status: cameraStatus.status
        },
        microphone: {
          granted: microphoneStatus.granted,
          canAskAgain: microphoneStatus.canAskAgain,
          status: microphoneStatus.status
        },
        location: {
          granted: locationStatus.granted,
          canAskAgain: locationStatus.canAskAgain,
          status: locationStatus.status
        },
        mediaLibrary: {
          granted: mediaLibraryStatus.granted,
          canAskAgain: mediaLibraryStatus.canAskAgain,
          status: mediaLibraryStatus.status
        },
        files: {
          granted: filesStatus.granted,
          canAskAgain: filesStatus.canAskAgain,
          status: filesStatus.status
        },
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    checkAllPermissions();
  };

  const requestPermission = async (type) => {
    try {
      let result;
      
      switch (type) {
        case 'camera':
          result = await ExpoCamera.Camera.requestCameraPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            camera: { 
              granted: result.granted, 
              canAskAgain: result.canAskAgain,
              status: result.status
            }
          }));
          break;
          
        case 'microphone':
          result = await ExpoCamera.Camera.requestMicrophonePermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            microphone: { 
              granted: result.granted, 
              canAskAgain: result.canAskAgain,
              status: result.status
            }
          }));
          break;
          
        case 'location':
          result = await ExpoLocation.requestForegroundPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            location: { 
              granted: result.granted, 
              canAskAgain: result.canAskAgain,
              status: result.status
            }
          }));
          break;
          
        case 'mediaLibrary':
          result = await MediaLibrary.requestPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            mediaLibrary: { 
              granted: result.granted, 
              canAskAgain: result.canAskAgain,
              status: result.status
            }
          }));
          break;
          
        case 'files':
          result = await ImagePicker.requestMediaLibraryPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            files: { 
              granted: result.granted, 
              canAskAgain: result.canAskAgain,
              status: result.status
            }
          }));
          break;
      }

      if (!result.granted && !result.canAskAgain) {
        Alert.alert(
          'Izin Ditolak Permanen',
          'Izin telah ditolak permanen. Silakan buka Pengaturan untuk mengaktifkan izin ini.',
          [
            { text: 'Batal', style: 'cancel' },
            { text: 'Buka Pengaturan', onPress: openSettings }
          ]
        );
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      Alert.alert('Error', 'Gagal meminta izin. Silakan coba lagi.');
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getStatusBadge = (granted) => {
    if (granted) {
      return (
        <Badge
          bg={mode === 'dark' ? '#064e3b' : '#d1fae5'}
          _text={{ 
            color: mode === 'dark' ? '#10b981' : '#059669',
            fontSize: 11,
            fontFamily: 'Quicksand-SemiBold'
          }}
          rounded="full"
          px={3}
          py={1}
          leftIcon={<TickCircle size={14} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />}
        >
          Diizinkan
        </Badge>
      );
    } else {
      return (
        <Badge
          bg={mode === 'dark' ? '#7f1d1d' : '#fee2e2'}
          _text={{ 
            color: mode === 'dark' ? '#ef4444' : '#dc2626',
            fontSize: 11,
            fontFamily: 'Quicksand-SemiBold'
          }}
          rounded="full"
          px={3}
          py={1}
          leftIcon={<CloseCircle size={14} color={mode === 'dark' ? '#ef4444' : '#dc2626'} variant="Bold" />}
        >
          Ditolak
        </Badge>
      );
    }
  };

  const PermissionCard = ({ icon, title, description, type, permission }) => (
    <VStack
      bg={cardBg}
      p={4}
      rounded="xl"
      borderWidth={1}
      borderColor={borderColor}
      space={3}
    >
      <HStack alignItems="center" space={3}>
        <Center
          w={12}
          h={12}
          bg={permission.granted ? 
            (mode === 'dark' ? '#064e3b' : '#d1fae5') : 
            (mode === 'dark' ? '#374151' : '#f3f4f6')
          }
          rounded="xl"
        >
          {React.cloneElement(icon, { 
            size: 24, 
            color: permission.granted ? 
              (mode === 'dark' ? '#10b981' : '#059669') : 
              subtitleColor,
            variant: 'Bold'
          })}
        </Center>
        <VStack flex={1}>
          <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
            {title}
          </Text>
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} numberOfLines={2}>
            {description}
          </Text>
        </VStack>
      </HStack>

      <Divider />

      <HStack justifyContent="space-between" alignItems="center">
        {getStatusBadge(permission.granted)}
        
        {!permission.granted && (
          <TouchableOpacity
            onPress={() => requestPermission(type)}
            style={{
              backgroundColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text fontSize="xs" fontFamily="Quicksand-Bold" color="#ffffff">
              Minta Izin
            </Text>
          </TouchableOpacity>
        )}
      </HStack>

      {!permission.canAskAgain && !permission.granted && (
        <VStack
          bg={mode === 'dark' ? '#78350f' : '#fef3c7'}
          p={3}
          rounded="lg"
          borderWidth={1}
          borderColor={mode === 'dark' ? '#f59e0b' : '#fbbf24'}
        >
          <HStack space={2} alignItems="flex-start">
            <Lock1 size={16} color={mode === 'dark' ? '#fbbf24' : '#d97706'} />
            <VStack flex={1}>
              <Text 
                fontSize="xs" 
                fontFamily="Quicksand-SemiBold" 
                color={mode === 'dark' ? '#fbbf24' : '#92400e'}
              >
                Izin Ditolak Permanen
              </Text>
              <Text 
                fontSize="xs" 
                fontFamily="Poppins-Light" 
                color={mode === 'dark' ? '#fcd34d' : '#b45309'}
                mt={1}
              >
                Silakan buka Pengaturan untuk mengaktifkan izin ini
              </Text>
              <TouchableOpacity
                onPress={openSettings}
                style={{
                  backgroundColor: mode === 'dark' ? '#f59e0b' : '#d97706',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  marginTop: 8,
                  alignSelf: 'flex-start'
                }}
              >
                <Text fontSize="xs" fontFamily="Quicksand-Bold" color="#ffffff">
                  Buka Pengaturan
                </Text>
              </TouchableOpacity>
            </VStack>
          </HStack>
        </VStack>
      )}
    </VStack>
  );

  const grantedCount = Object.values(permissions).filter(p => p.granted).length;
  const totalCount = Object.keys(permissions).length;
  const percentage = Math.round((grantedCount / totalCount) * 100);

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        {/* Header */}
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
            Izin Aplikasi
          </Text>
        </HStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          <VStack space={4} p={4}>
            {/* Summary Card */}
            <VStack
              bg={mode === 'dark' ? '#1e3a8a' : '#3b82f6'}
              p={5}
              rounded="2xl"
              space={4}
            >
              <HStack alignItems="center" justifyContent="space-between">
                <VStack flex={1}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
                    Status Izin Aplikasi
                  </Text>
                  <HStack alignItems="baseline" space={1} mt={1}>
                    <Text fontSize="4xl" fontFamily="Quicksand-Bold" color="#ffffff">
                      {grantedCount}
                    </Text>
                    <Text fontSize="xl" fontFamily="Poppins-Light" color="#ffffff" opacity={0.9}>
                      / {totalCount}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color="#ffffff" opacity={0.8}>
                    Izin aktif
                  </Text>
                </VStack>
                <Center
                  w={20}
                  h={20}
                  bg="rgba(255,255,255,0.2)"
                  rounded="full"
                >
                  <Text fontSize="2xl" fontFamily="Quicksand-Bold" color="#ffffff">
                    {percentage}%
                  </Text>
                </Center>
              </HStack>

              {/* Progress Bar */}
              <VStack space={2}>
                <HStack 
                  h={2} 
                  bg="rgba(255,255,255,0.2)" 
                  rounded="full"
                  overflow="hidden"
                >
                  <VStack
                    w={`${percentage}%`}
                    bg="#ffffff"
                    rounded="full"
                  />
                </HStack>
              </VStack>
            </VStack>

            {/* Info Banner */}
            <VStack
              bg={mode === 'dark' ? '#064e3b' : '#d1fae5'}
              p={4}
              rounded="xl"
              borderWidth={1}
              borderColor={mode === 'dark' ? '#10b981' : '#6ee7b7'}
            >
              <HStack space={3} alignItems="flex-start">
                <InfoCircle 
                  size={20} 
                  color={mode === 'dark' ? '#6ee7b7' : '#059669'} 
                  variant="Bold" 
                />
                <VStack flex={1}>
                  <Text
                    fontSize="sm"
                    fontFamily="Quicksand-Bold"
                    color={mode === 'dark' ? '#6ee7b7' : '#065f46'}
                  >
                    Mengapa Aplikasi Membutuhkan Izin?
                  </Text>
                  <Text
                    fontSize="xs"
                    fontFamily="Poppins-Light"
                    color={mode === 'dark' ? '#a7f3d0' : '#047857'}
                    mt={1}
                    lineHeight={18}
                  >
                    Aplikasi memerlukan izin untuk mengakses fitur-fitur perangkat Anda agar dapat berfungsi dengan optimal. Anda dapat mengatur izin sesuai kebutuhan.
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Permissions List */}
            <VStack space={3}>
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                Daftar Izin
              </Text>

              <PermissionCard
                icon={<Camera />}
                title="Kamera"
                description="Untuk mengambil foto selfie saat absensi dan upload dokumen"
                type="camera"
                permission={permissions.camera}
              />

              <PermissionCard
                icon={<Microphone />}
                title="Mikrofon"
                description="Untuk merekam suara saat video conference atau voice notes"
                type="microphone"
                permission={permissions.microphone}
              />

              <PermissionCard
                icon={<Location />}
                title="Lokasi"
                description="Untuk memverifikasi lokasi saat melakukan absensi"
                type="location"
                permission={permissions.location}
              />

              <PermissionCard
                icon={<GalleryAdd />}
                title="Galeri & Media"
                description="Untuk upload foto dari galeri dan menyimpan dokumen"
                type="mediaLibrary"
                permission={permissions.mediaLibrary}
              />

              <PermissionCard
                icon={<DocumentText />}
                title="File & Dokumen"
                description="Untuk akses dan upload file dokumen dari penyimpanan perangkat"
                type="files"
                permission={permissions.files}
              />
            </VStack>

            {/* Action Card */}
            <VStack
              bg={cardBg}
              p={4}
              rounded="xl"
              borderWidth={1}
              borderColor={borderColor}
              space={3}
            >
              <HStack space={3} alignItems="center">
                <Setting2 size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
                <VStack flex={1}>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                    Pengaturan Sistem
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Kelola semua izin dari pengaturan perangkat
                  </Text>
                </VStack>
              </HStack>
              <TouchableOpacity
                onPress={openSettings}
                style={{
                  backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: borderColor
                }}
              >
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  Buka Pengaturan Perangkat
                </Text>
              </TouchableOpacity>
            </VStack>

            {/* Bottom Spacing */}
            <VStack h={6} />
          </VStack>
        </ScrollView>
      </VStack>
    </AppScreen>
  );
}
