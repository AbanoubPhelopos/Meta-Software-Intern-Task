import jwt, { type SignOptions } from 'jsonwebtoken';

// Deliberately does NOT extend `JwtPayload` from jsonwebtoken — that type
// declares `sub` as `string` per RFC 7519, but we want a numeric user id
// for ergonomic call sites. Our signed tokens are internal to this app,
// so the JWT-spec non-compliance is a contained, deliberate choice.
export interface TokenPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

type InputPayload = Pick<TokenPayload, 'sub' | 'email'>;

export const signToken = (
  payload: InputPayload,
  secret: string,
  expiresIn: string | number,
): string => {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  const decoded = jwt.verify(token, secret) as unknown as TokenPayload;

  if (typeof decoded.sub !== 'number' || typeof decoded.email !== 'string') {
    throw new Error('Invalid token payload');
  }

  return decoded;
};
