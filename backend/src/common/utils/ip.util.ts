import { Request } from 'express';



/**
 * IP Address Utility - Centralized IP Extraction
 * Provides consistent and type-safe IP address extraction across the application
 */
export class IpUtil {
  /**
   * Extract client IP address from request with proper fallback handling
   *
   * Priority order:
   * 1. x-forwarded-for header (for proxied requests)
   * 2. request.ip (Express default)
   * 3. request.socket.remoteAddress (direct connection)
   * 4. 'unknown' (safe fallback)
   *
   * @param request - Express Request object
   * @returns IP address as string (never undefined)
   */
  static extractClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];

    if (forwarded) {
      if (typeof forwarded === 'string') {
        const ip = forwarded.split(',')[0].trim();
        if (ip) return ip;
      }

      if (Array.isArray(forwarded) && forwarded.length > 0) {
        const ip = forwarded[0].trim();
        if (ip) return ip;
      }
    }

    return request.ip || request.socket?.remoteAddress || 'unknown';
  }

  /**
   * Normalize IP address from NestJS @Ip() decorator or request
   * Use this when @Ip() decorator might return undefined
   *
   * @param ip - IP from @Ip() decorator (can be undefined)
   * @param request - Optional fallback request object
   * @returns IP address as string (never undefined)
   */
  static normalizeIp(ip: string | undefined, request?: Request): string {
    if (ip) {
      return ip.trim();
    }

    if (request) {
      return this.extractClientIp(request);
    }

    return 'unknown';
  }

  /**
   * Check if IP is valid (not unknown or empty)
   */
  static isValidIp(ip: string): boolean {
    return ip !== 'unknown' && ip !== '' && ip !== null && ip !== undefined;
  }

  /**
   * Sanitize IP for logging (remove sensitive parts if needed)
   */
  static sanitizeForLog(ip: string): string {
    if (!this.isValidIp(ip)) {
      return 'unknown';
    }

    return ip;
  }
}
