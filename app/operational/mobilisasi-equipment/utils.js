import moment from 'moment'
import { COLORS } from '../../../src/constants/colors'

export const STATUS_META = {
  DRAFT: {
    label: 'Draft',
    lightBg: '#E0E7FF',
    lightText: '#3730A3',
    darkBg: '#312E81',
    darkText: '#C7D2FE',
    accent: '#6366F1',
  },
  OPEN: {
    label: 'Open',
    lightBg: '#DBEAFE',
    lightText: '#1E40AF',
    darkBg: '#1E3A8A',
    darkText: '#BFDBFE',
    accent: '#3B82F6',
  },
  IN_TRANSIT: {
    label: 'Dalam Pengiriman',
    lightBg: '#FEF3C7',
    lightText: '#92400E',
    darkBg: '#78350F',
    darkText: '#FDE68A',
    accent: '#F59E0B',
  },
  ARRIVED: {
    label: 'Tiba',
    lightBg: '#D1FAE5',
    lightText: '#065F46',
    darkBg: '#064E3B',
    darkText: '#A7F3D0',
    accent: '#10B981',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    lightBg: '#FEE2E2',
    lightText: '#991B1B',
    darkBg: '#7F1D1D',
    darkText: '#FECACA',
    accent: '#EF4444',
  },
}

export const getStatusMeta = (status) => STATUS_META[String(status || '').toUpperCase()] || STATUS_META.DRAFT

export const getThemeColors = (mode = 'light') => ({
  mode,
  background: COLORS.container[mode],
  card: COLORS.card[mode],
  border: COLORS.line[mode][1],
  text: COLORS.teks[mode][1],
  subtitle: mode === 'dark' ? '#9CA3AF' : '#6B7280',
  muted: mode === 'dark' ? '#6B7280' : '#9CA3AF',
  primary: mode === 'dark' ? COLORS.main.dark.primary : COLORS.main.light.primary,
  success: mode === 'dark' ? COLORS.main.dark.success : COLORS.main.light.success,
  warning: mode === 'dark' ? COLORS.main.dark.warning : COLORS.main.light.warning,
  danger: mode === 'dark' ? COLORS.main.dark.danger : COLORS.main.light.danger,
  info: mode === 'dark' ? COLORS.main.dark.info : COLORS.main.light.info,
  surface: mode === 'dark' ? '#1F2937' : '#F8FAFC',
  surfaceSoft: mode === 'dark' ? '#111827' : '#F1F5F9',
  chip: mode === 'dark' ? '#374151' : '#EEF2FF',
})

export const formatDate = (value, fallback = '-') => {
  if (!value) return fallback
  const parsed = moment(value)
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : fallback
}

export const formatDateTime = (value, fallback = '-') => {
  if (!value) return fallback
  const parsed = moment(value)
  return parsed.isValid() ? parsed.format('DD MMM YYYY HH:mm') : fallback
}

export const formatNow = () => moment().format('YYYY-MM-DD HH:mm:ss')

export const getProgress = (item = {}) => {
  const draft = Number(item.draft_count || 0)
  const inTransit = Number(item.in_transit_count || 0)
  const arrived = Number(item.arrived_count || 0)
  const cancelled = Number(item.cancelled_count || 0)
  const total = Number(item.item_count || 0)
  const active = Math.max(total - cancelled, 0)
  const done = arrived
  const percent = active > 0 ? Math.round((done / active) * 100) : 0
  return { draft, inTransit, arrived, cancelled, total, active, done, percent }
}

const pickName = (...values) => values.find((value) => !!value) || '-'

export const getRouteLabel = (item = {}) => {
  const originTenant = pickName(
    item.origin_tenant?.nama,
    item.originTenant?.nama,
    item.origin_tenant?.name,
    item.originTenant?.name
  )
  const destinationTenant = pickName(
    item.destination_tenant?.nama,
    item.destinationTenant?.nama,
    item.destination_tenant?.name,
    item.destinationTenant?.name
  )
  const originBranch = pickName(
    item.origin_branch?.nama,
    item.originBranch?.nama,
    item.origin_branch?.name,
    item.originBranch?.name
  )
  const destinationBranch = pickName(
    item.destination_branch?.nama,
    item.destinationBranch?.nama,
    item.destination_branch?.name,
    item.destinationBranch?.name
  )

  return {
    origin: `${originTenant} · ${originBranch}`,
    destination: `${destinationTenant} · ${destinationBranch}`,
    originTenant,
    destinationTenant,
    originBranch,
    destinationBranch,
  }
}

export const meterTypeFromEquipment = (equipment = {}) => {
  const kategori = String(equipment.kategori || equipment.ctg || '').toUpperCase()
  if (kategori === 'DT') return 'KM'
  if (kategori === 'HE') return 'HM'
  return 'UNKNOWN'
}

// Section pengantar yang diizinkan.
// Prefix (diakhiri *) = match startsWith, selain itu exact match.
const PENGANTAR_SECTION_RULES = [
  'pengawas',
  'koordinator',
  'driver *',
  'operator',
  'checker',
  'fuelman',
  'helper *',
]

export const isPengantarSectionAllowed = (section) => {
  const value = String(section || '').trim().toLowerCase()
  if (!value) return false

  return PENGANTAR_SECTION_RULES.some((rule) => {
    const normalized = String(rule || '').trim().toLowerCase()
    if (!normalized) return false

    if (normalized.endsWith('*')) {
      const prefix = normalized.slice(0, -1).trim()
      return prefix ? value.startsWith(prefix) : false
    }

    return value === normalized
  })
}

export const filterPengantarKaryawan = (list = []) => (
  (Array.isArray(list) ? list : []).filter((item) => {
    const section = item?.section || item?.jabatan || item?.position || ''
    return isPengantarSectionAllowed(section)
  })
)
