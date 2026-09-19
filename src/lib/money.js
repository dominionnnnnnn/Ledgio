import { CURRENCIES } from './config';

export const symbolFor = (code) => CURRENCIES.find((c) => c.code === code)?.symbol ?? '';

/** ₦1,345,000 (negative: −₦12,000) */
export function money(n, code) {
  const v = Math.round(Number(n) || 0);
  const s = `${symbolFor(code)}${Math.abs(v).toLocaleString('en-US')}`;
  return v < 0 ? `−${s}` : s;
}

/** ₦552k, ₦1.34m — for tight spaces. */
export function moneyShort(n, code) {
  const v = Number(n) || 0;
  const a = Math.abs(v);
  let s;
  if (a >= 1e9) s = `${+(a / 1e9).toFixed(2)}b`;
  else if (a >= 1e6) s = `${+(a / 1e6).toFixed(2)}m`;
  else if (a >= 1e3) s = `${+(a / 1e3).toFixed(a >= 1e5 ? 0 : 1)}k`;
  else s = String(Math.round(a));
  return `${v < 0 ? '−' : ''}${symbolFor(code)}${s}`;
}

/** Parse what the user typed ("12,500" → 12500). Empty → 0. */
export const parseAmount = (str) => {
  const n = Number(String(str).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** Show a number with thousands separators while typing. */
export const formatTyping = (str) => {
  const clean = String(str).replace(/[^0-9.]/g, '');
  if (!clean) return '';
  const [int, dec] = clean.split('.');
  const withCommas = Number(int || 0).toLocaleString('en-US');
  return dec !== undefined ? `${withCommas}.${dec.slice(0, 2)}` : withCommas;
};

export const profitOf = (r) => (Number(r.revenue) || 0) - (Number(r.expense) || 0);

/** Totals for a list of records. */
export function totals(records) {
  let revenue = 0;
  let expense = 0;
  for (const r of records) {
    revenue += Number(r.revenue) || 0;
    expense += Number(r.expense) || 0;
  }
  return { revenue, expense, profit: revenue - expense, count: records.length };
}
