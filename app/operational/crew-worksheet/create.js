import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VStack, HStack, Text, Box, Divider, Pressable, Button } from 'native-base';
import { View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import CustomAlert from '../../../src/components/common/CustomAlert';
import DateTimePicker from '../../../src/components/common/DatePickerModal';
import moment from 'moment';
import { CrewWorksheetConstants } from '../../../src/utils/crewWorksheet/constants';
import { showAlert } from '../../../src/store/slices/alertSlice';
import { useCrewWorksheet } from '../../../src/hooks/crewWorksheet/useCrewWorksheet';
import { validateTimeRange, calculateTotalHours } from '../../../src/utils/crewWorksheet/utils/validation';
import { loadSQLiteDataToRedux } from '../../../src/store/slices/appSlice';
import BottomSheetSelect from '../../../src/components/common/BottomSheetSelect';

export default function CrewWorksheetCreateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState(() => ({
        tanggal: new Date(),
        jam_mulai: '',
        jam_selesai: '',
        istirahat_mulai: '',
        istirahat_selesai: '',
        spv_id: '',
        keterangan: '',
        jam_kerja_normal: CrewWorksheetConstants.DEFAULT_WORK_HOURS
    }));

    const [penanggungJawabList, setPenanggungJawabList] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [confirmAlert, setConfirmAlert] = useState({
        visible: false,
        type: 'warning',
        title: '',
        message: '',
        onConfirm: null,
        action: null // 'update' or 'delete'
    });

    const pengawasOptions = useMemo(() => penanggungJawabList.map(item => ({
        id: item.id?.toString(),
        nama: item.nama || item.nama_lengkap || 'Tanpa nama',
        subtitle: item.section || item.jabatan || item.posisi || item.department || ''
    })), [penanggungJawabList]);

    // Date picker states
    const [tanggalPickerOpen, setTanggalPickerOpen] = useState(false);
    const [jamMulaiPickerOpen, setJamMulaiPickerOpen] = useState(false);
    const [jamSelesaiPickerOpen, setJamSelesaiPickerOpen] = useState(false);
    const [istirahatMulaiPickerOpen, setIstirahatMulaiPickerOpen] = useState(false);
    const [istirahatSelesaiPickerOpen, setIstirahatSelesaiPickerOpen] = useState(false);

    const { createWorksheet, updateWorksheet } = useCrewWorksheet();
    const token = useSelector(state => state.auth?.token || '');
    const karyawanData = useSelector(state => state.karyawan?.data || []);
    const mode = useSelector(state => state.themes?.value || 'light');
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
    const cardBg = mode === 'dark' ? '#3a3c4a' : '#ffffff';

    // Check if editing - memoize to prevent re-renders
    const editingWorksheet = useMemo(() => {
        if (!params.worksheet) return null;
        try {
            return JSON.parse(params.worksheet);
        } catch (error) {
            console.error('Error parsing worksheet params:', error);
            return null;
        }
    }, [params.worksheet]);
    const isEditing = !!editingWorksheet;

    useEffect(() => {
        if (isEditing && editingWorksheet) {
            setFormData({
                tanggal: new Date(editingWorksheet.tanggal),
                jam_mulai: editingWorksheet.jam_mulai,
                jam_selesai: editingWorksheet.jam_selesai,
                istirahat_mulai: editingWorksheet.istirahat_mulai,
                istirahat_selesai: editingWorksheet.istirahat_selesai,
                spv_id: editingWorksheet.spv_id?.toString() || editingWorksheet.penanggung_jawab_id?.toString(),
                keterangan: editingWorksheet.keterangan,
                jam_kerja_normal: editingWorksheet.jam_kerja_normal || CrewWorksheetConstants.DEFAULT_WORK_HOURS
            });
        }
    }, [isEditing, editingWorksheet]);

    const loadKaryawanData = useCallback(async () => {
        setLoading(true)
        try {
            console.log('🚀 Loading karyawan data...');
            // Load data from SQLite/AsyncStorage to Redux
            console.log('📡 Loading data to Redux (SQLite → AsyncStorage fallback)...');
            const result = await dispatch(loadSQLiteDataToRedux()).unwrap();
            console.log('📊 Load data result:', result);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error('❌ Error loading karyawan data:', error);
        }
    }, [dispatch]);

    useEffect(() => {
        loadKaryawanData();
    }, [loadKaryawanData]);

    const handleKaryawanDataChange = useCallback(() => {
        if (karyawanData.length > 0) {
            console.log('Karyawan data updated, re-fetching penanggung jawab...');
            fetchPenanggungJawab();
        }
    }, [karyawanData, fetchPenanggungJawab]);

    const showConfirmAlert = (title, message, onConfirm, action) => {
        setConfirmAlert({
            visible: true,
            type: 'warning',
            title,
            message,
            onConfirm,
            action
        });
    };

    const hideConfirmAlert = () => {
        setConfirmAlert(prev => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        handleKaryawanDataChange();
    }, [handleKaryawanDataChange]);

    // Re-filter penanggung jawab when karyawan data changes
    useEffect(() => {
        if (karyawanData.length > 0) {
            console.log('Karyawan data updated, re-fetching penanggung jawab...');
            fetchPenanggungJawab();
        }
    }, [karyawanData]);

    const fetchPenanggungJawab = useCallback(async () => {
        try {
            console.log('Karyawan Data from Redux:', karyawanData);
            if (karyawanData.length > 0) {
                console.log('First Karyawan:', karyawanData[0]);
            }

            // Filter karyawan data from Redux to only show specific sections
            const targetSections = ['pengawas', 'koordinator', 'foreman', 'supervisor', 'pjo'];

            const filteredKaryawan = karyawanData.filter(karyawan => {
                // Check various possible field names for section/jabatan
                const sectionFields = ['section', 'jabatan', 'posisi', 'department', 'role'];

                for (const field of sectionFields) {
                    if (karyawan[field]) {
                        const sectionValue = karyawan[field].toString().toLowerCase();
                        return targetSections.some(target => sectionValue.includes(target));
                    }
                }

                return false;
            });

            console.log('Filtered Penanggung Jawab:', filteredKaryawan);
            setPenanggungJawabList(filteredKaryawan);

            // If no data in Redux, try to fetch from API (fallback)
            if (karyawanData.length === 0) {
                console.log('No karyawan data in Redux, attempting API fallback...');
                try {
                    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/master/karyawan/list`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const text = await response.text();
                        console.error('Error fetching penanggung jawab from API:', response.status, text.slice(0, 200));
                        return;
                    }

                    const data = await response.json();
                    let apiData = [];
                    if (Array.isArray(data.rows)) {
                        apiData = data.rows;
                    } else if (Array.isArray(data.data)) {
                        apiData = data.data;
                    }

                    // Filter API data as well
                    const filteredApiData = apiData.filter(karyawan => {
                        const sectionFields = ['section', 'jabatan', 'posisi', 'department', 'role'];

                        for (const field of sectionFields) {
                            if (karyawan[field]) {
                                const sectionValue = karyawan[field].toString().toLowerCase();
                                return targetSections.some(target => sectionValue.includes(target));
                            }
                        }

                        return false;
                    });

                    setPenanggungJawabList(filteredApiData);
                } catch (apiError) {
                    console.error('API fallback also failed:', apiError);
                }
            }
        } catch (error) {
            console.error('Error processing penanggung jawab data:', error);
        }
    }, [karyawanData, token]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.tanggal) {
            newErrors.tanggal = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        if (!formData.jam_mulai) {
            newErrors.jam_mulai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        if (!formData.jam_selesai) {
            newErrors.jam_selesai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        if (!formData.istirahat_mulai) {
            newErrors.istirahat_mulai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        if (!formData.istirahat_selesai) {
            newErrors.istirahat_selesai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        if (!formData.spv_id) {
            newErrors.spv_id = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        if (!formData.keterangan || formData.keterangan.trim().length === 0) {
            newErrors.keterangan = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
        }

        // Validate time ranges
        if (formData.jam_mulai && formData.jam_selesai) {
            const workTimeError = validateTimeRange(formData.jam_mulai, formData.jam_selesai);
            if (workTimeError) {
                newErrors.jam_selesai = workTimeError;
            }
        }

        if (formData.istirahat_mulai && formData.istirahat_selesai) {
            const breakTimeError = validateTimeRange(formData.istirahat_mulai, formData.istirahat_selesai);
            if (breakTimeError) {
                newErrors.istirahat_selesai = breakTimeError;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const executeSubmit = async () => {
        if (!validateForm()) {
            dispatch(showAlert({
                status: 'warning',
                title: 'Validasi Gagal',
                subtitle: 'Silakan periksa kembali input Anda',
                duration: 4000
            }));
            return;
        }

        try {
            setLoading(true);

            // Only send fields that are expected by the backend
            const submitData = {
                tanggal: formData.tanggal.toISOString().split('T')[0],
                jam_mulai: formData.jam_mulai || '',
                jam_selesai: formData.jam_selesai || '',
                istirahat_mulai: formData.istirahat_mulai || '',
                istirahat_selesai: formData.istirahat_selesai || '',
                spv_id: formData.spv_id || '',
                keterangan: formData.keterangan || '',
                jam_kerja_normal: formData.jam_kerja_normal || '8.00'
            };

            // Remove any NaN values
            Object.keys(submitData).forEach(key => {
                if (submitData[key] === NaN || submitData[key] === 'NaN') {
                    submitData[key] = '';
                }
            });

            console.log('🚀 Submit Data:', JSON.stringify(submitData, null, 2));

            let response;
            if (isEditing) {
                response = await updateWorksheet(editingWorksheet.id, submitData);
            } else {
                response = await createWorksheet(submitData);
            }

            dispatch(showAlert({
                status: 'success',
                title: isEditing ? 'Berhasil' : 'Berhasil',
                subtitle: `Worksheet ${isEditing ? 'diperbarui' : 'dibuat'} dengan sukses`,
                duration: 4000
            }));

            // Kembali ke list setelah update
            if (isEditing) {
                router.replace('/operational/crew-worksheet');
            }
        } catch (error) {
            dispatch(showAlert({
                status: 'error',
                title: 'Error',
                subtitle: error.message,
                duration: 4000
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (isEditing) {
            showConfirmAlert(
                'Konfirmasi Update',
                'Apakah Anda yakin ingin memperbarui data worksheet ini?',
                executeSubmit,
                'update'
            );
        } else {
            executeSubmit();
        }
    };

    const handleInputChange = (field, value) => {
        let processedValue = value;

        // Convert Date objects to HH:mm format for time fields
        if (['jam_mulai', 'jam_selesai', 'istirahat_mulai', 'istirahat_selesai'].includes(field) && value instanceof Date) {
            const hours = value.getHours().toString().padStart(2, '0');
            const minutes = value.getMinutes().toString().padStart(2, '0');
            processedValue = `${hours}:${minutes}`;
        }

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const calculatePreviewData = () => {
        const { jam_mulai, jam_selesai, istirahat_mulai, istirahat_selesai, jam_kerja_normal } = formData;

        if (!jam_mulai || !jam_selesai || !istirahat_mulai || !istirahat_selesai) {
            return {
                totalWorkHours: 0,
                totalBreakHours: 0,
                productiveHours: 0,
                overtimeHours: 0
            };
        }

        const workHours = calculateTotalHours(jam_mulai, jam_selesai);
        const breakHours = calculateTotalHours(istirahat_mulai, istirahat_selesai);
        const productiveHours = workHours - breakHours;
        const overtimeHours = productiveHours > jam_kerja_normal ? productiveHours - jam_kerja_normal : 0;

        return {
            totalWorkHours: workHours,
            totalBreakHours: breakHours,
            productiveHours: productiveHours,
            overtimeHours: overtimeHours
        };
    };

    const previewData = calculatePreviewData();

    if(loading){
        <AppScreen>
            <LoadingHauler/>
        </AppScreen>
    }

    return (
        <>
            <AppScreen>
                <HeaderScreen
                    title={isEditing ? 'Edit Worksheet' : 'Tambah Worksheet'}
                    onBack={() => router.back()}
                    onThemes={true}
                    onNotification={true}
                />

                <FlatList
                    data={[{ key: 'form' }]}
                    keyExtractor={(item) => item.key}
                    renderItem={() => (
                        <VStack p={4} space={4}>
                            {/* Form */}
                            <VStack bg={cardBg} rounded="lg" p={4} space={4}>
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-Bold"
                                    fontSize={18}>
                                    {isEditing ? 'Edit Data Worksheet' : 'Tambah Worksheet Baru'}
                                </Text>

                                <Divider />

                                {/* Date Picker */}
                                <VStack>
                                    <Text
                                        color={textColor}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={14}>
                                        Tanggal
                                    </Text>
                                    <Pressable
                                        onPress={() => setTanggalPickerOpen(true)}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: errors.tanggal ? '#ef4444' : '#d1d5db',
                                            borderRadius: 8,
                                            padding: 12,
                                            marginTop: 4,
                                            backgroundColor: mode === 'dark' ? '#374151' : '#ffffff'
                                        }}>
                                        <Text color={textColor} fontFamily="Quicksand-Regular">
                                            {moment(formData.tanggal).format('dddd, DD MMMM YYYY')}
                                        </Text>
                                    </Pressable>
                                    {errors.tanggal && (
                                        <Text color={COLORS.danger} fontSize={12} mt={1}>
                                            {errors.tanggal}
                                        </Text>
                                    )}
                                </VStack>

                                {/* Time Inputs */}
                                <VStack space={3}>
                                    <Text
                                        color={textColor}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={14}>
                                        Jam Kerja
                                    </Text>

                                    <HStack space={3}>
                                        <VStack flex={1}>
                                            <Text
                                                color={textColor}
                                                fontFamily="Quicksand-SemiBold"
                                                fontSize={14}>
                                                Jam Mulai
                                            </Text>
                                            <Pressable
                                                onPress={() => setJamMulaiPickerOpen(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: errors.jam_mulai ? '#ef4444' : '#d1d5db',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    marginTop: 4,
                                                    backgroundColor: mode === 'dark' ? '#374151' : '#ffffff'
                                                }}>
                                                <Text color={textColor} fontFamily="Quicksand-Regular">
                                                    {formData.jam_mulai || 'Pilih Jam'}
                                                </Text>
                                            </Pressable>
                                            {errors.jam_mulai && (
                                                <Text color={COLORS.danger} fontSize={12} mt={1}>
                                                    {errors.jam_mulai}
                                                </Text>
                                            )}
                                        </VStack>

                                        <VStack flex={1}>
                                            <Text
                                                color={textColor}
                                                fontFamily="Quicksand-SemiBold"
                                                fontSize={14}>
                                                Jam Selesai
                                            </Text>
                                            <Pressable
                                                onPress={() => setJamSelesaiPickerOpen(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: errors.jam_selesai ? '#ef4444' : '#d1d5db',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    marginTop: 4,
                                                    backgroundColor: mode === 'dark' ? '#374151' : '#ffffff'
                                                }}>
                                                <Text color={textColor} fontFamily="Quicksand-Regular">
                                                    {formData.jam_selesai || 'Pilih Jam'}
                                                </Text>
                                            </Pressable>
                                            {errors.jam_selesai && (
                                                <Text color={COLORS.danger} fontSize={12} mt={1}>
                                                    {errors.jam_selesai}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                </VStack>

                                {/* Break Time */}
                                <VStack space={3}>
                                    <Text
                                        color={textColor}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={14}>
                                        Waktu Istirahat
                                    </Text>

                                    <HStack space={3}>
                                        <VStack flex={1}>
                                            <Text
                                                color={textColor}
                                                fontFamily="Quicksand-SemiBold"
                                                fontSize={14}>
                                                Mulai Istirahat
                                            </Text>
                                            <Pressable
                                                onPress={() => setIstirahatMulaiPickerOpen(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: errors.istirahat_mulai ? '#ef4444' : '#d1d5db',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    marginTop: 4,
                                                    backgroundColor: mode === 'dark' ? '#374151' : '#ffffff'
                                                }}>
                                                <Text color={textColor} fontFamily="Quicksand-Regular">
                                                    {formData.istirahat_mulai || 'Pilih Jam'}
                                                </Text>
                                            </Pressable>
                                            {errors.istirahat_mulai && (
                                                <Text color={COLORS.danger} fontSize={12} mt={1}>
                                                    {errors.istirahat_mulai}
                                                </Text>
                                            )}
                                        </VStack>

                                        <VStack flex={1}>
                                            <Text
                                                color={textColor}
                                                fontFamily="Quicksand-SemiBold"
                                                fontSize={14}>
                                                Selesai Istirahat
                                            </Text>
                                            <Pressable
                                                onPress={() => setIstirahatSelesaiPickerOpen(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: errors.istirahat_selesai ? '#ef4444' : '#d1d5db',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    marginTop: 4,
                                                    backgroundColor: mode === 'dark' ? '#374151' : '#ffffff'
                                                }}>
                                                <Text color={textColor} fontFamily="Quicksand-Regular">
                                                    {formData.istirahat_selesai || 'Pilih Jam'}
                                                </Text>
                                            </Pressable>
                                            {errors.istirahat_selesai && (
                                                <Text color={COLORS.danger} fontSize={12} mt={1}>
                                                    {errors.istirahat_selesai}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                </VStack>

                                {/* Pengawas */}
                                <VStack>
                                    <BottomSheetSelect
                                        label="Pengawas"
                                        placeholder="Pilih pengawas"
                                        value={formData.spv_id?.toString() || ''}
                                        options={pengawasOptions.map(o => ({ id: o.id, nama: o.nama, subtitle: o.subtitle }))}
                                        onChange={(id) => handleInputChange('spv_id', id)}
                                        displaySubKey="subtitle"
                                    />
                                    {errors.spv_id && (
                                        <Text color={COLORS.danger} fontSize={12} mt={1}>
                                            {errors.spv_id}
                                        </Text>
                                    )}
                                </VStack>

                                {/* Keterangan */}
                                <VStack>
                                    <Text
                                        color={textColor}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={14}>
                                        Keterangan Aktivitas
                                    </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: errors.keterangan ? '#ef4444' : '#d1d5db',
                                            borderRadius: 8,
                                            padding: 12,
                                            marginTop: 4,
                                            color: textColor,
                                            backgroundColor: mode === 'dark' ? '#374151' : '#ffffff',
                                            height: 200,
                                            textAlignVertical: 'top'
                                        }}
                                        value={formData.keterangan}
                                        onChangeText={(value) => handleInputChange('keterangan', value)}
                                        placeholder="Deskripsikan aktivitas kerja yang dilakukan..."
                                        placeholderTextColor={mode === 'dark' ? '#9ca3af' : '#6b7280'}
                                        multiline
                                    />
                                    {errors.keterangan && (
                                        <Text color={COLORS.danger} fontSize={12} mt={1}>
                                            {errors.keterangan}
                                        </Text>
                                    )}
                                </VStack>
                            </VStack>

                            {/* Preview Card */}
                            <VStack bg={cardBg} rounded="lg" p={4} space={3}>
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-Bold"
                                    fontSize={16}>
                                    Preview Perhitungan
                                </Text>

                                <Divider />

                                <VStack space={2}>
                                    <HStack justifyContent="space-between">
                                        <Text color={textColor} fontFamily="Quicksand-Regular">
                                            Total Jam Kerja
                                        </Text>
                                        <Text color={textColor} fontFamily="Quicksand-SemiBold">
                                            {previewData.totalWorkHours.toFixed(1)} jam
                                        </Text>
                                    </HStack>

                                    <HStack justifyContent="space-between">
                                        <Text color={textColor} fontFamily="Quicksand-Regular">
                                            Total Jam Istirahat
                                        </Text>
                                        <Text color={textColor} fontFamily="Quicksand-SemiBold">
                                            {previewData.totalBreakHours.toFixed(1)} jam
                                        </Text>
                                    </HStack>

                                    <HStack justifyContent="space-between">
                                        <Text color={textColor} fontFamily="Quicksand-Regular">
                                            Jam Kerja Produktif
                                        </Text>
                                        <Text color={textColor} fontFamily="Quicksand-SemiBold">
                                            {previewData.productiveHours.toFixed(1)} jam
                                        </Text>
                                    </HStack>

                                    {previewData.overtimeHours > 0 && (
                                        <HStack justifyContent="space-between">
                                            <Text color={COLORS.info} fontFamily="Quicksand-Regular">
                                                Jam Lembur
                                            </Text>
                                            <Text color={COLORS.info} fontFamily="Quicksand-Bold">
                                                {previewData.overtimeHours.toFixed(1)} jam
                                            </Text>
                                        </HStack>
                                    )}
                                </VStack>
                            </VStack>



                            {/* Action Buttons */}
                            {isEditing ? (
                                <HStack space={3}>
                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        disabled={loading}
                                        style={{
                                            flex: 2,
                                            backgroundColor: loading ? '#9ca3af' : '#0180c7',
                                            borderRadius: 12,
                                            paddingVertical: 16,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            elevation: 3,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 4,
                                        }}>
                                        {loading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text color="white" fontFamily="Quicksand-Bold" fontSize={16}>
                                                Update Worksheet
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </HStack>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: loading ? '#9ca3af' : '#0180c7',
                                        borderRadius: 12,
                                        paddingVertical: 16,
                                        paddingHorizontal: 24,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        elevation: 3,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                    }}>
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text color="white" fontFamily="Quicksand-Bold" fontSize={16}>
                                            Simpan Worksheet
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </VStack>
                    )}
                    contentContainerStyle={{ paddingBottom: 24, backgroundColor }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />
            </AppScreen>

            {/* Date Picker Modals */}
            <DateTimePicker
                isOpen={tanggalPickerOpen}
                onClose={() => setTanggalPickerOpen(false)}
                onConfirm={(date) => {
                    handleInputChange('tanggal', date);
                    setTanggalPickerOpen(false);
                }}
                date={formData.tanggal}
                mode="date"
                title="Pilih Tanggal"
            />

            <DateTimePicker
                isOpen={jamMulaiPickerOpen}
                onClose={() => setJamMulaiPickerOpen(false)}
                onConfirm={(time) => {
                    handleInputChange('jam_mulai', time);
                    setJamMulaiPickerOpen(false);
                }}
                date={formData.jam_mulai ? new Date(`2000-01-01T${formData.jam_mulai}`) : new Date()}
                mode="time"
                title="Pilih Jam Mulai"
            />

            <DateTimePicker
                isOpen={jamSelesaiPickerOpen}
                onClose={() => setJamSelesaiPickerOpen(false)}
                onConfirm={(time) => {
                    handleInputChange('jam_selesai', time);
                    setJamSelesaiPickerOpen(false);
                }}
                date={formData.jam_selesai ? new Date(`2000-01-01T${formData.jam_selesai}`) : new Date()}
                mode="time"
                title="Pilih Jam Selesai"
            />

            <DateTimePicker
                isOpen={istirahatMulaiPickerOpen}
                onClose={() => setIstirahatMulaiPickerOpen(false)}
                onConfirm={(time) => {
                    handleInputChange('istirahat_mulai', time);
                    setIstirahatMulaiPickerOpen(false);
                }}
                date={formData.istirahat_mulai ? new Date(`2000-01-01T${formData.istirahat_mulai}`) : new Date()}
                mode="time"
                title="Pilih Mulai Istirahat"
            />

            <DateTimePicker
                isOpen={istirahatSelesaiPickerOpen}
                onClose={() => setIstirahatSelesaiPickerOpen(false)}
                onConfirm={(time) => {
                    handleInputChange('istirahat_selesai', time);
                    setIstirahatSelesaiPickerOpen(false);
                }}
                date={formData.istirahat_selesai ? new Date(`2000-01-01T${formData.istirahat_selesai}`) : new Date()}
                mode="time"
                title="Pilih Selesai Istirahat"
            />

            {/* Custom Alert for Confirmations */}
            <CustomAlert
                visible={confirmAlert.visible}
                type={confirmAlert.type}
                title={confirmAlert.title}
                message={confirmAlert.message}
                buttons={[
                    {
                        text: 'Batal',
                        onPress: hideConfirmAlert,
                        style: 'cancel'
                    },
                    {
                        text: confirmAlert.action === 'delete' ? 'Hapus' : 'Ya',
                        onPress: () => {
                            if (confirmAlert.onConfirm) {
                                confirmAlert.onConfirm();
                            }
                            hideConfirmAlert();
                        },
                        style: confirmAlert.action === 'delete' ? 'destructive' : 'default'
                    }
                ]}
                onDismiss={hideConfirmAlert}
            />

        </>
    );
}
