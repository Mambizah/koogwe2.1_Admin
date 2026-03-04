import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_URL || 'https://web-production-8d34f.up.railway.app'

const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('koogwe_admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      // Ne pas rediriger sur la page de login elle-même
      if (!window.location.pathname.includes('login') && window.location.pathname !== '/') {
        localStorage.removeItem('koogwe_admin_token')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  // Connexion admin uniquement — rejette si rôle ≠ ADMIN
  adminLogin: (email, password) => api.post('/auth/admin-login', { email, password }),
  // Connexion générique (non utilisée par le dashboard)
  login:      (email, password) => api.post('/auth/login', { email, password }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats:       () => api.get('/admin/dashboard/stats'),
  getRecentRides: () => api.get('/admin/dashboard/rides/recent'),
  getPendingDocs: () => api.get('/admin/dashboard/documents/pending'),
}

// ── Chauffeurs ────────────────────────────────────────────────────────────────
export const driversService = {
  getAll:   ()    => api.get('/admin/drivers'),
  getOne:   (id)  => api.get(`/admin/drivers/${id}`),
  suspend:  (id)  => api.patch(`/admin/drivers/${id}/suspend`),
  activate: (id)  => api.patch(`/admin/drivers/${id}/activate`),
}

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsService = {
  getAll:  (status) => api.get(`/admin/documents${status && status !== 'ALL' ? `?status=${status}` : ''}`),
  getPending: ()     => api.get('/admin/documents?status=PENDING'),
  approve: (id)              => api.patch(`/admin/documents/${id}/approve`),
  reject:  (id, reason)      => api.patch(`/admin/documents/${id}/reject`, { reason }),
}

// ── Passagers ─────────────────────────────────────────────────────────────────
export const passengersService = {
  getAll:   ()    => api.get('/admin/passengers'),
  suspend:  (id)  => api.patch(`/admin/passengers/${id}/suspend`),
  activate: (id)  => api.patch(`/admin/passengers/${id}/activate`),
}

// ── Courses ───────────────────────────────────────────────────────────────────
export const ridesService = {
  getAll:    (limit=50) => api.get(`/admin/rides?limit=${limit}`),
  getActive: ()         => api.get('/admin/rides/active'),
}

// ── Finances ──────────────────────────────────────────────────────────────────
export const financeService = {
  getStats:        ()                 => api.get('/admin/finance/stats'),
  getChart:        (period='weekly') => api.get(`/admin/finance/chart?period=${period}`),
  getTransactions: (page=1, limit=20)=> api.get(`/admin/finance/transactions?page=${page}&limit=${limit}`),
}

// ── Panics ────────────────────────────────────────────────────────────────────
export const panicsService = {
  getAll:    () => api.get('/admin/panics').catch(() => []),
  getActive: () => api.get('/admin/panics/active').catch(() => []),
  resolve:   (id) => api.patch(`/admin/panics/${id}/resolve`).catch(() => null),
}

export const adminConfigService = {
  get:    () => api.get('/admin/config').catch(() => null),
  update: (payload) => api.patch('/admin/config', payload),
  getPricing:    () => api.get('/admin/config/pricing').catch(() => null),
  getFinancials: () => api.get('/admin/config/financials').catch(() => null),
  getSecurity:   () => api.get('/admin/config/security').catch(() => null),
  getPayments:   () => api.get('/admin/config/payments').catch(() => null),
  updatePricing:    (payload) => api.patch('/admin/config/pricing', payload),
  updateFinancials: (payload) => api.patch('/admin/config/financials', payload),
  updateSecurity:   (payload) => api.patch('/admin/config/security', payload),
  updatePayments:   (payload) => api.patch('/admin/config/payments', payload),
}

export default api