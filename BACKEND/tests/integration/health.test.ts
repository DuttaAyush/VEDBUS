import request from 'supertest';
import { app } from '../../src/app';
import { cleanupTestData } from '../helpers/testUtils';

describe('Health Check API (/health)', () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  it('GET /health - should return 200 with service metadata', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'yatrabus-api');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
  });

  it('GET /api/nonexistent-route - should return 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: 'Route not found.',
    });
  });
});
