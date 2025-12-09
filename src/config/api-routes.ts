/**
 * Centralized API endpoint definitions
 * This file contains all API routes used throughout the application
 */

const API_VERSION = 'v1';

export const BASE_API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  AUTH: {
    LOGIN: `/api/${API_VERSION}/auth/login`,
    LOGOUT: `/api/${API_VERSION}/auth/logout`,
    REFRESH_TOKEN: `/api/${API_VERSION}/auth/refresh`,
  },

  APP: {
    API_KEYS: `/api/${API_VERSION}/api_keys`,
  },
} as const;

export type ApiRoute = typeof API_ROUTES;

export const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string => {
  if (!params) return endpoint;

  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>
    )
  ).toString();

  return `${endpoint}?${queryString}`;
};
