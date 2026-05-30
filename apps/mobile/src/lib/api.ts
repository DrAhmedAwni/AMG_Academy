import type { ApiError, ApiResponse, ValidationError } from '@amg/shared';

export type AuthTokenProvider = () => Promise<string | null> | string | null;
export type AuthFailureHandler = () => Promise<void> | void;

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
  authFailureMode?: 'handle' | 'ignore';
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ValidationError[];
  readonly isNetworkError: boolean;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    details?: ValidationError[];
    isNetworkError?: boolean;
  }) {
    super(input.message);
    this.name = 'ApiClientError';
    this.code = input.code;
    this.status = input.status;
    this.details = input.details;
    this.isNetworkError = input.isNetworkError ?? false;
  }
}

let authTokenProvider: AuthTokenProvider | undefined;
let authFailureHandler: AuthFailureHandler | undefined;

export function getApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
    'http://localhost:4000/api/v1'
  );
}

export function setApiAuthTokenProvider(provider: AuthTokenProvider | undefined) {
  authTokenProvider = provider;
}

export function setApiAuthFailureHandler(handler: AuthFailureHandler | undefined) {
  authFailureHandler = handler;
}

export function buildApiUrl(path: string, query?: ApiRequestOptions['query']) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}

function toValidationDetails(value: unknown): ValidationError[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const details = value.filter(
    (item): item is ValidationError =>
      isRecord(item) &&
      typeof item.field === 'string' &&
      typeof item.message === 'string',
  );

  return details.length > 0 ? details : undefined;
}

function normalizeApiError(payload: unknown, status: number): ApiClientError {
  if (
    isRecord(payload) &&
    payload.success === false &&
    isApiError(payload.error)
  ) {
    return new ApiClientError({
      code: payload.error.code,
      message: payload.error.message,
      status,
      details: payload.error.details,
    });
  }

  if (isRecord(payload)) {
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(', ')
          : 'Request failed';

    return new ApiClientError({
      code: typeof payload.error === 'string' ? payload.error : `HTTP_${status}`,
      message,
      status,
      details: toValidationDetails(payload.details),
    });
  }

  return new ApiClientError({
    code: `HTTP_${status}`,
    message: 'Request failed',
    status,
  });
}

export function parseApiEnvelope<T>(payload: unknown, status = 200): T {
  if (!isRecord(payload)) {
    throw new ApiClientError({
      code: 'INVALID_RESPONSE',
      message: 'API response was not a JSON object',
      status,
    });
  }

  const envelope = payload as unknown as ApiResponse<T>;
  if (envelope.success === true) {
    return envelope.data;
  }

  if (envelope.success === false) {
    throw normalizeApiError(envelope, status);
  }

  throw new ApiClientError({
    code: 'INVALID_RESPONSE',
    message: 'API response did not match the expected envelope',
    status,
  });
}

async function resolveAuthHeader() {
  if (!authTokenProvider) {
    return undefined;
  }

  const token = await authTokenProvider();
  return token ? `Bearer ${token}` : undefined;
}

function serializeBody(body: unknown) {
  if (body === undefined) {
    return undefined;
  }

  if (
    typeof FormData !== 'undefined' &&
    body instanceof FormData
  ) {
    return body;
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    body,
    headers,
    query,
    timeoutMs = 15_000,
    authFailureMode = 'handle',
    ...requestOptions
  } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const serializedBody = serializeBody(body);
  const isFormBody = typeof FormData !== 'undefined' && body instanceof FormData;
  const authHeader = await resolveAuthHeader();

  try {
    const response = await fetch(buildApiUrl(path, query), {
      credentials: 'include',
      ...requestOptions,
      body: serializedBody as BodyInit | undefined,
      headers: {
        Accept: 'application/json',
        ...(serializedBody && !isFormBody ? { 'Content-Type': 'application/json' } : {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...headers,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : { success: true, data: null };

    if (!response.ok) {
      const error = normalizeApiError(payload, response.status);
      if (error.status === 401 && authFailureMode === 'handle' && authFailureHandler) {
        await authFailureHandler();
      }
      throw error;
    }

    return parseApiEnvelope<T>(payload, response.status);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new ApiClientError({
        code: 'INVALID_JSON',
        message: 'API returned invalid JSON',
        status: 0,
      });
    }

    throw new ApiClientError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
      status: 0,
      isNetworkError: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}
