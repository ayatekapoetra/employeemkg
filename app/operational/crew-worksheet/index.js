import moment from 'moment';
import 'moment/locale/id';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { VStack, HStack, ScrollView, Text, Box, Center, Pressable, Badge, Actionsheet, Button, Select, CheckIcon, Input, useTheme } from 'native-base';
import { View, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Platform, FlatList, Modal, TextInput, Keyboard, useWindowDimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CrewStatCard from './components/CrewStatCard';
import { COLORS } from '../../../src/constants/colors'
import CrewWorksheetCard from './components/CrewWorksheetCard';
import { useCrewWorksheet } from '../../../src/hooks/crewWorksheet/useCrewWorksheet';
import { showAlert } from '../../../src/store/slices/alertSlice';
import { Watch, Filter, Coffee, Timer, DocumentText, User, Edit2, Danger, CloseCircle, TickCircle, ArrowDown2, CloseSquare, Calendar } from 'iconsax-react-native';
import FilterBottomSheet from './components/FilterBottomSheet';
// Using text icon instead to avoid SVG color issues

// Suppress console warnings temporarily for development
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('not a valid color or brush')) {
        return; // Suppress this specific warning
    }
    originalConsoleWarn(...args);
};

// Color validation helper
const getValidColor = (color, fallback = '#000000') => {
    if (!color || color === '' || color === 'undefined' || color === 'null') {
        return fallback;
    }
    return color;
};

// Date formatting utilities
const formatDate = (date) => {
    if (!date) return '-';
    return moment(date).format('dddd, DD MMMM YYYY');
};

const formatTime = (time) => {
    if (!time) return '-';
    
    // If it's already a time string (HH:mm:ss format), return it formatted
    if (typeof time === 'string' && time.includes(':')) {
        const timeParts = time.split(':');
        if (timeParts.length >= 2) {
            return `${timeParts[0]}:${timeParts[1]}`;
        }
    }
    
    // Handle datetime format
    const timeStr = moment(time).format('HH:mm');
    return timeStr !== 'Invalid date' ? timeStr : time;
};

