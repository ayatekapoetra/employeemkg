import React from 'react'
import { View, Text } from 'react-native'
import { getProgress, getThemeColors } from '../utils'

export default function ProgressTrack({ item, mode = 'light' }) {
  const theme = getThemeColors(mode)
  const progress = getProgress(item)

  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: theme.subtitle, fontSize: 11, fontFamily: 'Quicksand-SemiBold' }}>
          Progress Unit
        </Text>
        <Text style={{ color: theme.text, fontSize: 11, fontFamily: 'Quicksand-Bold' }}>
          {progress.done}/{progress.active || 0} tiba · {progress.percent}%
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: theme.surfaceSoft,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.min(Math.max(progress.percent, 0), 100)}%`,
            height: '100%',
            borderRadius: 999,
            backgroundColor: progress.percent >= 100 ? theme.success : theme.primary,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-Medium' }}>
          Draft {progress.draft}
        </Text>
        <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-Medium' }}>
          Transit {progress.inTransit}
        </Text>
        <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-Medium' }}>
          Tiba {progress.arrived}
        </Text>
        <Text style={{ color: theme.muted, fontSize: 10, fontFamily: 'Quicksand-Medium' }}>
          Batal {progress.cancelled}
        </Text>
      </View>
    </View>
  )
}
