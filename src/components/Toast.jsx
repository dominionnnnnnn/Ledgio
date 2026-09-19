import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CircleCheck } from 'lucide-react';

const ToastContext = createContext(() => {});

/** Small bottom toast ("Record saved"). Call const toast = useToast(); toast('Saved'). */
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const timer = useRef();
  const show = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 2600);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && (
        <div
          role="status"
          className="animate-screen-in fixed inset-x-4 bottom-[max(24px,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-sm items-center gap-2.5 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-bg shadow-card"
        >
          <CircleCheck size={18} strokeWidth={1.6} className="flex-none text-ok" />
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
