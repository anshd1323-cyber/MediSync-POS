import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Add a request interceptor to append the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/profile'),
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
};

export const consultationAPI = {
  create: (doctorId, scheduledAt, paymentStatus, fee) => api.post('/consultations', { doctorId, scheduledAt, paymentStatus, fee }),
  getAll: () => api.get('/consultations'),
  updateStatus: (id, status) => api.patch(`/consultations/${id}/status`, { status }),
  updateNotes: (id, notes) => api.patch(`/consultations/${id}/notes`, { notes }),
  getMessages: (id) => api.get(`/consultations/${id}/messages`),
  sendMessage: (id, message) => api.post(`/consultations/${id}/messages`, { message }),
  finalize: (id, data) => api.post(`/consultations/${id}/finalize`, data),
};

export const productAPI = {
  search: (query) => api.get(`/api/products/search?query=${encodeURIComponent(query)}`),
};

export const availabilityAPI = {
  getSlots: (doctorId, date) => api.get(`/availability/${doctorId}/slots?date=${date}`),
  getMyAvailability: () => api.get('/availability'),
  setAvailability: (availabilities) => api.post('/availability', { availabilities }),
};

export const posAPI = {
  lookup: (patientId, consultationId) => {
    let url = '/api/pos/lookup?';
    if (patientId) url += `patientId=${patientId}&`;
    if (consultationId) url += `consultationId=${consultationId}&`;
    return api.get(url);
  },
  generate: (data) => api.post('/api/pos/generate', data),
  pay: (id, data) => api.put(`/api/pos/${id}/pay`, data),
  getInvoices: () => api.get('/api/pos'),
};

export default api;
