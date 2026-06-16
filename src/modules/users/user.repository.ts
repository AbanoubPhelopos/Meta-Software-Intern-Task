import type { Prisma, User } from '@prisma/client';
import { prisma } from '@config/database';

export const findByEmail = (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

export const findById = (id: number): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const create = (data: Prisma.UserCreateInput): Promise<User> => {
  return prisma.user.create({ data });
};
