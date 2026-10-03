import axios from 'axios';
import { getAccessToken, notifySessionUnauthorized } from '@/auth/auth-token';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const headers = error.config?.headers;
    const authorization =
      headers && typeof headers === 'object' && 'Authorization' in headers
        ? headers.Authorization
        : headers && typeof headers.get === 'function'
          ? headers.get('Authorization')
          : undefined;

    if (authorization) {
      notifySessionUnauthorized();
    }

    return Promise.reject(error);
  },
);
