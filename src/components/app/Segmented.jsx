import { PERIODS } from '../../lib/dates';

/** Sliding Today / This Week / Month control. `tone="card"` for use on tinted cards. */
export default function Segmented({ value, onChange, tone = 'rail', className = '' }) {
  const i = PERIODS.findIndex((p) => p.key === value);
  return (
    <div
      role="tablist"
      className={`relative flex rounded-[14px] p-[3px] ${tone === 'card' ? 'bg-card/65' : 'bg-rail'} ${className}`}
    >
      <i
        aria-hidden="true"
        className="absolute bottom-[3px] top-[3px] rounded-[11px] bg-card shadow-card-sm transition-transform duration-250"
        style={{ width: `calc((100% - 6px) / ${PERIODS.length})`, transform: `translateX(${i * 100}%)` }}
      />
      {PERIODS.map((p) => (
        <button
          key={p.key}
          role="tab"
          aria-selected={p.key === value}
          onClick={() => onChange(p.key)}
          className={`relative h-8 flex-1 whitespace-nowrap rounded-[11px] border-0 bg-transparent text-[12.5px] font-semibold ${
            p.key === value ? 'text-ink' : 'text-ink/55'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
