import { ArrowDown2, Calendar, CloseSquare, SearchNormal1 } from 'iconsax-react-native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector } from 'react-redux';

const CustomSelect = ({ label, value, options, onSelect, mode, placeholder }) => {
  const [showOptions, setShowOptions] = useState(false);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <VStack space={2}>
      <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        style={{
          backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
          borderWidth: 1,
          borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
          borderRadius: 8,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text 
          fontSize="sm" 
          fontFamily="Poppins-Regular" 
          color={selectedOption ? textColor : labelColor}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ArrowDown2 size={16} color={labelColor} />
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
              borderRadius: 16,
              width: '85%',
              maxHeight: '70%',
              overflow: 'hidden',
            }}
          >
            <VStack>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                p={4}
                borderBottomWidth={1}
                borderBottomColor={mode === 'dark' ? '#3a3c4e' : '#e5e7eb'}
              >
                <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
                  {label}
                </Text>
                <TouchableOpacity onPress={() => setShowOptions(false)}>
                  <CloseSquare size={24} color={labelColor} />
                </TouchableOpacity>
              </HStack>

              <ScrollView style={{ maxHeight: 400 }}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onSelect(option.value);
                      setShowOptions(false);
                    }}
                    style={{
                      padding: 16,
                      backgroundColor: value === option.value 
                        ? (mode === 'dark' ? '#374151' : '#f3f4f6')
                        : 'transparent',
                      borderBottomWidth: 1,
                      borderBottomColor: mode === 'dark' ? '#3a3c4e' : '#e5e7eb',
                    }}
                  >
                    <Text
                      fontSize="sm"
                      fontFamily={value === option.value ? 'Quicksand-Bold' : 'Poppins-Regular'}
                      color={value === option.value 
                        ? (mode === 'dark' ? '#60a5fa' : '#2563eb')
                        : textColor
                      }
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </VStack>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </VStack>
  );
};

const EquipmentItem = React.memo(({ equipment, onPress, mode }) => {
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  
  const kodeUnit = equipment.kode_unit || 
                  equipment.kode_equipment || 
                  equipment.code || 
                  equipment.kode || 
                  equipment.nopol ||
                  equipment.no_polisi ||
                  '';
  
  const namaUnit = equipment.nama_unit || 
                  equipment.nama_equipment || 
                  equipment.name || 
                  equipment.nama ||
                  'Unknown';
  
  const modelUnit = equipment.model || 
                   equipment.type || 
                   equipment.tipe ||
                   equipment.model_equipment ||
                   '';
  
  const kategori = equipment.kategori || 
                  equipment.kategori_equipment ||
                  equipment.category ||
                  equipment.jenis ||
                  'EQ';
  
  const avatarText = kategori.substring(0, 2).toUpperCase();
  
  const getCategoryColor = (cat) => {
    const categoryColorMap = {
      'excavator': { bg: mode === 'dark' ? '#1e40af' : '#dbeafe', text: mode === 'dark' ? '#60a5fa' : '#2563eb' },
      'dump truck': { bg: mode === 'dark' ? '#065f46' : '#d1fae5', text: mode === 'dark' ? '#6ee7b7' : '#059669' },
      'dozer': { bg: mode === 'dark' ? '#7c2d12' : '#fed7aa', text: mode === 'dark' ? '#fdba74' : '#ea580c' },
      'grader': { bg: mode === 'dark' ? '#581c87' : '#f3e8ff', text: mode === 'dark' ? '#c084fc' : '#9333ea' },
      'compactor': { bg: mode === 'dark' ? '#991b1b' : '#fee2e2', text: mode === 'dark' ? '#fca5a5' : '#dc2626' },
      'loader': { bg: mode === 'dark' ? '#0e7490' : '#cffafe', text: mode === 'dark' ? '#67e8f9' : '#0891b2' },
      'default': { bg: mode === 'dark' ? '#374151' : '#e5e7eb', text: mode === 'dark' ? '#9ca3af' : '#6b7280' },
    };
    
    const catLower = cat.toLowerCase();
    for (const key in categoryColorMap) {
      if (catLower.includes(key)) {
        return categoryColorMap[key];
      }
    }
    
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorKeys = Object.keys(categoryColorMap).filter(k => k !== 'default');
    const colorIndex = Math.abs(hash) % colorKeys.length;
    return categoryColorMap[colorKeys[colorIndex]];
  };
  
  const avatarColor = getCategoryColor(kategori);
  
  return (
    <TouchableOpacity
      onPress={() => onPress(equipment)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
        marginHorizontal: 20,
      }}
    >
      <HStack space={3} alignItems="center">
        <VStack space={0.5} flex={1}>
          <Text
            fontSize="sm"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            {kodeUnit || '[No Code]'}
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Poppins-Regular"
            color={labelColor}
            numberOfLines={1}
          >
            {namaUnit || '[No Name]'}
          </Text>
          {modelUnit && (
            <Text
              fontSize="2xs"
              fontFamily="Poppins-Regular"
              color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
              numberOfLines={1}
            >
              {modelUnit}
            </Text>
          )}
        </VStack>
        
        <VStack
          alignItems="center"
          justifyContent="center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: avatarColor.bg,
          }}
        >
          <Text
            fontSize="xs"
            fontFamily="Quicksand-Bold"
            color={avatarColor.text}
          >
            {avatarText}
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
});

const EquipmentBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const equipmentRedux = useSelector(state => state.equipment);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const equipmentList = useMemo(() => {
    if (Array.isArray(equipmentRedux?.data)) {
      return equipmentRedux.data;
    } else if (equipmentRedux?.data && typeof equipmentRedux.data === 'object') {
      if (Array.isArray(equipmentRedux.data.rows)) {
        return equipmentRedux.data.rows;
      } else if (Array.isArray(equipmentRedux.data.data)) {
        return equipmentRedux.data.data;
      } else if (Array.isArray(equipmentRedux.data.equipment)) {
        return equipmentRedux.data.equipment;
      } else if (Array.isArray(equipmentRedux.data.list)) {
        return equipmentRedux.data.list;
      }
    }
    return [];
  }, [equipmentRedux?.data]);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery) return equipmentList;
    
    const searchLower = searchQuery.toLowerCase();
    return equipmentList.filter(item => {
      const kodeUnit = item.kode_unit || 
                      item.kode_equipment || 
                      item.code || 
                      item.kode || 
                      item.nopol ||
                      item.no_polisi ||
                      '';
      
      const namaUnit = item.nama_unit || 
                      item.nama_equipment || 
                      item.name || 
                      item.nama ||
                      item.model ||
                      item.type ||
                      item.tipe ||
                      '';
      
      return kodeUnit.toLowerCase().includes(searchLower) || 
             namaUnit.toLowerCase().includes(searchLower);
    });
  }, [equipmentList, searchQuery]);

  const handleSelect = useCallback((equipment) => {
    const kodeUnit = equipment.kode_unit || 
                    equipment.kode_equipment || 
                    equipment.code || 
                    equipment.kode || 
                    equipment.nopol ||
                    equipment.no_polisi ||
                    '';
    onSelect(kodeUnit);
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => (
    <EquipmentItem equipment={item} onPress={handleSelect} mode={mode} />
  ), [handleSelect, mode]);

  const keyExtractor = useCallback((item, index) => {
    return item.id?.toString() || item.kode_unit || item.code || index.toString();
  }, []);

  const ListEmptyComponent = useCallback(() => (
    <VStack py={10} alignItems="center">
      <Text
        fontSize="sm"
        fontFamily="Poppins-Regular"
        color={labelColor}
        textAlign="center"
      >
        {searchQuery ? 'Equipment tidak ditemukan' : 'Tidak ada data equipment'}
      </Text>
    </VStack>
  ), [searchQuery, labelColor]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Equipment
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {equipmentList.length} equipment tersedia
                </Text>
              </VStack>
              <TouchableOpacity onPress={onClose}>
                <CloseSquare size={28} color={labelColor} />
              </TouchableOpacity>
            </HStack>

            <HStack
              alignItems="center"
              space={2}
              px={3}
              py={2}
              bg={mode === 'dark' ? '#374151' : '#f9fafb'}
              borderWidth={1}
              borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
              borderRadius={12}
            >
              <SearchNormal1 size={20} color={labelColor} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari equipment..."
                placeholderTextColor={labelColor}
                style={{
                  flex: 1,
                  color: textColor,
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  padding: 8,
                }}
              />
            </HStack>
          </VStack>

          <FlatList
            data={filteredEquipment}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            style={{ flex: 1 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const OprDrvItem = React.memo(({ oprdrv, area, onPress, getAreaBadgeColor, mode }) => {
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  
  const nama = oprdrv.nama || oprdrv.name || '';
  const namaCabang = oprdrv.cabang?.nama || '';
  const section = oprdrv.section || oprdrv.bagian || oprdrv.divisi || '';
  const phone = oprdrv.phone || oprdrv.no_hp || oprdrv.telepon || oprdrv.hp || '';
  const badgeColor = getAreaBadgeColor(area);
  
  return (
    <TouchableOpacity
      onPress={() => onPress(oprdrv)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
      }}
    >
      <HStack space={3} alignItems="center">
        <VStack space={0.5} flex={1}>
          <Text
            fontSize="sm"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            {nama || '[No Name]'}
          </Text>
          
          <HStack space={2} alignItems="center" flexWrap="wrap">
            {section && (
              <Text
                fontSize="xs"
                fontFamily="Poppins-Regular"
                color={labelColor}
              >
                {section}
              </Text>
            )}
            {section && phone && (
              <Text fontSize="xs" color={labelColor}>•</Text>
            )}
            {phone && (
              <Text
                fontSize="xs"
                fontFamily="Poppins-Regular"
                color={labelColor}
              >
                {phone}
              </Text>
            )}
          </HStack>
          {namaCabang && (
            <Text
              fontSize="xs"
              fontFamily="Poppins-Regular"
              color={mode === 'dark' ? '#9ca3af' : '#6b7280'}
              numberOfLines={1}
            >
              {namaCabang}
            </Text>
          )}
        </VStack>

        <VStack
          px={3}
          py={1.5}
          bg={badgeColor.bg}
          borderRadius={8}
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize="xs"
            fontFamily="Quicksand-SemiBold"
            color={badgeColor.text}
            numberOfLines={1}
          >
            {area}
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
});

const OprDrvBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const oprdrvRedux = useSelector(state => state.oprdrv);
  const auth = useSelector(state => state.auth);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const userType = auth?.user?.usertype || '';
  const isDeveloper = userType.toLowerCase() === 'developer';
  
  const userArea = auth?.user?.karyawan?.area || 
                   auth?.karyawan?.area || 
                   auth?.karyawan?.cabang?.area || 
                   null;

  React.useEffect(() => {
    if (visible) {
      console.log('========================================');
      console.log('OprDrv Bottomsheet Opened');
      console.log('========================================');
      console.log('Full Auth State:', {
        hasUser: !!auth?.user,
        hasKaryawan: !!auth?.karyawan,
        userType: userType,
        isDeveloper: isDeveloper,
        userKaryawanArea: auth?.user?.karyawan?.area,
        karyawanArea: auth?.karyawan?.area,
        karyawanCabangArea: auth?.karyawan?.cabang?.area,
        finalUserArea: userArea,
      });
      console.log('========================================');
    }
  }, [visible, auth, userArea, userType, isDeveloper]);

  const oprdrvList = useMemo(() => {
    let list = [];
    if (Array.isArray(oprdrvRedux?.data)) {
      list = oprdrvRedux.data;
    } else if (oprdrvRedux?.data && typeof oprdrvRedux.data === 'object') {
      if (Array.isArray(oprdrvRedux.data.rows)) {
        list = oprdrvRedux.data.rows;
      } else if (Array.isArray(oprdrvRedux.data.data)) {
        list = oprdrvRedux.data.data;
      }
    }
    
    console.log('========================================');
    console.log('OprDrv Filter - Debug Info');
    console.log('========================================');
    console.log('Total data:', list.length);
    console.log('User Type:', userType);
    console.log('Is Developer:', isDeveloper);
    console.log('Auth structure:');
    console.log('- auth.user?.karyawan?.area:', auth?.user?.karyawan?.area);
    console.log('- auth.karyawan?.area:', auth?.karyawan?.area);
    console.log('- auth.karyawan?.cabang?.area:', auth?.karyawan?.cabang?.area);
    console.log('Final userArea used for filter:', userArea);
    
    if (list.length > 0) {
      console.log('Sample data structure (first item):');
      const sample = list[0];
      console.log('- item.nama:', sample.nama);
      console.log('- item.cabang:', sample.cabang);
      console.log('- item.cabang?.area:', sample.cabang?.area);
      console.log('- item.cabang?.nama:', sample.cabang?.nama);
      console.log('- item.mas_cabang:', sample.mas_cabang);
      console.log('- item.area:', sample.area);
      console.log('Full first item:', JSON.stringify(sample, null, 2));
    }
    
    if (isDeveloper) {
      console.log('✅ User is Developer - Showing all data (bypass filter)');
      console.log('========================================');
      return list;
    }
    
    if (!userArea) {
      console.log('⚠️  No user area found, showing all data');
      console.log('========================================');
      return list;
    }
    
    const normalizeArea = (area) => {
      if (!area) return '';
      return String(area).trim().toUpperCase();
    };
    
    const normalizedUserArea = normalizeArea(userArea);
    console.log('Normalized user area for comparison:', normalizedUserArea);
    
    const filtered = list.filter(item => {
      const itemArea = item.cabang?.area || 
                      item.mas_cabang?.area || 
                      item.area || 
                      '';
      
      const normalizedItemArea = normalizeArea(itemArea);
      const matches = normalizedItemArea === normalizedUserArea;
      
      if (list.indexOf(item) < 3) {
        console.log(`Item ${list.indexOf(item)} - ${item.nama}:`);
        console.log('  - itemArea (raw):', itemArea);
        console.log('  - itemArea (normalized):', normalizedItemArea);
        console.log('  - userArea (normalized):', normalizedUserArea);
        console.log('  - matches:', matches);
      }
      
      return matches;
    });
    
    console.log('✅ Filtered data count:', filtered.length);
    console.log('Filter result:', filtered.map(f => ({ nama: f.nama, area: f.cabang?.area || f.area })));
    console.log('========================================');
    return filtered;
  }, [oprdrvRedux?.data, userArea, isDeveloper, userType]);

  const filteredOprDrv = useMemo(() => {
    if (!searchQuery) return oprdrvList;
    
    const searchLower = searchQuery.toLowerCase();
    return oprdrvList.filter(item => {
      const nama = item.nama || item.name || item.nama_karyawan || '';
      const section = item.section || item.bagian || item.divisi || '';
      const phone = item.phone || item.no_hp || item.telepon || item.hp || '';
      const area = item.cabang?.area || 
                  item.mas_cabang?.area || 
                  item.area || 
                  item.lokasi || 
                  '';
      
      return nama.toLowerCase().includes(searchLower) || 
             section.toLowerCase().includes(searchLower) ||
             phone.toLowerCase().includes(searchLower) ||
             area.toLowerCase().includes(searchLower);
    });
  }, [oprdrvList, searchQuery]);

  const flattenedData = useMemo(() => {
    const grouped = filteredOprDrv.reduce((groups, item) => {
      const area = item.cabang?.area || 
                  item.mas_cabang?.area || 
                  item.area || 
                  item.lokasi || 
                  'Area Tidak Diketahui';
      
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(item);
      return groups;
    }, {});

    const sortedAreas = Object.keys(grouped).sort((a, b) => {
      if (a === 'Area Tidak Diketahui') return 1;
      if (b === 'Area Tidak Diketahui') return -1;
      return a.localeCompare(b);
    });

    const result = [];
    sortedAreas.forEach(area => {
      result.push({ type: 'header', area, count: grouped[area].length });
      grouped[area].forEach(item => {
        result.push({ type: 'item', area, data: item });
      });
    });
    return result;
  }, [filteredOprDrv]);

  const handleSelect = useCallback((oprdrv) => {
    const nama = oprdrv.nama || oprdrv.name || oprdrv.nama_karyawan || '';
    onSelect(nama);
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const getAreaBadgeColor = useCallback((area) => {
    const colors = [
      { bg: mode === 'dark' ? '#1e40af' : '#dbeafe', text: mode === 'dark' ? '#60a5fa' : '#2563eb' },
      { bg: mode === 'dark' ? '#065f46' : '#d1fae5', text: mode === 'dark' ? '#6ee7b7' : '#059669' },
      { bg: mode === 'dark' ? '#7c2d12' : '#fed7aa', text: mode === 'dark' ? '#fdba74' : '#ea580c' },
      { bg: mode === 'dark' ? '#581c87' : '#f3e8ff', text: mode === 'dark' ? '#c084fc' : '#9333ea' },
      { bg: mode === 'dark' ? '#991b1b' : '#fee2e2', text: mode === 'dark' ? '#fca5a5' : '#dc2626' },
      { bg: mode === 'dark' ? '#0e7490' : '#cffafe', text: mode === 'dark' ? '#67e8f9' : '#0891b2' },
      { bg: mode === 'dark' ? '#854d0e' : '#fef3c7', text: mode === 'dark' ? '#fcd34d' : '#ca8a04' },
      { bg: mode === 'dark' ? '#1e3a8a' : '#e0e7ff', text: mode === 'dark' ? '#a5b4fc' : '#4f46e5' },
    ];
    
    let hash = 0;
    for (let i = 0; i < area.length; i++) {
      hash = area.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  }, [mode]);

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'header') {
      return (
        <HStack
          alignItems="center"
          space={2}
          px={2}
          py={2}
          bg={mode === 'dark' ? '#374151' : '#f3f4f6'}
          rounded="lg"
          mb={2}
        >
          <VStack
            style={{
              width: 3,
              height: 16,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? '#60a5fa' : '#3b82f6',
            }}
          />
          <Text
            fontSize="sm"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            📍 {item.area}
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Poppins-Regular"
            color={labelColor}
          >
            ({item.count} orang)
          </Text>
        </HStack>
      );
    }
    
    return (
      <OprDrvItem
        oprdrv={item.data}
        area={item.area}
        onPress={handleSelect}
        getAreaBadgeColor={getAreaBadgeColor}
        mode={mode}
      />
    );
  }, [mode, textColor, labelColor, handleSelect, getAreaBadgeColor]);

  const keyExtractor = useCallback((item, index) => {
    if (item.type === 'header') {
      return `header-${item.area}`;
    }
    return item.data.id?.toString() || item.data.nama || index.toString();
  }, []);

  const ListEmptyComponent = useCallback(() => (
    <VStack py={10} alignItems="center">
      <Text
        fontSize="sm"
        fontFamily="Poppins-Regular"
        color={labelColor}
        textAlign="center"
      >
        {searchQuery ? 'Operator/Driver tidak ditemukan' : 'Tidak ada data operator/driver'}
      </Text>
    </VStack>
  ), [searchQuery, labelColor]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Operator/Driver
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {oprdrvList.length} operator/driver tersedia
                </Text>
                {isDeveloper ? (
                  <HStack alignItems="center" space={1} mt={1}>
                    <VStack
                      px={2}
                      py={0.5}
                      bg={mode === 'dark' ? '#581c87' : '#f3e8ff'}
                      borderRadius={4}
                    >
                      <Text
                        fontSize="2xs"
                        fontFamily="Quicksand-SemiBold"
                        color={mode === 'dark' ? '#c084fc' : '#9333ea'}
                      >
                        👨‍💻 Developer Mode
                      </Text>
                    </VStack>
                    <Text fontSize="2xs" fontFamily="Poppins-Regular" color={labelColor}>
                      Menampilkan semua area
                    </Text>
                  </HStack>
                ) : userArea && (
                  <HStack alignItems="center" space={1} mt={1}>
                    <VStack
                      px={2}
                      py={0.5}
                      bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
                      borderRadius={4}
                    >
                      <Text
                        fontSize="2xs"
                        fontFamily="Quicksand-SemiBold"
                        color={mode === 'dark' ? '#60a5fa' : '#2563eb'}
                      >
                        📍 {userArea}
                      </Text>
                    </VStack>
                    <Text fontSize="2xs" fontFamily="Poppins-Regular" color={labelColor}>
                      Difilter berdasarkan area Anda
                    </Text>
                  </HStack>
                )}
              </VStack>
              <TouchableOpacity onPress={onClose}>
                <CloseSquare size={28} color={labelColor} />
              </TouchableOpacity>
            </HStack>

            <HStack
              alignItems="center"
              space={2}
              px={3}
              py={2}
              bg={mode === 'dark' ? '#374151' : '#f9fafb'}
              borderWidth={1}
              borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
              borderRadius={12}
            >
              <SearchNormal1 size={20} color={labelColor} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari operator/driver..."
                placeholderTextColor={labelColor}
                style={{
                  flex: 1,
                  color: textColor,
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  padding: 8,
                }}
              />
            </HStack>
          </VStack>

          <FlatList
            data={flattenedData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            style={{ flex: 1 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const KegiatanKerjaItem = React.memo(({ kegiatan, onPress, mode }) => {
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  
  const namaKegiatan = kegiatan.nama || '';
  const narasi = kegiatan.narasi || '???';
  const grpEquipment = kegiatan.grpequipment || '';
  
  const getGrpColor = (grp) => {
    if (!grp) return { bg: mode === 'dark' ? '#374151' : '#e5e7eb', text: mode === 'dark' ? '#9ca3af' : '#6b7280' };
    
    const colors = [
      { bg: mode === 'dark' ? '#1e40af' : '#dbeafe', text: mode === 'dark' ? '#60a5fa' : '#2563eb' },
      { bg: mode === 'dark' ? '#065f46' : '#d1fae5', text: mode === 'dark' ? '#6ee7b7' : '#059669' },
      { bg: mode === 'dark' ? '#7c2d12' : '#fed7aa', text: mode === 'dark' ? '#fdba74' : '#ea580c' },
      { bg: mode === 'dark' ? '#581c87' : '#f3e8ff', text: mode === 'dark' ? '#c084fc' : '#9333ea' },
      { bg: mode === 'dark' ? '#991b1b' : '#fee2e2', text: mode === 'dark' ? '#fca5a5' : '#dc2626' },
      { bg: mode === 'dark' ? '#0e7490' : '#cffafe', text: mode === 'dark' ? '#67e8f9' : '#0891b2' },
      { bg: mode === 'dark' ? '#854d0e' : '#fef3c7', text: mode === 'dark' ? '#fcd34d' : '#ca8a04' },
      { bg: mode === 'dark' ? '#1e3a8a' : '#e0e7ff', text: mode === 'dark' ? '#a5b4fc' : '#4f46e5' },
    ];
    
    let hash = 0;
    for (let i = 0; i < grp.length; i++) {
      hash = grp.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const grpColor = getGrpColor(grpEquipment);
  
  return (
    <TouchableOpacity
      onPress={() => onPress(kegiatan)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
        marginHorizontal: 20,
      }}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack space={0.5} flex={1} pr={2}>
          <Text
            fontSize="sm"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            {namaKegiatan || '[No Name]'}
          </Text>
          <Text
            fontSize="xs"
            fontFamily="Quicksand-Regular"
            color={labelColor}
          >
            {narasi}
          </Text>
        </VStack>
        {grpEquipment && (
          <VStack
            px={2}
            py={1}
            bg={grpColor.bg}
            borderRadius={6}
          >
            <Text
              fontSize="xs"
              fontFamily="Quicksand-SemiBold"
              color={grpColor.text}
            >
              {grpEquipment}
            </Text>
          </VStack>
        )}
      </HStack>
    </TouchableOpacity>
  );
});

const KegiatanKerjaBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const kegiatankerjaRedux = useSelector(state => state.kegiatankerja);
  const auth = useSelector(state => state.auth);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const userType = auth?.user?.usertype || '';
  const isDeveloper = userType.toLowerCase() === 'developer';
  
  const userArea = auth?.user?.karyawan?.area || 
                   auth?.karyawan?.area || 
                   auth?.karyawan?.cabang?.area || 
                   null;

  const kegiatanList = useMemo(() => {
    let list = [];
    if (Array.isArray(kegiatankerjaRedux?.data)) {
      list = kegiatankerjaRedux.data;
    } else if (kegiatankerjaRedux?.data && typeof kegiatankerjaRedux.data === 'object') {
      if (Array.isArray(kegiatankerjaRedux.data.rows)) {
        list = kegiatankerjaRedux.data.rows;
      } else if (Array.isArray(kegiatankerjaRedux.data.data)) {
        list = kegiatankerjaRedux.data.data;
      }
    }
    
    const sorted = [...list].sort((a, b) => {
      const grpA = a.grpequipment || '';
      const grpB = b.grpequipment || '';
      return grpA.localeCompare(grpB);
    });
    
    console.log('========================================');
    console.log('Kegiatan Kerja - Sorted by grpequipment');
    console.log('========================================');
    console.log('Total data:', sorted.length);
    console.log('Sample data (first 2):', sorted.slice(0, 2));
    console.log('========================================');
    
    return sorted;
  }, [kegiatankerjaRedux?.data]);

  const filteredKegiatan = useMemo(() => {
    if (!searchQuery) return kegiatanList;
    
    const searchLower = searchQuery.toLowerCase();
    return kegiatanList.filter(item => {
      const nama = item.nama || '';
      const narasi = item.narasi || '';
      const area = item.cabang?.area || item.area || '';
      
      return nama.toLowerCase().includes(searchLower) ||
             narasi.toLowerCase().includes(searchLower) ||
             area.toLowerCase().includes(searchLower);
    });
  }, [kegiatanList, searchQuery]);

  const handleSelect = useCallback((kegiatan) => {
    const namaKegiatan = kegiatan.nama || '';
    onSelect(namaKegiatan);
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => (
    <KegiatanKerjaItem kegiatan={item} onPress={handleSelect} mode={mode} />
  ), [handleSelect, mode]);

  const keyExtractor = useCallback((item, index) => {
    return item.id?.toString() || item.nama || index.toString();
  }, []);

  const ListEmptyComponent = useCallback(() => (
    <VStack py={10} alignItems="center">
      <Text
        fontSize="sm"
        fontFamily="Poppins-Regular"
        color={labelColor}
        textAlign="center"
      >
        {searchQuery ? 'Kegiatan tidak ditemukan' : 'Tidak ada data kegiatan kerja'}
      </Text>
    </VStack>
  ), [searchQuery, labelColor]);

  React.useEffect(() => {
    if (visible) {
      console.log('========================================');
      console.log('Kegiatan Kerja Bottomsheet Opened');
      console.log('========================================');
      console.log('Full Auth State:', {
        hasUser: !!auth?.user,
        hasKaryawan: !!auth?.karyawan,
        userType: userType,
        isDeveloper: isDeveloper,
        userKaryawanArea: auth?.user?.karyawan?.area,
        karyawanArea: auth?.karyawan?.area,
        karyawanCabangArea: auth?.karyawan?.cabang?.area,
        finalUserArea: userArea,
      });
      console.log('========================================');
    }
  }, [visible, auth, userArea, userType, isDeveloper]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Kegiatan Kerja
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {kegiatanList.length} kegiatan tersedia
                </Text>
              </VStack>
              <TouchableOpacity onPress={onClose}>
                <CloseSquare size={28} color={labelColor} />
              </TouchableOpacity>
            </HStack>

            <HStack
              alignItems="center"
              space={2}
              px={3}
              py={2}
              bg={mode === 'dark' ? '#374151' : '#f9fafb'}
              borderWidth={1}
              borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
              borderRadius={12}
            >
              <SearchNormal1 size={20} color={labelColor} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari kegiatan kerja..."
                placeholderTextColor={labelColor}
                style={{
                  flex: 1,
                  color: textColor,
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  padding: 8,
                }}
              />
            </HStack>
          </VStack>

          <FlatList
            data={filteredKegiatan}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            style={{ flex: 1 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const LokasiKerjaItem = React.memo(({ lokasi, onPress, mode }) => {
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  
  const namaLokasi = lokasi.nama_lokasi || lokasi.nama || lokasi.lokasi || '';
  const namaCabang = lokasi.cabang?.nama || lokasi.nama_cabang || '';
  const area = lokasi.cabang?.area || lokasi.area || '';
  const type = lokasi.type || lokasi.tipe || lokasi.jenis || '';
  
  const getAreaColor = (areaValue) => {
    if (!areaValue) {
      return { bg: mode === 'dark' ? '#374151' : '#e5e7eb', text: mode === 'dark' ? '#9ca3af' : '#6b7280' };
    }
    
    const areaColors = [
      { bg: mode === 'dark' ? '#1e40af' : '#dbeafe', text: mode === 'dark' ? '#60a5fa' : '#2563eb' },
      { bg: mode === 'dark' ? '#065f46' : '#d1fae5', text: mode === 'dark' ? '#6ee7b7' : '#059669' },
      { bg: mode === 'dark' ? '#7c2d12' : '#fed7aa', text: mode === 'dark' ? '#fdba74' : '#ea580c' },
      { bg: mode === 'dark' ? '#581c87' : '#f3e8ff', text: mode === 'dark' ? '#c084fc' : '#9333ea' },
      { bg: mode === 'dark' ? '#991b1b' : '#fee2e2', text: mode === 'dark' ? '#fca5a5' : '#dc2626' },
      { bg: mode === 'dark' ? '#0e7490' : '#cffafe', text: mode === 'dark' ? '#67e8f9' : '#0891b2' },
      { bg: mode === 'dark' ? '#854d0e' : '#fef3c7', text: mode === 'dark' ? '#fcd34d' : '#ca8a04' },
      { bg: mode === 'dark' ? '#1e3a8a' : '#e0e7ff', text: mode === 'dark' ? '#a5b4fc' : '#4f46e5' },
    ];
    
    let hash = 0;
    for (let i = 0; i < areaValue.length; i++) {
      hash = areaValue.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % areaColors.length;
    return areaColors[colorIndex];
  };
  
  const areaColor = getAreaColor(area);
  const avatarText = type ? type.substring(0, 3).toUpperCase() : 'LOK';
  
  return (
    <TouchableOpacity
      onPress={() => onPress(lokasi)}
      style={{
        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
        marginBottom: 8,
        marginHorizontal: 20,
      }}
    >
      <HStack alignItems="center" space={3}>
        <VStack
          alignItems="center"
          justifyContent="center"
          style={{
            width: 52,
            height: 62,
            borderRadius: 8,
            backgroundColor: areaColor.bg,
          }}
        >
          <Text
            fontSize="xs"
            fontFamily="Quicksand-Bold"
            color={areaColor.text}
          >
            {avatarText}
          </Text>
        </VStack>
        
        <VStack space={0.5} flex={1}>
          <Text
            fontSize="sm"
            fontFamily="Quicksand-Bold"
            color={textColor}
          >
            {namaLokasi || '[No Name]'}
          </Text>
          {namaCabang && (
            <Text
              fontSize="xs"
              fontFamily="Quicksand-Regular"
              color={labelColor}
            >
              {namaCabang}
            </Text>
          )}
          {area && (
            <HStack alignItems="center" space={1}>
              <VStack
                px={2}
                py={0.5}
                bg={areaColor.bg}
                borderRadius={4}
              >
                <Text
                  fontSize="2xs"
                  fontFamily="Quicksand-SemiBold"
                  color={areaColor.text}
                >
                  {area}
                </Text>
              </VStack>
            </HStack>
          )}
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
});

const LokasiKerjaBottomSheet = ({ visible, onClose, onSelect, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const lokasikerjaRedux = useSelector(state => state.lokasikerja);
  const auth = useSelector(state => state.auth);
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const userType = auth?.user?.usertype || '';
  const isDeveloper = userType.toLowerCase() === 'developer';
  
  const userArea = auth?.user?.karyawan?.area || 
                   auth?.karyawan?.area || 
                   auth?.karyawan?.cabang?.area || 
                   null;

  const lokasiList = useMemo(() => {
    let list = [];
    if (Array.isArray(lokasikerjaRedux?.data)) {
      list = lokasikerjaRedux.data;
    } else if (lokasikerjaRedux?.data && typeof lokasikerjaRedux.data === 'object') {
      if (Array.isArray(lokasikerjaRedux.data.rows)) {
        list = lokasikerjaRedux.data.rows;
      } else if (Array.isArray(lokasikerjaRedux.data.data)) {
        list = lokasikerjaRedux.data.data;
      }
    }
    
    console.log('========================================');
    console.log('Lokasi Kerja Filter - Debug Info');
    console.log('========================================');
    console.log('Total data:', list.length);
    console.log('User Type:', userType);
    console.log('Is Developer:', isDeveloper);
    console.log('User area:', userArea);
    
    if (isDeveloper) {
      console.log('✅ User is Developer - Showing all data (bypass filter)');
      console.log('========================================');
      return list;
    }
    
    if (!userArea) {
      console.log('⚠️  No user area found, showing all data');
      console.log('========================================');
      return list;
    }
    
    const normalizeArea = (area) => {
      if (!area) return '';
      return String(area).trim().toUpperCase();
    };
    
    const normalizedUserArea = normalizeArea(userArea);
    console.log('Normalized user area for comparison:', normalizedUserArea);
    
    const filtered = list.filter(item => {
      const itemArea = item.cabang?.area || item.area || '';
      const normalizedItemArea = normalizeArea(itemArea);
      const matches = normalizedItemArea === normalizedUserArea;
      
      if (list.indexOf(item) < 3) {
        console.log(`Item ${list.indexOf(item)} - ${item.nama_lokasi || item.nama}:`);
        console.log('  - itemArea (raw):', itemArea);
        console.log('  - itemArea (normalized):', normalizedItemArea);
        console.log('  - userArea (normalized):', normalizedUserArea);
        console.log('  - matches:', matches);
      }
      
      return matches;
    });
    
    console.log('✅ Filtered data count:', filtered.length);
    console.log('========================================');
    return filtered;
  }, [lokasikerjaRedux?.data, userArea, isDeveloper, userType]);

  const filteredLokasi = useMemo(() => {
    if (!searchQuery) return lokasiList;
    
    const searchLower = searchQuery.toLowerCase();
    return lokasiList.filter(item => {
      const nama = item.nama_lokasi || item.nama || item.lokasi || '';
      const kode = item.kode_lokasi || item.kode || '';
      const keterangan = item.keterangan || item.deskripsi || '';
      const area = item.cabang?.area || item.area || '';
      const type = item.type || item.tipe || item.jenis || '';
      
      return nama.toLowerCase().includes(searchLower) || 
             kode.toLowerCase().includes(searchLower) ||
             keterangan.toLowerCase().includes(searchLower) ||
             area.toLowerCase().includes(searchLower) ||
             type.toLowerCase().includes(searchLower);
    });
  }, [lokasiList, searchQuery]);

  const handleSelect = useCallback((lokasi) => {
    const namaLokasi = lokasi.nama_lokasi || lokasi.nama || lokasi.lokasi || '';
    onSelect(namaLokasi);
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const renderItem = useCallback(({ item }) => (
    <LokasiKerjaItem lokasi={item} onPress={handleSelect} mode={mode} />
  ), [handleSelect, mode]);

  const keyExtractor = useCallback((item, index) => {
    return item.id?.toString() || item.kode_lokasi || item.kode || index.toString();
  }, []);

  const ListEmptyComponent = useCallback(() => (
    <VStack py={10} alignItems="center">
      <Text
        fontSize="sm"
        fontFamily="Poppins-Regular"
        color={labelColor}
        textAlign="center"
      >
        {searchQuery ? 'Lokasi tidak ditemukan' : 'Tidak ada data lokasi kerja'}
      </Text>
    </VStack>
  ), [searchQuery, labelColor]);

  React.useEffect(() => {
    if (visible) {
      console.log('========================================');
      console.log('Lokasi Kerja Bottomsheet Opened');
      console.log('========================================');
      console.log('Full Auth State:', {
        hasUser: !!auth?.user,
        hasKaryawan: !!auth?.karyawan,
        userType: userType,
        isDeveloper: isDeveloper,
        userKaryawanArea: auth?.user?.karyawan?.area,
        karyawanArea: auth?.karyawan?.area,
        karyawanCabangArea: auth?.karyawan?.cabang?.area,
        finalUserArea: userArea,
      });
      console.log('========================================');
    }
  }, [visible, auth, userArea, userType, isDeveloper]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '75%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <VStack space={3} p={5} pb={0}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                  Pilih Lokasi Kerja
                </Text>
                <Text fontSize="xs" fontFamily="Poppins-Regular" color={labelColor}>
                  {lokasiList.length} lokasi tersedia
                </Text>
                {isDeveloper ? (
                  <HStack alignItems="center" space={1} mt={1}>
                    <VStack
                      px={2}
                      py={0.5}
                      bg={mode === 'dark' ? '#581c87' : '#f3e8ff'}
                      borderRadius={4}
                    >
                      <Text
                        fontSize="2xs"
                        fontFamily="Quicksand-SemiBold"
                        color={mode === 'dark' ? '#c084fc' : '#9333ea'}
                      >
                        👨‍💻 Developer Mode
                      </Text>
                    </VStack>
                    <Text fontSize="2xs" fontFamily="Poppins-Regular" color={labelColor}>
                      Menampilkan semua area
                    </Text>
                  </HStack>
                ) : userArea && (
                  <HStack alignItems="center" space={1} mt={1}>
                    <VStack
                      px={2}
                      py={0.5}
                      bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
                      borderRadius={4}
                    >
                      <Text
                        fontSize="2xs"
                        fontFamily="Quicksand-SemiBold"
                        color={mode === 'dark' ? '#60a5fa' : '#2563eb'}
                      >
                        📍 {userArea}
                      </Text>
                    </VStack>
                    <Text fontSize="2xs" fontFamily="Poppins-Regular" color={labelColor}>
                      Difilter berdasarkan area Anda
                    </Text>
                  </HStack>
                )}
              </VStack>
              <TouchableOpacity onPress={onClose}>
                <CloseSquare size={28} color={labelColor} />
              </TouchableOpacity>
            </HStack>

            <HStack
              alignItems="center"
              space={2}
              px={3}
              py={2}
              bg={mode === 'dark' ? '#374151' : '#f9fafb'}
              borderWidth={1}
              borderColor={mode === 'dark' ? '#4b5563' : '#e5e7eb'}
              borderRadius={12}
            >
              <SearchNormal1 size={20} color={labelColor} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari lokasi kerja..."
                placeholderTextColor={labelColor}
                style={{
                  flex: 1,
                  color: textColor,
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  padding: 8,
                }}
              />
            </HStack>
          </VStack>

          <FlatList
            data={filteredLokasi}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            style={{ flex: 1 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const FilterPenugasanModal = ({ 
  visible, 
  onClose, 
  filters, 
  onFilterChange, 
  onApply,
  onReset,
  mode
}) => {
  const [showDatePicker, setShowDatePicker] = useState({ type: null, visible: false });
  const [showEquipmentSheet, setShowEquipmentSheet] = useState(false);
  const [showOprDrvSheet, setShowOprDrvSheet] = useState(false);
  const [showLokasiSheet, setShowLokasiSheet] = useState(false);
  const [showKegiatanSheet, setShowKegiatanSheet] = useState(false);
  
  const lokasikerjaRedux = useSelector(state => state.lokasikerja);
  const kegiatankerjaRedux = useSelector(state => state.kegiatankerja);
  
  const textColor = mode === 'dark' ? '#ffffff' : '#1f2937';
  const labelColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  const statusOptions = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Selesai', value: 'completed' },
  ];

  const lokasiOptions = useMemo(() => {
    const defaultOption = [{ label: 'Semua Lokasi', value: 'all' }];
    
    if (!lokasikerjaRedux?.data) return defaultOption;
    
    const lokasiList = Array.isArray(lokasikerjaRedux.data) 
      ? lokasikerjaRedux.data 
      : lokasikerjaRedux.data.rows || lokasikerjaRedux.data.data || [];
    
    const options = lokasiList.map(item => ({
      label: item.nama_lokasi || item.nama || item.lokasi || item.label,
      value: item.kode_lokasi || item.kode || item.id || item.value || item.nama_lokasi || item.nama,
    }));
    
    return [...defaultOption, ...options];
  }, [lokasikerjaRedux?.data]);

  const kegiatanOptions = useMemo(() => {
    const defaultOption = [{ label: 'Semua Kegiatan', value: 'all' }];
    
    if (!kegiatankerjaRedux?.data) return defaultOption;
    
    const kegiatanList = Array.isArray(kegiatankerjaRedux.data) 
      ? kegiatankerjaRedux.data 
      : kegiatankerjaRedux.data.rows || kegiatankerjaRedux.data.data || [];
    
    const options = kegiatanList.map(item => ({
      label: item.nama_kegiatan || item.nama || item.kegiatan || item.label,
      value: item.kode_kegiatan || item.kode || item.id || item.value || item.nama_kegiatan || item.nama,
    }));
    
    return [...defaultOption, ...options];
  }, [kegiatankerjaRedux?.data]);

  const handleDateConfirm = (date) => {
    const formatted = moment(date).format('YYYY-MM-DD');
    if (showDatePicker.type === 'start') {
      onFilterChange('tanggalMulai', formatted);
    } else {
      onFilterChange('tanggalAkhir', formatted);
    }
    setShowDatePicker({ type: null, visible: false });
  };

  const handleEquipmentSelect = (kodeEquipment) => {
    onFilterChange('kodeEquipment', kodeEquipment);
  };

  const handleOprDrvSelect = (nama) => {
    onFilterChange('nama', nama);
  };

  const handleLokasiSelect = (lokasi) => {
    onFilterChange('lokasi', lokasi);
  };

  const handleKegiatanSelect = (kegiatan) => {
    onFilterChange('kegiatan', kegiatan);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? '#2a2c3e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
          }}
        >
          <VStack space={4} p={5}>
            <HStack justifyContent="space-between" alignItems="center" mb={2}>
              <Text
                fontSize="xl"
                fontFamily="Quicksand-Bold"
                color={textColor}
              >
                Filter Penugasan
              </Text>
              <TouchableOpacity onPress={onClose}>
                <CloseSquare size={28} color={labelColor} />
              </TouchableOpacity>
            </HStack>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              <VStack space={4}>
                <CustomSelect
                  label="Status"
                  value={filters.status}
                  options={statusOptions}
                  onSelect={(value) => onFilterChange('status', value)}
                  mode={mode}
                  placeholder="Pilih Status"
                />

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Kode Equipment
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEquipmentSheet(true)}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      fontSize="sm"
                      fontFamily="Poppins-Regular"
                      color={filters.kodeEquipment ? textColor : labelColor}
                    >
                      {filters.kodeEquipment || 'Pilih Equipment'}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Nama Operator/Driver
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowOprDrvSheet(true)}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      fontSize="sm"
                      fontFamily="Poppins-Regular"
                      color={filters.nama ? textColor : labelColor}
                    >
                      {filters.nama || 'Pilih Operator/Driver'}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Lokasi Kerja (PIT)
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowLokasiSheet(true)}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      fontSize="sm"
                      fontFamily="Poppins-Regular"
                      color={filters.lokasi ? textColor : labelColor}
                    >
                      {filters.lokasi || 'Pilih Lokasi Kerja'}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                    Kegiatan Kerja
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowKegiatanSheet(true)}
                    style={{
                      backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      fontSize="sm"
                      fontFamily="Poppins-Regular"
                      color={filters.kegiatan ? textColor : labelColor}
                    >
                      {filters.kegiatan || 'Pilih Kegiatan Kerja'}
                    </Text>
                    <ArrowDown2 size={16} color={labelColor} />
                  </TouchableOpacity>
                </VStack>

                <HStack space={3}>
                  <VStack space={2} flex={1}>
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                      Tanggal Mulai
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker({ type: 'start', visible: true })}
                      style={{
                        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                        borderWidth: 1,
                        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={filters.tanggalMulai ? textColor : labelColor}>
                        {filters.tanggalMulai ? moment(filters.tanggalMulai).format('DD MMM YYYY') : 'Pilih tanggal'}
                      </Text>
                      <Calendar size={18} color={labelColor} />
                    </TouchableOpacity>
                  </VStack>

                  <VStack space={2} flex={1}>
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={labelColor}>
                      Tanggal Akhir
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker({ type: 'end', visible: true })}
                      style={{
                        backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
                        borderWidth: 1,
                        borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text fontSize="sm" fontFamily="Poppins-Regular" color={filters.tanggalAkhir ? textColor : labelColor}>
                        {filters.tanggalAkhir ? moment(filters.tanggalAkhir).format('DD MMM YYYY') : 'Pilih tanggal'}
                      </Text>
                      <Calendar size={18} color={labelColor} />
                    </TouchableOpacity>
                  </VStack>
                </HStack>
              </VStack>
            </ScrollView>

            <HStack space={3} mt={4}>
              <TouchableOpacity
                onPress={onReset}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onApply}
                style={{
                  flex: 1,
                  backgroundColor: mode === 'dark' ? '#3b82f6' : '#2563eb',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text fontSize="md" fontFamily="Quicksand-Bold" color="#ffffff">
                  Terapkan Filter
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>

          <DateTimePickerModal
            isVisible={showDatePicker.visible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker({ type: null, visible: false })}
            date={showDatePicker.type === 'start' && filters.tanggalMulai 
              ? moment(filters.tanggalMulai).toDate() 
              : showDatePicker.type === 'end' && filters.tanggalAkhir
              ? moment(filters.tanggalAkhir).toDate()
              : new Date()
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <EquipmentBottomSheet
        visible={showEquipmentSheet}
        onClose={() => setShowEquipmentSheet(false)}
        onSelect={handleEquipmentSelect}
        mode={mode}
      />

      <OprDrvBottomSheet
        visible={showOprDrvSheet}
        onClose={() => setShowOprDrvSheet(false)}
        onSelect={handleOprDrvSelect}
        mode={mode}
      />

      <LokasiKerjaBottomSheet
        visible={showLokasiSheet}
        onClose={() => setShowLokasiSheet(false)}
        onSelect={handleLokasiSelect}
        mode={mode}
      />

      <KegiatanKerjaBottomSheet
        visible={showKegiatanSheet}
        onClose={() => setShowKegiatanSheet(false)}
        onSelect={handleKegiatanSelect}
        mode={mode}
      />
    </Modal>
  );
};

export default FilterPenugasanModal;
