import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { VStack, Text, HStack, Center, Box } from 'native-base';
import { useSelector } from 'react-redux';
import { LoginCurve, LogoutCurve, Camera, Profile } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { PHOTO_BASE_URL } from '../../../services/api/endpoints';
import { COLORS } from '../../../constants/colors';

const TIME_FORMATS = [
  'DD-MM-YYYY HH:mm:ss',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DDTHH:mm:ssZ',
  'DD/MM/YYYY HH:mm:ss',
];

function parseTime(value) {
  if (!value) return null;
  const m = moment(value, TIME_FORMATS, true);
  if (m.isValid()) return m;
  const fallback = moment(value);
  return fallback.isValid() ? fallback : null;
}

function resolvePhotoUri(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${PHOTO_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function StatusChip({ label, tone, mode }) {
  const palette = {
    success: {
      bg: mode === 'dark' ? 'rgba(34,197,94,0.18)' : 'rgba(22,163,74,0.12)',
      text: mode === 'dark' ? '#4ade80' : '#15803d',
      dot: '#22c55e',
    },
    warning: {
      bg: mode === 'dark' ? 'rgba(251,191,36,0.18)' : 'rgba(245,158,11,0.14)',
      text: mode === 'dark' ? '#fbbf24' : '#b45309',
      dot: '#f59e0b',
    },
    muted: {
      bg: mode === 'dark' ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.12)',
      text: mode === 'dark' ? '#94a3b8' : '#64748b',
      dot: '#94a3b8',
    },
    danger: {
      bg: mode === 'dark' ? 'rgba(239,68,68,0.18)' : 'rgba(220,38,38,0.12)',
      text: mode === 'dark' ? '#f87171' : '#b91c1c',
      dot: '#ef4444',
    },
  }[tone] || {
    bg: mode === 'dark' ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.12)',
    text: mode === 'dark' ? '#94a3b8' : '#64748b',
    dot: '#94a3b8',
  };

  return (
    <HStack
      alignItems="center"
      space={1.5}
      px={2.5}
      py={1}
      rounded="full"
      bg={palette.bg}
    >
      <Box w={1.5} h={1.5} rounded="full" bg={palette.dot} />
      <Text fontSize={11} fontFamily="Quicksand-Bold" color={palette.text}>
        {label}
      </Text>
    </HStack>
  );
}

function ViaBadge({ via, mode }) {
  const isMachine = via === 'M';
  const label = !via ? '-' : isMachine ? 'Mesin' : 'Mobile';
  const bg = isMachine
    ? mode === 'dark'
      ? 'rgba(56,189,248,0.18)'
      : 'rgba(2,132,199,0.12)'
    : mode === 'dark'
      ? 'rgba(129,140,248,0.2)'
      : 'rgba(79,70,229,0.12)';
  const color = isMachine
    ? mode === 'dark'
      ? '#38bdf8'
      : '#0369a1'
    : mode === 'dark'
      ? '#a5b4fc'
      : '#4338ca';

  return (
    <Box px={2} py={0.5} rounded="md" bg={bg}>
      <Text fontSize={10} fontFamily="Quicksand-SemiBold" color={color}>
        {label}
      </Text>
    </Box>
  );
}

function PhotoThumb({ uri, onPress, mode, accent }) {
  const border = mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const placeholderBg = mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.15)';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => uri && onPress?.(uri)}
      disabled={!uri}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Box
        w={14}
        h={14}
        rounded="xl"
        overflow="hidden"
        borderWidth={1.5}
        borderColor={uri ? accent : border}
        bg={placeholderBg}
        alignItems="center"
        justifyContent="center"
      >
        {uri ? (
          <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <Profile size={22} color={mode === 'dark' ? '#64748b' : '#94a3b8'} variant="Bulk" />
        )}
        {uri ? (
          <Center
            position="absolute"
            bottom={1}
            right={1}
            w={5}
            h={5}
            rounded="full"
            bg="rgba(0,0,0,0.55)"
          >
            <Camera size={12} color="#fff" variant="Bold" />
          </Center>
        ) : null}
      </Box>
    </TouchableOpacity>
  );
}

