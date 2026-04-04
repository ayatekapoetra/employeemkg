import { CrewWorksheetConstants } from '../constants.js';

/**
 * Validate time range
 * @param {string} startTime - Time in HH:mm format
 * @param {string} endTime - Time in HH:mm format
 * @returns {string|null} Error message or null if valid
 */
export const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) {
        return null;
    }
    
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    if (end <= start) {
        return CrewWorksheetConstants.VALIDATION_MESSAGES.END_BEFORE_START;
    }
    
    return null;
};

/**
 * Parse time string to Date object
 * @param {string} timeString - Time in HH:mm format
 * @returns {Date} Date object with today's date and specified time
 */
export const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

/**
 * Calculate total hours between two times
 * @param {string} startTime - Time in HH:mm format
 * @param {string} endTime - Time in HH:mm format
 * @returns {number} Total hours (can be more than 24 for overnight)
 */
export const calculateTotalHours = (startTime, endTime) => {
    if (!startTime || !endTime) {
        return 0;
    }
    
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Handle overnight case
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return parseFloat(diffHours.toFixed(2));
};

/**
 * Calculate productive hours (work hours minus break hours)
 * @param {string} workStart - Work start time in HH:mm format
 * @param {string} workEnd - Work end time in HH:mm format
 * @param {string} breakStart - Break start time in HH:mm format
 * @param {string} breakEnd - Break end time in HH:mm format
 * @returns {number} Productive hours
 */
export const calculateProductiveHours = (workStart, workEnd, breakStart, breakEnd) => {
    const totalWorkHours = calculateTotalHours(workStart, workEnd);
    const totalBreakHours = calculateTotalHours(breakStart, breakEnd);
    
    const productiveHours = totalWorkHours - totalBreakHours;
    return Math.max(0, parseFloat(productiveHours.toFixed(2)));
};

/**
 * Calculate overtime hours
 * @param {number} productiveHours - Productive hours worked
 * @param {number} normalHours - Normal working hours (default 8)
 * @returns {number} Overtime hours
 */
export const calculateOvertimeHours = (productiveHours, normalHours = CrewWorksheetConstants.DEFAULT_WORK_HOURS) => {
    const overtime = productiveHours - normalHours;
    return Math.max(0, parseFloat(overtime.toFixed(2)));
};

/**
 * Check if break time is within work time
 * @param {string} workStart - Work start time in HH:mm format
 * @param {string} workEnd - Work end time in HH:mm format
 * @param {string} breakStart - Break start time in HH:mm format
 * @param {string} breakEnd - Break end time in HH:mm format
 * @returns {boolean} True if break time is within work time
 */
export const isBreakTimeValid = (workStart, workEnd, breakStart, breakEnd) => {
    if (!workStart || !workEnd || !breakStart || !breakEnd) {
        return false;
    }
    
    const workStartTime = parseTime(workStart);
    const workEndTime = parseTime(workEnd);
    const breakStartTime = parseTime(breakStart);
    const breakEndTime = parseTime(breakEnd);
    
    // Handle overnight work
    if (workEndTime < workStartTime) {
        workEndTime.setDate(workEndTime.getDate() + 1);
    }
    
    // Handle overnight break
    if (breakEndTime < breakStartTime) {
        breakEndTime.setDate(breakEndTime.getDate() + 1);
    }
    
    // Check if break is completely within work time
    return breakStartTime >= workStartTime && breakEndTime <= workEndTime;
};

/**
 * Format time for display
 * @param {string} timeString - Time in HH:mm format
 * @returns {string} Formatted time in HH:mm format
 */
export const formatTime = (timeString) => {
    if (!timeString) {
        return '-';
    }
    
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
};

/**
 * Format date for display
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date in DD MMM YYYY format
 */
export const formatDate = (dateString) => {
    if (!dateString) {
        return '-';
    }
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
        return '-';
    }
    
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
};

/**
 * Format duration in hours to readable format
 * @param {number} hours - Hours as decimal
 * @returns {string} Formatted duration (e.g., "2 jam 30 menit")
 */
export const formatDuration = (hours) => {
    if (typeof hours !== 'number' || isNaN(hours)) {
        return '0 jam 0 menit';
    }
    
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h === 0 && m === 0) {
        return '0 jam 0 menit';
    }
    
    if (h === 0) {
        return `${m} menit`;
    }
    
    if (m === 0) {
        return `${h} jam`;
    }
    
    return `${h} jam ${m} menit`;
};

/**
 * Get status color for UI
 * @param {string} status - Status code ('P', 'A', 'R')
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
    const colors = CrewWorksheetConstants.STATUS_COLORS || {};
    return colors[status] || colors.P || '#6b7280';
};

/**
 * Get status text for display
 * @param {string} status - Status code ('P', 'A', 'R')
 * @returns {string} Status text
 */
export const getStatusText = (status) => {
    return CrewWorksheetConstants.STATUS_TEXT[status] || status;
};

/**
 * Validate crew worksheet data
 * @param {object} data - Worksheet data
 * @returns {object} Validation result { isValid: boolean, errors: object }
 */
export const validateWorksheetData = (data) => {
    const errors = {};
    
    // Required fields
    if (!data.tanggal) {
        errors.tanggal = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (!data.jam_mulai) {
        errors.jam_mulai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (!data.jam_selesai) {
        errors.jam_selesai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (!data.istirahat_mulai) {
        errors.istirahat_mulai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (!data.istirahat_selesai) {
        errors.istirahat_selesai = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (!data.spv_id) {
        errors.spv_id = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    if (!data.keterangan || data.keterangan.trim().length === 0) {
        errors.keterangan = CrewWorksheetConstants.VALIDATION_MESSAGES.REQUIRED;
    }
    
    // Time validations
    if (data.jam_mulai && data.jam_selesai) {
        const workTimeError = validateTimeRange(data.jam_mulai, data.jam_selesai);
        if (workTimeError) {
            errors.jam_selesai = workTimeError;
        }
    }
    
    if (data.istirahat_mulai && data.istirahat_selesai) {
        const breakTimeError = validateTimeRange(data.istirahat_mulai, data.istirahat_selesai);
        if (breakTimeError) {
            errors.istirahat_selesai = breakTimeError;
        }
    }
    
    if (data.jam_mulai && data.jam_selesai && data.istirahat_mulai && data.istirahat_selesai) {
        if (!isBreakTimeValid(data.jam_mulai, data.jam_selesai, data.istirahat_mulai, data.istirahat_selesai)) {
            errors.istirahat_mulai = CrewWorksheetConstants.VALIDATION_MESSAGES.BREAK_OUTSIDE_WORK;
        }
    }
    
    // Numeric validation
    if (data.jam_kerja_normal && (isNaN(data.jam_kerja_normal) || data.jam_kerja_normal <= 0)) {
        errors.jam_kerja_normal = 'Jam kerja normal harus lebih dari 0';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
