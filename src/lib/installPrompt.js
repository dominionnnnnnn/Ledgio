import { useEffect, useState } from 'react';

// Chrome/Edge/Android fire `beforeinstallprompt` once, early. Catch it here so a button can
// show the real "Install app" dialog later. Safari/iOS never fires it: people use Share → Add to Home Screen.
let deferred = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach((fn) => fn(true));
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((fn) => fn(false));
  });
}

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** { canInstall, install } — install() opens the browser's install dialog when available. */
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(!!deferred);
  useEffect(() => {
    listeners.add(setCanInstall);
    return () => listeners.delete(setCanInstall);
  }, []);
  const install = async () => {
    if (!deferred) return false;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    setCanInstall(false);
    return outcome === 'accepted';
  };
  return { canInstall, install };
}
