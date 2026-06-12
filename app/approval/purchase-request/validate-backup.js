/* eslint-disable react/display-name, react-hooks/rules-of-hooks */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Archive, Box, Calendar, Coin, DollarCircle, Edit, InfoCircle, MoneyRecive, Save2, SearchNormal1, ShoppingCart, Tag, TickCircle, TruckFast, User } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { Badge, Button, Center, Divider, FormControl, HStack, Input, Pressable, ScrollView, Spinner, Text, TextArea, VStack } from 'native-base';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen } from '../../../src/components/common';
import { COLORS } from '../../../src/constants/colors';
import apiClient from '../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../src/services/api/endpoints';

moment.locale('id');

// Memoized list item components for better performance
const BarangListItem = memo(({ barang, onPress, isDark }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Quicksand-SemiBold',
            color: isDark ? '#ffffff' : '#1f2937',
            marginBottom: 4,
          }}
        >
          {barang.nama || barang.nama_barang}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-Light',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          Kode: {barang.kode || barang.kode_barang}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          color: isDark ? '#60a5fa' : '#2563eb',
          marginLeft: 8,
        }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
});

const PemasokListItem = memo(({ pemasok, onPress, isDark }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Quicksand-SemiBold',
            color: isDark ? '#ffffff' : '#1f2937',
            marginBottom: 4,
          }}
        >
          {pemasok.nama_pemasok}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          color: isDark ? '#60a5fa' : '#2563eb',
          marginLeft: 8,
        }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
});

