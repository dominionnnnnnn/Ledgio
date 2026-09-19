import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChartColumn,
  Download,
  Menu,
  Moon,
  MessageCircle,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import Logo from '../components/Logo';
import { setThemePref } from '../lib/theme';
import PhoneMock, { SummaryMock } from './landing/PhoneMock';
import { SITE_HOST, SUPPORT_WHATSAPP } from '../lib/config';
import { isIOS, useInstallPrompt } from '../lib/installPrompt';

const STEPS = [
  {
    no: '01',
    title: 'Add your workers',
    body: 'Name, phone, role. Two minutes, once. Every record after that is credited to one of them.',
  },
  {
    no: '02',
    title: 'Record the day’s work',
    body: 'One short form per piece of work — revenue and expenses. It works offline, so the yard is fine.',
  },
  {
    no: '03',
    title: 'See your profit',
    body: 'Today, this week, this month. For the whole business and for each worker, worked out for you.',
  },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Worker tracking',
    body: 'Records and profit per worker, with a weekly trend so you can see who is carrying the business.',
  },
  {
    icon: TrendingUp,
    title: 'Automatic profit',
    body: 'Revenue minus every expense you entered. No calculator, and a loss is flagged clearly.',
  },
  {
    icon: ChartColumn,
    title: 'Simple reports',
    body: 'Pick a day, a week, a month or your own dates. One clear chart, one clear table — then close it.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Your own fields',
    body: 'Choose what each record asks for — destination, customer, quantity, notes — and the form builds itself.',
  },
];

const NAV = [
  ['#how', 'How it works'],
  ['#features', 'Features'],
  ['#install', 'Install'],
];

const cta =
  'lg-tap inline-flex items-center justify-center gap-2.5 rounded-full bg-accent font-heading font-semibold text-on-accent no-underline shadow-[0_8px_22px_color-mix(in_srgb,var(--color-accent)_38%,transparent)] hover:bg-accent-600';
const ghost =
  'lg-tap inline-flex items-center justify-center gap-2 rounded-full border border-divider bg-card font-heading font-semibold text-ink no-underline shadow-card-sm hover:bg-tint-soft';

function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="mb-7 flex flex-col gap-2 lg:mb-10">
      {kicker && <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-accent-700">{kicker}</span>}
      <h2 className="m-0 text-balance font-heading text-[34px] font-semibold leading-[1.02] lg:text-[52px]">{title}</h2>
      {sub && <p className="m-0 text-[15.5px] opacity-65 lg:text-lg">{sub}</p>}
    </div>
  );
}

function InstallCard() {
  const { canInstall, install } = useInstallPrompt();
  const host = SITE_HOST;
  const steps = isIOS()
    ? [
        `Open ${host} in Safari.`,
        'Tap the Share button, then “Add to Home Screen”.',
        'Open Ledgio from your home screen like any app.',
      ]
    : [
        `Open ${host} in your phone’s browser.`,
        'Tap the browser menu, then “Add to Home screen” or “Install app”.',
        'Open Ledgio from your home screen like any app.',
      ];
  return (
    <section
      id="install"
      className="scroll-mt-24 rounded-[28px] bg-[#1e2a38] p-6 text-[#e9eef3] shadow-card lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:p-12"
    >
      <div className="flex flex-col gap-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#94bce3]">Install the app</span>
        <h2 className="m-0 text-balance font-heading text-[32px] font-semibold leading-[1.02] lg:text-[48px]">
          Put Ledgio on your home screen
        </h2>
        <p className="m-0 max-w-md text-[15px] leading-relaxed opacity-75">
          No app store, no download. Add it to your phone’s home screen and it opens like any other app — and keeps
          working when the network drops.
        </p>
        <div className="mt-2 hidden flex-wrap gap-3 lg:flex">
          {canInstall ? (
            <button onClick={install} className={`${cta} h-12 border-0 px-6 text-base`}>
              <Download size={18} strokeWidth={1.8} /> Install Ledgio
            </button>
          ) : null}
          <Link
            to="/signup"
            className="lg-tap inline-flex h-12 items-center rounded-full bg-white px-6 font-heading text-base font-semibold text-[#1e2a38] no-underline"
          >
            Start free
          </Link>
        </div>
      </div>
      <ol className="m-0 mt-6 flex list-none flex-col gap-2.5 p-0 lg:mt-0">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 rounded-2xl bg-white/[.07] px-4 py-3.5 text-[14.5px]">
            <span className="grid size-7 flex-none place-items-center rounded-full bg-white/15 text-[13px] font-semibold">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-col gap-2.5 lg:hidden">
        {canInstall && (
          <button onClick={install} className={`${cta} h-[52px] border-0 text-[17px]`}>
            <Download size={18} strokeWidth={1.8} /> Install Ledgio
          </button>
        )}
        <Link
          to="/signup"
          className="lg-tap flex h-[52px] items-center justify-center rounded-full bg-white font-heading text-[17px] font-semibold text-[#1e2a38] no-underline"
        >
          Start free
        </Link>
      </div>
    </section>
  );
}

