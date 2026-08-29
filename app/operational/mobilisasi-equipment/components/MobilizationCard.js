import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ArrowRight2, Building, Clock, Truck } from 'iconsax-react-native'
import StatusBadge from './StatusBadge'
import ProgressTrack from './ProgressTrack'
import { formatDateTime, getRouteLabel, getThemeColors } from '../utils'

export default function MobilizationCard({ item, mode = 'light', onPress }) {
  const theme = getThemeColors(mode)
  const route = getRouteLabel(item)

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 14,
          marginBottom: 12,
          shadowColor: mode === 'dark' ? '#000' : '#94A3B8',
          shadowOpacity: mode === 'dark' ? 0.25 : 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: 'bold', fontFamily: 'Poppins-Bold' }}>
              {item.document_no || `MOB-${item.id}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
              <Clock size={13} color={theme.subtitle} />
              <Text style={{ color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-Medium' }}>
                Mulai {formatDateTime(item.started_at || item.movement_date)}
              </Text>
            </View>
          </View>
          <StatusBadge status={item.status} mode={mode} />
        </View>

        <View
          style={{
            marginTop: 12,
            backgroundColor: theme.surface,
            borderRadius: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <Building size={14} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-SemiBold' }}>ASAL</Text>
              <Text style={{ color: theme.text, fontSize: 12, fontFamily: 'Quicksand-SemiBold' }} numberOfLines={2}>
                {route.origin}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Truck size={14} color={theme.success} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-SemiBold' }}>TUJUAN</Text>
              <Text style={{ color: theme.text, fontSize: 12, fontFamily: 'Quicksand-SemiBold' }} numberOfLines={2}>
                {route.destination}
              </Text>
            </View>
          </View>
        </View>

        <ProgressTrack item={item} mode={mode} />

        {!!item.notes && (
          <Text
            style={{
              marginTop: 10,
              color: theme.subtitle,
              fontSize: 11,
              fontFamily: 'Quicksand-Regular',
            }}
            numberOfLines={2}
          >
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
