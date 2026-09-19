const KEY = 'ledgio:theme'; // 'light' | 'dark' | 'system'

export function getThemePref() {
  try {
    return localStorage.getItem(KEY) || 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(pref = getThemePref()) {
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

export function setThemePref(pref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* ignore */
  }
  applyTheme(pref);
}

/** Apply once on load and follow the system setting while pref is "system". */
export function initTheme() {
  applyTheme();
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => getThemePref() === 'system' && applyTheme());
}
