import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { VStack, Text, HStack, Button } from 'native-base';
import { useSelector } from 'react-redux';
import { CalendarSearch, CalendarTick, UserSearch } from 'iconsax-react-native';
import moment from 'moment';
import { DatePickerModal } from '../../../components/common';

export default function FilterAbsensi({ onApplyFilter, setFilter, qstring, setQstring }) {
  const mode = useSelector(state => state.themes).value;
  const { user } = useSelector(state => state.auth);
  const [openKaryawan, setOpenKaryawan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subTextColor = mode === 'dark' ? '#9a8f90' : '#b31e02';
  const lineColor = mode === 'dark' ? '#3a3c4a' : '#e5e7eb';
  const borderColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';

  const onResetHandle = async () => {
    setQstring({
      karyawan_id: user?.karyawan?.id,
      karyawan: user?.karyawan,
      dateStart: moment().add(-1, 'month').format('YYYY-MM-DD'),
      dateEnd: moment().format('YYYY-MM-DD'),
      verify_sts: '',
      approve_sts: '',
    });
    onApplyFilter();
    setFilter(false);
  };

  return (
    <VStack h="full">
      <VStack px={3} py={2} flex={1} rounded="md" borderWidth={1} borderColor={borderColor}>
        {['developer', 'hrd', 'pjo', 'headspv', 'koordinator'].includes(user?.usertype) && (
          <VStack h="75px" borderBottomWidth={0.5} borderBottomColor={lineColor}>
            <Text fontFamily="Poppins-Regular" color={textColor}>
              Karyawan :
            </Text>
            <TouchableOpacity onPress={() => setOpenKaryawan(!openKaryawan)}>
              <HStack py={2} space={2} alignItems="center">
                <UserSearch size="32" color="#555555" variant="Bulk" />
                <Text fontSize={20} fontFamily="Poppins-Bold" color={subTextColor}>
                  {qstring.karyawan?.nama || 'Pilih Karyawan'}
                </Text>
              </HStack>
            </TouchableOpacity>
          </VStack>
        )}

        <VStack mt={2} h="75px" borderBottomWidth={0.5} borderBottomColor={lineColor}>
          <Text fontFamily="Poppins-Regular" color={textColor}>
            Mulai Tanggal :
          </Text>
          <TouchableOpacity onPress={() => setShowStartDate(true)}>
            <HStack py={2} space={2} alignItems="center">
              <CalendarSearch size="32" color="#555555" variant="Bulk" />
              <Text fontSize={20} fontFamily="Poppins-Bold" color={subTextColor}>
                {moment(qstring.dateStart).format('dddd, DD MMMM YYYY')}
              </Text>
            </HStack>
          </TouchableOpacity>
        </VStack>

        <DatePickerModal
          isOpen={showStartDate}
          onClose={() => setShowStartDate(false)}
          onConfirm={(date) => setQstring({ ...qstring, dateStart: moment(date).format('YYYY-MM-DD') })}
          date={new Date(qstring.dateStart)}
          title="Mulai Tanggal"
        />

        <VStack mt={2} h="75px" borderBottomWidth={0.5} borderBottomColor={lineColor}>
          <Text fontFamily="Poppins-Regular" color={textColor}>
            Hingga Tanggal :
          </Text>
          <TouchableOpacity onPress={() => setShowEndDate(true)}>
            <HStack py={2} space={2} alignItems="center">
              <CalendarTick size="32" color="#555555" variant="Bulk" />
              <Text fontSize={20} fontFamily="Poppins-Bold" color={subTextColor}>
                {moment(qstring.dateEnd).format('dddd, DD MMMM YYYY')}
              </Text>
            </HStack>
          </TouchableOpacity>
        </VStack>

        <DatePickerModal
          isOpen={showEndDate}
          onClose={() => setShowEndDate(false)}
          onConfirm={(date) => setQstring({ ...qstring, dateEnd: moment(date).format('YYYY-MM-DD') })}
          date={new Date(qstring.dateEnd)}
          title="Hingga Tanggal"
        />


      </VStack>

      <HStack space={2} mt={3}>
        <Button flex={1} bg="muted.400" onPress={onResetHandle} _text={{ fontFamily: 'Poppins-SemiBold' }}>
          Reset
        </Button>
        <Button flex={1} bg="error.600" onPress={onApplyFilter} _text={{ fontFamily: 'Poppins-SemiBold' }}>
          Terapkan
        </Button>
      </HStack>
    </VStack>
  );
}
