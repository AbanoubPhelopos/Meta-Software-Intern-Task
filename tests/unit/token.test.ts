import { signToken, verifyToken } from '@shared/utils/token';

const SECRET = 'a-test-secret-that-is-at-least-32-chars-long';
const OTHER_SECRET = 'a-different-test-secret-of-equal-or-greater-length';

describe('token utilities', () => {
  it('signs a token that decodes back to the original payload', () => {
    const token = signToken({ sub: 42, email: 'jane@example.com' }, SECRET, '1h');
    const payload = verifyToken(token, SECRET);
    expect(payload.sub).toBe(42);
    expect(payload.email).toBe('jane@example.com');
  });

  it('throws when the token is signed with a different secret', () => {
    const token = signToken({ sub: 1, email: 'a@b.com' }, SECRET, '1h');
    expect(() => verifyToken(token, OTHER_SECRET)).toThrow();
  });

  it('throws on a malformed token', () => {
    expect(() => verifyToken('not-a-real-jwt', SECRET)).toThrow();
  });

  it('rejects a token whose sub is not numeric', () => {
    const bad = signToken(
      { sub: 'not-a-number' as unknown as number, email: 'a@b.com' },
      SECRET,
      '1h',
    );
    expect(() => verifyToken(bad, SECRET)).toThrow(/Invalid token payload/);
  });
});
