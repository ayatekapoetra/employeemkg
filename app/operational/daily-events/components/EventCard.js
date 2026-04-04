import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { COLORS } from '../../../../src/constants/colors';

const EventCard = ({ event, onPress }) => {
    const router = useRouter();
    const mode = useSelector(state => state.themes)?.value || 'light';
    
    const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
    const subtitleColor = mode === 'dark' ? COLORS.teks.dark[2] : COLORS.teks.light[2];
    const cardBg = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
    const borderColor = mode === 'dark' ? COLORS.line.dark[1] : COLORS.line.light[1];
    
    const handlePress = () => {
        if (onPress) {
            onPress(event);
        } else {
            router.push(`/operational/daily-events/${event.id}`);
        }
    };

    // Format durasi
    const formatDuration = (durationMinutes) => {
        if (!durationMinutes) return '0m';
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        if (hours > 0) {
            return `${hours}j ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Status colors with high contrast
    const getStatusColor = (status) => {
        switch (status) {
            case 'ONGOING':
                return '#F59E0B'; // Amber
            case 'COMPLETED':
                return '#10B981'; // Green
            default:
                return '#6B7280'; // Gray
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ONGOING':
                return 'Berlangsung';
            case 'COMPLETED':
                return 'Selesai';
            default:
                return status || 'Unknown';
        }
    };

    // Category icon mapping
    const getCategoryIcon = (categoryName) => {
        const name = (categoryName || '').toLowerCase();
        if (name.includes('hujan')) return 'cloud-rain-outline';
        if (name.includes('breakdown') || name.includes('rusak')) return 'warning-outline';
        if (name.includes('licin') || name.includes('basah')) return 'water-outline';
        if (name.includes('refuel') || name.includes('bbm')) return 'fuel-outline';
        if (name.includes('maintenance')) return 'construct-outline';
        if (name.includes('arahan') || name.includes('tunggu')) return 'time-outline';
        return 'alert-circle-outline';
    };

    const statusColor = getStatusColor(event.status);
    const statusText = getStatusText(event.status);
    const categoryIcon = getCategoryIcon(event.category?.nama);

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={styles.cardContainer}
        >
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.12,
                        shadowRadius: 8,
                        elevation: 6,
                    }
                ]}>
                
                {/* Modern Header with High Contrast */}
                <View
                    style={[
                        styles.cardHeader,
                        {
                            backgroundColor: cardBg,
                            borderBottomColor: borderColor,
                        }
                    ]}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <View style={styles.titleContainer}>
                                <Text
                                    style={[
                                        styles.eventTitle,
                                        { color: textColor }
                                    ]}>
                                    {event.category?.nama || 'Unknown Event'}
                                </Text>
                                <Text
                                    style={[
                                        styles.eventSubtitle,
                                        { color: COLORS.main.warning }
                                    ]}>
                                    {event.date_ops ? moment(event.date_ops).format('ddd, DD MMMM YYYY') : '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Modern Status Badge with High Contrast */}
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: statusColor }
                            ]}>
                            <Text
                                style={styles.statusText}>
                                {statusText}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Enhanced Content */}
                <View style={styles.cardContent}>
                    
                    {/* Time & Duration - Enhanced */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={[styles.iconContainer, {backgroundColor: COLORS.main.warning}]}>
                                <Ionicons name="time-outline" size={16} color="#FFF" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text
                                    style={[
                                        styles.infoTitle,
                                        { color: textColor }
                                    ]}>
                                    {event.start_time ? moment(event.start_time).format('HH:mm') : '-'} 
                                    {event.finish_time ? ` - ${moment(event.finish_time).format('HH:mm')}` : ''}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoSubtitle,
                                        { color: subtitleColor }
                                    ]}>
                                    Waktu Event
                                </Text>
                            </View>
                        </View>

                        {/* Duration - Enhanced */}
                        <View style={styles.infoItem}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.main.warning }]}>
                                <Ionicons name="hourglass-outline" size={16} color="#FFF" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text
                                    style={[
                                        styles.infoTitle,
                                        { color: textColor }
                                    ]}>
                                    {formatDuration(event.duration_minutes)}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoSubtitle,
                                        { color: subtitleColor }
                                    ]}>
                                    Durasi
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Location - Enhanced */}
                    {event.location?.nama && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.main.gray }]}>
                                    <Ionicons name="location-outline" size={16} color="#FFF" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text
                                        style={[
                                            styles.infoTitle,
                                            { color: textColor }
                                        ]}>
                                        {event.location?.nama}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoSubtitle,
                                            { color: subtitleColor }
                                        ]}>
                                        Lokasi
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Description - Enhanced */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={[styles.iconContainer, {backgroundColor: COLORS.main.success}]}>
                                <Ionicons name="document-text-outline" size={16} color="#FFF" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text
                                    style={[
                                        styles.infoSubtitle,
                                        { color: subtitleColor }
                                    ]}>
                                    Keterangan
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTitle,
                                        { color: textColor }
                                    ]}
                                    numberOfLines={2}>
                                    {event.start_description || 'Tidak ada keterangan'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* User - Enhanced */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="person-outline" size={16} color="#FFF" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text
                                    style={[
                                        styles.infoSubtitle,
                                        { color: subtitleColor }
                                    ]}>
                                    Dimulai Oleh
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTitle,
                                        { color: textColor }
                                    ]}
                                    numberOfLines={1}>
                                    {event.startedBy?.nama || 'Unknown'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="person-outline" size={16} color="#FFF" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text
                                    style={[
                                        styles.infoSubtitle,
                                        { color: subtitleColor }
                                    ]}>
                                    Diselesaikan Oleh
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTitle,
                                        { color: textColor }
                                    ]}
                                    numberOfLines={1}>
                                    {event.finishedBy?.nama || '-'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginTop: 8,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    titleContainer: {
        gap: 2,
    },
    eventTitle: {
        fontSize: 18,
        fontFamily: 'Quicksand-Bold',
        fontWeight: '700',
        lineHeight: 24,
    },
    eventSubtitle: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    statusText: {
        color: 'white',
        fontSize: 13,
        fontFamily: 'Quicksand-Bold',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardContent: {
        padding: 16,
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.main.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
        gap: 4,
    },
    infoTitle: {
        fontSize: 14,
        fontFamily: 'Quicksand-Medium',
        fontWeight: '500',
        lineHeight: 18,
    },
    infoSubtitle: {
        fontSize: 11,
        fontFamily: 'Quicksand-Regular',
        lineHeight: 11,
    },
});

export default EventCard;