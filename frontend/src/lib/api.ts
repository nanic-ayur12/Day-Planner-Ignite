import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (data: { identifier: string; password: string; isStudent?: boolean }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const brigadesAPI = {
  getAll: () => api.get('/brigades'),
  create: (data: { name: string }) => api.post('/brigades', data),
  update: (id: string, data: { name: string }) => api.put(`/brigades/${id}`, data),
  delete: (id: string) => api.delete(`/brigades/${id}`),
};

export const eventsAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export const eventPlansAPI = {
  getAll: (params?: any) => api.get('/event-plans', { params }),
  create: (data: any) => api.post('/event-plans', data),
  update: (id: string, data: any) => api.put(`/event-plans/${id}`, data),
  delete: (id: string) => api.delete(`/event-plans/${id}`),
};

export const submissionsAPI = {
  getAll: (params?: any) => api.get('/submissions', { params }),
  create: (data: FormData) => api.post('/submissions', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id: string, status: string) => 
    api.put(`/submissions/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/submissions/${id}`),
};

export const analyticsAPI = {
  getAll: (params?: any) => api.get('/analytics', { params }),
};