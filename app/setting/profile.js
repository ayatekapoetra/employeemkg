import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { VStack, HStack, Text, Center, Avatar, Badge, Divider, Spinner } from 'native-base';
import { AppScreen } from '../../src/components/common';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Building, 
  Calendar, 
  Location,
  Call,
  Sms,
  Card,
  Shield,
  Edit,
  Cake,
  Bank,
  Home,
  Global,
  StatusUp,
  Man,
  Woman,
  Teacher
} from 'iconsax-react-native';
import { COLORS } from '../../src/constants/colors';
import apiClient from '../../src/services/api/client';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

export default function ProfileScreen() {
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const userAuth = useSelector(state => state.auth)?.user || {};
  const karyawan = useSelector(state => state.auth)?.karyawan || {};
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Combine data from userAuth and karyawan
      const combinedData = {
        // Data dari karyawan (prioritas utama)
        id: karyawan?.id || userAuth?.id,
        nama: karyawan?.nama || userAuth?.karyawan?.nama || userAuth?.username || 'User',
        nik: karyawan?.nik || userAuth?.nik || '-', // NIK = Nomor Induk Karyawan
        pin: karyawan?.pin || userAuth?.karyawan?.pin || '-',
        ktp: karyawan?.ktp || userAuth?.ktp || '-', // KTP = Nomor Induk Kependudukan
        email: karyawan?.email || userAuth?.email || '-',
        phone: karyawan?.phone || userAuth?.karyawan?.phone || userAuth?.phone || '-',
        
        // Data pekerjaan
        section: karyawan?.section || userAuth?.karyawan?.section || '-',
        jabatan: karyawan?.jabatan || userAuth?.jabatan || '-',
        divisi: karyawan?.divisi || userAuth?.divisi || '-',
        
        // Data lokasi
        cabang_id: karyawan?.cabang_id || userAuth?.karyawan?.cabang_id || userAuth?.cabang_id,
        cabang: karyawan?.cabang?.nama || userAuth?.karyawan?.cabang?.nama || userAuth?.cabang?.nama || '-',
        area: karyawan?.cabang?.area || karyawan?.area || userAuth?.karyawan?.area || userAuth?.area || '-',
        bisnis: karyawan?.bisnis?.nama || userAuth?.bisnis?.nama || '-',
        
        // Data alamat
        alamat: karyawan?.alamat || userAuth?.alamat || '-',
        t4_lahir: karyawan?.t4_lahir || userAuth?.t4_lahir || '-', // Tempat Lahir
        kota: karyawan?.kota || userAuth?.kota || '-',
        provinsi: karyawan?.provinsi || userAuth?.provinsi || '-',
        kode_pos: karyawan?.kode_pos || userAuth?.kode_pos || '-',
        
        // Data tanggal
        tgl_lahir: karyawan?.tgl_lahir || userAuth?.tgl_lahir || null,
        tgl_gabung: karyawan?.tgl_gabung || userAuth?.tgl_gabung || userAuth?.created_at || null, // Join Date
        
        // Data lainnya
        usertype: userAuth?.usertype || 'user',
        status_karyawan: karyawan?.status || 'Aktif',
        jenis_kelamin: karyawan?.jenis_kelamin || userAuth?.jenis_kelamin || '-',
        pendidikan: karyawan?.pendidikan || userAuth?.pendidikan || '-',
        
        // Data bank (jika ada)
        bank_name: karyawan?.bank_name || userAuth?.bank_name || '-',
        bank_account: karyawan?.bank_account || userAuth?.bank_account || '-',
        bank_account_name: karyawan?.bank_account_name || userAuth?.bank_account_name || '-',
        
        // Foto
        foto: karyawan?.foto || userAuth?.foto || null,
      };
      
      console.log('Profile Data:', combinedData);
      setProfileData(combinedData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const getRoleBadge = (usertype) => {
    const roleConfig = {
      developer: { label: 'Developer', color: '#8b5cf6', bg: '#f3e8ff' },
      administrator: { label: 'Administrator', color: '#ef4444', bg: '#fee2e2' },
      direktur: { label: 'Direktur', color: '#f59e0b', bg: '#fef3c7' },
      wadir: { label: 'Wakil Direktur', color: '#f97316', bg: '#ffedd5' },
      keuangan: { label: 'Keuangan', color: '#10b981', bg: '#d1fae5' },
      hrd: { label: 'HRD', color: '#06b6d4', bg: '#cffafe' },
      logistik: { label: 'Logistik', color: '#6366f1', bg: '#e0e7ff' },
      pjo: { label: 'PJO', color: '#ec4899', bg: '#fce7f3' },
      default: { label: 'Staff', color: '#6b7280', bg: '#f3f4f6' }
    };

    const config = roleConfig[usertype] || roleConfig.default;

    return (
      <Badge
        bg={mode === 'dark' ? config.color + '30' : config.bg}
        _text={{ 
          color: config.color, 
          fontSize: 11, 
          fontFamily: 'Quicksand-SemiBold' 
        }}
        rounded="full"
        px={3}
        py={1}
      >
        {config.label}
      </Badge>
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <HStack
      p={4}
      bg={cardBg}
      rounded="xl"
      borderWidth={1}
      borderColor={borderColor}
      alignItems="center"
      space={3}
    >
      <Center
        w={10}
        h={10}
        bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
        rounded="lg"
      >
        {icon}
      </Center>
      <VStack flex={1}>
        <Text
          fontSize="xs"
          fontFamily="Poppins-Light"
          color={subtitleColor}
        >
          {label}
        </Text>
        <Text
          fontSize="sm"
          fontFamily="Quicksand-SemiBold"
          color={textColor}
        >
          {value || '-'}
        </Text>
      </VStack>
    </HStack>
  );

  if (loading && !profileData) {
    return (
      <AppScreen>
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
              Profile Saya
            </Text>
          </HStack>
          <Center flex={1}>
            <Spinner size="lg" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
            <Text mt={4} fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
              Memuat profile...
            </Text>
          </Center>
        </VStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor} flex={1}>
            Profile Saya
          </Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to edit profile
              alert('Edit profile coming soon!');
            }}
          >
            <Center
              w={10}
              h={10}
              bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
              rounded="full"
            >
              <Edit size={20} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
            </Center>
          </TouchableOpacity>
        </HStack>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          <VStack space={4} p={4}>
            {/* Hero Section with Illustration */}
            <VStack
              bg={mode === 'dark' ? '#1e3a8a' : '#3b82f6'}
              rounded="2xl"
              overflow="hidden"
              shadow={3}
            >
              <HStack p={6} alignItems="center" justifyContent="space-between">
                <VStack flex={1} space={2}>
                  <Text
                    fontSize="2xl"
                    fontFamily="Quicksand-Bold"
                    color="#ffffff"
                  >
                    {profileData?.nama}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontFamily="Poppins-Light"
                    color="#ffffff"
                    opacity={0.9}
                  >
                    {profileData?.jabatan}
                  </Text>
                  {getRoleBadge(profileData?.usertype)}
                </VStack>
                <Image
                  source={require('../../assets/images/employee.png')}
                  style={{ 
                    width: 120, 
                    height: 120,
                    resizeMode: 'contain'
                  }}
                />
              </HStack>
            </VStack>

            {/* Personal Information */}
            <VStack space={3}>
              <Text
                fontSize="md"
                fontFamily="Quicksand-Bold"
                color={textColor}
              >
                Informasi Personal
              </Text>

              <InfoRow
                icon={<User size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="Nama Lengkap"
                value={profileData?.nama}
              />

              <InfoRow
                icon={<Card size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="NIK (Nomor Induk Karyawan)"
                value={profileData?.nik}
              />

              {profileData?.ktp && profileData?.ktp !== '-' && (
                <InfoRow
                  icon={<Card size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="No. KTP (Nomor Induk Kependudukan)"
                  value={profileData?.ktp}
                />
              )}

              {profileData?.pin && profileData?.pin !== '-' && (
                <InfoRow
                  icon={<Card size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="PIN"
                  value={profileData?.pin}
                />
              )}

              {profileData?.jenis_kelamin && profileData?.jenis_kelamin !== '-' && (
                <InfoRow
                  icon={profileData?.jenis_kelamin?.toLowerCase() === 'l' || profileData?.jenis_kelamin?.toLowerCase() === 'laki-laki' ? 
                    <Man size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} /> : 
                    <Woman size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
                  }
                  label="Jenis Kelamin"
                  value={profileData?.jenis_kelamin === 'L' ? 'Laki-laki' : profileData?.jenis_kelamin === 'P' ? 'Perempuan' : profileData?.jenis_kelamin}
                />
              )}

              {profileData?.t4_lahir && profileData?.t4_lahir !== '-' && (
                <InfoRow
                  icon={<Location size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Tempat Lahir"
                  value={profileData?.t4_lahir}
                />
              )}

              {profileData?.tgl_lahir && (
                <InfoRow
                  icon={<Cake size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Tanggal Lahir"
                  value={moment(profileData?.tgl_lahir).format('DD MMMM YYYY')}
                />
              )}

              {profileData?.pendidikan && profileData?.pendidikan !== '-' && (
                <InfoRow
                  icon={<Teacher size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Pendidikan Terakhir"
                  value={profileData?.pendidikan}
                />
              )}

              <InfoRow
                icon={<Shield size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="Role / Hak Akses"
                value={profileData?.usertype?.toUpperCase()}
              />
            </VStack>

            {/* Contact Information */}
            <VStack space={3}>
              <Text
                fontSize="md"
                fontFamily="Quicksand-Bold"
                color={textColor}
              >
                Informasi Kontak
              </Text>

              {profileData?.email && profileData?.email !== '-' && (
                <InfoRow
                  icon={<Sms size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Email"
                  value={profileData?.email}
                />
              )}

              <InfoRow
                icon={<Call size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="No. Telepon"
                value={profileData?.phone}
              />

              <InfoRow
                icon={<Home size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="Alamat Lengkap"
                value={profileData?.alamat}
              />

              {profileData?.kota && profileData?.kota !== '-' && (
                <InfoRow
                  icon={<Location size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Kota"
                  value={profileData?.kota}
                />
              )}

              {profileData?.provinsi && profileData?.provinsi !== '-' && (
                <InfoRow
                  icon={<Global size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Provinsi"
                  value={profileData?.provinsi}
                />
              )}

              {profileData?.kode_pos && profileData?.kode_pos !== '-' && (
                <InfoRow
                  icon={<Location size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Kode Pos"
                  value={profileData?.kode_pos}
                />
              )}
            </VStack>

            {/* Work Information */}
            <VStack space={3}>
              <Text
                fontSize="md"
                fontFamily="Quicksand-Bold"
                color={textColor}
              >
                Informasi Pekerjaan
              </Text>

              {profileData?.jabatan && profileData?.jabatan !== '-' && (
                <InfoRow
                  icon={<Briefcase size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Jabatan"
                  value={profileData?.jabatan}
                />
              )}

              {profileData?.section && profileData?.section !== '-' && (
                <InfoRow
                  icon={<Building size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Section / Bagian"
                  value={profileData?.section}
                />
              )}

              {profileData?.divisi && profileData?.divisi !== '-' && (
                <InfoRow
                  icon={<Building size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Divisi"
                  value={profileData?.divisi}
                />
              )}

              <InfoRow
                icon={<Building size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="Cabang"
                value={profileData?.cabang}
              />

              {profileData?.area && profileData?.area !== '-' && (
                <InfoRow
                  icon={<Location size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Area"
                  value={profileData?.area}
                />
              )}

              {profileData?.bisnis && profileData?.bisnis !== '-' && (
                <InfoRow
                  icon={<Building size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Unit Bisnis"
                  value={profileData?.bisnis}
                />
              )}

              <InfoRow
                icon={<StatusUp size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                label="Status Karyawan"
                value={profileData?.status_karyawan}
              />

              {profileData?.tgl_gabung && (
                <InfoRow
                  icon={<Calendar size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Bergabung Sejak"
                  value={moment(profileData?.tgl_gabung).format('DD MMMM YYYY')}
                />
              )}
            </VStack>

            {/* Bank Information - Only show if data exists */}
            {(profileData?.bank_name && profileData?.bank_name !== '-') && (
              <VStack space={3}>
                <Text
                  fontSize="md"
                  fontFamily="Quicksand-Bold"
                  color={textColor}
                >
                  Informasi Rekening Bank
                </Text>

                <InfoRow
                  icon={<Bank size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                  label="Nama Bank"
                  value={profileData?.bank_name}
                />

                {profileData?.bank_account && profileData?.bank_account !== '-' && (
                  <InfoRow
                    icon={<Card size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                    label="No. Rekening"
                    value={profileData?.bank_account}
                  />
                )}

                {profileData?.bank_account_name && profileData?.bank_account_name !== '-' && (
                  <InfoRow
                    icon={<User size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />}
                    label="Atas Nama"
                    value={profileData?.bank_account_name}
                  />
                )}
              </VStack>
            )}

            {/* Bottom Spacing */}
            <VStack h={6} />
          </VStack>
        </ScrollView>
      </VStack>
    </AppScreen>
  );
}
