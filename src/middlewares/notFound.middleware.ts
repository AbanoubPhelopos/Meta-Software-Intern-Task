import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '@shared/errors/ApiError';
import { ErrorCodes } from '@shared/errors/errorCodes';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.path} not found`, ErrorCodes.ROUTE_NOT_FOUND));
};
