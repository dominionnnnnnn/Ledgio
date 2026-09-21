import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { disablePush, enablePush, pushOnHere, pushPermission, pushSupported } from '../../lib/push';
import { useToast } from '../Toast';

/**
 * Switch for phone notifications, per device. The browser only ever asks once:
 * if someone says no, the switch explains how to undo it in browser settings.
 */
export default function PushToggle() {
  const { business, user } = useAuth();
  const toast = useToast();
  const [supported, setSupported] = useState(null);
  const [on, setOn] = useState(pushOnHere);
  const [busy, setBusy] = useState(false);
  const denied = pushPermission() === 'denied';

  useEffect(() => {
    pushSupported().then(setSupported);
  }, []);

  if (supported === null) return null;
  if (!supported) {
    return (
      <p className="m-0 rounded-[18px] bg-card px-4 py-3 text-[13px] opacity-65 shadow-card-sm">
        This browser can’t show phone notifications. On iPhone, add Ledgio to your home screen first.
      </p>
    );
  }

  async function toggle() {
    setBusy(true);
    if (on) {
      await disablePush(business.id);
      setOn(false);
      toast('Phone notifications turned off on this device');
    } else {
      const result = await enablePush(business.id, user.uid);
      setOn(result === 'on');
      toast(
        result === 'on'
          ? 'Phone notifications are on'
          : result === 'denied'
            ? 'Your browser blocked notifications'
            : 'Could not turn them on. Try again.',
      );
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3.5 rounded-[18px] bg-card p-4 shadow-card-sm">
      <span className={`grid size-10 flex-none place-items-center rounded-[14px] ${on ? 'bg-tint text-accent-800' : 'bg-rail text-ink/55'}`}>
        {on ? <Bell size={19} strokeWidth={1.7} /> : <BellOff size={19} strokeWidth={1.7} />}
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">Notifications on this phone</span>
        <span className="text-[12.5px] leading-snug opacity-60">
          {denied && !on
            ? 'Blocked in your browser settings — allow notifications for this site, then come back.'
            : on
              ? 'You’ll be told about replies and weekly alerts.'
              : 'Get support replies and weekly alerts even when Ledgio is closed.'}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Notifications on this phone"
        onClick={toggle}
        disabled={busy || (denied && !on)}
        className={`relative h-[30px] w-[52px] flex-none rounded-full border-0 transition-colors disabled:opacity-45 ${on ? 'bg-accent' : 'bg-rail'}`}
      >
        <i className={`absolute top-[3px] size-6 rounded-full bg-card shadow-card-sm transition-[left] ${on ? 'left-[25px]' : 'left-[3px]'}`} />
      </button>
    </div>
  );
}
