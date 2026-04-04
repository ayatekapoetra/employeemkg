import { useState, useEffect, useCallback, Fragment } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { HStack, Text, VStack, ScrollView } from 'native-base';
import { useRouter } from 'expo-router';
import { Filter } from 'iconsax-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../src/constants/colors';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import EventCard from './components/EventCard';

import FilterBottomSheet from './components/FilterBottomSheet';

import { getEventList, getEventCategories } from '../../../src/store/slices/eventSlice';

export default function DailyEventsScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    
    // State untuk data dan loading
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filterVisible, setFilterVisible] = useState(false);
    
    // State untuk filter
    const [filters, setFilters] = useState({
        status: [],
        cabang_id: null,
        cabang_nama: '',
        lokasi_id: null,
        lokasi_nama: '',
        event_category_id: null,
        startdate: '',
        enddate: '',
    });

    const mode = useSelector(state => state.themes)?.value || 'light';
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const subtitleColor = mode === 'dark' ? '#9CA3AF' : '#6B7280';
    const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;

    // Fungsi untuk fetch data events
    const fetchEvents = useCallback(async (filterParams = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            // Format filter parameters untuk API
            const params = {};
            if (filterParams.status && filterParams.status.length > 0) {
                params.status = filterParams.status;
            }
            if (filterParams.cabang_id) {
                params.cabang_id = filterParams.cabang_id;
            }
            if (filterParams.lokasi_id) {
                params.lokasi_id = filterParams.lokasi_id;
            }
            if (filterParams.event_category_id) {
                params.event_category_id = filterParams.event_category_id;
            }
            if (filterParams.startdate) {
                params.date_from = filterParams.startdate;
            }
            if (filterParams.enddate) {
                params.date_to = filterParams.enddate;
            }
            
            // API call untuk mendapatkan events
            const response = await dispatch(getEventList(params)).unwrap();
            const eventsData = response.data || response;
            setEvents(Array.isArray(eventsData) ? eventsData : []);
            
        } catch (err) {
            console.error('[DailyEvents] Error fetching events:', err);
            setError('Gagal memuat data events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    

    // Fungsi untuk fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            // API call untuk mendapatkan categories
            const response = await dispatch(getEventCategories()).unwrap();
            setCategories(Array.isArray(response) ? response : []);
            
        } catch (err) {
            console.error('[DailyEvents] Error fetching categories:', err);
            setCategories([]);
        }
    }, [dispatch]);

    // Load data saat component mount
    useEffect(() => {
        console.log('[DailyEvents] Component mounted, fetching data...');
        
        // Fetch critical data (events dan categories)
        fetchEvents();
        fetchCategories();
    }, [fetchEvents, fetchCategories]);

    // Fungsi untuk refresh
    const onRefresh = async () => {
        console.log('[DailyEvents] Refreshing data...');
        setRefreshing(true);
        
        await Promise.all([
            fetchEvents(filters),
            fetchCategories()
        ]);
        
        setRefreshing(false);
        console.log('[DailyEvents] Refresh completed');
    };

    // Fungsi untuk apply filter
    const handleApplyFilter = async (newFilters) => {
        console.log('[DailyEvents] Applying filters:', newFilters);
        setFilters(newFilters);
        setFilterVisible(false);
        
        // Fetch ulang data dengan filter baru
        await fetchEvents(newFilters);
    };

    // Check if any filter is active
    const hasActiveFilters = () => {
        const hasStatus = Array.isArray(filters.status) && filters.status.length > 0;
        return hasStatus || filters.cabang_id || filters.lokasi_id || filters.event_category_id || filters.startdate || filters.enddate;
    };

    // Header component untuk FlatList
    const ListHeaderComponent = () => (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            {/* Loading State */}
            {loading && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={{ marginTop: 10, color: subtitleColor }}>
                        Memuat data...
                    </Text>
                </View>
            )}

            {/* Error State */}
            {error && (
                <View style={{ 
                    backgroundColor: mode === 'dark' ? '#7F1D1D' : '#FEE2E2', 
                    padding: 16, 
                    borderRadius: 12,
                    marginBottom: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: mode === 'dark' ? '#F87171' : '#EF4444'
                }}>
                    <Text style={{ color: mode === 'dark' ? '#FCA5A5' : '#991B1B', fontSize: 14, fontWeight: 'bold' }}>
                        Error: {error}
                    </Text>
                </View>
            )}
        </View>
    );

    // Empty component untuk FlatList
    const ListEmptyComponent = () => {
        if (loading) return null;
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: subtitleColor, fontSize: 14 }}>
                    Tidak ada data events
                </Text>
            </View>
        );
    };

    return (
        <Fragment>
            <AppScreen>
                <HeaderScreen 
                    title="Daily Events" 
                    onBack={() => router.back()} 
                    onThemes={true}
                    onNotification={true}
                />
                
                {/* Create Button and Filter */}
                <HStack mt={3} mx={4} space={2}>
                    <TouchableOpacity 
                        style={{ 
                            flex: 1,
                            backgroundColor: mode === 'dark' ? '#1E40AF' : '#2563EB',
                            borderRadius: 8,
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => router.push('/operational/daily-events/create')}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text color="#FFFFFF" fontFamily="Poppins-SemiBold">
                            Buat Event
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={{ 
                            height: 48, 
                            width: 48, 
                            borderRadius: 8,
                            backgroundColor: hasActiveFilters() ? '#3B82F6' : (mode === 'dark' ? '#374151' : '#F3F4F6'),
                            justifyContent: 'center', 
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB'
                        }}
                        onPress={() => {
                            setFilterVisible(true);
                        }}
                    >
                        <Filter color={hasActiveFilters() ? '#FFFFFF' : textColor} />
                        {hasActiveFilters() && (
                            <View style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                backgroundColor: '#EF4444',
                                borderRadius: 6,
                                width: 12,
                                height: 12,
                            }} />
                        )}
                    </TouchableOpacity>
                </HStack>

                {/* Events List */}
                <HStack mt={1} mx={4}>
                    <FlatList
                        data={events || []}
                        renderItem={({ item }) => <EventCard event={item} />}
                        keyExtractor={(item) => item.id?.toString() || item.event_id?.toString()}
                        ListHeaderComponent={ListHeaderComponent}
                        ListEmptyComponent={ListEmptyComponent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={mode === 'dark' ? '#60A5FA' : '#3B82F6'}
                            />
                        }
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                    />
                </HStack>
            </AppScreen>
            
            {/* Filter Bottom Sheet */}
            <FilterBottomSheet
                visible={filterVisible}
                onClose={() => {
                    console.log('[DailyEvents] Closing filter');
                    setFilterVisible(false);
                }}
                onApply={handleApplyFilter}
                currentFilters={{ ...filters, eventCategories: categories }}
            />
        </Fragment>
    );
}