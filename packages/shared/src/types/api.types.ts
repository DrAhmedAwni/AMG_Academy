export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
