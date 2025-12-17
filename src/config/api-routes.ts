/**
 * Centralized API endpoint definitions
 * This file contains all API routes used throughout the application
 */

const API_VERSION = 'v1';

if (!import.meta.env.VITE_BASE_API_URL) {
  throw new Error('VITE_BASE_API_URL is not defined in environment variables');
}

export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const API_ROUTES = {
  AUTH: {
    SIGN_IN: `/api/${API_VERSION}/auth/login`,
    SIGN_OUT: `/api/${API_VERSION}/auth/logout`,
    REGISTER: `/api/${API_VERSION}/auth/register`,
    REFRESH_TOKEN: `/api/${API_VERSION}/auth/refresh`,
  },

  MANAGEMENT: {
    API_KEYS: `/management/api/${API_VERSION}/api_keys`,
    DOCS_OPENAI: `/management/docs/openai.json`,
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
