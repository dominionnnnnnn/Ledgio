import { addDays, daysBetween, isoWeek, monthLabel, monthOf, shortDay, startOfWeek } from './dates';
import { totals } from './money';

/**
 * Chart buckets for a date range:
 *   one day        → one bar pair per worker
 *   up to 14 days  → per day
 *   up to ~3 months → per week
 *   longer         → per month
 */
export function bucketize(records, from, to, workers) {
  const span = daysBetween(from, to).length;
  if (span === 1) {
    return workers
      .map((w) => ({ label: w.name.split(' ')[0], ...totals(records.filter((r) => r.workerId === w.id)) }))
      .filter((b) => b.count > 0 || workers.length <= 6);
  }
  if (span <= 14) {
    return daysBetween(from, to).map((d) => ({
      label: span <= 7 ? shortDay(d) : String(Number(d.slice(8))),
      ...totals(records.filter((r) => r.date === d)),
    }));
  }
  if (span <= 95) {
    const out = [];
    for (let s = startOfWeek(from); s <= to; s = addDays(s, 7)) {
      const e = addDays(s, 6);
      out.push({ label: `W${isoWeek(s)}`, ...totals(records.filter((r) => r.date >= s && r.date <= e)) });
    }
    return out;
  }
  const months = [...new Set(daysBetween(from, to).map(monthOf))];
  return months.map((m) => ({ label: monthLabel(m).slice(0, 3), ...totals(records.filter((r) => r.month === m)) }));
}
