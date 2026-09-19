/** True when Ledgio is running as the installed app (home screen), not in a browser tab. */
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true // iOS Safari
  );
}

const ONBOARDED_KEY = 'ledgio:onboarded';

export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    /* storage unavailable — onboarding will simply show again */
  }
}
