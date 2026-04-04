import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector } from 'react-redux';
import database from '../../../../src/database/SQLiteService';
import BottomSheetSelect from '../../../../src/components/common/BottomSheetSelect';

const STATUS_OPTIONS = [
    { label: 'Sedang Berlangsung', value: 'ONGOING', color: '#F59E0B', colorDark: '#78350F' },
    { label: 'Selesai', value: 'COMPLETED', color: '#10B981', colorDark: '#065F46' },
];

const FilterBottomSheet = ({ visible, onClose, onApply, currentFilters = {} }) => {
    const mode = useSelector((state) => state.themes)?.value || 'light';
    const cabangRedux = useSelector((state) => state.cabang);
    const lokasiRedux = useSelector((state) => state.lokasikerja);
    
    // Ambil kategori events dari redux atau props
    const eventCategories = currentFilters.eventCategories || [];

    const [filters, setFilters] = useState({
        status: [],
        cabang_id: '',
        lokasi_id: '',
        event_category_id: '',
        startdate: '',
        enddate: '',
        ...currentFilters,
    });

    const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false });

    useEffect(() => {
        if (!visible) {
            setShowDatePicker({ type: null, visible: false });
        }
    }, [visible]);

    const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
    const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

    const cabangOptions = useMemo(() => {
        let data = cabangRedux?.data || [];
        if (!Array.isArray(data)) data = data?.rows || data?.data || [];
        if (!data || data.length === 0) return [];
        return data
            .map((item) => ({
                label: item.nama || item.nama_cabang || item.name || '[No Name]',
                value: item.id?.toString() || item.kode_cabang?.toString() || item.kode?.toString() || '',
                subtitle: item.bisnis?.nama || item.bisnis?.name || item.bisnis?.initial || item.kode || item.kode_cabang || '',
                area: item.area || item.cabang?.area || item.mas_cabang?.area || item.area_name || '',
            }))
            .filter((opt) => opt.value);
    }, [cabangRedux?.data]);

    const lokasiOptions = useMemo(() => {
        let data = lokasiRedux?.data || [];
        if (!Array.isArray(data) && lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
            data = lokasiRedux.data.rows || lokasiRedux.data.data || [];
        }
        if (!data || data.length === 0) return [];
        return data
            .map((item) => ({
                label: item.nama_lokasi || item.nama || item.lokasi || '[No Name]',
                value: item.id?.toString() || item.kode_lokasi?.toString() || item.kode?.toString() || '',
                subtitle: item.keterangan || item.deskripsi || '',
            }))
            .filter((opt) => opt.value);
    }, [lokasiRedux?.data]);

    const categoryOptions = useMemo(() => {
        if (!eventCategories || eventCategories.length === 0) return [];
        return eventCategories
            .map((item) => ({
                label: item.nama || '[No Name]',
                value: item.id?.toString() || '',
                subtitle: item.kode || '',
                color: item.color || '#6B7280'
            }))
            .filter((opt) => opt.value);
    }, [eventCategories]);

    const handleStatusToggle = (val) => {
        setFilters((prev) => {
            const arr = Array.isArray(prev.status) ? prev.status : [];
            return arr.includes(val)
                ? { ...prev, status: arr.filter((s) => s !== val) }
                : { ...prev, status: [...arr, val] };
        });
    };

    const handleDateConfirm = (date) => {
        const formatted = moment(date).format('YYYY-MM-DD');
        if (showDatePicker.type === 'start') {
            setFilters((prev) => ({ ...prev, startdate: formatted }));
        } else {
            setFilters((prev) => ({ ...prev, enddate: formatted }));
        }
        setShowDatePicker({ type: null, visible: false });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const reset = {
            status: [],
            cabang_id: '',
            lokasi_id: '',
            event_category_id: '',
            startdate: '',
            enddate: '',
        };
        setFilters(reset);
        onApply(reset);
        onClose();
    };

    const isFiltered = useMemo(() => {
        const hasStatus = Array.isArray(filters.status) && filters.status.length > 0;
        return hasStatus || filters.cabang_id || filters.lokasi_id || filters.event_category_id || filters.startdate || filters.enddate;
    }, [filters]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={onClose} 
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            >
                <View style={{ 
                    backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff', 
                    borderTopLeftRadius: 24, 
                    borderTopRightRadius: 24, 
                    maxHeight: '85%', 
                    flex: 1 
                }}>
                    <HStack justifyContent="space-between" alignItems="center" p={5} pb={3}>
                        <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                            Filter Daily Events
                        </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close-circle" size={28} color={labelColor} />
                            </TouchableOpacity>
                    </HStack>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
                        <VStack space={4} px={5}>
                            {/* Status Filter */}
                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Status Event
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space={2}>
                                        {STATUS_OPTIONS.map((opt) => {
                                            const isActive = filters.status.includes(opt.value);
                                            return (
                                                <TouchableOpacity 
                                                    key={opt.value} 
                                                    onPress={() => handleStatusToggle(opt.value)} 
                                                    activeOpacity={0.7}
                                                >
                                                    <HStack
                                                        alignItems="center"
                                                        space={2}
                                                        px={3}
                                                        py={2}
                                                        bg={isActive ? (mode === 'dark' ? opt.colorDark : opt.color) : (mode === 'dark' ? '#374151' : '#f9fafb')}
                                                        borderWidth={1}
                                                        borderColor={isActive ? (mode === 'dark' ? opt.colorDark : opt.color) : (mode === 'dark' ? '#4b5563' : '#e5e7eb')}
                                                        borderRadius={12}
                                                    >
                                                        <Ionicons 
                                                            name={isActive ? "checkmark-circle" : "checkmark-circle-outline"} 
                                                            size={18} 
                                                            color={isActive ? '#ffffff' : labelColor} 
                                                        />
                                                        <Text 
                                                            fontSize="xs" 
                                                            fontFamily="Poppins-SemiBold" 
                                                            color={isActive ? '#ffffff' : textColor}
                                                        >
                                                            {opt.label}
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </HStack>
                                </ScrollView>
                            </VStack>

                            {/* Category Filter */}
                            {categoryOptions.length > 0 && (
                                <VStack space={3}>
                                    <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                        Kategori Event
                                    </Text>
                                    <BottomSheetSelect
                                        label="Kategori"
                                        placeholder="Pilih kategori event"
                                        value={filters.event_category_id?.toString()}
                                        options={categoryOptions.map((o) => ({ 
                                            id: o.value, 
                                            nama: o.label, 
                                            subtitle: o.subtitle 
                                        }))}
                                        onChange={(val) => setFilters((prev) => ({ ...prev, event_category_id: val || '' }))}
                                        displayKey="nama"
                                        displaySubKey="subtitle"
                                        allowClear
                                    />
                                </VStack>
                            )}

                            {/* Location Filter */}
                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Cabang & Lokasi
                                </Text>

                                <BottomSheetSelect
                                    label="Cabang"
                                    placeholder="Pilih cabang"
                                    value={filters.cabang_id?.toString()}
                                    options={cabangOptions.map((o) => ({ id: o.value, nama: o.label, subtitle: o.subtitle }))}
                                    onChange={(val) => setFilters((prev) => ({ ...prev, cabang_id: val || '' }))}
                                    displayKey="nama"
                                    displaySubKey="subtitle"
                                    allowClear
                                />

                                <BottomSheetSelect
                                    label="Lokasi"
                                    placeholder="Pilih lokasi"
                                    value={filters.lokasi_id?.toString()}
                                    options={lokasiOptions.map((o) => ({ id: o.value, nama: o.label, subtitle: o.subtitle }))}
                                    onChange={(val) => setFilters((prev) => ({ ...prev, lokasi_id: val || '' }))}
                                    displayKey="nama"
                                    displaySubKey="subtitle"
                                    allowClear
                                />
                            </VStack>

                            {/* Date Range Filter */}
                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Rentang Tanggal
                                </Text>
                                <HStack space={3}>
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker({ type: 'start', visible: true })}
                                        style={{
                                            flex: 1,
                                            backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                                            borderWidth: 1,
                                            borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                                            borderRadius: 12,
                                            padding: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="calendar" size={18} color={labelColor} />
                                            <Text fontSize="sm" fontFamily="Poppins-Regular" color={filters.startdate ? textColor : labelColor}>
                                                {filters.startdate || 'Mulai'}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={16} color={labelColor} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker({ type: 'end', visible: true })}
                                        style={{
                                            flex: 1,
                                            backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                                            borderWidth: 1,
                                            borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                                            borderRadius: 12,
                                            padding: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="calendar" size={18} color={labelColor} />
                                            <Text fontSize="sm" fontFamily="Poppins-Regular" color={filters.enddate ? textColor : labelColor}>
                                                {filters.enddate || 'Selesai'}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={16} color={labelColor} />
                                    </TouchableOpacity>
                                </HStack>
                            </VStack>

                            {/* Action Buttons */}
                            <HStack mt={4} space={3}>
                                <TouchableOpacity
                                    onPress={handleReset}
                                    disabled={!isFiltered}
                                    style={{
                                        flex: 1,
                                        backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
                                        padding: 14,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                                        opacity: isFiltered ? 1 : 0.5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: 'Quicksand-Bold',
                                            color: textColor,
                                        }}
                                    >
                                        Reset
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleApply}
                                    style={{
                                        flex: 2,
                                        backgroundColor: mode === 'dark' ? '#1e40af' : '#2563eb',
                                        padding: 14,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: 'Quicksand-Bold',
                                            color: '#ffffff',
                                        }}
                                    >
                                        Terapkan Filter
                                    </Text>
                                </TouchableOpacity>
                            </HStack>
                        </VStack>
                    </ScrollView>

                    <DateTimePickerModal
                        isVisible={showDatePicker.visible}
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={() => setShowDatePicker({ type: null, visible: false })}
                        date={showDatePicker.type === 'start'
                            ? (filters.startdate ? new Date(filters.startdate) : new Date())
                            : (filters.enddate ? new Date(filters.enddate) : new Date())
                        }
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default FilterBottomSheet;