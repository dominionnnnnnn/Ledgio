import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, LoaderCircle, Trash2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addWorker, deleteWorker, updateWorker, useWorker, useWorkers } from '../../lib/data';
import { uploadImage } from '../../lib/cloudinary';
import { limitsFor } from '../../lib/config';
import { BackBar } from '../../components/app/Header';
import ConfirmDialog from '../../components/app/ConfirmDialog';
import LimitNotice from '../../components/app/LimitNotice';
import LoadingScreen from '../../components/LoadingScreen';
import { SelectInput, TextInput } from '../../components/Field';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import { settle } from '../../lib/settle';

const ROLES = ['Driver', 'Assistant', 'Loader', 'Mechanic', 'Sales', 'Staff', 'Other'];

function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[30px] w-[52px] flex-none rounded-full border-0 transition-colors ${on ? 'bg-accent' : 'bg-rail'}`}
    >
      <i
        className={`absolute top-[3px] size-6 rounded-full bg-card shadow-card-sm transition-[left] ${on ? 'left-[25px]' : 'left-[3px]'}`}
      />
    </button>
  );
}

/** Add / edit a worker. `embedded` renders inside the desktop modal (add only). */
export default function WorkerForm({ embedded = false, onDone }) {
  const routeParams = useParams();
  const id = embedded ? undefined : routeParams.id;
  const isNew = !id;
  const { business } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const existing = useWorker(business.id, id);
  const workers = useWorkers(business.id);

  const [form, setForm] = useState({ name: '', phone: '', role: 'Driver', truck: '', photoUrl: null, active: true });
  const [photo, setPhoto] = useState({ preview: null, uploading: false, error: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const loaded = useRef(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isNew && existing.data && !loaded.current) {
      loaded.current = true;
      const w = existing.data;
      setForm({
        name: w.name ?? '',
        phone: w.phone ?? '',
        role: w.role || 'Driver',
        truck: w.truck ?? '',
        photoUrl: w.photoUrl ?? null,
        active: w.active !== false,
      });
    }
  }, [isNew, existing.data]);

  if (!isNew && existing.loading) return <LoadingScreen />;
  if (!isNew && !existing.data) {
    return (
      <>
        <BackBar title="Worker" to="/app" />
        <p className="px-5 opacity-70">This worker no longer exists.</p>
      </>
    );
  }

  const limit = limitsFor(business.plan).workers;
  const count = business.workerCount ?? workers.data?.length ?? 0;
  if (isNew && count >= limit) {
    return (
      <>
        <BackBar title="Add worker" />
        <div className="px-4 pt-2">
          <LimitNotice
            title={`You have ${limit} workers`}
            body={`The free plan allows up to ${limit} workers. To add someone new, delete a worker who has left. Their past records keep their name.`}
          />
        </div>
      </>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));
  const showTruck = business.type === 'transport';

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhoto({ preview, uploading: true, error: '' });
    try {
      const url = await uploadImage(file, 'workers');
      setForm((f) => ({ ...f, photoUrl: url }));
      setPhoto({ preview, uploading: false, error: '' });
    } catch (err) {
      setPhoto({ preview: null, uploading: false, error: err.message });
    }
  }

  async function save() {
    const name = form.name.trim();
    const next = {};
    if (!name) next.name = 'Type the worker’s name.';
    if (form.phone && !/^[+0-9 ()-]{7,20}$/.test(form.phone.trim()))
      next.phone = 'That phone number doesn’t look right.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const data = {
      name,
      phone: form.phone.trim(),
      role: form.role,
      truck: showTruck ? form.truck.trim().toUpperCase() : (existing.data?.truck ?? ''),
      photoUrl: form.photoUrl,
    };
    setBusy(true);
    const onError = () => {
      setErrors({ form: 'We could not save this worker. Check your connection and try again.' });
      setBusy(false);
    };
    try {
      if (isNew) {
        const { done } = addWorker(business.id, data);
        await settle(done, onError);
        toast('Worker added');
        if (embedded) return onDone?.();
      } else {
        const { done } = updateWorker(business.id, id, { ...data, active: form.active });
        await settle(done, onError);
        toast('Worker saved');
      }
      navigate(isNew ? '/app' : `/app/workers/${id}`, { replace: true });
    } catch {
      /* message already shown */
    }
  }

  async function remove() {
    setBusy(true);
    const { done } = deleteWorker(business.id, id);
    try {
      await settle(done, () => {});
      toast('Worker deleted');
      navigate('/app', { replace: true });
    } catch {
      setConfirm(false);
      setBusy(false);
      setErrors({ form: 'We could not delete this worker. Try again.' });
    }
  }

  const avatarSrc = photo.preview || form.photoUrl;

  return (
    <>
      {!embedded && <BackBar title={isNew ? 'Add worker' : 'Edit worker'} />}
      <div
        className={`flex flex-col gap-4 ${embedded ? 'p-6' : 'px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-xl lg:px-0'}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative grid size-[72px] flex-none place-items-center overflow-hidden rounded-full bg-rail text-ink/50">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="size-full object-cover" />
            ) : (
              <User size={30} strokeWidth={1.4} />
            )}
            {photo.uploading && (
              <span className="absolute inset-0 grid place-items-center bg-card/70">
                <LoaderCircle size={22} strokeWidth={1.5} className="animate-spin text-accent" />
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={photo.uploading}
          >
            <Camera size={16} strokeWidth={1.6} />
            {avatarSrc ? 'Change photo' : 'Upload photo'}
          </Button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickPhoto} />
        </div>
        {photo.error && <p className="-mt-2 m-0 text-[12.5px] font-medium text-bad">{photo.error}</p>}

        <TextInput
          label="Full name"
          placeholder="e.g. Musa Danjuma"
          autoComplete="name"
          maxLength={80}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
        <TextInput
          label="Phone number"
          type="tel"
          inputMode="tel"
          placeholder="0803 000 0000"
          maxLength={20}
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <SelectInput label="Role" value={form.role} onChange={set('role')}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </SelectInput>
        {showTruck && (
          <TextInput
            label="Truck / vehicle (optional)"
            placeholder="e.g. LAG-442XA"
            maxLength={30}
            value={form.truck}
            onChange={set('truck')}
            hint="Filled in automatically on this worker's records."
          />
        )}

        {!isNew && (
          <div className="flex items-center gap-3.5 rounded-[18px] bg-card p-4 shadow-card-sm">
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold">Disable this worker</span>
              <span className="text-[12.5px] leading-snug opacity-60">Keeps past records, hides from new ones</span>
            </div>
            <Toggle
              on={!form.active}
              onChange={(v) => setForm((f) => ({ ...f, active: !v }))}
              label="Disable this worker"
            />
          </div>
        )}

        {errors.form && (
          <div role="alert" className="rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad">
            {errors.form}
          </div>
        )}

        <Button block className="mt-2" onClick={save} disabled={busy || photo.uploading}>
          {busy ? 'Saving…' : photo.uploading ? 'Uploading photo…' : 'Save worker'}
        </Button>
        {!isNew && (
          <Button
            variant="ghost"
            size="md"
            className="self-center !text-bad"
            onClick={() => setConfirm(true)}
            disabled={busy}
          >
            <Trash2 size={17} strokeWidth={1.6} /> Delete worker
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        title={`Delete ${form.name || 'this worker'}?`}
        body="This frees up a worker spot. Their past records stay and keep their name. If they might come back, disable them instead."
        confirmLabel="Delete worker"
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
        busy={busy}
      />
    </>
  );
}