/** Light / dark switch for the landing page (same setting the app uses). */
function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  useEffect(() => {
    // Keep the icon right if the setting changes elsewhere (e.g. the phone switches to dark).
    const obs = new MutationObserver(() => setDark(document.documentElement.dataset.theme === 'dark'));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return (
    <button
      onClick={() => {
        setThemePref(dark ? 'light' : 'dark');
      }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="grid size-10 flex-none place-items-center rounded-[14px] border-0 bg-rail text-ink hover:bg-tint"
    >
      {dark ? <Sun size={18} strokeWidth={1.7} /> : <Moon size={18} strokeWidth={1.7} />}
    </button>
  );
}

/** Public marketing page shown to browser visitors (Landing v2). */
export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-dvh overflow-x-hidden">
      {/* Header */}
      <header
        className={`sticky top-0 z-30 transition-colors ${scrolled ? 'border-b border-divider bg-bg/90 backdrop-blur' : 'border-b border-transparent'}`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5 lg:px-8">
          <Link to="/" className="mr-auto flex items-center gap-2.5 text-ink no-underline">
            <Logo height={30} />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3.5 py-2 text-[14.5px] font-medium text-ink/75 no-underline hover:bg-tint-soft hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <div className="hidden gap-2.5 lg:flex">
            <Link to="/login" className={`${ghost} h-10 px-5 text-[15px]`}>
              Log in
            </Link>
            <Link to="/signup" className={`${cta} h-10 px-5 text-[15px]`}>
              Sign up free
            </Link>
          </div>
          <button
            onClick={() => setMenu((m) => !m)}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            className="grid size-10 place-items-center rounded-[14px] border-0 bg-rail text-ink lg:hidden"
          >
            {menu ? <X size={19} strokeWidth={1.6} /> : <Menu size={19} strokeWidth={1.6} />}
          </button>
        </div>
        {menu && (
          <div className="animate-screen-in border-t border-divider bg-bg px-5 pb-5 pt-2 lg:hidden">
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="block rounded-xl px-2 py-3 text-base font-medium text-ink no-underline"
              >
                {label}
              </a>
            ))}
            <div className="mt-3 flex gap-2.5">
              <Link to="/login" className={`${ghost} h-12 flex-1 text-base`}>
                Log in
              </Link>
              <Link to="/signup" className={`${cta} h-12 flex-1 text-base`}>
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-5 pb-16 pt-6 lg:gap-28 lg:px-8 lg:pt-12">
        {/* Hero */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-5 lg:gap-7">
            <span className="flex items-center gap-1.5 self-start rounded-full bg-tint px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[.1em] text-accent-800">
              <Sparkles size={13} strokeWidth={1.7} /> For small Nigerian businesses
            </span>
            <h1 className="m-0 text-balance font-heading text-[43px] font-semibold leading-none tracking-[-.02em] lg:text-[76px] lg:leading-[.98]">
              Know how your business is doing, every day
            </h1>
            <p className="m-0 max-w-[520px] text-pretty text-base leading-relaxed opacity-70 lg:text-[19px]">
              <span className="lg:hidden">
                The notebook you already keep — only it adds up. Revenue, expenses and profit, for the business and
                every worker.
              </span>
              <span className="hidden lg:inline">
                Ledgio is the notebook you already keep — only it adds up. Write down each day’s work, and see revenue,
                expenses and profit for the business and for every worker.
              </span>
            </p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <Link to="/signup" className={`${cta} h-14 px-7 text-lg lg:h-[60px] lg:text-[19px]`}>
                Sign up free <ArrowRight size={19} strokeWidth={1.8} className="hidden lg:block" />
              </Link>
              <Link to="/login" className={`${ghost} h-14 px-7 text-lg lg:h-[60px] lg:text-[19px]`}>
                Log in
              </Link>
            </div>
            <div className="hidden gap-3 lg:flex">
              <div className="flex items-center gap-2.5 rounded-2xl bg-card px-3.5 py-2.5 shadow-card-sm">
                <span className="lg-num grid size-8 place-items-center rounded-full bg-tint text-sm text-accent-800">
                  ₦0
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Free plan</span>
                  <span className="text-[11.5px] opacity-55">no card needed</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-card px-3.5 py-2.5 shadow-card-sm">
                <span className="grid size-8 place-items-center rounded-full bg-tint text-accent-800">
                  <WifiOff size={15} strokeWidth={1.7} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Offline</span>
                  <span className="text-[11.5px] opacity-55">works with no network</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <PhoneMock />
          </div>
          <div className="lg:hidden">
            <SummaryMock compact />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-24">
          <SectionTitle title="How it works" sub="Three steps. Nothing to learn." />
          <div className="grid gap-3 lg:grid-cols-3 lg:gap-5">
            {STEPS.map((s) => (
              <div key={s.no} className="flex gap-3.5 rounded-3xl bg-card p-4 shadow-card lg:flex-col lg:gap-4 lg:p-7">
                <span className="lg-num grid size-10 flex-none place-items-center rounded-full bg-tint text-base text-accent-800 lg:size-12 lg:text-lg">
                  {s.no}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="m-0 font-heading text-xl font-semibold lg:text-[26px]">{s.title}</h3>
                  <p className="m-0 text-[14px] leading-relaxed opacity-65 lg:text-[15px]">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12">
          <SectionTitle
            title={
              <>
                <span className="lg:hidden">What you get</span>
                <span className="hidden lg:inline">Built for the way you already work</span>
              </>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:gap-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3.5 rounded-3xl bg-card p-4 shadow-card lg:p-6">
                <span className="grid size-10 flex-none place-items-center rounded-full bg-tint text-accent-800">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="m-0 font-heading text-xl font-semibold lg:text-[23px]">{title}</h3>
                  <p className="m-0 text-[14px] leading-relaxed opacity-65 lg:text-[15px]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <InstallCard />
      </main>

      {/* Footer */}
      <footer className="border-t border-divider">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div className="flex flex-col gap-2.5">
            <Logo height={28} />
            <p className="m-0 max-w-xs text-[13.5px] leading-relaxed opacity-60">
              The modern record book for small businesses. Made in Lagos.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[14px]">
            <span className="text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-45">Product</span>
            <a href="#how" className="text-ink/75 no-underline hover:text-ink">
              How it works
            </a>
            <a href="#features" className="text-ink/75 no-underline hover:text-ink">
              Features
            </a>
            <a href="#install" className="text-ink/75 no-underline hover:text-ink">
              Install guide
            </a>
          </div>
          <div className="flex flex-col gap-2 text-[14px]">
            <span className="text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-45">Support</span>
            <a
              href={SUPPORT_WHATSAPP.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-ink/75 no-underline hover:text-ink"
            >
              <MessageCircle size={14} strokeWidth={1.7} /> WhatsApp us
            </a>
            <Link to="/login" className="text-ink/75 no-underline hover:text-ink">
              Log in
            </Link>
            <Link to="/signup" className="text-ink/75 no-underline hover:text-ink">
              Create an account
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-8 text-xs opacity-50 lg:px-8">
          © {new Date().getFullYear()} Ledgio. Made in Lagos.
        </div>
      </footer>
    </div>
  );
}