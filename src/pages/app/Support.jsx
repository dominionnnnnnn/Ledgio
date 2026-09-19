import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Headset, LoaderCircle, MessageCircle, Paperclip, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTicket, useTickets } from '../../lib/data';
import { uploadImage } from '../../lib/cloudinary';
import { settle } from '../../lib/settle';
import { SUPPORT_WHATSAPP } from '../../lib/config';
import { BackBar } from '../../components/app/Header';
import StatusPill from '../../components/app/StatusPill';
import { Field, SelectInput, TextInput } from '../../components/Field';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';

export const CATEGORIES = ['Records & data', 'Workers', 'Plans & billing', 'App not working', 'Something else'];

export const shortWhen = (ts) =>
  (ts?.toDate?.() ?? new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function Support() {
  const { business, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const tickets = useTickets(business.id);
  const [form, setForm] = useState({ category: CATEGORIES[0], subject: '', message: '' });
  const [shot, setShot] = useState({ url: null, name: '', uploading: false, error: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function pickShot(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setShot({ url: null, name: file.name, uploading: true, error: '' });
    try {
      const url = await uploadImage(file, 'support');
      setShot({ url, name: file.name, uploading: false, error: '' });
    } catch (err) {
      setShot({ url: null, name: '', uploading: false, error: err.message });
    }
  }

  async function send() {
    const next = {};
    if (!form.subject.trim()) next.subject = 'Give the ticket a short subject.';
    if (!form.message.trim()) next.message = 'Tell us what happened.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const { id, done } = createTicket(business.id, user.uid, {
      category: form.category,
      subject: form.subject.trim().slice(0, 140),
      message: form.message.trim().slice(0, 2000),
      screenshotUrl: shot.url,
    });
    try {
      await settle(done);
      toast('Ticket sent');
      navigate(`/app/support/${id}`);
    } catch {
      setErrors({ form: 'We could not send your ticket. Check your connection and try again.' });
      setBusy(false);
    }
  }

  const list = tickets.data ?? [];

  return (
    <>
      <BackBar title="Customer support" top />
      <div className="flex flex-col gap-4 px-4 pb-7 pt-1 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:px-0">
        <div className="flex flex-col gap-4">
          <section className="flex gap-3.5 rounded-3xl bg-[linear-gradient(162deg,var(--color-tint),var(--color-tint-soft)_55%,var(--color-card))] p-[18px] shadow-card">
            <span className="grid size-11 flex-none place-items-center rounded-2xl bg-card text-accent-800 shadow-card-sm">
              <Headset size={21} strokeWidth={1.6} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-[23px] font-semibold leading-tight">Send us a ticket</span>
              <span className="text-[13.5px] leading-normal opacity-70">
                No waiting on a chat. Write the problem once — we reply here and in your notifications, usually within
                one working day.
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-3.5 rounded-3xl bg-card p-4 shadow-card">
            <SelectInput label="What is it about?" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectInput>
            <TextInput
              label="Subject"
              placeholder="One line, e.g. Profit not adding up"
              maxLength={140}
              value={form.subject}
              onChange={set('subject')}
              error={errors.subject}
            />
            <Field label="What happened?" error={errors.message}>
              <textarea
                rows={5}
                maxLength={2000}
                value={form.message}
                onChange={set('message')}
                placeholder="Tell us what you did and what you expected to see."
                className="w-full rounded-xl border border-divider bg-card px-3.5 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-ink/40 focus:border-accent"
              />
            </Field>

            {shot.name ? (
              <div className="flex items-center gap-2.5 rounded-full border border-divider px-4 py-2.5 text-sm">
                {shot.uploading ? (
                  <LoaderCircle size={17} strokeWidth={1.6} className="animate-spin text-accent" />
                ) : (
                  <Paperclip size={17} strokeWidth={1.6} className="opacity-60" />
                )}
                <span className="min-w-0 flex-1 truncate">{shot.uploading ? 'Uploading…' : shot.name}</span>
                {!shot.uploading && (
                  <button
                    onClick={() => setShot({ url: null, name: '', uploading: false, error: '' })}
                    aria-label="Remove screenshot"
                    className="grid size-7 place-items-center rounded-full border-0 bg-transparent text-ink/60 hover:bg-tint-soft"
                  >
                    <X size={15} strokeWidth={1.6} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-dashed border-divider bg-transparent text-[15px] font-semibold text-ink"
              >
                <Paperclip size={17} strokeWidth={1.6} /> Attach a screenshot
              </button>
            )}
            {shot.error && <p className="m-0 text-[12.5px] font-medium text-bad">{shot.error}</p>}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickShot} />

            {errors.form && (
              <div role="alert" className="rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad">
                {errors.form}
              </div>
            )}
            <Button block onClick={send} disabled={busy || shot.uploading}>
              {busy ? 'Sending…' : 'Send ticket'}
            </Button>
            <a
              href={SUPPORT_WHATSAPP.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-ink/60 no-underline hover:text-accent-700"
            >
              <MessageCircle size={15} strokeWidth={1.6} />
              Or chat with us on WhatsApp:{' '}
              <span className="font-semibold text-accent-700">{SUPPORT_WHATSAPP.display}</span>
            </a>
          </section>
        </div>

        <section>
          <div className="mb-2.5 flex items-baseline">
            <h2 className="m-0 mr-auto font-heading text-[22px] font-semibold">Your tickets</h2>
            <span className="text-xs opacity-50">{list.length} total</span>
          </div>
          {list.length === 0 ? (
            <p className="m-0 rounded-[20px] bg-card p-4 text-sm opacity-65 shadow-card-sm">No tickets yet.</p>
          ) : (
            <div className="flex flex-col gap-[9px]">
              {list.map((t) => (
                <Link
                  key={t.id}
                  to={`/app/support/${t.id}`}
                  className="lg-tap flex items-center gap-3 rounded-[20px] bg-card p-3.5 text-ink no-underline shadow-card"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex items-center gap-2">
                      <StatusPill status={t.status} />
                      <span className="text-[11.5px] font-semibold opacity-50">{t.ref}</span>
                    </span>
                    <span className="truncate text-[15px] font-semibold">{t.subject}</span>
                    <span className="text-[12px] opacity-55">
                      {t.category} · updated {shortWhen(t.updatedAt)}
                    </span>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.6} className="flex-none opacity-40" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
