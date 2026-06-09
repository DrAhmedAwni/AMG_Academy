import { ApiClientError } from './api';

export type UiErrorKind =
  | 'session-expired'
  | 'permission-denied'
  | 'validation'
  | 'conflict'
  | 'not-found'
  | 'rate-limited'
  | 'network'
  | 'server'
  | 'unknown';

export interface UiErrorState {
  kind: UiErrorKind;
  title: string;
  message: string;
  retryable: boolean;
}

export function mapApiErrorToUi(error: unknown): UiErrorState {
  if (!(error instanceof ApiClientError)) {
    return {
      kind: 'unknown',
      title: 'Something went wrong',
      message: 'Please try again.',
      retryable: true,
    };
  }

  if (error.isNetworkError) {
    return {
      kind: 'network',
      title: 'Connection issue',
      message: 'Check your connection and try again.',
      retryable: true,
    };
  }

  if (error.code === 'EMAIL_VERIFICATION_PENDING') {
    return {
      kind: 'permission-denied',
      title: 'Waiting for verification',
      message: error.message,
      retryable: false,
    };
  }

  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return {
      kind: 'session-expired',
      title: 'Session expired',
      message: 'Please sign in again to continue.',
      retryable: false,
    };
  }

  if (error.status === 403 || error.code === 'FORBIDDEN') {
    return {
      kind: 'permission-denied',
      title: 'Permission required',
      message: 'Your account does not have access to this action.',
      retryable: false,
    };
  }

  if (error.status === 409 || error.code === 'CONFLICT') {
    return {
      kind: 'conflict',
      title: 'Action unavailable',
      message: error.message,
      retryable: true,
    };
  }

  if (error.status === 404 || error.code === 'NOT_FOUND') {
    return {
      kind: 'not-found',
      title: 'Not found',
      message: error.message,
      retryable: false,
    };
  }

  if (error.status === 429 || error.code === 'RATE_LIMITED') {
    return {
      kind: 'rate-limited',
      title: 'Too many attempts',
      message: 'Please wait a moment and try again.',
      retryable: true,
    };
  }

  if (error.status >= 500) {
    return {
      kind: 'server',
      title: 'Server issue',
      message: 'AMG Academy is having trouble completing this request.',
      retryable: true,
    };
  }

  if (error.code === 'VALIDATION_ERROR') {
    return {
      kind: 'validation',
      title: 'Check the form',
      message: error.message,
      retryable: false,
    };
  }

  return {
    kind: 'unknown',
    title: 'Something went wrong',
    message: error.message,
    retryable: true,
  };
}

export function fieldError(error: unknown, field: string) {
  if (!(error instanceof ApiClientError)) {
    return undefined;
  }

  return error.details?.find((detail) => detail.field === field)?.message;
}
