import { useState, useEffect, useCallback, Fragment } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, Modal, Pressable as RNPressable, Alert } from 'react-native';
import { HStack, Text, VStack, Pressable, Box, Center } from 'native-base';
import { useRouter } from 'expo-router';
import { Filter, Calendar, Clock, Location, More, DocumentDownload, Chart21 } from 'iconsax-react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { COLORS } from '../../../src/constants/colors'
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { getBreakdownList, getBreakdownStatistics } from '../../../src/store/slices/breakdownSlice';
import { useFilterData, useFilterFormat } from './hooks/useFilterData';
import FilterBottomSheet from './components/FilterBottomSheet';
import { calculateDuration } from '../../../src/utils/dailyBreakdown/utils';

export default function DailyBreakdownScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector(state => state.breakdown);
    const [refreshing, setRefreshing] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [reportMenuVisible, setReportMenuVisible] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
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

    const buildApiBaseUrl = () => {
        const rawBase = process.env.EXPO_PUBLIC_API_URL || 'https://apinext.makkuragatama.id/api';
        let base = rawBase.trim();
        if (!base.endsWith('/')) base = `${base}/`;
        if (!/\bapi\/?$/i.test(base)) base = `${base}api/`;
        return base;
    };

    const buildQueryString = (params = {}) =>
        Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');

    const downloadPdfFile = async ({ url, filename, dialogTitle }) => {
        if (downloadingReport) return;
        setDownloadingReport(true);
        try {
            const cacheDirectory = FileSystem.cacheDirectory;
            if (!cacheDirectory || typeof FileSystem.downloadAsync !== 'function') {
                throw new Error('Modul FileSystem tidak tersedia di perangkat ini');
            }

            console.log('[DailyBreakdown] download URL:', url);

            const fileUri = `${cacheDirectory}${filename}`;
            const token = await AsyncStorage.getItem('@token');
            const result = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    Accept: 'application/pdf',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const uri = result?.uri;
            const status = result?.status;

            if (status !== 200 || !uri) {
                throw new Error(`Gagal mengunduh PDF (status ${status || 'unknown'})`);
            }

            const available = await Sharing.isAvailableAsync();
            if (available) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: dialogTitle || 'Download PDF',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Unduh Berhasil', `File tersimpan di ${uri}`);
            }
        } catch (err) {
            console.error('[DailyBreakdown] downloadPdfFile error:', err);
            Alert.alert('Gagal', err?.message || 'Gagal mengunduh PDF');
        } finally {
            setDownloadingReport(false);
        }
    };

    /** Outstanding Breakdown — sama seperti tombol print lama */
    const printPDFHandle = async () => {
        const apiFilters = formatApiFilters(filters);
        const startdate = apiFilters.startdate || moment().format('YYYY-MM-DD');
        const enddate = apiFilters.enddate || moment().format('YYYY-MM-DD');
        const params = { ...apiFilters, startdate, enddate };
        const query = buildQueryString(params);
        const base = buildApiBaseUrl();
        const url = `${base}operation/daily-breakdown/download${query ? `?${query}` : ''}`;

        await downloadPdfFile({
            url,
            filename: `laporan-breakdown-${startdate}-${enddate}.pdf`,
            dialogTitle: 'Outstanding Breakdown Report',
        });
    };

    /**
     * Equipment Downtime Report — sama dengan #web-next /laporan/summary-breakdown download
     * Endpoint: GET /api/laporan/summary-breakdown/download
     */
    const downloadEquipmentDowntimePdf = async () => {
        const apiFilters = formatApiFilters(filters);
        // Default tanggal sama web-next: awal bulan → hari ini
        const startdate = apiFilters.startdate || moment().startOf('month').format('YYYY-MM-DD');
        const enddate = apiFilters.enddate || moment().format('YYYY-MM-DD');

        const params = {
            startdate,
            enddate,
        };

        // Map filter mobile → query summary-breakdown (web-next)
        if (apiFilters.equipment_id) {
            params.equipment_ids = apiFilters.equipment_id;
        }
        if (apiFilters.lokasi_id) {
            params.lokasi_ids = apiFilters.lokasi_id;
        }
        // status di summary-breakdown: open | close (bukan status code daily breakdown)
        // lewati mapping status numeric agar tidak salah filter

        const query = buildQueryString(params);
        const base = buildApiBaseUrl();
        const url = `${base}laporan/summary-breakdown/download${query ? `?${query}` : ''}`;

        await downloadPdfFile({
            url,
            filename: `report-summary-breakdown-${startdate}-to-${enddate}.pdf`,
            dialogTitle: 'Equipment Downtime Report',
        });
    };

    const handleOutstandingReport = () => {
        setReportMenuVisible(false);
        requestAnimationFrame(() => {
            setTimeout(() => {
                printPDFHandle();
            }, 350);
        });
    };

    const handleEquipmentDowntimeReport = () => {
        setReportMenuVisible(false);
        requestAnimationFrame(() => {
            setTimeout(() => {
                downloadEquipmentDowntimePdf();
            }, 350);
        });
    };

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
                        disabled={downloadingReport}
                        onPress={() => setReportMenuVisible(true)}>
                        <VStack
                            p={2}
                            flex={1} 
                            bg={mode === 'dark' ? '#374151' : '#e5e7eb'}
                            justifyContent={'center'} 
                            alignItems={'center'}
                            rounded={'md'}
                            opacity={downloadingReport ? 0.6 : 1}
                        >
                            {downloadingReport ? (
                                <ActivityIndicator size="small" color={textColor} />
                            ) : (
                                <More size={26} color={textColor} variant="Bold" />
                            )}
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
            
            {/* Report menu bottom sheet */}
            <Modal
                visible={reportMenuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setReportMenuVisible(false)}
            >
                <Box flex={1} justifyContent="flex-end">
                    <RNPressable
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onPress={() => setReportMenuVisible(false)}
                    />
                    <Box
                        bg={cardBg}
                        borderTopRadius={24}
                        px={4}
                        pt={3}
                        pb={6}
                        borderTopWidth={1}
                        borderColor={cardBorder}
                    >
                        <Center mb={3}>
                            <Box w={10} h={1} rounded="full" bg={mode === 'dark' ? '#4b5563' : '#d1d5db'} />
                        </Center>

                        <Text fontSize={16} fontFamily="Quicksand-Bold" color={textColor} mb={1}>
                            Laporan Breakdown
                        </Text>
                        <Text fontSize={12} fontFamily="Poppins-Regular" color={mode === 'dark' ? '#9ca3af' : '#6b7280'} mb={4}>
                            Pilih jenis laporan yang ingin diunduh
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={downloadingReport}
                            onPress={handleOutstandingReport}
                        >
                            <HStack
                                alignItems="center"
                                space={3}
                                p={3.5}
                                mb={2}
                                rounded="xl"
                                borderWidth={1}
                                borderColor={cardBorder}
                                bg={mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)'}
                                opacity={downloadingReport ? 0.7 : 1}
                            >
                                <Center
                                    w={11}
                                    h={11}
                                    rounded="xl"
                                    bg={mode === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.12)'}
                                >
                                    {downloadingReport ? (
                                        <ActivityIndicator size="small" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
                                    ) : (
                                        <DocumentDownload size={22} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
                                    )}
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize={14} fontFamily="Quicksand-Bold" color={textColor}>
                                        Outstanding Breakdown Report
                                    </Text>
                                    <Text fontSize={11} fontFamily="Poppins-Regular" color={mode === 'dark' ? '#9ca3af' : '#6b7280'}>
                                        {downloadingReport
                                            ? 'Mengunduh PDF...'
                                            : 'Unduh PDF laporan breakdown (filter aktif)'}
                                    </Text>
                                </VStack>
                            </HStack>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={downloadingReport}
                            onPress={handleEquipmentDowntimeReport}
                        >
                            <HStack
                                alignItems="center"
                                space={3}
                                p={3.5}
                                mb={2}
                                rounded="xl"
                                borderWidth={1}
                                borderColor={cardBorder}
                                bg={mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)'}
                                opacity={downloadingReport ? 0.7 : 1}
                            >
                                <Center
                                    w={11}
                                    h={11}
                                    rounded="xl"
                                    bg={mode === 'dark' ? 'rgba(168,85,247,0.2)' : 'rgba(147,51,234,0.12)'}
                                >
                                    {downloadingReport ? (
                                        <ActivityIndicator size="small" color={mode === 'dark' ? '#c084fc' : '#9333ea'} />
                                    ) : (
                                        <Chart21 size={22} color={mode === 'dark' ? '#c084fc' : '#9333ea'} variant="Bold" />
                                    )}
                                </Center>
                                <VStack flex={1}>
                                    <Text fontSize={14} fontFamily="Quicksand-Bold" color={textColor}>
                                        Equipment Downtime Report
                                    </Text>
                                    <Text fontSize={11} fontFamily="Poppins-Regular" color={mode === 'dark' ? '#9ca3af' : '#6b7280'}>
                                        {downloadingReport
                                            ? 'Mengunduh PDF...'
                                            : 'Unduh PDF summary downtime (sama web-next)'}
                                    </Text>
                                </VStack>
                            </HStack>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.85} onPress={() => setReportMenuVisible(false)}>
                            <Center
                                mt={2}
                                py={3}
                                rounded="xl"
                                bg={mode === 'dark' ? '#374151' : '#e5e7eb'}
                            >
                                <Text fontFamily="Quicksand-Bold" color={textColor}>
                                    Batal
                                </Text>
                            </Center>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Modal>

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
