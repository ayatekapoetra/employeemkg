export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'signin-employee',
    LOGIN_MOBILE: '/auth/login-mobile',
    LOGOUT: 'auth/logout',
    REFRESH: 'auth/refresh',
    PROFILE: 'auth/profile',
  },
  
  CHECKLOG: {
    LIST: 'mobile/checklog',
    CHECK_IN: 'mobile/check-in-mobile/karyawan',
    CHECK_IN_PHOTO: 'mobile/check-in/karyawan/photo',
    CHECK_OUT: 'mobile/check-out-mobile/karyawan',
    CHECK_OUT_VERIFY: id => `mobile/check-out-mobile/${id}/verify`,
    CHECK_OUT_APPROVE: id => `mobile/check-out-mobile/${id}/approve`,
    DETAIL: id => `mobile/checklog/${id}/show`,
    TODAY: (karyawanId, pin) => `mobile/checklog-today/${karyawanId}/${pin}`,
    TODAY_APPROVAL: 'mobile/checklog-today/list-approval',
    LOCATIONS: 'mobile/lokasi-checklog',
    APPROVAL_LIST: 'mobile/checklog-approval',
    SERVER_TIME: 'server-times',
  },

  ATTENDANCE: {
    DAILY: 'mobile/attendance/daily',
    MONTHLY: 'mobile/attendance/monthly',
    SCORE_CHART: 'absensi-score-chart',
    MANUAL: 'mobile/attendance/manual',
  },

  TASKS: {
    LIST: 'mobile/penugasan',
    DETAIL: id => `mobile/penugasan/${id}`,
    CREATE: 'mobile/penugasan/create',
    UPDATE: id => `mobile/penugasan/${id}/update`,
  },

  KARYAWAN: {
    LIST: 'master/karyawan',
    OPRDRV: 'master/karyawan/oprdrv',
    DETAIL: id => `master/karyawan/${id}`,
  },

  EQUIPMENT: {
    LIST: 'master/equipment/produksi',
    DETAIL: id => `mobile/equipment/${id}`,
  },

  APPROVAL: {
    CHECKLOG: 'mobile/approval/checklog',
    TIMESHEET: 'operation/timesheet/approval/list',
    TIMESHEET_APPROVE: id => `operation/timesheet/${id}/approve`,
    TIMESHEET_REJECT: id => `operation/timesheet/${id}/reject`,
    OVERTIME: 'mobile/approval/overtime',
    SICK_LEAVE: 'mobile/approval/sick-leave',
  },
  
  TIMESHEET: {
    LIST: 'operation/timesheet/list',
    MY_LIST: 'operation/timesheet/my/list',
    APPROVAL_LIST: 'operation/timesheet/approval/list',
    DETAIL: id => `operation/timesheet/${id}`,
    CREATE: 'operation/timesheet/mobile',
    UPDATE: id => `operation/timesheet/${id}/updMobile`,
    DELETE: id => `operation/timesheet/${id}`,
    APPROVE: id => `operation/timesheet/${id}/approve`,
    REJECT: id => `operation/timesheet/${id}/reject`,
  },

  REPORTS: {
    MAINTENANCE: 'mobile/report/maintenance',
    STANDBY: 'mobile/report/standby',
    INVENTORY: 'mobile/report/inventory',
    PURCHASING: 'mobile/report/purchasing',
    SHIPPING: 'mobile/report/shipping',
  },

  BISNIS_UNIT: {
    LIST: 'master/bisnis-unit/list',
    DETAIL: id => `master/bisnis-unit/${id}`,
  },

  CABANG: {
    LIST: 'master/cabang/list',
    DETAIL: id => `master/cabang/${id}`,
  },

  GUDANG: {
    LIST: 'master/gudang/list',
    DETAIL: id => `gudang/${id}`,
  },

  BARANG: {
    LIST: 'master/barang/list',
    DETAIL: id => `master/barang/${id}`,
    CREATE: 'master/barang/create',
    UPDATE: id => `master/barang/${id}/update`,
  },

  PENYEWA: {
    LIST: 'master/penyewa/list',
    PUBLIC_LIST: 'public/penyewa/list',
    DETAIL: id => `master/penyewa/${id}`,
  },

  PEMASOK: {
    LIST: 'master/pemasok/list',
    DETAIL: id => `master/pemasok/${id}`,
  },

  LOKASI_PIT: {
    LIST: 'master/lokasi-kerja/list',
    DETAIL: id => `lokasi-kerja/${id}`,
  },

  KEGIATAN_PIT: {
    LIST: 'master/kegiatan-kerja/list',
    DETAIL: id => `master/kegiatan-kerja/${id}`,
  },

  SHIFT: {
    LIST: 'master/shift/list',
    DETAIL: id => `master/shift/${id}`,
  },

  EQUIPMENT_PLAN: {
    LIST: 'operation/equipment-plan/list',
    MY_PLANS: 'operation/equipment-plan/my-plans',
    TODAY: 'operation/equipment-plan/today',
    DETAIL: id => `operation/equipment-plan/${id}`,
    CREATE: 'operation/equipment-plan/create',
    BULK_CREATE: 'operation/equipment-plan/bulk-create',
    UPDATE: id => `operation/equipment-plan/${id}/update`,
    DELETE: id => `operation/equipment-plan/${id}`,
    ACCEPT: id => `operation/equipment-plan/${id}/accept`,
    REJECT: id => `operation/equipment-plan/${id}/reject`,
  },


  RACK: {
    LIST: 'rack-barang',
    DETAIL: id => `rack-barang/${id}`,
  },

  SYSTEM: {
    OPTIONS: 'sys-option',
  },

  PENGAJUAN: {
    LIST: 'pengajuan-dana',
    CREATE: 'pengajuan-dana',
    UPDATE: id => `pengajuan-dana/${id}`,
    DETAIL: id => `pengajuan-dana/${id}`,
    PERMISSIONS: id => `pengajuan-dana/${id}/permissions`,
    APPROVE: id => `pengajuan-dana/${id}/approve`,
    REJECT: id => `pengajuan-dana/${id}/reject`,
    VERIFY: id => `pengajuan-dana/${id}/verify`,
  },

  PURCHASE_REQUEST: {
    LIST: '/scm/purchase-request',
    DETAIL: id => `/scm/purchase-request/${id}`,
    VALIDATE: '/scm/purchase-request/validate',
    UPDATE_ITEM: '/scm/purchase-request/update-item',
    APPROVE: '/scm/purchase-request/approve',
    ROLLBACK: '/scm/purchase-request/rollback',
  },

};

export const PHOTO_BASE_URL = 'https://cdn.makkuragatama.id/';
