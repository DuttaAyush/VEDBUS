import request from 'supertest';
import { app } from '../../src/app';
import { cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Offers API (/api/offers)', () => {
  const sampleOfferCode = fixture.offer.code;

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/offers', () => {
    it('should return list of active offers', async () => {
      const res = await request(app).get('/api/offers');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/offers/validate', () => {
    it('should fail with 400 when offer code is missing', async () => {
      const res = await request(app).post('/api/offers/validate').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail with 400 when offer code is invalid or expired', async () => {
      const res = await request(app)
        .post('/api/offers/validate')
        .send({ code: 'TOTALLY_INVALID_CODE_999' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired');
    });

    it('should return 200 with discount percentage when offer code is valid', async () => {
      const res = await request(app)
        .post('/api/offers/validate')
        .send({ code: sampleOfferCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('discountPercentage');
      expect(res.body.data.code).toBe(sampleOfferCode);
    });
  });
});
