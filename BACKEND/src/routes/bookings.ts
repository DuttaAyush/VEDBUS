import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { tryHoldSeats, releaseSeats, getHeldSeats, verifySeatLocks, SEAT_HOLD_DURATION_SECONDS } from '../utils/seatLock';
import { bookingError, lockTrip, seatLayout, selectedSeatIds, validateTrip, validateTravelers, validateContact } from '../utils/booking';

const router = Router();
router.get('/seats', async (req, res) => {
  const tripId = String(req.query.tripId || req.query.busId || '');
  if (!tripId) return sendError(res, 'tripId is required.', 400);
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { bus: true, route: true } });
  if (!trip) return sendError(res, 'Trip not found.', 404);
  const bookings = await prisma.busBooking.findMany({ where: { tripId, status: { in: ['Pending', 'Confirmed'] } }, select: { seatNumbers: true } });
  const heldSeats = await getHeldSeats(tripId);
  const seatStatuses = (trip.seatStatuses as Record<string, string>) || {};
  const blockedSeats = Object.keys(seatStatuses).filter((k) => seatStatuses[k] === 'blocked');
  const bookedSeats = [...new Set([...bookings.flatMap((b) => b.seatNumbers), ...heldSeats, ...blockedSeats])];
  return sendSuccess(res, { tripId, trip, bookedSeats, heldSeats, blockedSeats, seats: seatLayout(trip) });
});

router.use(authenticateJWT);
router.post('/hold', async (req: AuthRequest, res) => {
  try {
    const tripId = String(req.body.tripId || '');
    const seats = selectedSeatIds(req.body.selectedSeats);
    const holder = req.user!.id;
    const result = await prisma.$transaction(async tx => {
      await lockTrip(tx, tripId);
      const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { bus: true } });
      validateTrip(trip, seats);
      const conflict = await tx.busBooking.findFirst({ where: { tripId, status: { in: ['Pending', 'Confirmed'] }, seatNumbers: { hasSome: seats } } });
      if (conflict) throw bookingError('Selected seats are already booked.', 409);
      return tryHoldSeats(tripId, seats, holder);
    });
    if (!result.success) return sendError(res, 'Selected seats are held by another traveler.', 409);
    return sendSuccess(res, { tripId, lockHolderId: holder, heldSeats: seats, expiresInSeconds: SEAT_HOLD_DURATION_SECONDS }, 'Seats held.');
  } catch (err: any) { return sendError(res, err.statusCode ? err.message : 'Unable to reserve seats.', err.statusCode || 503); }
});
router.post('/release', async (req: AuthRequest, res) => {
  const seats = selectedSeatIds(req.body.selectedSeats);
  await releaseSeats(String(req.body.tripId), seats, req.user!.id);
  return sendSuccess(res, null, 'Seats released.');
});

