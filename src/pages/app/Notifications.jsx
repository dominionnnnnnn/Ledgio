import { useMemo, useState } from 'react';
import { Send, Smartphone } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuth';
import { sendBroadcast, sendPush, useBroadcasts, useBusinesses, usePushDeviceCounts, useUsers } from '../lib/data';
import { isPremium, shortDate } from '../lib/config';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { Field, SelectInput, TextInput } from '../components/Field';
import { useToast } from '../components/Toast';

const LINKS = [
  ['', 'Open the home screen'],
  ['/app/records', 'Open records'],
  ['/app/reports', 'Open reports'],
  ['/app/support', 'Open support'],
];

const WEEK = 7 * 86400000;

/** Phone preview of the notification, as it appears in the app's list. */
function Preview({ title, body }) {
  const now = new Date();
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-[.12em] opacity-45">Preview on phone</span>
      <div className="w-[260px] rounded-[38px] bg-[#0f1319] p-2.5 shadow-card">
        <div className="flex flex-col items-center gap-5 rounded-[30px] bg-[#1e2a38] px-4 py-7 text-[#e9eef3]">
          <div className="text-center">
            <div className="lg-num text-[44px] font-semibold leading-none">
              {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div className="mt-1 text-[12px] opacity-65">
              {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div className="w-full rounded-[18px] bg-white/10 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-md bg-white/15">
                <Logo mark height={11} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[.1em] opacity-70">Ledgio</span>
              <span className="ml-auto text-[10px] opacity-50">now</span>
            </div>
            <div className="text-[13px] font-semibold leading-snug">{title || 'Your notification title'}</div>
            <div className="mt-1 text-[12px] leading-snug opacity-75">
              {body || 'The message you type appears here, exactly as it lands in the app.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { user } = useAdminAuth();
  const toast = useToast();
  const businesses = useBusinesses();
  const users = useUsers();
  const broadcasts = useBroadcasts();
  const devices = usePushDeviceCounts();

  const [audience, setAudience] = useState('everyone');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [testId, setTestId] = useState('');
  const [alsoPush, setAlsoPush] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const all = businesses.data ?? [];
  const groups = useMemo(() => {
    const quiet = all.filter((b) => {
      const last = users.byId[b.ownerId]?.lastActiveAt?.toDate?.()?.getTime();
      return last !== undefined && last < Date.now() - WEEK;
    });
    return {
      everyone: { label: 'Everyone', list: all },
      free: { label: 'Free plan', list: all.filter((b) => !isPremium(b)) },
      premium: { label: 'Premium', list: all.filter(isPremium) },
      quiet: { label: 'Inactive 7 days', list: quiet },
    };
  }, [all, users.byId]);

  const target = groups[audience].list;
  const phonesOn = (list) => list.reduce((n, b) => n + (devices[b.id] ?? 0), 0);

  async function send(only) {
    const next = {};
    if (!title.trim()) next.title = 'Give it a short title.';
    if (!body.trim()) next.body = 'Write the message.';
    if (only && !testId) next.test = 'Choose an account to test with.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const list = only ? all.filter((b) => b.id === testId) : target;
    if (!list.length) return toast('Nobody in that audience yet');

    setBusy(true);
    try {
      await sendBroadcast({
        businesses: list,
        title: title.trim().slice(0, 80),
        body: body.trim().slice(0, 300),
        link,
        audience: only ? 'test' : groups[audience].label,
        admin: user,
      });
      toast(only ? 'Test sent' : `Sent to ${list.length} ${list.length === 1 ? 'account' : 'accounts'}`);

      if (alsoPush) {
        try {
          const push = await sendPush({
            businessIds: list.map((b) => b.id),
            title: title.trim().slice(0, 80),
            body: body.trim().slice(0, 300),
            link,
          });
          toast(
            push.sent
              ? `Also sent to ${push.sent} phone${push.sent === 1 ? '' : 's'}`
              : 'No phones have notifications on yet',
          );
        } catch (err) {
          // The in-app notification already went out; only the phone part failed.
          toast(`In-app sent, phones failed: ${err.message}`);
        }
      }
      if (!only) {
        setTitle('');
        setBody('');
      }
    } catch (err) {
      toast(`Could not send: ${err.code ?? 'try again'}`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
        <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-card">
          <h2 className="m-0 font-heading text-[22px] font-semibold">New notification</h2>

          <Field label="Who gets it">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {Object.entries(groups).map(([key, g]) => {
                const on = key === audience;
                return (
                  <button
                    key={key}
                    onClick={() => setAudience(key)}
                    aria-pressed={on}
                    className={`flex flex-col items-start gap-0.5 rounded-[18px] border px-3.5 py-3 text-left ${
                      on ? 'border-accent bg-tint' : 'border-divider bg-card'
                    }`}
                  >
                    <span className="text-[13.5px] font-semibold">{g.label}</span>
                    <span className="text-[11.5px] opacity-55">
                      {g.list.length} {g.list.length === 1 ? 'account' : 'accounts'}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <TextInput
            label="Title"
            maxLength={80}
            placeholder="Short and plain, e.g. Reports just got faster"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />
          <Field label="Message" error={errors.body} hint={`${body.length} characters · keep it under about 300`}>
            <textarea
              rows={4}
              maxLength={300}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="One or two sentences. Say what changed and what to do next."
              className="w-full rounded-xl border border-divider bg-bg px-3.5 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-ink/40 focus:border-accent"
            />
          </Field>
          <SelectInput label="When they tap it" value={link} onChange={(e) => setLink(e.target.value)}>
            {LINKS.map(([value, label]) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>

          <label className="flex cursor-pointer items-center gap-3 rounded-[18px] bg-bg p-3.5">
            <span className="grid size-9 flex-none place-items-center rounded-xl bg-tint text-accent-800">
              <Smartphone size={18} strokeWidth={1.7} />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-[14px] font-semibold">Also send to phones</span>
              <span className="text-[12px] opacity-60">
                {phonesOn(target)} device{phonesOn(target) === 1 ? '' : 's'} in this audience have notifications on
              </span>
            </span>
            <input
              type="checkbox"
              checked={alsoPush}
              onChange={(e) => setAlsoPush(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={`relative h-[30px] w-[52px] flex-none rounded-full transition-colors ${alsoPush ? 'bg-accent' : 'bg-rail'}`}
            >
              <i
                className={`absolute top-[3px] size-6 rounded-full bg-card shadow-card-sm transition-[left] ${alsoPush ? 'left-[25px]' : 'left-[3px]'}`}
              />
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="md" onClick={() => send(false)} disabled={busy || target.length === 0}>
              <Send size={16} strokeWidth={1.8} /> Send to {target.length}{' '}
              {target.length === 1 ? 'account' : 'accounts'}
            </Button>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="min-h-[46px] rounded-full border border-divider bg-card px-3.5 text-[14px] text-ink outline-none"
            >
              <option value="">Test on…</option>
              {all.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Button variant="secondary" size="md" onClick={() => send(true)} disabled={busy}>
              Send test
            </Button>
          </div>
          {errors.test && <p className="m-0 text-[12.5px] font-medium text-bad">{errors.test}</p>}
          <p className="m-0 text-[12px] leading-relaxed opacity-55">
            Always lands in the app’s notifications list. With “Also send to phones” on, devices that agreed to
            notifications get a pop-up too (needs the send function deployed on Vercel).
          </p>
        </section>

        <div className="rounded-3xl bg-card p-5 shadow-card">
          <Preview title={title} body={body} />
        </div>
      </div>

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <h2 className="m-0 mb-2 font-heading text-[22px] font-semibold">Recently sent</h2>
        {(broadcasts.data ?? []).length === 0 ? (
          <p className="m-0 py-4 text-sm opacity-60">{broadcasts.loading ? 'Loading…' : 'Nothing sent yet.'}</p>
        ) : (
          <>
            <table className="hidden w-full border-collapse text-sm lg:table">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[.1em] opacity-50">
                  <th className="py-2 font-semibold">Title</th>
                  <th className="py-2 font-semibold">Audience</th>
                  <th className="py-2 text-right font-semibold">Sent</th>
                  <th className="py-2 text-right font-semibold">Opened</th>
                  <th className="py-2 text-right font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.data.map((b) => (
                  <tr key={b.id} className="border-t border-divider">
                    <td className="py-2.5 font-semibold">{b.title}</td>
                    <td className="py-2.5 opacity-70">{b.audience}</td>
                    <td className="lg-num py-2.5 text-right">{b.sentTo}</td>
                    <td className="lg-num py-2.5 text-right text-ok">{b.opened ?? 0}</td>
                    <td className="py-2.5 text-right opacity-70">{shortDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col lg:hidden">
              {broadcasts.data.map((b) => (
                <div key={b.id} className="flex flex-col gap-1 border-t border-divider py-3 first:border-t-0">
                  <span className="text-[15px] font-semibold">{b.title}</span>
                  <span className="text-[12px] opacity-60">
                    {b.audience} · {b.sentTo} sent · {b.opened ?? 0} opened · {shortDate(b.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
