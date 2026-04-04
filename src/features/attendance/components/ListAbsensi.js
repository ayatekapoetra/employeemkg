import React, { useMemo, useState } from 'react';
import { TouchableOpacity, Image, Pressable } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { VStack, Text, HStack, Center, Badge, Box, Divider } from 'native-base';
import { useSelector } from 'react-redux';
import { Calendar, Calendar2, Logout } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { PHOTO_BASE_URL } from '../../../services/api/endpoints';

export default function ListAbsensi({ item, onPress }) {
  
  const mode = useSelector(state => state.themes).value;
  const authUser = useSelector(state => state.auth)?.user || {};

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subTextColor = mode === 'dark' ? '#9a8f90' : '#6b7280';
  const okColor = mode === 'dark' ? '#10b981' : '#059669';
  const lineColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';

  const [previewUri, setPreviewUri] = useState(null);
  const images = useMemo(() => (previewUri ? [{ uri: previewUri }] : []), [previewUri]);

  const dateLabel = useMemo(() => {
    
    const src = item.checklog_in || item.date_ops;
    const m = moment(src).locale('id');

    return m.isValid() ? m.format('dddd, DD MMMM YYYY') : String(src || '');
  }, [item.checklog_in, item.date_ops, item.date_att]);

  const inLabel = useMemo(() => {
    if (!item.checklog_in) return '??:??';
    const m = moment(item.checklog_in, ['DD-MM-YYYY HH:mm:ss','YYYY-MM-DD HH:mm:ss','YYYY-MM-DDTHH:mm:ss.SSSZ','YYYY-MM-DDTHH:mm:ssZ','DD/MM/YYYY HH:mm:ss'], true);
    return m.isValid() ? m.format('HH:mm') : (String(item.checklog_in).split(' ')[1]?.slice(0,5) || '??:??');
  }, [item.checklog_in]);

  const outLabel = useMemo(() => {
    if (!item.checklog_out) return '??:??';
    const m = moment(item.checklog_out, ['DD-MM-YYYY HH:mm:ss','YYYY-MM-DD HH:mm:ss','YYYY-MM-DDTHH:mm:ss.SSSZ','YYYY-MM-DDTHH:mm:ssZ','DD/MM/YYYY HH:mm:ss'], true);
    return m.isValid() ? m.format('HH:mm') : (String(item.checklog_out).split(' ')[1]?.slice(0,5) || '??:??');
  }, [item.checklog_out]);

  const statusText = item.kehadiran_sts || '-';

  const imgIn = item.photo_in ? (item.photo_in.startsWith('http') ? item.photo_in : `${PHOTO_BASE_URL.replace(/\/$/, '')}/${item.photo_in.replace(/^\//,'')}`) : null;
  const imgOut = item.photo_out ? (item.photo_out.startsWith('http') ? item.photo_out : `${PHOTO_BASE_URL.replace(/\/$/, '')}/${item.photo_out.replace(/^\//,'')}`) : null;
  
  return (
    <TouchableOpacity onPress={() => onPress && onPress(item)}>
      <HStack space={0} alignItems="stretch" my={2}>
        <VStack w={5} alignItems="center">
          <Center w={3} h={3} rounded="full" bg={statusText === 'H' ? '#10b981' : '#9ca3af'} />
          <Box flex={1} w={1} bg={lineColor} mt={1} rounded="full" />
        </VStack>

        <Box flex={1} p={3} rounded="xl" bg={mode === 'dark' ? '#2f313e' : '#ffffff'} shadow={3} borderWidth={1} borderColor={lineColor}>
          <VStack>
            <HStack alignItems="center" justifyContent="space-between">
              <VStack>
                <Text fontSize={20} fontWeight={700} fontFamily="Quicksand-Bold" color={textColor}>{dateLabel}</Text>
                <Text fontSize={16} fontFamily="Poppins-Light" color={subTextColor}>{item.karyawan?.nama || 'unregister'}</Text>
              </VStack>
            </HStack>

            <HStack mt={1} space={4} alignItems="center" justifyContent="space-between">
              <VStack flex={1} space={2}>
                <HStack alignItems="center" justifyContent="space-between">
                  <HStack space={1} alignItems="center">
                    <Calendar size={24} color={okColor} variant="Bulk" />
                    <Text fontSize="lg" fontWeight={700} fontFamily="Poppins-Regular" color={textColor}>{inLabel}</Text>
                  </HStack>
                  <Badge colorScheme={item.via_in === 'M' ? 'info' : 'primary'} rounded="md">{item.via_in === 'M' ? 'finger' : 'mobile'}</Badge>
                </HStack>
                <Divider bg={lineColor} />
                <HStack alignItems="center" justifyContent="space-between">
                  <HStack space={1} alignItems="center">
                    <Calendar2 size={24} color={okColor} variant="Bulk" />
                    <Text fontSize="lg" fontWeight={700} fontFamily="Poppins-Regular" color={textColor}>{outLabel}</Text>
                  </HStack>
                  <Badge colorScheme={item.via_out === 'M' ? 'info' : 'primary'} rounded="md">{item.via_out === 'M' ? 'finger' : 'mobile'}</Badge>
                </HStack>
              </VStack>

              <VStack w={16} space={2}>
                <Pressable onPress={() => imgIn && setPreviewUri(imgIn)}>
                    <Image
                    source={{ uri: imgIn || 'https://cdn.makkuragatama.id/no-image.jpg' }}
                    style={{ width: 56, height: 56, borderRadius: 999 }}
                  />
                </Pressable>
                <Pressable onPress={() => imgOut && setPreviewUri(imgOut)}>
                    <Image
                    source={{ uri: imgOut || 'https://cdn.makkuragatama.id/no-image.jpg' }}
                    style={{ width: 56, height: 56, borderRadius: 999 }}
                  />
                </Pressable>
              </VStack>
            </HStack>

            <HStack mt={3} justifyContent="space-between">
              <Text fontFamily="Poppins-Regular" color={subTextColor}>PIN: {item?.pin ?? '-'}</Text>
              {!!item?.device_id && (<Text fontFamily="Abel-Regular" color={subTextColor}>{item.device_id}</Text>)}
            </HStack>
          </VStack>
        </Box>
      </HStack>

      <ImageViewing
        images={images}
        imageIndex={0}
        visible={!!previewUri}
        onRequestClose={() => setPreviewUri(null)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        FooterComponent={({ imageIndex }) => (
          <HStack position="absolute" bottom={6} alignSelf="center" bg="rgba(0,0,0,0.5)" px={3} py={1} rounded="md">
            <Text color="#fff" fontFamily="Poppins-Light">{imageIndex + 1} / 1</Text>
          </HStack>
        )}
      />
    </TouchableOpacity>
  );
}
