import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, NotebookText, Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMonthRecords, useWorkers } from '../../lib/data';
import { dayTile, monthLabel, shiftMonth, shortDate, thisMonth } from '../../lib/dates';
import { money, profitOf, totals } from '../../lib/money';
import { BackBar } from '../../components/app/Header';
import Avatar from '../../components/app/Avatar';
import EmptyState from '../../components/app/EmptyState';
import StatTile from '../../components/app/StatTile';
import Button from '../../components/Button';
import { useAppShell } from '../../components/app/AppLayout';

const LOSS = '__loss';

/** The text shown as a record's title in lists. */
export function recordTitle(r) {
  return r.values?.Destination || r.values?.Customer || r.values?.Notes || r.workerName || 'Record';
}

export default function Records() {
  const { business } = useAuth();
  const navigate = useNavigate();
  const cur = business.currency;
  const [month, setMonth] = useState(thisMonth());
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  useEffect(() => setQ(params.get('q') ?? ''), [params]);
  const { addRecord } = useAppShell();
  const [chips, setChips] = useState([]);

  const recs = useMonthRecords(business.id, month);
  const workers = useWorkers(business.id);
  const all = recs.data ?? [];
  const nameOf = (r) => workers.data?.find((w) => w.id === r.workerId)?.name ?? r.workerName ?? 'Removed worker';

  const sum = totals(all);

  const byWorker = useMemo(() => {
    const m = new Map();
    for (const r of all) {
      const e = m.get(r.workerId) ?? { id: r.workerId, name: r.workerName, records: [] };
      e.records.push(r);
      m.set(r.workerId, e);
    }
    return [...m.values()].map((e) => ({ ...e, ...totals(e.records) })).sort((a, b) => b.profit - a.profit);
  }, [all]);
  const maxProfit = Math.max(1, ...byWorker.map((w) => w.profit));

  const visible = useMemo(() => {
    const workerChips = chips.filter((c) => c !== LOSS);
    const needle = q.trim().toLowerCase();
    return all.filter((r) => {
      if (workerChips.length && !workerChips.includes(r.workerId)) return false;
      if (chips.includes(LOSS) && profitOf(r) >= 0) return false;
      if (!needle) return true;
      const hay = [
        nameOf(r),
        r.truck,
        r.date,
        String(r.revenue),
        String(r.expense),
        ...Object.values(r.values ?? {}).map(String),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle.replace(/,/g, ''));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, chips, q, workers.data]);
  const vSum = totals(visible);

  const toggleChip = (c) => setChips((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const chipDefs = [
    ...(workers.data ?? []).map((w) => ({ key: w.id, label: w.name })),
    { key: LOSS, label: 'Loss-making' },
  ];

  const empty =
    all.length === 0
      ? month === thisMonth()
        ? [
            'No records yet',
            'Write down your first piece of work — revenue and expenses — and Ledgio works out the profit.',
          ]
        : ['Nothing in this month', 'Step back a month with the arrows above, or add a record for this one.']
      : ['Nothing matches that', 'Try a different search word, or clear the filter chips above.'];

  const monthStepper = (
    <div className="flex items-center gap-2 rounded-[20px] bg-card p-1.5 shadow-card-sm lg:w-[300px] lg:flex-none">
      <button
        onClick={() => setMonth(shiftMonth(month, -1))}
        aria-label="Previous month"
        className="grid size-10 place-items-center rounded-full border-0 bg-rail text-ink"
      >
        <ChevronLeft size={19} strokeWidth={1.6} />
      </button>
      <div className="flex flex-1 flex-col items-center leading-tight">
        <span className="font-heading text-xl font-semibold">{monthLabel(month)}</span>
        <span className="text-[11.5px] opacity-55">
          {sum.count} {sum.count === 1 ? 'record' : 'records'} this month
        </span>
      </div>
      <button
        onClick={() => setMonth(shiftMonth(month, 1))}
        aria-label="Next month"
        disabled={month >= thisMonth()}
        className="grid size-10 place-items-center rounded-full border-0 bg-rail text-ink"
      >
        <ChevronRight size={19} strokeWidth={1.6} />
      </button>
    </div>
  );

  const chipRow = chipDefs.length > 1 && all.length > 0 && (
    <div className="lg-noscroll -mx-4 flex gap-[7px] overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
      {chipDefs.map((c) => {
        const on = chips.includes(c.key);
        return (
          <button
            key={c.key}
            onClick={() => toggleChip(c.key)}
            aria-pressed={on}
            className={`min-h-9 flex-none whitespace-nowrap rounded-full border px-[15px] text-[13px] font-semibold ${
              on ? 'border-transparent bg-accent text-on-accent shadow-card-sm' : 'border-divider bg-card text-ink'
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );

  const performance = byWorker.length > 0 && (
    <section className="flex flex-col gap-3 rounded-[20px] bg-card p-4 shadow-card">
      <div className="flex items-baseline">
        <h2 className="m-0 mr-auto font-heading text-xl font-semibold">Worker performance</h2>
        <span className="text-[11.5px] opacity-50">share of profit</span>
      </div>
      {byWorker.map((w) => (
        <div key={w.id} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <Avatar id={w.id} name={nameOf(w.records[0])} size={26} />
            <span className="mr-auto truncate text-[14.5px] font-semibold">{nameOf(w.records[0])}</span>
            <span className="text-xs opacity-55">{w.count} rec.</span>
            <span className={`lg-num text-[15px] font-semibold ${w.profit < 0 ? 'text-bad' : 'text-ok'}`}>
              {money(w.profit, cur)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-rail">
            <i
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.max(0, (w.profit / maxProfit) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );

  const listHead = (
    <div className="mb-2 flex justify-between px-1 text-[12.5px] lg:mb-0 lg:px-0 lg:pb-2">
      <span className="opacity-55 lg:font-heading lg:text-xl lg:font-semibold lg:opacity-100">
        {vSum.count} {vSum.count === 1 ? 'record' : 'records'}
      </span>
      <span className="lg-num font-semibold">{money(vSum.profit, cur)} profit</span>
    </div>
  );

  return (
    <>
      <BackBar title="Records" top />
      <div className="flex flex-col gap-3.5 px-4 pb-28 pt-1 lg:gap-5 lg:px-0 lg:pb-8 lg:pt-0">
        <label className="flex min-h-[48px] items-center gap-2.5 rounded-full bg-card px-4 shadow-card-sm lg:hidden">
          <Search size={18} strokeWidth={1.6} className="flex-none opacity-50" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search destination, worker, amount"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/40"
          />
        </label>

        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-3">
          {monthStepper}
          <div className="hidden lg:block">{chipRow}</div>
          {q && (
            <button
              onClick={() => setQ('')}
              className="hidden items-center gap-1.5 rounded-full border-0 bg-tint px-3 py-2 text-[13px] font-semibold text-accent-800 lg:flex"
            >
              Search: “{q}” ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
          <StatTile label="Revenue" value={money(sum.revenue, cur)} />
          <StatTile label="Expenses" value={money(sum.expense, cur)} tone="bad" />
          <StatTile label="Profit" value={money(sum.profit, cur)} tone={sum.profit < 0 ? 'bad' : 'ok'} />
          <StatTile label="Records" value={sum.count} />
        </div>

        <div className="lg:hidden">{performance}</div>
        <div className="lg:hidden">{chipRow}</div>

        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-5">
          {recs.loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <i key={i} className="lg-sk block h-[68px] rounded-[18px]" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={NotebookText}
              title={empty[0]}
              body={empty[1]}
              action={
                <Button size="md" className="mt-1" onClick={() => addRecord()}>
                  Add a record
                </Button>
              }
            />
          ) : (
            <>
              {/* Phone: list */}
              <section className="lg:hidden">
                {listHead}
                <div className="overflow-hidden rounded-[20px] bg-card shadow-card">
                  {visible.map((r, i) => {
                    const d = dayTile(r.date);
                    const p = profitOf(r);
                    return (
                      <Link
                        key={r.id}
                        to={`/app/records/${r.id}`}
                        className={`flex min-h-[68px] items-center gap-3 px-3.5 py-2.5 text-ink no-underline hover:bg-tint-soft ${
                          i ? 'border-t border-divider' : ''
                        }`}
                      >
                        <div className="flex w-11 flex-none flex-col items-center rounded-xl bg-rail py-1.5 leading-none">
                          <span className="lg-num text-lg font-semibold">{d.day}</span>
                          <span className="text-[10px] font-semibold uppercase opacity-55">{d.mon}</span>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-[15px] font-semibold">{recordTitle(r)}</span>
                          <span className="truncate text-[12.5px] opacity-55">
                            {[nameOf(r), r.truck].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                        <div className="flex flex-none flex-col items-end gap-0.5">
                          <span className="lg-num text-[15px] font-semibold">{money(r.revenue, cur)}</span>
                          <span className={`lg-num text-[12.5px] font-semibold ${p < 0 ? 'text-bad' : 'text-ok'}`}>
                            {money(p, cur)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Desktop: table */}
              <section className="hidden rounded-3xl bg-card p-5 shadow-card lg:block">
                {listHead}
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-[10.5px] uppercase tracking-[.1em] opacity-50">
                      <th className="py-2 font-semibold">Date</th>
                      <th className="py-2 font-semibold">Worker</th>
                      <th className="py-2 font-semibold">Details</th>
                      <th className="py-2 font-semibold">Truck</th>
                      <th className="py-2 text-right font-semibold">Revenue</th>
                      <th className="py-2 text-right font-semibold">Expenses</th>
                      <th className="py-2 text-right font-semibold">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => {
                      const p = profitOf(r);
                      return (
                        <tr
                          key={r.id}
                          onClick={() => navigate(`/app/records/${r.id}`)}
                          className="cursor-pointer border-t border-divider hover:bg-tint-soft"
                        >
                          <td className="whitespace-nowrap py-2.5">{shortDate(r.date)}</td>
                          <td className="py-2.5">{nameOf(r)}</td>
                          <td className="max-w-[200px] truncate py-2.5 font-semibold">{recordTitle(r)}</td>
                          <td className="py-2.5 opacity-60">{r.truck || '—'}</td>
                          <td className="lg-num py-2.5 text-right text-[15px]">{money(r.revenue, cur)}</td>
                          <td className="lg-num py-2.5 text-right text-[15px] text-bad">{money(r.expense, cur)}</td>
                          <td
                            className={`lg-num py-2.5 text-right text-[15px] font-semibold ${p < 0 ? 'text-bad' : 'text-ok'}`}
                          >
                            {money(p, cur)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            </>
          )}
          <div className="hidden lg:block">{performance}</div>
        </div>
      </div>

      <button
        onClick={() => addRecord()}
        aria-label="Add record"
        className="lg-tap fixed bottom-[max(22px,env(safe-area-inset-bottom))] right-[max(18px,calc(50vw-222px))] z-30 grid size-[62px] place-items-center rounded-full border-0 bg-accent text-on-accent shadow-[0_10px_26px_color-mix(in_srgb,var(--color-accent)_45%,transparent)] lg:hidden"
      >
        <Plus size={26} strokeWidth={2} />
      </button>
    </>
  );
}
