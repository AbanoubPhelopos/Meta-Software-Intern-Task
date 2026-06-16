import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@config/env';
import { logger } from '@shared/utils/logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const disconnect = async (signal: string) => {
  logger.info('Shutting down: disconnecting Prisma', { signal });
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => void disconnect('SIGINT'));
process.on('SIGTERM', () => void disconnect('SIGTERM'));
