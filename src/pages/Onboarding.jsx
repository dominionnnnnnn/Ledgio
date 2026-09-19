import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { markOnboardingSeen } from '../lib/platform';

const SLIDES = [
  {
    title: 'Record your business activity in seconds',
    body: 'One short form for each day’s work. No calculator, no notebook.',
    cta: 'Next',
  },
  {
    title: "Track every worker's performance",
    body: 'See what each worker brought in and what they spent.',
    cta: 'Next',
  },
  {
    title: 'See your profit automatically',
    body: 'Revenue minus expenses, worked out for you every day.',
    cta: 'Get started',
  },
];

// The little "record card" illustration: bar widths from the design.
const ART = [
  { w: '58%', cls: 'h-3.5 bg-accent' },
  { w: '100%', cls: 'h-2.5 bg-ink/15' },
  { w: '76%', cls: 'h-2.5 bg-ink/15' },
  { w: '100%', cls: 'h-2.5 bg-ok' },
  { w: '44%', cls: 'h-2.5 bg-ink/15' },
];

/** First launch of the installed app only. */
export default function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const finish = (to) => {
    markOnboardingSeen();
    navigate(to, { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-[22px] pb-[max(26px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))]">
      <div className="mb-3.5 flex items-center">
        <span className="mr-auto">
          <Logo height={22} />
        </span>
        <Button variant="ghost" size="sm" onClick={() => finish('/signup')}>
          Skip
        </Button>
      </div>

      <div key={i} className="animate-screen-in">
        <div className="mb-[26px] grid h-[250px] place-items-center rounded-[26px] bg-gradient-to-b from-tint to-tint-soft">
          <div className="flex w-[170px] flex-col gap-2.5 rounded-[20px] bg-card p-[18px] shadow-card">
            {ART.map((bar, n) => (
              <i key={n} className={`block rounded-full ${bar.cls}`} style={{ width: bar.w }} />
            ))}
          </div>
        </div>
        <h1 className="text-pretty font-heading text-[34px] font-semibold leading-[1.06]">{slide.title}</h1>
        <p className="mt-2.5 text-pretty text-[15.5px] leading-relaxed opacity-70">{slide.body}</p>
      </div>

      <div className="mt-auto flex flex-col gap-4 pt-8">
        <div className="flex justify-center gap-[7px]" aria-label={`Slide ${i + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, n) => (
            <button
              key={n}
              aria-label={`Go to slide ${n + 1}`}
              onClick={() => setI(n)}
              className={`block h-2 rounded-full border-0 p-0 transition-[width] duration-250 ${
                n === i ? 'w-6 bg-accent' : 'w-2 bg-rail'
              }`}
            />
          ))}
        </div>
        <Button block onClick={() => (last ? finish('/signup') : setI(i + 1))}>
          {slide.cta}
        </Button>
        {last && (
          <Button variant="ghost" size="sm" className="self-center" onClick={() => finish('/login')}>
            I already have an account
          </Button>
        )}
      </div>
    </main>
  );
}