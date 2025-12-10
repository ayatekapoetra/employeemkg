import React from 'react';
import { TouchableOpacity } from 'react-native';
import { VStack, Text, HStack, Center } from 'native-base';
import { useSelector } from 'react-redux';
import { Calendar, Calendar2, Logout } from 'iconsax-react-native';
import moment from 'moment';

export default function ListAbsensi({ item, onPress }) {
  const mode = useSelector(state => state.themes).value;

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subTextColor = mode === 'dark' ? '#9a8f90' : '#6b7280';
  const approvedColor = mode === 'dark' ? '#10b981' : '#059669';
  const lineColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';

  const iconColor = item.approve_sts === 'A' ? approvedColor : textColor;

  return (
    <TouchableOpacity onPress={() => onPress && onPress(item)}>
      <HStack py={3} space={2} alignItems="center" borderBottomWidth={0.5} borderBottomColor={lineColor}>
        <VStack flex={1}>
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize={18} fontWeight={600} fontFamily="Quicksand-Regular" color={textColor}>
              {moment(item.date_ops).format('dddd, DD MMMM YYYY')}
            </Text>
            <Text fontSize="sm" fontWeight={400} fontFamily="Poppins-Regular" color={textColor}>
              ID#{item?.id}
            </Text>
          </HStack>
          <Text lineHeight="xs" fontSize={14} fontWeight={400} fontFamily="Poppins-Regular" color={subTextColor}>
            [{item?.karyawan?.section}] {item?.karyawan?.nama}
          </Text>

          <HStack
            my={1}
            px={2}
            flex={1}
            borderWidth={1}
            borderColor={lineColor}
            borderStyle="dashed"
            rounded="md"
            justifyContent="space-around"
            alignItems="center"
          >
            <VStack py={2} flex={2}>
              <HStack space={1} alignItems="center" justifyContent="center">
                <Calendar size="32" color={iconColor} variant="Bulk" />
                <VStack>
                  <Text fontSize="2xl" fontWeight={300} fontFamily="Poppins-Regular" color={textColor}>
                    {item.checklog_in ? moment(item.checklog_in).format('HH:mm [wita]') : '--:--'}
                  </Text>
                </VStack>
              </HStack>
              <Center>
                <Text fontSize="md" lineHeight="xs" fontWeight="semibold" fontFamily="Poppins-SemiBold" color={textColor}>
                  {item.via_in === 'M' ? 'Via Mesin Finger' : 'Via Aplikasi'}
                </Text>
              </Center>
            </VStack>
            <Center flex={1}>
              <Logout size="32" color="#555555" variant="Bulk" />
            </Center>
            <VStack py={2} flex={2}>
              <HStack space={1} alignItems="center" justifyContent="center">
                <Calendar2 size="32" color={iconColor} variant="Bulk" />
                <VStack>
                  <Text fontSize="2xl" fontWeight={300} fontFamily="Poppins-Regular" color={textColor}>
                    {item.checklog_out ? moment(item.checklog_out).format('HH:mm [wita]') : '--:--'}
                  </Text>
                </VStack>
              </HStack>
              <Center>
                <Text fontSize="md" lineHeight="xs" fontWeight="semibold" fontFamily="Poppins-SemiBold" color={textColor}>
                  {item.via_out === 'M' ? 'Via Mesin Finger' : 'Via Aplikasi'}
                </Text>
              </Center>
            </VStack>
          </HStack>

          <HStack justifyContent="space-between">
            {item?.approve && (
              <Text fontFamily="Poppins-Regular" color={subTextColor}>
                checkBy: {item?.approve?.nama || '???'}
              </Text>
            )}
            {item?.approve_at && (
              <Text fontFamily="Abel-Regular" color={subTextColor}>
                {moment(new Date(item?.approve_at), 'YYYYMMDD').fromNow()}
              </Text>
            )}
          </HStack>
          {item?.sts_calc_msg && (
            <Text fontFamily="Poppins-Light" color={subTextColor}>
              {item?.sts_calc_msg}
            </Text>
          )}
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
}
