
import * as DOMPurify from 'isomorphic-dompurify';

export class SanitizerUtil {
  /**
   * Sanitize string input by removing all HTML tags
   */
  static sanitize(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  /**
   * Sanitize rich text allowing safe HTML tags
   */
  static sanitizeRichText(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return DOMPurify.sanitize(input, {
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
      ALLOWED_URI_REGEXP: /^(?:(?:https?):|\/\/)/i,
    });
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = Array.isArray(value)
          ? value.map((item) =>
              typeof item === 'string'
                ? this.sanitize(item)
                : typeof item === 'object'
                ? this.sanitizeObject(item)
                : item,
            )
          : this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
