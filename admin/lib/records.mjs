export const recordHref = (section, id, action = 'view') => `/${section}/${action}?id=${encodeURIComponent(id)}`;
export const displayId = (id = '') => id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
export const money = (value) => value == null ? '—' : `₹${Number(value).toLocaleString('en-IN')}`;
export const dateTime = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleString('en-IN') : '—';
export const localDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function tripPayload(form) {
  if (!form.busId || !form.routeId) throw new Error('Select a real bus and route.');
  const departure = new Date(form.departureDatetime);
  const arrival = new Date(form.arrivalDatetime);
  if (!form.departureDatetime || !form.arrivalDatetime || Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime()) || arrival <= departure) throw new Error('Arrival must be after departure.');
  if (!Number.isFinite(Number(form.baseFare)) || Number(form.baseFare) <= 0) throw new Error('Base fare must be positive.');
  return { busId: form.busId, routeId: form.routeId, departureDatetime: departure.toISOString(), arrivalDatetime: arrival.toISOString(), baseFare: Number(form.baseFare), status: form.status };
}

export function packagePayload(form) {
  if (!form.title.trim() || !['Domestic', 'International', 'Spiritual'].includes(form.category)) throw new Error('A title and valid category are required.');
  if (!Number.isFinite(Number(form.pricePerPerson)) || Number(form.pricePerPerson) <= 0) throw new Error('Price must be positive.');
  if (!Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) < 1) throw new Error('Duration must be a positive whole number of days.');
  let itinerary;
  try { itinerary = JSON.parse(form.itinerary); } catch { throw new Error('Itinerary metadata must be valid JSON.'); }
  if (!itinerary || typeof itinerary !== 'object' || Array.isArray(itinerary)) throw new Error('Itinerary metadata must be a JSON object.');
  return { title: form.title.trim(), category: form.category, pricePerPerson: Number(form.pricePerPerson), durationDays: Number(form.durationDays), itinerary, isActive: form.isActive };
}

export function seatChanges(seats, edits, occupied) {
  const seatPricingConfig = {}, seatStatuses = {};
  for (const [id, edit] of Object.entries(edits)) {
    const seat = seats.find(s => s.id === id);
    if (!seat) throw new Error(`Unknown seat ${id}.`);
    if (occupied.includes(id)) throw new Error(`Seat ${id} is occupied or held. Reload the seat map.`);
    const price = Number(edit.price ?? seat.price);
    const status = edit.status ?? seat.status;
    if (!Number.isFinite(price) || price <= 0) throw new Error(`Seat ${id} needs a positive fare.`);
    if (!['available', 'ladies', 'blocked'].includes(status)) throw new Error(`Invalid status for seat ${id}.`);
    seatPricingConfig[id] = price;
    seatStatuses[id] = status;
  }
  return { seatPricingConfig, seatStatuses };
}
