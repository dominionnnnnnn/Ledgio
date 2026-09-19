import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageIcon, WifiOff } from 'lucide-react';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { isStandalone } from '../../lib/platform';

/** Right/left photo panel copy. Photos live in public/images (see README → Auth images). */
export const PANELS = {
  login: {
    image: '/images/auth-login.webp',
    title: 'Every sale, every naira, in one place',
    body: 'Write down each day’s work and Ledgio works out the profit — for the business and for every worker. Records save on the device and sync when you are back online.',
  },
  signup: {
    image: '/images/auth-signup.webp',
    title: 'Start your record book today',
    body: 'Add your workers, write down each day’s work, and Ledgio works out the profit for you — on your phone at work or here on the computer.',
  },
};

function Facts() {
  const items = [
    ['₦0', 'to start'],
    ['3', 'workers free'],
    ['50', 'records a month'],
  ];
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white/[.08] p-6">
      <div className="flex gap-8">
        {items.map(([big, small]) => (
          <div key={small} className="flex flex-col">
            <span className="lg-num text-[30px] font-semibold leading-none">{big}</span>
            <span className="mt-1 text-[12.5px] opacity-60">{small}</span>
          </div>
        ))}
      </div>
      <p className="m-0 flex items-center gap-2 text-[14px] opacity-80">
        <WifiOff size={16} strokeWidth={1.7} className="flex-none" />
        Works with no network — everything syncs when you are back online.
      </p>
    </div>
  );
}

/** Dark photo panel (desktop only). Falls back to a plain panel if the photo is missing. */
function Panel({ panel, side }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <aside
      key={side}
      className={`hidden h-dvh min-h-0 overflow-hidden bg-[#1e2a38] text-[#e9eef3] lg:flex lg:flex-col ${
        side === 'left'
          ? 'lg:order-first animate-[lg-panel-l_.45s_cubic-bezier(.4,0,.2,1)_both]'
          : 'animate-[lg-panel-r_.45s_cubic-bezier(.4,0,.2,1)_both]'
      } [--lg-logo-blue:#3d84ff] [--lg-logo-ink:#e9eef3]`}
    >
      <div className="relative min-h-0 flex-1">
        {imgOk ? (
          <img
            src={panel.image}
            alt=""
            onError={() => setImgOk(false)}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <ImageIcon size={32} strokeWidth={1.2} className="opacity-25" />
          </div>
        )}
        {/* Fade the photo into the panel so the text below stays readable. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,42,56,.55)_0%,rgba(30,42,56,0)_30%,rgba(30,42,56,0)_55%,#1e2a38_100%)]" />
        <div className="absolute left-12 top-10">
          <Logo height={30} />
        </div>
      </div>
      <div className="flex flex-none flex-col gap-4 px-12 pb-12 pt-2 [@media(max-height:760px)]:gap-3 [@media(max-height:760px)]:pb-8">
        <h2 className="m-0 max-w-[560px] text-balance font-heading text-[clamp(34px,5.4vh,52px)] font-semibold leading-[1.02]">
          {panel.title}
        </h2>
        <p className="m-0 max-w-[520px] text-[16px] leading-relaxed opacity-75">{panel.body}</p>
        <Facts />
      </div>
    </aside>
  );
}

/**
 * Shared frame for sign up / log in / forgot / reset.
 *   Phone:   full-screen column, main button pinned low.
 *   Desktop: split screen — the form on one side, a dark photo panel on the other
 *            (log in: panel right; sign up: panel left, sliding across).
 * In a browser the logo links back to the landing page; the installed app has no landing page.
 */
export default function AuthLayout({
  title,
  body,
  onSubmit,
  cta,
  busy,
  formError,
  alt,
  children,
  afterFields,
  panel = PANELS.login,
  side = 'right',
}) {
  const browser = !isStandalone();
  const brand = (
    <>
      <span className="lg:hidden">
        <Logo mark height={48} />
      </span>
      <span className="hidden lg:block">
        <Logo height={34} />
      </span>
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:min-h-0 lg:overflow-hidden">
        <main className="animate-screen-in mx-auto flex w-full max-w-[480px] flex-1 flex-col px-[22px] pb-[max(26px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] lg:max-w-none lg:items-center lg:justify-center lg:px-10 lg:py-8">
          <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col lg:w-full lg:max-w-[420px] lg:flex-none">
            <div className="mb-[22px] lg:mb-9 [@media(max-height:760px)]:lg:mb-6">
              {/* In a browser the logo goes back to the landing page; the installed app has none. */}
              {browser ? (
                <Link to="/" aria-label="Back to the Ledgio home page" className="inline-block rounded-lg">
                  {brand}
                </Link>
              ) : (
                brand
              )}
            </div>
            <h1 className="m-0 font-heading text-[32px] font-semibold leading-[1.08] lg:text-[clamp(36px,5.2vh,46px)] lg:leading-[1.02]">
              {title}
            </h1>
            <p className="mb-[22px] mt-2 text-pretty text-[15px] leading-relaxed opacity-70 lg:mb-7 lg:text-base">
              {body}
            </p>

            <div className="flex flex-col gap-3.5">{children}</div>
            {afterFields}

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad"
              >
                {formError}
              </div>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-6 lg:mt-1">
              {cta && (
                <Button type="submit" block disabled={busy}>
                  {busy ? 'Please wait…' : cta}
                </Button>
              )}
              {alt}
            </div>
          </form>
        </main>
      </div>

      <Panel panel={panel} side={side} />
    </div>
  );
}