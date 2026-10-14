import request from 'supertest';
import { app } from '../../src/app';
import { cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Bookings API (/api/bookings)', () => {
  let sampleTripId: string;

  beforeAll(() => { sampleTripId = fixture.trip.id; });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/bookings/seats', () => {
    it('should fail with 400 when neither tripId nor busId is supplied', async () => {
      const res = await request(app).get('/api/bookings/seats');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should return booked and held seats for a valid trip', async () => {
      const res = await request(app)
        .get('/api/bookings/seats')
        .query({ tripId: sampleTripId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('bookedSeats');
      expect(Array.isArray(res.body.data.bookedSeats)).toBe(true);
    });
  });

  describe('POST /api/bookings/hold', () => {
    it('should fail with 400 if selectedSeats is empty or invalid', async () => {
      const res = await request(app)
        .post('/api/bookings/hold')
        .set(fixture.userAuth())
        .send({ tripId: sampleTripId, selectedSeats: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should acquire temporary seat hold for checkout', async () => {
      const res = await request(app)
        .post('/api/bookings/hold')
        .set(fixture.userAuth())
        .send({
          tripId: sampleTripId,
          selectedSeats: ['L1'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.heldSeats).toContain('L1');
    });

    it('should fail with 409 if another client attempts to hold the same seat', async () => {
      const res = await request(app)
        .post('/api/bookings/hold')
        .set(fixture.rivalAuth())
        .send({
          tripId: sampleTripId,
          selectedSeats: ['L1'],
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/bookings/release', () => {
    it('should release held seats cleanly', async () => {
      const res = await request(app)
        .post('/api/bookings/release')
        .set(fixture.userAuth())
        .send({
          tripId: sampleTripId,
          selectedSeats: ['L1'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/bookings (Create Booking)', () => {
    it('should fail with 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ tripId: sampleTripId, selectedSeats: ['Z1'] });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 400 when selectedSeats is missing', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set(fixture.userAuth())
        .send({ tripId: sampleTripId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully confirm booking with valid details', async () => {
      await request(app)
        .post('/api/bookings/hold')
        .set(fixture.userAuth())
        .send({ tripId: sampleTripId, selectedSeats: ['L2'] });
      const res = await request(app)
        .post('/api/bookings')
        .set(fixture.userAuth())
        .send(fixture.busBody('L2'));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking).toHaveProperty('id');
      expect(res.body.data.booking.seatNumbers).toContain('L2');
    });
  });
});
