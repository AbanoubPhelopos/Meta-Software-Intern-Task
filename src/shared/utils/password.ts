import bcrypt from 'bcrypt';

export const hashPassword = (plain: string, saltRounds: number): Promise<string> => {
  return bcrypt.hash(plain, saltRounds);
};

export const comparePassword = (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
