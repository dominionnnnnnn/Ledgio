import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/** Mobile-width page column used by every full-screen flow (auth, setup). */
export function Screen({ children, className = '' }) {
  return (
    <main
      className={`animate-screen-in mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-[22px] pb-[max(26px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] ${className}`}
    >
      {children}
    </main>
  );
}

/** Round back button + title, as on the app's inner screens. */
export function BackHeader({ title, to }) {
  const navigate = useNavigate();
  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        onClick={() => (to ? navigate(to) : navigate(-1))}
        aria-label="Back"
        className="grid size-10 place-items-center rounded-xl border-0 bg-rail text-ink hover:bg-tint"
      >
        <ChevronLeft size={20} strokeWidth={1.6} />
      </button>
      <h1 className="m-0 font-heading text-[26px] font-semibold">{title}</h1>
    </div>
  );
}
