import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, TouchableOpacity, View, Modal, TextInput, Alert, Image, Platform } from 'react-native'
import { HStack, VStack, Text, Divider, Button } from 'native-base'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Calendar, Clock, TickCircle, AddSquare, Trash, TagUser, Camera, CloseCircle } from 'iconsax-react-native'

import { AppScreen, HeaderScreen, BottomSheetSelect, LoadingHauler } from '../../../src/components/common'
import { COLORS } from '../../../src/constants/colors'
import { getWorkOrderList, getWorkOrderDetail, updateWorkOrderStatus, addWorkOrderAction, deleteWorkOrderAction } from '../../../src/store/slices/workOrderSlice'
import { getKaryawan } from '../../../src/store/slices/karyawanSlice'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import ImageViewing from 'react-native-image-viewing'

const STATUS_OPTIONS = {
  WT: { label: 'Wait Teknisi', color: '#fbbf24' },
  WS: { label: 'Wait Services', color: '#f472b6' },
  WP: { label: 'Wait Part', color: '#f59e0b' },
  WV: { label: 'Wait Vendor', color: '#c084fc' },
  WTT: { label: 'Wait Transport', color: '#a78bfa' },
  IP: { label: 'In Progress', color: '#60a5fa' },
  DONE: { label: 'Selesai', color: '#34d399' },
}

