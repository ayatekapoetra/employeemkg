import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { VStack, HStack, ScrollView, Text, Center } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../src/components/common';
import StatCard from '../../src/components/common/StatCard';
import { COLORS } from '../../src/constants/colors';
import { People, TickCircle, CloseCircle, Calendar, Clipboard, Filter, TruckFast, User, Location, Activity } from 'iconsax-react-native';
import { View, Dimensions, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import FilterPenugasanModal from '../../src/features/approval/components/FilterPenugasanModal';
import { getEquipmentPlanList } from '../../src/store/slices/equipmentPlanSlice';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const { width } = Dimensions.get('window');

export default function PenugasanEquipmentHarian() {
  const router = useRouter();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { data: planList, loading, error } = useSelector(state => state.equipmentPlan);
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('info');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    kodeEquipment: '',
    nama: '',
    lokasi: 'all',
    kegiatan: 'all',
    tanggalMulai: '',
    tanggalAkhir: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;

  useEffect(() => {
    console.log('📋 [Penugasan Index] Component mounted, loading data...');
    loadData();
  }, []);

  useEffect(() => {
    console.log('📊 [Penugasan Index] Redux state updated:', {
      planList,
      planListLength: Array.isArray(planList) ? planList.length : 'not array',
      loading,
      error,
    });
  }, [planList, loading, error]);

  const loadData = () => {
    const params = {
      site_id: user?.karyawan?.cabang_id,
      created_by: user?.karyawan?.id,
    };
    console.log('🔄 [Penugasan Index] Dispatching getEquipmentPlanList with params:', params);
    dispatch(getEquipmentPlanList(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const penugasanList = Array.isArray(planList) ? planList : [];

  const statusData = {
    totalKaryawan: penugasanList.length,
    pending: penugasanList.filter(p => p.status === 'pending').length,
    accepted: penugasanList.filter(p => p.status === 'accepted').length,
    rejected: penugasanList.filter(p => p.status === 'rejected').length,
    completed: penugasanList.filter(p => p.status === 'completed').length,
  };

  const pieData = [
    {
      value: statusData.accepted,
      color: mode === 'dark' ? '#6ee7b7' : '#10b981',
      text: `${statusData.accepted}`,
      label: 'Diterima',
      focused: true,
    },
    {
      value: statusData.pending,
      color: mode === 'dark' ? '#fbbf24' : '#f59e0b',
      text: `${statusData.pending}`,
      label: 'Pending',
    },
    {
      value: statusData.rejected,
      color: mode === 'dark' ? '#fca5a5' : '#ef4444',
      text: `${statusData.rejected}`,
      label: 'Ditolak',
    },
    {
      value: statusData.completed,
      color: mode === 'dark' ? '#60a5fa' : '#3b82f6',
      text: `${statusData.completed}`,
      label: 'Selesai',
    },
  ].filter(item => item.value > 0);

  const filteredPenugasanList = penugasanList.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.kodeEquipment && !item.equipment?.kode.toLowerCase().includes(filters.kodeEquipment.toLowerCase())) return false;
    if (filters.nama && !item.karyawan?.nama.toLowerCase().includes(filters.nama.toLowerCase())) return false;
    if (filters.lokasi !== 'all' && item.lokasi?.nama !== filters.lokasi) return false;
    if (filters.kegiatan !== 'all' && item.kegiatan?.nama !== filters.kegiatan) return false;
    if (filters.tanggalMulai && moment(item.tanggal_tugas).isBefore(filters.tanggalMulai)) return false;
    if (filters.tanggalAkhir && moment(item.tanggal_tugas).isAfter(filters.tanggalAkhir)) return false;
    return true;
  });

  const getDateGroupTitle = (date) => {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    
    if (date === today) return 'Hari Ini';
    if (date === yesterday) return 'Kemarin';
    return moment(date).format('dddd, DD MMM YYYY');
  };

  const groupedPenugasan = filteredPenugasanList.reduce((groups, item) => {
    const date = moment(item.tanggal_tugas).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedPenugasan).sort((a, b) => 
    moment(b).diff(moment(a))
  );

  const renderInfoTab = () => (
    <VStack space={6}>
      <VStack space={4}>
        <Text
          fontSize="xl"
          fontFamily="Quicksand-Bold"
          color={textColor}
        >
          Status Penugasan
        </Text>
        
        <View
          style={{
            height: 1,
            backgroundColor: mode === 'dark' ? '#3a3c4a' : '#e5e7eb',
          }}
        />

        <HStack space={3} justifyContent="space-around" flexWrap="wrap">
          <StatCard
            icon={<People size={48} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} variant="Bold" />}
            label="Total"
            value={statusData.totalKaryawan}
            iconBgColor={mode === 'dark' ? '#1e3a8a' : '#dbeafe'}
            mode={mode}
          />
          
          <StatCard
            icon={<TickCircle size={48} color={mode === 'dark' ? '#6ee7b7' : '#10b981'} variant="Bold" />}
            label="Diterima"
            value={statusData.accepted}
            iconBgColor={mode === 'dark' ? '#065f46' : '#d1fae5'}
            mode={mode}
          />
          
          <StatCard
            icon={<CloseCircle size={48} color={mode === 'dark' ? '#fca5a5' : '#ef4444'} variant="Bold" />}
            label="Ditolak"
            value={statusData.rejected}
            iconBgColor={mode === 'dark' ? '#991b1b' : '#fee2e2'}
            mode={mode}
          />
        </HStack>
      </VStack>

      {statusData.totalKaryawan > 0 && (
        <VStack space={4}>
          <Text
            fontSize="xl"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            Distribusi Status
          </Text>
          
          <View
            style={{
              height: 1,
              backgroundColor: mode === 'dark' ? '#3a3c4a' : '#e5e7eb',
            }}
          />

          <VStack
            bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}
            p={6}
            rounded="2xl"
            borderWidth={1}
            borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'}
            shadow={2}
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Center>
              <PieChart
                data={pieData}
                donut
                radius={width * 0.32}
                innerRadius={width * 0.18}
                centerLabelComponent={() => (
                  <VStack 
                    alignItems="center"
                    bg={mode === 'dark' ? '#374151' : '#ffffff'}
                    p={4}
                    rounded="full"
                    borderWidth={2}
                    borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
                  >
                    <Text
                      fontSize="3xl"
                      fontFamily="Quicksand-Bold"
                      color={mode === 'dark' ? '#ffffff' : '#1f2937'}
                    >
                      {statusData.totalKaryawan}
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="Poppins-Light"
                      color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                    >
                      Penugasan
                    </Text>
                  </VStack>
                )}
                showText
                textColor="#ffffff"
                textSize={16}
                fontFamily="Quicksand-Bold"
                strokeWidth={3}
                strokeColor={mode === 'dark' ? '#1f2937' : '#f9fafb'}
                focusOnPress
                sectionAutoFocus
                initialAngle={0}
                extraRadius={15}
              />
            </Center>

            <VStack space={3} mt={6}>
              {pieData.map((item, index) => (
                <HStack
                  key={index}
                  alignItems="center"
                  justifyContent="space-between"
                  bg={mode === 'dark' ? '#374151' : '#ffffff'}
                  px={4}
                  py={3}
                  rounded="xl"
                  borderWidth={1}
                  borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
                >
                  <HStack alignItems="center" space={3}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: item.color,
                        shadowColor: item.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    />
                    <Text
                      fontSize="sm"
                      fontFamily="Poppins-Regular"
                      color={textColor}
                    >
                      {item.label}
                    </Text>
                  </HStack>
                  <HStack alignItems="center" space={2}>
                    <Text
                      fontSize="xl"
                      fontFamily="Quicksand-Bold"
                      color={item.color}
                    >
                      {item.value}
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="Poppins-Light"
                      color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                    >
                      ({((item.value / statusData.totalKaryawan) * 100).toFixed(0)}%)
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>
      )}

      {statusData.totalKaryawan === 0 && !loading && (
        <VStack
          bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}
          p={8}
          rounded="2xl"
          borderWidth={1}
          borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'}
          alignItems="center"
          space={3}
        >
          <Clipboard size={64} color={mode === 'dark' ? '#6b7280' : '#9ca3af'} variant="Bulk" />
          <Text
            fontSize="lg"
            fontFamily="Quicksand-Bold"
            color={textColor}
            textAlign="center"
          >
            Belum Ada Penugasan
          </Text>
          <Text
            fontSize="sm"
            fontFamily="Poppins-Light"
            color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
            textAlign="center"
          >
            Silakan buat penugasan baru di tab "Buat Penugasan"
          </Text>
        </VStack>
      )}
    </VStack>
  );

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: mode === 'dark' ? '#92400e' : '#fef3c7',
        text: mode === 'dark' ? '#fbbf24' : '#d97706',
        label: 'Pending'
      },
      accepted: {
        bg: mode === 'dark' ? '#065f46' : '#d1fae5',
        text: mode === 'dark' ? '#6ee7b7' : '#059669',
        label: 'Diterima'
      },
      rejected: {
        bg: mode === 'dark' ? '#991b1b' : '#fee2e2',
        text: mode === 'dark' ? '#fca5a5' : '#dc2626',
        label: 'Ditolak'
      },
      completed: {
        bg: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
        text: mode === 'dark' ? '#60a5fa' : '#2563eb',
        label: 'Selesai'
      }
    };
    return configs[status] || configs.pending;
  };

  const handleFilterApply = () => {
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setFilters({
      status: 'all',
      kodeEquipment: '',
      nama: '',
      lokasi: 'all',
      kegiatan: 'all',
      tanggalMulai: '',
      tanggalAkhir: '',
    });
  };

  const renderCreateTab = () => (
    <VStack space={4} flex={1}>
      <TouchableOpacity
        onPress={() => router.push('/penugasan/create')}
        style={{
          backgroundColor: mode === 'dark' ? '#ea580c' : '#f97316',
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <HStack space={3} alignItems="center" justifyContent="center">
          <Calendar size={24} color="#ffffff" variant="Bold" />
          <Text
            fontSize="lg"
            fontFamily="Quicksand-Bold"
            color="#ffffff"
          >
            Buat Penugasan Baru
          </Text>
        </HStack>
      </TouchableOpacity>

      <HStack justifyContent="space-between" alignItems="center" mt={2}>
        <VStack>
          <Text
            fontSize="lg"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            Daftar Penugasan
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Poppins-Light"
            color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
          >
            {filteredPenugasanList.length} penugasan ditampilkan
          </Text>
        </VStack>

        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{
            backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
            padding: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
          }}
        >
          <Filter size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} variant="Bold" />
        </TouchableOpacity>
      </HStack>

      {error && (
        <VStack
          bg={mode === 'dark' ? '#991b1b' : '#fee2e2'}
          p={4}
          rounded="xl"
          borderWidth={1}
          borderColor={mode === 'dark' ? '#dc2626' : '#fca5a5'}
          space={2}
        >
          <Text
            fontSize="md"
            fontFamily="Quicksand-Bold"
            color={mode === 'dark' ? '#fca5a5' : '#dc2626'}
          >
            Error: {error}
          </Text>
          <TouchableOpacity
            onPress={loadData}
            style={{
              backgroundColor: mode === 'dark' ? '#dc2626' : '#ef4444',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
          >
            <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
              Coba Lagi
            </Text>
          </TouchableOpacity>
        </VStack>
      )}

      {loading && (
        <Center py={10}>
          <ActivityIndicator size="large" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} />
          <Text
            fontSize="sm"
            fontFamily="Poppins-Light"
            color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
            mt={3}
          >
            Memuat data penugasan...
          </Text>
        </Center>
      )}

      {!loading && !error && filteredPenugasanList.length === 0 && (
        <VStack
          bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}
          p={8}
          rounded="2xl"
          borderWidth={1}
          borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'}
          alignItems="center"
          space={3}
        >
          <Clipboard size={64} color={mode === 'dark' ? '#6b7280' : '#9ca3af'} variant="Bulk" />
          <Text
            fontSize="lg"
            fontFamily="Quicksand-Bold"
            color={textColor}
            textAlign="center"
          >
            Tidak Ada Penugasan
          </Text>
          <Text
            fontSize="sm"
            fontFamily="Poppins-Light"
            color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
            textAlign="center"
          >
            Belum ada penugasan yang sesuai dengan filter
          </Text>
        </VStack>
      )}

      {!loading && (
        <VStack space={4}>
          {sortedDates.map((date) => (
            <VStack key={date} space={3}>
              <HStack
                alignItems="center"
                space={2}
                px={3}
                py={2}
                bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
                rounded="lg"
              >
                <View
                  style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    backgroundColor: mode === 'dark' ? '#60a5fa' : '#3b82f6',
                  }}
                />
                <Text
                  fontSize="sm"
                  fontFamily="Quicksand-Bold"
                  color={textColor}
                >
                  {getDateGroupTitle(date)}
                </Text>
                <Text
                  fontSize="xs"
                  fontFamily="Poppins-Light"
                  color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                >
                  ({groupedPenugasan[date].length} penugasan)
                </Text>
              </HStack>

              {groupedPenugasan[date].map((item) => {
                const statusConfig = getStatusConfig(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/penugasan/detail?id=${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <VStack
                      bg={mode === 'dark' ? '#1f2937' : '#ffffff'}
                      p={4}
                      rounded="2xl"
                      borderWidth={1}
                      borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'}
                      shadow={2}
                      space={3}
                      style={{
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack flex={1} space={1}>
                        <Text
                          fontSize="xs"
                          fontFamily="Poppins-Light"
                          color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                        >
                          {item.plan_code}
                        </Text>
                        <Text
                          fontSize="md"
                          fontFamily="Quicksand-Bold"
                          color={textColor}
                        >
                          {item.karyawan?.nama || '-'}
                        </Text>
                      </VStack>
                      
                      <View
                        style={{
                          backgroundColor: statusConfig.bg,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="Quicksand-SemiBold"
                          color={statusConfig.text}
                        >
                          {statusConfig.label}
                        </Text>
                      </View>
                    </HStack>

                    <VStack space={2}>
                      <HStack space={2} alignItems="center">
                        <TruckFast size={16} color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} variant="Bold" />
                        <Text
                          fontSize="xs"
                          fontFamily="Poppins-Regular"
                          color={textColor}
                          flex={1}
                        >
                          {item.equipment?.kode || '-'} • {item.equipment?.model || '-'}
                        </Text>
                      </HStack>

                      <HStack space={2} alignItems="center">
                        <Location size={16} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />
                        <Text
                          fontSize="xs"
                          fontFamily="Poppins-Regular"
                          color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                          flex={1}
                        >
                          {item.lokasi?.nama || '-'}
                          {item.lokasiTujuan ? ` → ${item.lokasiTujuan.nama}` : ''}
                        </Text>
                      </HStack>

                      <HStack space={2} alignItems="center">
                        <Activity size={16} color={mode === 'dark' ? '#f59e0b' : '#d97706'} variant="Bold" />
                        <Text
                          fontSize="xs"
                          fontFamily="Poppins-Regular"
                          color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                          flex={1}
                        >
                          {item.kegiatan?.nama || '-'} • {item.shift?.nama || '-'}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                  </TouchableOpacity>
                );
              })}
            </VStack>
          ))}
        </VStack>
      )}
    </VStack>
  );

  return (
    <AppScreen>
      <HeaderScreen 
        title="Penugasan" 
        onBack={() => router.back()}
        onThemes={true}
        onNotification={true}
      />
      
      <VStack flex={1} bg={backgroundColor}>
        <HStack
          bg={mode === 'dark' ? '#2a2c3e' : '#ffffff'}
          borderBottomWidth={1}
          borderBottomColor={mode === 'dark' ? '#3a3c4e' : '#e5e7eb'}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setActiveTab('info')}
          >
            <VStack
              py={4}
              alignItems="center"
              borderBottomWidth={3}
              borderBottomColor={activeTab === 'info' ? (mode === 'dark' ? '#3b82f6' : '#2563eb') : 'transparent'}
            >
              <HStack space={2} alignItems="center">
                <Clipboard 
                  size={20} 
                  color={activeTab === 'info' ? (mode === 'dark' ? '#60a5fa' : '#2563eb') : (mode === 'dark' ? '#6b7280' : '#9ca3af')} 
                  variant={activeTab === 'info' ? 'Bold' : 'Outline'}
                />
                <Text
                  fontSize="sm"
                  fontFamily={activeTab === 'info' ? 'Quicksand-Bold' : 'Poppins-Light'}
                  color={activeTab === 'info' ? (mode === 'dark' ? '#60a5fa' : '#2563eb') : (mode === 'dark' ? '#6b7280' : '#9ca3af')}
                >
                  Informasi Tugas
                </Text>
              </HStack>
            </VStack>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setActiveTab('create')}
          >
            <VStack
              py={4}
              alignItems="center"
              borderBottomWidth={3}
              borderBottomColor={activeTab === 'create' ? (mode === 'dark' ? '#f97316' : '#ea580c') : 'transparent'}
            >
              <HStack space={2} alignItems="center">
                <Calendar 
                  size={20} 
                  color={activeTab === 'create' ? (mode === 'dark' ? '#fb923c' : '#ea580c') : (mode === 'dark' ? '#6b7280' : '#9ca3af')} 
                  variant={activeTab === 'create' ? 'Bold' : 'Outline'}
                />
                <Text
                  fontSize="sm"
                  fontFamily={activeTab === 'create' ? 'Quicksand-Bold' : 'Poppins-Light'}
                  color={activeTab === 'create' ? (mode === 'dark' ? '#fb923c' : '#ea580c') : (mode === 'dark' ? '#6b7280' : '#9ca3af')}
                >
                  Buat Penugasan
                </Text>
              </HStack>
            </VStack>
          </TouchableOpacity>
        </HStack>

        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={mode === 'dark' ? '#60a5fa' : '#3b82f6'}
            />
          }
        >
          <VStack p={4}>
            {activeTab === 'info' ? renderInfoTab() : renderCreateTab()}
          </VStack>
        </ScrollView>
      </VStack>

      <FilterPenugasanModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFilterChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
        onApply={handleFilterApply}
        onReset={handleResetFilter}
        mode={mode}
      />
    </AppScreen>
  );
}
