import { comparePassword, hashPassword } from '@shared/utils/password';

describe('password utilities', () => {
  const plain = 'correct-horse-battery-staple';

  it('hashes a plaintext password', async () => {
    const hash = await hashPassword(plain, 4);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('produces a different hash for the same plaintext (salt is random)', async () => {
    const a = await hashPassword(plain, 4);
    const b = await hashPassword(plain, 4);
    expect(a).not.toBe(b);
  });

  it('returns true when the plaintext matches the hash', async () => {
    const hash = await hashPassword(plain, 4);
    await expect(comparePassword(plain, hash)).resolves.toBe(true);
  });

  it('returns false when the plaintext does not match the hash', async () => {
    const hash = await hashPassword(plain, 4);
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('rejects on a malformed hash without throwing', async () => {
    await expect(comparePassword(plain, 'not-a-real-bcrypt-hash')).resolves.toBe(false);
  });
});
