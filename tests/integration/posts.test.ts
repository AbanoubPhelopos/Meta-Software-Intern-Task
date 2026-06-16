import request from 'supertest';
import type { Express } from 'express';
import { prisma } from '@config/database';
import { getTestApp } from '../helpers/test-app';
import { cleanDb } from '../helpers/db';

const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const register = async (app: Express, email: string, password = 'longenough-password') => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: email.split('@')[0] ?? 'user', email, password });
  return res.body.data as { user: { id: number; email: string }; token: string };
};

describe('GET /api/v1/posts', () => {
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

  it('returns an empty paginated list when there are no posts', async () => {
    const res = await request(app).get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  it('paginates and embeds the author on each post', async () => {
    const a = await register(app, `author-${stamp()}@example.com`);
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${a.token}`)
        .send({ title: `Post ${i}`, content: `Body ${i}` });
    }

    const page1 = await request(app).get('/api/v1/posts?page=1&limit=2');
    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(2);
    expect(page1.body.meta).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    expect(page1.body.data[0]).toHaveProperty('author.email');

    const page2 = await request(app).get('/api/v1/posts?page=2&limit=2');
    expect(page2.body.data).toHaveLength(1);
  });
});

describe('GET /api/v1/posts/:id', () => {
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

  it('returns 404 POST_NOT_FOUND for an id that does not exist', async () => {
    const res = await request(app).get('/api/v1/posts/99999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('POST_NOT_FOUND');
  });

  it('returns the post with author info when it exists', async () => {
    const a = await register(app, `author-${stamp()}@example.com`);
    const created = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Hello', content: 'World' });

    const postId = created.body.data.id;
    const res = await request(app).get(`/api/v1/posts/${postId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: postId,
      title: 'Hello',
      content: 'World',
      authorId: a.user.id,
    });
    expect(res.body.data.author.email).toBe(a.user.email);
  });
});

describe('POST /api/v1/posts', () => {
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

  it('returns 401 INVALID_TOKEN when the Authorization header is missing', async () => {
    const res = await request(app).post('/api/v1/posts').send({ title: 'X', content: 'Y' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 when the body is missing required fields', async () => {
    const a = await register(app, `author-${stamp()}@example.com`);
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates a post linked to the authenticated user', async () => {
    const a = await register(app, `author-${stamp()}@example.com`);
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'New', content: 'Body' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: 'New',
      content: 'Body',
      authorId: a.user.id,
    });
    expect(res.body.data.author.email).toBe(a.user.email);
  });
});

describe('PUT /api/v1/posts/:id', () => {
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

  it('returns 403 NOT_POST_OWNER when a different user tries to edit', async () => {
    const a = await register(app, `owner-${stamp()}@example.com`);
    const b = await register(app, `intruder-${stamp()}@example.com`);
    const created = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Owned', content: 'A' });

    const res = await request(app)
      .put(`/api/v1/posts/${created.body.data.id}`)
      .set('Authorization', `Bearer ${b.token}`)
      .send({ title: 'Hijacked' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_POST_OWNER');
  });

  it('returns 400 on an empty body (refine rejected)', async () => {
    const a = await register(app, `owner-${stamp()}@example.com`);
    const created = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Owned', content: 'A' });

    const res = await request(app)
      .put(`/api/v1/posts/${created.body.data.id}`)
      .set('Authorization', `Bearer ${a.token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details._form).toBeDefined();
  });

  it('updates the post when called by the owner', async () => {
    const a = await register(app, `owner-${stamp()}@example.com`);
    const created = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Owned', content: 'A' });

    const res = await request(app)
      .put(`/api/v1/posts/${created.body.data.id}`)
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Owned v2' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Owned v2');
  });
});

describe('DELETE /api/v1/posts/:id', () => {
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

  it('returns 403 NOT_POST_OWNER when called by a non-owner', async () => {
    const a = await register(app, `owner-${stamp()}@example.com`);
    const b = await register(app, `intruder-${stamp()}@example.com`);
    const created = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Owned', content: 'A' });

    const res = await request(app)
      .delete(`/api/v1/posts/${created.body.data.id}`)
      .set('Authorization', `Bearer ${b.token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_POST_OWNER');
  });

  it('returns 204 and removes the post when called by the owner', async () => {
    const a = await register(app, `owner-${stamp()}@example.com`);
    const created = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Owned', content: 'A' });

    const postId = created.body.data.id;
    const res = await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/v1/posts/${postId}`);
    expect(after.status).toBe(404);
  });
});
