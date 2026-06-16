import { buildApp } from './app';
import { env } from '@config/env';
import { logger } from '@shared/utils/logger';
import { disconnectPrisma } from '@config/database';

const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`, {
    env: env.NODE_ENV,
    node: process.version,
  });
});

const shutdown = (signal: string): void => {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(async (err) => {
    if (err) {
      logger.error('Error closing HTTP server', { err });
    }
    await disconnectPrisma();
    process.exit(err ? 1 : 0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after 10s grace period');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err });

  process.exit(1);
});
