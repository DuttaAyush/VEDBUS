import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';

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
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../../src/prisma';
import authRoutes from '../../src/routes/auth';

const db = prisma as any;

function createAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

describe('Admin OTP verification flow', () => {
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@yatrabus.in').toLowerCase();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecretPassword@2026';

  beforeEach(() => {
    jest.clearAllMocks();
    db.admin.findUnique.mockResolvedValue(null);
    db.admin.create.mockResolvedValue({
      id: 'super-admin-id-1',
      name: 'Super Admin',
      email: superAdminEmail,
      phone: '+919999988888',
      role: 'SUPER_ADMIN',
      isActive: true,
      tokenVersion: 0,
    });
  });

  it('rejects OTP request with invalid credentials', async () => {
    const res = await request(createAuthApp())
      .post('/api/auth/admin-otp')
      .send({
        email: superAdminEmail,
        password: 'WrongPassword',
        adminType: 'SUPER_ADMIN',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('generates OTP successfully for Super Admin when credentials match env', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const otpRes = await request(createAuthApp())
      .post('/api/auth/admin-otp')
      .send({
        email: superAdminEmail,
        password: superAdminPassword,
        adminType: 'SUPER_ADMIN',
      });

    expect(otpRes.status).toBe(200);
    expect(otpRes.body.success).toBe(true);

    // Extract OTP logged to console
    const logCalls = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    const otpMatch = logCalls.match(/>>> (\d{6}) <<</);
    expect(otpMatch).not.toBeNull();
    const otpCode = otpMatch![1];

    // Login with the retrieved OTP
    const loginRes = await request(createAuthApp())
      .post('/api/auth/login')
      .send({
        email: superAdminEmail,
        password: superAdminPassword,
        otp: otpCode,
        adminType: 'SUPER_ADMIN',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.role).toBe('SUPER_ADMIN');

    consoleSpy.mockRestore();
  });

  it('rejects login with an incorrect OTP', async () => {
    const res = await request(createAuthApp())
      .post('/api/auth/login')
      .send({
        email: superAdminEmail,
        password: superAdminPassword,
        otp: '999999',
        adminType: 'SUPER_ADMIN',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
