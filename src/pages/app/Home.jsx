import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, NotebookText, Plus, Receipt, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecordsSince, useWorkers } from '../../lib/data';
import { PERIODS, shortDate, startOfMonth, startOfWeek, today } from '../../lib/dates';
import { money, moneyShort, profitOf, totals } from '../../lib/money';
import { bucketize } from '../../lib/buckets';
import { HomeHeader } from '../../components/app/Header';
import { useAppShell } from '../../components/app/AppLayout';
import Avatar from '../../components/app/Avatar';
import EmptyState from '../../components/app/EmptyState';
import Segmented from '../../components/app/Segmented';
import { BarPairs, Legend } from '../../components/app/Charts';
import Button from '../../components/Button';
import PushPrompt from '../../components/app/PushPrompt';
import { recordTitle } from './Records';

const label = 'flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-60';

export default function Home() {
  const { business } = useAuth();
  const { addRecord, addWorker } = useAppShell();
  const navigate = useNavigate();
  const workersRef = useRef(null);
  const [period, setPeriod] = useState('week');
  const cur = business.currency;

  const t = today();
  const from = startOfWeek(t) < startOfMonth(t) ? startOfWeek(t) : startOfMonth(t);
  const records = useRecordsSince(business.id, from);
  const workers = useWorkers(business.id);

  const p = PERIODS.find((x) => x.key === period);
  const start = p.from();
  const inPeriod = useMemo(
    () => (records.data ?? []).filter((r) => r.date >= start && r.date <= t),
    [records.data, start, t],
  );
  const sum = totals(inPeriod);
  const workerList = workers.data ?? [];
  const buckets = useMemo(() => bucketize(inPeriod, start, t, workerList), [inPeriod, start, t, workerList]);

  const perWorker = useMemo(() => {
    const m = {};
    for (const r of inPeriod) (m[r.workerId] ??= []).push(r);
    return m;
  }, [inPeriod]);

  return (
    <>
      <HomeHeader />
      <div className="flex flex-col gap-[18px] px-4 pb-7 pt-1 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:px-0 lg:pt-0">
        <div className="flex flex-col gap-[18px] lg:gap-5">
          {/* Summary card */}
          <section className="flex flex-col gap-4 rounded-3xl bg-[linear-gradient(162deg,var(--color-tint),var(--color-tint-soft)_55%,var(--color-card))] p-[18px] shadow-card lg:p-6">
            <div className="flex items-center gap-2.5">
              <Segmented
                value={period}
                onChange={setPeriod}
                tone="card"
                className="flex-1 lg:max-w-[340px] lg:flex-none lg:basis-[340px]"
              />
              <button
                onClick={() =>
                  window.innerWidth >= 1024
                    ? navigate('/app/workers')
                    : workersRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                className="ml-auto flex h-[34px] flex-none items-center gap-[5px] whitespace-nowrap rounded-full border-0 bg-card px-2.5 text-[11.5px] font-semibold text-accent-800 shadow-card-sm"
              >
                <Users size={15} strokeWidth={1.6} />
                {workerList.length} {workerList.length === 1 ? 'worker' : 'workers'}
              </button>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:gap-x-10 lg:gap-y-3">
              <div className="flex flex-col gap-[3px]">
                <span className={label}>
                  <TrendingUp size={14} strokeWidth={1.6} /> Revenue · {p.long}
                </span>
                <span className="lg-num text-[46px] font-semibold leading-[1.02] lg:text-[44px] xl:text-[52px]">
                  {records.loading ? '—' : money(sum.revenue, cur)}
                </span>
              </div>
              <div className="h-px bg-ink/10 lg:hidden" />
              <div className="flex flex-col gap-[3px]">
                <span className={label}>
                  <Wallet size={14} strokeWidth={1.6} /> Profit
                </span>
                <span
                  className={`lg-num text-[40px] font-semibold leading-[1.02] lg:text-[44px] xl:text-[52px] ${sum.profit < 0 ? 'text-bad' : 'text-ok'}`}
                >
                  {records.loading ? '—' : money(sum.profit, cur)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="flex flex-1 items-center gap-2 rounded-full bg-card px-3 py-[9px] text-[13px] shadow-card-sm lg:flex-none lg:px-4">
                <Receipt size={15} strokeWidth={1.6} className="opacity-65" />
                <span className="opacity-65">Expenses</span>
                <strong className="lg-num ml-auto font-semibold text-bad lg:ml-2">
                  <span className="lg:hidden">{moneyShort(sum.expense, cur)}</span>
                  <span className="hidden lg:inline">{money(sum.expense, cur)}</span>
                </strong>
              </span>
              <Link
                to="/app/records"
                className="flex flex-none items-center gap-[7px] rounded-full bg-card px-3 py-[9px] text-[13px] text-ink no-underline shadow-card-sm"
              >
                <NotebookText size={15} strokeWidth={1.6} className="opacity-65" />
                <strong className="lg-num font-semibold">{sum.count}</strong>
                <span className="opacity-65">records</span>
              </Link>
            </div>
          </section>

          <PushPrompt show={(records.data ?? []).length > 0} />

          {/* Main action (desktop has it in the sidebar) */}
          <button
            onClick={() => addRecord()}
            className="lg-tap flex h-16 items-center justify-center gap-3 rounded-full border-0 bg-accent font-heading text-[21px] font-semibold text-on-accent shadow-[0_8px_22px_color-mix(in_srgb,var(--color-accent)_38%,transparent)] lg:hidden"
          >
            <span className="grid size-[30px] place-items-center rounded-full bg-on-accent/20">
              <Plus size={20} strokeWidth={2} />
            </span>
            Add Record
          </button>

          {/* Latest records (desktop) */}
          <section className="hidden rounded-3xl bg-card p-5 shadow-card lg:block">
            <div className="mb-2 flex items-baseline">
              <h2 className="m-0 mr-auto font-heading text-[22px] font-semibold">Latest records</h2>
              <Link
                to="/app/records"
                className="text-[13px] font-semibold text-accent-700 no-underline hover:underline"
              >
                See all →
              </Link>
            </div>
            {(records.data ?? []).length === 0 ? (
              <p className="m-0 py-6 text-center text-sm opacity-55">No records yet this month.</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[.1em] opacity-50">
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold">Worker</th>
                    <th className="py-2 font-semibold">Details</th>
                    <th className="py-2 text-right font-semibold">Revenue</th>
                    <th className="py-2 text-right font-semibold">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {(records.data ?? []).slice(0, 6).map((r) => {
                    const pr = profitOf(r);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => navigate(`/app/records/${r.id}`)}
                        className="cursor-pointer border-t border-divider hover:bg-tint-soft"
                      >
                        <td className="whitespace-nowrap py-2.5">{shortDate(r.date)}</td>
                        <td className="py-2.5">{workerList.find((w) => w.id === r.workerId)?.name ?? r.workerName}</td>
                        <td className="max-w-[180px] truncate py-2.5 font-semibold">{recordTitle(r)}</td>
                        <td className="lg-num py-2.5 text-right text-[15px]">{money(r.revenue, cur)}</td>
                        <td
                          className={`lg-num py-2.5 text-right text-[15px] font-semibold ${pr < 0 ? 'text-bad' : 'text-ok'}`}
                        >
                          {money(pr, cur)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          {/* Workers */}
          <section ref={workersRef} className="scroll-mt-4 lg:rounded-3xl lg:bg-card lg:p-5 lg:shadow-card">
            <div className="mb-2.5 flex items-center gap-2">
              <h2 className="m-0 mr-auto font-heading text-[23px] font-semibold">Workers</h2>
              <button
                onClick={addWorker}
                aria-label="Add worker"
                className="lg-tap grid size-[38px] place-items-center rounded-[14px] border-0 bg-tint text-accent-800"
              >
                <UserPlus size={19} strokeWidth={1.6} />
              </button>
            </div>

            {workers.loading ? (
              <div className="flex flex-col gap-2.5">
                <i className="lg-sk block h-[72px] rounded-[20px]" />
                <i className="lg-sk block h-[72px] rounded-[20px]" />
              </div>
            ) : workerList.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No workers yet"
                body="Add your workers first. Then every record you write down is credited to one of them."
                action={
                  <Button size="md" className="mt-1" onClick={addWorker}>
                    Add your first worker
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {workerList.map((w) => {
                  const s = totals(perWorker[w.id] ?? []);
                  return (
                    <Link
                      key={w.id}
                      to={`/app/workers/${w.id}`}
                      className={`lg-tap flex min-h-[72px] items-center gap-[13px] rounded-[20px] bg-card p-3.5 text-ink no-underline shadow-card lg:bg-bg lg:shadow-none lg:hover:bg-tint-soft ${
                        w.active === false ? 'opacity-60' : ''
                      }`}
                    >
                      <Avatar id={w.id} name={w.name} photoUrl={w.photoUrl} />
                      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                        <span className="flex items-center gap-2 truncate text-[16.5px] font-semibold">
                          {w.name}
                          {w.active === false && (
                            <span className="rounded-full bg-rail px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide opacity-80">
                              Disabled
                            </span>
                          )}
                        </span>
                        <span className="text-[13.5px] opacity-60">
                          {s.count} {s.count === 1 ? 'record' : 'records'} ·{' '}
                          <strong className={`font-semibold ${s.profit < 0 ? 'text-bad' : 'text-ok'}`}>
                            {money(s.profit, cur)}
                          </strong>{' '}
                          profit
                        </span>
                      </div>
                      <ChevronRight size={18} strokeWidth={1.6} className="flex-none opacity-40" />
                    </Link>
                  );
                })}
                <Link
                  to="/app/records"
                  className="self-start rounded-full px-3 py-2 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft lg:hidden"
                >
                  See all records →
                </Link>
              </div>
            )}
          </section>

          {/* Chart (desktop) */}
          <section className="hidden rounded-3xl bg-card p-5 shadow-card lg:block">
            <div className="mb-3.5 flex items-baseline gap-2.5">
              <h2 className="m-0 mr-auto whitespace-nowrap font-heading text-xl font-semibold">Revenue vs expenses</h2>
              <span className="flex gap-2.5">
                <Legend />
              </span>
            </div>
            {sum.count === 0 ? (
              <div className="grid h-[180px] place-items-center text-sm opacity-55">No records in this period</div>
            ) : (
              <BarPairs buckets={buckets} height={180} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
