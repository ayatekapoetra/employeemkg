import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VStack, HStack, ScrollView, Text, Pressable, Center, useToast, Divider } from 'native-base';
import { Spinner } from 'native-base';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import { 
  Calendar, 
  Clock, 
  User, 
  TickCircle, 
  CloseCircle, 
  TruckFast, 
  Location,
  Activity,
  DocumentText,
  Speedometer,
  Timer1,
  Image as ImageIcon,
  ArrowRight,
  BoxTime
} from 'iconsax-react-native';
import { View, Dimensions, Image, TouchableOpacity, Modal as RNModal, StyleSheet } from 'react-native';
import moment from 'moment';
import 'moment/locale/id';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';
import { LinearGradient } from 'expo-linear-gradient';
import ImageView from 'react-native-image-viewing';

moment.locale('id');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TimesheetDetail() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [timesheet, setTimesheet] = useState(null);
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    if (params.id) {
      fetchTimesheetDetail();
    }
  }, [params.id]);

  const fetchTimesheetDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching timesheet detail, ID:', params.id);

      const response = await apiClient.get(API_ENDPOINTS.TIMESHEET.DETAIL(params.id));

      // Data is directly in response.data.rows (not nested)
      const data = response.data?.rows || response.data?.data || response.data;

      console.log('DATA----', data);


      if (!data || !data.id) {
        console.error('❌ Invalid data structure - no ID found');
        throw new Error('Data timesheet tidak valid');
      }

      setTimesheet(data);
    } catch (error) {
      console.error('❌ Error fetching timesheet detail:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.show({
        description: error.message || 'Gagal memuat detail timesheet',
        duration: 3000,
        bg: 'red.500',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setApproveModalVisible(true);
  };

  const confirmApprove = async () => {
    try {
      setActionLoading(true);
      setApproveModalVisible(false);
      console.log('✅ Approving timesheet:', params.id);

      // Backend doesn't require body - it gets karyawan from authenticated user
      await apiClient.put(API_ENDPOINTS.TIMESHEET.APPROVE(params.id));

      toast.show({
        description: 'Timesheet berhasil disetujui',
        duration: 2000,
        bg: 'green.500',
      });

      router.back();
    } catch (error) {
      console.error('❌ Error approving timesheet:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.show({
        description: error.response?.data?.diagnostic?.message || error.response?.data?.message || 'Gagal menyetujui timesheet',
        duration: 3000,
        bg: 'red.500',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    try {
      setActionLoading(true);
      setRejectModalVisible(false);
      console.log('❌ Rejecting timesheet:', params.id);

      // Backend doesn't require body - it gets karyawan from authenticated user
      await apiClient.put(API_ENDPOINTS.TIMESHEET.REJECT(params.id));

      toast.show({
        description: 'Timesheet ditolak, operator akan memperbaiki',
        duration: 2000,
        bg: 'orange.500',
      });

      router.back();
    } catch (error) {
      console.error('❌ Error rejecting timesheet:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.show({
        description: error.response?.data?.diagnostic?.message || error.response?.data?.message || 'Gagal menolak timesheet',
        duration: 3000,
        bg: 'red.500',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const calculateDuration = () => {
    // Try to use pre-calculated duration first
    if (timesheet?.durasi) {
      return timesheet.durasi;
    }

    // Fallback to calculation
    if (!timesheet?.starttime || !timesheet?.endtime) return '0.0';
    const start = moment(timesheet.starttime);
    const end = moment(timesheet.endtime);
    const duration = moment.duration(end.diff(start));
    return duration.asHours().toFixed(1);
  };

  const getActivityDuration = () => {
    // Calculate total duration from all activities
    if (!timesheet?.kegiatan || timesheet.kegiatan.length === 0) {
      return calculateDuration();
    }

    let totalHours = 0;
    timesheet.kegiatan.forEach(item => {
      // Use timetot if available (pre-calculated in hours)
      if (item.timetot) {
        totalHours += parseFloat(item.timetot);
      } else if (item.starttime && item.endtime) {
        // Calculate from starttime and endtime (format: 'YYYY-MM-DD HH:mm')
        const start = moment(item.starttime);
        const end = moment(item.endtime);
        const diff = moment.duration(end.diff(start));
        totalHours += diff.asHours();
      }
    });

    return totalHours > 0 ? totalHours.toFixed(1) : calculateDuration();
  };

  const getStatusBadge = () => {
    const status = timesheet?.status;
    if (status === 'W') {
      return { label: 'MENUNGGU', color: 'rgba(251, 146, 60, 0.2)', textColor: '#fb923c' };
    } else if (status === 'A') {
      return { label: 'DISETUJUI', color: 'rgba(16, 185, 129, 0.2)', textColor: '#10b981' };
    } else if (status === 'R') {
      return { label: 'DITOLAK', color: 'rgba(239, 68, 68, 0.2)', textColor: '#ef4444' };
    }
    return { label: 'PENDING', color: 'rgba(251, 146, 60, 0.2)', textColor: '#fb923c' };
  };

  const InfoCard = ({ icon: Icon, label, value, iconColor, gradientColors }) => (
    <VStack
      bg={cardBg}
      p={4}
      rounded="xl"
      borderWidth={1}
      borderColor={cardBorder}
      flex={1}
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <HStack space={3} alignItems="center">
        <LinearGradient
          colors={gradientColors || [iconColor, iconColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Icon size={20} color="#ffffff" variant="Bold" />
        </LinearGradient>
        <VStack flex={1}>
          <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
            {label}
          </Text>
          <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor} numberOfLines={2}>
            {value}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );

  const SectionHeader = ({ title, icon: Icon, count }) => (
    <HStack space={2} alignItems="center" mb={3} justifyContent="space-between">
      <HStack space={2} alignItems="center">
        <Icon size={20} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} variant="Bold" />
        <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
          {title}
        </Text>
      </HStack>
      {count !== undefined && (
        <View
          style={{
            backgroundColor: mode === 'dark' ? '#3b82f6' : '#2563eb',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text fontSize="xs" fontFamily="Quicksand-Bold" color="#ffffff">
            {count} kegiatan
          </Text>
        </View>
      )}
    </HStack>
  );

  const ActivityDetailItem = ({ item, index }) => {
    // Time handling - backend uses starttime & endtime with format 'YYYY-MM-DD HH:mm'
    const timeIn = item.starttime;
    const timeOut = item.endtime;
    const hasTime = timeIn && timeOut;

    // Parse as full datetime, then format to HH:mm
    const formattedTimeIn = hasTime ? moment(timeIn).format('HH:mm') : '-';
    const formattedTimeOut = hasTime ? moment(timeOut).format('HH:mm') : '-';

    // Calculate duration
    let duration = '-';
    if (item.timetot) {
      // Use pre-calculated duration (in hours, decimal format)
      const hours = parseFloat(item.timetot);
      duration = `${hours.toFixed(2)} jam`;
    } else if (hasTime) {
      const start = moment(timeIn);
      const end = moment(timeOut);
      const diff = moment.duration(end.diff(start));
      const hours = diff.asHours();
      duration = `${hours.toFixed(2)} jam`;
    }

    // SMU/HM values - ensure they're numbers
    const smuStart = Number(item.smustart) || 0;
    const smuFinish = Number(item.smufinish) || 0;
    const usedSmu = Number(item.usedsmu) || (smuFinish - smuStart) || 0;

    return (
      <VStack
        bg={mode === 'dark' ? '#374151' : '#f9fafb'}
        p={4}
        rounded="xl"
        borderWidth={1}
        borderColor={cardBorder}
        mb={3}
        space={3}
      >
        {/* Header with activity name */}
        <VStack space={1}>
          <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
            {item.kegiatan?.nama || 'Kegiatan Tidak Diketahui'}
          </Text>
          {item.material?.nama && (
            <HStack space={1} alignItems="center">
              <DocumentText size={12} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} numberOfLines={1} flex={1}>
                {item.material.nama}
              </Text>
            </HStack>
          )}
        </VStack>

        <Divider bg={cardBorder} />

        {/* Location Info - Horizontal Layout */}
        <HStack space={2} alignItems="center">
          {/* Lokasi Awal */}
          <HStack space={2} alignItems="center" flex={1}>
            <View
              style={{
                backgroundColor: mode === 'dark' ? '#065f46' : '#d1fae5',
                padding: 6,
                borderRadius: 8,
              }}
            >
              <Location size={14} color={mode === 'dark' ? '#6ee7b7' : '#059669'} variant="Bold" />
            </View>
            <VStack flex={1}>
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Lokasi Awal
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-Bold" color={textColor} numberOfLines={1}>
                {item.lokasi?.nama || '-'}
              </Text>
            </VStack>
          </HStack>

          {/* Arrow */}
          <ArrowRight size={20} color={subtitleColor} />

          {/* Lokasi Tujuan */}
          <HStack space={2} alignItems="center" flex={1}>
            <View
              style={{
                backgroundColor: mode === 'dark' ? '#991b1b' : '#fee2e2',
                padding: 6,
                borderRadius: 8,
              }}
            >
              <Location size={14} color={mode === 'dark' ? '#fca5a5' : '#dc2626'} variant="Bold" />
            </View>
            <VStack flex={1}>
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Lokasi Tujuan
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-Bold" color={textColor} numberOfLines={1}>
                {item.lokasiTujuan?.nama || '-'}
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Time Frame & SMU/HM Info */}
        <Divider bg={cardBorder} />

        {/* Time Information */}
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center">
              <Clock size={14} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Waktu Mulai
              </Text>
            </HStack>
            <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
              {formattedTimeIn}
            </Text>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center">
              <Clock size={14} color={subtitleColor} />
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Waktu Selesai
              </Text>
            </HStack>
            <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
              {formattedTimeOut}
            </Text>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center">
              <BoxTime size={14} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} variant="Bold" />
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Durasi
              </Text>
            </HStack>
            <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'}>
              {duration}
            </Text>
          </HStack>
        </VStack>

        {/* SMU/HM Information - Only show HM/KM values if they exist */}
        {(smuStart > 0 || smuFinish > 0) && (
          <>
            <Divider bg={cardBorder} />
            <VStack space={2}>
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Speedometer size={14} color={subtitleColor} />
                  <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                    {timesheet?.equipment?.kategori === 'HE' ? 'HM' : 'KM'} Awal
                  </Text>
                </HStack>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {smuStart.toFixed(2)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Speedometer size={14} color={subtitleColor} />
                  <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                    {timesheet?.equipment?.kategori === 'HE' ? 'HM' : 'KM'} Akhir
                  </Text>
                </HStack>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {smuFinish.toFixed(2)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Speedometer size={14} color={mode === 'dark' ? '#8b5cf6' : '#7c3aed'} variant="Bold" />
                  <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                    Pemakaian
                  </Text>
                </HStack>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#a78bfa' : '#8b5cf6'}>
                  {usedSmu.toFixed(2)} {timesheet?.equipment?.kategori === 'HE' ? 'HM' : 'KM'}
                </Text>
              </HStack>
            </VStack>
          </>
        )}

        {/* Seq and Ritase - Always show regardless of SMU values */}
        <Divider bg={cardBorder} />
        <HStack space={3} justifyContent="space-around" alignItems="center">
          {/* Sequence */}
          <VStack alignItems="center" flex={1} bg={mode === 'dark' ? '#1e293b' : '#f1f5f9'} py={2} rounded="lg">
            <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
              Sequence
            </Text>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'}>
              #{item.seq || index + 1}
            </Text>
          </VStack>

          {/* Ritase */}
          <VStack alignItems="center" flex={1} bg={mode === 'dark' ? '#1e293b' : '#f1f5f9'} py={2} rounded="lg">
            <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
              Ritase
            </Text>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#8b5cf6' : '#7c3aed'}>
              {item.ritase || index + 1}
            </Text>
          </VStack>
        </HStack>

        {/* Additional Info */}
        {item.keterangan && (
          <>
            <Divider bg={cardBorder} />
            <VStack space={1}>
              <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                Catatan
              </Text>
              <Text fontSize="sm" fontFamily="Poppins-Light" color={textColor}>
                {item.keterangan}
              </Text>
            </VStack>
          </>
        )}
      </VStack>
    );
  };

  if (loading) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Detail Timesheet" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1}>
          <LoadingHauler
            message="Memuat detail timesheet..."
            subMessage="Mengambil data lengkap timesheet"
            type="default"
          />
        </Center>
      </AppScreen>
    );
  }

  if (!timesheet) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Detail Timesheet" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1} px={6}>
          <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
            Data timesheet tidak ditemukan
          </Text>
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center" mt={2}>
            ID: {params.id}
          </Text>
        </Center>
      </AppScreen>
    );
  }

  const statusBadge = getStatusBadge();

  return (
    <AppScreen>
      <HeaderScreen 
        title="Detail Timesheet" 
        onBack={() => router.back()} 
        onThemes={true}
      />

      <ScrollView flex={1} bg={backgroundColor} showsVerticalScrollIndicator={false}>
        <VStack p={4} space={4}>
          {/* Header Card with Gradient */}
          <LinearGradient
            colors={mode === 'dark' 
              ? ['#1e3a8a', '#3b82f6'] 
              : ['#3b82f6', '#60a5fa']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              padding: 20,
            }}
          >
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text fontSize="xs" fontFamily="Poppins-Regular" color="rgba(255,255,255,0.8)">
                    Kode Timesheet
                  </Text>
                  <Text fontSize="sm" fontFamily="Poppins-SemiBold" color="#ffffff">
                    {timesheet?.kode || timesheet?.id || '-'}
                  </Text>
                </VStack>
                <View
                  style={{
                    backgroundColor: statusBadge.color,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text fontSize="xs" fontFamily="Quicksand-Bold" color={statusBadge.textColor}>
                    {statusBadge.label}
                  </Text>
                </View>
              </HStack>

              <HStack space={2} alignItems="center">
                <User size={18} color="#ffffff" variant="Bold" />
                <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff" numberOfLines={1} flex={1}>
                  {timesheet?.karyawan?.nama || timesheet?.karyawan?.name || 'Operator tidak diketahui'}
                </Text>
              </HStack>

              <HStack space={2} alignItems="center">
                <Calendar size={18} color="#ffffff" />
                <Text fontSize="sm" fontFamily="Poppins-Light" color="rgba(255,255,255,0.9)">
                  {timesheet?.date_ops ? moment(timesheet.date_ops).format('dddd, DD MMMM YYYY') : '-'}
                </Text>
              </HStack>
            </VStack>
          </LinearGradient>

          {/* Quick Stats */}
          <HStack space={3}>
            <InfoCard
              icon={Clock}
              label="Total Durasi"
              value={`${getActivityDuration()} jam`}
              iconColor="#f59e0b"
              gradientColors={['#f59e0b', '#fb923c']}
            />
            <InfoCard
              icon={TruckFast}
              label="Equipment"
              value={timesheet?.equipment?.kode || timesheet?.equipment?.code || '-'}
              iconColor="#3b82f6"
              gradientColors={['#3b82f6', '#60a5fa']}
            />
          </HStack>

          <HStack space={3}>
            <InfoCard
              icon={Timer1}
              label="Shift"
              value={timesheet?.shift?.nama || timesheet?.shift?.name || '-'}
              iconColor="#10b981"
              gradientColors={['#10b981', '#6ee7b7']}
            />
            <InfoCard
              icon={Speedometer}
              label="Pemakaian"
              value={`${(Number(timesheet?.usedhmkm) || Number(timesheet?.usedsmu) || (Number(timesheet?.smufinish) - Number(timesheet?.smustart)) || 0).toFixed(2)} ${timesheet?.equipment?.kategori === 'HE' ? 'HM' : 'KM'}`}
              iconColor="#8b5cf6"
              gradientColors={['#8b5cf6', '#a78bfa']}
            />
          </HStack>

          {/* Detail Information */}
          <VStack
            bg={cardBg}
            p={4}
            rounded="xl"
            borderWidth={1}
            borderColor={cardBorder}
            space={3}
          >
            <SectionHeader title="Informasi Detail" icon={DocumentText} />

            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  Penyewa
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor} textAlign="right" flex={1} ml={2} numberOfLines={2}>
                  {timesheet?.penyewa?.nama || timesheet?.penyewa?.name || 'Tidak ada data'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  Cabang
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor} textAlign="right" flex={1} ml={2}>
                  {timesheet?.cabang?.nama || timesheet?.cabang?.name || 'Tidak ada data'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  Equipment
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {timesheet?.equipment?.nama || timesheet?.equipment?.name || '-'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  Model
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {timesheet?.equipment?.model || '-'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  Waktu Mulai
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {timesheet?.starttime ? moment(timesheet.starttime).format('HH:mm') : '-'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  Waktu Selesai
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {timesheet?.endtime ? moment(timesheet.endtime).format('HH:mm') : '-'}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  {timesheet?.equipment?.kategori === 'HE' ? 'HM' : 'KM'} Awal
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {timesheet?.smustart || 0}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                  {timesheet?.equipment?.kategori === 'HE' ? 'HM' : 'KM'} Akhir
                </Text>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                  {timesheet?.smufinish || 0}
                </Text>
              </HStack>

              {timesheet?.longshift_obj?.nama && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                    Longshift
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                    {timesheet.longshift_obj.nama}
                  </Text>
                </HStack>
              )}

              {timesheet?.activity_obj?.nama && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                    Aktivitas Utama
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                    {timesheet.activity_obj.nama}
                  </Text>
                </HStack>
              )}

              {(timesheet?.refuel_liter || timesheet?.bbm) && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                    Pengisian BBM
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'}>
                    {timesheet?.refuel_liter || timesheet?.bbm || 0} Liter
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>

          {/* Activities Detail List */}
          {(timesheet?.kegiatan?.length > 0 || timesheet?.items?.length > 0) && (
            <VStack space={3}>
              <SectionHeader 
                title="Detail Kegiatan Kerja" 
                icon={Activity} 
                count={timesheet?.kegiatan?.length || timesheet?.items?.length || 0}
              />
              {(timesheet?.kegiatan || timesheet?.items || []).map((item, index) => (
                <ActivityDetailItem key={item.id || index} item={item} index={index} />
              ))}
            </VStack>
          )}

          {/* Photo Evidence */}
          {timesheet.photo && (
            <VStack
              bg={cardBg}
              p={4}
              rounded="xl"
              borderWidth={1}
              borderColor={cardBorder}
              space={3}
            >
              <SectionHeader title="Bukti Foto" icon={ImageIcon} />
              <TouchableOpacity onPress={() => setImageViewVisible(true)} activeOpacity={0.8}>
                <Image
                  source={{ uri: timesheet.photo }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 12,
                    backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                  }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text fontSize="xs" fontFamily="Poppins-Regular" color="#ffffff">
                    Tap untuk memperbesar
                  </Text>
                </View>
              </TouchableOpacity>
            </VStack>
          )}

          {/* Keterangan */}
          {timesheet.keterangan && (
            <VStack
              bg={cardBg}
              p={4}
              rounded="xl"
              borderWidth={1}
              borderColor={cardBorder}
              space={2}
            >
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                Keterangan Tambahan
              </Text>
              <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                {timesheet.keterangan}
              </Text>
            </VStack>
          )}

          {/* Bottom padding for action buttons */}
          <View style={{ height: 20 }} />
        </VStack>
      </ScrollView>

      {/* Action Buttons */}
      {timesheet.status === 'W' && (
        <VStack
          bg={cardBg}
          p={4}
          borderTopWidth={1}
          borderTopColor={cardBorder}
          space={3}
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <HStack space={3}>
            <Pressable
              flex={1}
              bg={mode === 'dark' ? '#991b1b' : '#ef4444'}
              py={3.5}
              rounded="xl"
              onPress={handleReject}
              _pressed={{ opacity: 0.7 }}
              isDisabled={actionLoading}
              opacity={actionLoading ? 0.5 : 1}
            >
              <HStack space={2} alignItems="center" justifyContent="center">
                {actionLoading ? (
                  <Spinner size="sm" color="#ffffff" />
                ) : (
                  <CloseCircle size={20} color="#ffffff" variant="Bold" />
                )}
                <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                  Tolak
                </Text>
              </HStack>
            </Pressable>

            <Pressable
              flex={1}
              bg={mode === 'dark' ? '#065f46' : '#10b981'}
              py={3.5}
              rounded="xl"
              onPress={handleApprove}
              _pressed={{ opacity: 0.7 }}
              isDisabled={actionLoading}
              opacity={actionLoading ? 0.5 : 1}
            >
              <HStack space={2} alignItems="center" justifyContent="center">
                {actionLoading ? (
                  <Spinner size="sm" color="#ffffff" />
                ) : (
                  <TickCircle size={20} color="#ffffff" variant="Bold" />
                )}
                <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                  Setujui
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        </VStack>
      )}

      {/* Image Viewer Modal for Full Screen & Zoom */}
      {timesheet?.photo && (
        <ImageView
          images={[{ uri: timesheet.photo }]}
          imageIndex={0}
          visible={imageViewVisible}
          onRequestClose={() => setImageViewVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          presentationStyle="overFullScreen"
        />
      )}

      {/* Approve Confirmation Modal */}
      <RNModal
        visible={approveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setApproveModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setApproveModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: cardBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <VStack space={0}>
              {/* Header with gradient */}
              <LinearGradient
                colors={['#10b981', '#34d399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 24,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <TickCircle size={48} color="#ffffff" variant="Bold" />
                </View>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color="#ffffff" textAlign="center">
                  Setujui Timesheet
                </Text>
                <Text fontSize="sm" fontFamily="Poppins-Light" color="rgba(255, 255, 255, 0.9)" textAlign="center" mt={1}>
                  Konfirmasi persetujuan data
                </Text>
              </LinearGradient>

              {/* Body */}
              <VStack p={6} space={4}>
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor} textAlign="center">
                  Apakah Anda yakin ingin menyetujui timesheet ini?
                </Text>

                {/* Info Cards */}
                <VStack space={3} bg={mode === 'dark' ? '#374151' : '#f9fafb'} p={4} rounded="lg">
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <User size={16} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} />
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                        Operator
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor} flex={1} textAlign="right" numberOfLines={1}>
                      {timesheet?.karyawan?.nama}
                    </Text>
                  </HStack>

                  <Divider bg={cardBorder} />

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <TruckFast size={16} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} />
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                        Equipment
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                      {timesheet?.equipment?.kode}
                    </Text>
                  </HStack>

                  <Divider bg={cardBorder} />

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Calendar size={16} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} />
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                        Tanggal
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                      {moment(timesheet?.date_ops).format('DD MMM YYYY')}
                    </Text>
                  </HStack>
                </VStack>

                {/* Warning */}
                <HStack space={2} p={3} bg="rgba(16, 185, 129, 0.1)" rounded="lg" alignItems="flex-start">
                  <TickCircle size={20} color="#10b981" variant="Bold" />
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#6ee7b7' : '#059669'} flex={1}>
                    Data yang sudah disetujui akan masuk ke sistem dan tidak dapat diubah
                  </Text>
                </HStack>

                {/* Action Buttons */}
                <HStack space={3} mt={2}>
                  <Pressable
                    flex={1}
                    bg={mode === 'dark' ? '#374151' : '#e5e7eb'}
                    py={3}
                    rounded="xl"
                    onPress={() => setApproveModalVisible(false)}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor} textAlign="center">
                      Batal
                    </Text>
                  </Pressable>

                  <Pressable
                    flex={1}
                    bg={mode === 'dark' ? '#065f46' : '#10b981'}
                    py={3}
                    rounded="xl"
                    onPress={confirmApprove}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <HStack space={2} alignItems="center" justifyContent="center">
                      <TickCircle size={20} color="#ffffff" variant="Bold" />
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                        Setujui
                      </Text>
                    </HStack>
                  </Pressable>
                </HStack>
              </VStack>
            </VStack>
          </Pressable>
        </Pressable>
      </RNModal>

      {/* Reject Confirmation Modal */}
      <RNModal
        visible={rejectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setRejectModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: cardBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <VStack space={0}>
              {/* Header with gradient */}
              <LinearGradient
                colors={['#ef4444', '#f87171']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 24,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <CloseCircle size={48} color="#ffffff" variant="Bold" />
                </View>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color="#ffffff" textAlign="center">
                  Tolak Timesheet
                </Text>
                <Text fontSize="sm" fontFamily="Poppins-Light" color="rgba(255, 255, 255, 0.9)" textAlign="center" mt={1}>
                  Konfirmasi penolakan data
                </Text>
              </LinearGradient>

              {/* Body */}
              <VStack p={6} space={4}>
                <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor} textAlign="center">
                  Apakah Anda yakin ingin menolak timesheet ini?
                </Text>

                {/* Info Cards */}
                <VStack space={3} bg={mode === 'dark' ? '#374151' : '#f9fafb'} p={4} rounded="lg">
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <User size={16} color={mode === 'dark' ? '#f87171' : '#ef4444'} />
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                        Operator
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor} flex={1} textAlign="right" numberOfLines={1}>
                      {timesheet?.karyawan?.nama}
                    </Text>
                  </HStack>

                  <Divider bg={cardBorder} />

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <TruckFast size={16} color={mode === 'dark' ? '#f87171' : '#ef4444'} />
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                        Equipment
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                      {timesheet?.equipment?.kode}
                    </Text>
                  </HStack>

                  <Divider bg={cardBorder} />

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={2} alignItems="center">
                      <Calendar size={16} color={mode === 'dark' ? '#f87171' : '#ef4444'} />
                      <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
                        Tanggal
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={textColor}>
                      {moment(timesheet?.date_ops).format('DD MMM YYYY')}
                    </Text>
                  </HStack>
                </VStack>

                {/* Warning */}
                <HStack space={2} p={3} bg="rgba(239, 68, 68, 0.1)" rounded="lg" alignItems="flex-start">
                  <CloseCircle size={20} color="#ef4444" variant="Bold" />
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fca5a5' : '#dc2626'} flex={1}>
                    Timesheet akan dikembalikan ke operator untuk diperbaiki. Operator harus mengisi ulang data yang benar.
                  </Text>
                </HStack>

                {/* Action Buttons */}
                <HStack space={3} mt={2}>
                  <Pressable
                    flex={1}
                    bg={mode === 'dark' ? '#374151' : '#e5e7eb'}
                    py={3}
                    rounded="xl"
                    onPress={() => setRejectModalVisible(false)}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor} textAlign="center">
                      Batal
                    </Text>
                  </Pressable>

                  <Pressable
                    flex={1}
                    bg={mode === 'dark' ? '#991b1b' : '#ef4444'}
                    py={3}
                    rounded="xl"
                    onPress={confirmReject}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <HStack space={2} alignItems="center" justifyContent="center">
                      <CloseCircle size={20} color="#ffffff" variant="Bold" />
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                        Tolak
                      </Text>
                    </HStack>
                  </Pressable>
                </HStack>
              </VStack>
            </VStack>
          </Pressable>
        </Pressable>
      </RNModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
