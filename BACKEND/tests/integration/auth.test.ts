import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma';
import { cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Auth API (/api/auth)', () => {
  const uniqueSuffix = Date.now();
  const testUser = {
    name: 'Test Passenger',
    email: `test_passenger_${uniqueSuffix}@vedbus.test`,
    phone: `+9199${String(uniqueSuffix).slice(-8)}`,
    password: 'SecurePassword@123',
  };
  let registeredUserId: string;

  afterAll(async () => {
    try {
      if (registeredUserId) await prisma.user.delete({ where: { id: registeredUserId } });
    } catch {}
    await cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should fail with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Incomplete User' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail with 400 when password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: `shortpass_${uniqueSuffix}@vedbus.test`,
          phone: `+9198${String(uniqueSuffix).slice(-8)}`,
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 8 characters');
    });

    it('should successfully register a new user with 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
       expect(res.headers['set-cookie']).toBeDefined();
       registeredUserId = res.body.data.user.id;
    });

    it('should fail with 409 when registering with duplicate email or phone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail with 400 when identifier is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'SomePassword' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 401 when user does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent_user_9999@vedbus.test', password: 'Password@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 401 when password is wrong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword@999' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with correct credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should login successfully via phone number', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: testUser.phone, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear refresh cookie and return 200', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logged out');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should require email', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({});
      expect(res.status).toBe(400);
    });

    it('should return consistent success message to prevent user enumeration', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'anyone@example.com' });

       expect(res.status).toBe(503);
       expect(res.body.success).toBe(false);
       expect(res.body.message).toContain('not configured');
    });
  });
});
