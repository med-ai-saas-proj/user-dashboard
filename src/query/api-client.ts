import axios from 'axios';
import keycloak from '@/config/keycloak';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { BASE_API_URL } from '@/query/api-routes';

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Use Keycloak token if available
    if (keycloak.authenticated && keycloak.token) {
      // Refresh token if needed
      try {
        await keycloak.updateToken(30);
      } catch (error) {
        console.error('Failed to refresh token', error);
      }
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } else {
      // Fallback to stored token
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (keycloak.authenticated) {
        keycloak.logout();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
