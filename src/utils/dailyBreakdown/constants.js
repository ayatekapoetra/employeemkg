/**
 * Daily Breakdown Constants
 * Status codes, categories, and color definitions
 */

export const BREAKDOWN_STATUS = {
  WAITING: 0,
  WAITING_PART: 1,
  IN_PROGRESS: 8,
  COMPLETED: 9,
};

export const BREAKDOWN_STATUS_LABELS = {
  0: 'Tunggu Teknisi',
  1: 'Tunggu Spare Part',
  8: 'Sedang Dikerjakan',
  9: 'Selesai',
};

export const BREAKDOWN_STATUS_COLORS = {
  light: {
    0: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    1: { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
    8: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    9: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  },
  dark: {
    0: { bg: '#7f1d1d', text: '#fca5a5', border: '#991b1b' },
    1: { bg: '#7c2d12', text: '#fdba74', border: '#ea580c' },
    8: { bg: '#1e3a8a', text: '#93c5fd', border: '#3b82f6' },
    9: { bg: '#065f46', text: '#6ee7b7', border: '#10b981' },
  },
};

export const ITEM_STATUS = {
  WT: { label: 'Tunggu Teknisi', color: '#ef4444' },
  WS: { label: 'Tunggu Services', color: '#f59e0b' },
  WP: { label: 'Tunggu Spare Part', color: '#f97316' },
  WV: { label: 'Tunggu Vendor', color: '#8b5cf6' },
  WTT: { label: 'Tunggu Transport', color: '#06b6d4' },
  IP: { label: 'Sedang Dikerjakan', color: '#3b82f6' },
  DONE: { label: 'Selesai', color: '#10b981' },
};

export const KATEGORI = [
  { 
    value: 'MECHANICAL', 
    label: 'Mechanical', 
    icon: '🔧',
    color: { light: '#3b82f6', dark: '#60a5fa' },
    description: 'Kerusakan mekanik umum'
  },
  { 
    value: 'ELECTRICAL', 
    label: 'Electrical', 
    icon: '⚡',
    color: { light: '#f59e0b', dark: '#fbbf24' },
    description: 'Kerusakan sistem kelistrikan'
  },
  { 
    value: 'HYDRAULIC', 
    label: 'Hydraulic', 
    icon: '💧',
    color: { light: '#06b6d4', dark: '#22d3ee' },
    description: 'Kerusakan sistem hydraulic'
  },
  { 
    value: 'ENGINE', 
    label: 'Engine', 
    icon: '🏭',
    color: { light: '#ef4444', dark: '#f87171' },
    description: 'Kerusakan mesin/engine'
  },
  { 
    value: 'TIRE', 
    label: 'Ban/Tire', 
    icon: '🚗',
    color: { light: '#8b5cf6', dark: '#a78bfa' },
    description: 'Kerusakan ban/tire'
  },
  { 
    value: 'OTHER', 
    label: 'Lainnya', 
    icon: '🛠️',
    color: { light: '#6b7280', dark: '#9ca3af' },
    description: 'Kerusakan lainnya'
  },
];

export const FILTER_OPTIONS = {
  STATUS: [
    { value: 'all', label: 'Semua Status' },
    { value: 0, label: 'Tunggu Teknisi' },
    { value: 1, label: 'Tunggu Spare Part' },
    { value: 8, label: 'Sedang Dikerjakan' },
    { value: 9, label: 'Selesai' },
  ],
  KATEGORI: [
    { value: 'all', label: 'Semua Kategori' },
    ...KATEGORI,
  ],
};

export const QUICK_FILTERS = [
  { id: 'today', label: 'Hari Ini', icon: '📅' },
  { id: 'waiting', label: 'Menunggu', icon: '⏳', status: 0 },
  { id: 'progress', label: 'Dikerjakan', icon: '🔄', status: 8 },
  { id: 'completed', label: 'Selesai', icon: '✅', status: 9 },
];
