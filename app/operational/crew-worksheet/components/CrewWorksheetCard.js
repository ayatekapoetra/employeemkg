import React from 'react';
import { VStack, HStack, Text, Box, Divider, Badge, Pressable } from 'native-base';
import { View, TouchableOpacity, Alert, TextInput, Dimensions } from 'react-native';
import { COLORS } from '../../../../src/constants/colors';
import { formatTime, formatDate } from '../../../../src/utils/crewWorksheet/utils/validation';
import { Calendar, Clock, Coffee, Zap, Timer, User, FileText } from 'iconsax-react-native';

const CrewWorksheetCard = ({ 
    worksheet, 
    onEdit, 
    onDelete, 
    onView
}) => {
    const screenWidth = Dimensions.get('window').width;
    const isSmall = screenWidth < 375;
    
    const mode = worksheet.mode || 'light';
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'P': return COLORS.warning;
            case 'A': return COLORS.success;
            case 'R': return COLORS.danger;
            default: return COLORS.gray;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'P': return 'Pending';
            case 'A': return 'Approved';
            case 'R': return 'Rejected';
            default: return status;
        }
    };



    const renderActionButtons = () => {
        return (
            <HStack space={isSmall ? 1 : 1.5}>
                {onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        style={{
                            backgroundColor: COLORS.warning,
                            borderRadius: 20,
                            paddingHorizontal: isSmall ? 10 : 12,
                            paddingVertical: isSmall ? 5 : 6,
                            elevation: 2,
                            shadowColor: COLORS.warning,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                            minWidth: isSmall ? 45 : 55
                        }}>
                        <Text color="white" fontSize={isSmall ? 9 : 10} fontFamily="Quicksand-SemiBold">
                            ✏️ Edit
                        </Text>
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity
                        onPress={onDelete}
                        style={{
                            backgroundColor: COLORS.danger,
                            borderRadius: 20,
                            paddingHorizontal: isSmall ? 10 : 12,
                            paddingVertical: isSmall ? 5 : 6,
                            elevation: 2,
                            shadowColor: COLORS.danger,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                            minWidth: isSmall ? 45 : 55
                        }}>
                        <Text color="white" fontSize={isSmall ? 9 : 10} fontFamily="Quicksand-SemiBold">
                            🗑️ Del
                        </Text>
                    </TouchableOpacity>
                )}
            </HStack>
        );
    };

    return (
        <Pressable 
            onPress={onView}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 6
            }}>
            <VStack
                bg={worksheet.cardBg || '#ffffff'}
                rounded="2xl"
                borderWidth={1}
                borderColor={worksheet.cardBorder || '#e5e7eb'}
                p={isSmall ? 3 : 4}
                space={isSmall ? 2 : 2.5}
                style={{
                    backgroundColor: worksheet.cardBg || '#ffffff',
                    borderRadius: 16,
                }}>
                
                {/* Modern Header with Date and Status */}
                <HStack justifyContent="space-between" alignItems="flex-start">
                    <VStack flex={1} space={1}>
                        <HStack alignItems="center" space={2}>
                            <Box
                                width={isSmall ? 8 : 10}
                                height={isSmall ? 8 : 10}
                                rounded="full"
                                bg={getStatusColor(worksheet.status)}
                                style={{
                                    shadowColor: getStatusColor(worksheet.status),
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 2,
                                    elevation: 2
                                }}
                            />
                            <VStack>
                                <Text
                                    color={worksheet.textColor || '#1f2937'}
                                    fontFamily="Quicksand-Bold"
                                    fontSize={isSmall ? 15 : 17}
                                    lineHeight={isSmall ? 19 : 21}>
                                    {formatDate(worksheet.tanggal)}
                                </Text>
                                <HStack alignItems="center" space={1}>
                                    <User size={isSmall ? 10 : 12} color={worksheet.textColor || '#6b7280'} />
                                    <Text
                                        color={worksheet.textColor || '#6b7280'}
                                        fontFamily="Quicksand-Medium"
                                        fontSize={isSmall ? 9 : 10}
                                        lineHeight={isSmall ? 12 : 14}>
                                        {worksheet.crew?.nama || 'Unknown Crew'}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>
                    </VStack>
                    
                    {/* Modern Status Badge */}
                    <Box
                        bg={getStatusColor(worksheet.status) + (mode === 'dark' ? '30' : '20')}
                        px={isSmall ? 2 : 3}
                        py={isSmall ? 1 : 1.5}
                        rounded="full"
                        borderWidth={1}
                        borderColor={getStatusColor(worksheet.status) + (mode === 'dark' ? '50' : '40')}
                        style={{
                            shadowColor: getStatusColor(worksheet.status),
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2
                        }}>
                        <Text 
                            color={getStatusColor(worksheet.status)} 
                            fontSize={isSmall ? 8 : 9} 
                            fontFamily="Quicksand-Bold"
                            textTransform="uppercase">
                            {getStatusText(worksheet.status)}
                        </Text>
                    </Box>
                </HStack>

                {/* Modern Time Grid */}
                <VStack 
                    bg={worksheet.cardBg + (mode === 'dark' ? '10' : '02')}
                    rounded="xl"
                    p={isSmall ? 3 : 3}
                    space={isSmall ? 2 : 2.5}
                    borderWidth={0.5}
                    borderColor={worksheet.cardBorder + '30'}>
                    
                    {/* Work Time */}
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack alignItems="center" space={isSmall ? 2 : 2.5}>
                            <Box
                                width={isSmall ? 24 : 28}
                                height={isSmall ? 24 : 28}
                                rounded="xl"
                                bg={(COLORS.primary || '#1d4ed8') + (mode === 'dark' ? '30' : '15')}
                                justifyContent="center"
                                alignItems="center">
                                <Clock size={isSmall ? 12 : 14} color={COLORS.primary} />
                            </Box>
                            <VStack>
                                <Text
                                    color={worksheet.textColor || '#6b7280'}
                                    fontFamily="Quicksand-Medium"
                                    fontSize={isSmall ? 9 : 10}>
                                    Jam Kerja
                                </Text>
                                <Text
                                    color={worksheet.textColor || '#1f2937'}
                                    fontFamily="Quicksand-Bold"
                                    fontSize={isSmall ? 11 : 12}>
                                    {formatTime(worksheet.jam_mulai)} - {formatTime(worksheet.jam_selesai)}
                                </Text>
                            </VStack>
                        </HStack>
                    </HStack>
                    
                    {/* Break Time */}
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack alignItems="center" space={isSmall ? 2 : 2.5}>
                            <Box
                                width={isSmall ? 24 : 28}
                                height={isSmall ? 24 : 28}
                                rounded="xl"
                                bg={(COLORS.warning || '#f59e0b') + (mode === 'dark' ? '30' : '15')}
                                justifyContent="center"
                                alignItems="center">
                                <Coffee size={isSmall ? 12 : 14} color={COLORS.warning} />
                            </Box>
                            <VStack>
                                <Text
                                    color={worksheet.textColor || '#6b7280'}
                                    fontFamily="Quicksand-Medium"
                                    fontSize={isSmall ? 9 : 10}>
                                    Istirahat
                                </Text>
                                <Text
                                    color={worksheet.textColor || '#1f2937'}
                                    fontFamily="Quicksand-Bold"
                                    fontSize={isSmall ? 11 : 12}>
                                    {formatTime(worksheet.istirahat_mulai)} - {formatTime(worksheet.istirahat_selesai)}
                                </Text>
                            </VStack>
                        </HStack>
                    </HStack>
                    
                    {/* Productive Time */}
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack alignItems="center" space={isSmall ? 2 : 2.5}>
                            <Box
                                width={isSmall ? 24 : 28}
                                height={isSmall ? 24 : 28}
                                rounded="xl"
                                bg={(COLORS.success || '#15803d') + (mode === 'dark' ? '30' : '15')}
                                justifyContent="center"
                                alignItems="center">
                                <Zap size={isSmall ? 12 : 14} color={COLORS.success} />
                            </Box>
                            <VStack>
                                <Text
                                    color={worksheet.textColor || '#6b7280'}
                                    fontFamily="Quicksand-Medium"
                                    fontSize={isSmall ? 9 : 10}>
                                    Produktif
                                </Text>
                                <HStack alignItems="center" space={1}>
                                    <Text
                                        color={worksheet.textColor || '#1f2937'}
                                        fontFamily="Quicksand-Bold"
                                        fontSize={isSmall ? 12 : 13}>
                                        {worksheet.jam_kerja_produktif || 0}h
                                    </Text>
                                    <Box
                                        bg={COLORS.success + (mode === 'dark' ? '30' : '20')}
                                        px={isSmall ? 3 : 4}
                                        py={0.5}
                                        rounded="md">
                                        <Text color={COLORS.success} fontSize={isSmall ? 7 : 8} fontFamily="Quicksand-Bold">
                                            ⚡
                                        </Text>
                                    </Box>
                                </HStack>
                            </VStack>
                        </HStack>
                    </HStack>
                    
                    {/* Overtime */}
                    {worksheet.jam_lembur > 0 && (
                        <HStack justifyContent="space-between" alignItems="center">
                            <HStack alignItems="center" space={isSmall ? 2 : 2.5}>
                                <Box
                                    width={isSmall ? 24 : 28}
                                    height={isSmall ? 24 : 28}
                                    rounded="xl"
                                    bg={(COLORS.info || '#0284c7') + (mode === 'dark' ? '30' : '15')}
                                    justifyContent="center"
                                    alignItems="center">
                                    <Timer size={isSmall ? 12 : 14} color={COLORS.info} />
                                </Box>
                                <VStack>
                                    <Text
                                        color={worksheet.textColor || '#6b7280'}
                                        fontFamily="Quicksand-Medium"
                                        fontSize={isSmall ? 9 : 10}>
                                        Lembur
                                    </Text>
                                    <HStack alignItems="center" space={1}>
                                        <Text
                                            color={COLORS.info}
                                            fontFamily="Quicksand-Bold"
                                            fontSize={isSmall ? 12 : 13}>
                                            {worksheet.jam_lembur}h
                                        </Text>
                                        <Box
                                            bg={COLORS.info + (mode === 'dark' ? '30' : '20')}
                                            px={isSmall ? 3 : 4}
                                            py={0.5}
                                            rounded="md">
                                            <Text color={COLORS.info} fontSize={isSmall ? 7 : 8} fontFamily="Quicksand-Bold">
                                                ⏱️
                                            </Text>
                                        </Box>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </HStack>
                    )}
                </VStack>

                {/* Supervisor & Notes */}
                <HStack space={isSmall ? 2 : 3} alignItems="flex-start">
                    {/* Supervisor */}
                    <VStack flex={1} space={1}>
                        <HStack alignItems="center" space={1}>
                            <User size={isSmall ? 10 : 12} color={worksheet.textColor || '#6b7280'} />
                            <Text
                                color={worksheet.textColor || '#6b7280'}
                                fontFamily="Quicksand-Medium"
                                fontSize={isSmall ? 9 : 10}>
                                Supervisor
                            </Text>
                        </HStack>
                        <Text
                            color={worksheet.textColor || '#1f2937'}
                            fontFamily="Quicksand-SemiBold"
                            fontSize={isSmall ? 10 : 11}
                            lineHeight={isSmall ? 12 : 14}
                            numberOfLines={1}>
                            {worksheet.penanggung_jawab?.nama || 'Unknown'}
                        </Text>
                    </VStack>

                    {/* Notes Preview */}
                    <VStack flex={1.5} space={1}>
                        <HStack alignItems="center" space={1}>
                            <FileText size={isSmall ? 10 : 12} color={worksheet.textColor || '#6b7280'} />
                            <Text
                                color={worksheet.textColor || '#6b7280'}
                                fontFamily="Quicksand-Medium"
                                fontSize={isSmall ? 9 : 10}>
                                Keterangan
                            </Text>
                        </HStack>
                        <Text
                            color={worksheet.textColor || '#1f2937'}
                            fontFamily="Quicksand-Regular"
                            fontSize={isSmall ? 9 : 10}
                            lineHeight={isSmall ? 12 : 14}
                            numberOfLines={2}
                            style={{
                                backgroundColor: worksheet.cardBg + (mode === 'dark' ? '10' : '02'),
                                padding: isSmall ? 4 : 6,
                                borderRadius: 6,
                                borderLeftWidth: 3,
                                borderLeftColor: COLORS.primary
                            }}>
                            {worksheet.keterangan || '-'}
                        </Text>
                    </VStack>
                </HStack>

                {/* Modern Action Bar */}
                <HStack justifyContent="space-between" alignItems="center" pt={isSmall ? 1 : 1.5}>
                    <HStack alignItems="center" space={1}>
                        <Calendar size={isSmall ? 10 : 12} color={worksheet.textColor || '#9ca3af'} />
                        <Text
                            color={worksheet.textColor || '#9ca3af'}
                            fontFamily="Quicksand-Regular"
                            fontSize={isSmall ? 8 : 9}>
                            Tap untuk detail
                        </Text>
                    </HStack>
                    {renderActionButtons()}
                </HStack>
            </VStack>
        </Pressable>
    );
};

export default CrewWorksheetCard;
