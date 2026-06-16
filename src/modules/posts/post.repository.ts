import type { Prisma } from '@prisma/client';
import { prisma } from '@config/database';

// Author is embedded on every read so the response shape is consistent
// between the list and the single-post endpoints.
const postWithAuthor = {
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PostInclude;

export const findById = (id: number) => {
  return prisma.post.findUnique({ where: { id }, include: postWithAuthor });
};

export const findMany = (params: { skip: number; take: number; authorId?: number }) => {
  return prisma.post.findMany({
    skip: params.skip,
    take: params.take,
    orderBy: { createdAt: 'desc' },
    where: params.authorId !== undefined ? { authorId: params.authorId } : undefined,
    include: postWithAuthor,
  });
};

export const count = (authorId?: number): Promise<number> => {
  return prisma.post.count({
    where: authorId !== undefined ? { authorId } : undefined,
  });
};

export const create = (data: Prisma.PostCreateInput) => {
  return prisma.post.create({ data, include: postWithAuthor });
};

export const update = (id: number, data: Prisma.PostUpdateInput) => {
  return prisma.post.update({ where: { id }, data, include: postWithAuthor });
};

export const remove = (id: number) => {
  return prisma.post.delete({ where: { id } });
};
