import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './shared/utils/logger';
import { ApiError } from './shared/errors/ApiError';
import { ErrorCodes } from './shared/errors/errorCodes';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import apiRoutes from './routes';

const parseCorsOrigins = (raw: string): CorsOptions['origin'] => {
  const origins = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (origins.length === 0) return '*';
  if (origins.length === 1) return origins[0];
  return origins;
};

export const buildApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: parseCorsOrigins(env.CORS_ORIGIN), credentials: true }));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
      skip: () => env.NODE_ENV === 'test',
    }),
  );

  if (env.NODE_ENV !== 'test') {
    const authLimiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, _res, next: NextFunction) => {
        next(
          ApiError.tooManyRequests(
            'Too many requests, please try again later',
            ErrorCodes.RATE_LIMIT_EXCEEDED,
          ),
        );
      },
    });
    app.use('/api/v1/auth', authLimiter);
  }

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: { status: 'ok' } });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.status(200).json(swaggerSpec);
  });

  app.use('/api/v1', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
