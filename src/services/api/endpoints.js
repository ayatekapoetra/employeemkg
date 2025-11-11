export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  KARYAWAN: {
    LIST: '/karyawan',
    DETAIL: (id) => `/karyawan/${id}`,
  },

  CHECKLOG: {
    LIST: '/mobile/checklog',
    CREATE: '/mobile/checklog',
    DETAIL: (id) => `/mobile/checklog/${id}`,
    LOCATIONS: '/mobile/lokasi-checklog',
  },

  ATTENDANCE: {
    DAILY: '/mobile/attendance/daily',
    MONTHLY: '/mobile/attendance/monthly',
    MANUAL: '/mobile/attendance/manual',
  },

  LEAVE: {
    SICK: '/mobile/leave/sick',
    ANNUAL: '/mobile/leave/annual',
    PERMISSION: '/mobile/leave/permission',
  },

  TASKS: {
    LIST: '/mobile/tasks',
    CREATE: '/mobile/tasks',
    DETAIL: (id) => `/mobile/tasks/${id}`,
    MY_TASKS: '/mobile/tasks/my-tasks',
    COUNT: '/mobile/tasks/count',
  },

  APPROVAL: {
    CHECKLOG: '/mobile/approval/checklog',
    MANUAL_ATTENDANCE: '/mobile/approval/manual-attendance',
    TIMESHEET: '/mobile/approval/timesheet',
    SICK_LEAVE: '/mobile/approval/sick-leave',
    OVERTIME: '/mobile/approval/overtime',
    FUND_REQUEST: '/mobile/approval/fund-request',
    PURCHASE_REQUEST: '/mobile/approval/purchase-request',
  },

  EQUIPMENT: {
    LIST: '/equipment',
    DETAIL: (id) => `/equipment/${id}`,
    DAILY_EVENT: '/mobile/equipment/daily-event',
    TIRE_USAGE: '/mobile/equipment/tire-usage',
  },

  REPORT: {
    MAINTENANCE: '/mobile/report/maintenance',
    STANDBY: '/mobile/report/standby',
    INVENTORY: '/mobile/report/inventory',
    PURCHASING: '/mobile/report/purchasing',
    SHIPPING: '/mobile/report/shipping',
  },

  MASTER: {
    LOKASI_PIT: '/lokasi-pit',
    KEGIATAN_PIT: '/kegiatan-pit',
    GUDANG: '/gudang',
    BARANG: '/barang',
    BARANG_RACK: '/barang-rack',
    PENYEWA: '/penyewa',
    PEMASOK: '/pemasok',
    EVENT: '/event',
    SYS_OPTION: '/sys-option',
    ROLES: '/roles',
  },
};

export default API_ENDPOINTS;
