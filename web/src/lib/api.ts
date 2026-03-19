import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('axon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('axon_token');
      localStorage.removeItem('axon_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signUp: (data: any) => api.post('/auth/signup', data),
  signIn: (data: any) => api.post('/auth/signin', data),
  signOut: () => api.post('/auth/signout'),
  getMe: () => api.get('/auth/me'),
  githubAuth: () => api.get('/auth/github'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (password: string) => api.post('/auth/reset-password', { password }),
  joinWaitlist: (email: string) => api.post('/auth/waitlist', { email }),
};

// Workspaces
export const workspaceAPI = {
  create: (data: any) => api.post('/workspaces', data),
  getAll: () => api.get('/workspaces'),
  getOne: (id: string) => api.get(`/workspaces/${id}`),
  update: (id: string, data: any) => api.put(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  saveRoutes: (id: string, routes: any[]) => api.post(`/workspaces/${id}/routes`, { routes }),
  getRoutes: (id: string) => api.get(`/workspaces/${id}/routes`),
};

// AI
export const aiAPI = {
  debug: (data: any) => api.post('/ai/debug', data),
  explain: (data: any) => api.post('/ai/explain', data),
  getUsage: () => api.get('/ai/usage'),
};

// Teams
export const teamAPI = {
  create: (data: any) => api.post('/teams', data),
  getAll: () => api.get('/teams'),
  getOne: (id: string) => api.get(`/teams/${id}`),
  delete: (id: string) => api.delete(`/teams/${id}`),
  inviteMember: (id: string, data: any) => api.post(`/teams/${id}/members`, data),
  updateMemberRole: (id: string, memberId: string, role: string) =>
    api.put(`/teams/${id}/members/${memberId}`, { role }),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/teams/${id}/members/${memberId}`),
};

// History
export const historyAPI = {
  save: (data: any) => api.post('/history', data),
  getWorkspaceHistory: (workspaceId: string, params?: any) =>
    api.get(`/history/workspace/${workspaceId}`, { params }),
  getStats: (workspaceId: string) =>
    api.get(`/history/workspace/${workspaceId}/stats`),
  getOne: (id: string) => api.get(`/history/${id}`),
  delete: (id: string) => api.delete(`/history/${id}`),
  clearWorkspace: (workspaceId: string) =>
    api.delete(`/history/workspace/${workspaceId}/clear`),
};

// Collections
export const collectionAPI = {
  create: (data: any) => api.post('/collections', data),
  getAll: (workspaceId: string) => api.get(`/collections/workspace/${workspaceId}`),
  getOne: (id: string) => api.get(`/collections/${id}`),
  update: (id: string, data: any) => api.put(`/collections/${id}`, data),
  delete: (id: string) => api.delete(`/collections/${id}`),
  addRoute: (id: string, routeId: string) =>
    api.post(`/collections/${id}/routes`, { route_id: routeId }),
  removeRoute: (id: string, routeId: string) =>
    api.delete(`/collections/${id}/routes/${routeId}`),
};

// Billing
export const billingAPI = {
  createCheckout: (plan: string) => api.post('/billing/checkout', { plan }),
  createPortal: () => api.post('/billing/portal'),
  cancel: () => api.post('/billing/cancel'),
  getBilling: () => api.get('/billing'),
};

// Notifications
export const notificationAPI = {
  getAll: (unread?: boolean) =>
    api.get('/notifications', { params: { unread } }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read/all'),
};

// Environments
export const environmentAPI = {
  create: (data: any) => api.post('/environments', data),
  getAll: (workspaceId: string) =>
    api.get(`/environments/workspace/${workspaceId}`),
  getOne: (id: string) => api.get(`/environments/${id}`),
  update: (id: string, data: any) => api.put(`/environments/${id}`, data),
  setActive: (id: string, workspaceId: string) =>
    api.put(`/environments/${id}/activate`, { workspace_id: workspaceId }),
  duplicate: (id: string) => api.post(`/environments/${id}/duplicate`),
  delete: (id: string) => api.delete(`/environments/${id}`),
};

// Docs
export const docsAPI = {
  generate: (data: any) => api.post('/docs/generate', data),
  getForWorkspace: (workspaceId: string) =>
    api.get(`/docs/workspace/${workspaceId}`),
  getPublic: (slug: string) => api.get(`/docs/public/${slug}`),
  togglePublic: (id: string) => api.put(`/docs/${id}/toggle-public`),
  exportJSON: (id: string) => api.get(`/docs/${id}/export`),
};

// Search
export const searchAPI = {
  search: (q: string, type?: string) =>
    api.get('/search', { params: { q, type } }),
};

// API Keys
export const apiKeyAPI = {
  create: (name: string) => api.post('/api-keys', { name }),
  list: () => api.get('/api-keys'),
  revoke: (id: string) => api.put(`/api-keys/${id}/revoke`),
  delete: (id: string) => api.delete(`/api-keys/${id}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenue: () => api.get('/admin/revenue'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUserPlan: (id: string, plan: string) =>
    api.put(`/admin/users/${id}/plan`, { plan }),
  banUser: (id: string) => api.delete(`/admin/users/${id}`),
  getPlans: () => api.get('/admin/plans'),
  updatePlan: (id: string, data: any) => api.put(`/admin/plans/${id}`, data),
  getWaitlist: (params?: any) => api.get('/admin/waitlist', { params }),

  // Extension analytics
  getExtensionStats: () => api.get('/admin/extension/stats'),

  // Error logs
  getErrorLogs: (params?: any) => api.get('/admin/logs', { params }),
  resolveErrorLog: (id: string) => api.put(`/admin/logs/${id}/resolve`),

  // Announcements
  getAnnouncements: () => api.get('/admin/announcements'),
  sendAnnouncement: (data: any) => api.post('/admin/announcements', data),

  // System health
  getSystemHealth: () => api.get('/admin/health'),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  deactivateCoupon: (id: string) => api.put(`/admin/coupons/${id}/deactivate`),
};