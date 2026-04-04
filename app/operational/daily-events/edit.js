import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { HStack, VStack, Text } from 'native-base';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, InfoCircle, TickCircle } from 'iconsax-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getEventDetail, updateEvent } from '../../../src/store/slices/eventHistorySlice';
import { getEventCategories } from '../../../src/store/slices/eventCtgSlice';
import { COLORS } from '../../../src/constants/colors';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ModalAlert from '../../../src/components/common/ModalAlert';
import moment from 'moment';
import database from '../../../src/database/SQLiteService';

export default function EditDailyEventScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const eventId = params.id;
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
    const [fetchLoading, setFetchLoading] = useState(true);
    const [equipmentLocal, setEquipmentLocal] = useState([]);
    const [lokasiLocal, setLokasiLocal] = useState([]);
    const [shiftLocal, setShiftLocal] = useState([]);
    const [cabangLocal, setCabangLocal] = useState([]);
    const [modalAlert, setModalAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
    
    // State untuk date/time picker
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);

    const mode = useSelector(state => state.themes)?.value || 'light';
    const equipmentRedux = useSelector(state => state.equipment);
    const lokasiRedux = useSelector(state => state.lokasikerja);
    const shiftRedux = useSelector(state => state.shift);
    const cabangRedux = useSelector(state => state.cabang);
    const eventCtgRedux = useSelector(state => state.eventCtg);
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const subtitleColor = mode === 'dark' ? '#9CA3AF' : '#6B7280';
    const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
    const errorColor = mode === 'dark' ? '#FCA5A5' : '#EF4444';

    // Fetch existing event data
    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    // Fetch categories from redux if empty
    useEffect(() => {
        const hasData = Array.isArray(eventCtgRedux?.data) && eventCtgRedux.data.length > 0;
        if (!eventCtgRedux?.loading && !hasData) {
            dispatch(getEventCategories());
        }
    }, [dispatch, eventCtgRedux?.data, eventCtgRedux?.loading]);

    // Load fallback lokal
    useEffect(() => {
        const loadLocal = async () => {
            try {
                const eq = await database.getAll('master_equipment');
                const lok = await database.getAll('master_lokasipit');
                const sh = await database.getShift?.();
                const cab = await database.getAll?.('master_cabang');
                if (Array.isArray(eq)) setEquipmentLocal(eq);
                if (Array.isArray(lok)) setLokasiLocal(lok);
                if (Array.isArray(sh)) setShiftLocal(sh);
                if (Array.isArray(cab)) setCabangLocal(cab);
            } catch (e) {
                console.warn('[EditDailyEvent] loadLocal error:', e?.message || e);
            }
        };
        loadLocal();
    }, []);

    // Fetch event data
    const fetchEventData = useCallback(async () => {
        try {
            setFetchLoading(true);
            
            // API call to get event detail
            const eventData = await dispatch(getEventDetail(eventId)).unwrap();
            
            if (eventData) {
                setFormData({
                    event_category_id: eventData.event_category_id?.toString() || '',
                    equipment_id: eventData.equipment_id?.toString() || '',
                    location_type: eventData.location_type || 'PIT',
                    location_id: eventData.location_id?.toString() || '',
                    location_description: eventData.location_description || '',
                    start_time: eventData.start_time || moment().format('YYYY-MM-DD HH:mm:ss'),
                    start_description: eventData.start_description || '',
                    shift_id: eventData.shift_id?.toString() || '',
                    cabang_id: eventData.cabang_id?.toString() || ''
                });
            }
            
            setFetchLoading(false);
            
        } catch (err) {
            setFetchLoading(false);
            console.error('[EditDailyEvent] Error fetching event data:', err);
            setModalAlert({
                visible: true,
                title: 'Error',
                message: 'Gagal memuat data event',
                type: 'error',
                buttons: [
                    { text: 'Tutup', onPress: () => setModalAlert(prev => ({ ...prev, visible: false })) }
                ]
            });
        }
    }, [eventId, dispatch]);


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
                id: eventId,
                // Convert string IDs back to numbers
                event_category_id: parseInt(formData.event_category_id),
                equipment_id: formData.equipment_id ? parseInt(formData.equipment_id) : null,
                location_id: formData.location_id ? parseInt(formData.location_id) : null,
                shift_id: formData.shift_id ? parseInt(formData.shift_id) : null,
                cabang_id: parseInt(formData.cabang_id)
            };
            
            console.log('[EditDailyEvent] Updating data:', apiData);
            
            // API call
            await dispatch(updateEvent({ id: eventId, data: apiData })).unwrap();

            setModalAlert({
                visible: true,
                title: 'Berhasil',
                message: 'Event berhasil diperbarui',
                type: 'success',
                buttons: [
                    { 
                        text: 'OK',
                        onPress: () => {
                            setModalAlert(prev => ({ ...prev, visible: false }));
                            router.push(`/operational/daily-events/${eventId}`);
                        }
                    }
                ]
            });
            
        } catch (error) {
            console.log(error);
            setModalAlert({
                visible: true,
                title: 'Error',
                message: 'Gagal memperbarui event: ' + (error.message || 'Terjadi kesalahan'),
                type: 'error',
                buttons: [
                    { text: 'Tutup', onPress: () => setModalAlert(prev => ({ ...prev, visible: false })) }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle date/time picker confirm
    const handleDateTimeConfirm = (date) => {
        setShowDateTimePicker(false);
        const formatted = moment(date).format('YYYY-MM-DD HH:mm:ss');
        handleInputChange('start_time', formatted);
    };

    const categories = useMemo(() => {
        if (Array.isArray(eventCtgRedux?.data)) return eventCtgRedux.data;
        return [];
    }, [eventCtgRedux?.data]);

    // Get selected category
    const selectedCategory = categories.find(cat => cat.id === parseInt(formData.event_category_id));
    
    // Format options for BottomSheetSelect
    const categoryOptions = categories.map(cat => ({
        id: cat.id?.toString?.() || '',
        nama: cat.nama,
        subtitle: cat.kode,
        color: cat.color,
        require_equipment: cat.require_equipment
    })).filter(opt => opt.id);

    const equipmentOptions = useMemo(() => {
        let data = equipmentRedux?.data || [];
        if (!Array.isArray(data)) data = data?.rows || data?.data || data?.equipment || [];
        if ((!data || data.length === 0) && equipmentLocal.length) data = equipmentLocal;
        if (!data || data.length === 0) return [];
        return data
          .map((item) => {
            const id = item.id?.toString() || item.kode_unit?.toString() || item.kode?.toString() || '';
            if (!id) return null;
            const kode = item.kode_unit || item.kode_equipment || item.code || item.kode || item.nopol || item.no_polisi || '';
            const nama = item.nama_unit || item.nama_equipment || item.name || item.nama || '';
            const manuf = item.manufaktur || item.manufacturer || '';
            const model = item.model || '';
            const subtitle = [manuf, model].filter(Boolean).join(' - ');
            return { id, nama: kode || nama || '[No Name]', subtitle };
          })
          .filter(Boolean);
      }, [equipmentRedux?.data, equipmentLocal]);

    const locationOptions = useMemo(() => {
        let data = lokasiRedux?.data || [];
        if (!Array.isArray(data) && lokasiRedux?.data && typeof lokasiRedux.data === 'object') {
          data = lokasiRedux.data.rows || lokasiRedux.data.data || [];
        }
        if ((!data || data.length === 0) && lokasiLocal.length) data = lokasiLocal;
        if (!data || data.length === 0) return [];
        return data
          .map((item) => {
            const id = item.id?.toString() || item.kode_lokasi?.toString() || item.kode?.toString() || '';
            if (!id) return null;
            const cabangNama = item.cabang?.nama || item.cabang?.name || item.nama_cabang || item.cabang_name || '';
            const typeLokasi = item.type || item.tipe || item.jenis || '';
            const subtitleParts = [];
            if (typeLokasi) subtitleParts.push(typeLokasi);
            if (cabangNama) subtitleParts.push(cabangNama);
            return {
              id,
              nama: item.nama_lokasi || item.nama || item.lokasi || '[No Name]',
              subtitle: subtitleParts.join(' - '),
            };
          })
          .filter(Boolean);
      }, [lokasiRedux?.data, lokasiLocal]);

    const shiftOptions = useMemo(() => {
        let data = shiftRedux?.data || [];
        if (!Array.isArray(data)) data = data?.rows || data?.data || [];
        if ((!data || data.length === 0) && Array.isArray(shiftRedux?.master_shift)) {
          data = shiftRedux.master_shift;
        }
        if ((!data || data.length === 0) && Array.isArray(shiftRedux?.sqlite_shift)) {
          data = shiftRedux.sqlite_shift;
        }
        if ((!data || data.length === 0) && shiftLocal.length) {
          data = shiftLocal;
        }
        if (!data || data.length === 0) return [];
        return data
          .map(item => {
            const id = item.id?.toString() || '';
            if (!id) return null;
            const nama = item.nama || item.name || item.shift_name || item.kode || '';
            const start = item.start_shift || item.start || '';
            const end = item.end_shift || item.end || '';
            const subtitle = start && end ? `${start} - ${end}` : '';
            return { id, nama, subtitle };
          })
          .filter(Boolean);
      }, [shiftRedux?.data, shiftRedux?.master_shift, shiftRedux?.sqlite_shift, shiftLocal]);

    const cabangOptions = useMemo(() => {
        let data = cabangRedux?.data || [];
        if (!Array.isArray(data)) data = data?.rows || data?.data || [];
        if ((!data || data.length === 0) && cabangLocal.length) data = cabangLocal;
        if (!data || data.length === 0) return [];
        return data
          .map(item => {
            const id = item.id?.toString() || item.kode?.toString() || '';
            if (!id) return null;
            const nama = item.nama || item.name || item.cabang_name || '[No Name]';
            const area = item.area || item.area_name || item.nama_area || item.region || '';
            const bisnis =
              item.bisnis?.nama ||
              item.bisnis?.name ||
              item.bisnis_name ||
              item.bisnis_unit?.nama ||
              item.bisnis_unit?.name ||
              item.bisnis_unit_name ||
              '';
            const subtitle = [area, bisnis].filter(Boolean).join(' - ');
            return { id, nama, subtitle };
          })
          .filter(Boolean);
      }, [cabangRedux?.data, cabangLocal]);

    // Loading state
    if (fetchLoading) {
        return (
            <AppScreen>
                <HeaderScreen 
                    title="Edit Eventxxxx" 
                    onBack={() => router.back()} 
                    onThemes={true}
                    onNotification={true}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={mode === 'dark' ? '#60A5FA' : '#3B82F6'} />
                    <Text style={{ marginTop: 10, color: subtitleColor }}>
                        Memuat data event...
                    </Text>
                </View>
            </AppScreen>
        );
    }

    return (
        <AppScreen>
            <HeaderScreen 
                title="Edit Event" 
                onBack={() => router.back()} 
                onThemes={true}
                onNotification={true}
            />
            
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
            <ScrollView 
                flex={1} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
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
                                    <InfoCircle size={14} color={errorColor} />
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
                            <TextInput
                                placeholder="Deskripsi lokasi (opsional)"
                                placeholderTextColor={subtitleColor}
                                value={formData.location_description}
                                onChangeText={(value) => handleInputChange('location_description', value)}
                                multiline
                                blurOnSubmit={false}
                                style={{
                                    backgroundColor: mode === 'dark' ? '#374151' : '#F9FAFB',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB',
                                    padding: 12,
                                    minHeight: 120,
                                    textAlignVertical: 'top',
                                    color: textColor,
                                    fontFamily: 'Poppins-Regular',
                                    fontSize: 14
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
                                    <Clock size={18} color={subtitleColor} />
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
                                <Calendar size={16} color={subtitleColor} />
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
                            <TextInput
                                placeholder="Deskripsi event (opsional)"
                                placeholderTextColor={subtitleColor}
                                value={formData.start_description}
                                onChangeText={(value) => handleInputChange('start_description', value)}
                                multiline
                                blurOnSubmit={false}
                                style={{
                                    backgroundColor: mode === 'dark' ? '#374151' : '#F9FAFB',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB',
                                    padding: 12,
                                    minHeight: 140,
                                    textAlignVertical: 'top',
                                    color: textColor,
                                    fontFamily: 'Poppins-Regular',
                                    fontSize: 14
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
                                displaySubKey="subtitle"
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
                                    <TickCircle size={20} color="#FFFFFF" />
                                )}
                                <Text
                                    fontSize="md"
                                    fontFamily="Poppins-Bold"
                                    color="#FFFFFF"
                                    textAlign="center"
                                >
                                    {loading ? 'Menyimpan...' : 'Update Event'}
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

            <ModalAlert
                isVisible={modalAlert.visible}
                title={modalAlert.title}
                message={modalAlert.message}
                type={modalAlert.type}
                buttons={modalAlert.buttons}
                onClose={() => setModalAlert(prev => ({ ...prev, visible: false }))}
            />
        </AppScreen>
    );
}
