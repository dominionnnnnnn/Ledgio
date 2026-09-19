import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addRecord, updateRecord, useRecord, useUsage, useWorkers } from '../../lib/data';
import { lastDayOfMonth, monthOf, today } from '../../lib/dates';
import { formatTyping, money, parseAmount, symbolFor } from '../../lib/money';
import { FIELD_HINTS, MONEY_FIELDS } from '../../lib/fields';
import { limitsFor } from '../../lib/config';
import { settle } from '../../lib/settle';
import { BackBar } from '../../components/app/Header';
import Avatar from '../../components/app/Avatar';
import Sheet from '../../components/app/Sheet';
import EmptyState from '../../components/app/EmptyState';
import LimitNotice from '../../components/app/LimitNotice';
import LoadingScreen from '../../components/LoadingScreen';
import { Field } from '../../components/Field';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import { useAppShell } from '../../components/app/AppLayout';

const INPUT =
  'w-full min-h-[52px] rounded-xl border border-divider bg-card px-3.5 text-base text-ink placeholder:text-ink/40 outline-none focus:border-accent';
const CORE = ['Worker', 'Date', 'Revenue', 'Expense'];
const NUMBER_FIELDS = ['Quantity', 'Distance'];
const STATUS = ['Paid', 'Owing', 'Part-paid'];

/**
 * Add / edit a record. As a page on phones (and deep links); `embedded` renders it
 * inside the desktop modal instead, with `presetWorker` and `onDone`.
 */
