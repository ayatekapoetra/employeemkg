import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const CategoryBadge = ({ category, size = 'medium' }) => {
    const mode = useSelector(state => state.themes)?.value || 'light';
    
    // Default values jika category tidak tersedia
    const defaultCategory = {
        nama: 'Unknown',
        icon: 'alert-circle',
        color: '#6B7280'
    };

    const categoryName = category?.nama || defaultCategory.nama;
    const icon = category?.icon || defaultCategory.icon;
    const color = category?.color || defaultCategory.color;

    // Tentukan ukuran berdasarkan prop size
    const sizes = {
        small: {
            container: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
            icon: 12,
            text: 10
        },
        medium: {
            container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
            icon: 14,
            text: 11
        },
        large: {
            container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
            icon: 16,
            text: 12
        }
    };

    const currentSize = sizes[size] || sizes.medium;

    // Warna untuk dark mode
    const darkModeColor = color === '#EF4444' ? '#F87171' : 
                         color === '#3B82F6' ? '#60A5FA' : 
                         color === '#F59E0B' ? '#FBBF24' : 
                         color === '#8B5CF6' ? '#A78BFA' : 
                         color === '#10B981' ? '#34D399' : 
                         '#9CA3AF';

    return (
        <View style={[
            {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                borderWidth: 1,
                borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB'
            },
            currentSize.container
        ]}>
            <Ionicons 
                name={icon} 
                size={currentSize.icon} 
                color={mode === 'dark' ? darkModeColor : color} 
                style={{ marginRight: 4 }}
            />
            <Text style={[
                {
                    color: mode === 'dark' ? darkModeColor : color,
                    fontFamily: 'Poppins-SemiBold',
                    fontWeight: '600'
                },
                { fontSize: currentSize.text }
            ]}>
                {categoryName}
            </Text>
        </View>
    );
};

export default CategoryBadge;