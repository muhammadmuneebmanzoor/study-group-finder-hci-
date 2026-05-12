import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequestUrl = error.config?.url || '';
      // Don't redirect if it's the initial auth check or login/register requests
      if (!originalRequestUrl.includes('/auth/me') && 
          !originalRequestUrl.includes('/auth/login') && 
          !originalRequestUrl.includes('/auth/register') &&
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