export default function RecordForm({ embedded = false, presetWorker, onDone }) {
  const routeParams = useParams();
  const id = embedded ? undefined : routeParams.id;
  const { addWorker } = useAppShell();
  const isNew = !id;
  const { business, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const existing = useRecord(business.id, id);
  const workers = useWorkers(business.id);
  const sym = symbolFor(business.currency);

  const [params] = useSearchParams();
  // Deep links: /app/records/new?worker=<id>&date=YYYY-MM-DD
  const [workerId, setWorkerId] = useState(() => (isNew ? (presetWorker ?? params.get('worker') ?? '') : ''));
  const [date, setDate] = useState(() => {
    const d = params.get('date');
    return isNew && d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today() ? d : today();
  });
  const [vals, setVals] = useState({}); // everything else, as typed
  const [sheet, setSheet] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (!isNew && existing.data && !loaded.current) {
      loaded.current = true;
      const r = existing.data;
      setWorkerId(r.workerId);
      setDate(r.date);
      const v = {
        Revenue: r.revenue ? formatTyping(String(r.revenue)) : '',
        Expense: r.expense ? formatTyping(String(r.expense)) : '',
      };
      for (const [k, val] of Object.entries(r.values ?? {})) {
        v[k] = MONEY_FIELDS.includes(k) ? formatTyping(String(val)) : String(val);
      }
      setVals(v);
    }
  }, [isNew, existing.data]);

  // Pre-select the only active worker on a new record.
  const active = useMemo(() => (workers.data ?? []).filter((w) => w.active !== false), [workers.data]);
  useEffect(() => {
    if (isNew && !workerId && active.length === 1) setWorkerId(active[0].id);
  }, [isNew, workerId, active]);

  const usage = useUsage(business.id, monthOf(date));
  const limit = limitsFor(business.plan).recordsPerMonth;

  if ((!isNew && existing.loading) || workers.loading) return <LoadingScreen />;
  if (!isNew && !existing.data) {
    return (
      <>
        <BackBar title="Record" to="/app/records" />
        <p className="px-5 opacity-70">This record no longer exists.</p>
      </>
    );
  }

  const title = isNew ? 'Add record' : 'Edit record';
  if (isNew && (workers.data ?? []).length === 0) {
    return (
      <>
        {!embedded && <BackBar title={title} />}
        <div className={embedded ? 'p-6' : 'px-4 pt-2 lg:mx-auto lg:max-w-xl lg:px-0'}>
          <EmptyState
            icon={Users}
            title="Add a worker first"
            body="Every record is credited to a worker. Add one, then come back to write down the work."
            action={
              <Button size="md" className="mt-1" onClick={addWorker}>
                Add a worker
              </Button>
            }
          />
        </div>
      </>
    );
  }

  const fields = business.fields ?? CORE;
  const required = business.required ?? {};
  const allWorkers = workers.data ?? [];
  const worker = allWorkers.find((w) => w.id === workerId);
  const workerLabel = worker?.name ?? (existing.data?.workerId === workerId ? existing.data?.workerName : '');
  const revenue = parseAmount(vals.Revenue);
  const expense = parseAmount(vals.Expense);
  const monthFull = isNew && usage.count >= limit;
  const editMonth = !isNew ? existing.data.month : null;

  const setVal = (k) => (e) => {
    const raw = e.target.value;
    setVals((v) => ({ ...v, [k]: MONEY_FIELDS.includes(k) ? formatTyping(raw) : raw }));
  };

  function validate() {
    const next = {};
    for (const f of fields) {
      if (!required[f]) continue;
      if (f === 'Worker' && !workerId) next.Worker = 'Choose who did this work.';
      else if (f === 'Date' && !date) next.Date = 'Choose a date.';
      else if (!['Worker', 'Date'].includes(f) && !String(vals[f] ?? '').trim()) next[f] = `${f} is required.`;
    }
    if (date > today()) next.Date = 'The date can’t be in the future.';
    return next;
  }

  async function save() {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const values = {};
    for (const f of fields) {
      if (CORE.includes(f)) continue;
      const raw = String(vals[f] ?? '').trim();
      if (!raw) continue;
      values[f] = MONEY_FIELDS.includes(f) || NUMBER_FIELDS.includes(f) ? parseAmount(raw) : raw;
    }

    const workerChanged = !isNew && workerId !== existing.data.workerId;
    const record = {
      workerId,
      workerName: worker?.name ?? existing.data?.workerName ?? '',
      // The truck comes from the worker; old records keep the truck used at the time.
      truck: isNew || workerChanged ? (worker?.truck ?? '') : (existing.data.truck ?? ''),
      date,
      revenue,
      expense,
      values,
    };

    setBusy(true);
    const onError = () => {
      setErrors({ form: 'We could not save this record. Check your connection and try again.' });
      setBusy(false);
    };
    try {
      if (isNew) {
        const { id: newId, done } = addRecord(business.id, user.uid, record);
        await settle(done, onError);
        toast(navigator.onLine ? 'Record saved' : 'Record saved on this phone');
        if (embedded) onDone?.();
        else navigate(`/app/records/${newId}`, { replace: true });
      } else {
        const { done } = updateRecord(business.id, id, record);
        await settle(done, onError);
        toast('Record updated');
        navigate(`/app/records/${id}`, { replace: true });
      }
    } catch {
      /* message shown */
    }
  }

  function renderInput(f) {
    if (f === 'Worker' && embedded) {
      return (
        <select
          className={`${INPUT} px-3 ${errors.Worker ? 'border-bad' : ''}`}
          value={workerId}
          onChange={(e) => {
            setWorkerId(e.target.value);
            setErrors((er) => ({ ...er, Worker: undefined }));
          }}
        >
          <option value="">{FIELD_HINTS.Worker}</option>
          {allWorkers
            .filter((w) => w.active !== false || w.id === workerId)
            .map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
                {w.truck ? ` — ${w.truck}` : ''}
              </option>
            ))}
        </select>
      );
    }
    if (f === 'Worker') {
      return (
        <button
          type="button"
          onClick={() => setSheet(true)}
          className={`${INPUT} flex items-center justify-between text-left ${errors.Worker ? 'border-bad' : ''}`}
        >
          <span className={workerLabel ? '' : 'text-ink/40'}>{workerLabel || FIELD_HINTS.Worker}</span>
          <ChevronDown size={18} strokeWidth={1.6} className="opacity-50" />
        </button>
      );
    }
    if (f === 'Date') {
      return (
        <input
          type="date"
          className={INPUT}
          value={date}
          max={editMonth ? (lastDayOfMonth(editMonth) < today() ? lastDayOfMonth(editMonth) : today()) : today()}
          min={editMonth ? `${editMonth}-01` : undefined}
          onChange={(e) => setDate(e.target.value)}
        />
      );
    }
    if (MONEY_FIELDS.includes(f)) {
      return (
        <div className="relative">
          <span className="lg-num pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-semibold opacity-50">
            {sym}
          </span>
          <input
            inputMode="decimal"
            className={`${INPUT} lg-num pl-9 text-lg ${errors[f] ? 'border-bad' : ''}`}
            placeholder="0"
            value={vals[f] ?? ''}
            onChange={setVal(f)}
          />
        </div>
      );
    }
    if (f === 'Status') {
      return (
        <select className={`${INPUT} px-3`} value={vals.Status ?? ''} onChange={setVal('Status')}>
          <option value="">Choose…</option>
          {STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      );
    }
    if (f === 'Notes') {
      return (
        <textarea
          rows={3}
          maxLength={500}
          className={`${INPUT} py-3 leading-relaxed`}
          placeholder={FIELD_HINTS.Notes}
          value={vals.Notes ?? ''}
          onChange={setVal('Notes')}
        />
      );
    }
    return (
      <input
        className={`${INPUT} ${errors[f] ? 'border-bad' : ''}`}
        inputMode={NUMBER_FIELDS.includes(f) ? 'decimal' : undefined}
        maxLength={120}
        placeholder={FIELD_HINTS[f]}
        value={vals[f] ?? ''}
        onChange={setVal(f)}
      />
    );
  }

  const pickable = allWorkers.filter((w) => w.active !== false || w.id === workerId);

  const notice = monthFull && (
    <LimitNotice
      title={`${limit} records used this month`}
      body={`The free plan allows ${limit} new records a month. It resets on the 1st. You can still view and edit your records.`}
    />
  );
  const summary = (
    <div className={`flex flex-col gap-2.5 ${embedded ? '' : 'rounded-[20px] bg-card p-4 shadow-card'}`}>
      {embedded && (
        <span className="text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-50">This record</span>
      )}
      <div className="flex justify-between text-sm">
        <span className="opacity-65">Total revenue</span>
        <span className="lg-num font-semibold">{money(revenue, business.currency)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="opacity-65">Total expenses</span>
        <span className="lg-num font-semibold text-bad">{money(expense, business.currency)}</span>
      </div>
      <div className="h-px bg-divider" />
      <div className={`flex justify-between ${embedded ? 'flex-col gap-1' : 'items-baseline'}`}>
        <span className="font-heading text-xl font-semibold">Profit</span>
        <span
          className={`lg-num font-semibold ${embedded ? 'text-[38px]' : 'text-[30px]'} ${revenue - expense < 0 ? 'text-bad' : 'text-ok'}`}
        >
          {money(revenue - expense, business.currency)}
        </span>
      </div>
    </div>
  );
  const formError = errors.form && (
    <div role="alert" className="rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad">
      {errors.form}
    </div>
  );
  const saveButton = (
    <Button block onClick={save} disabled={busy || monthFull}>
      {busy ? 'Saving…' : isNew ? 'Save record' : 'Save changes'}
    </Button>
  );

  if (embedded) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto p-6">
          {notice}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            {fields.map((f) => (
              <Field
                key={f}
                label={`${f}${required[f] ? ' *' : ''}`}
                error={errors[f]}
                className={f === 'Notes' ? 'col-span-2' : ''}
              >
                {renderInput(f)}
              </Field>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-l border-divider bg-card/40 p-6">
          {summary}
          <div className="mt-auto flex flex-col gap-3">
            {formError}
            {saveButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackBar title={title} />
      <div className="flex flex-col gap-4 px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-xl lg:px-0">
        {notice}
        <div className="flex flex-col gap-3.5">
          {fields.map((f) => (
            <Field key={f} label={`${f}${required[f] ? ' *' : ''}`} error={errors[f]}>
              {renderInput(f)}
            </Field>
          ))}
        </div>
        {summary}
        {formError}
        {saveButton}
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Who did this work?">
        <div className="flex flex-col gap-[9px]">
          {pickable.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setWorkerId(w.id);
                setSheet(false);
                setErrors((e) => ({ ...e, Worker: undefined }));
              }}
              className={`flex min-h-16 w-full items-center gap-[13px] rounded-[20px] border-0 bg-card px-3.5 py-3 text-left text-ink shadow-card-sm ${
                w.id === workerId ? 'ring-2 ring-accent' : ''
              }`}
            >
              <Avatar id={w.id} name={w.name} photoUrl={w.photoUrl} size={40} />
              <span className="mr-auto text-base font-semibold">{w.name}</span>
              <span className="text-[12.5px] opacity-55">{[w.role, w.truck].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setSheet(false);
            addWorker();
          }}
          className="mt-3 flex h-[50px] w-full items-center justify-center gap-[9px] rounded-full border border-dashed border-divider bg-transparent text-[15px] font-semibold text-accent-700"
        >
          <UserPlus size={18} strokeWidth={1.6} /> Add a new worker
        </button>
      </Sheet>
    </>
  );
}
