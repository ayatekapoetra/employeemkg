import { ArrowDown2, Calendar, CloseSquare, TickCircle } from 'iconsax-react-native'
import moment from 'moment'
import { HStack, Text, VStack } from 'native-base'
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useSelector } from 'react-redux'
import BottomSheetSelect from '../../../../src/components/common/BottomSheetSelect'

const STATUS_OPTIONS = [
  { key: 'BEROPERASI', label: 'BEROPERASI', color: '#22c55e', colorDark: '#166534' },
  { key: 'STANDBY', label: 'STANDBY', color: '#3b82f6', colorDark: '#1d4ed8' },
  { key: 'NO JOB', label: 'NO JOB', color: '#f59e0b', colorDark: '#92400e' },
  { key: 'NO OPERATOR', label: 'NO OPERATOR', color: '#8b5cf6', colorDark: '#6d28d9' },
  { key: 'NO DRIVER', label: 'NO DRIVER', color: '#8b5cf6', colorDark: '#6d28d9' },
  { key: 'BREAKDOWN', label: 'BREAKDOWN', color: '#ef4444', colorDark: '#991b1b' },
]

const SHIFT_OPTIONS = [
  { key: 'PAGI', label: 'PAGI' },
  { key: 'MALAM', label: 'MALAM' },
]

const CTG_OPTIONS = [
  { key: 'HE', label: 'HE (Alat Berat)' },
  { key: 'DT', label: 'DT (Dumptruck)' },
]