function TimePanel({
  title,
  timeLabel,
  via,
  photoUri,
  onPhotoPress,
  mode,
  accent,
  Icon,
  footer,
}) {
  const panelBg = mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)';
  const titleColor = mode === 'dark' ? COLORS.teks.dark[2] : COLORS.teks.light[2];
  const timeColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const missing = timeLabel === '--:--';

  return (
    <Box flex={1} p={3} rounded="2xl" bg={panelBg} borderWidth={1} borderColor={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}>
      <HStack alignItems="center" justifyContent="space-between" mb={2}>
        <HStack space={1.5} alignItems="center">
          <Center w={7} h={7} rounded="lg" bg={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}>
            <Icon size={16} color={accent} variant="Bulk" />
          </Center>
          <Text fontSize={11} fontFamily="Quicksand-Bold" color={titleColor} letterSpacing={0.4}>
            {title}
          </Text>
        </HStack>
      </HStack>

      <HStack alignItems="center" justifyContent="space-between" space={2}>
        <VStack flex={1} space={1}>
          <Text
            fontSize={26}
            lineHeight="sm"
            fontFamily="Quicksand-Bold"
            color={missing ? (mode === 'dark' ? '#64748b' : '#94a3b8') : timeColor}
          >
            {timeLabel}
          </Text>
          {footer ? (
            <Text fontSize={11} fontFamily="Poppins-Regular" color={titleColor} numberOfLines={1}>
              {footer}
            </Text>
          ) : null}
        </VStack>
        {/* <ViaBadge via={via} mode={mode} /> */}
      </HStack>
    </Box>
  );
}

