import { WifiOff } from 'lucide-react';
import { useOnline } from '../hooks/useOnline';

/** Shown app-wide while the device is offline. Writes keep working and sync later. */
export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-3 top-[max(8px,env(safe-area-inset-top))] z-50 mx-auto flex max-w-[456px] items-center gap-2.5 rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-bad shadow-card-sm"
    >
      <WifiOff size={17} strokeWidth={1.6} className="flex-none" />
      You're offline. New records are saved on this phone and will sync when you reconnect.
    </div>
  );
}