export default function WorkOrderDetailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.themes)?.value || 'light'
  const { detail, loading } = useSelector((state) => state.workorder)
  const { data: karyawanList } = useSelector((state) => state.karyawan)
  

  const [statusPicker, setStatusPicker] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [datePicker, setDatePicker] = useState({ visible: false, field: null })
  const [form, setForm] = useState({ services_at: null, ready_at: null })
  const [updating, setUpdating] = useState(false)
  const [showAddAction, setShowAddAction] = useState(false)
  const [actionForm, setActionForm] = useState({ narasi: '', starttime: null, endtime: null, teknisi_id: null, photo: '' })
  const [actionPickerVisible, setActionPickerVisible] = useState(false)
  const [actionPickerField, setActionPickerField] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Image picker handler - Gallery only
  const handleImagePick = async () => {
    try {
      // Simple implementation with proper error handling
      let ImagePicker
      try {
        // Try to import expo-image-picker
        ImagePicker = require('expo-image-picker')
      } catch (e) {
        console.log('expo-image-picker not found:', e)
        Alert.alert('Info', 'Silakan install expo-image-picker:\nnpx expo install expo-image-picker\n\nAtau gunakan react-native-image-picker:\nnpm install react-native-image-picker')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      console.log('Image picker result:', result)

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0) {
          const selectedAsset = result.assets[0]
          setSelectedImage(selectedAsset)
          
          // Convert image to base64 for S3 upload
          try {
            const response = await fetch(selectedAsset.uri)
            const blob = await response.blob()
            const reader = new FileReader()
            
            reader.onloadend = () => {
              const base64Data = reader.result
              setActionForm(prev => ({ ...prev, photo: base64Data }))
              console.log('Image converted to base64:', base64Data.substring(0, 50) + '...')
            }
            
            reader.readAsDataURL(blob)
          } catch (conversionError) {
            console.log('[handleImagePick] conversion error:', conversionError)
            // Fallback to URI if conversion fails
            setActionForm(prev => ({ ...prev, photo: selectedAsset.uri }))
          }
          
          console.log('Image selected:', selectedAsset.uri)
        } else if (result.uri) {
          // For some versions, the result might be direct
          setSelectedImage({ uri: result.uri })
          
          // Convert image to base64 for S3 upload
          try {
            const response = await fetch(result.uri)
            const blob = await response.blob()
            const reader = new FileReader()
            
            reader.onloadend = () => {
              const base64Data = reader.result
              setActionForm(prev => ({ ...prev, photo: base64Data }))
              console.log('Image converted to base64:', base64Data.substring(0, 50) + '...')
            }
            
            reader.readAsDataURL(blob)
          } catch (conversionError) {
            console.log('[handleImagePick] conversion error:', conversionError)
            // Fallback to URI if conversion fails
            setActionForm(prev => ({ ...prev, photo: result.uri }))
          }
          
          console.log('Image selected (direct):', result.uri)
        }
      } else {
        console.log('User canceled image selection')
      }
    } catch (error) {
      console.log('[handleImagePick] error:', error)
      Alert.alert('Error', 'Gagal memilih foto: ' + error.message)
    }
  }

  // Calculate teknisi options at component level
  const teknisiOptions = useMemo(() => {
    let data = karyawanList || []
    if (!Array.isArray(data)) data = data?.rows || data?.data || []
    if (!data || data.length === 0) return []

    const allowed = ['teknisi', 'mekanik', 'engineer', 'teknikal', 'service', 'services', 'svc', 'maintenance', 'maint', 'teknisi lapangan', 'field technician']
    const filtered = data.filter(item => {
      const dynamicFields = Object.keys(item || {})
        .filter(key => /section|jabatan|role|position|usertype/i.test(key))
        .map(key => item[key])

      const secText = [
        item.section,
        item.section_name,
        item.sectionName,
        item.seksi,
        item.bagian,
        item.departemen,
        item.department,
        item.divisi,
        item.division,
        item.jabatan,
        item.jabatan_name,
        item.kode_jabatan,
        item.position,
        item.position_name,
        item.job_title,
        item.jobtitle,
        item.role,
        item.role_name,
        item.role_code,
        item.usertype,
        ...dynamicFields,
      ]
        .filter(Boolean)
        .map(val => val.toString().toLowerCase())
        .join(' ')
      if (!secText) return false
      return allowed.some(role => secText.includes(role))
    })

    const listToUse = filtered.length > 0
      ? filtered
      : data.filter(item => {
          const nameText = (item.nama || item.name || '').toString().toLowerCase()
          return nameText.includes('teknisi') || nameText.includes('mekanik')
        })

    const formattedOptions = listToUse
      .map(item => {
        const id = item.id?.toString() || ''
        if (!id) return null
        const nama = item.nama || item.name || ''
        const section =
          item.section_name ||
          item.section ||
          item.jabatan ||
          item.departemen ||
          item.divisi ||
          item.role ||
          item.position_name ||
          item.job_title ||
          ''
        const cabangName = item.cabang?.nama || item.cabang?.name || item.nama_cabang || ''
        const subtitle = [section, cabangName].filter(Boolean).join(' - ')
        return { id, nama, subtitle }
      })
      .filter(Boolean)

    // Also add technicians who have actions on this work order if not already in the list
    if (detail?.actions?.length > 0) {
      detail.actions.forEach(act => {
        if (act.karyawan && act.karyawan.id) {
          const existingTeknisi = formattedOptions.find(opt => opt.id === act.karyawan.id?.toString())
          if (!existingTeknisi) {
            const section = act.karyawan.jabatan || act.karyawan.posisi || act.karyawan.role || 'Teknisi'
            const cabangName = act.karyawan.cabang?.nama || act.karyawan.nama_cabang || ''
            const subtitle = [section, cabangName].filter(Boolean).join(' - ')
            formattedOptions.push({
              id: act.karyawan.id?.toString() || '',
              nama: act.karyawan.nama || '',
              subtitle
            })
          }
        }
      })
    }

    return formattedOptions
  }, [detail, karyawanList]);
  

  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1]
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280'
  const cardBg = mode === 'dark' ? '#2a2c3e' : '#ffffff'
  const cardBorder = mode === 'dark' ? '#3a3c4e' : '#e5e7eb'

  useEffect(() => {
    if (params.id) {
      dispatch(getWorkOrderDetail(params.id))
    }
  }, [params.id, dispatch])

  useEffect(() => {
    if (!karyawanList || karyawanList.length === 0) {
      dispatch(getKaryawan())
    }
  }, [karyawanList, dispatch])

  const item = detail
  const statusInfo = STATUS_OPTIONS[item?.status] || { label: item?.status || '-', color: '#e5e7eb' }

  useEffect(() => {
    if (detail) {
      setSelectedStatus(detail.status || '')
      
      // Validate dates before setting them in form
      const servicesAt = detail.services_at && moment(detail.services_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).isValid() 
        ? detail.services_at 
        : null
      const readyAt = detail.ready_at && moment(detail.ready_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).isValid() 
        ? detail.ready_at 
        : null
        
      setForm({
        services_at: servicesAt,
        ready_at: readyAt,
      })
    }
  }, [detail])

  useEffect(() => {
    if (!showAddAction) {
      setActionPickerVisible(false)
      setActionPickerField(null)
    }
  }, [showAddAction])
  

  return (
    <AppScreen>
      <HeaderScreen title="Work Order Detail" onBack={() => router.back()} onThemes onNotification />
      {
        loading ?
        <LoadingHauler/>
        :
      <ScrollView
        style={{ flex: 1, backgroundColor: mode === 'dark' ? COLORS.container.dark : COLORS.container.light }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space={3} bg={cardBg} borderRadius={14} borderWidth={1} borderColor={cardBorder} p={4} shadow={1}
          style={{ shadowColor: mode === 'dark' ? '#000' : '#d1d5db', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <VStack space={1} flex={1}>
              <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>
                {detail?.kode_wo || '-'}
              </Text>
              <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                {detail?.equipment?.kode || detail?.unit || '-'}
              </Text>
            </VStack>
            <HStack px={3} py={1} borderRadius={12} borderWidth={1} borderColor={statusInfo.color} bg={statusInfo.color + '33'}>
              <Text fontSize="xs" fontFamily="Poppins-SemiBold" color={mode === 'dark' ? '#fff' : '#0f172a'}>
                {statusInfo.label}
              </Text>
            </HStack>
          </HStack>

          <Text fontFamily="Poppins-SemiBold" fontSize="sm" color={textColor}>
            {item?.problem_issue || '-'}
          </Text>

          <HStack space={3} alignItems="center">
            <Calendar size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
              Issue: {detail?.breakdown?.date_issue ? moment(detail.breakdown.date_issue).format('DD MMM YYYY') : '-'}
            </Text>
          </HStack>
          <HStack space={3} alignItems="center">
            <Clock size={16} color={subtitleColor} />
            <Text fontSize="xs" fontFamily="Poppins-Regular" color={subtitleColor}>
              Start: {detail?.services_at ? moment(detail.services_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm') : '-'} | Ready: {detail?.ready_at ? moment(detail.ready_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm') : '-'}
            </Text>
          </HStack>
        </VStack>

        <VStack mt={4} space={3} bg={cardBg} borderRadius={14} borderWidth={1} borderColor={cardBorder} p={4}>
          <HStack justifyContent="space-between" alignItems="center" mb={1}>
            <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>
              {detail?.actions?.length || ''} Aktivitas Teknisi
            </Text>
            <HStack space={2} alignItems="center">
              <TouchableOpacity 
                style={{
                  backgroundColor: mode === 'dark' ? '#22c55e' : '#16a34a',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 5,
                }}
                onPress={() => setShowAddAction(!showAddAction)}>
                <HStack space={2}>
                  <AddSquare variant="Bulk" size={20} color={'#fff'} />
                  <Text fontFamily="Poppins-Regular" fontSize="xs" color={'#fff'}>Catatan</Text>
                </HStack>
              </TouchableOpacity>
            </HStack>
          </HStack>
          {detail?.actions?.length ? detail.actions.map((act, idx) => (
            <React.Fragment key={act.id || idx}>
              {idx > 0 && <Divider bg={cardBorder} my={2} />}
              <VStack space={2}>
                <VStack>
                  <Text fontFamily="Poppins-Regular" fontSize="sm" color={textColor}>
                    {act.narasi || '-'}
                  </Text>
                  <HStack space={2} justifyContent={'space-between'} alignItems="center">
                    <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                      {act.starttime ? moment(act.starttime, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm') : '-'}
                      {act.endtime ? ` - ${moment(act.endtime, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM, HH:mm')}` : ''}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      Alert.alert('Hapus Aksi', 'Yakin menghapus catatan ini?', [
                        { text: 'Batal', style: 'cancel' },
                        {
                          text: 'Hapus', style: 'destructive', onPress: async () => {
                            try {
                              await dispatch(deleteWorkOrderAction(act.id)).unwrap()
                            } catch (err) {
                              console.log('[deleteAction] err', err)
                            }
                          }
                        }
                      ])
                    }}>
                      <Trash size={18} color={mode === 'dark' ? '#f87171' : '#ef4444'} />
                    </TouchableOpacity>
                  </HStack>
                </VStack>
                
                {/* Display uploaded photo if available */}
                {act.photo && (
                  <TouchableOpacity 
                    onPress={() => {
                      const imageUrl = act.photo.startsWith('http') 
                        ? act.photo 
                        : `https://cdn.makkuragatama.id/${act.photo}`
                      
                      // Find all images in the actions and set current index
                      const allImages = detail.actions
                        .filter(action => action.photo)
                        .map(action => ({
                          uri: action.photo.startsWith('http') 
                            ? action.photo 
                            : `https://cdn.makkuragatama.id/${action.photo}`
                        }))
                      
                      const currentIndex = allImages.findIndex(img => img.uri === imageUrl)
                      setCurrentImageIndex(currentIndex >= 0 ? currentIndex : 0)
                      setImageViewerVisible(true)
                    }}
                  >
                    <Image
                      source={{ 
                        uri: act.photo && act.photo.startsWith('http') 
                          ? act.photo 
                          : act.photo 
                            ? `https://cdn.makkuragatama.id/${act.photo}`
                            : null
                      }}
                      style={{
                        width: '100%',
                        height: 150,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: cardBorder,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                
                <HStack space={2} alignItems={'center'}>
                  <TagUser size={14} color={subtitleColor} />
                  <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                    {act.karyawan?.nama || '-'}
                  </Text>
                </HStack>
              </VStack>
            </React.Fragment>
          )) : (
            <Text fontFamily="Poppins-Regular" fontSize="sm" color={subtitleColor}>Belum ada catatan teknisi.</Text>
          )}

          {/* Form Tambah Aksi */}
          {showAddAction && (
            <VStack mt={4} space={3}>
              <Divider bg={cardBorder} />
              <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>Tambah Aksi Baru</Text>
              
              <TouchableOpacity
                onPress={() => { setActionPickerField('starttime'); setActionPickerVisible(true) }}
                style={{ borderWidth: 1, borderColor: cardBorder, borderRadius: 12, padding: 12, backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb' }}
              >
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: subtitleColor }}>Mulai</Text>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: textColor }}>
                  {actionForm.starttime ? moment(actionForm.starttime, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM YYYY, HH:mm') : 'Set waktu mulai'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setActionPickerField('endtime'); setActionPickerVisible(true) }}
                style={{ borderWidth: 1, borderColor: cardBorder, borderRadius: 12, padding: 12, backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb' }}
              >
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: subtitleColor }}>Selesai</Text>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: textColor }}>
                  {actionForm.endtime ? moment(actionForm.endtime, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM YYYY, HH:mm') : 'Set waktu selesai'}
                </Text>
              </TouchableOpacity>

              {teknisiOptions.length > 0 ? (
              <BottomSheetSelect
                label="Teknisi"
                placeholder="Pilih teknisi"
                value={actionForm.teknisi_id?.toString() || ''}
                options={teknisiOptions}
                onChange={(id) => setActionForm(prev => ({ ...prev, teknisi_id: id }))}
                displaySubKey="subtitle"
              />
            ) : (
              karyawanList && karyawanList.length > 0 ? null : (
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: subtitleColor }}>
                  Memuat daftar teknisi...
                </Text>
              )
            )}

              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: subtitleColor, marginBottom: 6 }}>Narasi</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: cardBorder,
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  color: textColor,
                  fontFamily: 'Poppins-Regular',
                }}
                multiline
                numberOfLines={4}
                value={actionForm.narasi}
                onChangeText={(v) => setActionForm((prev) => ({ ...prev, narasi: v }))}
                placeholder="Ceritakan tindakan perbaikan"
                placeholderTextColor={subtitleColor}
              />

              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: subtitleColor, marginBottom: 6 }}>Photo</Text>
              {selectedImage ? (
                <View style={{ position: 'relative', marginBottom: 12 }}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: cardBorder,
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}
                    onPress={() => {
                      setSelectedImage(null)
                      setActionForm(prev => ({ ...prev, photo: '' }))
                    }}
                  >
                    <CloseCircle size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleImagePick}
                  style={{
                    borderWidth: 1,
                    borderColor: cardBorder,
                    borderRadius: 12,
                    padding: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb',
                    marginBottom: 12,
                  }}
                >
                  <VStack alignItems="center" space={2}>
                    <Camera size={32} color={subtitleColor} />
                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 14, color: subtitleColor }}>
                      Upload Photo
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: subtitleColor }}>
                      Opsional
                    </Text>
                  </VStack>
                </TouchableOpacity>
              )}

              <HStack space={3}>
                <Button flex={1} variant="outline" onPress={() => { 
                  setShowAddAction(false); 
                  setActionForm({ narasi: '', starttime: null, endtime: null, teknisi_id: null, photo: '' }); 
                  setSelectedImage(null) 
                }} borderColor={cardBorder} _text={{ color: subtitleColor, fontFamily: 'Poppins-SemiBold' }}>
                  Batal
                </Button>
                <Button
                  flex={1}
                  isLoading={false}
                  bg={mode === 'dark' ? '#1e40af' : '#2563eb'}
                  _pressed={{ bg: mode === 'dark' ? '#1d4ed8' : '#1d4ed8' }}
