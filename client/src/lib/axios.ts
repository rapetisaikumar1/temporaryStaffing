import axios from 'axios';

const LOCAL_DEV_API_URL = 'http://localhost:3001/api';

function normalizeApiBaseUrl(url: string) {
  return url.trim().replace(/\/$/, '');
}

function resolveApiBaseUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (configuredApiUrl) {
    return normalizeApiBaseUrl(configuredApiUrl);
  }

  if (process.env.NODE_ENV === 'development') {
    return LOCAL_DEV_API_URL;
  }

  return '/api';
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
