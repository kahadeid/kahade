/**
 * API CONFIGURATION
 * 
 * FIX [FE-API-002]: Centralized API configuration
 * 
 * This module provides:
 * - Environment-based API URLs
 * - Type-safe endpoint definitions
 * - Easy endpoint management
 * - No hardcoded URLs in components
 */

/**
 * Environment configuration
 */
const ENV = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    wsBaseUrl: 'ws://localhost:3000',
    appUrl: 'http://localhost:5001',
  },
  staging: {
    apiBaseUrl: 'https://staging-api.kahade.id/api',
    wsBaseUrl: 'wss://staging-api.kahade.id',
    appUrl: 'https://staging.kahade.id',
  },
  production: {
    apiBaseUrl: 'https://api.kahade.id/api',
    wsBaseUrl: 'wss://api.kahade.id',
    appUrl: 'https://kahade.id',
  },
} as const;

/**
 * Get current environment
 */
function getCurrentEnv(): keyof typeof ENV {
  if (import.meta.env.PROD) {
    return 'production';
  }
  
  // Check for staging flag
  if (import.meta.env.VITE_APP_ENV === 'staging') {
    return 'staging';
  }
  
  return 'development';
}

/**
 * Current configuration
 */
export const config = ENV[getCurrentEnv()];

/**
 * Base URLs
 */
export const API_BASE_URL = config.apiBaseUrl;
export const WS_BASE_URL = config.wsBaseUrl;
export const APP_URL = config.appUrl;

/**
 * API Endpoints
 * 
 * Centralized endpoint definitions.
 * Use these instead of hardcoded strings!
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    me: '/auth/me',
  },

  // Users
  users: {
    base: '/users',
    byId: (id: string | number) => `/users/${id}`,
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    avatar: '/users/avatar',
    kyc: '/users/kyc',
    kycStatus: (id: string | number) => `/users/${id}/kyc-status`,
  },

  // Transactions
  transactions: {
    base: '/transactions',
    byId: (id: string | number) => `/transactions/${id}`,
    create: '/transactions',
    update: (id: string | number) => `/transactions/${id}`,
    cancel: (id: string | number) => `/transactions/${id}/cancel`,
    complete: (id: string | number) => `/transactions/${id}/complete`,
    release: (id: string | number) => `/transactions/${id}/release`,
    dispute: (id: string | number) => `/transactions/${id}/dispute`,
    chat: (id: string | number) => `/transactions/${id}/chat`,
    history: '/transactions/history',
    stats: '/transactions/stats',
  },

  // Disputes
  disputes: {
    base: '/disputes',
    byId: (id: string | number) => `/disputes/${id}`,
    resolve: (id: string | number) => `/disputes/${id}/resolve`,
    escalate: (id: string | number) => `/disputes/${id}/escalate`,
    addEvidence: (id: string | number) => `/disputes/${id}/evidence`,
  },

  // Payments
  payments: {
    base: '/payments',
    methods: '/payments/methods',
    addMethod: '/payments/methods',
    removeMethod: (id: string | number) => `/payments/methods/${id}`,
    process: '/payments/process',
    verify: '/payments/verify',
    history: '/payments/history',
  },

  // Wallet
  wallet: {
    balance: '/wallet/balance',
    topup: '/wallet/topup',
    withdraw: '/wallet/withdraw',
    history: '/wallet/history',
  },

  // Notifications
  notifications: {
    base: '/notifications',
    byId: (id: string | number) => `/notifications/${id}`,
    markRead: (id: string | number) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    unreadCount: '/notifications/unread-count',
  },

  // Admin
  admin: {
    users: '/admin/users',
    transactions: '/admin/transactions',
    disputes: '/admin/disputes',
    stats: '/admin/stats',
    settings: '/admin/settings',
    logs: '/admin/logs',
  },

  // Blog/Content
  blog: {
    posts: '/blog/posts',
    bySlug: (slug: string) => `/blog/posts/${slug}`,
    categories: '/blog/categories',
  },

  // Feedback
  feedback: {
    create: '/feedback',
    ratings: '/feedback/ratings',
  },

  // Search
  search: {
    users: '/search/users',
    transactions: '/search/transactions',
    all: '/search',
  },
} as const;

/**
 * Build full API URL
 */
export function buildApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Build WebSocket URL
 */
export function buildWsUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${WS_BASE_URL}${cleanPath ? '/' + cleanPath : ''}`;
}

/**
 * API timeout configuration
 */
export const API_TIMEOUT = {
  default: 30000, // 30 seconds
  upload: 120000, // 2 minutes
  download: 60000, // 1 minute
} as const;

/**
 * API retry configuration
 */
export const API_RETRY = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;

/**
 * File upload limits
 */
export const UPLOAD_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFileSizeKYC: 10 * 1024 * 1024, // 10MB for KYC documents
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocTypes: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPage: 1,
  defaultPerPage: 20,
  maxPerPage: 100,
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache durations in milliseconds
  user: 5 * 60 * 1000, // 5 minutes
  transactions: 1 * 60 * 1000, // 1 minute
  stats: 5 * 60 * 1000, // 5 minutes
  static: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  enableChat: true,
  enableWallet: true,
  enableKYC: true,
  enableDisputes: true,
  enableRatings: true,
  enableNotifications: true,
  enableWebSocket: true,
} as const;

/**
 * External services (if any)
 */
export const EXTERNAL_SERVICES = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
} as const;

/**
 * USAGE EXAMPLES
 * 
 * 1. Using endpoints:
 * ```typescript
 * import { API_ENDPOINTS, buildApiUrl } from '@/lib/api-config';
 * 
 * // Simple endpoint
 * const url = buildApiUrl(API_ENDPOINTS.auth.login);
 * // "https://api.kahade.id/api/auth/login"
 * 
 * // Dynamic endpoint
 * const userUrl = buildApiUrl(API_ENDPOINTS.users.byId(123));
 * // "https://api.kahade.id/api/users/123"
 * ```
 * 
 * 2. With axios:
 * ```typescript
 * import axios from 'axios';
 * import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';
 * 
 * const api = axios.create({ baseURL: API_BASE_URL });
 * api.get(API_ENDPOINTS.auth.me);
 * ```
 * 
 * 3. With custom hooks:
 * ```typescript
 * import { useQuery } from '@/hooks/useApi';
 * import { API_ENDPOINTS } from '@/lib/api-config';
 * 
 * const { data } = useQuery(
 *   () => api.get(API_ENDPOINTS.users.profile)
 * );
 * ```
 * 
 * 4. WebSocket:
 * ```typescript
 * import { buildWsUrl } from '@/lib/api-config';
 * 
 * const ws = new WebSocket(buildWsUrl('/notifications'));
 * ```
 */

export default {
  API_BASE_URL,
  WS_BASE_URL,
  APP_URL,
  API_ENDPOINTS,
  buildApiUrl,
  buildWsUrl,
  API_TIMEOUT,
  API_RETRY,
  UPLOAD_LIMITS,
  PAGINATION,
  CACHE_CONFIG,
  FEATURES,
  EXTERNAL_SERVICES,
};
