import { useEffect } from 'react';
import { X } from 'lucide-react';

/** Centered dialog (desktop). Closes on backdrop click or Escape. */
export default function Modal({ title, onClose, children, width = 'max-w-3xl' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0f1319]/50 p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`animate-screen-in w-full ${width} overflow-hidden rounded-[28px] bg-bg shadow-[0_30px_80px_rgba(15,19,25,.35)]`}
      >
        <div className="flex items-center border-b border-divider px-6 py-4">
          <h2 className="m-0 mr-auto font-heading text-[24px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-[14px] border-0 bg-rail text-ink hover:bg-tint"
          >
            <X size={19} strokeWidth={1.6} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
