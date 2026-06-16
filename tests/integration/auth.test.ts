import request from 'supertest';
import type { Express } from 'express';
import { prisma } from '@config/database';
import { getTestApp } from '../helpers/test-app';
import { cleanDb } from '../helpers/db';

describe('POST /api/v1/auth/register', () => {
  let app: Express;

  beforeAll(() => {
    app = getTestApp();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });

  it('returns 201 with user + token for valid input', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Jane', email: 'jane@example.com', password: 'correct-horse-battery-staple' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      name: 'Jane',
      email: 'jane@example.com',
    });
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.')).toHaveLength(3);
  });

  it('returns 409 when the email is already registered', async () => {
    const payload = { name: 'Dup', email: 'dup@example.com', password: 'longenough-password' };
    await request(app).post('/api/v1/auth/register').send(payload);
    const res = await request(app).post('/api/v1/auth/register').send(payload);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bad', email: 'not-an-email', password: 'longenough-password' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.email).toBeDefined();
  });

  it('returns 400 for a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Short', email: 'short@example.com', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.details.password).toBeDefined();
  });

  it('normalises the email (trim + lowercase) before storing', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Mixed', email: '  MIXED@Example.COM ', password: 'longenough-password' });

    const user = await prisma.user.findUnique({ where: { email: 'mixed@example.com' } });
    expect(user).not.toBeNull();
  });
});

describe('POST /api/v1/auth/login', () => {
  let app: Express;

  beforeAll(() => {
    app = getTestApp();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });

  it('returns 200 with user + token for correct credentials', async () => {
    const credentials = { email: 'login@example.com', password: 'longenough-password' };
    await request(app).post('/api/v1/auth/register').send({ name: 'Login', ...credentials });

    const res = await request(app).post('/api/v1/auth/login').send(credentials);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(typeof res.body.data.token).toBe('string');
  });

  it('returns 401 with the same message for an unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'longenough-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  it('returns 401 with the same message for a wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Login2', email: 'login2@example.com', password: 'longenough-password' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login2@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.message).toBe('Invalid email or password');
  });
});
