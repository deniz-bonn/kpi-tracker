import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
    list: (params) => api.get('/deals/vl', { params }).then(r => r.data),
    get: (id) => api.get(`/deals/vl/${id}`).then(r => r.data),
    create: (data) => api.post('/deals/vl', data).then(r => r.data),
    update: (id, data) => api.put(`/deals/vl/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/deals/vl/${id}`),
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
};

export const auditApi = {
  list: (params) => api.get('/audit', { params }).then(r => r.data),
  undo: (id) => api.post(`/audit/${id}/undo`).then(r => r.data),
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
