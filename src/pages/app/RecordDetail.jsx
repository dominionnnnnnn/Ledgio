import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deleteRecord, useRecord, useWorkers } from '../../lib/data';
import { longDate } from '../../lib/dates';
import { money, profitOf } from '../../lib/money';
import { MONEY_FIELDS } from '../../lib/fields';
import { settle } from '../../lib/settle';
import { BackBar } from '../../components/app/Header';
import ConfirmDialog from '../../components/app/ConfirmDialog';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';

export default function RecordDetail() {
  const { id } = useParams();
  const { business } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const rec = useRecord(business.id, id);
  const workers = useWorkers(business.id);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (rec.loading) return <LoadingScreen />;
  if (!rec.data) {
    return (
      <>
        <BackBar title="Record" to="/app/records" />
        <p className="px-5 opacity-70">This record no longer exists.</p>
      </>
    );
  }

  const r = rec.data;
  const cur = business.currency;
  const profit = profitOf(r);
  const worker = workers.data?.find((w) => w.id === r.workerId);
  const noun = business.type === 'transport' ? 'trip' : 'record';

  // Rows follow the business's field order; Revenue/Expense are in the header.
  const rows = [];
  for (const f of business.fields ?? []) {
    if (f === 'Date') rows.push(['Date', longDate(r.date)]);
    else if (f === 'Worker') {
      rows.push(['Worker', worker?.name ?? r.workerName ?? 'Removed worker']);
      if (r.truck) rows.push(['Truck', r.truck]);
    } else if (f === 'Revenue') rows.push(['Revenue', money(r.revenue, cur)]);
    else if (f === 'Expense') rows.push(['Expense', money(r.expense, cur)]);
    else if (r.values?.[f] !== undefined && r.values[f] !== '') {
      rows.push([f, MONEY_FIELDS.includes(f) ? money(r.values[f], cur) : String(r.values[f])]);
    }
  }
  // Values saved under fields that were later switched off still show.
  for (const [k, v] of Object.entries(r.values ?? {})) {
    if (!(business.fields ?? []).includes(k)) rows.push([k, MONEY_FIELDS.includes(k) ? money(v, cur) : String(v)]);
  }

  async function remove() {
    setBusy(true);
    const { done } = deleteRecord(business.id, id);
    try {
      await settle(done);
      toast('Record deleted');
      navigate('/app/records', { replace: true });
    } catch {
      setBusy(false);
      setConfirm(false);
      toast('Could not delete. Try again.');
    }
  }

  return (
    <>
      <BackBar title="Record" />
      <div className="flex flex-col gap-3.5 px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-0">
        <section className="flex flex-col gap-3 rounded-3xl bg-[linear-gradient(162deg,var(--color-tint),var(--color-tint-soft)_55%,var(--color-card))] p-[18px] shadow-card">
          <span className="text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-60">
            Profit on this {noun}
          </span>
          <span className={`lg-num text-[46px] font-semibold leading-none ${profit < 0 ? 'text-bad' : 'text-ok'}`}>
            {money(profit, cur)}
          </span>
          <div className="flex gap-2">
            <span className="flex flex-1 items-center gap-2 rounded-full bg-card px-3 py-2 text-[13px] shadow-card-sm">
              <span className="opacity-65">Revenue</span>
              <strong className="lg-num ml-auto font-semibold">{money(r.revenue, cur)}</strong>
            </span>
            <span className="flex flex-1 items-center gap-2 rounded-full bg-card px-3 py-2 text-[13px] shadow-card-sm">
              <span className="opacity-65">Expenses</span>
              <strong className="lg-num ml-auto font-semibold text-bad">{money(r.expense, cur)}</strong>
            </span>
          </div>
        </section>

        <dl className="m-0 overflow-hidden rounded-[20px] bg-card shadow-card">
          {rows.map(([label, value], i) => (
            <div
              key={label}
              className={`flex min-h-[52px] items-center gap-4 px-4 py-2.5 ${i ? 'border-t border-divider' : ''}`}
            >
              <dt className="text-[13px] opacity-60">{label}</dt>
              <dd className="m-0 ml-auto text-right text-[15px] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-2.5">
          <Button variant="secondary" size="md" className="flex-1" onClick={() => navigate(`/app/records/${id}/edit`)}>
            <Pencil size={17} strokeWidth={1.6} /> Edit
          </Button>
          <Button variant="danger" size="md" className="flex-1" onClick={() => setConfirm(true)}>
            <Trash2 size={17} strokeWidth={1.6} /> Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Delete this record?"
        body="It will be removed from your totals and reports. This can't be undone, and it still counts toward this month's record limit."
        confirmLabel="Delete record"
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
        busy={busy}
      />
    </>
  );
}
