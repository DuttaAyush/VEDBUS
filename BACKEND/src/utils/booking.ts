import { Prisma } from '@prisma/client';

export function bookingError(message: string, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}
export function seatLayout(trip: any) {
  const count = trip.bus.totalSeats;
  const sleeper = (trip.bus.busStyle || trip.bus.type).toLowerCase().includes('sleeper');
  const lowerCount = sleeper ? Math.ceil(count / 2) : count;
  const config = (trip.seatPricingConfig || {}) as Record<string, number>;
  const statuses = (trip.seatStatuses || {}) as Record<string, string>;
  return Array.from({ length: count }, (_, i) => {
    const upper = i >= lowerCount;
    const n = upper ? i - lowerCount + 1 : i + 1;
    const id = `${upper ? 'U' : 'L'}${n}`;
    const tier = upper ? config._tier_upper : config._tier_lower;
    const price = Number(config[id] ?? tier ?? trip.baseFare);
    return { id, name: id, deck: upper ? 'upper' : 'lower', price, status: statuses[id] || 'available', type: sleeper ? 'sleeper' : 'seater' };
  });
}
export function selectedSeatIds(input: unknown): string[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 6) throw bookingError('Select between 1 and 6 seats.');
  const ids = input.map(s => typeof s === 'string' ? s : s?.id);
  if (ids.some(id => typeof id !== 'string' || !/^[LU]\d+$/.test(id)) || new Set(ids).size !== ids.length) throw bookingError('Invalid or duplicate seats.');
  return ids;
}
export function validateTrip(trip: any, seats: string[]) {
  if (!trip) throw bookingError('Trip not found.', 404);
  if (!['Scheduled', 'On_Time', 'Delayed'].includes(trip.status) || trip.bus.status !== 'Active' || trip.departureDatetime <= new Date()) throw bookingError('This trip is no longer available.', 409);
  const layout = seatLayout(trip);
  for (const id of seats) {
    const seat = layout.find(s => s.id === id);
    if (!seat || seat.status === 'blocked' || !Number.isFinite(seat.price) || seat.price <= 0) throw bookingError(`Seat ${id} is unavailable.`, 409);
  }
  return layout.filter(s => seats.includes(s.id));
}
export function validateTravelers(input: unknown, count: number) {
  if (!Array.isArray(input) || input.length !== count || input.some(p => !p || typeof p.name !== 'string' || !p.name.trim() || !Number.isInteger(Number(p.age)) || Number(p.age) < 1 || Number(p.age) > 120 || !['male', 'female', 'other'].includes(String(p.gender).toLowerCase()))) throw bookingError('Provide a valid name, age and gender for each traveler.');
  return input.map(p => ({ name: p.name.trim(), age: Number(p.age), gender: String(p.gender).toLowerCase(), ...(p.seat ? { seat: String(p.seat) } : {}) }));
}
export function validateContact(input: any) {
  if (!input || typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || typeof input.phone !== 'string' || input.phone.replace(/\D/g, '').length < 10) throw bookingError('Valid contact email and phone are required.');
  return { email: input.email.trim(), phone: input.phone.trim() };
}
export async function lockTrip(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT "id" FROM "Trip" WHERE "id" = ${id} FOR UPDATE`;
}
