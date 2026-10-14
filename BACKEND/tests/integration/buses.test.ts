import request from 'supertest';
import { app } from '../../src/app';
import { cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Buses API (/api/buses)', () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/buses', () => {
    it('should return a list of active buses with plates and amenities', async () => {
      const res = await request(app).get('/api/buses');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const bus = res.body[0];
      expect(bus).toHaveProperty('plateNumber');
      expect(bus).toHaveProperty('totalSeats');
      expect(bus).toHaveProperty('amenities');
    });
  });

  describe('GET /api/buses/search', () => {
    it('should return scheduled trips when from and to are provided', async () => {
      const res = await request(app)
        .get('/api/buses/search')
        .query({ from: fixture.route.originCity, to: fixture.route.destinationCity });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      const trip = res.body[0];
      expect(trip).toHaveProperty('id');
      expect(trip).toHaveProperty('price');
      expect(trip).toHaveProperty('depTime');
      expect(trip).toHaveProperty('arrTime');
      expect(trip).toHaveProperty('seatsLeft');
      expect(trip).toHaveProperty('category');
    });

    it('should return no fabricated inventory when a route does not exist', async () => {
      const res = await request(app)
        .get('/api/buses/search')
        .query({ from: 'Surat', to: 'Indore' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual([]);
    });

    it('should filter search results by category', async () => {
      const res = await request(app)
        .get('/api/buses/search')
        .query({ from: fixture.route.originCity, to: fixture.route.destinationCity, category: 'sleeper' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((item: any) => {
        expect(item.category).toBe('sleeper');
      });
    });
  });
});
