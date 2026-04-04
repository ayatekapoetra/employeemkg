import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VStack, HStack, Text, Box, Divider, ScrollView, Center } from 'native-base';
import { TouchableOpacity, RefreshControl, Dimensions, View, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import CustomAlert from '../../../src/components/common/CustomAlert';
import { COLORS } from '../../../src/constants/colors';
import moment from 'moment';
import { Watch, Alarm, Coffee, DocumentText, User, Timer, Calendar, Warning2, TickCircle, Danger as DangerIcon } from 'iconsax-react-native';
import { useCrewWorksheet } from '../../../src/hooks/crewWorksheet/useCrewWorksheet';
import { getStatusColor, getStatusText } from '../../../src/utils/crewWorksheet/utils/validation';
import { showAlert } from '../../../src/store/slices/alertSlice';

export default function ApprovalWorksheetShowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [worksheet, setWorksheet] = useState(null);
  const [error, setError] = useState(null);
  const [confirmAlert, setConfirmAlert] = useState({ visible: false, title: '', message: '', onConfirm: null });
  const [komentar_spv, setKomentar_spv] = useState('');

  const { getWorksheetDetail, approveWorksheet, rejectWorksheet } = useCrewWorksheet();
  const mode = useSelector(state => state.themes?.value || 'light');

  const screenWidth = Dimensions.get('window').width;
  const isSmall = screenWidth < 375;

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

  const statusNormalized = (worksheet?.status || '').toString().trim().toUpperCase();
  const isPending = statusNormalized === 'P';

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      if (!worksheetId) {
        setWorksheet(fallbackWorksheet);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const result = await getWorksheetDetail(worksheetId);
        if (cancelled) return;

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
      } catch (err) {
        console.error('Error loading worksheet detail:', err);
        if (!cancelled) {
          setWorksheet(fallbackWorksheet || null);
          setError('Gagal memuat data worksheet');
          dispatch(showAlert({
            status: 'error',
            title: 'Error',
            subtitle: err.message || 'Gagal memuat data worksheet',
            duration: 4000
          }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [worksheetId, fallbackWorksheet, dispatch]);

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
    } catch (err) {
      console.error('Error loading worksheet detail:', err);
      setWorksheet(fallbackWorksheet || null);
      setError('Gagal memuat data worksheet');
      dispatch(showAlert({
        status: 'error',
        title: 'Error',
        subtitle: err.message || 'Gagal memuat data worksheet',
        duration: 4000
      }));
    } finally {
      setRefreshing(false);
    }
  }, [worksheetId, fallbackWorksheet, dispatch]);

const handleApprove = () => {
    if (!worksheet || !isPending) return;
    setConfirmAlert({
      visible: true,
      title: 'Setujui Worksheet',
      message: 'Apakah Anda yakin ingin menyetujui worksheet ini?',
      onConfirm: async () => {
        try {
          // Pass empty comment for approval
          await approveWorksheet({ id: worksheet.id, comment: '' });
          dispatch(showAlert({ status: 'success', title: 'Disetujui', subtitle: 'Worksheet telah disetujui', duration: 3000 }));
          router.back();
        } catch (err) {
          dispatch(showAlert({ status: 'error', title: 'Error', subtitle: err.message || 'Gagal menyetujui', duration: 4000 }));
        }
      }
    });
  };

  const handleReject = () => {
    if (!worksheet || !isPending) return;
    
    // Validate rejection comment
    if (!komentar_spv.trim()) {
      dispatch(showAlert({ 
        status: 'error', 
        title: 'Validasi Error', 
        subtitle: 'Keterangan penolakan harus diisi', 
        duration: 3000 
      }));
      return;
    }
    
    setConfirmAlert({
      visible: true,
      title: 'Tolak Worksheet',
      message: 'Apakah Anda yakin ingin menolak worksheet ini?',
      onConfirm: async () => {
        try {
          await rejectWorksheet({ id: worksheet.id, comment: komentar_spv });
          dispatch(showAlert({ status: 'success', title: 'Ditolak', subtitle: 'Worksheet telah ditolak', duration: 3000 }));
          router.back();
        } catch (err) {
          dispatch(showAlert({ status: 'error', title: 'Error', subtitle: err.message || 'Gagal menolak', duration: 4000 }));
        }
      }
    });
  };

  const hideConfirmAlert = () => setConfirmAlert(prev => ({ ...prev, visible: false }));

  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const startTime = moment(start, 'HH:mm');
    const endTime = moment(end, 'HH:mm');
    if (!startTime.isValid() || !endTime.isValid()) return 0;
    if (endTime <= startTime) endTime.add(1, 'day');
    return moment.duration(endTime.diff(startTime)).asHours();
  };

  const StatusBadge = ({ status }) => {
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);
    return (
      <Box bg={statusColor} px={3} py={1} rounded="full" style={{ shadowColor: statusColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }}>
        <Text color="white" fontSize={isSmall ? 11 : 12} fontFamily="Quicksand-Bold" textTransform="uppercase" letterSpacing={0.5}>
          {statusText}
        </Text>
      </Box>
    );
  };

  const InfoCard = ({ icon, title, value, subtitle }) => (
    <VStack flex={1} bg={cardBg} rounded="lg" p={3} borderWidth={1} borderColor={borderColor} space={1}>
      <HStack alignItems="center" space={2}>
        {icon}
        <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={isSmall ? 12 : 13}>
          {title}
        </Text>
      </HStack>
      <Text color={textColor} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 14 : 16}>
        {value}
      </Text>
      {subtitle && (
        <Text color={COLORS.teks[mode][2]} fontFamily="Quicksand-Regular" fontSize={isSmall ? 10 : 11}>
          {subtitle}
        </Text>
      )}
    </VStack>
  );

  if (loading && !worksheet) {
    return (
      <AppScreen>
        <HeaderScreen title="Detail Approval Worksheet" onBack={() => router.back()} onThemes={true} onNotification={true} />
        <LoadingHauler />
      </AppScreen>
    );
  }

  if (error && !worksheet) {
    return (
      <AppScreen>
        <HeaderScreen title="Detail Approval Worksheet" onBack={() => router.back()} onThemes={true} onNotification={true} />
        <Center flex={1} bg={backgroundColor}>
          <VStack space={3} alignItems="center">
            <DangerIcon size={48} color={COLORS.danger} />
            <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={16}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 10 }}>
              <Text color="white" fontFamily="Quicksand-Bold">Coba Lagi</Text>
            </TouchableOpacity>
          </VStack>
        </Center>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <HeaderScreen title="Detail Approval Worksheet" onBack={() => router.back()} onThemes={true} onNotification={true} />

      <ScrollView
        flex={1}
        bg={backgroundColor}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}>
        <VStack p={4} space={4}>
          <VStack bg={cardBg} rounded="lg" p={4} borderWidth={1} borderColor={borderColor} space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={isSmall ? 16 : 18}>
                  {worksheet?.crew?.nama || 'Unknown Crew'}
                </Text>
                <Text color={COLORS.teks[mode][2]} fontFamily="Quicksand-Regular" fontSize={isSmall ? 12 : 13}>
                  {worksheet?.crew?.section || worksheet?.crew?.handphone || '-'}
                </Text>
              </VStack>
              <StatusBadge status={worksheet?.status} />
            </HStack>

            <Divider />

            <HStack alignItems="center" space={3}>
              <Calendar size={20} color={COLORS.primary} />
              <VStack>
                <Text color={textColor} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 14 : 15}>
                  {moment(worksheet?.tanggal).format('dddd, DD MMMM YYYY')}
                </Text>
                <Text color={COLORS.teks[mode][2]} fontFamily="Quicksand-Regular" fontSize={isSmall ? 11 : 12}>
                  Tanggal Kegiatan
                </Text>
              </VStack>
            </HStack>

            <HStack alignItems="center" space={3}>
              <User size={20} color={COLORS.primary} />
              <VStack>
                <Text color={textColor} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 14 : 15}>
                  {worksheet?.supervisor?.nama || 'Unknown Supervisor'}
                </Text>
                <Text color={COLORS.teks[mode][2]} fontFamily="Quicksand-Regular" fontSize={isSmall ? 11 : 12}>
                  Penanggung Jawab
                </Text>
              </VStack>
            </HStack>
          </VStack>

          <VStack bg={cardBg} rounded="lg" p={4} borderWidth={1} borderColor={borderColor} space={3}>
            <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={isSmall ? 14 : 16}>
              Informasi Waktu
            </Text>

            <HStack space={3}>
              <InfoCard
                icon={<Watch size={16} color={COLORS.primary} />}
                title="Jam Kerja"
                value={`${moment(worksheet?.jam_mulai, 'HH:mm').format('HH:mm')} - ${moment(worksheet?.jam_selesai, 'HH:mm').format('HH:mm')}`}
                subtitle={`${Math.max(0, calculateHours(worksheet?.jam_mulai, worksheet?.jam_selesai) || 0).toFixed(1)} jam`}
              />
              <InfoCard
                icon={<Coffee size={16} color={COLORS.warning} />}
                title="Istirahat"
                value={`${moment(worksheet?.istirahat_mulai, 'HH:mm').format('HH:mm')} - ${moment(worksheet?.istirahat_selesai, 'HH:mm').format('HH:mm')}`}
                subtitle={`${Math.max(0, calculateHours(worksheet?.istirahat_mulai, worksheet?.istirahat_selesai) || 0).toFixed(1)} jam`}
              />
            </HStack>

            <HStack space={3}>
              <InfoCard
                icon={<Timer size={16} color={COLORS.success} />}
                title="Produktif"
                value={`${Math.max(0, (calculateHours(worksheet?.jam_mulai, worksheet?.jam_selesai) - calculateHours(worksheet?.istirahat_mulai, worksheet?.istirahat_selesai)) || 0).toFixed(1)} jam`}
                subtitle="Jam kerja efektif"
              />
              <InfoCard
                icon={<Timer size={16} color={(calculateHours(worksheet?.jam_mulai, worksheet?.jam_selesai) - calculateHours(worksheet?.istirahat_mulai, worksheet?.istirahat_selesai) - (worksheet?.jam_kerja_normal || 8) > 0) ? COLORS.warning : COLORS.gray} />}
                title="Lembur"
                value={`${Math.max(0, (calculateHours(worksheet?.jam_mulai, worksheet?.jam_selesai) - calculateHours(worksheet?.istirahat_mulai, worksheet?.istirahat_selesai) - (worksheet?.jam_kerja_normal || 8)) || 0).toFixed(1)} jam`}
                subtitle={(calculateHours(worksheet?.jam_mulai, worksheet?.jam_selesai) - calculateHours(worksheet?.istirahat_mulai, worksheet?.istirahat_selesai) - (worksheet?.jam_kerja_normal || 8) > 0) ? 'Ada lembur' : 'Tidak ada lembur'}
              />
            </HStack>
          </VStack>

          <VStack bg={cardBg} rounded="lg" p={4} borderWidth={1} borderColor={borderColor} space={3}>
            <HStack alignItems="center" space={2}>
              <DocumentText size={16} color={COLORS.primary} />
              <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={isSmall ? 14 : 16}>
                Keterangan Aktivitas
              </Text>
            </HStack>
            <Text color={textColor} fontFamily="Quicksand-Regular" fontSize={isSmall ? 13 : 14} lineHeight={20} style={{ textAlign: 'left' }}>
              {worksheet?.keterangan || 'Tidak ada keterangan'}
            </Text>
          </VStack>

          <VStack bg={cardBg} rounded="lg" p={4} borderWidth={1} borderColor={borderColor} space={3}>
            <HStack alignItems="center" space={2}>
              <Alarm size={16} color={COLORS.danger} />
              <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={isSmall ? 14 : 16}>
                Keterangan Penolakan
              </Text>
            </HStack>
            {
              worksheet.komentar_spv ?
              <Text color={textColor} fontFamily="Quicksand-Regular" fontSize={isSmall ? 13 : 14} lineHeight={20} style={{ textAlign: 'left' }}>
                {worksheet?.komentar_spv || 'Tidak ada keterangan'}
              </Text>
              :
              <>
                <View style={{ 
                    minHeight: 100,
                    backgroundColor: COLORS.container[mode],
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: borderColor
                  }}>
                  <TextInput
                    placeholder="Berikan alasan penolakan data..."
                    placeholderTextColor={COLORS.teks[mode][2] || '#9ca3af'}
                    value={komentar_spv}
                    onChangeText={setKomentar_spv}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={{
                      color: textColor,
                      fontSize: isSmall ? 12 : 14,
                      fontFamily: 'Quicksand-Regular',
                      padding: 12,
                      minHeight: 80,
                      textAlign: 'left',
                    }}
                    onFocus={(e) => e.target.focus()}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {}}
                    returnKeyType="done"
                  />
                </View>
                <Text color={COLORS.danger} fontFamily="Quicksand-Regular" fontSize={isSmall ? 10 : 11}>
                  *Wajib diisi jika menolak data
                </Text>
              </>
            }
          </VStack>

          <VStack bg={cardBg} rounded="lg" p={4} borderWidth={1} borderColor={borderColor} space={3}>
            <Text color={textColor} fontFamily="Quicksand-Bold" fontSize={isSmall ? 14 : 16}>
              Status & Informasi
            </Text>

            <HStack justifyContent="space-between" alignItems="center">
              <Text color={COLORS.teks[mode][2]} fontFamily="Quicksand-Regular" fontSize={isSmall ? 12 : 13}>
                Dibuat pada
              </Text>
              <Text color={textColor} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 12 : 13}>
                {worksheet?.created_at ? moment(worksheet?.created_at).format('DD MMM YYYY, HH:mm') : '-'}
              </Text>
            </HStack>

            {worksheet?.updated_at && worksheet?.updated_at !== worksheet?.created_at && (
              <HStack justifyContent="space-between" alignItems="center">
                <Text color={COLORS.teks[mode][2]} fontFamily="Quicksand-Regular" fontSize={isSmall ? 12 : 13}>
                  Diperbarui pada
                </Text>
                <Text color={textColor} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 12 : 13}>
                  {moment(worksheet?.updated_at).format('DD MMM YYYY, HH:mm')}
                </Text>
              </HStack>
            )}

            {worksheet?.status === 'A' && (
              <VStack space={2} bg={`${COLORS.success}10`} p={3} rounded="md">
                <HStack alignItems="center" space={2}>
                  <TickCircle size={16} color={COLORS.success} />
                  <Text color={COLORS.success} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 12 : 13}>
                    Telah Disetujui
                  </Text>
                </HStack>
                <Text color={COLORS.success} fontFamily="Quicksand-Regular" fontSize={isSmall ? 11 : 12}>
                  Worksheet ini telah disetujui oleh supervisor
                </Text>
              </VStack>
            )}

            {worksheet?.status === 'R' && (
              <VStack space={2} bg={`${COLORS.danger}10`} p={3} rounded="md">
                <HStack alignItems="center" space={2}>
                  <DangerIcon size={16} color={COLORS.danger} />
                  <Text color={COLORS.danger} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 12 : 13}>
                    Ditolak
                  </Text>
                </HStack>
                <Text color={COLORS.danger} fontFamily="Quicksand-Regular" fontSize={isSmall ? 11 : 12}>
                  Worksheet ini ditolak, silakan periksa kembali data Anda
                </Text>
              </VStack>
            )}

            {worksheet?.status === 'P' && (
              <VStack space={2} bg={`${COLORS.warning}10`} p={3} rounded="md">
                <HStack alignItems="center" space={2}>
                  <Warning2 size={16} color={COLORS.warning} />
                  <Text color={COLORS.warning} fontFamily="Quicksand-SemiBold" fontSize={isSmall ? 12 : 13}>
                    Menunggu Persetujuan
                  </Text>
                </HStack>
                <Text color={COLORS.warning} fontFamily="Quicksand-Regular" fontSize={isSmall ? 11 : 12}>
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
                  onPress={handleReject}
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
                    elevation: 3,
                  }}>
                  <Text color="white" fontFamily="Quicksand-Bold" ml={2}>
                    Tolak
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleApprove}
                  style={{
                    flex: 2,
                    backgroundColor: COLORS.success,
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: COLORS.success,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}>
                  <Text color="white" fontFamily="Quicksand-Bold" ml={2}>
                    Setujui
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </HStack>
        </VStack>
      </ScrollView>

      <CustomAlert
        visible={confirmAlert.visible}
        type="warning"
        title={confirmAlert.title}
        message={confirmAlert.message}
        onDismiss={hideConfirmAlert}
        buttons={[
          { text: 'Batal', onPress: hideConfirmAlert, style: 'cancel' },
          {
            text: confirmAlert.title?.includes('Tolak') ? 'Tolak' : 'Setujui',
            onPress: () => {
              hideConfirmAlert();
              confirmAlert.onConfirm && confirmAlert.onConfirm();
            },
            style: confirmAlert.title?.includes('Tolak') ? 'destructive' : 'default',
          },
        ]}
      />
    </AppScreen>
  );
}
