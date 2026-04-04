import { useEffect, useState } from 'react';
import moment from 'moment';
import { useRouter } from 'expo-router';
import { VStack, HStack, Text, Box, Center, Pressable } from 'native-base';
import { View, Dimensions, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import { Watch, Coffee, Calendar, DocumentText, Filter, ArrowDown2, Alarm } from 'iconsax-react-native';
import { useCrewWorksheet } from '../../../src/hooks/crewWorksheet/useCrewWorksheet';
import FilterModal from './filter';

const formatTime = (time) => {
  if (!time) return '-';
  const parts = time.split(':');
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  const m = moment(time);
  return m.isValid() ? m.format('HH:mm') : '-';
};

const formatDate = (date) => (date ? moment(date).format('dddd, DD MMMM YYYY') : '-');

export default function ApprovalWorksheetList() {
  console.log('ApprovalWorksheetList component started');
  const router = useRouter();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const screenWidth = Dimensions.get('window').width;
  const isSmall = screenWidth < 375;
  const auth = useSelector(state => state.auth);
  const karyawanState = useSelector(state => state.karyawan);
  
  // Filter karyawan based on current user area
  const karyawanList = karyawanState?.data?.filter(k => 
    k.area === auth?.karyawan?.area
  ) || [];

  const textColor = COLORS.teks[mode][1] || '#2f313e';
  const backgroundColor = COLORS.container[mode] || '#F5F5F5';
  const cardBg = COLORS.card[mode] || '#edecec';
  const cardBorder = COLORS.line[mode][1] || '#DDDDDD';

  const { approvalList, loading, error, fetchApprovalList } = useCrewWorksheet();
  const listData = approvalList || [];

  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [filterDraft, setFilterDraft] = useState({
    startdate: '',
    enddate: '',
    status: 'P', // Default filter: Pending
    spv_id: auth?.karyawan?.id || null, // Default filter: current user as supervisor
    crew_id: null,
  });
  const [activeFilter, setActiveFilter] = useState({
    startdate: '',
    enddate: '',
    status: 'P', // Default filter: Pending
    spv_id: auth?.karyawan?.id || null, // Default filter: current user as supervisor
    crew_id: null,
  });

  const loadData = async (filters = {}) => {
    try {
      const filtersToApply = Object.keys(filters).length > 0 ? { ...activeFilter, ...filters } : activeFilter;
      await fetchApprovalList(filtersToApply);
    } catch (err) {
      console.error('Error loading approval worksheet data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(activeFilter);
    setRefreshing(false);
  };

  const applyFilter = (payload) => {
    const next = payload || { ...filterDraft };
    setFilterDraft(next);
    setActiveFilter(next);
    setShowFilterModal(false);
    loadData(next);
  };

  const resetFilter = () => {
    const defaultFilter = {
      startdate: '',
      enddate: '',
      status: 'P',
      spv_id: auth?.karyawan?.id || null,
      crew_id: null,
    };
    setFilterDraft(defaultFilter);
    setActiveFilter(defaultFilter);
    setShowFilterModal(false);
    loadData(defaultFilter);
  };

  const isFilterActive = () => {
    return (
      filterDraft.startdate !== '' ||
      filterDraft.enddate !== '' ||
      filterDraft.status !== 'P' ||
      (filterDraft.spv_id && filterDraft.spv_id !== null) ||
      (filterDraft.crew_id && filterDraft.crew_id !== null)
    );
  };

const handleDateSelect = (date, type) => {
    if (type === 'start') {
      setFilterDraft(prev => ({
        ...prev,
        startdate: moment(date).format('YYYY-MM-DD'),
        enddate: prev.enddate || moment(date).format('YYYY-MM-DD'),
      }));
    } else {
      setFilterDraft(prev => ({
        ...prev,
        enddate: moment(date).format('YYYY-MM-DD'),
      }));
    }
  };

  const renderItem = (item) => {
    const statusColor = item.status === 'A' ? '#10B981'
      : item.status === 'R' ? '#EF4444'
      : item.status === 'P' ? '#F59E0B'
      : '#6B7280';

    const statusText = item.status === 'A' ? 'Approved'
      : item.status === 'R' ? 'Rejected'
      : item.status === 'P' ? 'Pending'
      : 'Unknown';

    const overtimeHours = Number.isFinite(Number(item?.jam_lembur)) ? Number(item.jam_lembur) : 0;
    const productiveHours = Number.isFinite(Number(item?.jam_kerja_normal)) ? Number(item.jam_kerja_normal) : 0;

    return (
      <Box
        bg={cardBg}
        rounded="2xl"
        my={2.5}
        borderWidth={1}
        borderColor={cardBorder}
        shadow={mode === 'dark' ? 0 : 4}
        overflow="hidden"
      >
        <Pressable onPress={() => router.push(`/approval/worksheet/show?id=${item.id}`)} p={4}>
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack space={0.5} flex={1} pr={3}>
                <Text fontFamily="Quicksand-Bold" fontSize={isSmall ? 15 : 17} color={textColor} numberOfLines={1}>
                  {item.crew?.nama || 'Unknown'}
                </Text>
                <Text fontFamily="Quicksand-Regular" fontSize={isSmall ? 11 : 12} color={COLORS.teks[mode][2]} numberOfLines={1}>
                  {formatDate(item.tanggal)}
                </Text>
              </VStack>

              <Box px={2.5} py={1} rounded="md" bg={`${statusColor}22`} borderWidth={1} borderColor={`${statusColor}55`}>
                <Text fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 10 : 12} color={statusColor}>
                  {statusText}
                </Text>
              </Box>
            </HStack>

            <HStack space={3} alignItems="center">
              <HStack flex={1} alignItems="center" space={2}>
                <Calendar size={16} color={COLORS.teks[mode][3]} />
                <Text fontFamily="Quicksand-Medium" fontSize={isSmall ? 12 : 13} color={textColor} numberOfLines={1}>
                  {moment(item.tanggal).format('DD MMM YYYY')}
                </Text>
              </HStack>

              <HStack flex={1} alignItems="center" space={2}>
                <Watch size={16} color={COLORS.teks[mode][3]} />
                <Text fontFamily="Quicksand-Medium" fontSize={isSmall ? 12 : 13} color={textColor} numberOfLines={1}>
                  {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)}
                </Text>
              </HStack>
            </HStack>

            <HStack space={3} alignItems="center">
              <HStack flex={1} alignItems="center" space={2}>
                <Coffee size={16} color={COLORS.teks[mode][3]} />
                <Text fontFamily="Quicksand-Medium" fontSize={isSmall ? 12 : 13} color={textColor} numberOfLines={1}>
                  {formatTime(item.istirahat_mulai)} - {formatTime(item.istirahat_selesai)}
                </Text>
              </HStack>

              <HStack flex={1} alignItems="center" space={2}>
                <Alarm size={16} color={COLORS.teks[mode][3]} />
                <Text fontFamily="Quicksand-Medium" fontSize={isSmall ? 12 : 13} color={textColor} numberOfLines={1}>
                  {overtimeHours.toFixed(1)} jam lembur
                </Text>
              </HStack>
            </HStack>

            <HStack alignItems="center" space={2}>
              <Watch size={16} color={COLORS.teks[mode][3]} />
              <Text fontFamily="Quicksand-Medium" fontSize={isSmall ? 12 : 13} color={textColor} numberOfLines={1}>
                {productiveHours.toFixed(1)} jam produktif
              </Text>
            </HStack>

            <HStack alignItems="flex-start" space={2}>
              <DocumentText size={16} color={COLORS.teks[mode][4]} />
              <Text
                flex={1}
                fontFamily="Quicksand-Regular"
                fontSize={isSmall ? 12 : 13}
                color={textColor}
                numberOfLines={2}
              >
                {item.keterangan || 'Tidak ada keterangan'}
              </Text>
            </HStack>
            {
              item.komentar_spv &&
              <HStack alignItems="flex-start" space={2}>
                <Alarm size={16} color={COLORS.teks[mode][5]} />
                <Text
                  flex={1}
                  fontFamily="Quicksand-Regular"
                  fontSize={isSmall ? 12 : 13}
                  color={textColor}
                  numberOfLines={2}
                >
                  {item.komentar_spv}
                </Text>
              </HStack>
            }

            <HStack mt={1} justifyContent="space-between" alignItems="center">
              <HStack space={2} alignItems="center">
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, opacity: 0.85 }}
                />
                <Text fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 11 : 12} color={COLORS.teks[mode][2]}>
                  {statusText}
                </Text>
                <Text fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 11 : 12} color={COLORS.teks[mode][2]}>
                  {item.supervisor?.nama || '-'}
                </Text>
              </HStack>
              <ArrowDown2 size={16} color={COLORS.teks[mode][2]} style={{ transform: [{ rotate: '-90deg' }] }} />
            </HStack>
          </VStack>
        </Pressable>
      </Box>
    );
  };

  return (
    <AppScreen>
      <HeaderScreen
        title="Approval Worksheet"
        onBack={() => router.back()}
        onThemes={true}
        onNotification={true}
      />
      
      <VStack flex={1} bg={backgroundColor} px={4} pt={3} pb={2}>
        {loading ? (
          <Center flex={1}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text mt={3} color={textColor} fontFamily="Quicksand-Regular">Memuat data...</Text>
          </Center>
        ) : (
          <FlatList
            data={listData}
            renderItem={({ item }) => renderItem(item)}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            ListEmptyComponent={(
              <VStack py={6} alignItems="center" space={2} bg={cardBg} rounded="2xl" my={2} borderWidth={1} borderColor={cardBorder}>
                <Text color={textColor} fontFamily="Quicksand-Bold" textAlign="center" fontSize={isSmall ? 16 : 18}>
                  {error ? 'Gagal memuat data' : 'Tidak ada permintaan approval'}
                </Text>
                <Text color={textColor} opacity={0.8} fontFamily="Quicksand-Regular" textAlign="center" fontSize={isSmall ? 12 : 13} px={2}>
                  {error ? 'Silakan tarik untuk memuat ulang' : 'Semua permintaan sudah diproses'}
                </Text>
              </VStack>
            )}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </VStack>
      
      {/* Filter Modals */}
      <FilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        filterDraft={filterDraft}
        setFilterDraft={setFilterDraft}
        applyFilter={applyFilter}
        resetFilter={resetFilter}
        isFilterActive={isFilterActive}
        karyawanList={karyawanList}
        textColor={textColor}
        mode={mode}
        cardBg={cardBg}
        COLORS={COLORS}
      />

      
      
      
      
      
      {/* Floating Filter Button */}
      <TouchableOpacity
        onPress={() => {
          console.log('Filter button pressed, current showFilterModal:', showFilterModal);
          setShowFilterModal(true);
          console.log('After setShowFilterModal, showFilterModal will be true');
        }}
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: isFilterActive() ? (mode === 'dark' ? '#1e3a8a' : '#1d4ed8') : (mode === 'dark' ? '#1e40af' : '#2563eb'),
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Filter 
          size={28} 
          color={'#ffffff'} 
          variant={isFilterActive() ? "Bold" : "Outline"}
        />
        {isFilterActive() && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#f59e0b',
              width: 12,
              height: 12,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: isFilterActive() ? (mode === 'dark' ? '#1e3a8a' : '#1d4ed8') : (mode === 'dark' ? '#1e40af' : '#2563eb'),
            }}
          />
        )}
      </TouchableOpacity>
    </AppScreen>
  );
}
