import React from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';

const StatusBadge = ({ status, size = 'medium' }) => {
    const mode = useSelector(state => state.themes)?.value || 'light';
    
    // Mapping status dengan warna dan teks
    const statusMap = {
        'ONGOING': {
            text: 'Sedang Berlangsung',
            bgColor: mode === 'dark' ? '#92400E' : '#FEF3C7',
            textColor: mode === 'dark' ? '#FEF3C7' : '#92400E'
        },
        'COMPLETED': {
            text: 'Selesai',
            bgColor: mode === 'dark' ? '#065F46' : '#D1FAE5',
            textColor: mode === 'dark' ? '#D1FAE5' : '#065F46'
        },
        'default': {
            text: 'Unknown',
            bgColor: mode === 'dark' ? '#374151' : '#F3F4F6',
            textColor: mode === 'dark' ? '#9CA3AF' : '#6B7280'
        }
    };

    const statusInfo = statusMap[status] || statusMap['default'];

    // Tentukan ukuran berdasarkan prop size
    const sizes = {
        small: {
            container: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
            text: 10
        },
        medium: {
            container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
            text: 11
        },
        large: {
            container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
            text: 12
        }
    };

    const currentSize = sizes[size] || sizes.medium;

    return (
        <View style={[
            {
                backgroundColor: statusInfo.bgColor,
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB'
            },
            currentSize.container
        ]}>
            <Text style={[
                {
                    color: statusInfo.textColor,
                    fontFamily: 'Poppins-SemiBold',
                    fontWeight: '600',
                    textAlign: 'center'
                },
                { fontSize: currentSize.text }
            ]}>
                {statusInfo.text}
            </Text>
        </View>
    );
};

export default StatusBadge;