import moment from 'moment';
import 'moment/locale/id';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS, KATEGORI } from './constants';

moment.locale('id');

/**
 * Get status label
 * @param {number} status - Status code (0, 1, 8, 9)
 * @returns {string} Status label
 */
export const getStatusLabel = (status) => {
  return BREAKDOWN_STATUS_LABELS[status] || 'Unknown';
};

/**
 * Get status colors based on mode
 * @param {number} status - Status code
 * @param {string} mode - Theme mode ('light' or 'dark')
 * @returns {object} Color object { bg, text, border }
 */
export const getStatusColors = (status, mode = 'light') => {
  const defaultColors = mode === 'light' 
    ? { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' }
    : { bg: '#374151', text: '#f3f4f6', border: '#4b5563' };
  
  return BREAKDOWN_STATUS_COLORS[mode]?.[status] || defaultColors;
};

/**
 * Get category data
 * @param {string} kategoriValue - Category value (MECHANICAL, ELECTRICAL, etc)
 * @returns {object} Category object or null
 */
export const getCategoryData = (kategoriValue) => {
  return KATEGORI.find(k => k.value === kategoriValue) || null;
};

/**
 * Get category icon
 * @param {string} kategoriValue - Category value
 * @returns {string} Icon emoji
 */
export const getCategoryIcon = (kategoriValue) => {
  const category = getCategoryData(kategoriValue);
  return category?.icon || '🛠️';
};

/**
 * Get category color
 * @param {string} kategoriValue - Category value
 * @param {string} mode - Theme mode
 * @returns {string} Color hex
 */
export const getCategoryColor = (kategoriValue, mode = 'light') => {
  const category = getCategoryData(kategoriValue);
  return category?.color?.[mode] || (mode === 'light' ? '#6b7280' : '#9ca3af');
};

/**
 * Format breakdown datetime
 * @param {string} datetime - ISO datetime string
 * @param {string} format - Moment format string
 * @returns {string} Formatted date
 */
export const formatBreakdownTime = (datetime, format = 'DD MMM YYYY HH:mm') => {
  if (!datetime) return '-';
  return moment(datetime).format(format);
};

/**
 * Get relative time (e.g., "2 jam yang lalu")
 * @param {string} datetime - ISO datetime string
 * @returns {string} Relative time
 */
export const getRelativeTime = (datetime) => {
  if (!datetime) return '-';
  return moment(datetime).fromNow();
};

/**
 * Calculate breakdown duration
 * @param {string} breakdownAt - Start datetime
 * @param {string} readyAt - End datetime (optional)
 * @returns {object} Duration object { days, hours, minutes, text }
 */
export const calculateDuration = (breakdownAt, readyAt = null) => {
  const formats = [
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm',
    'DD-MM-YYYY HH:mm:ss',
    'DD-MM-YYYY HH:mm',
    'YYYY-MM-DD',
    'DD-MM-YYYY',
    moment.ISO_8601,
  ];

  const start = moment(breakdownAt, formats, true);
  const end = readyAt ? moment(readyAt, formats, true) : moment();

  if (!start.isValid() || !end.isValid()) {
    return { days: 0, hours: 0, minutes: 0, text: '-' };
  }

  if (end.isBefore(start)) {
    return { days: 0, hours: 0, minutes: 0, text: '-' };
  }

  const duration = moment.duration(end.diff(start));

  // Total values
  const totalMinutes = duration.asMinutes();
  const totalHours = duration.asHours();
  const totalDays = duration.asDays();
  const totalMonths = duration.asMonths();

  // komposisi: jika totalDays >= 1, tampilkan hari + jam sisa
  // jika <1 hari, tampilkan jam + menit sisa
  let text = '-';

  const days = Math.floor(totalDays);
  const hoursRemainder = duration.hours();
  const minutes = duration.minutes();

  if (days >= 1) {
    text = `${days} hari`;
    if (hoursRemainder > 0) {
      text += ` ${hoursRemainder} jam`;
    }
  } else {
    const hoursWhole = Math.floor(totalHours);
    text = `${hoursWhole} jam`;
    if (minutes > 0) {
      text += ` ${minutes} mnt`;
    }
  }

  return { days, hours: hoursRemainder, minutes, text };
};

// helper: round to 1 decimal, but trim .0
const roundToOne = (num) => {
  const rounded = Math.round(num * 10) / 10;
  // jika .0 buang desimal
  if (Number.isInteger(rounded)) return rounded.toString();
  return rounded.toString().replace('.', ',');
};

/**
 * Validate breakdown form data
 * @param {object} data - Form data
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateBreakdownForm = (data) => {
  const errors = {};
  
  if (!data.equipment_id) {
    errors.equipment_id = 'Equipment is required';
  }
  
  if (!data.lokasi_id) {
    errors.lokasi_id = 'Location is required';
  }
  
  if (!data.breakdown_at) {
    errors.breakdown_at = 'Breakdown datetime is required';
  }

  if (!data.pengawas_id) {
    errors.pengawas_id = 'Pengawas is required';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  // Validate items array
  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one breakdown item is required';
  } else {
    const itemErrors = [];
    data.items.forEach((item, index) => {
      if (!item.problem_issue || item.problem_issue.trim() === '') {
        itemErrors.push(`Item ${index + 1}: Problem description is required`);
      }
    });
    if (itemErrors.length > 0) {
      errors.items = itemErrors.join(', ');
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format equipment name with code
 * @param {object} equipment - Equipment object
 * @returns {string} Formatted name
 */
export const formatEquipmentName = (equipment) => {
  if (!equipment) return '-';
  return equipment.kode ? `${equipment.kode} - ${equipment.nama}` : equipment.nama;
};

/**
 * Get status progress percentage
 * @param {number} status - Status code
 * @returns {number} Progress percentage (0-100)
 */
export const getStatusProgress = (status) => {
  const progressMap = {
    0: 25,   // Waiting
    1: 50,   // Waiting Part
    8: 75,   // In Progress
    9: 100,  // Completed
  };
  return progressMap[status] || 0;
};

/**
 * Group breakdowns by date
 * @param {array} breakdowns - Array of breakdown objects
 * @returns {object} Grouped breakdowns { 'YYYY-MM-DD': [...] }
 */
export const groupBreakdownsByDate = (breakdowns) => {
  if (!Array.isArray(breakdowns)) return {};
  
  return breakdowns.reduce((groups, breakdown) => {
    const date = moment(breakdown.date_issue).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(breakdown);
    return groups;
  }, {});
};

/**
 * Filter breakdowns by criteria
 * @param {array} breakdowns - Array of breakdowns
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered breakdowns
 */
export const filterBreakdowns = (breakdowns, filters) => {
  if (!Array.isArray(breakdowns)) return [];
  
  return breakdowns.filter(breakdown => {
    // Filter by status
    if (filters.status !== undefined && filters.status !== 'all' && breakdown.status !== filters.status) {
      return false;
    }
    
    // Filter by kategori
    if (filters.kategori && filters.kategori !== 'all' && breakdown.kategori !== filters.kategori) {
      return false;
    }
    
    // Filter by equipment
    if (filters.equipment_id && breakdown.equipment_id !== filters.equipment_id) {
      return false;
    }
    
    // Filter by lokasi
    if (filters.lokasi_id && breakdown.lokasi_id !== filters.lokasi_id) {
      return false;
    }
    
    // Filter by date range
    if (filters.startdate && moment(breakdown.date_issue).isBefore(filters.startdate, 'day')) {
      return false;
    }
    if (filters.enddate && moment(breakdown.date_issue).isAfter(filters.enddate, 'day')) {
      return false;
    }
    
    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchEquipment = breakdown.equipment?.kode?.toLowerCase().includes(searchLower) ||
                            breakdown.equipment?.nama?.toLowerCase().includes(searchLower);
      const matchLokasi = breakdown.lokasi?.nama?.toLowerCase().includes(searchLower);
      const matchItems = breakdown.items?.some(item => 
        item.problem_issue?.toLowerCase().includes(searchLower)
      );
      
      if (!matchEquipment && !matchLokasi && !matchItems) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Calculate statistics from breakdowns array
 * @param {array} breakdowns - Array of breakdowns
 * @returns {object} Statistics object
 */
export const calculateStatistics = (breakdowns) => {
  if (!Array.isArray(breakdowns)) {
    return {
      total: 0,
      by_status: { 0: 0, 1: 0, 8: 0, 9: 0 },
      by_kategori: {},
      total_equipment: 0,
    };
  }
  
  const stats = {
    total: breakdowns.length,
    by_status: { 0: 0, 1: 0, 8: 0, 9: 0 },
    by_kategori: {},
    total_equipment: 0,
  };
  
  const uniqueEquipment = new Set();
  
  breakdowns.forEach(breakdown => {
    // Count by status
    if (breakdown.status !== undefined) {
      stats.by_status[breakdown.status] = (stats.by_status[breakdown.status] || 0) + 1;
    }
    
    // Count by kategori
    if (breakdown.kategori) {
      stats.by_kategori[breakdown.kategori] = (stats.by_kategori[breakdown.kategori] || 0) + 1;
    }
    
    // Count unique equipment
    if (breakdown.equipment_id) {
      uniqueEquipment.add(breakdown.equipment_id);
    }
  });
  
  stats.total_equipment = uniqueEquipment.size;
  
  return stats;
};

/**
 * Debounce function - delays execution until after wait time
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return moment(date).format('DD MMM YYYY');
};

/**
 * Format datetime to readable string
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  return moment(datetime).format('DD MMM YYYY, HH:mm');
};

/**
 * Get status color
 * @param {number} status - Status code
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  const colors = {
    0: '#ef4444', // Red - Waiting
    1: '#f97316', // Orange - Waiting Part
    8: '#3b82f6', // Blue - In Progress
    9: '#22c55e', // Green - Completed
  };
  return colors[status] || '#6b7280';
};
