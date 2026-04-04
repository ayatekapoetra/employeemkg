export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    LOGIN_MOBILE: 'auth/login-mobile',
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
    DAILY: '/attendances/daily',
    MONTHLY: 'attendances/monthly',
    DAILY_DETAIL: 'attendances/daily-detail',
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
    LIST: '/master/karyawan',
    OPRDRV: '/master/karyawan/oprdrv',
    DETAIL: id => `/master/karyawan/${id}`,
  },

  EQUIPMENT: {
    LIST: 'master/equipment/produksi',
    DETAIL: id => `mobile/equipment/${id}`,
  },

  BREAKDOWN: {
    LIST: 'operation/daily-breakdown/list',
    MY_LIST: 'operation/daily-breakdown/my-list',
    TODAY: 'operation/daily-breakdown/today',
    STATISTICS: 'operation/daily-breakdown/statistics',
    DETAIL: id => `operation/daily-breakdown/${id}`,
    CREATE: 'operation/daily-breakdown/create',
    UPDATE: id => `operation/daily-breakdown/${id}/update`,
    DELETE: id => `operation/daily-breakdown/${id}/destroy`
  },

  ACTIVITY_PLAN: {
    LIST: 'operation/activity-plan/list',
    DETAIL: id => `operation/activity-plan/${id}`,
    CREATE: 'operation/activity-plan/create',
    BULK_CREATE: 'operation/activity-plan/bulk-create',
    UPDATE: id => `operation/activity-plan/${id}/update`,
    DELETE: id => `operation/activity-plan/${id}/destroy`,
  },

  WORK_ORDER: {
    LIST: 'operation/work-order/list',
    SHOW: (id) => `operation/work-order/${id}/show`,
    UPDATE: (id) => `operation/work-order/${id}/update`,
    ADD_ACTION: (id) => `operation/work-order/${id}/actions`,
    DELETE_ACTION: (actionId) => `operation/work-order/actions/${actionId}/delete`,
  },

  CREW_WORKSHEET: {
    LIST: 'operation/crew-worksheet/my-list',
    APPROVAL_LIST: 'operation/crew-worksheet/approval-list',
    DETAIL: id => `operation/crew-worksheet/${id}`,
    CREATE: 'operation/crew-worksheet/create',
    UPDATE: id => `operation/crew-worksheet/${id}/update`,
    DELETE: id => `operation/crew-worksheet/${id}/destroy`,
    APPROVE: id => `operation/crew-worksheet/${id}/approve`,
    REJECT: id => `operation/crew-worksheet/${id}/reject`,
    STATS: 'operation/crew-worksheet/stats',
    BY_SUPERVISOR: 'operation/crew-worksheet/by-supervisor',
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
    APPROVAL_LIST_COUNT: 'operation/timesheet/approval/list-count',
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
    DETAIL: id => `master/gudang/${id}`,
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
    LIST: '/master/pemasok/list',
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



  PENGAJUAN: {
    LIST: 'pengajuan-dana',
    APPROVAL_LIST_COUNT: 'pengajuan-dana/approval-count',
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

  EVENT: {
    LIST: '/event/list',
    CATEGORIES: '/event/categories',
    DETAIL: id => `/event/${id}`,
    CREATE: '/event/create',
    UPDATE: id => `/event/${id}`,
    FINISH: id => `/event/${id}/finish`,
    DELETE: id => `/event/${id}/destroy`,
  },

};

export const PHOTO_BASE_URL = 'https://cdn.makkuragatama.id/';
