import { Modal, VStack, HStack, Text, Pressable, FlatList, Input } from 'native-base';
import { useState } from 'react';
import { COLORS } from '../../constants/colors';
import { SearchNormal, CloseCircle } from 'iconsax-react-native';

export default function PickerModal({
  visible,
  onClose,
  onSelect,
  options = [],
  selectedValue,
  title,
  mode = 'light',
  labelKey = 'nama',
  valueKey = 'id',
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(item =>
    item[labelKey]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const bgColor = mode === 'dark' ? '#1f2937' : '#ffffff';
  const itemBg = mode === 'dark' ? '#2a2c3e' : '#f9fafb';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  const handleSelect = (item) => {
    onSelect(item[valueKey].toString());
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={visible} onClose={onClose} size="lg">
      <Modal.Content bg={bgColor} maxHeight="80%">
        <Modal.CloseButton />
        <Modal.Header bg={bgColor} borderBottomWidth={1} borderBottomColor={borderColor}>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
            {title}
          </Text>
        </Modal.Header>
        <Modal.Body p={0}>
          <VStack space={2} p={4}>
            <Input
              placeholder="Cari..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              bg={itemBg}
              borderColor={borderColor}
              color={textColor}
              fontSize="sm"
              fontFamily="Poppins-Regular"
              InputLeftElement={
                <SearchNormal size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} style={{ marginLeft: 12 }} />
              }
              InputRightElement={
                searchQuery ? (
                  <Pressable onPress={() => setSearchQuery('')} mr={2}>
                    <CloseCircle size={20} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
                  </Pressable>
                ) : null
              }
            />
          </VStack>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item[valueKey].toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                bg={selectedValue === item[valueKey].toString() ? (mode === 'dark' ? '#374151' : '#e5e7eb') : 'transparent'}
                _pressed={{ bg: mode === 'dark' ? '#374151' : '#f3f4f6' }}
              >
                <HStack
                  p={4}
                  borderBottomWidth={1}
                  borderBottomColor={borderColor}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    fontSize="sm"
                    fontFamily="Poppins-Regular"
                    color={textColor}
                    flex={1}
                  >
                    {item[labelKey]}
                  </Text>
                  {selectedValue === item[valueKey].toString() && (
                    <Text fontSize="lg" color={mode === 'dark' ? '#60a5fa' : '#3b82f6'}>
                      ✓
                    </Text>
                  )}
                </HStack>
              </Pressable>
            )}
            ListEmptyComponent={
              <VStack p={8} alignItems="center">
                <Text fontSize="sm" fontFamily="Poppins-Light" color={mode === 'dark' ? '#9ca3af' : '#6b7280'}>
                  {searchQuery ? 'Tidak ada hasil' : 'Tidak ada data'}
                </Text>
              </VStack>
            }
            maxHeight="400px"
          />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
