import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/prisma';
import { releaseSeats } from '../../src/utils/seatLock';

export function authHeader(account: { id: string; role: string; tokenVersion: number }, kind: 'user' | 'admin') {
  return { Authorization: `Bearer ${jwt.sign({ id: account.id, role: account.role, tokenVersion: account.tokenVersion, kind }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '1h' })}` };
}

export function generateTestToken(id: string, role: 'USER' | 'ADMIN' | 'SUPER_ADMIN', tokenVersion = 0, kind: 'user' | 'admin' = role === 'USER' ? 'user' : 'admin') {
  return jwt.sign({ id, role, tokenVersion, kind }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '1h' });
}

export function getUserAuthHeader(id: string) {
  return { Authorization: `Bearer ${generateTestToken(id, 'USER', 0, 'user')}` };
}

export function getAdminAuthHeader(id: string) {
  return { Authorization: `Bearer ${generateTestToken(id, 'ADMIN', 0, 'admin')}` };
}

export const TEST_USER_ID = 'b9a6911a-6f7c-4654-9843-f31ea1d58523';
export const TEST_ADMIN_ID = 'cf83b6c9-7799-4a9b-8516-21c9403fe5f8';

export async function ensureTestUser() {
  try {
    await prisma.user.upsert({
      where: { id: TEST_USER_ID },
      update: {},
      create: {
        id: TEST_USER_ID,
        name: 'Test Customer',
        email: 'test.customer@yatrabus.test',
        phone: '+919000000001',
        passwordHash: '$2a$12$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstu',
        role: 'USER',
      },
    });
  } catch {}
}

/** Legacy suites must clean their own exact fixture IDs; this is intentionally not a DB disconnect. */
export async function cleanupTestData() { return undefined; }

/** A fresh fixture for EACH suite. No seed IDs, upserts, wildcard deletes, or shared accounts. */
export function useIntegrationFixture() {
  const suffix = randomUUID();
  const password = 'Fixture-password-123!';
  const account = (label: string) => ({
    id: randomUUID(), name: `Fixture ${label}`, email: `${label}-${suffix}@yatrabus.test`,
    phone: `+91${BigInt(`0x${randomUUID().replace(/-/g, '').slice(0, 12)}`).toString().slice(-10).padStart(10, '0')}`,
    passwordHash: bcrypt.hashSync(password, 4), role: 'USER' as const, isActive: true, tokenVersion: 0,
  });
  const user = account('user');
  const rival = account('rival');
  const admin = { ...account('admin'), role: 'ADMIN' as const };
  const bus = { id: randomUUID(), plateNumber: `TEST-${suffix}`, type: 'AC Sleeper', busStyle: 'sleeper', totalSeats: 36, amenities: { charging: true }, status: 'Active' as const };
  const route = { id: randomUUID(), originCity: `Origin-${suffix}`, destinationCity: `Destination-${suffix}`, waypoints: ['Fixture Stop'], distanceKm: 100 };
  const trip = {
    id: randomUUID(), busId: bus.id, routeId: route.id,
    departureDatetime: new Date(Date.now() + 7 * 86400000), arrivalDatetime: new Date(Date.now() + 7 * 86400000 + 3600000),
    baseFare: 100, status: 'Scheduled' as const, seatPricingConfig: { L1: 100 }, seatStatuses: {},
  };
  const tourPackage = { id: randomUUID(), title: `Package-${suffix}`, category: 'Spiritual' as const, pricePerPerson: 100, durationDays: 2, itinerary: {}, isActive: true };
  const offer = { id: randomUUID(), code: `TEST-${suffix.toUpperCase()}`, discountPercentage: 15, maxDiscountAmount: 300, validUntil: new Date(Date.now() + 30 * 86400000), isActive: true };
  const extraUserEmails: string[] = [];
  const f = {
    user, rival, admin, bus, route, trip, tourPackage, offer, password, extraUserEmails,
    userAuth: () => authHeader(user, 'user'), rivalAuth: () => authHeader(rival, 'user'), adminAuth: () => authHeader(admin, 'admin'),
    busBody: (seat = 'L1') => ({
      tripId: trip.id, selectedSeats: [seat], passengers: [{ name: 'Fixture Passenger', age: 34, gender: 'female', seat }],
      contact: { email: user.email, phone: user.phone }, requestKey: randomUUID(), totalAmount: 105,
    }),
    packageBody: () => ({
      packageId: tourPackage.id, travelersCount: 1, travelDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      travelers: [{ name: 'Fixture Traveler', age: 34, gender: 'female' }], contact: { email: user.email, phone: user.phone },
      requestKey: randomUUID(), totalAmount: 105,
    }),
  };

  beforeAll(async () => {
    // This module is integration-only, even when invoked with a custom runner.
    require('../../scripts/test-env.cjs').configure();
    await prisma.$transaction(async tx => {
      await tx.user.create({ data: user });
      await tx.user.create({ data: rival });
      await tx.admin.create({ data: admin });
      await tx.bus.create({ data: bus });
      await tx.route.create({ data: route });
      await tx.trip.create({ data: trip });
      await tx.tourPackage.create({ data: tourPackage });
      await tx.offer.create({ data: offer });
    });
    for (const client of (globalThis as any).__integrationRedisClients || []) {
      if (client.status !== 'ready') await new Promise<void>((resolve, reject) => {
        client.once('ready', resolve);
        client.once('error', reject);
      });
    }
  });

  afterAll(async () => {
    try {
      const extraUsers = await prisma.user.findMany({ where: { email: { in: extraUserEmails } }, select: { id: true } });
      const userIds = [user.id, rival.id, ...extraUsers.map(u => u.id)];
      // Discover API-created records only under exact suite-owned parent IDs;
      // every deletion below is constrained to exact primary keys.
      const trips = await prisma.trip.findMany({ where: { busId: bus.id }, select: { id: true } });
      const tripIds = trips.map(t => t.id);
      for (const id of tripIds) for (const holder of userIds) {
        await releaseSeats(id, Array.from({ length: 18 }, (_, i) => [`L${i + 1}`, `U${i + 1}`]).flat(), holder);
      }
      const bookings = await prisma.busBooking.findMany({ where: { userId: { in: userIds }, tripId: { in: tripIds } }, select: { id: true } });
      const packageBookings = await prisma.packageBooking.findMany({ where: { userId: { in: userIds }, packageId: tourPackage.id }, select: { id: true } });
      const tickets = await prisma.supportTicket.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
      await prisma.$transaction(async tx => {
        // BusBookingSeat rows cascade from these exact booking IDs.
        await tx.busBooking.deleteMany({ where: { id: { in: bookings.map(b => b.id) } } });
        await tx.packageBooking.deleteMany({ where: { id: { in: packageBookings.map(b => b.id) } } });
        await tx.supportTicket.deleteMany({ where: { id: { in: tickets.map(t => t.id) } } });
        await tx.trip.deleteMany({ where: { id: { in: tripIds } } });
        await tx.route.deleteMany({ where: { id: route.id } });
        await tx.bus.deleteMany({ where: { id: bus.id } });
        await tx.tourPackage.deleteMany({ where: { id: tourPackage.id } });
        await tx.offer.deleteMany({ where: { id: offer.id } });
        await tx.admin.deleteMany({ where: { id: admin.id } });
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
      });
    } finally {
      for (const client of (globalThis as any).__integrationRedisClients || []) client.disconnect();
      await prisma.$disconnect();
    }
  });
  return f;
}
