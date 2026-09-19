import { useEffect } from 'react';

/** Bottom sheet over a dimmed backdrop. Closes on backdrop tap or Escape. */
export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#0f1319]/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-screen-in max-h-[85dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-bg px-4 pb-[max(22px,env(safe-area-inset-bottom))] pt-3.5"
      >
        <div className="mx-auto mb-3.5 h-[5px] w-11 rounded-full bg-rail" />
        {title && <h2 className="m-0 mb-3 font-heading text-[22px] font-semibold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
