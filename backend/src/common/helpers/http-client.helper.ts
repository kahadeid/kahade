import { Logger } from '@nestjs/common';


/**
 * HTTP Client Helper (LOW-009)
 */

export class HttpClientHelper {
  private static readonly logger = new Logger('HttpClientHelper');

  /**
   * Make HTTP request with retry
   */
  static async request<T>(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Request failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
        );

        if (attempt < maxRetries) {
          await this.sleep(1000 * Math.pow(2, attempt - 1));
        }
      }
    }

    throw lastError!;
  }

  /**
   * GET request
   */
  static async get<T>(url: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  static async post<T>(
    url: string,
    body: unknown,
    headers?: HeadersInit,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  static async put<T>(
    url: string,
    body: unknown,
    headers?: HeadersInit,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(url: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', headers });
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
