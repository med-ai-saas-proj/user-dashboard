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
    SIGN_IN: new URL(`/api/${API_VERSION}/auth/login`, BASE_API_URL).toString(),
    SIGN_OUT: new URL(
      `/api/${API_VERSION}/auth/logout`,
      BASE_API_URL
    ).toString(),
    REGISTER: new URL(
      `/api/${API_VERSION}/auth/register`,
      BASE_API_URL
    ).toString(),
    REFRESH_TOKEN: new URL(
      `/api/${API_VERSION}/auth/refresh`,
      BASE_API_URL
    ).toString(),
  },

  MANAGEMENT: {
    API_KEYS: new URL(
      `/management/api/${API_VERSION}/api-keys`,
      BASE_API_URL
    ).toString(),
    DOCS_OPENAPI: new URL(
      `/service/docs/openapi.json`,
      BASE_API_URL
    ).toString(),
  },

  SERVICES: {
    EHR_SUMMARIZE: new URL(
      `service/api/${API_VERSION}/ehr_summarize`,
      BASE_API_URL
    ).toString(),
    RX_ADVISOR: new URL(
      `service/api/${API_VERSION}/rx_advisor`,
      BASE_API_URL
    ).toString(),
    AI_SEARCH: new URL(
      `service/api/${API_VERSION}/ai_search`,
      BASE_API_URL
    ).toString(),
    CHAT: new URL(`service/api/${API_VERSION}/chat`, BASE_API_URL).toString(),
  },
} as const;

export type ApiRoute = typeof API_ROUTES;

export const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string => {
  const url = new URL(endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
};
