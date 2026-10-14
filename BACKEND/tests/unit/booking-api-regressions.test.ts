import express from 'express';
import request from 'supertest';

jest.mock('../../src/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    trip: { findUnique: jest.fn() },
    busBooking: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    tourPackage: { findFirst: jest.fn() },
    packageBooking: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../src/utils/seatLock', () => ({
  SEAT_HOLD_DURATION_SECONDS: 120,
  tryHoldSeats: jest.fn(),
  releaseSeats: jest.fn(),
  getHeldSeats: jest.fn(),
  verifySeatLocks: jest.fn(),
}));

import { prisma } from '../../src/prisma';
import bookingsRoutes from '../../src/routes/bookings';
import packagesRoutes from '../../src/routes/packages';
import { generateAccessToken } from '../../src/middleware/auth';
import { verifySeatLocks } from '../../src/utils/seatLock';

const db = prisma as any;
const verifyLocks = verifySeatLocks as jest.Mock;
const USER_ID = 'unit-booking-user-0000-0000-0000-000000000001';
const TRIP_ID = 'unit-trip-00000000-0000-0000-0000-000000000002';

function createBookingApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/packages', packagesRoutes);
  return app;
}

function authHeader() {
  return `Bearer ${generateAccessToken(USER_ID, 'USER', 0, 'user')}`;
}

function validTrip() {
  return {
    id: TRIP_ID,
    status: 'Scheduled',
    departureDatetime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    baseFare: 100,
    seatPricingConfig: { L1: 100 },
    seatStatuses: {},
    bus: { totalSeats: 4, status: 'Active', busStyle: 'seater', type: 'Seater' },
  };
}

function validBusBookingBody(overrides: Record<string, unknown> = {}) {
  return {
    tripId: TRIP_ID,
    selectedSeats: ['L1'],
    passengers: [{ name: 'Asha Unit', age: 34, gender: 'female', seat: 'L1' }],
    contact: { email: 'asha@example.test', phone: '+919000000001' },
    requestKey: 'checkout-key-0001',
    totalAmount: 105,
    ...overrides,
  };
}

describe('booking and package API regressions with mocked persistence', () => {
  const tx = {
    $queryRaw: jest.fn(),
    trip: { findUnique: jest.fn() },
    busBooking: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    packageBooking: { create: jest.fn() },
    offer: { findUnique: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    db.user.findUnique.mockResolvedValue({
      id: USER_ID,
      role: 'USER',
      isActive: true,
      tokenVersion: 0,
    });
    db.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.trip.findUnique.mockResolvedValue(validTrip());
    tx.busBooking.findUnique.mockResolvedValue(null);
    tx.busBooking.findFirst.mockResolvedValue(null);
    tx.$queryRaw.mockResolvedValue([]);
    verifyLocks.mockResolvedValue({ valid: true, unauthorizedSeats: [] });
  });

  it('rejects duplicate seats before opening a transaction', async () => {
    const response = await request(createBookingApp())
      .post('/api/bookings')
      .set('Authorization', authHeader())
      .send(validBusBookingBody({ selectedSeats: ['L1', 'L1'] }));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an invalid trip without attempting an insert', async () => {
    tx.trip.findUnique.mockResolvedValue(null);

    const response = await request(createBookingApp())
      .post('/api/bookings')
      .set('Authorization', authHeader())
      .send(validBusBookingBody());

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(tx.busBooking.create).not.toHaveBeenCalled();
  });

  it('rejects checkout when the seat hold is missing or belongs to another owner', async () => {
    verifyLocks.mockResolvedValue({ valid: false, unauthorizedSeats: ['L1'] });

    const response = await request(createBookingApp())
      .post('/api/bookings')
      .set('Authorization', authHeader())
      .send(validBusBookingBody());

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/hold expired/i);
    expect(tx.busBooking.create).not.toHaveBeenCalled();
  });

  it('does not report booking success when the persistence insert fails', async () => {
    tx.busBooking.create.mockRejectedValue(new Error('simulated insert failure'));

    const response = await request(createBookingApp())
      .post('/api/bookings')
      .set('Authorization', authHeader())
      .send(validBusBookingBody({ requestKey: 'checkout-key-insert-failure' }));

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeUndefined();
  });

  it('keeps a successful booking in Pending state and releases its hold', async () => {
    tx.busBooking.create.mockResolvedValue({ id: 'YB-unit', status: 'Pending', seatNumbers: ['L1'] });

    const response = await request(createBookingApp())
      .post('/api/bookings')
      .set('Authorization', authHeader())
      .send(validBusBookingBody({ requestKey: 'checkout-key-pending' }));

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.booking.status).toBe('Pending');
  });

  it('rejects an invalid package without creating a package booking', async () => {
    db.tourPackage = db.tourPackage || { findFirst: jest.fn() };
    db.tourPackage.findFirst.mockResolvedValue(null);

    const response = await request(createBookingApp())
      .post('/api/packages/book')
      .set('Authorization', authHeader())
      .send({
        packageId: 'missing-package',
        travelersCount: 1,
        travelDate: '2099-01-01',
        travelers: [{ name: 'Asha', age: 34 }],
        contact: { email: 'asha@example.test', phone: '+919000000001' },
        requestKey: 'package-key-0001',
        totalAmount: 1,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(db.packageBooking.create).not.toHaveBeenCalled();
  });

  it('does not report package success when its insert fails', async () => {
    db.tourPackage.findFirst.mockResolvedValue({ id: 'package-1', pricePerPerson: 100 });
    db.packageBooking.create.mockRejectedValue(new Error('simulated package insert failure'));

    const response = await request(createBookingApp())
      .post('/api/packages/book')
      .set('Authorization', authHeader())
      .send({
        packageId: 'package-1',
        travelersCount: 1,
        travelDate: '2099-01-01',
        travelers: [{ name: 'Asha', age: 34 }],
        contact: { email: 'asha@example.test', phone: '+919000000001' },
        requestKey: 'package-key-insert-failure',
        totalAmount: 105,
      });

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeUndefined();
  });
});
