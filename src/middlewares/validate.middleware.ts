import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '@shared/errors/ApiError';
import { ErrorCodes } from '@shared/errors/errorCodes';

export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}


export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    for (const source of ['body', 'params', 'query'] as const) {
      const schema = schemas[source];
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (result.success) {
        Object.assign(req[source] as object, result.data);
      } else {
        const fieldErrors = result.error.flatten().fieldErrors;
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (!messages) continue;
          const key = source === 'body' ? field : `${source}.${field}`;
          errors[key] = messages;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(ApiError.badRequest('Validation failed', ErrorCodes.VALIDATION_ERROR, errors));
    }
    return next();
  };
};
