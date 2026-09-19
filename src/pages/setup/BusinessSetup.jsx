import { useRef, useState } from 'react';
import { collection, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { Check, ImageUp, LoaderCircle, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { uploadImage } from '../../lib/cloudinary';
import { CURRENCIES } from '../../lib/config';
import { BUSINESS_TYPES } from '../../lib/fields';
import { useAuth } from '../../context/AuthContext';
import { SelectInput, TextInput, Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import Button from '../../components/Button';

const STEPS = [
  { title: 'What is your business called?', body: 'This name and logo show at the top of every screen.' },
  { title: 'What kind of business is it?', body: 'We use this to suggest the right record fields.' },
  { title: 'Which currency do you use?', body: 'All money in the app is shown in this currency.' },
];

export default function BusinessSetup() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [type, setType] = useState('transport');
  const [currency, setCurrency] = useState('NGN');
  const [logo, setLogo] = useState({ url: null, preview: null, uploading: false, error: '' });
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function pickLogo(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setLogo({ url: null, preview, uploading: true, error: '' });
    try {
      const url = await uploadImage(file, 'logos');
      setLogo({ url, preview, uploading: false, error: '' });
    } catch (err) {
      URL.revokeObjectURL(preview);
      setLogo({ url: null, preview: null, uploading: false, error: err.message });
    }
  }

  function clearLogo() {
    if (logo.preview) URL.revokeObjectURL(logo.preview);
    setLogo({ url: null, preview: null, uploading: false, error: '' });
  }

  async function next() {
    if (step === 0) {
      if (!name.trim()) return setNameError('Type the name of your business.');
      setNameError('');
    }
    if (step < 2) return setStep(step + 1);

    // Last step: create the business and link it to this user in one batch.
    setBusy(true);
    setFormError('');
    try {
      const userRef = doc(db, 'users', user.uid);
      if (!profile) {
        // Sign-up saved the account but not its profile (e.g. the connection dropped).
        await setDoc(userRef, { email: user.email, businessId: null, createdAt: serverTimestamp() });
      }
      const bizRef = doc(collection(db, 'businesses'));
      const batch = writeBatch(db);
      batch.set(bizRef, {
        name: name.trim(),
        type,
        currency,
        logoUrl: logo.url,
        ownerId: user.uid,
        plan: 'free',
        workerCount: 0,
        fields: [],
        required: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.update(userRef, { businessId: bizRef.id });
      // Not awaited on purpose: offline, the batch is queued and the app moves on.
      batch.commit().catch(() => {
        setFormError('We could not save your business. Check your connection and try again.');
        setBusy(false);
      });
    } catch {
      setFormError('We could not save your business. Check your connection and try again.');
      setBusy(false);
    }
  }

  const s = STEPS[step];
  const waitingForLogo = logo.uploading;

  return (
    <Screen className="pt-[max(16px,env(safe-area-inset-top))]">
      <div className="mb-[18px] flex gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <i
            key={i}
            className={`block h-[5px] flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-rail'}`}
          />
        ))}
      </div>

      <div key={step} className="animate-screen-in flex flex-1 flex-col">
        <div className="text-[11px] font-semibold uppercase tracking-[.14em] text-accent-700">Step {step + 1} of 3</div>
        <h1 className="m-0 mt-2 font-heading text-[30px] font-semibold leading-[1.08]">{s.title}</h1>
        <p className="mb-5 mt-1.5 text-[14.5px] leading-relaxed opacity-65">{s.body}</p>

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <TextInput
              label="Business name"
              placeholder="e.g. Kalu & Sons"
              autoComplete="organization"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
            />
            <Field label="Business logo (optional)" error={logo.error}>
              <div className="flex flex-col items-center gap-2.5 rounded-[20px] bg-card p-[22px] shadow-card">
                {logo.preview ? (
                  <div className="relative">
                    <img src={logo.preview} alt="Logo preview" className="size-[72px] rounded-2xl object-cover" />
                    {logo.uploading && (
                      <div className="absolute inset-0 grid place-items-center rounded-2xl bg-card/70">
                        <LoaderCircle size={24} strokeWidth={1.5} className="animate-spin text-accent" />
                      </div>
                    )}
                    {!logo.uploading && (
                      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-ok text-on-accent">
                        <Check size={14} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="grid size-[58px] place-items-center rounded-full bg-tint text-accent-800">
                    <ImageUp size={24} strokeWidth={1.5} />
                  </div>
                )}
                <span className="font-mono text-[11.5px] opacity-55">
                  {logo.uploading ? 'uploading…' : 'logo upload · png or jpg'}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={logo.uploading}
                  >
                    {logo.preview ? 'Change' : 'Choose a file'}
                  </Button>
                  {logo.preview && !logo.uploading && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearLogo} aria-label="Remove logo">
                      <X size={16} strokeWidth={1.6} /> Remove
                    </Button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickLogo} />
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <SelectInput label="Business type" value={type} onChange={(e) => setType(e.target.value)}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectInput>
        )}

        {step === 2 && (
          <div role="radiogroup" aria-label="Currency" className="flex flex-col gap-2.5">
            {CURRENCIES.map((c) => {
              const on = c.code === currency;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCurrency(c.code)}
                  className={`lg-tap flex min-h-[60px] items-center gap-3 rounded-[18px] border-0 bg-card px-3.5 text-left text-ink shadow-card-sm ${
                    on ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <span className="grid size-[38px] flex-none place-items-center rounded-full bg-tint font-heading text-lg font-semibold">
                    {c.symbol}
                  </span>
                  <span className="mr-auto text-[15.5px] font-medium">{c.label}</span>
                  <i
                    className={`grid size-5 flex-none place-items-center rounded-full ${on ? 'bg-accent text-on-accent' : 'bg-rail'}`}
                  >
                    {on && <Check size={13} strokeWidth={2.2} />}
                  </i>
                </button>
              );
            })}
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="mt-4 rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad"
          >
            {formError}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Button block onClick={next} disabled={busy || (step === 2 && waitingForLogo)}>
            {busy
              ? 'Saving…'
              : step === 2
                ? waitingForLogo
                  ? 'Uploading logo…'
                  : 'Set up my record fields'
                : 'Continue'}
          </Button>
          {step > 0 && (
            <Button variant="ghost" size="sm" className="self-center" onClick={() => setStep(step - 1)} disabled={busy}>
              Back
            </Button>
          )}
        </div>
      </div>
    </Screen>
  );
}
