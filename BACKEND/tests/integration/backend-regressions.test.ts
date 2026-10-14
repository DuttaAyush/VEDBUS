import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma';
import { cleanupIntegrationFixture, createIntegrationFixture, IntegrationFixture } from './fixtures';

describe('isolated backend integration regressions', () => {
  let fixture: IntegrationFixture;

  beforeAll(async () => {
    fixture = await createIntegrationFixture(`backend-${Date.now()}`);
  });

  afterAll(async () => {
    if (fixture) {
      await cleanupIntegrationFixture(fixture);
      await prisma.$disconnect();
    }
  });

  function userAuthHeader() {
    const token = jwt.sign(
      { id: fixture.userId, role: 'USER', tokenVersion: 0, kind: 'user' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1h' },
    );
    return { Authorization: `Bearer ${token}` };
  }

  it('searches real trips without fabricating or inserting inventory', async () => {
    const before = await prisma.trip.count({ where: { id: fixture.tripId } });
    const response = await request(app)
      .get('/api/buses/search')
      .query({ from: fixture.origin, to: fixture.destination });

    expect(response.status).toBe(200);
    expect(response.body.some((trip: { id: string }) => trip.id === fixture.tripId)).toBe(true);
    expect(await prisma.trip.count({ where: { id: fixture.tripId } })).toBe(before);
    expect(await prisma.bus.count({ where: { id: fixture.busId } })).toBe(1);
  });

  it('requires valid trip seats and creates a Pending booking with a real hold', async () => {
    const invalid = await request(app)
      .post('/api/bookings/hold')
      .set(userAuthHeader())
      .send({ tripId: fixture.tripId, selectedSeats: ['Z1'] });
    expect(invalid.status).toBe(400);

    const hold = await request(app)
      .post('/api/bookings/hold')
      .set(userAuthHeader())
      .send({ tripId: fixture.tripId, selectedSeats: ['L1'] });
    expect(hold.status).toBe(200);

    const response = await request(app)
      .post('/api/bookings')
      .set(userAuthHeader())
      .send({
        tripId: fixture.tripId,
        selectedSeats: ['L1'],
        passengers: [{ name: 'Integration Passenger', age: 34, gender: 'female', seat: 'L1' }],
        contact: { email: 'passenger@integration.yatrabus.test', phone: '+919000000001' },
        requestKey: `booking-${fixture.tripId}`,
        totalAmount: 105,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.booking.status).toBe('Pending');
    expect(response.body.data.booking.seatNumbers).toEqual(['L1']);
    fixture.bookingIds.push(response.body.data.booking.id);
  });

  it('creates a Pending package booking only with complete valid data', async () => {
    const invalid = await request(app)
      .post('/api/packages/book')
      .set(userAuthHeader())
      .send({ packageId: 'missing-package', travelersCount: 1, requestKey: 'invalid-package-key' });
    expect(invalid.status).toBe(409);

    const response = await request(app)
      .post('/api/packages/book')
      .set(userAuthHeader())
      .send({
        packageId: fixture.packageId,
        travelersCount: 1,
        travelDate: '2099-01-01',
        travelers: [{ name: 'Integration Traveler', age: 34 }],
        contact: { email: 'traveler@integration.yatrabus.test', phone: '+919000000002' },
        requestKey: `package-${fixture.packageId}`,
        totalAmount: 263,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.booking.status).toBe('Pending');
    fixture.packageBookingIds.push(response.body.data.booking.id);
  });

  it('rejects an access token after the account is disabled', async () => {
    await prisma.user.update({ where: { id: fixture.userId }, data: { isActive: false } });
    try {
      const response = await request(app).get('/api/auth/me').set(userAuthHeader());
      expect(response.status).toBe(401);
    } finally {
      await prisma.user.update({ where: { id: fixture.userId }, data: { isActive: true } });
    }
  });
});
