import moment from 'moment'

export const STATUSES = [
  { id: 'beroperasi', label: 'Beroperasi', color: '#10B981' },
  { id: 'standby', label: 'Standby', color: '#F59E0B' },
  { id: 'breakdown', label: 'Breakdown', color: '#EF4444' },
]
export const CATEGORIES = [{ id: 'mining', nama: 'MINING' }, { id: 'rental', nama: 'RENTAL' }, { id: 'explorasi', nama: 'EXPLORASI' }]
export const WEATHER = ['Cerah', 'Mendung', 'Hujan'].map((value) => ({ id: value, nama: value }))
export const UNIT_CATEGORIES = ['HE', 'DT', 'Drill'].map((value) => ({ id: value, nama: value }))

export const themeColors = (mode) => mode === 'dark' ? {
  bg: '#22232B', card: '#30313C', surface: '#3A3C48', border: '#555765', text: '#F5F5F5', muted: '#B5B7C2', primary: '#F59E0B', danger: '#F87171',
} : {
  bg: '#F5F6F8', card: '#FFFFFF', surface: '#F9FAFB', border: '#E5E7EB', text: '#171717', muted: '#6B7280', primary: '#D97706', danger: '#DC2626',
}

export const normalize = (raw) => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.rows)) return raw.rows
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  return []
}

export const statusMeta = (status) => STATUSES.find((item) => item.id === String(status || '').toLowerCase()) || { label: status || '-', color: '#6B7280' }
export const shiftLabel = (id) => Number(id) === 1 ? 'Pagi' : Number(id) === 2 ? 'Malam' : '-'

export const groupActivityRows = (raw = []) => {
  const map = new Map()
  raw.forEach((source) => {
    const nested = Array.isArray(source.items) ? source.items : [source]
    const seed = nested[0] || source
    const key = source.group_key || [source.header_id || seed.header_id || source.id, source.status || seed.status].join('|')
    if (!map.has(key)) map.set(key, {
      ...seed, ...source, group_key: key,
      first_header_id: source.first_header_id || seed.header_id || source.header_id || source.id,
      status: source.status || seed.status,
      items: [], equipment_ids: [], kegiatan_names: [], material_names: [], sequence_list: [],
      start_time_min: source.start_time_min || seed.start_time, finish_time_max: source.finish_time_max || seed.finish_time,
    })
    const group = map.get(key)
    nested.forEach((item) => {
      group.items.push(item)
      if (item.equipment_id && !group.equipment_ids.includes(String(item.equipment_id))) group.equipment_ids.push(String(item.equipment_id))
      if (item.kegiatan_name && !group.kegiatan_names.includes(item.kegiatan_name)) group.kegiatan_names.push(item.kegiatan_name)
      if (item.material_name && !group.material_names.includes(item.material_name)) group.material_names.push(item.material_name)
      if (item.sequence && !group.sequence_list.includes(item.sequence)) group.sequence_list.push(item.sequence)
      if (item.start_time && moment(item.start_time).isBefore(moment(group.start_time_min))) group.start_time_min = item.start_time
      if (item.finish_time && moment(item.finish_time).isAfter(moment(group.finish_time_max))) group.finish_time_max = item.finish_time
    })
  })
  return [...map.values()].sort((a, b) => moment(b.date_ops).valueOf() - moment(a.date_ops).valueOf())
}

export const emptyFilters = { status: '', shift_id: '', ctgunit: '', date_from: '', date_to: '', lokasi_site_id: '', lokasi_pit_id: '', kontraktor: '' }
