import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../../src/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    admin: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../../src/prisma';
import authRoutes from '../../src/routes/auth';
import { generateAccessToken } from '../../src/middleware/auth';

const db = prisma as any;
const USER_ID = 'unit-user-00000000-0000-0000-0000-000000000001';
const ADMIN_ID = 'unit-admin-0000000-0000-0000-0000-000000000002';

function createAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

const userAccount = (overrides: Record<string, unknown> = {}) => ({
  id: USER_ID,
  name: 'Unit User',
  email: 'unit-user@example.test',
  phone: '+910000000001',
  passwordHash: 'stored-password-hash',
  role: 'USER',
  isActive: true,
  tokenVersion: 0,
  ...overrides,
});

describe('authentication security regressions without a database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.user.findFirst.mockResolvedValue(null);
    db.user.findUnique.mockResolvedValue(null);
    db.admin.findFirst.mockResolvedValue(null);
    db.admin.findUnique.mockResolvedValue(null);
  });

  it('rejects an omitted password before querying accounts', async () => {
    const response = await request(createAuthApp())
      .post('/api/auth/login')
      .send({ email: 'unit-user@example.test' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(db.admin.findFirst).not.toHaveBeenCalled();
    expect(db.user.findFirst).not.toHaveBeenCalled();
  });

  it('rejects a blank password without issuing a session', async () => {
    const response = await request(createAuthApp())
      .post('/api/auth/login')
      .send({ email: 'unit-user@example.test', password: '   ' });

    // The current route treats a whitespace string as a supplied password and
    // still rejects it. This assertion protects the no-success contract while
    // leaving the stricter trim-before-query change to the source owner.
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('rejects a blank password before a real account can receive a session', async () => {
    db.user.findFirst.mockResolvedValue(userAccount());
    const response = await request(createAuthApp())
      .post('/api/auth/login')
      .send({ email: 'unit-user@example.test', password: '   ' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('rejects a malformed password payload before querying accounts', async () => {
    const response = await request(createAuthApp()).post('/api/auth/login').send({ email: 'unit-user@example.test', password: null });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(db.admin.findFirst).not.toHaveBeenCalled();
    expect(db.user.findFirst).not.toHaveBeenCalled();
  });

  it('rejects an incorrect password with no session', async () => {
    db.user.findFirst.mockResolvedValue(userAccount());

    const response = await request(createAuthApp())
      .post('/api/auth/login')
      .send({ email: 'unit-user@example.test', password: 'incorrect-password' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('does not turn a failed registration insert into a success response', async () => {
    db.user.create.mockRejectedValue(new Error('simulated insert failure'));

    const response = await request(createAuthApp())
      .post('/api/auth/register')
      .send({
        name: 'Insert Failure',
        email: 'insert-failure@example.test',
        phone: '+910000000099',
        password: 'correct-password',
      });

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeUndefined();
  });

  it('rejects a demo token when its account does not exist', async () => {
    const token = generateAccessToken('demo-user-id', 'USER', 0, 'user');

    const response = await request(createAuthApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/expired|disabled/i);
    expect(db.admin.findUnique).not.toHaveBeenCalled();
    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: 'demo-user-id' } });
  });

  it.each([
    ['disabled account', userAccount({ isActive: false }), 0],
    ['stale token version', userAccount({ tokenVersion: 2 }), 1],
  ])('rejects a token for a %s', async (_label, account, tokenVersion) => {
    db.user.findUnique.mockResolvedValue(account);
    const token = generateAccessToken(USER_ID, 'USER', tokenVersion, 'user');

    const response = await request(createAuthApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('resolves a user token by user kind and ignores an admin row with the same role-shaped claims', async () => {
    db.user.findUnique.mockResolvedValue(userAccount());
    db.admin.findUnique.mockResolvedValue({
      id: USER_ID,
      role: 'ADMIN',
      isActive: true,
      tokenVersion: 0,
    });
    const token = generateAccessToken(USER_ID, 'USER', 0, 'user');

    const response = await request(createAuthApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(USER_ID);
    expect(db.admin.findUnique).not.toHaveBeenCalled();
  });

  it('requires an admin-kind token to resolve an admin account', async () => {
    db.admin.findUnique.mockResolvedValue({
      id: ADMIN_ID,
      name: 'Unit Admin',
      email: 'unit-admin@example.test',
      phone: null,
      passwordHash: 'stored-password-hash',
      role: 'ADMIN',
      isActive: true,
      tokenVersion: 3,
    });
    const token = jwt.sign(
      { id: ADMIN_ID, role: 'ADMIN', tokenVersion: 3, kind: 'admin' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1h' },
    );

    const response = await request(createAuthApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(ADMIN_ID);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
});
