import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { disconnectSocket, updateSocketToken } from '@/lib/socket';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_URL = rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api') 
  ? `${rawApiUrl.replace(/\/$/, '')}/api` 
  : rawApiUrl;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Don't overwrite if a custom Authorization header was already set by the caller
      if (!config.headers.Authorization) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url = originalRequest.url || '';
    const isAuthRoute = url.includes('/auth/login') ||
                        url.includes('/auth/register') ||
                        url.includes('/auth/clerk-login') ||
                        url.includes('/auth/social-login') ||
                        url.includes('/auth/refresh-token') ||
                        url.includes('/auth/admin/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Keep realtime auth aligned with refreshed HTTP token.
        updateSocketToken(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        disconnectSocket();
        
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
