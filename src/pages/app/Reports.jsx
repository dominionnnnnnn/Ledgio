import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRecordsSince, useWorkers } from '../../lib/data';
import { shortDate, startOfMonth, startOfWeek, today } from '../../lib/dates';
import { money, moneyShort, totals } from '../../lib/money';
import { bucketize } from '../../lib/buckets';
import { BackBar } from '../../components/app/Header';
import StatTile from '../../components/app/StatTile';
import { BarPairs, Legend } from '../../components/app/Charts';
import { Field } from '../../components/Field';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

const INPUT =
  'w-full min-h-[50px] rounded-xl border border-divider bg-card px-3 text-base text-ink outline-none focus:border-accent';

export default function Reports() {
  const { business } = useAuth();
  const navigate = useNavigate();
  const cur = business.currency;
  const t = today();
  const [preset, setPreset] = useState('week');
  const [custom, setCustom] = useState({ from: startOfMonth(t), to: t });

  const range =
    preset === 'today'
      ? { from: t, to: t }
      : preset === 'week'
        ? { from: startOfWeek(t), to: t }
        : preset === 'month'
          ? { from: startOfMonth(t), to: t }
          : {
              from: custom.from <= custom.to ? custom.from : custom.to,
              to: custom.from <= custom.to ? custom.to : custom.from,
            };

  const recs = useRecordsSince(business.id, range.from);
  const workers = useWorkers(business.id);
  const inRange = useMemo(() => (recs.data ?? []).filter((r) => r.date <= range.to), [recs.data, range.to]);
  const sum = totals(inRange);

  const workerList = workers.data ?? [];
  const buckets = useMemo(
    () => bucketize(inRange, range.from, range.to, workerList),
    [inRange, range.from, range.to, workerList],
  );

  const rows = useMemo(() => {
    const m = new Map();
    for (const r of inRange) {
      const e = m.get(r.workerId) ?? { id: r.workerId, name: r.workerName, records: [] };
      e.records.push(r);
      m.set(r.workerId, e);
    }
    return [...m.values()]
      .map((e) => ({
        ...e,
        name: workerList.find((w) => w.id === e.id)?.name ?? e.name ?? 'Removed worker',
        exists: workerList.some((w) => w.id === e.id),
        ...totals(e.records),
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [inRange, workerList]);

  // Short amounts on phones, full amounts on desktop.
  const both = (n) => (
    <>
      <span className="lg:hidden">{moneyShort(n, cur)}</span>
      <span className="hidden lg:inline">{money(n, cur)}</span>
    </>
  );

  const rangeText =
    range.from === range.to ? shortDate(range.from) : `${shortDate(range.from)} – ${shortDate(range.to)}`;

  return (
    <>
      <BackBar title="Reports" top />
      <div className="flex flex-col gap-4 px-4 pb-7 pt-1 lg:gap-5 lg:px-0 lg:pt-0">
        <div className="flex flex-wrap gap-[7px]">
          {PRESETS.map((p) => {
            const on = p.key === preset;
            return (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                aria-pressed={on}
                className={`min-h-9 rounded-full border px-[15px] text-[13px] font-semibold ${
                  on ? 'border-transparent bg-accent text-on-accent shadow-card-sm' : 'border-divider bg-card text-ink'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {preset === 'custom' && (
          <div className="flex gap-2.5">
            <Field label="From" className="flex-1">
              <input
                type="date"
                className={INPUT}
                value={custom.from}
                max={t}
                onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value || c.from }))}
              />
            </Field>
            <Field label="To" className="flex-1">
              <input
                type="date"
                className={INPUT}
                value={custom.to}
                max={t}
                onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value || c.to }))}
              />
            </Field>
          </div>
        )}

        <p className="-mb-1 m-0 text-[12.5px] opacity-55 lg:-mb-2">{rangeText}</p>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
          <StatTile label="Revenue" value={both(sum.revenue)} />
          <StatTile label="Expenses" value={both(sum.expense)} tone="bad" />
          <StatTile label="Profit" value={both(sum.profit)} tone={sum.profit < 0 ? 'bad' : 'ok'} />
          <StatTile label="Records" value={sum.count} />
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
          <section className="rounded-[20px] bg-card p-4 shadow-card lg:p-5">
            <div className="mb-3.5 flex flex-wrap items-baseline gap-2.5">
              <h2 className="m-0 mr-auto font-heading text-xl font-semibold">Revenue vs expenses</h2>
              <span className="flex gap-2.5">
                <Legend />
              </span>
            </div>
            {recs.loading ? (
              <i className="lg-sk block h-[150px] rounded-xl" />
            ) : sum.count === 0 ? (
              <div className="grid h-[150px] place-items-center text-sm opacity-55">No records in this period</div>
            ) : (
              <BarPairs buckets={buckets} height={window.innerWidth >= 1024 ? 240 : 150} />
            )}
          </section>

          <section className="rounded-[20px] bg-card px-4 pb-1.5 pt-4 shadow-card">
            <h2 className="m-0 mb-1.5 font-heading text-xl font-semibold">Worker performance</h2>
            {rows.length === 0 ? (
              <p className="m-0 pb-3 text-sm opacity-55">No records in this period.</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[.1em] opacity-50">
                    <th className="py-2 font-semibold">Worker</th>
                    <th className="py-2 text-right font-semibold">Records</th>
                    <th className="hidden py-2 text-right font-semibold lg:table-cell">Revenue</th>
                    <th className="py-2 text-right font-semibold">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((w) => (
                    <tr
                      key={w.id}
                      onClick={() => w.exists && navigate(`/app/workers/${w.id}`)}
                      className={`border-t border-divider ${w.exists ? 'cursor-pointer hover:bg-tint-soft' : ''}`}
                    >
                      <td className="py-3 font-semibold">{w.name}</td>
                      <td className="py-3 text-right">{w.count}</td>
                      <td className="lg-num hidden py-3 text-right text-[15px] lg:table-cell">
                        {money(w.revenue, cur)}
                      </td>
                      <td
                        className={`lg-num py-3 text-right text-[15px] font-semibold ${w.profit < 0 ? 'text-bad' : 'text-ok'}`}
                      >
                        {money(w.profit, cur)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
