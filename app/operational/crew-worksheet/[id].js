import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VStack, HStack, Text, Box, Divider, Pressable, Button, ScrollView, Center } from 'native-base';
import { View, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import moment from 'moment';
import { Watch, Coffee, DocumentText, User, Timer, ArrowLeft, Calendar, Warning2, TickCircle, Danger as DangerIcon, Trash } from 'iconsax-react-native';
import { useCrewWorksheet } from '../../../src/hooks/crewWorksheet/useCrewWorksheet';
import { getStatusColor, getStatusText, formatDuration } from '../../../src/utils/crewWorksheet/utils/validation';
import { showAlert } from '../../../src/store/slices/alertSlice';

export default function CrewWorksheetDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [worksheet, setWorksheet] = useState(null);
    const [error, setError] = useState(null);

    const { getWorksheetDetail, deleteWorksheet } = useCrewWorksheet();
    const user = useSelector(state => state.auth?.user || {});
    const mode = useSelector(state => state.themes?.value || 'light');

    const screenWidth = Dimensions.get('window').width;
    const isSmall = screenWidth < 375;

    // Color constants
    const textColor = COLORS.teks[mode][1] || '#2f313e';
    const backgroundColor = COLORS.container[mode] || '#F5F5F5';
    const cardBg = COLORS.card[mode] || '#ffffff';
    const borderColor = COLORS.line[mode][1] || '#e5e7eb';

    const worksheetId = params.id;
    const fallbackWorksheet = useMemo(() => {
        if (!params?.data) return null;
        try {
            return JSON.parse(params.data);
        } catch (e) {
            return null;
        }
    }, [params?.data]);

    useEffect(() => {
        let cancelled = false;

        const fetchDetail = async () => {
            if (!worksheetId) return;
            try {
                setLoading(true);
                setError(null);

                const result = await getWorksheetDetail(worksheetId);
                if (cancelled) return;

                if (!result) {
                    setWorksheet(null);
                    setError('Gagal memuat data worksheet');
                } else {
                    setWorksheet(result);
                    setError(null);
                }
            } catch (error) {
                console.error('Error loading worksheet detail:', error);
                if (!cancelled) {
                    setWorksheet(null);
                    setError('Gagal memuat data worksheet');
                    dispatch(showAlert({
                        status: 'error',
                        title: 'Error',
                        subtitle: error.message || 'Gagal memuat data worksheet',
                        duration: 4000
                    }));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchDetail();
        return () => { cancelled = true; };
    }, [worksheetId, dispatch]);

    const onRefresh = useCallback(async () => {
        if (!worksheetId) return;
        setRefreshing(true);
        try {
            const result = await getWorksheetDetail(worksheetId);

            if (!result && fallbackWorksheet) {
                setWorksheet(fallbackWorksheet);
                setError(null);
            } else if (!result) {
                setWorksheet(null);
                setError('Gagal memuat data worksheet');
            } else {
                setWorksheet(result);
                setError(null);
            }
        } catch (error) {
            console.error('Error loading worksheet detail:', error);
            setWorksheet(null);
            setError('Gagal memuat data worksheet');
            dispatch(showAlert({
                status: 'error',
                title: 'Error',
                subtitle: error.message || 'Gagal memuat data worksheet',
                duration: 4000
            }));
        } finally {
            setRefreshing(false);
        }
    }, [worksheetId, dispatch]);

    // Normalized status helpers
    const statusNormalized = (worksheet?.status || '').toString().trim().toUpperCase();
    const isPending = statusNormalized === 'P';

    const handleUpdate = () => {
        if (!worksheet || !isPending) return;

        router.push({
            pathname: '/operational/crew-worksheet/create',
            params: { worksheet: JSON.stringify(worksheet) }
        });
    };

    const handleDelete = async () => {
        if (!worksheet || !isPending) return;

        try {
            await deleteWorksheet(worksheet.id);
            router.back();
            dispatch(showAlert({
                status: 'success',
                title: 'Berhasil',
                subtitle: 'Worksheet berhasil dihapus',
                duration: 3000
            }));
        } catch (error) {
            console.error('Error deleting worksheet:', error);
            dispatch(showAlert({
                status: 'error',
                title: 'Error',
                subtitle: 'Gagal menghapus worksheet',
                duration: 4000
            }));
        }
    };


    const calculateHours = (start, end) => {
        if (!start || !end) return 0;

        const startTime = moment(start, 'HH:mm');
        const endTime = moment(end, 'HH:mm');

        if (endTime <= startTime) {
            endTime.add(1, 'day');
        }

        const duration = moment.duration(endTime.diff(startTime));
        return duration.asHours();
    };

    const totalWorkHours = worksheet ? calculateHours(worksheet.jam_mulai, worksheet.jam_selesai) : 0;
    const totalBreakHours = worksheet ? calculateHours(worksheet.istirahat_mulai, worksheet.istirahat_selesai) : 0;
    const productiveHours = totalWorkHours - totalBreakHours;
    const overtimeHours = productiveHours > worksheet?.jam_kerja_normal ? productiveHours - worksheet?.jam_kerja_normal : 0;

    const StatusBadge = ({ status }) => {
        const statusColor = getStatusColor(status);
        const statusText = getStatusText(status);

        return (
            <Box
                bg={statusColor}
                px={3}
                py={1}
                rounded="full"
                style={{
                    shadowColor: statusColor,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2
                }}>
                <Text
                    color="white"
                    fontSize={isSmall ? 11 : 12}
                    fontFamily="Quicksand-Bold"
                    textTransform="uppercase"
                    letterSpacing={0.5}>
                    {statusText}
                </Text>
            </Box>
        );
    };

    const InfoCard = ({ icon, title, value, subtitle }) => (
        <VStack
            bg={cardBg}
            rounded="lg"
            p={3}
            borderWidth={1}
            borderColor={borderColor}
            space={1}>
            <HStack alignItems="center" space={2}>
                {icon}
                <Text
                    color={textColor}
                    fontFamily="Quicksand-Bold"
                    fontSize={isSmall ? 12 : 13}>
                    {title}
                </Text>
            </HStack>
            <Text
                color={textColor}
                fontFamily="Quicksand-SemiBold"
                fontSize={isSmall ? 14 : 16}>
                {value}
            </Text>
            {subtitle && (
                <Text
                    color={COLORS.teks[mode][2]}
                    fontFamily="Quicksand-Regular"
                    fontSize={isSmall ? 10 : 11}>
                    {subtitle}
                </Text>
            )}
        </VStack>
    );

    if (loading && !worksheet) {
        return (
            <AppScreen>
                <HeaderScreen
                    title="Detail Worksheet"
                    onBack={() => router.back()}
                    onThemes={true}
                    onNotification={true}
                />
                <Center flex={1} bg={backgroundColor}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text mt={3} color={textColor} fontFamily="Quicksand-Regular">
                        Memuat detail worksheet...
                    </Text>
                </Center>
            </AppScreen>
        );
    }

    if (error && !worksheet) {
        return (
            <AppScreen>
                <HeaderScreen
                    title="Detail Worksheet"
                    onBack={() => router.back()}
                    onThemes={true}
                    onNotification={true}
                />
                <Center flex={1} bg={backgroundColor}>
                    <VStack space={3} alignItems="center">
                        <DangerIcon size={48} color={COLORS.danger} />
                        <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={16}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            onPress={onRefresh}
                            style={{
                                backgroundColor: COLORS.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 20,
                                marginTop: 10
                            }}>
                            <Text color="white" fontFamily="Quicksand-Bold">
                                Coba Lagi
                            </Text>
                        </TouchableOpacity>
                    </VStack>
                </Center>
            </AppScreen>
        );
    }

    return (
        <AppScreen>
            <HeaderScreen
                title="Detail Worksheet"
                onBack={() => router.back()}
                onThemes={true}
                onNotification={true}
            />

            <ScrollView
                flex={1}
                bg={backgroundColor}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }>
                <VStack p={4} space={4}>
                    {/* Header Info */}
                    <VStack
                        bg={cardBg}
                        rounded="lg"
                        p={4}
                        borderWidth={1}
                        borderColor={borderColor}
                        space={3}>
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack>
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-Bold"
                                    fontSize={isSmall ? 16 : 18}>
                                    {worksheet?.crew?.nama || 'Unknown Crew'}
                                </Text>
                                <Text
                                    color={COLORS.teks[mode][2]}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 12 : 13}>
                                    {worksheet?.crew?.nik || 'No NIK'}
                                </Text>
                            </VStack>
                            <StatusBadge status={worksheet?.status} />
                        </HStack>

                        <Divider />

                        <HStack alignItems="center" space={3}>
                            <Calendar size={20} color={COLORS.primary} />
                            <VStack>
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-SemiBold"
                                    fontSize={isSmall ? 14 : 15}>
                                    {moment(worksheet?.tanggal).format('dddd, DD MMMM YYYY')}
                                </Text>
                                <Text
                                    color={COLORS.teks[mode][2]}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 11 : 12}>
                                    Tanggal Kegiatan
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack alignItems="center" space={3}>
                            <User size={20} color={COLORS.primary} />
                            <VStack>
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-SemiBold"
                                    fontSize={isSmall ? 14 : 15}>
                                    {worksheet?.supervisor?.nama || 'Unknown Supervisor'}
                                </Text>
                                <Text
                                    color={COLORS.teks[mode][2]}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 11 : 12}>
                                    Penanggung Jawab
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    {/* Time Information */}
                    <VStack
                        bg={cardBg}
                        rounded="lg"
                        p={4}
                        borderWidth={1}
                        borderColor={borderColor}
                        space={3}>
                        <Text
                            color={textColor}
                            fontFamily="Quicksand-Bold"
                            fontSize={isSmall ? 14 : 16}>
                            Informasi Waktu
                        </Text>

                        <HStack space={3}>
                            <InfoCard
                                icon={<Watch size={16} color={COLORS.primary} />}
                                title="Jam Kerja"
                                value={`${worksheet?.jam_mulai} - ${worksheet?.jam_selesai}`}
                                subtitle={`${totalWorkHours.toFixed(1)} jam`}
                            />
                            <InfoCard
                                icon={<Coffee size={16} color={COLORS.warning} />}
                                title="Istirahat"
                                value={`${worksheet?.istirahat_mulai} - ${worksheet?.istirahat_selesai}`}
                                subtitle={`${totalBreakHours.toFixed(1)} jam`}
                            />
                        </HStack>

                        <HStack space={3}>
                            <InfoCard
                                icon={<Timer size={16} color={COLORS.success} />}
                                title="Produktif"
                                value={`${productiveHours.toFixed(1)} jam`}
                                subtitle="Jam kerja efektif"
                            />
                            <InfoCard
                                icon={<Timer size={16} color={overtimeHours > 0 ? COLORS.warning : COLORS.gray} />}
                                title="Lembur"
                                value={`${overtimeHours.toFixed(1)} jam`}
                                subtitle={overtimeHours > 0 ? 'Ada lembur' : 'Tidak ada lembur'}
                            />
                        </HStack>
                    </VStack>

                    {/* Activity Description */}
                    <VStack
                        bg={cardBg}
                        rounded="lg"
                        p={4}
                        borderWidth={1}
                        borderColor={borderColor}
                        space={3}>
                        <HStack alignItems="center" space={2}>
                            <DocumentText size={16} color={COLORS.primary} />
                            <Text
                                color={textColor}
                                fontFamily="Quicksand-Bold"
                                fontSize={isSmall ? 14 : 16}>
                                Keterangan Aktivitas
                            </Text>
                        </HStack>
                        <Text
                            color={textColor}
                            fontFamily="Quicksand-Regular"
                            fontSize={isSmall ? 13 : 14}
                            lineHeight={20}
                            style={{ textAlign: 'left' }}>
                            {worksheet?.keterangan || 'Tidak ada keterangan'}
                        </Text>
                    </VStack>

                    {/* Status Information */}
                    <VStack
                        bg={cardBg}
                        rounded="lg"
                        p={4}
                        borderWidth={1}
                        borderColor={borderColor}
                        space={3}>
                        <Text
                            color={textColor}
                            fontFamily="Quicksand-Bold"
                            fontSize={isSmall ? 14 : 16}>
                            Status & Informasi
                        </Text>

                        <HStack justifyContent="space-between" alignItems="center">
                            <Text
                                color={COLORS.teks[mode][2]}
                                fontFamily="Quicksand-Regular"
                                fontSize={isSmall ? 12 : 13}>
                                Dibuat pada
                            </Text>
                            <Text
                                color={textColor}
                                fontFamily="Quicksand-SemiBold"
                                fontSize={isSmall ? 12 : 13}>
                                {moment(worksheet?.created_at).format('DD MMM YYYY, HH:mm')}
                            </Text>
                        </HStack>

                        {worksheet?.updated_at !== worksheet?.created_at && (
                            <HStack justifyContent="space-between" alignItems="center">
                                <Text
                                    color={COLORS.teks[mode][2]}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 12 : 13}>
                                    Diperbarui pada
                                </Text>
                                <Text
                                    color={textColor}
                                    fontFamily="Quicksand-SemiBold"
                                    fontSize={isSmall ? 12 : 13}>
                                    {moment(worksheet?.updated_at).format('DD MMM YYYY, HH:mm')}
                                </Text>
                            </HStack>
                        )}

                        {worksheet?.status === 'A' && (
                            <VStack space={2} bg={`${COLORS.success}10`} p={3} rounded="md">
                                <HStack alignItems="center" space={2}>
                                    <TickCircle size={16} color={COLORS.success} />
                                    <Text
                                        color={COLORS.success}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={isSmall ? 12 : 13}>
                                        Telah Disetujui
                                    </Text>
                                </HStack>
                                <Text
                                    color={COLORS.success}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 11 : 12}>
                                    Worksheet ini telah disetujui oleh supervisor
                                </Text>
                            </VStack>
                        )}

                        {worksheet?.status === 'R' && (
                            <VStack space={2} bg={`${COLORS.danger}10`} p={3} rounded={"md"}>
                                <HStack alignItems="center" space={2}>
                                    <DangerIcon size={16} color={COLORS.danger} />
                                    <Text
                                        color={COLORS.danger}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={isSmall ? 12 : 13}>
                                        Ditolak
                                    </Text>
                                </HStack>
                                <Text
                                    color={COLORS.danger}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 11 : 12}>
                                    Worksheet ini ditolak, silakan periksa kembali data Anda
                                </Text>
                            </VStack>
                        )}

                        {worksheet?.status === 'P' && (
                            <VStack space={2} bg={`${COLORS.warning}10`} p={3} rounded={"md"}>
                                <HStack alignItems="center" space={2}>
                                    <Warning2 size={16} color={COLORS.warning} />
                                    <Text
                                        color={COLORS.warning}
                                        fontFamily="Quicksand-SemiBold"
                                        fontSize={isSmall ? 12 : 13}>
                                        Menunggu Persetujuan
                                    </Text>
                                </HStack>
                                <Text
                                    color={COLORS.warning}
                                    fontFamily="Quicksand-Regular"
                                    fontSize={isSmall ? 11 : 12}>
                                    Worksheet ini sedang dalam proses persetujuan supervisor
                                </Text>
                            </VStack>
                        )}
                    </VStack>

                    {/* Action Buttons */}
                    <HStack space={3}>
                        {isPending && (
                            <>
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={{
                                        flex: 1,
                                        backgroundColor: COLORS.danger,
                                        paddingVertical: 12,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: COLORS.danger,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        elevation: 3
                                    }}>
                                    <Trash size={16} color="white" />
                                    <Text color="white" fontFamily="Quicksand-Bold" ml={2}>
                                        Hapus
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleUpdate}
                                    style={{
                                        flex: 2,
                                        backgroundColor: COLORS.primary,
                                        paddingVertical: 12,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: COLORS.primary,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        elevation: 3
                                    }}>
                                    <Text color="white" fontFamily="Quicksand-Bold" ml={2}>
                                        Update Worksheet
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </HStack>
                </VStack>
            </ScrollView>
        </AppScreen>
    );
}
