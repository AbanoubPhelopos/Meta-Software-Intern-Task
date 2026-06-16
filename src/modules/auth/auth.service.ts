import { Prisma } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../shared/errors/ApiError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { signToken } from '../../shared/utils/token';
import type { LoginInput, RegisterInput } from './auth.schema';
import * as userRepository from '../users/user.repository';

export interface AuthResult {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

const issueToken = (user: { id: number; email: string }): string => {
  return signToken({ sub: user.id, email: user.email }, env.JWT_SECRET, env.JWT_EXPIRES_IN);
};

const toPublic = (user: { id: number; name: string; email: string }): AuthResult['user'] => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw ApiError.conflict('Email is already registered', ErrorCodes.EMAIL_ALREADY_EXISTS);
  }

  const hashed = await hashPassword(input.password, env.BCRYPT_SALT_ROUNDS);

  try {
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashed,
    });
    return { user: toPublic(user), token: issueToken(user) };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw ApiError.conflict('Email is already registered', ErrorCodes.EMAIL_ALREADY_EXISTS);
    }
    throw err;
  }
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await userRepository.findByEmail(input.email);

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password', ErrorCodes.INVALID_CREDENTIALS);
  }

  const ok = await comparePassword(input.password, user.password);
  if (!ok) {
    throw ApiError.unauthorized('Invalid email or password', ErrorCodes.INVALID_CREDENTIALS);
  }

  return { user: toPublic(user), token: issueToken(user) };
};
