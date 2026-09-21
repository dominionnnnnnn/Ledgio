import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { enablePush, pushOnHere, pushPermission, pushSupported } from '../../lib/push';
import { useToast } from '../Toast';
import Button from '../Button';

const DISMISSED = 'ledgio:pushAsked';

/**
 * Offered on the home screen once there's at least one record — never on first open, because
 * the browser only asks once and a "no" then is permanent. "Not now" hides it for 30 days.
 */
export default function PushPrompt({ show }) {
  const { business, user } = useAuth();
  const toast = useToast();
  const [supported, setSupported] = useState(false);
  const [hidden, setHidden] = useState(() => {
    const until = Number(localStorage.getItem(DISMISSED) ?? 0);
    return until > Date.now();
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    pushSupported().then(setSupported);
  }, []);

  if (!show || hidden || !supported || pushOnHere() || pushPermission() !== 'default') return null;

  function later() {
    localStorage.setItem(DISMISSED, String(Date.now() + 30 * 86400000));
    setHidden(true);
  }

  async function turnOn() {
    setBusy(true);
    const result = await enablePush(business.id, user.uid);
    setBusy(false);
    localStorage.setItem(DISMISSED, String(Date.now() + 30 * 86400000));
    setHidden(true);
    toast(result === 'on' ? 'Phone notifications are on' : 'Notifications stayed off. You can turn them on later.');
  }

  return (
    <section className="flex gap-3.5 rounded-[20px] bg-card p-4 shadow-card">
      <span className="grid size-10 flex-none place-items-center rounded-[14px] bg-tint text-accent-800">
        <Bell size={19} strokeWidth={1.7} />
      </span>
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[15.5px] font-semibold">Get a nudge when a day goes unrecorded</span>
          <span className="text-[13px] leading-snug opacity-65">
            Ledgio can tell you on this phone, and when support replies to you.
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={turnOn} disabled={busy}>
            {busy ? 'Please wait…' : 'Turn on'}
          </Button>
          <Button variant="ghost" size="sm" onClick={later}>
            Not now
          </Button>
        </div>
      </div>
      <button onClick={later} aria-label="Dismiss" className="grid size-8 flex-none place-items-center self-start rounded-full border-0 bg-transparent text-ink/45 hover:bg-tint-soft">
        <X size={16} strokeWidth={1.7} />
      </button>
    </section>
  );
}
