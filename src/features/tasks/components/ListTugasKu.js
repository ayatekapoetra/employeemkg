import React from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { VStack, Text, HStack, Image } from 'native-base';
import { useSelector } from 'react-redux';
import moment from 'moment';
import BadgeAlt from './BadgeAlt';

export default function ListTugasKu({ data, refreshing, onRefreshHandle, onItemPress }) {
  const mode = useSelector(state => state.themes).value;

  return (
    <VStack flex={1}>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshHandle} />}
        renderItem={({ item }) => <ComponentItem item={item} mode={mode} onPress={onItemPress} />}
        keyExtractor={item => item.id}
      />
    </VStack>
  );
}

const ComponentItem = ({ mode, item, onPress }) => {
  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subTextColor = mode === 'dark' ? '#9a8f90' : '#6b7280';
  const lineColor = mode === 'dark' ? '#4a4c5a' : '#d1d5db';

  let myBadges;
  switch (item.status) {
    case 'reject':
      myBadges = <BadgeAlt rounded="full" title={item.status} type="error" />;
      break;
    case 'check':
      myBadges = <BadgeAlt rounded="full" title={item.status} type="warning" />;
      break;
    case 'done':
      myBadges = <BadgeAlt rounded="full" title={item.status} type="success" />;
      break;
    default:
      myBadges = <BadgeAlt rounded="full" title={item.status} type="info" />;
      break;
  }

  const navigasiHandle = () => {
    onPress && onPress(item);
  };

  return (
    <TouchableOpacity onPress={navigasiHandle}>
      <VStack py={2} borderTopColor={lineColor} borderTopWidth={1}>
        <HStack space={2}>
          <VStack>
            <Image
              alt="task"
              source={require('../../../../assets/images/toak.png')}
              rounded="md"
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </VStack>
          <VStack flex={1}>
            <HStack alignItems="center" justifyContent="space-between">
              <Text
                fontFamily="Quicksand-Bold"
                lineHeight="xs"
                fontWeight="bold"
                fontSize={20}
                color={textColor}
              >
                {item.nmassigner}
              </Text>
              {myBadges}
            </HStack>
            <Text lineHeight="xs" fontFamily="Poppins-Regular" color={textColor}>
              {item.kode}
            </Text>
            <Text lineHeight="xs" fontFamily="Abel-Regular" fontSize={12} color={subTextColor}>
              {moment(item.date_task).format('dddd, DD MMMM YYYY')}
            </Text>
            {item.items?.map((m, i) => {
              const narasi =
                m.narasitask?.length >= 100 ? `${m.narasitask.substring(0, 100)}......` : m.narasitask;
              return (
                <HStack mt={1} space={1} key={m.id || i}>
                  <Text lineHeight="xs" color={textColor} fontFamily="Quicksand-Regular">
                    {i + 1}.
                  </Text>
                  <Text flex={1} lineHeight="xs" color={textColor} fontFamily="Quicksand-Regular">
                    {narasi}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};
