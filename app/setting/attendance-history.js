import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Box, Center, HStack, Text, VStack, IconButton, Icon, Input } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/id';
import { useDispatch, useSelector } from 'react-redux';
import ImageViewing from 'react-native-image-viewing';

import { AppScreen, HeaderScreen, LoadingHauler } from '../../src/components/common';
import { COLORS } from '../../src/constants/colors';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';
import { AttendanceCalendar, SummaryCard } from '../../src/features/attendance/components/AttendanceCalendar';
import AttendanceDonutChart from '../../src/features/attendance/components/AttendanceDonutChart';
import { getKaryawan } from '../../src/store/slices/karyawanSlice';

moment.locale('id');

const PHOTO_BASE_URL = 'https://cdn.makkuragatama.id';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Attendance Detail Modal
function AttendanceDetailModal({ visible, onClose, detailData, isDark, loading, setPreview }) {
  const textColor = isDark ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const cardBg = isDark ? COLORS.box.dark : '#ffffff';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#3a3c4e' : '#e5e7eb';

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <Box flex={1} bg="rgba(0,0,0,0.5)" justifyContent="center" alignItems="center">
          <Box bg={cardBg} borderRadius={16} p={5} width="85%">
            <VStack space={4} alignItems="center">
              <LoadingHauler
                message="Memuat data..."
                type="default"
              />
            </VStack>
          </Box>
        </Box>
      </Modal>
    );
  }

  if (!detailData || !detailData.records || detailData.records.length === 0) {
    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <Box flex={1} bg="rgba(0,0,0,0.5)" justifyContent="center" alignItems="center">
          <Box bg={cardBg} borderRadius={16} p={5} width="85%">
            <VStack space={4} alignItems="center">
              <Text fontSize={16} color={textColor} fontFamily="Quicksand-Bold">
                Tidak ada data absensi
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Box bg="#3b82f6" px={6} py={2} borderRadius={8}>
                  <Text color="white" fontFamily="Poppins-SemiBold">
                    Tutup
                  </Text>
                </Box>
              </TouchableOpacity>
            </VStack>
          </Box>
        </Box>
      </Modal>
    );
  }

  const record = detailData.records[0];
  const imgIn = record.photo_in
    ? (record.photo_in.startsWith('http')
      ? record.photo_in
      : `${PHOTO_BASE_URL.replace(/\/$/, '')}/${String(record.photo_in).replace(/^\//, '')}`)
    : '';

  const imgOut = record.photo_out
    ? (record.photo_out.startsWith('http')
      ? record.photo_out
      : `${PHOTO_BASE_URL.replace(/\/$/, '')}/${String(record.photo_out).replace(/^\//, '')}`)
    : '';

  const dateLabel = (() => {
    const src = record.checklog_in || record.date_ops;
    const m = moment(src, [
      'DD-MM-YYYY HH:mm:ss',
      'YYYY-MM-DD HH:mm:ss',
      moment.ISO_8601,
      'DD/MM/YYYY HH:mm:ss',
      'DD-MM-YYYY',
      'YYYY-MM-DD'
    ], true);
    return m.isValid() ? m.locale('id').format('dddd, DD MMMM YYYY') : String(src || '');
  })();

  const timeFmt = (val) => {
    if (!val) return '--:--';
    const m = moment(val, [
      'DD-MM-YYYY HH:mm:ss',
      'YYYY-MM-DD HH:mm:ss',
      moment.ISO_8601,
      'DD/MM/YYYY HH:mm:ss'
    ], true);
    return m.isValid() ? m.format('HH:mm') : String(val).split(' ')[1]?.slice(0, 5) || '--:--';
  };

  // Status badge component
  const StatusBadge = ({ status, label }) => {
    const statusConfig = {
      'H': { bg: '#dcfce7', text: '#166534', icon: 'check-circle' },
      'L': { bg: '#fef3c7', text: '#92400e', icon: 'clock-alert' },
      'M': { bg: '#dbeafe', text: '#1e40af', icon: 'fingerprint' },
      'O': { bg: '#f3e8ff', text: '#6b21a8', icon: 'cellphone' },
    };
    const config = statusConfig[status] || { bg: '#f3f4f6', text: '#6b7280', icon: 'help-circle' };

    return (
      <HStack alignItems="center" bg={config.bg} px={3} py={1} borderRadius={20} space={1}>
        <MaterialCommunityIcons name={config.icon} size={14} color={config.text} />
        <Text fontSize={12} fontFamily="Poppins-SemiBold" color={config.text}>
          {label}
        </Text>
      </HStack>
    );
  };

  // Time Card Component
  const TimeCard = ({ type, time, photo, via, onPress }) => {
    const isCheckIn = type === 'in';
    const iconColor = isCheckIn ? '#10b981' : '#ef4444';
    const iconName = isCheckIn ? 'arrow-right-circle' : 'arrow-left-circle';

    return (
      <VStack flex={1} space={3}>
        <HStack alignItems="center" space={2}>
          <MaterialCommunityIcons name={iconName} size={16} color={iconColor} />
          <Text fontSize={13} fontFamily="Poppins-SemiBold" color={subtitleColor}>
            {isCheckIn ? 'Check-In' : 'Check-Out'}
          </Text>
        </HStack>

        <VStack space={2} alignItems="center">
          <TouchableOpacity onPress={() => onPress(photo)} activeOpacity={0.8}>
            <Box
              width={120}
              height={120}
              borderRadius={16}
              overflow="hidden"
              borderWidth={2}
              borderColor={isCheckIn ? '#10b981' : '#ef4444'}
              backgroundColor={isDark ? '#3a3c4e' : '#f3f4f6'}
              shadow={3}
              shadowColor={isCheckIn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
            >
              <Image
                source={{ uri: photo || 'https://cdn.makkuragatama.id/no-image.jpg' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </Box>
          </TouchableOpacity>

          <Text fontSize={24} fontFamily="Quicksand-Bold" color={textColor}>
            {time}
          </Text>

          <StatusBadge status={via} label={via === 'M' ? 'Mobile' : 'Fingerprint'} />
        </VStack>
      </VStack>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Box flex={1} bg="rgba(0,0,0,0.5)" justifyContent="flex-end">
        <Box height="80%" bg={cardBg} borderTopRadius={32}>
          {/* Header with gradient effect */}
          <Box
            bg={isDark ? 'rgba(42, 44, 62, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
            pt={6} pb={4} px={5}
            borderBottomWidth={1}
            borderBottomColor={borderColor}
            borderTopRadius={32}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize={20} fontFamily="Quicksand-Bold" color={textColor}>
                  Detail Absensi
                </Text>
                <Text fontSize={14} fontFamily="Poppins-Regular" color={subtitleColor}>
                  {dateLabel}
                </Text>
              </VStack>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDark ? '#3a3c4e' : '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons name="close" size={20} color={textColor} />
              </TouchableOpacity>
            </HStack>
          </Box>

          {/* Content */}
          <ScrollView p={5} showsVerticalScrollIndicator={false}>
            <VStack space={5} mt={2} mx={2}>
              {/* Time Cards */}
              <Box
                bg={isDark ? 'rgba(58, 60, 78, 0.5)' : '#f9fafb'}
                p={4}
                borderRadius={20}
                borderWidth={1}
                borderColor={borderColor}
              >
                <HStack justifyContent="space-between" alignItems="flex-start" space={4}>
                  {/* Divider Line */}
                  <Box
                    width={2}
                    height="100%"
                    bg="transparent"
                    borderRadius={1}
                  />

                  {/* Check In Card */}
                  <TimeCard
                    type="in"
                    time={timeFmt(record.checklog_in)}
                    photo={imgIn}
                    via={record.via_in}
                    onPress={setPreview}
                  />

                  {/* Center Divider */}
                  <Box width={1} height="80%" bg={borderColor} alignSelf="center" />

                  {/* Check Out Card */}
                  <TimeCard
                    type="out"
                    time={timeFmt(record.checklog_out)}
                    photo={imgOut}
                    via={record.via_out}
                    onPress={setPreview}
                  />
                </HStack>
              </Box>

              {/* Additional Info Section */}
              <VStack space={3}>
                <Text fontSize={14} fontFamily="Poppins-SemiBold" color={subtitleColor} uppercase letterSpacing={1}>
                  Informasi Tambahan
                </Text>

                {/* Work Duration */}
                <HStack
                  bg={isDark ? 'rgba(58, 60, 78, 0.5)' : '#f9fafb'}
                  p={4}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="space-between"
                  borderWidth={1}
                  borderColor={borderColor}
                >
                  <HStack alignItems="center" space={3}>
                    <Box
                      width={40}
                      height={40}
                      borderRadius={20}
                      bg={isDark ? '#3a3c4e' : '#e0e7ff'}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#6366f1" />
                    </Box>
                    <VStack>
                      <Text fontSize={12} fontFamily="Poppins-Regular" color={subtitleColor}>
                        Durasi Kerja
                      </Text>
                      <Text fontSize={16} fontFamily="Quicksand-Bold" color={textColor}>
                        {record.checklog_in && record.checklog_out
                          ? (() => {
                              const start = moment(record.checklog_in, ['DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true);
                              const end = moment(record.checklog_out, ['DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true);
                              if (start.isValid() && end.isValid()) {
                                const diff = moment.duration(end.diff(start));
                                const hours = Math.floor(diff.asHours());
                                const mins = Math.floor(diff.asMinutes() % 60);
                                return `${hours}j ${mins}m`;
                              }
                              return '--';
                            })()
                          : '--'}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>

                {/* Location */}
                <HStack
                  bg={isDark ? 'rgba(58, 60, 78, 0.5)' : '#f9fafb'}
                  p={4}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="space-between"
                  borderWidth={1}
                  borderColor={borderColor}
                >
                  <HStack alignItems="center" space={3} flex={1}>
                    <Box
                      width={40}
                      height={40}
                      borderRadius={20}
                      bg={isDark ? '#3a3c4e' : '#fef3c7'}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <MaterialCommunityIcons name="map-marker-outline" size={20} color="#f59e0b" />
                    </Box>
                    <VStack flex={1}>
                      <Text fontSize={12} fontFamily="Poppins-Regular" color={subtitleColor}>
                        Lokasi
                      </Text>
                      <Text fontSize={14} fontFamily="Poppins-SemiBold" color={textColor}>
                        {record.lokasi_in || record.location || 'Kantor'}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>

            {/* Bottom spacing for safe area */}
            <Box height={4} />
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  );
}

export default function AttendanceHistoryScreen() {
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const isDark = mode === 'dark';
  const karyawanList = useSelector(state => state.karyawan?.data) || [];

  const backgroundColor = isDark ? COLORS.container.dark : COLORS.container.light;

  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [detailModal, setDetailModal] = useState({ visible: false, data: null });
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [karyawanSheetVisible, setKaryawanSheetVisible] = useState(false);
  const [karyawanSearch, setKaryawanSearch] = useState('');
  const bottomSheetAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];

  const filteredKaryawan = karyawanList.filter(item =>
    String(item?.nama || '').toLowerCase().includes(karyawanSearch.toLowerCase())
  );

  const fetchMonthlyData = async (month, karyawanId = null) => {
    try {
      setLoading(true);
      console.log('📅 Fetching monthly attendance for:', month, 'karyawan:', karyawanId || 'all');

      const { data } = await apiClient.get(API_ENDPOINTS.ATTENDANCE.MONTHLY, {
        params: {
          month,
          ...(karyawanId ? { karyawan_id: karyawanId } : {})
        }
      });

      console.log('📅 API RESPONSE:', JSON.stringify(data, null, 2));
      console.log('📅 Month:', data?.data?.month);
      console.log('📅 Month Name:', data?.data?.monthName);
      console.log('📅 Summary:', data?.data?.summary);
      console.log('📅 Calendar days:', data?.data?.calendar?.length || 0);
      console.log('📅 Sample calendar data:', data?.data?.calendar?.slice(0, 3) || []);

      setMonthData(data?.data);

    } catch (error) {
      console.error('❌ Error fetching monthly attendance:', error?.message || error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyDetail = async (date) => {
    try {
      setDetailLoading(true);
      console.log('📅 Fetching daily detail for:', date, 'karyawan:', selectedKaryawan?.id || 'all');

      const { data } = await apiClient.get(API_ENDPOINTS.ATTENDANCE.DAILY_DETAIL, {
        params: {
          date,
          ...(selectedKaryawan?.id ? { karyawan_id: selectedKaryawan.id } : {})
        }
      });

      console.log('📅 DAILY DETAIL RESPONSE:', JSON.stringify(data, null, 2));
      console.log('📅 Records found:', data?.data?.records?.length || 0);
      console.log('📅 Sample record:', data?.data?.records?.[0] || 'No records');

      setDetailModal({ visible: true, data: data?.data });

    } catch (error) {
      console.error('❌ Error fetching daily detail:', error?.message || error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData(selectedMonth, selectedKaryawan?.id);
  }, [selectedMonth, selectedKaryawan?.id]);

  useEffect(() => {
    if (!karyawanList || karyawanList.length === 0) {
      dispatch(getKaryawan());
    }
  }, [dispatch]);

  // const openKaryawanSheet = () => {
  //   setKaryawanSheetVisible(true);
  //   Animated.timing(bottomSheetAnim, {
  //     toValue: 0,
  //     duration: 250,
  //     useNativeDriver: true,
  //   }).start();
  // };

  const closeKaryawanSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setKaryawanSheetVisible(false);
      setKaryawanSearch('');
    });
  };

  const handleSelectKaryawan = (item) => {
    setSelectedKaryawan(item);
    closeKaryawanSheet();
  };

  const handleClearKaryawan = () => {
    setSelectedKaryawan(null);
    closeKaryawanSheet();
  };

  const handlePreviousMonth = () => {
    const newMonth = moment(selectedMonth, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM');
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = moment(selectedMonth, 'YYYY-MM').add(1, 'month').format('YYYY-MM');
    // Don't allow future months
    if (moment(newMonth).isSameOrBefore(moment(), 'month')) {
      setSelectedMonth(newMonth);
    }
  };

  const handleDayPress = (day) => {
    // Always fetch from backend for any clicked date
    fetchDailyDetail(day.date);
  };

  const textColor = isDark ? '#F5F5F5' : '#2f313e';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? COLORS.box.dark : '#ffffff';
  const borderColor = isDark ? '#3a3c4e' : '#e5e7eb';

  return (
    <AppScreen>
      <VStack h="full">
        <HeaderScreen
          title="Absensi Bulanan"
          showBack
          onThemes
          onNotification
          // onFilter={openKaryawanSheet}
        />

        <ScrollView
          style={{ backgroundColor }}
          contentContainerStyle={{ padding: 12, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchMonthlyData(selectedMonth, selectedKaryawan?.id)}
              tintColor={isDark ? '#FAFAFA' : '#1F2937'}
            />
          }
        >
          {/* Month Selector */}
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <IconButton
              onPress={handlePreviousMonth}
              icon={<Icon as={MaterialCommunityIcons} name="chevron-left" size={6} color={textColor} />}
              disabled={loading}
            />
            <VStack alignItems="center">
              <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                {moment(selectedMonth, 'YYYY-MM').locale('id').format('MMMM YYYY')}
              </Text>
            </VStack>
            <IconButton
              onPress={handleNextMonth}
              icon={<Icon as={MaterialCommunityIcons} name="chevron-right" size={6} color={textColor} />}
              disabled={loading || moment(selectedMonth, 'YYYY-MM').isSame(moment(), 'month')}
            />
          </HStack>

          {/* Summary Statistics */}
          {monthData?.summary && (
            <SummaryCard summary={monthData.summary} isDark={isDark} />
          )}

          {/* Donut Chart */}
          {monthData?.summary && (
            <Box mb={4}>
              <AttendanceDonutChart summary={monthData.summary} isDark={isDark} />
            </Box>
          )}

          {/* Calendar */}
          {loading && !monthData ? (
            <Center py={10}>
              <LoadingHauler
                message="Memuat data..."
                subMessage="Mengambil data kehadiran"
                type="default"
              />
            </Center>
          ) : (
            <AttendanceCalendar
              monthData={monthData}
              onDayPress={handleDayPress}
              isDark={isDark}
            />
          )}
        </ScrollView>

        {/* Detail Modal */}
        <AttendanceDetailModal
          visible={detailModal.visible}
          onClose={() => setDetailModal({ visible: false, data: null })}
          detailData={detailModal.data}
          isDark={isDark}
          loading={detailLoading}
          setPreview={setPreview}
        />

        {/* Image Viewer */}
        <ImageViewing
          images={preview ? [{ uri: preview }] : []}
          visible={!!preview}
          onRequestClose={() => setPreview(null)}
          doubleTapToZoomEnabled
          swipeToCloseEnabled
        />

        {/* Karyawan Filter Bottom Sheet */}
        <Modal
          visible={karyawanSheetVisible}
          transparent
          animationType="none"
          onRequestClose={closeKaryawanSheet}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
            <Pressable style={{ width: '100%', height: '100%' }}>
              <Animated.View
                style={{
                  backgroundColor: cardBg,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingTop: 12,
                  maxHeight: SCREEN_HEIGHT * 0.7,
                  transform: [{ translateY: bottomSheetAnim }]
                }}
              >
                {/* Handle */}
                <Center>
                  <VStack w={10} h={1} bg={isDark ? '#4b5563' : '#d1d5db'} rounded="full" mb={3} />
                </Center>

                {/* Header */}
                <HStack
                  px={4}
                  py={3}
                  borderBottomWidth={1}
                  borderBottomColor={borderColor}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack alignItems="center" space={3}>
                    <Text fontSize={18}>👤</Text>
                    <VStack>
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                        Pilih Karyawan
                      </Text>
                      <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                        {karyawanList.length} karyawan tersedia
                      </Text>
                    </VStack>
                  </HStack>
                  <TouchableOpacity onPress={closeKaryawanSheet}>
                    <MaterialCommunityIcons name="close" size={22} color={subtitleColor} />
                  </TouchableOpacity>
                </HStack>

                {/* Search */}
                <VStack px={4} py={3} borderBottomWidth={1} borderBottomColor={borderColor}>
                  <Input
                    placeholder="Cari nama karyawan..."
                    value={karyawanSearch}
                    onChangeText={setKaryawanSearch}
                    bg={isDark ? '#2a2c3e' : '#f3f4f6'}
                    borderColor={borderColor}
                    color={textColor}
                    fontSize="sm"
                    fontFamily="Poppins-Regular"
                    InputLeftElement={
                      <MaterialCommunityIcons name="magnify" size={18} color={subtitleColor} style={{ marginLeft: 12 }} />
                    }
                    InputRightElement={
                      karyawanSearch ? (
                        <TouchableOpacity onPress={() => setKaryawanSearch('')} style={{ marginRight: 12 }}>
                          <MaterialCommunityIcons name="close-circle" size={18} color={subtitleColor} />
                        </TouchableOpacity>
                      ) : null
                    }
                  />
                </VStack>

                {/* Options */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                  {/* All Option */}
                  <TouchableOpacity
                    onPress={handleClearKaryawan}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      backgroundColor: !selectedKaryawan ? (isDark ? '#374151' : '#e5e7eb') : (isDark ? '#2a2c3e' : '#f9fafb'),
                      borderRadius: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  >
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="sm" fontFamily="Poppins-SemiBold" color={textColor}>
                        Semua Karyawan
                      </Text>
                      {!selectedKaryawan && (
                        <MaterialCommunityIcons name="check" size={18} color={isDark ? '#60a5fa' : '#2563eb'} />
                      )}
                    </HStack>
                  </TouchableOpacity>

                  {filteredKaryawan.map((item) => (
                    <TouchableOpacity
                      key={item.id?.toString()}
                      onPress={() => handleSelectKaryawan(item)}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        backgroundColor: selectedKaryawan?.id === item.id ? (isDark ? '#374151' : '#e5e7eb') : (isDark ? '#2a2c3e' : '#f9fafb'),
                        borderRadius: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    >
                      <HStack alignItems="center" justifyContent="space-between">
                        <VStack flex={1}>
                          <Text fontSize="sm" fontFamily="Poppins-SemiBold" color={textColor} numberOfLines={1}>
                            {item.nama}
                          </Text>
                          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                            {item.nik || '-'}
                          </Text>
                        </VStack>
                        {selectedKaryawan?.id === item.id && (
                          <MaterialCommunityIcons name="check" size={18} color={isDark ? '#60a5fa' : '#2563eb'} />
                        )}
                      </HStack>
                    </TouchableOpacity>
                  ))}

                  {filteredKaryawan.length === 0 && (
                    <Center py={6}>
                      <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                        Tidak ada hasil
                      </Text>
                    </Center>
                  )}

                  <Box height={6} />
                </ScrollView>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </VStack>
    </AppScreen>
  );
}
