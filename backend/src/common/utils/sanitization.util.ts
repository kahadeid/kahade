import { BadRequestException } from '@nestjs/common';


import * as sanitizeHtml from 'sanitize-html';

/**
 * Input Sanitization Utilities (CRIT-012)
 *
 * Prevents various injection attacks:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection (via input validation)
 * - Path Traversal
 * - Command Injection
 */

/**
 * Sanitize HTML content to prevent XSS
 * @param dirty - Potentially unsafe HTML
 * @param options - Sanitization options
 * @returns Safe HTML
 */
export function sanitizeHTML(
  dirty: string,
  options?: sanitizeHtml.IOptions,
): string {
  const defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: [], // No HTML tags by default (plain text only)
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  };

  return sanitizeHtml(dirty, options || defaultOptions);
}

/**
 * Sanitize text input (strip all HTML)
 * @param input - User input
 * @returns Safe text
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  // Remove all HTML tags
  return sanitizeHTML(input.trim());
}

/**
 * Sanitize filename to prevent path traversal
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) {
    throw new BadRequestException('Filename is required');
  }

  // Remove path components
  let safe = filename.replace(/^.*[\\\/]/, '');

  // Remove dangerous characters
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Prevent hidden files
  if (safe.startsWith('.')) {
    safe = '_' + safe;
  }

  // Prevent directory traversal
  if (safe.includes('..')) {
    throw new BadRequestException('Invalid filename');
  }

  // Ensure not too long
  if (safe.length > 255) {
    const ext = safe.split('.').pop();
    safe = safe.substring(0, 250) + (ext ? '.' + ext : '');
  }

  return safe;
}

/**
 * Validate and sanitize email
 * @param email - Email address
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Convert to lowercase and trim
  const sanitized = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new BadRequestException('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param url - URL to sanitize
 * @returns Safe URL or null
 */
export function sanitizeURL(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    throw new BadRequestException('Invalid URL protocol');
  }

  // Ensure it's http or https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    throw new BadRequestException('URL must start with http:// or https://');
  }

  return url.trim();
}

/**
 * Sanitize phone number (remove all non-digits)
 * @param phone - Phone number
 * @returns Sanitized phone with only digits
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Validate length (example for Indonesian numbers)
  if (digits.length < 10 || digits.length > 15) {
    throw new BadRequestException('Invalid phone number length');
  }

  return digits;
}

/**
 * Sanitize SQL-like input (for additional safety layer)
 * Note: Use parameterized queries as primary defense
 * @param input - User input
 * @returns Sanitized input
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';

  // Remove SQL keywords and special characters
  const dangerous = [
    '--',
    ';',
    '/*',
    '*/',
    'xp_',
    'sp_',
    'exec',
    'execute',
    'drop',
    'delete',
    'truncate',
  ];

  let safe = input;
  for (const keyword of dangerous) {
    safe = safe.replace(new RegExp(keyword, 'gi'), '');
  }

  return safe.trim();
}

/**
 * Escape special characters for shell commands
 * @param input - Command argument
 * @returns Escaped string
 */
export function escapeShellArg(input: string): string {
  if (!input) return '';

  // Replace dangerous characters
  return input.replace(/(["'`$\\])/g, '\\$1');
}

/**
 * Remove null bytes from input
 * @param input - User input
 * @returns Clean input
 */
export function removeNullBytes(input: string): string {
  if (!input) return '';
  return input.replace(/\0/g, '');
}

/**
 * Comprehensive input sanitization
 * @param input - User input
 * @param type - Type of input
 * @returns Sanitized input
 */
export function sanitizeInput(
  input: string,
  type: 'text' | 'html' | 'email' | 'url' | 'phone' | 'filename' = 'text',
): string {
  if (!input) return '';

  // Remove null bytes first
  let clean = removeNullBytes(input);

  // Apply type-specific sanitization
  switch (type) {
    case 'html':
      return sanitizeHTML(clean);
    case 'email':
      return sanitizeEmail(clean);
    case 'url':
      return sanitizeURL(clean) || '';
    case 'phone':
      return sanitizePhone(clean);
    case 'filename':
      return sanitizeFilename(clean);
    case 'text':
    default:
      return sanitizeText(clean);
  }
}
