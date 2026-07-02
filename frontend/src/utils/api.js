import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 20000 });

// Attach JWT from localStorage on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kpi_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Redirect to /login on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kpi_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const companiesApi = {
  list: () => api.get('/companies').then(r => r.data),
  create: (data) => api.post('/companies', data).then(r => r.data),
  update: (id, data) => api.patch(`/companies/${id}`, data).then(r => r.data),
};

export const employeesApi = {
  list: (params) => api.get('/employees', { params }).then(r => r.data),
  create: (data) => api.post('/employees', data).then(r => r.data),
  update: (id, data) => api.patch(`/employees/${id}`, data).then(r => r.data),
};

export const dealsApi = {
  nk: {
    list: (params) => api.get('/deals/nk', { params }).then(r => r.data),
    get: (id) => api.get(`/deals/nk/${id}`).then(r => r.data),
    create: (data) => api.post('/deals/nk', data).then(r => r.data),
    update: (id, data) => api.put(`/deals/nk/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/deals/nk/${id}`),
  },
  bk: {
    list: (params) => api.get('/deals/bk', { params }).then(r => r.data),
    get: (id) => api.get(`/deals/bk/${id}`).then(r => r.data),
    create: (data) => api.post('/deals/bk', data).then(r => r.data),
    update: (id, data) => api.put(`/deals/bk/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/deals/bk/${id}`),
  },
  vl: {
    list:        (params)       => api.get('/deals/vl', { params }).then(r => r.data),
    get:         (id)           => api.get(`/deals/vl/${id}`).then(r => r.data),
    create:      (data)         => api.post('/deals/vl', data).then(r => r.data),
    update:      (id, data)     => api.put(`/deals/vl/${id}`, data).then(r => r.data),
    delete:      (id)           => api.delete(`/deals/vl/${id}`),
    patchUpsale:  (id, data) => api.patch(`/deals/vl/${id}/upsale`, data).then(r => r.data),
    patchKontakt:   (id, data) => api.patch(`/deals/vl/${id}/kontakt`, data).then(r => r.data),
    importKontakt:  (rows)    => api.post('/deals/vl/import-kontakt', rows).then(r => r.data),
    importCsv:      (payload) => api.post('/deals/vl/import-csv', payload).then(r => r.data),
  },
};

export const kpisApi = {
  overview: (params) => api.get('/kpis/overview', { params }).then(r => r.data),
  monthly: (params) => api.get('/kpis/monthly', { params }).then(r => r.data),
  employees: (params) => api.get('/kpis/employees', { params }).then(r => r.data),
  targetsVsActual: (params) => api.get('/kpis/targets-vs-actual', { params }).then(r => r.data),
  dashboard: (params) => api.get('/kpis/dashboard', { params }).then(r => r.data),
};

export const monthlyTargetsApi = {
  list: (year) => api.get('/monthly-targets', { params: { year } }).then(r => r.data),
  upsert: (data) => api.post('/monthly-targets', data).then(r => r.data),
};

export const auswertungApi = {
  nk: (params) => api.get('/auswertung/nk', { params }).then(r => r.data),
  bk: (params) => api.get('/auswertung/bk', { params }).then(r => r.data),
  vl: (params) => api.get('/auswertung/vl', { params }).then(r => r.data),
  standorte: () => api.get('/auswertung/standorte').then(r => r.data),
  auftragseingang: (params) => api.get('/auswertung/auftragseingang', { params }).then(r => r.data),
};

export const targetsApi = {
  list: (params) => api.get('/targets', { params }).then(r => r.data),
  upsert: (data) => api.post('/targets', data).then(r => r.data),
};

export const adminApi = {
  listUsers: () => api.get('/admin/users').then(r => r.data),
  createUser: (data) => api.post('/admin/users', data).then(r => r.data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data).then(r => r.data),
  resendInvite: (id) => api.post(`/admin/users/${id}/resend-invite`).then(r => r.data),
  resetPassword: (id, new_password) => api.post(`/admin/users/${id}/reset-password`, { new_password }).then(r => r.data),
  loginLogs: () => api.get('/admin/login-logs').then(r => r.data),
  onlineUsers: () => api.get('/admin/online-users').then(r => r.data),
  testDailyReport: () => api.post('/admin/test-daily-report').then(r => r.data),
};

export const activityLogsApi = {
  list:   (params) => api.get('/activity-logs', { params }).then(r => r.data),
  upsert: (data)   => api.post('/activity-logs', data).then(r => r.data),
  delete: (id)     => api.delete(`/activity-logs/${id}`),
};

export const inboundDailyApi = {
  list:   (params) => api.get('/inbound-daily', { params }).then(r => r.data),
  upsert: (data)   => api.post('/inbound-daily', data).then(r => r.data),
};

export const upsaleDealsApi = {
  list:   (params) => api.get('/upsale-deals', { params }).then(r => r.data),
  create: (data)   => api.post('/upsale-deals', data).then(r => r.data),
  update: (id, data) => api.put(`/upsale-deals/${id}`, data).then(r => r.data),
  delete: (id)     => api.delete(`/upsale-deals/${id}`),
};

export const featureFlagsApi = {
  list:   ()               => api.get('/feature-flags').then(r => r.data),
  update: (feature, roles) => api.post('/feature-flags', { feature, roles }).then(r => r.data),
};

export const auditApi = {
  list: (params) => api.get('/audit', { params }).then(r => r.data),
  undo: (id) => api.post(`/audit/${id}/undo`).then(r => r.data),
};

export const backupApi = {
  exportDownload: async () => {
    const token    = localStorage.getItem('kpi_token');
    const res      = await fetch('/api/backup/export', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Export fehlgeschlagen');
    const blob     = await res.blob();
    const cd       = res.headers.get('Content-Disposition') || '';
    const match    = cd.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : `kpi-backup-${new Date().toISOString().slice(0,10)}.json`;
    const a        = document.createElement('a');
    a.href         = URL.createObjectURL(blob);
    a.download     = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  scheduledDownload: async () => {
    const token    = localStorage.getItem('kpi_token');
    const res      = await fetch('/api/backup/scheduled', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Kein automatisches Backup vorhanden');
    }
    const blob     = await res.blob();
    const cd       = res.headers.get('Content-Disposition') || '';
    const match    = cd.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : 'kpi-backup-auto.json';
    const a        = document.createElement('a');
    a.href         = URL.createObjectURL(blob);
    a.download     = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  info:          () => api.get('/backup/info').then(r => r.data),
  importBackup:  (data) => api.post('/backup/import', data).then(r => r.data),
};

export const exportApi = {
  download: async (path, filename, params = {}) => {
    const token = localStorage.getItem('kpi_token');
    const url   = `/api/export/${path}?${new URLSearchParams(params)}`;
    const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Export fehlgeschlagen');
    const blob = await res.blob();
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
