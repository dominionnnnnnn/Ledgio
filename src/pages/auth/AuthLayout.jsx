import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { isStandalone } from '../../lib/platform';

/**
 * Shared frame for sign up / log in / forgot / reset.
 *   Phone:   full-screen column, main button pinned low.
 *   Desktop: a centered card.
 * In a browser there's a way back to the landing page; the installed app has no landing page,
 * so it's left out there.
 */
export default function AuthLayout({ title, body, onSubmit, cta, busy, formError, alt, children, afterFields }) {
  const browser = !isStandalone();

  return (
    <div className="flex min-h-dvh flex-col lg:bg-[radial-gradient(ellipse_at_top,var(--color-tint),transparent_60%)]">
      {browser && (
        <header className="mx-auto flex w-full max-w-[480px] items-center px-[22px] pt-[max(14px,env(safe-area-inset-top))] lg:max-w-6xl lg:px-8 lg:pt-6">
          <Link
            to="/"
            className="-ml-2 flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft"
          >
            <ArrowLeft size={17} strokeWidth={1.8} />
            <span className="lg:hidden">Home</span>
            <span className="hidden lg:inline">Back to home</span>
          </Link>
          <Link to="/" aria-label="Ledgio home" className="ml-auto hidden lg:block">
            <Logo height={28} />
          </Link>
        </header>
      )}

      <main
        className={`animate-screen-in mx-auto flex w-full max-w-[480px] flex-1 flex-col px-[22px] pb-[max(26px,env(safe-area-inset-bottom))] ${
          browser ? 'pt-4' : 'pt-[max(20px,env(safe-area-inset-top))]'
        } lg:max-w-none lg:items-center lg:justify-center lg:px-8 lg:py-10`}
      >
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-1 flex-col lg:w-full lg:max-w-[440px] lg:flex-none lg:rounded-[28px] lg:bg-card lg:p-10 lg:shadow-card lg:[&_input]:bg-bg"
        >
          <div className="mb-[22px]">
            <Logo mark height={48} />
          </div>
          <h1 className="m-0 font-heading text-[32px] font-semibold leading-[1.08]">{title}</h1>
          <p className="mb-[22px] mt-2 text-pretty text-[15px] leading-relaxed opacity-70">{body}</p>

          <div className="flex flex-col gap-3.5">{children}</div>
          {afterFields}

          {formError && (
            <div role="alert" className="mt-4 rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad">
              {formError}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-6 lg:mt-2">
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
  );
}