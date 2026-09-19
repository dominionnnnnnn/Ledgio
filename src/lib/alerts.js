import { useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { notifyOnce } from './data';
import { addDays, isoWeek, startOfWeek, today } from './dates';
import { money, totals } from './money';
import { limitsFor } from './config';

/**
 * In-app alerts, worked out on the phone (no server needed). Each has a stable id,
 * so checking again never duplicates it:
 *   norec-<date>          nothing was recorded yesterday
 *   best-<year>-W<week>   last week's top worker (shown from Monday)
 *   plan80-<month>        80% of the monthly record limit used
 *   plan100-<month>       monthly record limit reached
 * Support replies are written by the admin app later.
 */
async function runChecks(business, usageCount) {
  const bizId = business.id;
  const t = today();
  const created = business.createdAt?.toDate?.();
  const createdISO = created
    ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`
    : t;

  // Plan usage
  const limit = limitsFor(business.plan).recordsPerMonth;
  const month = t.slice(0, 7);
  if (usageCount >= limit) {
    await notifyOnce(bizId, `plan100-${month}`, {
      kind: 'plan',
      title: `You have used all ${limit} records this month`,
      body: 'New records can be added again from the 1st. You can still view and edit what you have.',
    });
  } else if (usageCount >= Math.ceil(limit * 0.8)) {
    await notifyOnce(bizId, `plan80-${month}`, {
      kind: 'plan',
      title: `You have used ${usageCount} of ${limit} records`,
      body: 'The free plan resets on the 1st of next month.',
    });
  }

  // The checks below read recent records; skip them until the business is at least a day old.
  const yesterday = addDays(t, -1);
  if (createdISO > yesterday) return;

  const lastWeekStart = addDays(startOfWeek(t), -7);
  const snap = await getDocs(
    query(collection(db, 'businesses', bizId, 'records'), where('date', '>=', lastWeekStart)),
  ).catch(() => null);
  if (!snap) return;
  const recs = snap.docs.map((d) => d.data());

  // Nothing recorded yesterday (only once there is at least one worker)
  if ((business.workerCount ?? 0) > 0 && !recs.some((r) => r.date === yesterday)) {
    const d = new Date(`${yesterday}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    await notifyOnce(bizId, `norec-${yesterday}`, {
      kind: 'record',
      title: 'Nothing recorded yesterday',
      body: `No work was written down on ${d}. Add it now so the week stays correct.`,
      cta: 'Add record',
      link: `/app/records/new?date=${yesterday}`,
    });
  }

  // Last week's top worker
  if (createdISO <= lastWeekStart) {
    const lastWeekEnd = addDays(lastWeekStart, 6);
    const week = recs.filter((r) => r.date >= lastWeekStart && r.date <= lastWeekEnd);
    const by = {};
    for (const r of week) (by[r.workerId] ??= []).push(r);
    const best = Object.entries(by)
      .map(([id, rs]) => ({ id, name: rs[0].workerName, ...totals(rs) }))
      .sort((a, b) => b.profit - a.profit)[0];
    if (best && best.profit > 0 && Object.keys(by).length > 1) {
      await notifyOnce(bizId, `best-${lastWeekStart.slice(0, 4)}-W${isoWeek(lastWeekStart)}`, {
        kind: 'worker',
        title: `${best.name} led last week with ${money(best.profit, business.currency)} profit`,
        body: `Top worker last week, from ${best.count} ${best.count === 1 ? 'record' : 'records'}.`,
        cta: 'View worker',
        link: `/app/workers/${best.id}`,
      });
    }
  }
}

/** Run the checks when the app opens and when the month's record count changes. */
export function useAlerts(business, usageCount, usageLoading) {
  const key = `${business.id}|${today()}|${usageLoading ? '-' : usageCount}`;
  useEffect(() => {
    if (usageLoading || !navigator.onLine) return;
    runChecks(business, usageCount).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
