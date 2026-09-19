import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { getThemePref, setThemePref } from '../../lib/theme';

const OPTIONS = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'Auto', icon: Monitor },
];

/** Light / Dark / Auto (follows the phone). */
export default function ThemeSwitch({ className = '' }) {
  const [pref, setPref] = useState(getThemePref);
  return (
    <div role="radiogroup" aria-label="Appearance" className={`flex rounded-[14px] bg-rail p-[3px] ${className}`}>
      {OPTIONS.map(({ key, label, icon: Icon }) => {
        const on = key === pref;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={on}
            onClick={() => {
              setPref(key);
              setThemePref(key);
            }}
            className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[11px] border-0 text-[12.5px] font-semibold ${
              on ? 'bg-card text-ink shadow-card-sm' : 'bg-transparent text-ink/55'
            }`}
          >
            <Icon size={14} strokeWidth={1.7} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
