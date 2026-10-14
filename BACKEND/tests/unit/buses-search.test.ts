import express from 'express';
import request from 'supertest';

jest.mock('../../src/prisma', () => ({
  prisma: {
    bus: { findMany: jest.fn(), create: jest.fn() },
    route: { findMany: jest.fn(), create: jest.fn() },
    trip: { findMany: jest.fn(), create: jest.fn() },
    busBooking: { findMany: jest.fn(), create: jest.fn() },
  },
}));

import { prisma } from '../../src/prisma';
import busesRoutes from '../../src/routes/buses';

const db = prisma as any;

function createBusesApp() {
  const app = express();
  app.use('/api/buses', busesRoutes);
  return app;
}

describe('bus search regression boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.route.findMany.mockResolvedValue([]);
    db.busBooking.findMany.mockResolvedValue([]);
    db.bus.findMany.mockResolvedValue([]);
  });

  it('returns no inventory for an unknown route instead of fabricating a trip', async () => {
    const response = await request(createBusesApp())
      .get('/api/buses/search')
      .query({ from: 'Unknown City', to: 'Unknown Destination' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(db.route.create).not.toHaveBeenCalled();
    expect(db.trip.create).not.toHaveBeenCalled();
    expect(db.bus.create).not.toHaveBeenCalled();
  });

  it('reads matching trips and occupancy without writing inventory', async () => {
    db.route.findMany.mockResolvedValue([{
      id: 'route-1',
      originCity: 'Nagpur',
      destinationCity: 'Pune',
      waypoints: [],
      trips: [{
        id: 'trip-1',
        departureDatetime: new Date('2099-01-01T10:00:00.000Z'),
        arrivalDatetime: new Date('2099-01-01T20:00:00.000Z'),
        baseFare: 850,
        status: 'Scheduled',
        bus: { totalSeats: 36, busStyle: 'sleeper', type: 'Sleeper', plateNumber: 'TEST-1', amenities: {} },
        route: { originCity: 'Nagpur', destinationCity: 'Pune', waypoints: [] },
      }],
    }]);

    const response = await request(createBusesApp())
      .get('/api/buses/search')
      .query({ from: 'Nagpur', to: 'Pune' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ id: 'trip-1', seatsLeft: 36, price: 850 });
    expect(db.busBooking.findMany).toHaveBeenCalledWith({
      where: { tripId: { in: ['trip-1'] }, status: { in: ['Pending', 'Confirmed'] } },
      select: { tripId: true, seatNumbers: true },
    });
    expect(db.route.create).not.toHaveBeenCalled();
    expect(db.trip.create).not.toHaveBeenCalled();
    expect(db.bus.create).not.toHaveBeenCalled();
  });
});
