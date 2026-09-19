import { Link } from 'react-router-dom';
import { ChevronRight, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecordsSince, useWorkers } from '../../lib/data';
import { startOfMonth, today } from '../../lib/dates';
import { money, totals } from '../../lib/money';
import { limitsFor } from '../../lib/config';
import { BackBar } from '../../components/app/Header';
import { useAppShell } from '../../components/app/AppLayout';
import Avatar from '../../components/app/Avatar';
import EmptyState from '../../components/app/EmptyState';
import Button from '../../components/Button';

/** All workers with this month's results. */
export default function Workers() {
  const { business } = useAuth();
  const { addWorker } = useAppShell();
  const workers = useWorkers(business.id);
  const recs = useRecordsSince(business.id, startOfMonth(today()));
  const list = workers.data ?? [];
  const limit = limitsFor(business.plan).workers;

  return (
    <>
      <BackBar
        title="Workers"
        top
        action={
          <button
            onClick={addWorker}
            aria-label="Add worker"
            className="lg-tap grid size-10 place-items-center rounded-[14px] border-0 bg-tint text-accent-800"
          >
            <UserPlus size={19} strokeWidth={1.6} />
          </button>
        }
      />
      <div className="flex flex-col gap-3 px-4 pb-7 pt-1 lg:px-0">
        <div className="flex items-center gap-3">
          <p className="m-0 mr-auto text-[13px] opacity-60">
            {list.length} of {limit} workers on the free plan · results for this month
          </p>
          <div className="hidden lg:block">
            <Button size="sm" onClick={addWorker}>
              <UserPlus size={16} strokeWidth={1.7} /> Add worker
            </Button>
          </div>
        </div>
        {workers.loading ? (
          <i className="lg-sk block h-[72px] rounded-[20px]" />
        ) : list.length === 0 ? (
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
          <div className="grid gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
            {list.map((w) => {
              const s = totals((recs.data ?? []).filter((r) => r.workerId === w.id));
              return (
                <Link
                  key={w.id}
                  to={`/app/workers/${w.id}`}
                  className={`lg-tap flex min-h-[72px] items-center gap-[13px] rounded-[20px] bg-card p-3.5 text-ink no-underline shadow-card ${
                    w.active === false ? 'opacity-60' : ''
                  }`}
                >
                  <Avatar id={w.id} name={w.name} photoUrl={w.photoUrl} />
                  <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="truncate text-[16.5px] font-semibold">
                      {w.name}
                      {w.active === false && <span className="ml-2 text-[11px] uppercase opacity-70">Disabled</span>}
                    </span>
                    <span className="truncate text-[13px] opacity-60">
                      {[w.role, w.truck].filter(Boolean).join(' · ')} · {s.count} records ·{' '}
                      <strong className={`font-semibold ${s.profit < 0 ? 'text-bad' : 'text-ok'}`}>
                        {money(s.profit, business.currency)}
                      </strong>
                    </span>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.6} className="flex-none opacity-40" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
