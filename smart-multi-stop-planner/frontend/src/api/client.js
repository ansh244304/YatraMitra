const API_BASE = '/api';

let accessToken = localStorage.getItem('token') || '';

export function setAccessToken(token) {
  accessToken = token || '';
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
export function getAccessToken() { return accessToken; }

async function rawRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function request(path, options = {}) {
  const { res, data } = await rawRequest(path, options);
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  profile: (body) => api.put('/auth/profile', body),
  changePassword: (body) => api.post('/auth/change-password', body),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export const tripsApi = {
  list: () => api.get('/trips'),
  create: (trip) => api.post('/trips', trip),
  remove: (id) => api.del(`/trips/${id}`),
};

export const wishlistApi = {
  list: () => api.get('/wishlist'),
  add: (item) => api.post('/wishlist', item),
  remove: (id) => api.del(`/wishlist/${id}`),
};
export const historyApi = {
  list: () => api.get('/history'),
  add: (item) => api.post('/history', item),
  update: (id, item) => api.put(`/history/${id}`, item),
  remove: (id) => api.del(`/history/${id}`),
};
export const reviewsApi = {
  list: (destinationKey) => api.get(`/reviews${destinationKey ? `?destinationKey=${encodeURIComponent(destinationKey)}` : ''}`),
  add: (item) => api.post('/reviews', item),
  update: (id, item) => api.put(`/reviews/${id}`, item),
  remove: (id) => api.del(`/reviews/${id}`),
};
export const searchHistoryApi = {
  list: () => api.get('/search-history'),
  add: (query, filters) => api.post('/search-history', { query, filters }),
};
export const packingApi = {
  list: () => api.get('/packing'),
  generate: (payload) => api.post('/packing/generate', payload),
  save: (item) => api.post('/packing', item),
  update: (id, item) => api.put(`/packing/${id}`, item),
  remove: (id) => api.del(`/packing/${id}`),
};
export const notificationsApi = {
  list: () => api.get('/notifications'),
  read: (id) => api.put(`/notifications/${id}/read`, {}),
};
export const dashboardApi = { get: () => api.get('/dashboard') };

export const bookingsApi = {
  list: () => api.get('/bookings'),
  create: (item) => api.post('/bookings', item),
  cancel: (id) => api.del(`/bookings/${id}`),
};

export async function planTripAI(payload) { return api.post('/ai/plan', payload); }
function toQuery(params = {}) {
  return new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== '')
  ).toString();
}

export const destinationsApi = {
  search: (params = {}) => api.get(`/destinations/search?${toQuery(params)}`),
  autocomplete: (q, limit = 8) => api.get(`/destinations/autocomplete?${toQuery({ q, limit })}`),
  categories: () => api.get('/destinations/categories'),
  filters: () => api.get('/destinations/filters'),
  popular: (limit = 8) => api.get(`/destinations/popular?${toQuery({ limit })}`),
  trending: (limit = 8) => api.get(`/destinations/trending?${toQuery({ limit })}`),
  get: (identifier) => api.get(`/destinations/${encodeURIComponent(identifier)}`),
  details: (params = {}) => api.get(`/destinations/details?${toQuery(params)}`),
  attractionDetails: (params = {}) => api.get(`/destinations/attraction?${toQuery(params)}`),
  nearbyHotels: (params = {}) => api.get(`/destinations/nearby-hotels?${toQuery(params)}`),
};

export const recentlyViewedApi = {
  list: (limit = 12) => api.get(`/destinations/recently-viewed?${toQuery({ limit })}`),
  record: (slug) => api.post('/destinations/recently-viewed', { slug }),
  remove: (id) => api.del(`/destinations/recently-viewed/${id}`),
  clear: () => api.del('/destinations/recently-viewed'),
};


export const routesApi = {
  compare: (body) => api.post('/routes/compare', body),
};
