import request from 'supertest';
import { app } from '../../src/app';
import { cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Tracking API (/api/tracking)', () => {
  let sampleTripId: string;

  beforeAll(() => { sampleTripId = fixture.trip.id; });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('GET /api/tracking/:tripId - should return 404 for nonexistent trip', async () => {
    const res = await request(app).get('/api/tracking/nonexistent-trip-999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tracking/:tripId - should return progress and metadata for valid trip', async () => {
    const res = await request(app).get(`/api/tracking/${sampleTripId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('progressPercentage');
    expect(res.body.data).toHaveProperty('busPlate');
    expect(res.body.data).toHaveProperty('origin');
    expect(res.body.data).toHaveProperty('destination');
  });
});
