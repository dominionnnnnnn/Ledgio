import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { NotebookText, Pencil, Phone, Plus, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecordsSince, useWorker } from '../../lib/data';
import { PERIODS, addDays, dayTile, isoWeek, startOfMonth, startOfWeek, today } from '../../lib/dates';
import { money, profitOf, totals } from '../../lib/money';
import { recordTitle } from './Records';
import { BackBar } from '../../components/app/Header';
import Avatar from '../../components/app/Avatar';
import Segmented from '../../components/app/Segmented';
import StatTile from '../../components/app/StatTile';
import { Sparkline } from '../../components/app/Charts';
import LoadingScreen from '../../components/LoadingScreen';
import { useAppShell } from '../../components/app/AppLayout';

const WEEKS = 6;

export default function WorkerDetail() {
  const { id } = useParams();
  const { business } = useAuth();
  const { addRecord } = useAppShell();
  const cur = business.currency;
  const [period, setPeriod] = useState('week');

  const t = today();
  const firstWeek = addDays(startOfWeek(t), -7 * (WEEKS - 1));
  const from = firstWeek < startOfMonth(t) ? firstWeek : startOfMonth(t);
  const worker = useWorker(business.id, id);
  // One date-range query, filtered to this worker here (avoids needing a composite index).
  const recs = useRecordsSince(business.id, from);

  const mine = useMemo(() => (recs.data ?? []).filter((r) => r.workerId === id), [recs.data, id]);
  const p = PERIODS.find((x) => x.key === period);
  const inPeriod = mine.filter((r) => r.date >= p.from() && r.date <= t);
  const sum = totals(inPeriod);

  const weekly = useMemo(() => {
    const starts = Array.from({ length: WEEKS }, (_, i) => addDays(firstWeek, i * 7));
    return starts.map((s) => {
      const end = addDays(s, 6);
      return totals(mine.filter((r) => r.date >= s && r.date <= end)).profit;
    });
  }, [mine, firstWeek]);

  if (worker.loading) return <LoadingScreen />;
  if (!worker.data) {
    return (
      <>
        <BackBar title="Worker" to="/app" />
        <p className="px-5 opacity-70">This worker no longer exists.</p>
      </>
    );
  }
  const w = worker.data;
  const first = w.name.split(' ')[0];
  const disabled = w.active === false;

  return (
    <>
      <BackBar
        title="Worker"
        to="/app"
        action={
          <Link
            to={`/app/workers/${id}/edit`}
            aria-label="Edit worker"
            className="lg-tap grid size-10 place-items-center rounded-[14px] bg-rail text-ink hover:bg-tint"
          >
            <Pencil size={18} strokeWidth={1.6} />
          </Link>
        }
      />
      <div className="flex flex-col gap-4 px-4 pb-7 pt-1 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:px-0">
        <section className="flex items-center gap-3.5 rounded-3xl bg-card p-4 shadow-card lg:col-start-1 lg:row-start-1 lg:p-5">
          <Avatar id={w.id} name={w.name} photoUrl={w.photoUrl} size={60} />
          <div className="flex min-w-0 flex-col gap-[5px]">
            <span className="flex items-center gap-2 font-heading text-[25px] font-semibold leading-none">
              <span className="truncate">{w.name}</span>
              {disabled && (
                <span className="rounded-full bg-rail px-2 py-0.5 font-body text-[10.5px] font-semibold uppercase tracking-wide opacity-80">
                  Disabled
                </span>
              )}
            </span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] opacity-60">
              <span>{w.role}</span>
              {w.phone && (
                <a
                  href={`tel:${w.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-1 text-inherit no-underline"
                >
                  <Phone size={13} strokeWidth={1.6} /> {w.phone}
                </a>
              )}
              {w.truck && (
                <span className="flex items-center gap-1">
                  <Truck size={13} strokeWidth={1.6} /> {w.truck}
                </span>
              )}
            </span>
          </div>
          {!disabled && (
            <button
              onClick={() => addRecord(id)}
              className="lg-tap ml-auto hidden h-12 flex-none items-center gap-2 rounded-full border-0 bg-accent px-5 font-heading text-base font-semibold text-on-accent shadow-card lg:flex"
            >
              <Plus size={17} strokeWidth={2} /> Add record for {first}
            </button>
          )}
        </section>

        {!disabled && (
          <button
            onClick={() => addRecord(id)}
            className="lg-tap flex h-14 lg:hidden items-center justify-center gap-2.5 rounded-full border-0 bg-accent font-heading text-lg font-semibold text-on-accent shadow-card"
          >
            <span className="grid size-[26px] place-items-center rounded-full bg-on-accent/20">
              <Plus size={17} strokeWidth={2} />
            </span>
            Add record for {first}
          </button>
        )}

        <Segmented value={period} onChange={setPeriod} className="lg:col-start-2 lg:row-start-1" />

        <div className="grid grid-cols-2 gap-2.5 lg:col-start-2 lg:row-start-2">
          <StatTile label="Records" value={sum.count} />
          <StatTile label="Revenue" value={money(sum.revenue, cur)} />
          <StatTile label="Expenses" value={money(sum.expense, cur)} tone="bad" />
          <StatTile label="Profit" value={money(sum.profit, cur)} tone={sum.profit < 0 ? 'bad' : 'ok'} />
        </div>

        <section className="rounded-[20px] bg-card px-4 pb-3 pt-4 shadow-card lg:col-start-2 lg:row-start-3">
          <div className="mb-2.5 flex items-baseline gap-2">
            <h2 className="m-0 mr-auto font-heading text-xl font-semibold">Profit per week</h2>
            <span className="text-[11.5px] opacity-50">last {WEEKS} weeks</span>
          </div>
          {recs.loading ? <i className="lg-sk block h-[92px] rounded-xl" /> : <Sparkline values={weekly} />}
          <div className="mt-1.5 flex justify-between text-[10.5px] font-semibold opacity-45">
            <span>W{isoWeek(firstWeek)}</span>
            <span>W{isoWeek(t)}</span>
          </div>
        </section>

        <section className="lg:col-start-1 lg:row-span-3 lg:row-start-2">
          <h2 className="m-0 mb-2.5 font-heading text-xl font-semibold">Records · {p.long.toLowerCase()}</h2>
          {inPeriod.length === 0 ? (
            <div className="flex items-center gap-3 rounded-[20px] bg-card p-4 text-sm shadow-card-sm">
              <NotebookText size={20} strokeWidth={1.5} className="flex-none opacity-50" />
              <span className="opacity-65">No records for {first} in this period.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-[9px]">
              {inPeriod.map((r) => {
                const d = dayTile(r.date);
                const pr = profitOf(r);
                return (
                  <Link
                    key={r.id}
                    to={`/app/records/${r.id}`}
                    className="lg-tap flex items-center gap-[13px] rounded-[20px] bg-card px-3.5 py-[13px] text-ink no-underline shadow-card"
                  >
                    <div className="flex size-11 flex-none flex-col items-center justify-center rounded-[14px] bg-tint-soft leading-[1.05]">
                      <span className="lg-num text-lg font-semibold">{d.day}</span>
                      <span className="text-[9.5px] font-semibold uppercase tracking-[.08em] opacity-55">{d.mon}</span>
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[15.5px] font-semibold">{recordTitle(r)}</span>
                    <span className={`lg-num text-[15px] font-semibold ${pr < 0 ? 'text-bad' : 'text-ok'}`}>
                      {money(pr, cur)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
