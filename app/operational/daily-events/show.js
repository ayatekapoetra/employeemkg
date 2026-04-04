import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Share, TextInput } from 'react-native';
import { HStack, VStack, Text, Divider, Button } from 'native-base';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Edit2, Trash, TickCircle } from 'iconsax-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getEventDetail, finishEvent, deleteEvent } from '../../../src/store/slices/eventHistorySlice';
import { COLORS } from '../../../src/constants/colors';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import ModalAlert from '../../../src/components/common/ModalAlert';
import CategoryBadge from './components/CategoryBadge';
import StatusBadge from './components/StatusBadge';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

export default function ShowDailyEventScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const eventId = params.id;
    const dispatch = useDispatch();

    // State untuk event data
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk finish event
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [finishData, setFinishData] = useState({
        finish_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        finish_description: ''
    });
    const [finishing, setFinishing] = useState(false);
    const [modalAlert, setModalAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

    // State untuk date/time picker
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);

    const mode = useSelector(state => state.themes)?.value || 'light';
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const subtitleColor = mode === 'dark' ? '#9CA3AF' : '#6B7280';
    const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
    const cardBg = mode === 'dark' ? '#2A2C3E' : '#FFFFFF';
    const borderColor = mode === 'dark' ? '#3A3C4E' : '#E5E7EB';

    // Fetch event data
    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    const fetchEventData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // API call to get event detail
            const eventData = await dispatch(getEventDetail(eventId)).unwrap();
            setEvent(eventData);
            setLoading(false);

        } catch (err) {
            setLoading(false);
            setError('Gagal memuat detail event');
            console.error('[ShowDailyEvent] Error fetching event:', err);
        }
    }, [eventId, dispatch]);

    // Format duration
    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0) return `${hours}j ${remainingMinutes}m`;
        return `${remainingMinutes}m`;
    };

    const renderMetaChip = (icon, label, value) => {
        if (!value) return null;
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: mode === 'dark' ? '#1F2937' : '#F3F4F6',
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#374151' : '#E5E7EB',
                marginRight: 8,
                marginBottom: 8
            }}>
                <Ionicons name={icon} size={14} color={subtitleColor} />
                <Text style={{
                    color: subtitleColor,
                    fontSize: 11,
                    fontFamily: 'Poppins-SemiBold',
                    marginLeft: 6
                }}>
                    {label}
                </Text>
                <Text style={{
                    color: textColor,
                    fontSize: 12,
                    fontFamily: 'Poppins-Bold',
                    marginLeft: 6
                }}>
                    {value}
                </Text>
            </View>
        );
    };

    // Handle finish event
    const handleFinishEvent = async () => {
        try {
            setFinishing(true);

            // Format finish time
            const finishTime = moment(finishData.finish_time).format('YYYY-MM-DD HH:mm:ss');

            // Validation
            if (moment(finishTime).isBefore(moment(event.start_time))) {
                setModalAlert({
                    visible: true,
                    title: 'Validasi Gagal',
                    message: 'Waktu selesai tidak boleh lebih awal dari waktu mulai',
                    type: 'error',
                    buttons: [{ text: 'Tutup' }]
                });
                setFinishing(false);
                return;
            }

            // API call to finish event
            const finishDataApi = {
                finish_time: finishTime,
                finish_description: finishData.finish_description,
                finished_by: 1 // Mock user ID
            };

            const response = await dispatch(finishEvent({ id: event.id, data: finishDataApi })).unwrap();

            setFinishing(false);
            setShowFinishModal(false);
            setModalAlert({
                visible: true,
                title: 'Berhasil',
                message: 'Event berhasil diselesaikan',
                type: 'success',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {
                            fetchEventData();
                            setModalAlert((prev) => ({ ...prev, visible: false }));
                        }
                    }
                ]
            });

        } catch (error) {
            setFinishing(false);
            setModalAlert({
                visible: true,
                title: 'Error',
                message: 'Gagal menyelesaikan event: ' + (error.message || 'Terjadi kesalahan'),
                type: 'error',
                buttons: [{ text: 'Tutup' }]
            });
        }
    };

    // Handle date/time picker confirm
    const handleDateTimeConfirm = (date) => {
        setShowDateTimePicker(false);
        const formatted = moment(date).format('YYYY-MM-DD HH:mm:ss');
        setFinishData(prev => ({
            ...prev,
            finish_time: formatted
        }));
    };

    // Handle share event
    const handleShare = async () => {
        try {
            const shareText = `
Event: ${event?.category?.nama}
Status: ${event?.status}
Waktu: ${moment(event?.start_time).format('DD MMM YYYY, HH:mm')} - ${event?.finish_time ? moment(event?.finish_time).format('HH:mm') : 'Sedang Berlangsung'}
Lokasi: ${event?.location?.nama}
Keterangan: ${event?.start_description || '-'}
            `.trim();

            await Share.share({
                message: shareText,
                title: `Detail Event - ${event?.category?.nama}`
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleDelete = () => {
        setModalAlert({
            visible: true,
            title: 'Konfirmasi',
            message: 'Hapus event ini?',
            type: 'warning',
            buttons: [
                { text: 'Batal', onPress: () => setModalAlert((prev) => ({ ...prev, visible: false })) },
                {
                    text: 'Hapus',
                    type: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(deleteEvent(event.id)).unwrap();
                            setModalAlert({
                                visible: true,
                                title: 'Berhasil',
                                message: 'Event dihapus',
                                type: 'success',
                                buttons: [{ text: 'OK', onPress: () => { setModalAlert((prev) => ({ ...prev, visible: false })); router.back(); } }]
                            });
                        } catch (err) {
                            setModalAlert({
                                visible: true,
                                title: 'Error',
                                message: err?.message || 'Gagal menghapus event',
                                type: 'error',
                                buttons: [{ text: 'Tutup', onPress: () => setModalAlert((prev) => ({ ...prev, visible: false })) }]
                            });
                        }
                    }
                }
            ]
        });
    };

    // Loading state
    if (loading) {
        return (
            <AppScreen>
                <HeaderScreen
                    title="Detail Event"
                    onBack={() => router.back()}
                    onThemes={true}
                    onNotification={true}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={mode === 'dark' ? '#60A5FA' : '#3B82F6'} />
                    <Text style={{ marginTop: 10, color: subtitleColor }}>
                        Memuat detail event...
                    </Text>
                </View>
            </AppScreen>
        );
    }

    // Error state
    if (error || !event) {
        return (
            <AppScreen>
                <HeaderScreen
                    title="Detail Event"
                    onBack={() => router.back()}
                    onThemes={true}
                    onNotification={true}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={48} color={mode === 'dark' ? '#F87171' : '#EF4444'} />
                    <Text style={{
                        marginTop: 16,
                        color: textColor,
                        fontSize: 16,
                        fontFamily: 'Poppins-Bold',
                        textAlign: 'center'
                    }}>
                        {error || 'Event tidak ditemukan'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            marginTop: 20,
                            backgroundColor: mode === 'dark' ? '#1E40AF' : '#2563EB',
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins-SemiBold' }}>
                            Kembali
                        </Text>
                    </TouchableOpacity>
                </View>
            </AppScreen>
        );
    }

    return (
        <AppScreen>
            <HeaderScreen
                title="Detail Event"
                onBack={() => router.back()}
                onThemes={true}
                onNotification={true}
                rightComponent={
                    <HStack space={2}>
                        <TouchableOpacity onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={24} color={textColor} />
                        </TouchableOpacity>
                        {event.status === 'ONGOING' && (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: '/operational/daily-events/edit',
                                        params: { id: event.id?.toString?.() || event.id }
                                    })
                                }
                            >
                                <Ionicons name="create-outline" size={24} color={textColor} />
                            </TouchableOpacity>
                        )}
                    </HStack>
                }
            />

            <ScrollView
                flex={1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <VStack space={4} px={4} pt={2}>
                    {/* Header Section - modern, compact */}
                    <VStack space={3} style={{
                        backgroundColor: cardBg,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: borderColor,
                        padding: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.12,
                        shadowRadius: 6,
                        elevation: 5
                    }}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                            <VStack flex={1} space={1}>
                                <Text style={{
                                    color: textColor,
                                    fontSize: 20,
                                    fontFamily: 'Poppins-Bold'
                                }}>
                                    {event.category?.nama || 'Event'}
                                </Text>
                                <Text style={{
                                    color: subtitleColor,
                                    fontSize: 12,
                                    fontFamily: 'Poppins-Regular'
                                }}>
                                    {moment(event.date_ops).format('dddd, DD MMMM YYYY')}
                                </Text>
                            </VStack>
                            <StatusBadge status={event.status} size="medium" />
                        </HStack>
                        <CategoryBadge category={event.category} size="medium" />
                        <VStack space={2}>
                            <HStack alignItems="center" space={1}>
                                <Ionicons name="information-circle-outline" size={12} color={subtitleColor} />
                                <Text style={[
                                    {
                                        color: subtitleColor,
                                        fontSize: 11,
                                        fontFamily: 'Poppins-SemiBold',
                                        textTransform: 'uppercase'
                                    }
                                ]}>
                                    Keterangan
                                </Text>
                            </HStack>
                            <Text style={[
                                {
                                    color: textColor,
                                    fontSize: 14,
                                    fontFamily: 'Poppins-Regular',
                                    lineHeight: 20
                                }
                            ]}>
                                {event.start_description || '-'}
                            </Text>
                        </VStack>
                    </VStack>

                    {/* Timeline & People */}
                    <VStack space={3} style={{
                        backgroundColor: cardBg,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: borderColor,
                        padding: 16
                    }}>
                        <Text style={{
                            color: textColor,
                            fontSize: 14,
                            fontFamily: 'Poppins-Bold'
                        }}>
                            Waktu & Lokasi
                        </Text>
                        <VStack space={2}>
                            <HStack space={2} alignItems="center">
                                <Ionicons name="time-outline" size={14} color={subtitleColor} />
                                <Text style={{ color: textColor, fontSize: 13, fontFamily: 'Poppins-Regular' }}>
                                    Mulai: {event.start_time ? moment(event.start_time).format('DD MMM YYYY, HH:mm') : '-'}
                                </Text>
                            </HStack>
                            {event.finish_time && (
                                <HStack space={2} alignItems="center">
                                    <Ionicons name="checkmark-circle-outline" size={14} color={subtitleColor} />
                                    <Text style={{ color: textColor, fontSize: 13, fontFamily: 'Poppins-Regular' }}>
                                        Selesai: {moment(event.finish_time).format('DD MMM YYYY, HH:mm')}
                                    </Text>
                                </HStack>
                            )}
                            {event.location?.nama && (
                                <HStack space={2} alignItems="flex-start">
                                    <Ionicons name="location-outline" size={14} color={subtitleColor} style={{ marginTop: 2 }} />
                                    <VStack space={1} flex={1}>
                                        <Text style={{ color: textColor, fontSize: 13, fontFamily: 'Poppins-SemiBold' }}>
                                            {event.location?.nama}
                                        </Text>
                                        {event.location_description && (
                                            <Text style={{ color: subtitleColor, fontSize: 12, fontFamily: 'Poppins-Regular' }}>
                                                {event.location_description}
                                            </Text>
                                        )}
                                    </VStack>
                                </HStack>
                            )}
                        </VStack>

                        <Divider my={2} />
                        <HStack space={3} flexWrap="wrap" alignItems="flex-start">
                            <VStack space={1} style={{ width: '48%' }}>
                                <Text style={{ color: subtitleColor, fontSize: 11, fontFamily: 'Poppins-Regular' }}>Dimulai Oleh</Text>
                                <Text style={{ color: textColor, fontSize: 13, fontFamily: 'Poppins-SemiBold' }}>{event.startedBy?.nama || '-'}</Text>
                                {event.startedBy?.jabatan && (
                                    <Text style={{ color: subtitleColor, fontSize: 11, fontFamily: 'Poppins-Regular' }}>{event.startedBy?.jabatan}</Text>
                                )}
                            </VStack>
                            {event.finishedBy?.nama && (
                                <VStack space={1} style={{ width: '48%' }}>
                                    <Text style={{ color: subtitleColor, fontSize: 11, fontFamily: 'Poppins-Regular' }}>Diselesaikan Oleh</Text>
                                    <Text style={{ color: textColor, fontSize: 13, fontFamily: 'Poppins-SemiBold' }}>{event.finishedBy?.nama}</Text>
                                </VStack>
                            )}
                        </HStack>
                    </VStack>

                    {/* Description Section */}
                    <VStack space={3} style={[
                        {
                            backgroundColor: cardBg,
                            padding: 16
                        }
                        ]}>

                        {event.finish_description && (
                            <>
                                <VStack space={2}>
                                    <Text style={[
                                        {
                                            color: subtitleColor,
                                            fontSize: 11,
                                            fontFamily: 'Poppins-SemiBold',
                                            textTransform: 'uppercase'
                                        }
                                    ]}>
                                        Keterangan Selesai
                                    </Text>
                                    <Text style={[
                                        {
                                            color: textColor,
                                            fontSize: 14,
                                            fontFamily: 'Poppins-Regular',
                                            lineHeight: 20
                                        }
                                    ]}>
                                        {event.finish_description}
                                    </Text>
                                </VStack>
                            </>
                        )}
                    </VStack>

                    {/* Actions */}
                    <HStack space={3} mt={4}>
                        <TouchableOpacity
                            onPress={() => setShowFinishModal(true)}
                            disabled={event.status !== 'ONGOING'}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 14,
                                borderRadius: 10,
                                backgroundColor: event.status === 'ONGOING' ? (mode === 'dark' ? '#065F46' : '#10B981') : (mode === 'dark' ? '#1F2937' : '#E5E7EB'),
                                opacity: event.status === 'ONGOING' ? 1 : 0.5
                            }}
                        >
                            <TickCircle color={event.status === 'ONGOING' ? '#FFFFFF' : subtitleColor} variant="Bold" size={20} style={{ marginRight: 8 }} />
                            <Text style={{ color: event.status === 'ONGOING' ? '#FFFFFF' : subtitleColor, fontFamily: 'Poppins-Bold', fontSize: 14 }}>
                                Selesaikan
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: '/operational/daily-events/edit',
                                    params: { id: event.id?.toString?.() || event.id }
                                })
                            }
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                backgroundColor: mode === 'dark' ? '#f09d27' : '#eeb304',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Edit2 color={'#FFF'} variant="Bold" size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                backgroundColor: mode === 'dark' ? '#F87171' : '#EF4444',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Trash color={'#FFF'} variant="Bold" size={20} />
                        </TouchableOpacity>
                    </HStack>

                    {/* Finish Modal */}
                    {showFinishModal && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'flex-end'
                        }}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => setShowFinishModal(false)}
                                style={{ flex: 1 }}
                            />
                            <View style={{
                                backgroundColor: mode === 'dark' ? '#2A2C3E' : '#FFFFFF',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                padding: 20
                            }}>
                                <Text style={[
                                    {
                                        color: textColor,
                                        fontSize: 18,
                                        fontFamily: 'Poppins-Bold',
                                        marginBottom: 16
                                    }
                                ]}>
                                    Selesaikan Event
                                </Text>

                                <VStack space={4}>
                                    {/* Finish Time */}
                                    <VStack space={2}>
                                        <Text style={[
                                            {
                                                color: textColor,
                                                fontSize: 14,
                                                fontFamily: 'Poppins-SemiBold'
                                            }
                                        ]}>
                                            Waktu Selesai
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowDateTimePicker(true)}
                                            style={{
                                                backgroundColor: mode === 'dark' ? '#374151' : '#F9FAFB',
                                                borderRadius: 8,
                                                padding: 12,
                                                borderWidth: 1,
                                                borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <HStack space={2} alignItems="center">
                                                <Ionicons name="time-outline" size={18} color={subtitleColor} />
                                                <Text style={[
                                                    {
                                                        color: textColor,
                                                        fontSize: 14,
                                                        fontFamily: 'Poppins-Regular'
                                                    }
                                                ]}>
                                                    {moment(finishData.finish_time).format('DD MMM YYYY, HH:mm')}
                                                </Text>
                                            </HStack>
                                            <Ionicons name="calendar-outline" size={16} color={subtitleColor} />
                                        </TouchableOpacity>
                                    </VStack>

                                    {/* Finish Description */}
                                    <VStack space={2}>
                                        <Text style={[
                                            {
                                                color: textColor,
                                                fontSize: 14,
                                                fontFamily: 'Poppins-SemiBold'
                                            }
                                        ]}>
                                            Keterangan (Opsional)
                                        </Text>
                                        <TextInput
                                            multiline
                                            placeholder="Deskripsi event (opsional)"
                                            placeholderTextColor={subtitleColor}
                                            value={finishData?.finish_description}
                                            onChangeText={(value) => setFinishData((prev) => ({
                                                ...prev,
                                                finish_description: value
                                            }))}
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

                                    {/* Action Buttons */}
                                    <HStack space={3} mt={2}>
                                        <TouchableOpacity
                                            onPress={() => setShowFinishModal(false)}
                                            style={{
                                                flex: 1,
                                                backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                                                borderRadius: 8,
                                                padding: 14,
                                                borderWidth: 1,
                                                borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB'
                                            }}
                                        >
                                            <Text style={{
                                                color: textColor,
                                                fontSize: 16,
                                                fontFamily: 'Poppins-SemiBold',
                                                textAlign: 'center'
                                            }}>
                                                Batal
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleFinishEvent}
                                            disabled={finishing}
                                            style={{
                                                flex: 2,
                                                backgroundColor: mode === 'dark' ? '#065F46' : '#10B981',
                                                borderRadius: 8,
                                                padding: 14,
                                                opacity: finishing ? 0.7 : 1
                                            }}
                                        >
                                            <HStack justifyContent="center" alignItems="center" space={2}>
                                                {finishing ? (
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                ) : (
                                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                                )}
                                                <Text style={{
                                                    color: '#FFFFFF',
                                                    fontSize: 16,
                                                    fontFamily: 'Poppins-Bold',
                                                    textAlign: 'center'
                                                }}>
                                                    {finishing ? 'Menyimpan...' : 'Selesaikan'}
                                                </Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </HStack>
                                </VStack>
                            </View>
                        </View>
                    )}
                </VStack>
            </ScrollView>

            {/* DateTime Picker Modal */}
            <DateTimePickerModal
                isVisible={showDateTimePicker}
                mode="datetime"
                onConfirm={handleDateTimeConfirm}
                onCancel={() => setShowDateTimePicker(false)}
                date={finishData.finish_time ? new Date(finishData.finish_time) : new Date()}
            />

            <ModalAlert
              isVisible={modalAlert.visible}
              title={modalAlert.title}
              message={modalAlert.message}
              type={modalAlert.type}
              buttons={modalAlert.buttons}
              onClose={() => setModalAlert((prev) => ({ ...prev, visible: false }))}
            />
        </AppScreen>
    );
}