router.post(['/', '/create'], async (req: AuthRequest, res) => {
  try {
    if (req.user!.kind !== 'user') return sendError(res, 'Use a customer account to book.', 403);
    const tripId = String(req.body.tripId || '');
    const seats = selectedSeatIds(req.body.selectedSeats);
    const passengers = validateTravelers(req.body.passengers, seats.length);
    if (passengers.some((p, i) => p.seat !== seats[i])) throw bookingError('Passengers must match the selected seats.');
    const contact = validateContact(req.body.contact);
    const key = req.body.requestKey;
    if (typeof key !== 'string' || key.length < 8 || key.length > 100) throw bookingError('A checkout request key is required.');
    const requestKey = `${req.user!.id}:${key}`;
    const holder = req.body.lockHolderId ? String(req.body.lockHolderId) : req.user!.id;
    const options = {
      meal: req.body.options?.meal === true || req.body.includeSatvikMeal === true,
      cab: req.body.options?.cab === true || req.body.includeCabPickup === true,
      insurance: req.body.options?.insurance === true || req.body.includeInsurance === true,
    };
    const booking = await prisma.$transaction(async tx => {
      await lockTrip(tx, tripId);
      const existing = await tx.busBooking.findUnique({ where: { requestKey } });
      if (existing) {
        if (existing.tripId !== tripId || existing.seatNumbers.join(',') !== seats.join(',')) throw bookingError('Checkout key already used for another selection.', 409);
        return existing;
      }
      const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { bus: true } });
      const selected = validateTrip(trip, seats);
      if (selected.some((s, i) => s.status === 'ladies' && passengers[seats.indexOf(s.id)].gender !== 'female')) throw bookingError('Ladies seats require a female traveler.');
      const locks = await verifySeatLocks(tripId, seats, holder);
      if (!locks.valid) throw bookingError('Seat hold expired. Please select your seats again.', 409);
      const conflict = await tx.busBooking.findFirst({ where: { tripId, status: { in: ['Pending', 'Confirmed'] }, seatNumbers: { hasSome: seats } } });
      if (conflict) throw bookingError('Selected seats are already booked.', 409);
      let subtotal = selected.reduce((sum, s) => sum + s.price, 0) + (options.meal ? seats.length * 149 : 0) + (options.insurance ? seats.length * 15 : 0) + (options.cab ? 199 : 0);
      if (req.body.couponCode) {
        const offer = await tx.offer.findUnique({ where: { code: String(req.body.couponCode).trim().toUpperCase() } });
        if (!offer || !offer.isActive || offer.validUntil < new Date()) throw bookingError('Invalid or expired offer.');
        subtotal -= Math.min(Math.round(subtotal * offer.discountPercentage / 100), Number(offer.maxDiscountAmount));
      }
      const totalAmount = Math.max(0, subtotal) + Math.round(Math.max(0, subtotal) * 0.05);
      if (Math.abs(Number(req.body.totalAmount) - totalAmount) > 0.01) throw bookingError('Fare changed. Please restart checkout.', 409);
      return tx.busBooking.create({ data: { id: `YB-${randomUUID()}`, userId: req.user!.id, tripId, seatNumbers: seats, totalAmount, status: 'Pending', passengers, contact, options, requestKey, seatAllocations: { create: seats.map(seatNumber => ({ tripId, seatNumber })) } } });
    });
    await releaseSeats(tripId, seats, holder);
    return sendSuccess(res, { booking }, 'Booking request saved. Awaiting operator confirmation; no payment collected.', 201);
  } catch (err: any) { return sendError(res, err.code === 'P2002' ? 'Seats or checkout request already reserved.' : err.statusCode ? err.message : 'Unable to save booking.', err.code === 'P2002' ? 409 : err.statusCode || 503); }
});

router.get('/:id', async (req: AuthRequest, res) => {
  const booking = await prisma.busBooking.findUnique({ where: { id: String(req.params.id) }, include: { trip: { include: { route: true, bus: true } } } });
  if (!booking) return sendError(res, 'Booking not found.', 404);
  if (booking.userId !== req.user!.id && req.user!.role === 'USER') return sendError(res, 'Access denied.', 403);
  return sendSuccess(res, booking);
});
router.delete('/:id', async (req: AuthRequest, res) => {
  const booking = await prisma.busBooking.findUnique({ where: { id: String(req.params.id) } });
  if (!booking) return sendError(res, 'Booking not found.', 404);
  if (booking.userId !== req.user!.id && req.user!.role === 'USER') return sendError(res, 'Access denied.', 403);
  const updated = await prisma.$transaction(async tx => {
    await lockTrip(tx, booking.tripId);
    const current = await tx.busBooking.findUniqueOrThrow({ where: { id: booking.id } });
    if (['Cancelled', 'Refunded'].includes(current.status)) return current;
    await tx.busBookingSeat.deleteMany({ where: { bookingId: booking.id } });
    return tx.busBooking.update({ where: { id: booking.id }, data: { status: 'Cancelled' } });
  });
  return sendSuccess(res, { booking: updated }, 'Booking cancelled.');
});
export default router;
