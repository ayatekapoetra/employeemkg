import React from 'react'
import { View, Text } from 'react-native'
import { getStatusMeta } from '../utils'

export default function StatusBadge({ status, mode = 'light', size = 'md' }) {
  const meta = getStatusMeta(status)
  const isDark = mode === 'dark'
  const isSm = size === 'sm'

  return (
    <View
      style={{
        backgroundColor: isDark ? meta.darkBg : meta.lightBg,
        paddingHorizontal: isSm ? 8 : 10,
        paddingVertical: isSm ? 3 : 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: `${meta.accent}33`,
      }}
    >
      <Text
        style={{
          color: isDark ? meta.darkText : meta.lightText,
          fontSize: isSm ? 10 : 11,
          fontFamily: 'Quicksand-Bold',
          letterSpacing: 0.2,
        }}
      >
        {meta.label}
      </Text>
    </View>
  )
}
