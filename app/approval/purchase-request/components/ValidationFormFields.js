import { Archive, SearchNormal1, ShoppingCart, TickCircle, TruckFast, Car } from 'iconsax-react-native';
import { Badge, Divider, FormControl, HStack, Input, Pressable, Spinner, Text, VStack } from 'native-base';
import { TextInput, View } from 'react-native';

export default function ValidationFormFields({
  mode,
  textColor,
  subtitleColor,
  cardBg,
  cardBorder,
  inputBg,
  loadingBarang,
  loadingPemasok,
  loadingEquipment,
  selectedBarang,
  selectedPemasok,
  selectedEquipment,
  barangList,
  pemasokList,
  equipmentList,
  formData,
  fieldErrors = {},
  setFormData,
  setFieldErrors = () => {},
  qtyDiminta,
  openBottomSheet,
}) {
  
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: false }));
    }
  };
  return (
    <VStack
      bg={cardBg}
      p={4}
      rounded="2xl"
      borderWidth={1}
      borderColor={cardBorder}
      shadow={1}
      space={4}
    >
      <HStack space={2} alignItems="center">
        <TickCircle size={18} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />
        <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
          Data Validasi
        </Text>
        <Badge
          bg={mode === 'dark' ? '#991b1b' : '#fee2e2'}
          rounded="md"
          _text={{
            fontSize: 8,
            fontFamily: 'Quicksand-Bold',
            color: mode === 'dark' ? '#fca5a5' : '#dc2626',
          }}
        >
          REQUIRED
        </Badge>
      </HStack>
      
      <Divider bg={cardBorder} />

      <VStack space={4}>
        <FormControl isRequired>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <Archive size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Pilih Barang
              </Text>
              <Text fontSize="xs" color={mode === 'dark' ? '#fca5a5' : '#dc2626'}>*</Text>
              {loadingBarang && (
                <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              )}
            </HStack>
          </FormControl.Label>
          
          {loadingBarang ? (
            <HStack
              bg={inputBg}
              borderColor={cardBorder}
              borderWidth={1}
              rounded="md"
              py={3}
              px={3}
              space={2}
              alignItems="center"
            >
              <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                Memuat data barang...
              </Text>
            </HStack>
          ) : (
            <Pressable
              onPress={() => {
                openBottomSheet('barang', 'Pilih Barang');
                clearFieldError('barang_id');
              }}
              bg={inputBg}
              borderColor={
                fieldErrors.barang_id 
                  ? '#dc2626' 
                  : selectedBarang 
                    ? (mode === 'dark' ? '#1e40af' : '#dbeafe') 
                    : cardBorder
              }
              borderWidth={fieldErrors.barang_id ? 2 : 1}
              rounded="md"
              py={3}
              px={3}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text 
                    fontSize="sm" 
                    fontFamily={selectedBarang ? "Quicksand-SemiBold" : "Poppins-Regular"}
                    color={selectedBarang ? textColor : subtitleColor}
                  >
                    {selectedBarang 
                      ? (selectedBarang.nama || selectedBarang.nama_barang)
                      : 'Tap untuk pilih barang'
                    }
                  </Text>
                  {selectedBarang && (
                    <Text 
                      fontSize="xs" 
                      fontFamily="Poppins-Light" 
                      color={subtitleColor}
                    >
                      Kode: {selectedBarang.kode || selectedBarang.kode_barang}
                    </Text>
                  )}
                </VStack>
                <SearchNormal1 size={18} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              </HStack>
            </Pressable>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <TruckFast size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Pilih Pemasok
              </Text>
              <Text fontSize="xs" color={mode === 'dark' ? '#fca5a5' : '#dc2626'}>*</Text>
              {loadingPemasok && (
                <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              )}
            </HStack>
          </FormControl.Label>
          
          {loadingPemasok ? (
            <HStack
              bg={inputBg}
              borderColor={cardBorder}
              borderWidth={1}
              rounded="md"
              py={3}
              px={3}
              space={2}
              alignItems="center"
            >
              <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                Memuat data pemasok...
              </Text>
            </HStack>
          ) : (
            <Pressable
              onPress={() => {
                openBottomSheet('pemasok', 'Pilih Pemasok');
                clearFieldError('pemasok_id');
              }}
              bg={inputBg}
              borderColor={
                fieldErrors.pemasok_id
                  ? '#dc2626'
                  : selectedPemasok 
                    ? (mode === 'dark' ? '#1e40af' : '#dbeafe') 
                    : cardBorder
              }
              borderWidth={fieldErrors.pemasok_id ? 2 : 1}
              rounded="md"
              py={3}
              px={3}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text 
                    fontSize="sm" 
                    fontFamily={selectedPemasok ? "Quicksand-SemiBold" : "Poppins-Regular"}
                    color={selectedPemasok ? textColor : subtitleColor}
                  >
                    {selectedPemasok 
                      ? (selectedPemasok.nama_pemasok || selectedPemasok.nama)
                      : 'Tap untuk pilih pemasok'
                    }
                  </Text>
                  {selectedPemasok && selectedPemasok.bisnis && (
                    <Text 
                      fontSize="xs" 
                      fontFamily="Poppins-Light" 
                      color={subtitleColor}
                    >
                      Bisnis: {selectedPemasok.bisnis.name || selectedPemasok.bisnis.initial}
                    </Text>
                  )}
                </VStack>
                <SearchNormal1 size={18} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              </HStack>
            </Pressable>
          )}
          
          <FormControl.HelperText>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {pemasokList.length > 0 
                ? `${pemasokList.length} pemasok tersedia`
                : selectedPemasok 
                  ? 'Menggunakan pemasok dari item' 
                  : 'Tap untuk memuat data pemasok'
              }
            </Text>
          </FormControl.HelperText>
          
          {selectedPemasok && (
            <HStack
              mt={2}
              bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
              p={2}
              rounded="lg"
              space={1}
              alignItems="center"
            >
              <TruckFast size={14} color={mode === 'dark' ? '#6ee7b7' : '#059669'} variant="Bold" />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                Pemasok: {selectedPemasok.nama_pemasok || selectedPemasok.nama}
              </Text>
            </HStack>
          )}
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <Car size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Pilih Equipment
              </Text>
              <Text fontSize="xs" color={subtitleColor}>(opsional)</Text>
              {loadingEquipment && (
                <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              )}
            </HStack>
          </FormControl.Label>
          
          {loadingEquipment ? (
            <HStack
              bg={inputBg}
              borderColor={cardBorder}
              borderWidth={1}
              rounded="md"
              py={3}
              px={3}
              space={2}
              alignItems="center"
            >
              <Spinner size="sm" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                Memuat data equipment...
              </Text>
            </HStack>
          ) : (
            <Pressable
              onPress={() => openBottomSheet('equipment', 'Pilih Equipment')}
              bg={inputBg}
              borderColor={selectedEquipment ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : cardBorder}
              borderWidth={1}
              rounded="md"
              py={3}
              px={3}
              _pressed={{ opacity: 0.7 }}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text 
                    fontSize="sm" 
                    fontFamily={selectedEquipment ? "Quicksand-SemiBold" : "Poppins-Regular"}
                    color={selectedEquipment ? textColor : subtitleColor}
                  >
                    {selectedEquipment 
                      ? (selectedEquipment.kode || selectedEquipment.nama)
                      : 'Tap untuk pilih equipment (opsional)'
                    }
                  </Text>
                  {selectedEquipment && (
                    <Text 
                      fontSize="xs" 
                      fontFamily="Poppins-Light" 
                      color={subtitleColor}
                    >
                      {selectedEquipment.nama || selectedEquipment.model || '-'}
                    </Text>
                  )}
                </VStack>
                <SearchNormal1 size={18} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
              </HStack>
            </Pressable>
          )}
          
          <FormControl.HelperText>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {equipmentList.length > 0 
                ? `${equipmentList.length} equipment tersedia`
                : selectedEquipment 
                  ? 'Menggunakan equipment dari item' 
                  : 'Tap untuk memuat data equipment'
              }
            </Text>
          </FormControl.HelperText>
          
          {selectedEquipment && (
            <HStack
              mt={2}
              bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
              p={2}
              rounded="lg"
              space={1}
              alignItems="center"
            >
              <Car size={14} color={mode === 'dark' ? '#6ee7b7' : '#059669'} variant="Bold" />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                Equipment: {selectedEquipment.kode || selectedEquipment.nama}
              </Text>
            </HStack>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <ShoppingCart size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Qty Disetujui
              </Text>
              <Text fontSize="xs" color={mode === 'dark' ? '#fca5a5' : '#dc2626'}>*</Text>
            </HStack>
          </FormControl.Label>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={formData.qty_acc}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, qty_acc: value }));
                clearFieldError('qty_acc');
              }}
              placeholder={`Max: ${qtyDiminta} unit`}
              placeholderTextColor={subtitleColor}
              keyboardType="numeric"
              style={{
                backgroundColor: inputBg,
                borderWidth: fieldErrors.qty_acc ? 2 : 1,
                borderColor: fieldErrors.qty_acc ? '#dc2626' : cardBorder,
                borderRadius: 6,
                paddingVertical: 12,
                paddingHorizontal: 12,
                paddingRight: 50,
                color: textColor,
                fontFamily: 'Quicksand-Bold',
                fontSize: 16,
              }}
            />
            <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
              <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor}>
                unit
              </Text>
            </View>
          </View>
          <FormControl.HelperText>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Qty diminta: {qtyDiminta} unit • Tersisa: {Math.max(0, qtyDiminta - parseFloat(formData.qty_acc || 0))} unit
            </Text>
          </FormControl.HelperText>
        </FormControl>
      </VStack>
    </VStack>
  );
}
