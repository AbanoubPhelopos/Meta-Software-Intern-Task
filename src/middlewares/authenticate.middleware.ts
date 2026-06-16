import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../shared/errors/ApiError';
import { ErrorCodes } from '../shared/errors/errorCodes';
import { verifyToken } from '../shared/utils/token';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(
      ApiError.unauthorized('Missing or malformed Authorization header', ErrorCodes.INVALID_TOKEN),
    );
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(ApiError.unauthorized('Token is empty', ErrorCodes.INVALID_TOKEN));
  }

  try {
    const payload = verifyToken(token, env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Token has expired', ErrorCodes.TOKEN_EXPIRED));
    }
    if (err instanceof jwt.JsonWebTokenError || (err as JwtPayload)?.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token', ErrorCodes.INVALID_TOKEN));
    }
    return next(err);
  }
};

export const requireUser = (req: Request): NonNullable<Request['user']> => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }
  return req.user;
};
