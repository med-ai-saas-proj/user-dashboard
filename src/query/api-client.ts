import axios from 'axios';
import { BASE_API_URL } from '@/config/api-routes';
import keycloak from '@/config/keycloak';
import { useServiceApiKeyStore } from '@/features/api-keys/store/service-api-key.store';
import { useAuthStore } from '@/features/auth/store/auth-store';

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Check if this is a service endpoint that requires API key
    // TODO: Refactor to avoid direct store access in api-client
    const serviceEndpoints = [
      '/api/v1/ehr_summarize',
      '/api/v1/rx_advisor',
      '/api/v1/ai_search',
    ];

    const isServiceEndpoint = serviceEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (isServiceEndpoint) {
      // Add API key for service endpoints
      const selectedApiKey = useServiceApiKeyStore.getState().selectedApiKey;
      if (selectedApiKey) {
        config.headers['X-Api-Key'] = selectedApiKey;
      }
    } else {
      // Use Keycloak token for management endpoints
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
