// All dates are local calendar days stored as "YYYY-MM-DD" strings.

const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => toISO(new Date());
export const monthOf = (iso) => iso.slice(0, 7);
export const thisMonth = () => monthOf(today());

/** Parse "YYYY-MM-DD" as a local date (not UTC). */
export const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso, n) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

/** Monday of the week containing iso. */
export const startOfWeek = (iso) => {
  const d = parseISO(iso);
  const offset = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - offset);
  return toISO(d);
};

export const startOfMonth = (iso) => `${monthOf(iso)}-01`;

export const shiftMonth = (month, n) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const lastDayOfMonth = (month) => {
  const [y, m] = month.split('-').map(Number);
  return `${month}-${pad(new Date(y, m, 0).getDate())}`;
};

/** Periods used on the home screen. Week starts Monday; month starts on the 1st. */
export const PERIODS = [
  { key: 'today', label: 'Today', long: 'Today', from: () => today() },
  { key: 'week', label: 'This Week', long: 'This week', from: () => startOfWeek(today()) },
  { key: 'month', label: 'Month', long: 'This month', from: () => startOfMonth(today()) },
];

export const monthLabel = (month) =>
  parseISO(`${month}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const longDate = (iso) =>
  parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const dayTile = (iso) => {
  const d = parseISO(iso);
  return { day: d.getDate(), mon: d.toLocaleDateString('en-GB', { month: 'short' }) };
};

/** ISO week number (weeks start Monday). */
export function isoWeek(iso) {
  const d = parseISO(iso);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

/** Every date from `from` to `to` inclusive. */
export function daysBetween(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export const shortDay = (iso) => parseISO(iso).toLocaleDateString('en-GB', { weekday: 'narrow' });
export const shortDate = (iso) => parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
