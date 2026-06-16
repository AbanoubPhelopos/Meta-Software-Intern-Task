import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps an async route handler so that thrown errors / rejected promises
// are forwarded to `next()` instead of becoming unhandled rejections.
// Express 4 doesn't await handlers; this is the standard fix.

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