export default function CrewWorksheetScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [filterDraft, setFilterDraft] = useState({ status: '', startdate: '', enddate: '', shift: '', keterangan: '' });
    const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false });

    const mode = useSelector(state => state.themes)?.value || 'light';
    const user = useSelector(state => state.auth?.user || {});
    const screenWidth = Dimensions.get('window').width;
    const isSmall = screenWidth < 375;
    const isIOS = Platform.OS === 'ios';

    // Use COLORS from constants with validation
    const textColor = COLORS.teks[mode][1] || '#2f313e';
    const backgroundColor = COLORS.container[mode] || '#F5F5F5';
    const cardBg = COLORS.card[mode] || '#edecec';
    const cardBorder = COLORS.line[mode][1] || '#DDDDDD';

    const {
        myWorksheets,
        loading,
        error,
        stats,
        fetchMyWorksheets,
        fetchStats,
        filters,
        setFilters,
    } = useCrewWorksheet();

    const listData = myWorksheets || [];

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!filterSheetOpen) {
            setShowDatePicker({ type: null, visible: false });
        }
    }, [filterSheetOpen]);

    const loadData = async (extraFilters = {}) => {
        const params = extraFilters || {};
        try {
            const result = await fetchMyWorksheets(params);
            console.log('✅ API fetch completed', result);
        } catch (error) {
            console.error('❌ Error loading crew worksheet data:', error);
            dispatch(showAlert({
                status: 'error',
                title: 'Error',
                subtitle: error.message || 'Gagal memuat data crew worksheet',
                duration: 4000
            }));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(filters);
        setRefreshing(false);
    };

    const openFilter = () => {
        const newFilterDraft = {
            status: filters.status || '',
            startdate: filters.startdate || '',
            enddate: filters.enddate || '',
            shift: filters.shift || '',
            keterangan: filters.keterangan || ''
        };
        setFilterDraft(newFilterDraft);
        setFilterSheetOpen(true);
    };

    const applyFilter = async () => {
        const cleaned = {
            ...filters,
            status: filterDraft.status,
            startdate: filterDraft.startdate,
            enddate: filterDraft.enddate,
            shift: filterDraft.shift,
            keterangan: filterDraft.keterangan,
        };
        setFilters(cleaned);
        setFilterSheetOpen(false);
        await loadData(cleaned);
    };

    const resetFilter = async () => {
        const cleaned = { ...filters, status: '', startdate: '', enddate: '', shift: '', keterangan: '' };
        setFilterDraft(cleaned);
        setFilters(cleaned);
        setFilterSheetOpen(false);
        await loadData(cleaned);
    };

    const isFilterActive = () => {
        return filters.status !== '' || 
               filters.startdate !== '' || 
               filters.enddate !== '' || 
               filters.shift !== '' ||
               filters.keterangan !== '';
    };

    const handleCreate = () => {
        router.push('/operational/crew-worksheet/create');
    };

    const handleEdit = (worksheet) => {
        router.push({
            pathname: '/operational/crew-worksheet/create',
            params: { worksheet: JSON.stringify(worksheet) }
        });
    };

    



    const getStatusColor = (status) => {
        switch (status) {
            case 'P': return COLORS.main.warning; // Warning color
            case 'A': return COLORS.main.success; // Success color  
            case 'R': return COLORS.main.danger; // Danger color
            case 'V': return COLORS.main.info; // Danger color
            default: return COLORS.main.gray; // Gray color
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'P': return 'Pending';
            case 'A': return 'Approved';
            case 'R': return 'Rejected';
            case 'V': return 'Validated';
            default: return status;
        }
    };

    const renderWorksheetItem = (worksheet) => {
        return (
            <Pressable
                onPress={() => router.push({
                    pathname: '/operational/crew-worksheet/show',
                    params: { id: worksheet.id, data: JSON.stringify(worksheet) }
                })}
                _pressed={{ opacity: 0.8 }}>
                <VStack
                    mt={2}
                    bg={COLORS.card[mode]}
                    rounded="xl"
                    borderWidth={1}
                    borderColor={COLORS.line[mode][1]}
                    overflow="hidden"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.12,
                        shadowRadius: 8,
                        elevation: 6
                    }}>

                    {/* Modern Header with High Contrast */}
                    <Box
                        px={4}
                        py={3}
                        bg={COLORS.card[mode]}
                        borderBottomWidth={1}
                        borderColor={COLORS.line[mode][1]}>
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack space={1}>
                                <HStack alignItems="center" space={3}>
                                    
                                    <VStack>
                                        <Text
                                            color={COLORS.teks[mode][1]}
                                            fontFamily="Quicksand-Bold"
                                            fontSize={isSmall ? 16 : 18}>
                                            {formatDate(worksheet.tanggal)}
                                        </Text>
                                        <Text
                                            color={COLORS.main.primary}
                                            fontFamily="Quicksand-Bold"
                                            fontSize={isSmall ? 13 : 14}>
                                            {worksheet.crew?.nama || 'Unknown Crew'}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>

                            {/* Modern Status Badge with High Contrast */}
                            <Box
                                bg={getStatusColor(worksheet.status)}
                                px={4}
                                py={1}
                                rounded="full"
                                style={{
                                    shadowColor: getStatusColor(worksheet.status),
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4
                                }}>
                                <Text
                                    color="white"
                                    fontSize={isSmall ? 12 : 13}
                                    fontFamily="Quicksand-Bold"
                                    textTransform="uppercase"
                                    letterSpacing={0.5}>
                                    {getStatusText(worksheet.status)}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>
                    {/* Enhanced Content */}
                    <VStack p={4} space={3}>
                        <HStack justifyContent={'space-between'}>
                            {/* Time & Productive Hours - Enhanced */}
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack alignItems="center" space={2}>
                                    <Box
                                        width={10}
                                        height={10}
                                        rounded="lg"
                                        bg={COLORS.main.primary}
                                        justifyContent="center"
                                        alignItems="center">
                                        <Watch size={20} color={'#FFF'} variant="Bold"/>
                                    </Box>
                                    <VStack>
                                        <Text
                                            color={COLORS.teks[mode][1]}
                                            fontFamily="Quicksand-Bold"
                                            fontSize={isSmall ? 13 : 14}>
                                            {formatTime(worksheet.jam_mulai)} - {formatTime(worksheet.jam_selesai)}
                                        </Text>
                                        <Text
                                            lineHeight={12}
                                            color={COLORS.teks[mode][2]}
                                            fontFamily="Quicksand-Regular"
                                            fontSize={isSmall ? 10 : 11}>
                                            Jam Kerja
                                        </Text>
                                    </VStack>
                                </HStack>
                            </HStack>

                            {/* Break & Overtime - Enhanced */}
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack alignItems="center" space={2}>
                                    <Box
                                        width={10}
                                        height={10}
                                        rounded="lg"
                                        bg={COLORS.main.warning}
                                        justifyContent="center"
                                        alignItems="center">
                                        <Coffee size={20} color={'#FFF'} variant="Bold"/>
                                    </Box>
                                    <VStack>
                                        <Text
                                            color={COLORS.teks[mode][1]}
                                            fontFamily="Quicksand-Medium"
                                            fontSize={isSmall ? 12 : 13}>
                                            {formatTime(worksheet.istirahat_mulai)} - {formatTime(worksheet.istirahat_selesai)}
                                        </Text>
                                        <Text
                                            lineHeight={12}
                                            color={COLORS.teks[mode][2]}
                                            fontFamily="Quicksand-Regular"
                                            fontSize={isSmall ? 10 : 11}>
                                            Istirahat
                                        </Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </HStack>

                        {/* Notes - Enhanced */}
                        <HStack alignItems="flex-start" space={3}>
                            <Box
                                width={10}
                                height={10}
                                rounded="lg"
                                bg={COLORS.main.gray}
                                justifyContent="center"
                                alignItems="center"
                                mt={0.5}>
                                <DocumentText size={20} color={'#FFF'} variant="Bold"/>
                            </Box>
                            <VStack flex={1} space={1}>
                                <Text
                                    color={COLORS.teks[mode][2]}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 10 : 11}>
                                    Keterangan
                                </Text>
                                <Text
                                    color={COLORS.teks[mode][1]}
                                    fontFamily="Quicksand-Medium"
                                    fontSize={isSmall ? 12 : 13}
                                    numberOfLines={2}>
                                    {worksheet.keterangan || 'Tidak ada keterangan'}
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Supervisor - Enhanced */}
                        <HStack alignItems="center" space={3}>
                            <Box
                                width={10}
                                height={10}
                                rounded="lg"
                                bg={COLORS.main.primary}
                                justifyContent="center"
                                alignItems="center">
                                <User size={20} color={'#FFF'} variant="Bold"/>
                            </Box>
                            <VStack flex={1} space={1}>
                                <Text
                                    color={COLORS.teks[mode][2]}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 10 : 11}>
                                    Penanggung Jawab
                                </Text>
                                <Text
                                    lineHeight={12}
                                    color={COLORS.teks[mode][1]}
                                    fontFamily="Quicksand-Medium"
                                    fontSize={isSmall ? 12 : 13}
                                    numberOfLines={1}>
                                    {worksheet.supervisor?.nama || 'Unknown'}
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    
                </VStack>
            </Pressable>
        );
    };

    return (
        <AppScreen>
            <HeaderScreen
                title="Data Entry Worksheet"
                subtitle="Formulir pencatatan aktivitas kerja crew harian"
                onBack={() => router.back()}
                onThemes={true}
                onNotification={true}
            />

            <VStack flex={1} bg={backgroundColor} style={{ paddingTop: isIOS ? 0 : 10 }}>
                {/* Create + Filter Buttons - Following DailyBreakdownScreen layout */}
                <HStack mt={3} mx={3} space={2}>
                    <HStack
                        flex={1}
                        rounded={'md'}
                        borderWidth={.5}
                        borderColor={mode === 'dark' ? '#6ee7b7' : '#059669'}
                        bg={mode === 'dark' ? '#065f46' : '#d1fae5'}>
                        <TouchableOpacity
                            onPress={handleCreate}
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                            <Text color={mode === 'dark' ? '#6ee7b7' : '#059669'} fontFamily="Quicksand-Bold">Tambah Worksheet Baru</Text>
                        </TouchableOpacity>
                    </HStack>
                    <TouchableOpacity
                        style={{ height: 40, width: 40, borderRadius: 5 }}
                        onPress={openFilter}>
                        <VStack
                            p={2}
                            flex={1}
                            bg={(filters.status || filters.startdate || filters.enddate || filters.shift || filters.keterangan) ? '#3b82f6' : (mode === 'dark' ? '#1e40af' : '#dbeafe')}
                            justifyContent={'center'}
                            alignItems={'center'}
                            rounded={'md'}
                            position="relative"
                        >
                            <Filter color={COLORS.teks[mode][1]}/>
                            {/* <Text
                                color={(filters.status || filters.date_ops || filters.shift) ? '#ffffff' : getValidColor(COLORS.ico[mode][2], '#697689')}
                                fontSize={16}
                            >
                                🔍
                            </Text> */}
                            {(filters.status || filters.startdate || filters.enddate || filters.shift || filters.keterangan) && (
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
                </HStack>



                {/* Content with FlatList */}
                {loading ? (
                    <Center flex={1} py={10}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text mt={3} color={textColor} fontFamily="Quicksand-Regular">
                            Memuat data...
                        </Text>
                    </Center>
                ) : (
                    <FlatList
                        data={listData}
                        renderItem={({ item }) => renderWorksheetItem(item)}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        ListHeaderComponent={null}
                        ListEmptyComponent={(
                            <VStack
                                py={6}
                                alignItems="center"
                                space={2}
                                bg={cardBg}
                                rounded="2xl"
                                my={2}
                                borderWidth={1}
                                borderColor={cardBorder}>

                                {/* Main Title */}
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-Bold"
                                    textAlign="center"
                                    fontSize={isSmall ? 16 : 18}
                                    lineHeight={24}>
                                    {error ? 'Mode Development' : 'Data Worksheet Kosong'}
                                </Text>

                                {/* Subtitle with better styling */}
                                <Text
                                    color={textColor}
                                    opacity={0.8}
                                    fontFamily="Quicksand-Regular"
                                    textAlign="center"
                                    fontSize={isSmall ? 12 : 13}
                                    lineHeight={18}
                                    px={2}>
                                    {error
                                        ? 'Fitur sedang dalam pengembangan'
                                        : 'Belum ada data worksheet yang tercatat'
                                    }
                                </Text>

                                {/* Informative description */}
                                <Text
                                    color={textColor}
                                    opacity={0.6}
                                    fontFamily="Quicksand-Light"
                                    textAlign="center"
                                    fontSize={isSmall ? 10 : 11}
                                    lineHeight={16}
                                    px={4}>
                                    {error
                                        ? 'Data yang ditampilkan adalah simulasi untuk pengujian fitur'
                                        : 'Mulai catat aktivitas kerja harian crew Anda untuk pelaporan dan monitoring'
                                    }
                                </Text>

                                {/* Action buttons */}
                                {error && (
                                    <TouchableOpacity
                                        onPress={() => loadData(filters)}
                                        style={{
                                            backgroundColor: COLORS.primary,
                                            paddingHorizontal: 20,
                                            paddingVertical: 12,
                                            borderRadius: 25,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: COLORS.primary,
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 6,
                                            elevation: 4,
                                            minWidth: 140
                                        }}>
                                        <Text
                                            color="white"
                                            fontFamily="Quicksand-Bold"
                                            fontSize={isSmall ? 12 : 13}
                                            mr={2}>
                                            🔄
                                        </Text>
                                        <Text color="white" fontFamily="Quicksand-Bold" fontSize={isSmall ? 12 : 13}>
                                            Refresh
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {!error && !user?.id && (
                                    <VStack
                                        bg={COLORS.danger}
                                        opacity={0.1}
                                        p={3}
                                        rounded="lg"
                                        borderWidth={0.5}
                                        borderColor={COLORS.danger}
                                        _border={{ opacity: 0.4 }}
                                        alignItems="center">
                                        <HStack space={1} alignItems="center">
                                            <Danger 
                                                size={isSmall ? 16 : 18}
                                                color={COLORS.danger}
                                            />
                                            <Text
                                                color={COLORS.danger}
                                                fontFamily="Quicksand-SemiBold"
                                                fontSize={isSmall ? 10 : 12}
                                                textAlign="center">
                                                User data tidak tersedia
                                            </Text>
                                        </HStack>
                                        <Text
                                            color={COLORS.danger}
                                            opacity={0.8}
                                            fontFamily="Quicksand-Regular"
                                            textAlign="center"
                                            fontSize={isSmall ? 8 : 9}
                                            lineHeight={12}
                                            mt={1}>
                                            Silakan login terlebih dahulu
                                        </Text>
                                    </VStack>
                                )}
                            </VStack>
                        )}
                        refreshing={refreshing}
                        onRefresh={() => onRefresh()}
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 }}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        ItemSeparatorComponent={() => <Box height={isSmall ? 12 : 14} />}
                    />
                )}
            </VStack>

{/* Filter BottomSheet - Simplified without KeyboardAvoidingView */}
            <FilterBottomSheet
                visible={filterSheetOpen}
                onClose={() => setFilterSheetOpen(false)}
                mode={mode}
                textColor={textColor}
                cardBg={cardBg}
                filterDraft={filterDraft}
                setFilterDraft={setFilterDraft}
                setShowDatePicker={setShowDatePicker}
                resetFilter={resetFilter}
                applyFilter={applyFilter}
                isFilterActive={isFilterActive}
            />

            {/* DateTime Picker Modal */}
            <DateTimePickerModal
                isVisible={showDatePicker.visible}
                mode="date"
                onConfirm={(date) => {
                    const formattedDate = moment(date).format('YYYY-MM-DD');
                    if (showDatePicker.type === 'start') {
                        setFilterDraft({ ...filterDraft, startdate: formattedDate });
                    } else {
                        setFilterDraft({ ...filterDraft, enddate: formattedDate });
                    }
                    setShowDatePicker({ type: null, visible: false });
                }}
                onCancel={() => setShowDatePicker({ type: null, visible: false })}
                date={showDatePicker.type === 'start'
                    ? (filterDraft.startdate ? new Date(filterDraft.startdate) : new Date())
                    : (filterDraft.enddate ? new Date(filterDraft.enddate) : new Date())
                }
            />
            
            
        </AppScreen>
    );
}
