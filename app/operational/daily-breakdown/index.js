import { useState, useEffect, useCallback, Fragment } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { HStack, Text, VStack, Pressable } from 'native-base';
import { useRouter } from 'expo-router';
import { Filter, Calendar, Clock, Location, Printer } from 'iconsax-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../src/constants/colors'
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { getBreakdownList, getBreakdownStatistics } from '../../../src/store/slices/breakdownSlice';
import { useFilterData, useFilterFormat } from './hooks/useFilterData';
import FilterBottomSheet from './components/FilterBottomSheet';
import moment from 'moment';
import { calculateDuration } from '../../../src/utils/dailyBreakdown/utils';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DailyBreakdownScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector(state => state.breakdown);
    const [refreshing, setRefreshing] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        status: [],
        cabang_id: null,
        cabang_nama: '',
        equipment_id: null,
        equipment_nama: '',
        lokasi_id: null,
        lokasi_nama: '',
        startdate: '',
        enddate: '',
    });
    
    // Use hooks
    const { fetchAllData, loading: filterLoading } = useFilterData();
    const { formatApiFilters, hasActiveFilters: hasActiveFiltersHook } = useFilterFormat();
    const mode = useSelector(state => state.themes)?.value || 'light';
    const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
    const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];

    // Fungsi untuk mendapatkan status text dan warna
    const getStatusInfo = (statusCode) => {
        switch (statusCode) {
            case 0:
                return {
                    text: 'Waiting Technician',
                    textIndo: 'Tunggu Teknisi',
                    bgColor: '#fef3c7', // yellow-100
                    textColor: '#92400e', // yellow-800
                    bgColorDark: '#451a03',
                    textColorDark: '#fef3c7'
                };
            case 1:
                return {
                    text: 'Waiting Part',
                    textIndo: 'Tunggu Part',
                    bgColor: '#fef9c3', // yellow-100
                    textColor: '#854d0e', // amber-800
                    bgColorDark: '#78350f',
                    textColorDark: '#fef3c7'
                };
            case 8:
                return {
                    text: 'In Progress',
                    textIndo: 'Sedang Dikerjakan',
                    bgColor: '#dbeafe', // blue-100
                    textColor: '#1e40af', // blue-800
                    bgColorDark: '#1e3a8a',
                    textColorDark: '#dbeafe'
                };
            case 9:
                return {
                    text: 'Completed',
                    textIndo: 'Selesai',
                    bgColor: '#d1fae5', // green-100
                    textColor: '#065f46', // green-800
                    bgColorDark: '#064e3b',
                    textColorDark: '#d1fae5'
                };
            default:
                return {
                    text: 'Unknown',
                    textIndo: 'Untrack',
                    bgColor: '#f3f4f6', // gray-100
                    textColor: '#1f2937', // gray-800
                    bgColorDark: '#374151',
                    textColorDark: '#f3f4f6'
                };
        }
    };

    // Fungsi untuk load data
    const fetchData = useCallback(async (overrideFilters) => {
        const effectiveFilters = overrideFilters || filters;
        console.log('[DailyBreakdown] Fetching data with filters:', effectiveFilters);
        try {
            // Format filters untuk API
            const apiFilters = formatApiFilters(effectiveFilters);
            console.log('[DailyBreakdown] Formatted API filters:', apiFilters);
            
            await dispatch(getBreakdownList(apiFilters)).unwrap();
            await dispatch(getBreakdownStatistics(apiFilters)).unwrap();
            console.log('[DailyBreakdown] Data fetched successfully');
        } catch (err) {
            console.error('[DailyBreakdown] Error fetching data:', err);
        }
    }, [dispatch, filters, formatApiFilters]);

    // Load data saat component mount
    useEffect(() => {
        console.log('[DailyBreakdown] Component mounted, fetching data...');
        // Fetch data filter dulu
        fetchAllData().then(() => {
            console.log('[DailyBreakdown] Filter data fetched');
            // Fetch breakdown data
            fetchData();
        }).catch(error => {
            console.error('[DailyBreakdown] Error fetching filter data:', error);
            // Tetap fetch breakdown data meskipun filter gagal
            fetchData();
        });
    }, [fetchAllData, fetchData]);

    // Fungsi untuk refresh
    const onRefresh = async () => {
        console.log('[DailyBreakdown] Refreshing data...');
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        console.log('[DailyBreakdown] Refresh completed');
    };

    // Fungsi untuk apply filter
    const handleApplyFilter = async (newFilters) => {
        console.log('[DailyBreakdown] Applying filters:', newFilters);
        setFilters(newFilters);
        setFilterVisible(false);
        await fetchData(newFilters);
    };

    // Check if any filter is active
    const hasActiveFilters = hasActiveFiltersHook(filters);

    const printPDFHandle = async () => {
        try {
            // Lazy import native modules untuk mengurangi potensi crash saat mount
            const FileSystem = await import('expo-file-system/legacy');
            const Sharing = await import('expo-sharing');

            const apiFilters = formatApiFilters(filters);
            const startdate = apiFilters.startdate || moment().format('YYYY-MM-DD');
            const enddate = apiFilters.enddate || moment().format('YYYY-MM-DD');

            // Bangun query string tanpa bergantung pada URLSearchParams (hindari issue Hermes)
            const params = { ...apiFilters, startdate, enddate };
            const query = Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null && v !== '')
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join('&');

            const rawBase = process.env.EXPO_PUBLIC_API_URL || 'https://apinext.makkuragatama.id/api';
            let base = rawBase.trim();
            if (!base.endsWith('/')) base = `${base}/`;
            if (!/\bapi\/?$/i.test(base)) base = `${base}api/`;

            const url = `${base}operation/daily-breakdown/download${query ? `?${query}` : ''}`;

            const filename = `laporan-breakdown-${startdate}-${enddate}.pdf`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;

            const token = await AsyncStorage.getItem('@token');
            const { uri, status } = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    Accept: 'application/pdf',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (status !== 200 || !uri) {
                throw new Error(`Gagal mengunduh PDF (status ${status || 'unknown'}) - ${url}`);
            }

            const available = await Sharing.isAvailableAsync();
            if (available) {
                await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
            } else {
                Alert.alert('Unduh Berhasil', `File tersimpan di ${uri}`);
            }
        } catch (err) {
            console.error('[DailyBreakdown] printPDFHandle error:', err);
            Alert.alert('Gagal', err?.message || 'Gagal mengunduh PDF');
        }
    }

    // Render item untuk FlatList
    const renderBreakdownItem = ({ item }) => {
        const statusInfo = getStatusInfo(item.status);
        return (
            <Pressable 
                onPress={() => router.push(`/operational/daily-breakdown/${item.id}`)}
                _pressed={{ opacity: 0.7 }}>
                <VStack
                    p={4}
                    mx={2}
                    mb={2}
                    bg={cardBg}
                    rounded="xl"
                    borderWidth={1}
                    borderColor={cardBorder}>
                        <VStack flex={1}>
                            <HStack justifyContent={"space-between"} alignItems={"flex-start"}>
                                <Text color={textColor} fontFamily={"Poppins-Bold"} fontSize={16}>
                                    {item.equipment?.kode || 'N/A'}
                                </Text>
                                {/* Status Badge */}
                                <View style={{
                                    backgroundColor: mode === 'dark' ? statusInfo.bgColorDark : statusInfo.bgColor,
                                    paddingHorizontal: 12,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                    marginLeft: 8
                                }}>
                                    <Text style={{
                                        color: mode === 'dark' ? statusInfo.textColorDark : statusInfo.textColor,
                                        fontSize: 11,
                                        fontWeight: '600'
                                    }}>
                                        {statusInfo.textIndo}
                                    </Text>
                                </View>
                            </HStack>
                            
                            <Text color={textColor} fontSize={11} opacity={0.7}>
                                {item.cabang?.area || '-'} {item.cabang?.nama || '-'}
                            </Text>
                            <HStack space={3} justifyContent={'space-between'}>
                                <HStack alignItems={'center'} space={1}>
                                    <Calendar size={14} color={textColor}/>
                                    <Text color={textColor} fontSize={12}>
                                        {item.date_issue ? moment(item.date_issue).format('DD MMMM YYYY') : '-'}
                                    </Text>
                                </HStack>
                                <HStack alignItems={'center'} space={1}>
                                    <Clock size={14} color={textColor}/>
                                    <Text color={textColor} fontSize={12}>
                                        {item.breakdown_at ? moment(item.breakdown_at).format('dddd, HH:mm') : '-'}
                                    </Text>
                                </HStack>
                                
                            </HStack>
                            <HStack 
                                p={2} 
                                mt={2} 
                                rounded={'md'}
                                justifyContent="space-between" 
                                bg={mode === 'dark' ? '#1f2937' : '#f9fafb'}>
                                <HStack flex={1}>
                                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
                                        Problems: {item.items.length} issue 
                                    </Text>
                                </HStack>
                                <HStack flex={1}>
                                    <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
                                        Durasi: {calculateDuration(item.breakdown_at, item.ready_at).text}
                                    </Text>
                                </HStack>
                            </HStack>
                            <HStack mt={2} alignItems={'center'} space={1}>
                                <Location size={14} color={textColor}/>
                                <Text color={textColor} fontSize={12}>
                                    {item.lokasi?.nama || '-'}
                                </Text>
                            </HStack>
                        </VStack>
                </VStack>
            </Pressable>
        );
    };

    // Header component untuk FlatList
    const ListHeaderComponent = () => (
        <View style={{ padding: 10 }}>
            {/* Loading State */}
            {loading && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={{ marginTop: 10, color: '#6b7280' }}>
                        Memuat data...
                    </Text>
                </View>
            )}

            {/* Error State */}
            {error && (
                <View style={{ 
                    backgroundColor: '#fee2e2', 
                    padding: 16, 
                    borderRadius: 12,
                    marginBottom: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444'
                }}>
                    <Text style={{ color: '#991b1b', fontSize: 14, fontWeight: 'bold' }}>
                        Error: {error}
                    </Text>
                </View>
            )}

            <HStack justifyContent={"space-between"} alignItems={"center"} mb={2}>
                <VStack>
                    <Text color={textColor} fontFamily={"Poppins-SemiBold"} fontSize={16}>
                        Daftar Breakdown Equipment
                    </Text>
                    <Text color={textColor} fontFamily={"Poppins-Light"} fontSize={12}>
                        Pull to refresh data
                    </Text>
                </VStack>
            </HStack>
        </View>
    );

    // Empty component untuk FlatList
    const ListEmptyComponent = () => {
        if (loading) return null;
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                    Tidak ada data breakdown
                </Text>
            </View>
        );
    };

    return (
        <Fragment>
            <AppScreen>
                <HeaderScreen 
                    title="Daily Breakdown" 
                    onBack={() => router.back()} 
                    onThemes={true}
                    onNotification={true}
                />
                <HStack mt={3} mx={3} space={2}>
                    <HStack 
                        flex={1}
                        rounded={'md'} 
                        borderWidth={.5}
                        borderColor={mode === 'dark' ? '#6ee7b7' : '#059669'}
                        bg={mode === 'dark' ? '#065f46' : '#d1fae5'}>
                        <TouchableOpacity 
                            onPress={() => router.push('/operational/daily-breakdown/create')}
                            style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10}}>
                            <Text color={mode === 'dark' ? '#6ee7b7' : '#059669'}>Buat Breakdown Equipment</Text>
                        </TouchableOpacity>
                    </HStack>
                    <TouchableOpacity 
                        style={{height: 40, width: 40, borderRadius: 5}}
                        onPress={() => {
                            setFilterVisible(true);
                        }}>
                        <VStack 
                            p={2} 
                            flex={1} 
                            bg={hasActiveFilters ? '#3b82f6' : (mode === 'dark' ? '#1e40af' : '#dbeafe')}
                            justifyContent={'center'} 
                            alignItems={'center'} 
                            rounded={'md'}
                            position="relative"
                        >
                            <Filter color={hasActiveFilters ? '#ffffff' : textColor}/>
                            {hasActiveFilters && (
                                <View style={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    backgroundColor: '#ef4444',
                                    borderRadius: 6,
                                    width: 12,
                                    height: 12,
                                }} />
                            )}
                        </VStack>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{height: 40, width: 40, borderRadius: 5}}
                        onPress={printPDFHandle}>
                        <VStack
                            p={2}
                            flex={1} 
                            bg={'warmGray.300'}
                            justifyContent={'center'} 
                            alignItems={'center'}
                            rounded={'md'}>
                            <Printer size={26} color={COLORS.teks.light[2]}/>
                        </VStack>
                    </TouchableOpacity>
                </HStack>
                <FlatList
                    data={data || []}
                    renderItem={renderBreakdownItem}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    ListHeaderComponent={ListHeaderComponent}
                    ListEmptyComponent={ListEmptyComponent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                />
            </AppScreen>
            
            {/* Filter Bottom Sheet - Outside AppScreen for proper Modal rendering */}
            <FilterBottomSheet
                visible={filterVisible}
                onClose={() => {
                    console.log('[DailyBreakdown] Closing filter');
                    setFilterVisible(false);
                }}
                onApply={handleApplyFilter}
                currentFilters={filters}
            />
        </Fragment>
    );
}
