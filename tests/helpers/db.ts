import { prisma } from '@config/database';

export const cleanDb = async (): Promise<void> => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
};
