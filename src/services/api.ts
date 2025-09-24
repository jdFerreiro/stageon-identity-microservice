import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7010',
});

api.interceptors.request.use(config => {
  // No agregar el token si el endpoint es /auth/login
  if (!config.url?.includes('/auth/login')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
