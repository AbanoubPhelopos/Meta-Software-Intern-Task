import type { ErrorCode } from './errorCodes';

// Typed error thrown anywhere in the service / repository layers.
// The central error middleware (added in a later commit) catches these
// and shapes the JSON response.
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(statusCode: number, code: ErrorCode | string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message: string, code: ErrorCode | string = 'BAD_REQUEST', details?: unknown) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(
    message = 'Authentication required',
    code: ErrorCode | string = 'UNAUTHORIZED',
  ) {
    return new ApiError(401, code, message);
  }

  static forbidden(
    message = 'You do not have permission to perform this action',
    code: ErrorCode | string = 'FORBIDDEN',
  ) {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Resource not found', code: ErrorCode | string = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code: ErrorCode | string = 'CONFLICT') {
    return new ApiError(409, code, message);
  }

  static tooManyRequests(
    message = 'Too many requests, please try again later',
    code: ErrorCode | string = 'RATE_LIMIT_EXCEEDED',
  ) {
    return new ApiError(429, code, message);
  }

  static internal(message = 'Internal server error', code: ErrorCode | string = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message);
  }
}
