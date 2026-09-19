/** Paired revenue / expense bars. buckets: [{ label, revenue, expense }] */
export function BarPairs({ buckets, height = 150 }) {
  const max = Math.max(1, ...buckets.flatMap((b) => [b.revenue, b.expense]));
  const bar = (v) => ({ height: `${Math.max(v > 0 ? 3 : 0, (v / max) * 100)}%` });
  return (
    <div className="flex items-end gap-2.5" style={{ height }} role="img" aria-label="Revenue and expenses chart">
      {buckets.map((b, i) => (
        <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-[7px]">
          <div className="flex h-full items-end justify-center gap-[3px]">
            <i
              className="block w-full max-w-4 rounded-t-md bg-accent transition-[height] duration-300"
              style={bar(b.revenue)}
              title={`${b.label} revenue`}
            />
            <i
              className="block w-full max-w-4 rounded-t-md bg-bad transition-[height] duration-300"
              style={bar(b.expense)}
              title={`${b.label} expenses`}
            />
          </div>
          <span className="truncate text-center text-[10.5px] font-semibold leading-none opacity-50">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend() {
  return (
    <>
      <span className="flex items-center gap-[5px] text-[11.5px] opacity-65">
        <i className="block size-[9px] rounded-full bg-accent" />
        revenue
      </span>
      <span className="flex items-center gap-[5px] text-[11.5px] opacity-65">
        <i className="block size-[9px] rounded-full bg-bad" />
        expenses
      </span>
    </>
  );
}

/** Small line chart with a soft fill and a dot on the last point. values: number[] */
export function Sparkline({ values, height = 92 }) {
  const W = 300;
  const H = height;
  const pad = 6;
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const x = (i) => (values.length === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (values.length - 1));
  const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${x(0)},${H} ${pts} ${x(values.length - 1)},${H}`;
  const last = values.length - 1;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      fill="none"
      preserveAspectRatio="none"
      role="img"
      aria-label="Profit trend"
    >
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="var(--color-divider)" strokeWidth="1" />
      <polyline points={area} fill="var(--color-tint-soft)" stroke="none" />
      <polyline
        points={pts}
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x(last)} cy={y(values[last])} r="4.5" fill="var(--color-accent)" />
    </svg>
  );
}
