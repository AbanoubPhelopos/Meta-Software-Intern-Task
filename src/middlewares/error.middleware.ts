import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { ApiError } from '../shared/errors/ApiError';
import { ErrorCodes, type ErrorCode } from '../shared/errors/errorCodes';
import { logger } from '../shared/utils/logger';
import type { ErrorResponse } from '../shared/types/api';

type Classified = {
  statusCode: number;
  code: ErrorCode | string;
  message: string;
  details?: unknown;
};

function classify(err: Error): Classified {
  if (err instanceof ApiError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Validation failed',
      details: err.flatten().fieldErrors,
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return {
        statusCode: 409,
        code: ErrorCodes.EMAIL_ALREADY_EXISTS,
        message: 'A record with the same unique value already exists',
      };
    }
    if (err.code === 'P2025') {
      return {
        statusCode: 404,
        code: ErrorCodes.NOT_FOUND,
        message: 'Record not found',
      };
    }
  }

  return {
    statusCode: 500,
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'Internal server error',
  };
}

function buildBody(err: Error, classified: Classified): ErrorResponse {
  const errorBody: ErrorResponse['error'] = {
    code: classified.code,
    message: classified.message,
  };
  if (classified.details !== undefined) {
    errorBody.details = classified.details;
  }
  if (env.NODE_ENV !== 'production' && classified.statusCode >= 500 && err.stack) {
    (errorBody as { stack?: string }).stack = err.stack;
  }
  return { success: false, error: errorBody };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,

  _next: NextFunction,
): void => {
  const classified = classify(err);

  if (classified.statusCode >= 500) {
    logger.error(`${classified.statusCode} ${classified.message}`, {
      err,
      path: req.path,
      method: req.method,
    });
  }

  res.status(classified.statusCode).json(buildBody(err, classified));
};