const FilterBottomSheet = ({ visible, onClose, onApply, currentFilters = {} }) => {
    const mode = useSelector((state) => state.themes)?.value || 'light';
    const cabangRedux = useSelector((state) => state.cabang);
    const equipmentRedux = useSelector((state) => state.equipment);
    const karyawanRedux = useSelector((state) => state.karyawan);
    const lokasiRedux = useSelector((state) => state.lokasiPit);

    const [filters, setFilters] = useState({
        status: '',
        shift: '',
        ctg: '',
        cabang_id: '',
        equipment_id: '',
        karyawan_id: '',
        lokasi_id: '',
        ...currentFilters,
    });

    const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
    const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

    const cabangOptions = [
        { id: '', nama: 'Semua Cabang' },
        ...((cabangRedux && cabangRedux.data) || []).map(cab => ({
            id: cab.id?.toString() || '',
            nama: cab.nama || cab.name || ''
        }))
    ];

    const equipmentOptions = [
        { id: '', nama: 'Semua Equipment' },
        ...((equipmentRedux && equipmentRedux.data) || []).map(eq => ({
            id: eq.id?.toString() || '',
            nama: eq.kode || eq.nama || `EQ-${eq.id}`,
            subtitle: eq.kategori || eq.ctg || ''
        }))
    ];

    const karyawanOptions = [
        { id: '', nama: 'Semua Operator/Driver' },
        ...((karyawanRedux && karyawanRedux.data) || []).map(kar => ({
            id: kar.id?.toString() || '',
            nama: kar.nama || kar.name || '',
            subtitle: kar.section || kar.jabatan || ''
        }))
    ];

    const lokasiOptions = [
        { id: '', nama: 'Semua Lokasi' },
        ...((lokasiRedux && lokasiRedux.data) || []).map(lok => ({
            id: lok.id?.toString() || '',
            nama: lok.nama || lok.lokasi || '',
            subtitle: lok.cabang?.nama || ''
        }))
    ];

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const reset = {
            status: '',
            shift: '',
            ctg: '',
            cabang_id: '',
            equipment_id: '',
            karyawan_id: '',
            lokasi_id: '',
        };
        setFilters(reset);
        onApply(reset);
        onClose();
    };

    const isFiltered = useMemo(() => {
        return filters.status || filters.shift || filters.ctg || filters.cabang_id || 
               filters.equipment_id || filters.karyawan_id || filters.lokasi_id;
    }, [filters]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', flex: 1 }}>
                    <HStack justifyContent="space-between" alignItems="center" p={5} pb={3}>
                        <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                            Filter Equipment Plan
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <CloseSquare size={28} color={labelColor} />
                        </TouchableOpacity>
                    </HStack>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
                        <VStack space={4} px={5}>
                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Status
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space={2}>
                                        {STATUS_OPTIONS.map((opt) => {
                                            const isActive = filters.status === opt.key;
                                            return (
                                                <TouchableOpacity key={opt.key} onPress={() => setFilters(prev => ({ ...prev, status: opt.key }))} activeOpacity={0.7}>
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
                                                        <TickCircle size={18} color={isActive ? '#ffffff' : labelColor} variant={isActive ? 'Bold' : 'Outline'} />
                                                        <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={isActive ? '#ffffff' : textColor}>
                                                            {opt.label}
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </HStack>
                                </ScrollView>
                            </VStack>

                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Shift
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space={2}>
                                        {SHIFT_OPTIONS.map((opt) => {
                                            const isActive = filters.shift === opt.key;
                                            return (
                                                <TouchableOpacity key={opt.key} onPress={() => setFilters(prev => ({ ...prev, shift: opt.key }))} activeOpacity={0.7}>
                                                    <HStack
                                                        alignItems="center"
                                                        space={2}
                                                        px={3}
                                                        py={2}
                                                        bg={isActive ? (mode === 'dark' ? '#374151' : '#f3f4f6') : (mode === 'dark' ? '#374151' : '#f9fafb')}
                                                        borderWidth={1}
                                                        borderColor={isActive ? (mode === 'dark' ? '#4b5563' : '#e5e7eb') : (mode === 'dark' ? '#4b5563' : '#e5e7eb')}
                                                        borderRadius={12}
                                                    >
                                                        <TickCircle size={18} color={isActive ? '#ffffff' : labelColor} variant={isActive ? 'Bold' : 'Outline'} />
                                                        <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={isActive ? '#ffffff' : textColor}>
                                                            {opt.label}
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </HStack>
                                </ScrollView>
                            </VStack>

                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Kategori
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space={2}>
                                        {CTG_OPTIONS.map((opt) => {
                                            const isActive = filters.ctg === opt.key;
                                            return (
                                                <TouchableOpacity key={opt.key} onPress={() => setFilters(prev => ({ ...prev, ctg: opt.key }))} activeOpacity={0.7}>
                                                    <HStack
                                                        alignItems="center"
                                                        space={2}
                                                        px={3}
                                                        py={2}
                                                        bg={isActive ? (mode === 'dark' ? '#374151' : '#f3f4f6') : (mode === 'dark' ? '#374151' : '#f9fafb')}
                                                        borderWidth={1}
                                                        borderColor={isActive ? (mode === 'dark' ? '#4b5563' : '#e5e7eb') : (mode === 'dark' ? '#4b5563' : '#e5e7eb')}
                                                        borderRadius={12}
                                                    >
                                                        <TickCircle size={18} color={isActive ? '#ffffff' : labelColor} variant={isActive ? 'Bold' : 'Outline'} />
                                                        <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={isActive ? '#ffffff' : textColor}>
                                                            {opt.label}
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </HStack>
                                </ScrollView>
                            </VStack>

                            <VStack space={3}>
                                <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                    Cabang / Equipment / Operator / Lokasi
                                </Text>

                                <BottomSheetSelect
                                    label="Cabang"
                                    placeholder="Pilih cabang"
                                    value={filters.cabang_id?.toString()}
                                    options={cabangOptions}
                                    onChange={(val) => setFilters(prev => ({ ...prev, cabang_id: val || '' }))}
                                    displayKey="nama"
                                    allowClear
                                />

                                <BottomSheetSelect
                                    label="Equipment"
                                    placeholder="Pilih equipment"
                                    value={filters.equipment_id?.toString()}
                                    options={equipmentOptions}
                                    onChange={(val) => setFilters(prev => ({ ...prev, equipment_id: val || '' }))}
                                    displayKey="nama"
                                    displaySubKey="subtitle"
                                    allowClear
                                />

                                <BottomSheetSelect
                                    label="Operator/Driver"
                                    placeholder="Pilih operator/driver"
                                    value={filters.karyawan_id?.toString()}
                                    options={karyawanOptions}
                                    onChange={(val) => setFilters(prev => ({ ...prev, karyawan_id: val || '' }))}
                                    displayKey="nama"
                                    displaySubKey="subtitle"
                                    allowClear
                                />

                                <BottomSheetSelect
                                    label="Lokasi"
                                    placeholder="Pilih lokasi"
                                    value={filters.lokasi_id?.toString()}
                                    options={lokasiOptions}
                                    onChange={(val) => setFilters(prev => ({ ...prev, lokasi_id: val || '' }))}
                                    displayKey="nama"
                                    displaySubKey="subtitle"
                                    allowClear
                                />
                            </VStack>

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
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default FilterBottomSheet;