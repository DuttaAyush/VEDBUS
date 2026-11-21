/**
 * Date helper utilities for VedBus (local timezone-safe, no UTC offset bugs)
 */

export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns current date pinned to Indian Standard Time (IST / UTC+5:30) at midnight (0, 0, 0, 0).
 * Prevents UTC vs IST drift when SSR/Node runs in UTC.
 */
export const getTodayIST = () => {
  const now = new Date();
  const istOffset = 330; // +5:30 in minutes
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + istOffset * 60000);
  return new Date(istDate.getFullYear(), istDate.getMonth(), istDate.getDate(), 0, 0, 0, 0);
};

/**
 * Returns YYYY-MM-DD formatted string in user's local timezone (e.g. IST).
 * Unlike .toISOString().slice(0, 10), this NEVER suffers from UTC midnight shift.
 */
export function formatLocalDate(d = new Date()) {
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an object with { mainText, subText, date, rawDate }
 * offsetDays = 0 for Today, 1 for Tomorrow, etc.
 */
export function getRelativeDate(offsetDays = 0) {
  const target = getTodayIST();
  target.setDate(target.getDate() + offsetDays);

  const dayNum = target.getDate();
  const monthShort = target.toLocaleDateString('en-US', { month: 'short' });
  const weekday = target.toLocaleDateString('en-US', { weekday: 'long' });

  let labelPrefix = '';
  if (offsetDays === 0) labelPrefix = 'Today, ';
  else if (offsetDays === 1) labelPrefix = 'Tomorrow, ';

  return {
    mainText: `${labelPrefix}${dayNum} ${monthShort}`,
    subText: weekday,
    date: formatLocalDate(target),
    rawDate: target
  };
}

/**
 * Parse a date string (e.g. "Today, 23 Nov", "Tomorrow, 24 Nov", "24 Oct", "2026-11-23")
 * into a valid local Date object.
 */
export function parseDateString(str) {
  if (!str) return null;
  if (str instanceof Date && !isNaN(str.getTime())) {
    const copy = new Date(str.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  const today = getTodayIST();

  if (typeof str !== 'string') return null;

  const trimmed = str.trim();
  if (/^today/i.test(trimmed)) {
    return today;
  }
  if (/^tomorrow/i.test(trimmed)) {
    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);
    return tmrw;
  }

  // Strip prefixes like "Today, " or "Tomorrow, "
  const clean = trimmed.replace(/^(Today|Tomorrow),\s*/i, '').trim();

  // Try standard Date parsing
  let d = new Date(clean);
  if (!isNaN(d.getTime())) {
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Try appending current year if missing (e.g. "23 Nov")
  d = new Date(`${clean} ${today.getFullYear()}`);
  if (!isNaN(d.getTime())) {
    d.setHours(0, 0, 0, 0);
    return d;
  }

  return null;
}
