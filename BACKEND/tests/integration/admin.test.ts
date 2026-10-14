import request from 'supertest';
import { app } from '../../src/app';
import { getAdminAuthHeader, getUserAuthHeader, cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Admin API (/api/admin)', () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Security & RBAC Guards', () => {
    it('should fail with 401 when accessing admin routes without a token', async () => {
      const res = await request(app).get('/api/admin/dashboard/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 403 when a normal USER attempts to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set(getUserAuthHeader(fixture.user.id));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admins only');
    });
  });

  describe('GET /api/admin/dashboard/stats', () => {
    it('should return KPI stats, revenueChart, and combined recentBookings for ADMIN', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set(getAdminAuthHeader(fixture.admin.id));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stats');
      expect(res.body.data).toHaveProperty('revenueChart');
      expect(res.body.data).toHaveProperty('recentBookings');

      const stats = res.body.data.stats;
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalBookings');
      expect(stats).toHaveProperty('totalRevenue');

      const rec = res.body.data.recentBookings;
      expect(Array.isArray(rec)).toBe(true);
      if (rec.length > 0) {
        expect(rec[0]).toHaveProperty('id');
        expect(rec[0]).toHaveProperty('type');
        expect(rec[0]).toHaveProperty('customer');
        expect(rec[0]).toHaveProperty('amount');
        expect(rec[0]).toHaveProperty('status');
      }
    });
  });

  describe('GET /api/admin/bookings', () => {
    it('should return paginated list of bus bookings for admin', async () => {
      const res = await request(app)
        .get('/api/admin/bookings')
        .set(getAdminAuthHeader(fixture.admin.id));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('bookings');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
    });

    it('should filter bookings by status', async () => {
      const res = await request(app)
        .get('/api/admin/bookings')
        .query({ status: 'Confirmed' })
        .set(getAdminAuthHeader(fixture.admin.id));

      expect(res.status).toBe(200);
      res.body.data.bookings.forEach((b: any) => {
        expect(b.status).toBe('Confirmed');
      });
    });
  });

  describe('GET /api/admin/package-bookings', () => {
    it('should return paginated package bookings for admin', async () => {
      const res = await request(app)
        .get('/api/admin/package-bookings')
        .set(getAdminAuthHeader(fixture.admin.id));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('bookings');
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
    });
  });

  describe('GET /api/admin/fleet', () => {
    it('should return fleet buses list for admin', async () => {
      const res = await request(app)
        .get('/api/admin/fleet')
        .set(getAdminAuthHeader(fixture.admin.id));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/admin/routes', () => {
    it('should return routes list for admin', async () => {
      const res = await request(app)
        .get('/api/admin/routes')
        .set(getAdminAuthHeader(fixture.admin.id));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
