import { CircleAlert } from 'lucide-react';
import Button from './Button';
import { SUPPORT_WHATSAPP } from '../lib/config';

/** Full-screen error with a retry (design: Error). */
export default function ErrorScreen({
  title = 'We could not load your records',
  body = 'Your records are safe on this phone. Check your connection and try again.',
  onRetry = () => window.location.reload(),
  onContact,
}) {
  return (
    <div className="animate-screen-in mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-3 px-7 py-9 text-center">
      <div className="animate-pop grid size-[86px] place-items-center rounded-full bg-bad-soft text-bad">
        <CircleAlert size={40} strokeWidth={1.5} />
      </div>
      <h1 className="font-heading text-[27px] font-semibold leading-tight">{title}</h1>
      <p className="m-0 max-w-[270px] text-[14.5px] leading-relaxed opacity-70">{body}</p>
      <Button size="md" className="mt-1.5" onClick={onRetry}>
        Try again
      </Button>
      {onContact ? (
        <Button variant="ghost" size="sm" onClick={onContact}>
          Contact support
        </Button>
      ) : (
        <a
          href={SUPPORT_WHATSAPP.link}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-4 py-2 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft"
        >
          Contact support on WhatsApp
        </a>
      )}
    </div>
  );
}
