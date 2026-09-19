import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1024px)';

/** True on desktop-width screens (Tailwind's `lg`). */
export function useDesktop() {
  const [on, setOn] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setOn(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return on;
}
