import { Transform } from 'class-transformer';


import * as DOMPurify from 'isomorphic-dompurify';


/**
 * Decorator to automatically sanitize string inputs in DTOs
 * Strips all HTML tags to prevent XSS attacks
 *
 * Usage:
 * ```typescript
 * export class CreateUserDto {
 *   @IsString()
 *   @Sanitize()
 *   name: string;
 * }
 * ```
 *
 * @see Issue #63 - Missing Input Sanitization
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      });
    }
    return value;
  });
}

/**
 * Decorator for rich text content that allows safe HTML tags
 * Use for descriptions, bios, or formatted content
 *
 * Allows: paragraphs, bold, italic, underline, lists, links
 *
 * Usage:
 * ```typescript
 * export class UpdateProfileDto {
 *   @IsString()
 *   @SanitizeRichText()
 *   bio: string;
 * }
 * ```
 */
export function SanitizeRichText() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          'h1',
          'h2',
          'h3',
          'ul',
          'ol',
          'li',
          'a',
          'blockquote',
        ],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        ALLOWED_URI_REGEXP: /^(?:(?:https?):|\/\/)/i, // Only allow https:// and http://
      });
    }
    return value;
  });
}
