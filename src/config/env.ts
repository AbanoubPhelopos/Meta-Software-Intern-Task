import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Coercion is used for numeric values that arrive as strings (everything in
// process.env is a string); z.coerce.number() parses them at the boundary.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Use console.error, not the logger — the logger depends on env, and we
  // want a clear boot-time failure message before anything else runs.
  console.error('\n❌ Invalid environment variables:\n');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  console.error('\nSee .env.example for the full list of expected variables.\n');
  process.exit(1);
}

// Production-only guard: refuse to boot with the placeholder secret.
if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET.includes('replace-me')) {
  console.error(
    '\n❌ JWT_SECRET is still set to the placeholder value. Refusing to start in production.\n',
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