export default function ListAbsensi({ item, onPress }) {
  const mode = useSelector(state => state.themes)?.value || 'light';
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const cardBg = mode === 'dark' ? COLORS.card.dark : COLORS.card.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subTextColor = mode === 'dark' ? COLORS.teks.dark[2] : COLORS.teks.light[2];
  const borderColor = mode === 'dark' ? COLORS.line.dark[1] : COLORS.line.light[1];
  const accentIn = mode === 'dark' ? '#34d399' : '#059669';
  const accentOut = mode === 'dark' ? '#60a5fa' : '#2563eb';
  const timelineDot = mode === 'dark' ? '#475569' : '#cbd5e1';

  const dateLabel = useMemo(() => {
    const src = item.date_ops || item.checklog_in || item.date_att;
    const m = moment(src).locale('id');
    return m.isValid() ? m.format('dddd, DD MMM YYYY') : String(src || '-');
  }, [item.checklog_in, item.date_ops, item.date_att]);

  const dayShort = useMemo(() => {
    const src = item.date_ops || item.checklog_in || item.date_att;
    const m = moment(src).locale('id');
    return m.isValid() ? m.format('DD') : '--';
  }, [item.date_ops, item.checklog_in, item.date_att]);

  const monthShort = useMemo(() => {
    const src = item.date_ops || item.checklog_in || item.date_att;
    const m = moment(src).locale('id');
    return m.isValid() ? m.format('MMM') : '';
  }, [item.date_ops, item.checklog_in, item.date_att]);

  const inLabel = useMemo(() => {
    const m = parseTime(item.checklog_in);
    return m ? m.format('HH:mm') : '--:--';
  }, [item.checklog_in]);

  const outLabel = useMemo(() => {
    const m = parseTime(item.checklog_out);
    return m ? m.format('HH:mm') : '--:--';
  }, [item.checklog_out]);

  const durationLabel = useMemo(() => {
    const start = parseTime(item.checklog_in);
    const end = parseTime(item.checklog_out);
    if (!start || !end) return null;
    const mins = end.diff(start, 'minutes');
    if (mins < 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}j ${m}m`;
  }, [item.checklog_in, item.checklog_out]);

  const statusMeta = useMemo(() => {
    const sts = String(item.kehadiran_sts || '').toUpperCase();
    if (sts === 'H' || (item.checklog_in && item.checklog_out)) {
      return { label: 'Hadir', tone: 'success' };
    }
    if (item.checklog_in && !item.checklog_out) {
      return { label: 'Belum pulang', tone: 'warning' };
    }
    if (sts === 'A' || sts === 'ALPHA') {
      return { label: 'Alpha', tone: 'danger' };
    }
    if (sts === 'I' || sts === 'IZIN') {
      return { label: 'Izin', tone: 'muted' };
    }
    if (sts === 'S' || sts === 'SAKIT') {
      return { label: 'Sakit', tone: 'muted' };
    }
    return { label: sts || 'Belum lengkap', tone: 'muted' };
  }, [item.kehadiran_sts, item.checklog_in, item.checklog_out]);

  const lateLabel = useMemo(() => {
    if (item.terlambat === 'Y' || item.terlambat === true) {
      const dur = Number(item.durasi_keterlambatan);
      if (Number.isFinite(dur) && dur > 0) return `Terlambat ${dur} mnt`;
      return 'Terlambat';
    }
    if (item.checklog_in) return 'On time';
    return null;
  }, [item.terlambat, item.durasi_keterlambatan, item.checklog_in]);

  const imgIn = resolvePhotoUri(item.photo_in);
  const imgOut = resolvePhotoUri(item.photo_out);
  const nama = item.karyawan?.nama || item.karyawan?.fullname || 'Karyawan';

  const gallery = useMemo(() => {
    const list = [];
    if (imgIn) list.push({ uri: imgIn, label: 'Foto Masuk' });
    if (imgOut) list.push({ uri: imgOut, label: 'Foto Pulang' });
    return list;
  }, [imgIn, imgOut]);

  const openPhotoPreview = useCallback(
    uri => {
      if (!uri) return;
      const idx = gallery.findIndex(g => g.uri === uri);
      if (idx < 0) return;
      setPreviewIndex(idx);
      setPreviewVisible(true);
    },
    [gallery]
  );

  const closePhotoPreview = useCallback(() => {
    setPreviewVisible(false);
  }, []);

  return (
    <View style={styles.cardWrap}>
      <HStack space={2.5} alignItems="stretch" my={1.5}>
        {/* Date rail */}
        <VStack alignItems="center" w={12} pt={1}>
          <Box
            w={12}
            py={2}
            rounded="2xl"
            bg={mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.1)'}
            borderWidth={1}
            borderColor={mode === 'dark' ? 'rgba(96,165,250,0.25)' : 'rgba(37,99,235,0.15)'}
            alignItems="center"
          >
            <Text fontSize={18} fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#93c5fd' : '#1d4ed8'}>
              {dayShort}
            </Text>
            <Text fontSize={10} fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'} textTransform="uppercase">
              {monthShort}
            </Text>
          </Box>
          <Box flex={1} w={0.5} bg={timelineDot} mt={2} mb={1} rounded="full" opacity={0.7} />
        </VStack>

        {/* Card */}
        <Box
          flex={1}
          p={3.5}
          rounded="2xl"
          bg={cardBg}
          borderWidth={1}
          borderColor={borderColor}
          style={styles.cardShadow}
        >
          <VStack space={3}>
            {/* Header */}
            <HStack alignItems="flex-start" justifyContent="space-between" space={2}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={{ flex: 1 }}
                onPress={() => onPress && onPress(item)}
              >
                <VStack flex={1} space={0.5}>
                  <Text fontSize={15} fontFamily="Quicksand-Bold" color={textColor} numberOfLines={1}>
                    {nama}
                  </Text>
                  <HStack alignItems="center" space={2}>
                    <Text fontSize={12} fontFamily="Poppins-Regular" color={subTextColor} numberOfLines={1}>
                      {item?.pin != null ? `PIN ${item.pin}` : 'PIN ?'}
                    </Text>
                    {/* Avatar foto checklog in/out — tumpang tindih, tap = preview besar */}
                    <HStack alignItems="center" ml={0.5}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openPhotoPreview(imgIn)}
                        disabled={!imgIn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                        style={{ zIndex: 2 }}
                      >
                        <Box
                          w={8}
                          h={8}
                          rounded="full"
                          overflow="hidden"
                          borderWidth={2}
                          borderColor={cardBg}
                          bg={mode === 'dark' ? 'rgba(52,211,153,0.2)' : 'rgba(5,150,105,0.12)'}
                          alignItems="center"
                          justifyContent="center"
                          style={styles.avatarShadow}
                        >
                          {imgIn ? (
                            <Image source={{ uri: imgIn }} style={styles.avatarImg} resizeMode="cover" />
                          ) : (
                            <LoginCurve size={14} color={accentIn} variant="Bulk" />
                          )}
                        </Box>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openPhotoPreview(imgOut)}
                        disabled={!imgOut}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                        style={{ marginLeft: -12, zIndex: 1 }}
                      >
                        <Box
                          w={8}
                          h={8}
                          rounded="full"
                          overflow="hidden"
                          borderWidth={2}
                          borderColor={cardBg}
                          bg={mode === 'dark' ? 'rgba(96,165,250,0.2)' : 'rgba(37,99,235,0.12)'}
                          alignItems="center"
                          justifyContent="center"
                          style={styles.avatarShadow}
                        >
                          {imgOut ? (
                            <Image source={{ uri: imgOut }} style={styles.avatarImg} resizeMode="cover" />
                          ) : (
                            <LogoutCurve size={14} color={accentOut} variant="Bulk" />
                          )}
                        </Box>
                      </TouchableOpacity>
                    </HStack>
                  </HStack>
                </VStack>
              </TouchableOpacity>
              <VStack alignItems="flex-end" space={1}>
                <StatusChip label={statusMeta.label} tone={statusMeta.tone} mode={mode} />
                {durationLabel ? (
                  <Text fontSize={10} fontFamily="Poppins-Regular" color={subTextColor}>
                    Durasi {durationLabel}
                  </Text>
                ) : null}
              </VStack>
            </HStack>

            {/* In / Out panels */}
            <HStack space={2.5} alignItems="stretch">
              <TimePanel
                title="MASUK"
                timeLabel={inLabel}
                via={item.via_in}
                photoUri={imgIn}
                onPhotoPress={openPhotoPreview}
                mode={mode}
                accent={accentIn}
                Icon={LoginCurve}
                footer={item.shift ? `Shift ${item.shift}` : lateLabel}
              />
              <TimePanel
                title="PULANG"
                timeLabel={outLabel}
                via={item.via_out}
                photoUri={imgOut}
                onPhotoPress={openPhotoPreview}
                mode={mode}
                accent={accentOut}
                Icon={LogoutCurve}
                footer={lateLabel && item.terlambat === 'Y' ? lateLabel : null}
              />
            </HStack>
          </VStack>
        </Box>
      </HStack>

      <ImageViewing
        images={gallery}
        imageIndex={previewIndex}
        visible={previewVisible}
        onRequestClose={closePhotoPreview}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        presentationStyle="overFullScreen"
        backgroundColor="rgba(0,0,0,0.95)"
        HeaderComponent={({ imageIndex }) => (
          <HStack
            safeAreaTop
            px={4}
            pt={3}
            pb={2}
            alignItems="center"
            justifyContent="space-between"
            bg="rgba(0,0,0,0.45)"
          >
            <VStack>
              <Text color="#fff" fontSize={14} fontFamily="Quicksand-Bold">
                {gallery[imageIndex]?.label || 'Foto Absensi'}
              </Text>
              <Text color="rgba(255,255,255,0.7)" fontSize={11} fontFamily="Poppins-Regular">
                {nama}
              </Text>
            </VStack>
            <TouchableOpacity onPress={closePhotoPreview} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Box px={3} py={1.5} rounded="full" bg="rgba(255,255,255,0.15)">
                <Text color="#fff" fontSize={12} fontFamily="Quicksand-SemiBold">
                  Tutup
                </Text>
              </Box>
            </TouchableOpacity>
          </HStack>
        )}
        FooterComponent={({ imageIndex }) => (
          <HStack
            position="absolute"
            bottom={10}
            alignSelf="center"
            bg="rgba(0,0,0,0.55)"
            px={4}
            py={1.5}
            rounded="full"
            space={2}
            alignItems="center"
          >
            <Text color="#fff" fontSize={12} fontFamily="Poppins-Regular">
              {(imageIndex ?? 0) + 1} / {gallery.length || 1}
            </Text>
            {gallery.length > 1 ? (
              <Text color="rgba(255,255,255,0.7)" fontSize={11} fontFamily="Poppins-Regular">
                · geser untuk foto lain
              </Text>
            ) : null}
          </HStack>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  cardShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
