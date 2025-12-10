import { Coin, DiscountShape, DollarCircle, Global, InfoCircle, MoneyRecive } from 'iconsax-react-native';
import { Divider, FormControl, HStack, Input, Pressable, Text, TextArea, VStack } from 'native-base';
import { useEffect } from 'react';
import { TextInput, View } from 'react-native';

export default function PricingSection({
  mode,
  textColor,
  subtitleColor,
  cardBg,
  cardBorder,
  inputBg,
  formData,
  setFormData,
  qtyDisetujui,
  hargaSatuan,
  ppnAmount,
  totalHarga,
  grandTotal,
}) {
  const currency = formData.currency || 'IDR';
  const kursValue = formData.kurs || '1';
  const potongan = parseFloat(formData.potongan) || 0;

  const kurs = parseFloat(kursValue) || 1;
  
  const hargaSatuanInIDR = currency === 'IDR' ? hargaSatuan : hargaSatuan * kurs;
  const totalHargaInIDR = qtyDisetujui * hargaSatuanInIDR;
  const ppnAmountInIDR = ppnAmount;
  const subtotalWithPPN = totalHargaInIDR + ppnAmountInIDR;

  const finalGrandTotal = subtotalWithPPN - potongan;
  const grandTotalInCurrency = currency === 'IDR' ? finalGrandTotal : finalGrandTotal / kurs;

  useEffect(() => {
    const currentPpn = parseFloat(formData.ppn) || 0;
    if (currentPpn > 0) {
      const newPpnValue = totalHargaInIDR * 0.11;
      setFormData(prev => ({ ...prev, ppn: newPpnValue.toString() }));
    }
  }, [currency, kursValue, formData.harga, qtyDisetujui]);

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
        <DollarCircle size={18} color={mode === 'dark' ? '#f59e0b' : '#d97706'} variant="Bold" />
        <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
          Pricing & Cost
        </Text>
      </HStack>
      
      <Divider bg={cardBorder} />

      <VStack space={4}>
        <FormControl>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <Global size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Currency / Mata Uang
              </Text>
            </HStack>
          </FormControl.Label>
          
          <HStack space={2}>
            <Pressable
              flex={1}
              onPress={() => {
                setFormData(prev => ({ ...prev, currency: 'IDR', kurs: '1' }));
              }}
              bg={currency === 'IDR' ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : inputBg}
              borderColor={currency === 'IDR' ? (mode === 'dark' ? '#3b82f6' : '#2563eb') : cardBorder}
              borderWidth={2}
              rounded="xl"
              py={3}
              px={4}
              _pressed={{ opacity: 0.7 }}
            >
              <VStack space={1} alignItems="center">
                <Text 
                  fontSize="lg" 
                  fontFamily="Quicksand-Bold" 
                  color={currency === 'IDR' ? (mode === 'dark' ? '#ffffff' : '#1e40af') : textColor}
                >
                  IDR
                </Text>
                <Text 
                  fontSize="xs" 
                  fontFamily="Poppins-Light" 
                  color={currency === 'IDR' ? (mode === 'dark' ? '#dbeafe' : '#1e40af') : subtitleColor}
                >
                  Rupiah
                </Text>
              </VStack>
            </Pressable>
            
            <Pressable
              flex={1}
              onPress={() => setFormData(prev => ({ ...prev, currency: 'USD' }))}
              bg={currency === 'USD' ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : inputBg}
              borderColor={currency === 'USD' ? (mode === 'dark' ? '#3b82f6' : '#2563eb') : cardBorder}
              borderWidth={2}
              rounded="xl"
              py={3}
              px={4}
              _pressed={{ opacity: 0.7 }}
            >
              <VStack space={1} alignItems="center">
                <Text 
                  fontSize="lg" 
                  fontFamily="Quicksand-Bold" 
                  color={currency === 'USD' ? (mode === 'dark' ? '#ffffff' : '#1e40af') : textColor}
                >
                  USD
                </Text>
                <Text 
                  fontSize="xs" 
                  fontFamily="Poppins-Light" 
                  color={currency === 'USD' ? (mode === 'dark' ? '#dbeafe' : '#1e40af') : subtitleColor}
                >
                  US Dollar
                </Text>
              </VStack>
            </Pressable>
          </HStack>

          {currency !== 'IDR' && (
            <VStack space={2} mt={3}>
              <FormControl.Label>
                <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={textColor}>
                  Kurs {currency} ke IDR
                </Text>
              </FormControl.Label>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={kursValue}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, kurs: value }))}
                  placeholder="Masukkan nilai kurs"
                  placeholderTextColor={subtitleColor}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: inputBg,
                    borderWidth: 1,
                    borderColor: cardBorder,
                    borderRadius: 6,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    paddingLeft: 80,
                    color: textColor,
                    fontFamily: 'Quicksand-Bold',
                    fontSize: 16,
                  }}
                />
                <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                  <Text fontSize="sm" fontFamily="Poppins-Bold" color={mode === 'dark' ? '#3b82f6' : '#2563eb'}>
                    1 {currency} =
                  </Text>
                </View>
              </View>
              <FormControl.HelperText>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  1 {currency} = Rp {parseFloat(kursValue || 1).toLocaleString('id-ID')}
                </Text>
              </FormControl.HelperText>
            </VStack>
          )}
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <Coin size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Harga Satuan ({currency})
              </Text>
            </HStack>
          </FormControl.Label>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={formData.harga}
              onChangeText={(value) => setFormData(prev => ({ ...prev, harga: value }))}
              placeholder="0"
              placeholderTextColor={subtitleColor}
              keyboardType="numeric"
              style={{
                backgroundColor: inputBg,
                borderWidth: 1,
                borderColor: cardBorder,
                borderRadius: 6,
                paddingVertical: 12,
                paddingHorizontal: 12,
                paddingLeft: currency === 'IDR' ? 40 : 50,
                color: textColor,
                fontFamily: 'Quicksand-Bold',
                fontSize: 16,
              }}
            />
            <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
              <Text fontSize="sm" fontFamily="Poppins-Bold" color={mode === 'dark' ? '#10b981' : '#059669'}>
                {currency === 'IDR' ? 'Rp' : currency}
              </Text>
            </View>
          </View>
          {currency !== 'IDR' && (
            <FormControl.HelperText>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                ≈ Rp {hargaSatuanInIDR.toLocaleString('id-ID')} per unit
              </Text>
            </FormControl.HelperText>
          )}
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <MoneyRecive size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                PPN (Pajak Pertambahan Nilai)
              </Text>
            </HStack>
          </FormControl.Label>
          <HStack space={2}>
            <Pressable
              flex={1}
              onPress={() => {
                const ppnValue = 0;
                setFormData(prev => ({ ...prev, ppn: ppnValue.toString() }));
              }}
              bg={formData.ppn === '0' ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : inputBg}
              borderColor={formData.ppn === '0' ? (mode === 'dark' ? '#3b82f6' : '#2563eb') : cardBorder}
              borderWidth={2}
              rounded="xl"
              py={3}
              px={4}
              _pressed={{ opacity: 0.7 }}
            >
              <VStack space={1} alignItems="center">
                <Text 
                  fontSize="xl" 
                  fontFamily="Quicksand-Bold" 
                  color={formData.ppn === '0' ? (mode === 'dark' ? '#ffffff' : '#1e40af') : textColor}
                >
                  0%
                </Text>
                <Text 
                  fontSize="xs" 
                  fontFamily="Poppins-Light" 
                  color={formData.ppn === '0' ? (mode === 'dark' ? '#dbeafe' : '#1e40af') : subtitleColor}
                >
                  Tanpa PPN
                </Text>
              </VStack>
            </Pressable>
            
            <Pressable
              flex={1}
              onPress={() => {
                const ppnValue = totalHargaInIDR * 0.11;
                setFormData(prev => ({ ...prev, ppn: ppnValue.toString() }));
              }}
              bg={formData.ppn !== '0' && formData.ppn !== '' ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : inputBg}
              borderColor={formData.ppn !== '0' && formData.ppn !== '' ? (mode === 'dark' ? '#3b82f6' : '#2563eb') : cardBorder}
              borderWidth={2}
              rounded="xl"
              py={3}
              px={4}
              _pressed={{ opacity: 0.7 }}
            >
              <VStack space={1} alignItems="center">
                <Text 
                  fontSize="xl" 
                  fontFamily="Quicksand-Bold" 
                  color={formData.ppn !== '0' && formData.ppn !== '' ? (mode === 'dark' ? '#ffffff' : '#1e40af') : textColor}
                >
                  11%
                </Text>
                <Text 
                  fontSize="xs" 
                  fontFamily="Poppins-Light" 
                  color={formData.ppn !== '0' && formData.ppn !== '' ? (mode === 'dark' ? '#dbeafe' : '#1e40af') : subtitleColor}
                >
                  Dengan PPN
                </Text>
              </VStack>
            </Pressable>
          </HStack>
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <DiscountShape size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Potongan / Discount
              </Text>
            </HStack>
          </FormControl.Label>

          <View style={{ position: 'relative' }}>
            <TextInput
              value={formData.potongan}
              onChangeText={(value) => setFormData(prev => ({ ...prev, potongan: value }))}
              placeholder="0"
              placeholderTextColor={subtitleColor}
              keyboardType="numeric"
              style={{
                backgroundColor: inputBg,
                borderWidth: 1,
                borderColor: cardBorder,
                borderRadius: 6,
                paddingVertical: 12,
                paddingHorizontal: 12,
                paddingLeft: 40,
                color: textColor,
                fontFamily: 'Quicksand-Bold',
                fontSize: 16,
              }}
            />
            <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
              <Text fontSize="sm" fontFamily="Poppins-Bold" color={mode === 'dark' ? '#ea580c' : '#ea580c'}>
                Rp
              </Text>
            </View>
          </View>
          <FormControl.HelperText>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Masukkan jumlah potongan dalam rupiah
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <VStack
          bg={mode === 'dark' ? '#065f46' : '#d1fae5'}
          p={4}
          rounded="xl"
          space={2}
          borderWidth={2}
          borderColor={mode === 'dark' ? '#10b981' : '#059669'}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                Subtotal ({qtyDisetujui} × {currency} {hargaSatuan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </Text>
              {currency !== 'IDR' && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#a7f3d0' : '#047857'}>
                  Kurs: 1 {currency} = Rp {kurs.toLocaleString('id-ID')}
                </Text>
              )}
            </VStack>
            <VStack alignItems="flex-end">
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#6ee7b7' : '#059669'}>
                Rp {totalHargaInIDR.toLocaleString('id-ID')}
              </Text>
              {currency !== 'IDR' && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#a7f3d0' : '#047857'}>
                  ≈ {currency} {(totalHargaInIDR / kurs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              )}
            </VStack>
          </HStack>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
              PPN
            </Text>
            <VStack alignItems="flex-end">
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#6ee7b7' : '#059669'}>
                Rp {ppnAmountInIDR.toLocaleString('id-ID')}
              </Text>
              {currency !== 'IDR' && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#a7f3d0' : '#047857'}>
                  ≈ {currency} {(ppnAmountInIDR / kurs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              )}
            </VStack>
          </HStack>
          {potongan > 0 && (
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                Potongan
              </Text>
              <VStack alignItems="flex-end">
                <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fca5a5' : '#dc2626'}>
                  - Rp {potongan.toLocaleString('id-ID')}
                </Text>
                {currency !== 'IDR' && (
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fca5a5' : '#dc2626'}>
                    ≈ {currency} {(potongan / kurs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                )}
              </VStack>
            </HStack>
          )}
          <Divider bg={mode === 'dark' ? '#10b981' : '#059669'} />
          {currency === 'IDR' ? (
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#065f46'}>
                  GRAND TOTAL
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                  Total keseluruhan
                </Text>
              </VStack>
              <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#065f46'}>
                Rp {finalGrandTotal.toLocaleString('id-ID')}
              </Text>
            </HStack>
          ) : (
            <>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#065f46'}>
                    GRAND TOTAL (IDR)
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                    Total dalam Rupiah
                  </Text>
                </VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#065f46'}>
                  Rp {finalGrandTotal.toLocaleString('id-ID')}
                </Text>
              </HStack>
              <HStack justifyContent="space-between" alignItems="center" mt={2} pt={2} borderTopWidth={1} borderTopColor={mode === 'dark' ? '#10b981' : '#059669'} borderStyle="dashed">
                <VStack>
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fbbf24' : '#f59e0b'}>
                    GRAND TOTAL ({currency})
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fef3c7' : '#f59e0b'}>
                    Kurs: 1 {currency} = Rp {kurs.toLocaleString('id-ID')}
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fbbf24' : '#f59e0b'}>
                    {currency} {grandTotalInCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </VStack>
              </HStack>
            </>
          )}
        </VStack>

        <FormControl>
          <FormControl.Label>
            <HStack space={1} alignItems="center">
              <InfoCircle size={14} color={textColor} />
              <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                Metode Pembayaran
              </Text>
            </HStack>
          </FormControl.Label>
          <HStack space={2}>
            <Pressable
              flex={1}
              onPress={() => setFormData(prev => ({ ...prev, metode: 'tunai' }))}
              bg={formData.metode === 'tunai' ? (mode === 'dark' ? '#065f46' : '#d1fae5') : inputBg}
              borderColor={formData.metode === 'tunai' ? (mode === 'dark' ? '#10b981' : '#059669') : cardBorder}
              borderWidth={2}
              rounded="xl"
              py={3}
              px={4}
              _pressed={{ opacity: 0.7 }}
            >
              <VStack space={1} alignItems="center">
                <Text 
                  fontSize="lg" 
                  fontFamily="Quicksand-Bold" 
                  color={formData.metode === 'tunai' ? (mode === 'dark' ? '#ffffff' : '#065f46') : textColor}
                >
                  Tunai
                </Text>
                <Text 
                  fontSize="xs" 
                  fontFamily="Poppins-Light" 
                  color={formData.metode === 'tunai' ? (mode === 'dark' ? '#d1fae5' : '#065f46') : subtitleColor}
                >
                  Bayar langsung
                </Text>
              </VStack>
            </Pressable>
            
            <Pressable
              flex={1}
              onPress={() => setFormData(prev => ({ ...prev, metode: 'kredit' }))}
              bg={formData.metode === 'kredit' ? (mode === 'dark' ? '#065f46' : '#d1fae5') : inputBg}
              borderColor={formData.metode === 'kredit' ? (mode === 'dark' ? '#10b981' : '#059669') : cardBorder}
              borderWidth={2}
              rounded="xl"
              py={3}
              px={4}
              _pressed={{ opacity: 0.7 }}
            >
              <VStack space={1} alignItems="center">
                <Text 
                  fontSize="lg" 
                  fontFamily="Quicksand-Bold" 
                  color={formData.metode === 'kredit' ? (mode === 'dark' ? '#ffffff' : '#065f46') : textColor}
                >
                  Kredit
                </Text>
                <Text 
                  fontSize="xs" 
                  fontFamily="Poppins-Light" 
                  color={formData.metode === 'kredit' ? (mode === 'dark' ? '#d1fae5' : '#065f46') : subtitleColor}
                >
                  Bayar tempo
                </Text>
              </VStack>
            </Pressable>
          </HStack>
        </FormControl>
      </VStack>
    </VStack>
  );
}
