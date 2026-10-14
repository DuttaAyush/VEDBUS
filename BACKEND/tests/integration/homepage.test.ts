import request from 'supertest';
import { app } from '../../src/app';
import { cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Homepage Aggregator API (/api/homepage)', () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  it('GET /api/homepage - should return popularRoutes, offers, and featuredPackages', async () => {
    const res = await request(app).get('/api/homepage');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('offers');
    expect(res.body.data).toHaveProperty('popularRoutes');
    expect(res.body.data).toHaveProperty('featuredPackages');
    expect(Array.isArray(res.body.data.popularRoutes)).toBe(true);
  });
});
