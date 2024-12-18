import {
  ApiClient,
  ApiConfig,
  ApiError,
  ApiResponse,
  QueryParams,
  RequestOptions
} from './types';

export class HttpClient implements ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(config: ApiConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    this.defaultTimeout = config.timeout || 30000;
  }

  private async request<T>(
    method: string,
    url: string,
    options: RequestOptions = {},
    data?: unknown,
    params?: QueryParams
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const signal = options.signal || controller.signal;
    const timeout = options.timeout || this.defaultTimeout;

    // Setup timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const queryString = params ? `?${new URLSearchParams(this.cleanParams(params))}` : '';
      const fullUrl = `${this.baseURL}${url}${queryString}`;

      const response = await fetch(fullUrl, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw this.handleError(response.status, responseData);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private cleanParams(params: QueryParams): Record<string, string> {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {});
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private handleError(status: number, data: any): ApiError {
    const error: ApiError = {
      message: data.message || 'An error occurred',
      code: data.code,
      status,
      details: data
    };

    return error;
  }

  async get<T>(url: string, params?: QueryParams, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, options, undefined, params);
  }

  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, options, data);
  }

  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, options, data);
  }

  async patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, options, data);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, options);
  }
}

export const createApiClient = (config?: ApiConfig): ApiClient => {
  return new HttpClient(config);
};
