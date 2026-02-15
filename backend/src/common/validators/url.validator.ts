import { BadRequestException } from '@nestjs/common';
import { isURL } from 'class-validator';



/**
 * Blocked hosts for SSRF protection
 */
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  '::1',
  'metadata.google.internal', // GCP metadata
];

/**
 * Blocked IP ranges (regex patterns)
 */
const BLOCKED_IP_RANGES = [
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^fe80:/i, // IPv6 link-local
  /^fc00:/i, // IPv6 unique local
];

/**
 * Validate URL is safe (no SSRF)
 */
export async function validateSafeUrl(url: string): Promise<boolean> {
  // 1. Validate URL format
  if (!isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
    throw new BadRequestException('Invalid URL format');
  }

  // 2. Parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new BadRequestException('Invalid URL');
  }

  // 3. Check protocol (production: HTTPS only)
  if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
    throw new BadRequestException('Only HTTPS URLs are allowed in production');
  }

  // 4. Check blocked hosts
  const hostname = parsedUrl.hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(hostname)) {
    throw new BadRequestException('Access to internal resources is blocked');
  }

  // 5. Check blocked IP ranges
  for (const pattern of BLOCKED_IP_RANGES) {
    if (pattern.test(hostname)) {
      throw new BadRequestException('Access to private IP ranges is blocked');
    }
  }

  // 6. Additional checks for suspicious patterns
  if (hostname.includes('internal') || hostname.includes('local')) {
    throw new BadRequestException('Suspicious hostname detected');
  }

  return true;
}

/**
 * Validate URL and return parsed URL object
 */
export async function parseAndValidateUrl(url: string): Promise<URL> {
  await validateSafeUrl(url);
  return new URL(url);
}

/**
 * Check if URL points to allowed domain
 */
export function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    return allowedDomains.some(domain => {
      const normalizedDomain = domain.toLowerCase();
      return hostname === normalizedDomain || hostname.endsWith('.' + normalizedDomain);
    });
  } catch {
    return false;
  }
}

/**
 * Sanitize URL (remove credentials, normalize)
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove credentials
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return url;
  }
}