onPress={async () => {
                    try {
                      await dispatch(addWorkOrderAction({
                        id: detail.id,
                        data: {
                          narasi: actionForm.narasi,
                          starttime: actionForm.starttime,
                          endtime: actionForm.endtime,
                          teknisi_id: actionForm.teknisi_id,
                          photo: actionForm.photo,
                        },
                      })).unwrap()
                      setShowAddAction(false)
                      setActionForm({ narasi: '', starttime: null, endtime: null, teknisi_id: null, photo: '' })
                      setSelectedImage(null)
                    } catch (err) {
                      console.log('[addAction] err', err)
                    }
                  }}
                >
                  Simpan
                </Button>
              </HStack>
            </VStack>
          )}
        </VStack>

        {!showAddAction && (
        <VStack mt={4} space={3} bg={cardBg} borderRadius={14} borderWidth={1} borderColor={cardBorder} p={4}
          shadow={1} style={{ shadowColor: mode === 'dark' ? '#000' : '#d1d5db', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
        >
          <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>Update Status</Text>
          <TouchableOpacity
            onPress={() => setStatusPicker(true)}
            style={{ borderWidth: 1, borderColor: cardBorder, borderRadius: 12, padding: 12, backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb' }}
          >
            <Text fontFamily="Poppins-SemiBold" fontSize="sm" color={textColor}>{selectedStatus || 'Pilih status'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDatePicker({ visible: true, field: 'services_at' })}
            style={{ borderWidth: 1, borderColor: cardBorder, borderRadius: 12, padding: 12, backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb' }}
          >
            <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>Mulai ditangani</Text>
            <Text fontFamily="Poppins-SemiBold" fontSize="sm" color={textColor}>{form.services_at ? moment(form.services_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM YYYY, HH:mm') : 'Set waktu mulai'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDatePicker({ visible: true, field: 'ready_at' })}
            style={{ borderWidth: 1, borderColor: cardBorder, borderRadius: 12, padding: 12, backgroundColor: mode === 'dark' ? '#1f2937' : '#f9fafb' }}
          >
            <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>Selesai diperbaiki</Text>
            <Text fontFamily="Poppins-SemiBold" fontSize="sm" color={textColor}>{form.ready_at ? moment(form.ready_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).format('DD MMM YYYY, HH:mm') : 'Set waktu selesai'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={updating}
            onPress={async () => {
              if (!selectedStatus) return
              setUpdating(true)
              try {
                // Validate dates before sending
                const validatedData = {
                  status: selectedStatus,
                  services_at: form.services_at && moment(form.services_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).isValid() ? form.services_at : null,
                  ready_at: form.ready_at && moment(form.ready_at, ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).isValid() ? form.ready_at : null,
                }
                
                // If ready_at is valid, auto-set status to DONE (this will be enforced in backend too)
                if (validatedData.ready_at) {
                  validatedData.status = 'DONE'
                }
                
                await dispatch(updateWorkOrderStatus({
                  id: detail.id,
                  data: validatedData,
                })).unwrap()
              } catch (err) {
                console.log('[WorkOrderDetail] update error', err)
              } finally {
                setUpdating(false)
              }
            }}
            style={{
              backgroundColor: updating ? '#9ca3af' : (mode === 'dark' ? '#2563eb' : '#2563eb'),
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text fontFamily="Quicksand-Bold" fontSize="md" color="#ffffff">{updating ? 'Menyimpan...' : 'Update Status'}</Text>
          </TouchableOpacity>
        </VStack>
        )}
      </ScrollView>
      }

      <StatusPickerModal
        visible={statusPicker}
        onClose={() => setStatusPicker(false)}
        value={selectedStatus}
        onSelect={(val) => { setSelectedStatus(val); setStatusPicker(false) }}
        mode={mode}
      />

      <DateTimePickerModal
        isVisible={datePicker.visible}
        mode="datetime"
        date={datePicker.field && form[datePicker.field] ? moment(form[datePicker.field], ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).toDate() : new Date()}
        onConfirm={(date) => {
          setDatePicker({ visible: false, field: null })
          if (!datePicker.field) return
          setForm((prev) => ({ ...prev, [datePicker.field]: moment(date).format('YYYY-MM-DD HH:mm:ss') }))
        }}
        onCancel={() => setDatePicker({ visible: false, field: null })}
      />

      

      <DateTimePickerModal
        isVisible={actionPickerVisible && showAddAction}
        mode="datetime"
        date={actionPickerField && actionForm[actionPickerField] ? moment(actionForm[actionPickerField], ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm']).toDate() : new Date()}
        onConfirm={(date) => {
          const field = actionPickerField
          setActionPickerVisible(false)
          setActionPickerField(null)
          setActionForm((prev) => ({ ...prev, [field]: moment(date).format('YYYY-MM-DD HH:mm:ss') }))
        }}
        onCancel={() => { setActionPickerVisible(false); setActionPickerField(null) }}
      />

{/* Image Viewer Modal */}
      {detail?.actions && (
        <ImageViewing
          images={detail.actions
            .filter(action => action.photo)
            .map(action => ({
              uri: action.photo.startsWith('http') 
                ? action.photo 
                : `https://cdn.makkuragatama.id/${action.photo}`
            }))}
          imageIndex={currentImageIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
          presentationStyle="overFullScreen"
          animationType="fade"
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          zoomEnabled={true}
        />
      )}
    </AppScreen>
  )
}

function StatusPickerModal({ visible, onClose, value, onSelect, mode }) {
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1]
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280'
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff', width: '85%', borderRadius: 14, padding: 16 }}>
          <Text style={{ fontFamily: 'Quicksand-Bold', fontSize: 16, color: textColor, marginBottom: 12 }}>Pilih Status</Text>
          {Object.keys(STATUS_OPTIONS).map((code) => {
            const opt = STATUS_OPTIONS[code]
            const active = value === code
            return (
              <TouchableOpacity
                key={code}
                onPress={() => onSelect(code)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? opt.color : '#e5e7eb',
                  marginBottom: 8,
                  backgroundColor: active ? opt.color + '22' : (mode === 'dark' ? '#111827' : '#f9fafb'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor }}>{code} • {opt.label}</Text>
                {active ? <TickCircle size={18} color={opt.color} variant="Bold" /> : null}
              </TouchableOpacity>
            )
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}
