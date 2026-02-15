/**
 * SAFE NAVIGATION UTILITIES
 * 
 * SECURITY FIX [FE-SEC-004]: Unsafe window.location Redirects
 * 
 * This module provides safe navigation utilities to prevent open redirect
 * vulnerabilities. All redirects are validated against a whitelist of allowed domains.
 */

import { APP_URLS } from '@/config/app.config';

/**
 * List of allowed domains for redirection
 * Only URLs from these domains are allowed
 */
const ALLOWED_DOMAINS = [
  'kahade.com',
  'www.kahade.com',
  'app.kahade.com',
  'admin.kahade.com',
  'localhost',
  '127.0.0.1',
];

/**
 * Validate if a URL is safe for redirection
 * 
 * @param url - URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isUrlSafe(url: string): boolean {
  try {
    // Handle relative URLs (considered safe)
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    // Parse absolute URL
    const urlObj = new URL(url, window.location.origin);
    
    // Check if hostname is in whitelist
    const hostname = urlObj.hostname;
    
    // Exact match or subdomain match
    const isAllowed = ALLOWED_DOMAINS.some(domain => {
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });

    if (!isAllowed) {
      console.error('[Security] Blocked redirect to untrusted domain:', hostname);
      return false;
    }

    // Check for javascript: protocol
    if (urlObj.protocol === 'javascript:') {
      console.error('[Security] Blocked javascript: protocol redirect');
      return false;
    }

    // Check for data: protocol
    if (urlObj.protocol === 'data:') {
      console.error('[Security] Blocked data: protocol redirect');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Security] Invalid URL:', url, error);
    return false;
  }
}

/**
 * Safely redirect to a URL after validation
 * 
 * @param url - URL to redirect to
 * @param fallback - Fallback URL if validation fails (default: '/')
 */
export function safeRedirect(url: string, fallback: string = '/'): void {
  if (isUrlSafe(url)) {
    window.location.href = url;
  } else {
    console.warn('[Security] Unsafe redirect blocked, using fallback:', fallback);
    window.location.href = fallback;
  }
}

/**
 * Safely navigate to login page
 * Preserves current URL as return URL
 */
export function navigateToLogin(): void {
  const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?return=${returnUrl}`;
}

/**
 * Safely navigate to landing page
 */
export function navigateToLanding(): void {
  window.location.href = APP_URLS.landing;
}

/**
 * Safely navigate to app dashboard
 */
export function navigateToApp(): void {
  window.location.href = APP_URLS.app;
}

/**
 * Safely navigate to admin dashboard
 */
export function navigateToAdmin(): void {
  window.location.href = APP_URLS.admin;
}

/**
 * Navigate back or to a fallback URL
 * 
 * @param fallback - Fallback URL if history is empty (default: '/')
 */
export function navigateBack(fallback: string = '/'): void {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = fallback;
  }
}

/**
 * Open external URL in new tab with security attributes
 * 
 * @param url - URL to open
 */
export function openExternal(url: string): void {
  // Validate URL
  try {
    const urlObj = new URL(url);
    
    // Prevent javascript: and data: protocols
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      console.error('[Security] Blocked unsafe protocol:', urlObj.protocol);
      return;
    }

    // Open in new tab with security attributes
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Additional security: clear opener reference
    if (newWindow) {
      newWindow.opener = null;
    }
  } catch (error) {
    console.error('[Security] Invalid external URL:', url, error);
  }
}

/**
 * Validate and navigate to return URL from query parameter
 * Used after login/authentication
 * 
 * @param fallback - Fallback URL if return URL is invalid (default: '/dashboard')
 */
export function navigateToReturnUrl(fallback: string = '/dashboard'): void {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('return') || params.get('returnUrl') || params.get('redirect');

  if (returnUrl) {
    const decodedUrl = decodeURIComponent(returnUrl);
    
    // Only allow relative URLs for return navigation
    if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
      window.location.href = decodedUrl;
      return;
    }
    
    console.warn('[Security] Invalid return URL, using fallback:', decodedUrl);
  }

  window.location.href = fallback;
}

/**
 * Replace window.location.href with safe alternative
 * Use this throughout the app instead of direct window.location.href
 * 
 * @deprecated Use specific navigation functions instead
 */
export function navigate(url: string): void {
  safeRedirect(url);
}
