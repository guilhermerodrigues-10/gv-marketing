import axios from 'axios';

// Get API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const authAPI = {
  // Login simples com credenciais do .env (SEMPRE funciona!)
  login: async (email: string, password: string) => {
    const response = await api.post('/simple-auth/login', { email, password });
    return response.data; // { success, token, user }
  },

  // Verificar se token é válido
  verify: async () => {
    const response = await api.get('/simple-auth/verify');
    return response.data; // { valid, user }
  },

  // Renovar token
  refresh: async () => {
    const response = await api.post('/simple-auth/refresh');
    return response.data; // { success, token }
  },

  // Métodos antigos (para compatibilidade - requerem PostgreSQL)
  register: async (name: string, email: string, password: string, role = 'Membro') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data; // { token, user }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data; // user
  },
};

// ==================== USERS ====================

export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// ==================== PROJECTS ====================

export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// ==================== TASKS ====================

export const tasksAPI = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// ==================== ASSETS ====================

export const assetsAPI = {
  getAll: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};

// ==================== NOTIFICATIONS ====================

export const notificationsAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};

export default api;
