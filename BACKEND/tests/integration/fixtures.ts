import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../src/prisma';

export interface IntegrationFixture {
  userId: string;
  busId: string;
  routeId: string;
  tripId: string;
  packageId: string;
  origin: string;
  destination: string;
  bookingIds: string[];
  packageBookingIds: string[];
}

function uniquePhone(id: string) {
  const digits = BigInt(`0x${id.replace(/-/g, '').slice(0, 12)}`) % 10_000_000_000n;
  return `+91${digits.toString().padStart(10, '0')}`;
}

export async function createIntegrationFixture(label: string): Promise<IntegrationFixture> {
  const userId = randomUUID();
  const busId = randomUUID();
  const routeId = randomUUID();
  const tripId = randomUUID();
  const packageId = randomUUID();
  const now = Date.now();
  const email = `${label}-${userId}@integration.yatrabus.test`;
  const origin = `Integration Origin ${label}`;
  const destination = `Integration Destination ${label}`;

  await prisma.user.create({
    data: {
      id: userId,
      name: `Integration ${label}`,
      email,
      phone: uniquePhone(userId),
      passwordHash: await bcrypt.hash('integration-only-password', 4),
      role: 'USER',
      isActive: true,
      tokenVersion: 0,
    },
  });
  await prisma.bus.create({
    data: {
      id: busId,
      plateNumber: `TEST-${userId.slice(0, 8).toUpperCase()}`,
      type: 'Integration Seater',
      totalSeats: 4,
      amenities: { charging: true },
      status: 'Active',
      busStyle: 'seater',
    },
  });
  await prisma.route.create({
    data: { id: routeId, originCity: origin, destinationCity: destination, waypoints: [], distanceKm: 100 },
  });
  await prisma.trip.create({
    data: {
      id: tripId,
      busId,
      routeId,
      departureDatetime: new Date(now + 24 * 60 * 60 * 1000),
      arrivalDatetime: new Date(now + 26 * 60 * 60 * 1000),
      baseFare: 100,
      status: 'Scheduled',
      seatPricingConfig: { L1: 100, L2: 100 },
      seatStatuses: {},
    },
  });
  await prisma.tourPackage.create({
    data: {
      id: packageId,
      title: `Integration Package ${label}`,
      category: 'Domestic',
      pricePerPerson: 250,
      durationDays: 2,
      itinerary: { id: `integration-${label}` },
      isActive: true,
    },
  });

  return { userId, busId, routeId, tripId, packageId, origin, destination, bookingIds: [], packageBookingIds: [] };
}

export async function cleanupIntegrationFixture(fixture: IntegrationFixture) {
  for (const bookingId of fixture.bookingIds) {
    await prisma.busBookingSeat.deleteMany({ where: { bookingId } });
    await prisma.busBooking.delete({ where: { id: bookingId } });
  }
  for (const bookingId of fixture.packageBookingIds) {
    await prisma.packageBooking.delete({ where: { id: bookingId } });
  }
  await prisma.trip.delete({ where: { id: fixture.tripId } });
  await prisma.route.delete({ where: { id: fixture.routeId } });
  await prisma.bus.delete({ where: { id: fixture.busId } });
  await prisma.tourPackage.delete({ where: { id: fixture.packageId } });
  await prisma.user.delete({ where: { id: fixture.userId } });
}
