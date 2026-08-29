import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ArrowDown2, ArrowUp2, DocumentText, Edit2, Filter, TickCircle, TruckFast } from 'iconsax-react-native'
import { getProgress, getStatusMeta, getThemeColors } from '../utils'

const CARDS = [
  {
    key: '',
    label: 'Total',
    icon: DocumentText,
    accent: '#3B82F6',
    lightBg: '#DBEAFE',
    darkBg: '#1E3A8A',
    lightText: '#1E40AF',
    darkText: '#BFDBFE',
  },
  {
    key: 'DRAFT',
    label: 'Draft',
    icon: Edit2,
    ...getStatusMeta('DRAFT'),
  },
  {
    key: 'OPEN',
    label: 'Open',
    icon: DocumentText,
    ...getStatusMeta('OPEN'),
  },
  {
    key: 'ARRIVED',
    label: 'Tiba',
    icon: TickCircle,
    ...getStatusMeta('ARRIVED'),
  },
]

export default function SummaryStrip({
  list = [],
  mode = 'light',
  activeStatus = '',
  onSelectStatus,
  expanded = true,
  onToggleExpanded,
  onOpenFilter,
  activeFilterCount = 0,
}) {
  const theme = getThemeColors(mode)
  const filterActive = Number(activeFilterCount) > 0

  const stats = useMemo(() => {
    const base = {
      all: list.length,
      DRAFT: 0,
      OPEN: 0,
      IN_TRANSIT: 0,
      ARRIVED: 0,
      CANCELLED: 0,
      unitTotal: 0,
      unitDraft: 0,
      unitTransit: 0,
      unitArrived: 0,
    }

    list.forEach((item) => {
      const key = String(item.status || '').toUpperCase()
      if (base[key] !== undefined) base[key] += 1

      const progress = getProgress(item)
      base.unitTotal += progress.total
      base.unitDraft += progress.draft
      base.unitTransit += progress.inTransit
      base.unitArrived += progress.arrived
    })

    const unitDonePercent = base.unitTotal > 0
      ? Math.round((base.unitArrived / base.unitTotal) * 100)
      : 0

    return { ...base, unitDonePercent }
  }, [list])

  return (
    <View style={{ paddingHorizontal: 0, gap: 10 }}>
      <View
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.card,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={onToggleExpanded}
          activeOpacity={0.85}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ color: theme.text, fontFamily: 'Poppins-SemiBold', fontSize: 13 }}>
              Ringkasan Mobilisasi
            </Text>
            {!expanded && (
              <Text style={{ color: theme.subtitle, fontFamily: 'Quicksand-Medium', fontSize: 11, marginTop: 3 }}>
                {stats.all} dokumen · Draft {stats.DRAFT} · Open {stats.OPEN} · Tiba {stats.ARRIVED} · Unit {stats.unitDonePercent}%
              </Text>
            )}
            {expanded && (
              <Text style={{ color: theme.muted, fontFamily: 'Quicksand-Medium', fontSize: 11, marginTop: 2 }}>
                Ketuk kartu untuk filter cepat
              </Text>
            )}
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {expanded
              ? <ArrowUp2 size={16} color={theme.primary} />
              : <ArrowDown2 size={16} color={theme.primary} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenFilter}
          activeOpacity={0.85}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: filterActive ? theme.primary : theme.surface,
            borderWidth: 1,
            borderColor: filterActive ? theme.primary : theme.border,
          }}
        >
          <Filter size={16} color={filterActive ? '#FFFFFF' : theme.primary} variant="Bold" />
          {filterActive && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                backgroundColor: theme.danger,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
                borderWidth: 1,
                borderColor: theme.card,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 9, fontFamily: 'Quicksand-Bold' }}>
                {activeFilterCount > 9 ? '9+' : activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {expanded && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {CARDS.map((card) => {
              const Icon = card.icon
              const value = card.key === '' ? stats.all : (stats[card.key] || 0)
              const active = String(activeStatus || '') === String(card.key || '')
              const accent = card.accent || theme.primary
              const bg = mode === 'dark' ? (card.darkBg || theme.surface) : (card.lightBg || theme.chip)
              const valueColor = mode === 'dark' ? (card.darkText || theme.text) : (card.lightText || theme.text)

              return (
                <TouchableOpacity
                  key={card.key || 'all'}
                  activeOpacity={0.85}
                  onPress={() => onSelectStatus && onSelectStatus(card.key)}
                  style={{
                    width: '48%',
                    minWidth: 140,
                    flexGrow: 1,
                    borderRadius: 18,
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    backgroundColor: bg,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? accent : `${accent}33`,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      <Icon size={18} color={accent} variant={active ? 'Bold' : 'Outline'} />
                    </View>
                    {active && (
                      <View style={{ backgroundColor: accent, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Quicksand-Bold' }}>Aktif</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ marginTop: 12, color: theme.subtitle, fontSize: 12, fontFamily: 'Quicksand-SemiBold' }}>
                    {card.label}
                  </Text>
                  <Text style={{ marginTop: 2, color: valueColor, fontSize: 26, fontFamily: 'Poppins-Bold' }}>
                    {value}
                  </Text>
                  <Text style={{ marginTop: 2, color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-Medium' }}>
                    dokumen
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TruckFast size={18} color={theme.primary} variant="Bold" />
                <Text style={{ color: theme.text, fontFamily: 'Poppins-SemiBold', fontSize: 13 }}>
                  Progress Unit
                </Text>
              </View>
              <Text style={{ color: theme.primary, fontFamily: 'Quicksand-Bold', fontSize: 12 }}>
                {stats.unitDonePercent}% tiba
              </Text>
            </View>

            <View
              style={{
                marginTop: 10,
                height: 8,
                borderRadius: 999,
                backgroundColor: theme.surfaceSoft,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.min(Math.max(stats.unitDonePercent, 0), 100)}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: theme.success,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-Medium' }}>
                Total {stats.unitTotal}
              </Text>
              <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-Medium' }}>
                Draft {stats.unitDraft}
              </Text>
              <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-Medium' }}>
                Transit {stats.unitTransit}
              </Text>
              <Text style={{ color: theme.muted, fontSize: 11, fontFamily: 'Quicksand-Medium' }}>
                Tiba {stats.unitArrived}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
