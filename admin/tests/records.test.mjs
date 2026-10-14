import test from 'node:test';
import assert from 'node:assert/strict';
import { packagePayload, seatChanges, tripPayload } from '../lib/records.mjs';

test('tripPayload rejects missing persisted record IDs and invalid time order', () => {
  assert.throws(() => tripPayload({ routeId:'', busId:'', departureDatetime:'', arrivalDatetime:'', baseFare:'1' }), /real bus and route/);
  assert.throws(() => tripPayload({ routeId:'route-uuid', busId:'bus-uuid', departureDatetime:'2026-10-01T12:00', arrivalDatetime:'2026-10-01T11:00', baseFare:'500' }), /after departure/);
});

test('packagePayload preserves itinerary metadata and validates numeric fields', () => {
  const payload = packagePayload({ title:'Test tour', category:'Domestic', pricePerPerson:'1500', durationDays:'3', isActive:true, itinerary:'{"stops":["Pune"]}' });
  assert.equal(payload.pricePerPerson, 1500);
  assert.deepEqual(payload.itinerary, { stops:['Pune'] });
  assert.throws(() => packagePayload({ title:'', category:'Domestic', pricePerPerson:'0', durationDays:'0', itinerary:'{}' }), /title/);
});

test('seatChanges refuses occupied seats and emits patch maps for editable seats', () => {
  const seats = [{ id:'L1', price:500, status:'available' }];
  assert.throws(() => seatChanges(seats, { L1:{ price:600 } }, ['L1']), /occupied/);
  assert.deepEqual(seatChanges(seats, { L1:{ price:600, status:'blocked' } }, []), { seatPricingConfig:{ L1:600 }, seatStatuses:{ L1:'blocked' } });
});
