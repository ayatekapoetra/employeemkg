import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native'
import { HStack, VStack } from 'native-base'
import { useSelector } from 'react-redux'
import { COLORS } from '../../constants/colors'
import { CloseCircle, TickCircle, SearchNormal1, ArrowDown2 } from 'iconsax-react-native'

/**
 * Reusable BottomSheetSelect
 * Props:
 * - label: string
 * - placeholder: string
 * - value: string
 * - options: [{ id, nama, subtitle }]
 * - onChange: function(id)
 * - displayKey: key for main label (default: 'nama')
 * - displaySubKey: key for subtitle (default: 'subtitle')
 */
const BottomSheetSelect = ({
  label,
  placeholder = 'Pilih...',
  value,
  options = [],
  onChange,
  displayKey = 'nama',
  displaySubKey = 'subtitle',
}) => {
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const [visible, setVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1]
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280'
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff'
  const borderColor = mode === 'dark' ? '#3a3c4e' : '#e5e7eb'
  const selectedBg = mode === 'dark' ? '#111827' : '#f1f5f9'
  const selectedText = mode === 'dark' ? '#93c5fd' : '#1e3a8a'

  const selectedItem = useMemo(() => options.find((item) => item.id?.toString() === value?.toString()), [options, value])
  const displayText = selectedItem ? selectedItem[displayKey] : placeholder

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return options
    return options.filter((item) => {
      const main = String(item[displayKey] ?? '').toLowerCase()
      const sub = String(item[displaySubKey] ?? '').toLowerCase()
      const id = String(item.id ?? '').toLowerCase()
      return main.includes(q) || sub.includes(q) || id.includes(q)
    })
  }, [options, searchQuery, displayKey, displaySubKey])

  useEffect(() => {
    if (!visible) {
      setSearchQuery('')
    }
  }, [visible])

  const handleSelect = (itemId) => {
    onChange(itemId)
    setVisible(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    onChange(null)
    setVisible(false)
    setSearchQuery('')
  }

  const renderItem = ({ item }) => {
    const isSelected = item.id?.toString() === value?.toString()
    return (
      <TouchableOpacity onPress={() => handleSelect(item.id)} activeOpacity={0.7}>
        <HStack p={3} alignItems="center" justifyContent="space-between" style={[styles.optionItem, { backgroundColor: isSelected ? selectedBg : 'transparent', borderBottomColor: borderColor }]}>
          <VStack flex={1} space={1}>
            <Text style={[styles.optionText, { color: isSelected ? selectedText : textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {item[displayKey]}
            </Text>
            {item[displaySubKey] ? (
              <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: subtitleColor }} numberOfLines={1} ellipsizeMode="tail">
                {item[displaySubKey]}
              </Text>
            ) : null}
          </VStack>
          {isSelected && <TickCircle size={20} color={selectedText} variant="Bold" />}
        </HStack>
      </TouchableOpacity>
    )
  }

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.7}>
        <VStack style={[styles.selectBox, { backgroundColor: cardBg, borderColor }]}>
          {
            label &&
            <Text style={[styles.label, { color: subtitleColor }]}>{label}</Text>
          }
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1} space={selectedItem?.[displaySubKey] ? 1 : 0}>
              <Text style={[styles.value, { color: selectedItem ? textColor : subtitleColor }]} numberOfLines={1} ellipsizeMode="tail">
                {displayText}
              </Text>
              {selectedItem?.[displaySubKey] ? (
                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: subtitleColor }} numberOfLines={1} ellipsizeMode="tail">
                  {selectedItem[displaySubKey]}
                </Text>
              ) : null}
            </VStack>
            <ArrowDown2 size={18} color={subtitleColor} />
          </HStack>
        </VStack>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', flex: 1 }}>
            <HStack justifyContent="space-between" alignItems="center" p={4} pb={3}>
              <Text style={{ fontSize: 16, fontFamily: 'Quicksand-Bold', color: textColor }}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <CloseCircle size={24} color={subtitleColor} />
              </TouchableOpacity>
            </HStack>

            <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
              <HStack alignItems="center" space={2} px={3} py={2} bg={mode === 'dark' ? '#374151' : '#f9fafb'} borderWidth={1} borderColor={borderColor} borderRadius={12}>
                <SearchNormal1 size={20} color={subtitleColor} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cari..."
                  placeholderTextColor={subtitleColor}
                  style={{ flex: 1, color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14, padding: 8 }}
                />
                {value ? (
                  <TouchableOpacity onPress={handleClear}>
                    <Text style={{ color: subtitleColor, fontFamily: 'Poppins-SemiBold', fontSize: 12 }}>Clear</Text>
                  </TouchableOpacity>
                ) : null}
              </HStack>
            </View>

            <FlatList
              data={filteredOptions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <VStack alignItems="center" justifyContent="center" py={10}>
                  <Text style={{ fontSize: 13, fontFamily: 'Poppins-Regular', color: subtitleColor }}>Tidak ada data ditemukan</Text>
                </VStack>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  selectBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  optionItem: {
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
})

export default BottomSheetSelect
