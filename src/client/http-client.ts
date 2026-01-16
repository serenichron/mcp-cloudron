/**
 * HTTP Client for Cloudron API
 * Base class providing HTTP request functionality for all API category classes
 */

import { CloudronError, createErrorFromStatus } from '../errors.js';

const DEFAULT_TIMEOUT = 30000;

export interface HttpClientConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export class HttpClient {
  protected readonly baseUrl: string;
  protected readonly token: string;
  protected readonly defaultTimeout: number;

  constructor(config: HttpClientConfig) {
    if (!config.baseUrl) {
      throw new CloudronError('CLOUDRON_BASE_URL not set');
    }
    if (!config.token) {
      throw new CloudronError('CLOUDRON_API_TOKEN not set');
    }

    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
    this.defaultTimeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Make HTTP request to Cloudron API
   * NO retry logic (deferred to Phase 3 with idempotency keys)
   */
  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
    options?: { timeout?: number }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        let message = `Cloudron API error: ${response.status} ${response.statusText}`;

        try {
          const parsed = JSON.parse(errorBody);
          if (parsed.message) message = parsed.message;
        } catch {
          // Use default message if body isn't JSON
        }

        throw createErrorFromStatus(response.status, message);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof CloudronError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new CloudronError(`Request timeout after ${timeout}ms`, undefined, 'TIMEOUT');
        }
        throw new CloudronError(`Network error: ${error.message}`, undefined, 'NETWORK_ERROR');
      }

      throw new CloudronError('Unknown error occurred');
    }
  }
}
