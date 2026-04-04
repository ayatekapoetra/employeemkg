import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { HStack, VStack, Text, TextArea, Button } from 'native-base';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { createEvent } from '../../../src/store/slices/eventSlice';
import { COLORS } from '../../../src/constants/colors';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

export default function CreateDailyEventScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    
    // State untuk form data
    const [formData, setFormData] = useState({
        event_category_id: '',
        equipment_id: '',
        location_type: 'PIT',
        location_id: '',
        location_description: '',
        start_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        start_description: '',
        shift_id: '',
        cabang_id: ''
    });
    
    // State untuk loading dan error
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // State untuk data master
    const [categories, setCategories] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [cabangs, setCabangs] = useState([]);
    
    // State untuk date/time picker
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);

    const mode = useSelector(state => state.themes)?.value || 'light';
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const subtitleColor = mode === 'dark' ? '#9CA3AF' : '#6B7280';
    const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
    const errorColor = mode === 'dark' ? '#FCA5A5' : '#EF4444';

    // Fetch data master saat component mount
    useEffect(() => {
        fetchMasterData();
    }, []);

    // Fetch data master
    const fetchMasterData = useCallback(async () => {
        try {
            // Mock data untuk development
            setCategories([
                { id: 1, kode: 'BREAKDOWN', nama: 'Breakdown', icon: 'construct', color: '#EF4444', require_equipment: 'Y' },
                { id: 2, kode: 'HUJAN', nama: 'Hujan', icon: 'rainy', color: '#3B82F6', require_equipment: 'N' },
                { id: 3, kode: 'JALAN_LICIN', nama: 'Jalan Licin', icon: 'warning', color: '#F59E0B', require_equipment: 'N' },
                { id: 4, kode: 'MENUNGGU_ARAHAN', nama: 'Menunggu Arahan', icon: 'time', color: '#8B5CF6', require_equipment: 'N' },
                { id: 5, kode: 'REFUEL', nama: 'Refuel', icon: 'flask', color: '#10B981', require_equipment: 'Y' },
                { id: 6, kode: 'LAINNYA', nama: 'Lainnya', icon: 'alert-circle', color: '#6B7280', require_equipment: 'N' }
            ]);
            
            setEquipments([
                { id: 1, kode: 'DT-001', model: 'Dump Truck', manufaktur: 'Komatsu' },
                { id: 2, kode: 'DT-002', model: 'Dump Truck', manufaktur: 'Komatsu' },
                { id: 3, kode: 'EX-001', model: 'Excavator', manufaktur: 'CAT' },
                { id: 4, kode: 'EX-002', model: 'Excavator', manufaktur: 'Komatsu' }
            ]);
            
            setLocations([
                { id: 1, nama_lokasi: 'PIT A', keterangan: 'Lokasi Pit A' },
                { id: 2, nama_lokasi: 'PIT B', keterangan: 'Lokasi Pit B' },
                { id: 3, nama_lokasi: 'Stockpile A', keterangan: 'Lokasi Stockpile A' },
                { id: 4, nama_lokasi: 'Stockpile B', keterangan: 'Lokasi Stockpile B' },
                { id: 5, nama_lokasi: 'Area Lain', keterangan: 'Lokasi lainnya' }
            ]);
            
            setShifts([
                { id: 1, nama: 'Shift 1 (06:00 - 14:00)' },
                { id: 2, nama: 'Shift 2 (14:00 - 22:00)' },
                { id: 3, nama: 'Shift 3 (22:00 - 06:00)' }
            ]);
            
            setCabangs([
                { id: 1, nama: 'Cabang 1' },
                { id: 2, nama: 'Cabang 2' },
                { id: 3, nama: 'Cabang 3' }
            ]);
            
        } catch (error) {
            console.error('[CreateDailyEvent] Error fetching master data:', error);
        }
    }, []);

    // Handle form input change
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.event_category_id) {
            newErrors.event_category_id = 'Kategori event wajib dipilih';
        }
        
        if (!formData.start_time) {
            newErrors.start_time = 'Waktu mulai wajib diisi';
        }
        
        if (!formData.cabang_id) {
            newErrors.cabang_id = 'Cabang wajib dipilih';
        }
        
        // Check if equipment is required
        const selectedCategory = categories.find(cat => cat.id === parseInt(formData.event_category_id));
        if (selectedCategory && selectedCategory.require_equipment === 'Y' && !formData.equipment_id) {
            newErrors.equipment_id = 'Equipment wajib dipilih untuk kategori ini';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit form
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            
            // Format data untuk API
            const apiData = {
                ...formData,
                event_id: `event-${Date.now()}`, // Generate unique ID
                started_by: 1, // Mock user ID, should get from auth context
                status: 'ONGOING',
                date_ops: moment(formData.start_time).format('YYYY-MM-DD'),
                aktif: 'Y',
                sync_status: 'SYNCED'
            };
            
            console.log('[CreateDailyEvent] Submitting data:', apiData);
            
            // API call
            const response = await dispatch(createEvent(apiData)).unwrap();
            
            setLoading(false);
            Alert.alert(
                'Berhasil',
                'Event berhasil dibuat',
                [
                    { 
                        text: 'OK', 
                        onPress: () => {
                            // Navigate back to list or to detail page
                            router.push('/operational/daily-events');
                        }
                    }
                ]
            );
            
        } catch (error) {
            setLoading(false);
            console.error('[CreateDailyEvent] Error creating event:', error);
            Alert.alert(
                'Error',
                'Gagal membuat event: ' + (error.message || 'Terjadi kesalahan'),
                [{ text: 'OK' }]
            );
        }
    };

    // Handle date/time picker confirm
    const handleDateTimeConfirm = (date) => {
        setShowDateTimePicker(false);
        const formatted = moment(date).format('YYYY-MM-DD HH:mm:ss');
        handleInputChange('start_time', formatted);
    };

    // Get selected category
    const selectedCategory = categories.find(cat => cat.id === parseInt(formData.event_category_id));
    
    // Format options for BottomSheetSelect
    const categoryOptions = categories.map(cat => ({
        id: cat.id.toString(),
        nama: cat.nama,
        subtitle: cat.kode,
        color: cat.color,
        require_equipment: cat.require_equipment
    }));
    
    const equipmentOptions = equipments.map(eq => ({
        id: eq.id.toString(),
        nama: eq.kode,
        subtitle: `${eq.model} - ${eq.manufaktur}`
    }));
    
    const locationOptions = locations.map(loc => ({
        id: loc.id.toString(),
        nama: loc.nama_lokasi,
        subtitle: loc.keterangan
    }));
    
    const shiftOptions = shifts.map(shift => ({
        id: shift.id.toString(),
        nama: shift.nama
    }));
    
    const cabangOptions = cabangs.map(cabang => ({
        id: cabang.id.toString(),
        nama: cabang.nama
    }));

    return (
        <AppScreen>
            <HeaderScreen 
                title="Buat Event Baru" 
                onBack={() => router.back()} 
                onThemes={true}
                onNotification={true}
            />
            
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
            <ScrollView 
                flex={1} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
            >
                <VStack space={4} px={4} pt={2}>
                    {/* Form Section */}
                    <VStack space={4}>
                        {/* Event Category */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Kategori Event <Text color={errorColor}>*</Text>
                            </Text>
                            <BottomSheetSelect
                                label="Pilih Kategori"
                                placeholder="Pilih kategori event"
                                value={formData.event_category_id}
                                options={categoryOptions}
                                onChange={(value) => handleInputChange('event_category_id', value)}
                                displayKey="nama"
                                displaySubKey="subtitle"
                                error={errors.event_category_id}
                            />
                            {selectedCategory && selectedCategory.require_equipment === 'Y' && (
                                <HStack space={2} alignItems="center">
                                    <Ionicons name="information-circle" size={14} color={errorColor} />
                                    <Text fontSize="xs" color={errorColor}>
                                        Equipment wajib dipilih untuk kategori ini
                                    </Text>
                                </HStack>
                            )}
                        </VStack>

                        {/* Equipment (conditionally required) */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Equipment {selectedCategory?.require_equipment === 'Y' && <Text color={errorColor}>*</Text>}
                            </Text>
                            <BottomSheetSelect
                                label="Pilih Equipment"
                                placeholder="Pilih equipment"
                                value={formData.equipment_id}
                                options={equipmentOptions}
                                onChange={(value) => handleInputChange('equipment_id', value)}
                                displayKey="nama"
                                displaySubKey="subtitle"
                                error={errors.equipment_id}
                                disabled={!selectedCategory || selectedCategory.require_equipment !== 'Y'}
                            />
                        </VStack>

                        {/* Location */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Lokasi
                            </Text>
                            
                            {/* Location Type */}
                            <HStack space={2}>
                                {['PIT', 'STOCKPILE', 'AREA_LAIN'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => handleInputChange('location_type', type)}
                                        style={{
                                            flex: 1,
                                            padding: 8,
                                            borderRadius: 8,
                                            backgroundColor: formData.location_type === type 
                                                ? (mode === 'dark' ? '#1E40AF' : '#DBEAFE') 
                                                : (mode === 'dark' ? '#374151' : '#F3F4F6'),
                                            borderWidth: 1,
                                            borderColor: formData.location_type === type
                                                ? (mode === 'dark' ? '#3B82F6' : '#2563EB')
                                                : (mode === 'dark' ? '#4B5563' : '#E5E7EB')
                                        }}
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontFamily="Poppins-SemiBold"
                                            color={formData.location_type === type 
                                                ? (mode === 'dark' ? '#93C5FD' : '#1E40AF')
                                                : textColor
                                            }
                                            textAlign="center"
                                        >
                                            {type === 'PIT' ? 'Pit' : type === 'STOCKPILE' ? 'Stockpile' : 'Area Lain'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </HStack>
                            
                            {/* Location Selection */}
                            <BottomSheetSelect
                                label="Pilih Lokasi"
                                placeholder="Pilih lokasi kerja"
                                value={formData.location_id}
                                options={locationOptions}
                                onChange={(value) => handleInputChange('location_id', value)}
                                displayKey="nama"
                                displaySubKey="subtitle"
                            />
                            
                            {/* Location Description */}
                            <TextArea
                                placeholder="Deskripsi lokasi (opsional)"
                                value={formData.location_description}
                                onChangeText={(value) => handleInputChange('location_description', value)}
                                fontSize="sm"
                                fontFamily="Poppins-Regular"
                                color={textColor}
                                bg={mode === 'dark' ? '#374151' : '#F9FAFB'}
                                borderRadius={8}
                                borderWidth={1}
                                borderColor={mode === 'dark' ? '#4B5563' : '#E5E7EB'}
                                _focus={{
                                    borderColor: mode === 'dark' ? '#3B82F6' : '#2563EB'
                                }}
                            />
                        </VStack>

                        {/* Start Time */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Waktu Mulai <Text color={errorColor}>*</Text>
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDateTimePicker(true)}
                                style={{
                                    backgroundColor: mode === 'dark' ? '#374151' : '#F9FAFB',
                                    borderRadius: 8,
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: errors.start_time ? errorColor : (mode === 'dark' ? '#4B5563' : '#E5E7EB'),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <HStack space={2} alignItems="center">
                                    <Ionicons name="time" size={18} color={subtitleColor} />
                                    <Text
                                        fontSize="sm"
                                        fontFamily="Poppins-Regular"
                                        color={formData.start_time ? textColor : subtitleColor}
                                    >
                                        {formData.start_time 
                                            ? moment(formData.start_time).format('DD MMM YYYY, HH:mm')
                                            : 'Pilih waktu mulai'
                                        }
                                    </Text>
                                </HStack>
                                <Ionicons name="calendar" size={16} color={subtitleColor} />
                            </TouchableOpacity>
                            {errors.start_time && (
                                <Text fontSize="xs" color={errorColor}>
                                    {errors.start_time}
                                </Text>
                            )}
                        </VStack>

                        {/* Start Description */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Deskripsi Event
                            </Text>
                            <TextArea
                                placeholder="Deskripsi event (opsional)"
                                value={formData.start_description}
                                onChangeText={(value) => handleInputChange('start_description', value)}
                                fontSize="sm"
                                fontFamily="Poppins-Regular"
                                color={textColor}
                                bg={mode === 'dark' ? '#374151' : '#F9FAFB'}
                                borderRadius={8}
                                borderWidth={1}
                                borderColor={mode === 'dark' ? '#4B5563' : '#E5E7EB'}
                                _focus={{
                                    borderColor: mode === 'dark' ? '#3B82F6' : '#2563EB'
                                }}
                            />
                        </VStack>

                        {/* Shift */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Shift
                            </Text>
                            <BottomSheetSelect
                                label="Pilih Shift"
                                placeholder="Pilih shift"
                                value={formData.shift_id}
                                options={shiftOptions}
                                onChange={(value) => handleInputChange('shift_id', value)}
                                displayKey="nama"
                            />
                        </VStack>

                        {/* Cabang */}
                        <VStack space={2}>
                            <Text fontSize="sm" fontFamily="Poppins-Bold" color={textColor}>
                                Cabang <Text color={errorColor}>*</Text>
                            </Text>
                            <BottomSheetSelect
                                label="Pilih Cabang"
                                placeholder="Pilih cabang"
                                value={formData.cabang_id}
                                options={cabangOptions}
                                onChange={(value) => handleInputChange('cabang_id', value)}
                                displayKey="nama"
                                error={errors.cabang_id}
                            />
                        </VStack>
                    </VStack>

                    {/* Submit Button */}
                    <VStack space={2} pt={4}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={{
                                backgroundColor: mode === 'dark' ? '#1E40AF' : '#2563EB',
                                borderRadius: 8,
                                padding: 16,
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            <HStack justifyContent="center" alignItems="center" space={2}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="save" size={20} color="#FFFFFF" />
                                )}
                                <Text
                                    fontSize="md"
                                    fontFamily="Poppins-Bold"
                                    color="#FFFFFF"
                                    textAlign="center"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Event'}
                                </Text>
                            </HStack>
                        </TouchableOpacity>
                    </VStack>
                </VStack>
            </ScrollView>
            </KeyboardAvoidingView>

            {/* DateTime Picker Modal */}
            <DateTimePickerModal
                isVisible={showDateTimePicker}
                mode="datetime"
                onConfirm={handleDateTimeConfirm}
                onCancel={() => setShowDateTimePicker(false)}
                date={formData.start_time ? new Date(formData.start_time) : new Date()}
            />
        </AppScreen>
    );
}
