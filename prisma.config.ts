// Prisma CLI configuration (Prisma 7+ pattern).
//
// The `datasource.url` previously lived inside `prisma/schema.prisma`;
// Prisma 7 removed that field and requires the URL here for CLI commands
// (Migrate, Studio, db push, etc.). The runtime PrismaClient receives
// its connection through a driver adapter in `src/config/database.ts`.

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
