import type {
  ApiError,
  ApiResponse,
  AuthTokenPair,
  AuthUser,
  ErrorResponse,
  JwtPayload,
  LoginResponse,
  PaginationMeta,
  SuccessResponse,
  ValidationError,
} from '@amg/shared';
import {
  AttendanceStatus,
  CourseStatus,
  EnrollmentStatus,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
} from '@amg/shared';

export type {
  ApiError,
  ApiResponse,
  AuthTokenPair,
  AuthUser,
  ErrorResponse,
  JwtPayload,
  LoginResponse,
  PaginationMeta,
  SuccessResponse,
  ValidationError,
};

export {
  AttendanceStatus,
  CourseStatus,
  EnrollmentStatus,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
};

export type MobileAuthTokens = AuthTokenPair;

export interface MobileAuthResponse {
  user: AuthUser;
  tokens?: MobileAuthTokens;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiRequestMeta {
  requestId?: string;
  receivedAt: string;
}

export type ApiListResponse<T> = ApiResponse<PaginatedData<T>>;
