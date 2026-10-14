import {
  bookingError,
  seatLayout,
  selectedSeatIds,
  validateContact,
  validateTravelers,
  validateTrip,
} from '../../src/utils/booking';

const futureTrip = (overrides: Record<string, unknown> = {}) => ({
  status: 'Scheduled',
  departureDatetime: new Date(Date.now() + 60 * 60 * 1000),
  baseFare: 500,
  seatPricingConfig: { L1: 600, U1: 700 },
  seatStatuses: {},
  bus: { totalSeats: 4, busStyle: 'sleeper', status: 'Active', type: 'Sleeper' },
  ...overrides,
});

describe('booking validation helpers', () => {
  it('accepts only unique, supported seat identifiers', () => {
    expect(selectedSeatIds(['L1', { id: 'U1' }])).toEqual(['L1', 'U1']);
    expect(() => selectedSeatIds([])).toThrow('between 1 and 6');
    expect(() => selectedSeatIds(['L1', 'L1'])).toThrow('Invalid or duplicate seats');
    expect(() => selectedSeatIds(['Z1'])).toThrow('Invalid or duplicate seats');
  });

  it('builds a sleeper layout from real capacity and pricing data', () => {
    expect(seatLayout(futureTrip())).toEqual([
      { id: 'L1', name: 'L1', deck: 'lower', price: 600, status: 'available', type: 'sleeper' },
      { id: 'L2', name: 'L2', deck: 'lower', price: 500, status: 'available', type: 'sleeper' },
      { id: 'U1', name: 'U1', deck: 'upper', price: 700, status: 'available', type: 'sleeper' },
      { id: 'U2', name: 'U2', deck: 'upper', price: 500, status: 'available', type: 'sleeper' },
    ]);
  });

  it.each([
    [null, ['L1'], 'Trip not found'],
    [futureTrip({ status: 'Cancelled' }), ['L1'], 'no longer available'],
    [futureTrip({ departureDatetime: new Date(Date.now() - 1000) }), ['L1'], 'no longer available'],
    [futureTrip({ bus: { totalSeats: 4, busStyle: 'sleeper', status: 'In_Maintenance', type: 'Sleeper' } }), ['L1'], 'no longer available'],
    [futureTrip({ seatStatuses: { L1: 'blocked' } }), ['L1'], 'Seat L1 is unavailable'],
    [futureTrip({ seatPricingConfig: { L1: 0 } }), ['L1'], 'Seat L1 is unavailable'],
    [futureTrip(), ['L9'], 'Seat L9 is unavailable'],
  ])('rejects %s with %s', (trip, seats, message) => {
    expect(() => validateTrip(trip, seats)).toThrow(message);
  });

  it('validates traveler count and normalizes traveler fields', () => {
    expect(validateTravelers([{ name: '  Asha  ', age: '34', gender: 'FEMALE', seat: 'L1' }], 1)).toEqual([
      { name: 'Asha', age: 34, gender: 'female', seat: 'L1' },
    ]);
    expect(() => validateTravelers([], 1)).toThrow('valid name, age and gender');
    expect(() => validateTravelers([{ name: 'Asha', age: 121, gender: 'female' }], 1)).toThrow('valid name, age and gender');
  });

  it('requires a valid contact payload', () => {
    expect(validateContact({ email: 'asha@example.test', phone: '+91 90000 00000' })).toEqual({
      email: 'asha@example.test',
      phone: '+91 90000 00000',
    });
    expect(() => validateContact({ email: 'invalid', phone: '123' })).toThrow('Valid contact');
  });

  it('retains status codes on booking errors', () => {
    expect(bookingError('conflict', 409)).toMatchObject({ message: 'conflict', statusCode: 409 });
  });
});