export default function PurchaseRequestValidate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const userProfile = useSelector(state => state.userProfile)?.value || {};
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [loadingPemasok, setLoadingPemasok] = useState(false);
  const [loadingMoreBarang, setLoadingMoreBarang] = useState(false);
  const [loadingMorePemasok, setLoadingMorePemasok] = useState(false);
  const [item, setItem] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [pemasokList, setPemasokList] = useState([]);
  const [showModal, setShowModal] = useState({ visible: false, type: '', title: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [barangPage, setBarangPage] = useState(1);
  const [pemasokPage, setPemasokPage] = useState(1);
  const [hasMoreBarang, setHasMoreBarang] = useState(true);
  const [hasMorePemasok, setHasMorePemasok] = useState(true);

  const [formData, setFormData] = useState({
    barang_id: '',
    pemasok_id: '',
    qty_acc: '',
    harga: '',
    ppn: '',
    subtotal: '',
    metode: '',
  });

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const inputBg = mode === 'dark' ? '#1f2937' : '#f9fafb';

  const fetchItemDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.PURCHASE_REQUEST.DETAIL(params.roId));
      
      if (response.data?.diagnostic?.error === false) {
        const foundItem = response.data.rows.items?.find(i => i.id === parseInt(params.itemId));
        if (foundItem) {
          console.log('Found item detail:', JSON.stringify(foundItem, null, 2));
          console.log('Barang ID from item:', foundItem.barang_id);
          console.log('Pemasok ID from item:', foundItem.pemasok_id);
          
          setItem(foundItem);
          setFormData({
            barang_id: foundItem.barang_id ? foundItem.barang_id.toString() : '',
            pemasok_id: foundItem.pemasok_id ? foundItem.pemasok_id.toString() : '',
            qty_acc: foundItem.qty_acc?.toString() || foundItem.qty_req?.toString() || '',
            harga: foundItem.harga?.toString() || '',
            ppn: foundItem.ppn?.toString() || '0',
            subtotal: foundItem.subtotal?.toString() || '',
            metode: foundItem.metode || '',
          });
          
          console.log('Form data set:', {
            barang_id: foundItem.barang_id ? foundItem.barang_id.toString() : '',
            pemasok_id: foundItem.pemasok_id ? foundItem.pemasok_id.toString() : '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching item detail:', error);
      Alert.alert('Error', 'Gagal memuat data item');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBarangList = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoadingBarang(true);
      } else {
        setLoadingMoreBarang(true);
      }
      
      console.log('Fetching barang list from:', API_ENDPOINTS.BARANG.LIST, 'Page:', page);
      const response = await apiClient.get(API_ENDPOINTS.BARANG.LIST, {
        params: {
          page: page,
          limit: 25
        }
      });
      console.log('Barang response:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.diagnostic?.error === false) {
        const barangData = response.data.rows || [];
        const total = response.data.total || barangData.length;
        
        console.log('Barang list count:', barangData.length);
        console.log('Total barang available:', total);
        console.log('Current page:', page);
        
        if (barangData.length > 0) {
          console.log('First barang:', JSON.stringify(barangData[0], null, 2));
        }
        
        if (append) {
          setBarangList(prev => [...prev, ...barangData]);
        } else {
          setBarangList(barangData);
        }
        
        // Check if there's more data
        const currentTotal = append ? barangList.length + barangData.length : barangData.length;
        setHasMoreBarang(currentTotal < total && barangData.length === 25);
        
        console.log('Has more barang:', currentTotal < total && barangData.length === 25);
      } else {
        console.log('Barang API error:', response.data?.diagnostic?.message);
      }
    } catch (error) {
      console.error('Error fetching barang list:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoadingBarang(false);
      setLoadingMoreBarang(false);
    }
  };

  const fetchPemasokList = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoadingPemasok(true);
      } else {
        setLoadingMorePemasok(true);
      }
      
      console.log('Fetching pemasok list from:', API_ENDPOINTS.PEMASOK.LIST, 'Page:', page);
      const response = await apiClient.get(API_ENDPOINTS.PEMASOK.LIST, {
        params: {
          page: page,
          limit: 25
        }
      });
      console.log('Pemasok response:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.diagnostic?.error === false) {
        const pemasokData = response.data.rows || [];
        const total = response.data.total || pemasokData.length;
        
        console.log('Pemasok list count:', pemasokData.length);
        console.log('Total pemasok available:', total);
        console.log('Current page:', page);
        
        if (pemasokData.length > 0) {
          console.log('First pemasok:', JSON.stringify(pemasokData[0], null, 2));
        }
        
        if (append) {
          setPemasokList(prev => [...prev, ...pemasokData]);
        } else {
          setPemasokList(pemasokData);
        }
        
        // Check if there's more data
        const currentTotal = append ? pemasokList.length + pemasokData.length : pemasokData.length;
        setHasMorePemasok(currentTotal < total && pemasokData.length === 25);
        
        console.log('Has more pemasok:', currentTotal < total && pemasokData.length === 25);
      } else {
        console.log('Pemasok API error:', response.data?.diagnostic?.message);
      }
    } catch (error) {
      console.error('Error fetching pemasok list:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoadingPemasok(false);
      setLoadingMorePemasok(false);
    }
  };

  useEffect(() => {
    if (params.itemId && params.roId) {
      fetchItemDetail();
      fetchBarangList();
      fetchPemasokList();
    }
  }, [params.itemId, params.roId]);

  useEffect(() => {
    calculateSubtotal();
  }, [formData.qty_acc, formData.harga, formData.ppn]);

  const calculateSubtotal = () => {
    const qty = parseFloat(formData.qty_acc) || 0;
    const price = parseFloat(formData.harga) || 0;
    const ppn = parseFloat(formData.ppn) || 0;
    
    const subtotal = (qty * price) + ppn;
    setFormData(prev => ({ ...prev, subtotal: subtotal.toString() }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchItemDetail();
  };

  const handleSubmit = async () => {
    if (userProfile?.usertype !== 'procurement' && userProfile?.usertype !== 'procurment') {
      Alert.alert('Error', 'Hanya user procurement yang dapat melakukan validasi');
      return;
    }

    if (!formData.barang_id || !formData.qty_acc) {
      Alert.alert('Error', 'Barang dan Qty Disetujui harus diisi');
      return;
    }

    Alert.alert(
      'Konfirmasi Validasi',
      'Apakah Anda yakin ingin memvalidasi item ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Validasi',
          onPress: async () => {
            try {
              setSaving(true);
              
              const payload = {
                items: [
                  {
                    id: parseInt(params.itemId),
                    barang_id: parseInt(formData.barang_id),
                    pemasok_id: formData.pemasok_id ? parseInt(formData.pemasok_id) : null,
                    qty_acc: parseFloat(formData.qty_acc),
                    harga: parseFloat(formData.harga) || 0,
                    ppn: parseFloat(formData.ppn) || 0,
                    subtotal: parseFloat(formData.subtotal) || 0,
                    metode: formData.metode || null,
                  }
                ]
              };

              const response = await apiClient.put(
                API_ENDPOINTS.PURCHASE_REQUEST.VALIDATE,
                payload
              );

              if (response.data?.diagnostic?.error === false) {
                Alert.alert('Sukses', 'Item berhasil divalidasi', [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.back();
                    }
                  }
                ]);
              } else {
                Alert.alert('Error', response.data?.diagnostic?.error || 'Gagal memvalidasi item');
              }
            } catch (error) {
              console.error('Error validating item:', error);
              Alert.alert('Error', error.response?.data?.diagnostic?.error || 'Gagal memvalidasi item');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Validasi Item" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1} bg={backgroundColor}>
          <Spinner size="lg" color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
          <Text mt={2} fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
            Memuat data...
          </Text>
        </Center>
      </AppScreen>
    );
  }

  if (!item) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Validasi Item" 
          onBack={() => router.back()} 
          onThemes={true}
        />
        <Center flex={1} bg={backgroundColor}>
          <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
            Data item tidak ditemukan
          </Text>
        </Center>
      </AppScreen>
    );
  }

  const selectedBarang = barangList.find(b => b.id.toString() === formData.barang_id) || item?.barang;
  const selectedPemasok = pemasokList.find(p => p.id.toString() === formData.pemasok_id) || item?.pemasok;
  
  const qtyDiminta = parseFloat(item?.qty_req) || 0;
  const qtyDisetujui = parseFloat(formData.qty_acc) || 0;
  const hargaSatuan = parseFloat(formData.harga) || 0;
  const ppnAmount = parseFloat(formData.ppn) || 0;
  const totalHarga = (qtyDisetujui * hargaSatuan);
  const grandTotal = totalHarga + ppnAmount;

  const filteredBarangList = useMemo(() => {
    console.log('🔄 Filtering barang list...', { total: barangList.length, searchQuery });
    if (!searchQuery) return barangList;
    
    const query = searchQuery.toLowerCase();
    return barangList.filter(barang => {
      const nama = (barang.nama || barang.nama_barang || '').toLowerCase();
      const kode = (barang.kode || barang.kode_barang || '').toLowerCase();
      return nama.includes(query) || kode.includes(query);
    });
  }, [barangList, searchQuery]);

  const filteredPemasokList = useMemo(() => {
    console.log('🔄 Filtering pemasok list...', { total: pemasokList.length, searchQuery });
    if (!searchQuery) return pemasokList;
    
    const query = searchQuery.toLowerCase();
    return pemasokList.filter(pemasok => {
      const nama = (pemasok.nama_pemasok || '').toLowerCase();
      return nama.includes(query);
    });
  }, [pemasokList, searchQuery]);

  const openBottomSheet = useCallback((type, title) => {
    console.log('📂 Opening bottomsheet:', type);
    setShowModal({ visible: true, type, title });
    setSearchQuery('');
    
    // Reset pagination when opening modal
    if (type === 'barang') {
      setBarangPage(1);
      setHasMoreBarang(true);
    } else if (type === 'pemasok') {
      setPemasokPage(1);
      setHasMorePemasok(true);
    }
  }, []);

  const loadMoreBarang = useCallback(() => {
    if (!loadingMoreBarang && hasMoreBarang && !searchQuery) {
      const nextPage = barangPage + 1;
      console.log('Loading more barang, page:', nextPage);
      setBarangPage(nextPage);
      fetchBarangList(nextPage, true);
    }
  }, [loadingMoreBarang, hasMoreBarang, searchQuery, barangPage]);

  const loadMorePemasok = useCallback(() => {
    if (!loadingMorePemasok && hasMorePemasok && !searchQuery) {
      const nextPage = pemasokPage + 1;
      console.log('Loading more pemasok, page:', nextPage);
      setPemasokPage(nextPage);
      fetchPemasokList(nextPage, true);
    }
  }, [loadingMorePemasok, hasMorePemasok, searchQuery, pemasokPage]);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const handleScroll = useCallback(({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent)) {
      if (showModal.type === 'barang') {
        loadMoreBarang();
      } else if (showModal.type === 'pemasok') {
        loadMorePemasok();
      }
    }
  }, [isCloseToBottom, showModal.type, loadMoreBarang, loadMorePemasok]);

  const handleSelectItem = useCallback((item) => {
    console.log('✅ Item selected:', item.id);
    const { type } = showModal;
    
    if (type === 'barang') {
      setFormData(prev => ({ ...prev, barang_id: item.id.toString() }));
    } else if (type === 'pemasok') {
      setFormData(prev => ({ ...prev, pemasok_id: item.id.toString() }));
    }
    
    setShowModal({ visible: false, type: '', title: '' });
  }, [showModal]);

  const isDark = mode === 'dark';

  const styles = StyleSheet.create({
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Quicksand-Bold',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    modalClose: {
      fontSize: 24,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontWeight: 'bold',
    },
    searchInput: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      borderRadius: 12,
      padding: 12,
      margin: 16,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    modalList: {
      paddingHorizontal: 16,
    },
    modalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#374151' : '#f9fafb',
      borderRadius: 12,
      marginBottom: 8,
    },
    modalItemContent: {
      flex: 1,
    },
    modalItemText: {
      fontSize: 15,
      fontFamily: 'Quicksand-SemiBold',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 4,
    },
    modalItemSubtext: {
      fontSize: 12,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    modalItemArrow: {
      fontSize: 24,
      color: isDark ? '#60a5fa' : '#2563eb',
      marginLeft: 8,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginTop: 8,
    },
    loadingMore: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 8,
    },
    loadingMoreText: {
      fontSize: 13,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginLeft: 8,
    },
    endOfList: {
      padding: 20,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#e5e7eb',
      marginTop: 8,
    },
    endOfListText: {
      fontSize: 12,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#6b7280' : '#9ca3af',
      textAlign: 'center',
    },
  });

  return (
    <AppScreen>
      <HeaderScreen 
        title="Validasi Item PR" 
        onBack={() => router.back()} 
        onThemes={true}
      />
      
      <ScrollView
        flex={1}
        bg={backgroundColor}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack p={4} space={4}>
          <VStack
            bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
            p={5}
            rounded="2xl"
            space={2}
            shadow={2}
          >
            <HStack space={3} alignItems="center">
              <VStack
                bg={mode === 'dark' ? '#1e3a8a' : '#2563eb'}
                p={2.5}
                rounded="xl"
              >
                <Edit size={28} color="#ffffff" variant="Bold" />
              </VStack>
              <VStack flex={1}>
                <Text
                  fontSize="lg"
                  fontFamily="Quicksand-Bold"
                  color={mode === 'dark' ? '#ffffff' : '#1e40af'}
                >
                  Form Validasi Item
                </Text>
                <Text
                  fontSize="xs"
                  fontFamily="Poppins-Light"
                  color={mode === 'dark' ? '#dbeafe' : '#1e40af'}
                >
                  Procurement validation form
                </Text>
              </VStack>
              <Badge
                bg={mode === 'dark' ? '#92400e' : '#fef3c7'}
                rounded="lg"
                px={3}
                py={1}
                _text={{
                  fontSize: 10,
                  fontFamily: 'Quicksand-Bold',
                  color: mode === 'dark' ? '#fbbf24' : '#d97706',
                }}
              >
                NEW
              </Badge>
            </HStack>
          </VStack>

          <VStack
            bg={cardBg}
            p={4}
            rounded="2xl"
            borderWidth={1}
            borderColor={cardBorder}
            shadow={1}
            space={3}
          >
            <HStack space={2} alignItems="center">
              <Archive size={18} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                Data Item Original
              </Text>
            </HStack>
            
            <Divider bg={cardBorder} />

            <VStack space={3}>
              <VStack space={1}>
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                  Nama Barang
                </Text>
                <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                  {item.barang?.nama || item.barang?.nama_barang || item.description || 'Barang belum dipilih'}
                </Text>
                {(item.barang?.kode || item.barang?.kode_barang) && (
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Kode: {item.barang?.kode || item.barang?.kode_barang}
                  </Text>
                )}
              </VStack>

              <HStack space={2}>
                <VStack
                  flex={1}
                  bg={mode === 'dark' ? '#7c2d12' : '#fef3c7'}
                  p={3}
                  rounded="xl"
                  space={1}
                >
                  <HStack space={1} alignItems="center">
                    <ShoppingCart size={14} color={mode === 'dark' ? '#fbbf24' : '#d97706'} />
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fed7aa' : '#92400e'}>
                      Qty Diminta
                    </Text>
                  </HStack>
                  <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fbbf24' : '#d97706'}>
                    {qtyDiminta}
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fed7aa' : '#92400e'}>
                    unit
                  </Text>
                </VStack>

                <VStack
                  flex={1}
                  bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
                  p={3}
                  rounded="xl"
                  space={1}
                >
                  <HStack space={1} alignItems="center">
                    <TickCircle size={14} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                      Qty Disetujui
                    </Text>
                  </HStack>
                  <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
                    {qtyDisetujui || '-'}
                  </Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                    unit
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

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
              <Tag size={18} color={mode === 'dark' ? '#10b981' : '#059669'} variant="Bold" />
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
                    onPress={() => openBottomSheet('barang', 'Pilih Barang')}
                    bg={inputBg}
                    borderColor={selectedBarang ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : cardBorder}
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

              <FormControl>
                <FormControl.Label>
                  <HStack space={1} alignItems="center">
                    <TruckFast size={14} color={textColor} />
                    <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                      Pilih Pemasok
                    </Text>
                    <Text fontSize="xs" color={subtitleColor}>(opsional)</Text>
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
                    onPress={() => openBottomSheet('pemasok', 'Pilih Pemasok')}
                    bg={inputBg}
                    borderColor={selectedPemasok ? (mode === 'dark' ? '#1e40af' : '#dbeafe') : cardBorder}
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
                          fontFamily={selectedPemasok ? "Quicksand-SemiBold" : "Poppins-Regular"}
                          color={selectedPemasok ? textColor : subtitleColor}
                        >
                          {selectedPemasok 
                            ? (selectedPemasok.nama_pemasok || selectedPemasok.nama)
                            : 'Tap untuk pilih pemasok (opsional)'
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
                      Pemasok: {selectedPemasok.nama_pemasok}
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
                <Input
                  value={formData.qty_acc}
                  onChangeText={(value) => setFormData({ ...formData, qty_acc: value })}
                  placeholder={`Max: ${qtyDiminta} unit`}
                  keyboardType="numeric"
                  bg={inputBg}
                  borderColor={cardBorder}
                  color={textColor}
                  fontFamily="Quicksand-Bold"
                  fontSize="md"
                  py={3}
                  _focus={{
                    bg: inputBg,
                    borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                  }}
                  InputRightElement={
                    <Text fontSize="sm" fontFamily="Poppins-Regular" color={subtitleColor} mr={3}>
                      unit
                    </Text>
                  }
                />
                <FormControl.HelperText>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Qty diminta: {qtyDiminta} unit • Tersisa: {Math.max(0, qtyDiminta - qtyDisetujui)} unit
                  </Text>
                </FormControl.HelperText>
              </FormControl>
            </VStack>
          </VStack>

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
                    <Coin size={14} color={textColor} />
                    <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                      Harga Satuan
                    </Text>
                  </HStack>
                </FormControl.Label>
                <Input
                  value={formData.harga}
                  onChangeText={(value) => setFormData({ ...formData, harga: value })}
                  placeholder="0"
                  keyboardType="numeric"
                  bg={inputBg}
                  borderColor={cardBorder}
                  color={textColor}
                  fontFamily="Quicksand-Bold"
                  fontSize="md"
                  py={3}
                  _focus={{
                    bg: inputBg,
                    borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                  }}
                  InputLeftElement={
                    <Text fontSize="sm" fontFamily="Poppins-Bold" color={mode === 'dark' ? '#10b981' : '#059669'} ml={3}>
                      Rp
                    </Text>
                  }
                />
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
                <Input
                  value={formData.ppn}
                  onChangeText={(value) => setFormData({ ...formData, ppn: value })}
                  placeholder="0"
                  keyboardType="numeric"
                  bg={inputBg}
                  borderColor={cardBorder}
                  color={textColor}
                  fontFamily="Quicksand-Bold"
                  fontSize="md"
                  py={3}
                  _focus={{
                    bg: inputBg,
                    borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                  }}
                  InputLeftElement={
                    <Text fontSize="sm" fontFamily="Poppins-Bold" color={mode === 'dark' ? '#10b981' : '#059669'} ml={3}>
                      Rp
                    </Text>
                  }
                />
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
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                    Subtotal ({qtyDisetujui} × Rp {hargaSatuan.toLocaleString('id-ID')})
                  </Text>
                  <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#6ee7b7' : '#059669'}>
                    Rp {totalHarga.toLocaleString('id-ID')}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#d1fae5' : '#065f46'}>
                    PPN
                  </Text>
                  <Text fontSize="md" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#6ee7b7' : '#059669'}>
                    Rp {ppnAmount.toLocaleString('id-ID')}
                  </Text>
                </HStack>
                <Divider bg={mode === 'dark' ? '#10b981' : '#059669'} />
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
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </Text>
                </HStack>
              </VStack>

              <FormControl>
                <FormControl.Label>
                  <HStack space={1} alignItems="center">
                    <InfoCircle size={14} color={textColor} />
                    <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                      Metode Pengadaan
                    </Text>
                  </HStack>
                </FormControl.Label>
                <TextArea
                  value={formData.metode}
                  onChangeText={(value) => setFormData({ ...formData, metode: value })}
                  placeholder="Contoh: Pembelian langsung, tender, e-catalog, dll."
                  bg={inputBg}
                  borderColor={cardBorder}
                  color={textColor}
                  fontFamily="Poppins-Regular"
                  fontSize="sm"
                  h={20}
                  _focus={{
                    bg: inputBg,
                    borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                  }}
                />
              </FormControl>
            </VStack>
          </VStack>

          <VStack
            bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
            p={4}
            rounded="xl"
            space={2}
            borderWidth={1}
            borderColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
          >
            <HStack space={2} alignItems="center">
              <User size={16} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                Informasi Validasi
              </Text>
            </HStack>
            <Divider bg={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                Divalidasi oleh
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                {userProfile?.name || '-'}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                Tanggal & Waktu
              </Text>
              <Text fontSize="xs" fontFamily="Quicksand-SemiBold" color={mode === 'dark' ? '#ffffff' : '#1e40af'}>
                {moment().format('DD MMM YYYY, HH:mm')}
              </Text>
            </HStack>
          </VStack>

          <Button
            onPress={handleSubmit}
            isLoading={saving}
            isLoadingText="Memproses validasi..."
            bg={mode === 'dark' ? '#10b981' : '#059669'}
            _pressed={{ bg: mode === 'dark' ? '#065f46' : '#047857' }}
            rounded="xl"
            py={4}
            shadow={3}
            _text={{
              fontFamily: 'Quicksand-Bold',
              fontSize: 'md',
            }}
            leftIcon={<Save2 size={22} color="#ffffff" variant="Bold" />}
          >
            Validasi & Simpan Item
          </Button>

          <VStack space={1} pb={2}>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
              Pastikan semua data sudah benar sebelum validasi
            </Text>
          </VStack>
        </VStack>
      </ScrollView>

      {showModal.visible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal.visible}
          onRequestClose={() => setShowModal({ visible: false, type: '', title: '' })}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{showModal.title}</Text>
                <TouchableOpacity onPress={() => setShowModal({ visible: false, type: '', title: '' })}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Cari..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <ScrollView 
                style={styles.modalList}
                onScroll={handleScroll}
                scrollEventThrottle={400}
              >
                {showModal.type === 'barang' ? (
                  <>
                    {filteredBarangList.length === 0 ? (
                      <View style={styles.emptyState}>
                        <InfoCircle size={48} color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text style={styles.emptyStateText}>
                          {searchQuery ? 'Barang tidak ditemukan' : 'Tidak ada data barang'}
                        </Text>
                      </View>
                    ) : (
                      <>
                        {filteredBarangList.map((barang, index) => (
                          <BarangListItem
                            key={`barang-${barang.id}`}
                            barang={barang}
                            onPress={() => handleSelectItem(barang)}
                            isDark={isDark}
                          />
                        ))}
                        {loadingMoreBarang && (
                          <View style={styles.loadingMore}>
                            <Spinner size="sm" color={isDark ? '#60a5fa' : '#2563eb'} />
                            <Text style={styles.loadingMoreText}>Memuat lebih banyak...</Text>
                          </View>
                        )}
                        {!hasMoreBarang && !searchQuery && barangList.length > 0 && (
                          <View style={styles.endOfList}>
                            <Text style={styles.endOfListText}>
                              Semua data telah ditampilkan ({barangList.length} barang)
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </>
                ) : showModal.type === 'pemasok' ? (
                  <>
                    {filteredPemasokList.length === 0 ? (
                      <View style={styles.emptyState}>
                        <InfoCircle size={48} color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text style={styles.emptyStateText}>
                          {searchQuery ? 'Pemasok tidak ditemukan' : 'Tidak ada data pemasok'}
                        </Text>
                      </View>
                    ) : (
                      <>
                        {filteredPemasokList.map((pemasok, index) => (
                          <PemasokListItem
                            key={`pemasok-${pemasok.id}`}
                            pemasok={pemasok}
                            onPress={() => handleSelectItem(pemasok)}
                            isDark={isDark}
                          />
                        ))}
                        {loadingMorePemasok && (
                          <View style={styles.loadingMore}>
                            <Spinner size="sm" color={isDark ? '#60a5fa' : '#2563eb'} />
                            <Text style={styles.loadingMoreText}>Memuat lebih banyak...</Text>
                          </View>
                        )}
                        {!hasMorePemasok && !searchQuery && pemasokList.length > 0 && (
                          <View style={styles.endOfList}>
                            <Text style={styles.endOfListText}>
                              Semua data telah ditampilkan ({pemasokList.length} pemasok)
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </AppScreen>
  );
}
