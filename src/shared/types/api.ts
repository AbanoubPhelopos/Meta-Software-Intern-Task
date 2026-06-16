// Standardized response envelopes. Controllers use these so every
// endpoint speaks the same shape — clients can rely on `success` as a
// boolean discriminator.

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponseBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ErrorResponse {
  success: false;
  error: ErrorResponseBody;
}
