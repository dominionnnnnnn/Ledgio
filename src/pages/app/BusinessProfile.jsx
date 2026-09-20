import { useRef, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ImageUp, LoaderCircle, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { updateBusiness } from '../../lib/data';
import { uploadImage } from '../../lib/cloudinary';
import { settle } from '../../lib/settle';
import { CURRENCIES, isPremium, premiumEndsAt } from '../../lib/config';
import PremiumBadge from '../../components/app/PremiumBadge';
import { BUSINESS_TYPES } from '../../lib/fields';
import { BackBar } from '../../components/app/Header';
import ThemeSwitch from '../../components/app/ThemeSwitch';
import BrandMark from '../../components/BrandMark';
import { SelectInput, TextInput } from '../../components/Field';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';

function Card({ title, children }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-3xl bg-card p-4 shadow-card">
      <h2 className="m-0 font-heading text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function BusinessProfile() {
  const { business, user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: business.name,
    type: business.type,
    currency: business.currency,
    logoUrl: business.logoUrl ?? null,
  });
  const [logo, setLogo] = useState({ uploading: false, error: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const dirty =
    form.name.trim() !== business.name ||
    form.type !== business.type ||
    form.currency !== business.currency ||
    form.logoUrl !== (business.logoUrl ?? null);

  async function pickLogo(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLogo({ uploading: true, error: '' });
    try {
      const url = await uploadImage(file, 'logos');
      setForm((f) => ({ ...f, logoUrl: url }));
      setLogo({ uploading: false, error: '' });
    } catch (err) {
      setLogo({ uploading: false, error: err.message });
    }
  }

  async function save() {
    if (!form.name.trim()) return setError('Type the name of your business.');
    setError('');
    setBusy(true);
    try {
      await settle(
        updateBusiness(business.id, {
          name: form.name.trim(),
          type: form.type,
          currency: form.currency,
          logoUrl: form.logoUrl,
        }).done,
      );
      toast('Business profile saved');
    } catch {
      setError('We could not save your changes. Try again.');
    }
    setBusy(false);
  }

  async function resetPassword() {
    try {
      await sendPasswordResetEmail(auth, user.email, { url: `${window.location.origin}/login` });
      toast(`Reset link sent to ${user.email}`);
    } catch {
      toast('Could not send the link. Try again.');
    }
  }

  return (
    <>
      <BackBar title="Business profile" top />
      <div className="flex flex-col gap-4 px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-0">
        <Card title="Business">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <BrandMark size={64} letter={form.name[0]?.toUpperCase()} logoUrl={form.logoUrl} />
              {logo.uploading && (
                <span className="absolute inset-0 grid place-items-center rounded-[22px] bg-card/70">
                  <LoaderCircle size={22} strokeWidth={1.5} className="animate-spin text-accent" />
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={logo.uploading}>
                <ImageUp size={16} strokeWidth={1.6} /> {form.logoUrl ? 'Change logo' : 'Add logo'}
              </Button>
              {form.logoUrl && (
                <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, logoUrl: null }))}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickLogo} />
          </div>
          {logo.error && <p className="m-0 text-[12.5px] font-medium text-bad">{logo.error}</p>}
          <TextInput label="Business name" maxLength={80} value={form.name} onChange={set('name')} />
          <SelectInput label="Business type" value={form.type} onChange={set('type')}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Currency" value={form.currency} onChange={set('currency')}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.label}
              </option>
            ))}
          </SelectInput>
          {form.currency !== business.currency && (
            <p className="-mt-1.5 m-0 text-[12.5px] leading-snug text-bad">
              Only the symbol changes. Amounts you already saved are not converted.
            </p>
          )}
          {error && (
            <div role="alert" className="rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad">
              {error}
            </div>
          )}
          <Button block size="md" onClick={save} disabled={!dirty || busy || logo.uploading}>
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </Card>

        <Card title="Appearance">
          <ThemeSwitch />
        </Card>

        <Card title="Plan">
          {isPremium(business) ? (
            <div className="flex flex-col gap-1.5">
              <PremiumBadge className="self-start" />
              <p className="m-0 text-[14px] opacity-70">
                Unlimited workers and records
                {premiumEndsAt(business) &&
                  ` until ${premiumEndsAt(business).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                .
              </p>
            </div>
          ) : (
            <p className="m-0 text-[14px] opacity-70">
              Free plan: up to 3 workers and 50 records a month. Premium is coming soon.
            </p>
          )}
        </Card>

        <Card title="Account">
          <div className="flex items-center gap-2.5 text-[15px]">
            <Mail size={17} strokeWidth={1.6} className="opacity-55" />
            <span className="truncate">{user.email}</span>
          </div>
          <Button variant="secondary" size="md" onClick={resetPassword}>
            Change password
          </Button>
          <p className="-mt-1.5 m-0 text-[12.5px] opacity-55">We’ll email you a link to set a new one.</p>
        </Card>
      </div>
    </>
  );
}