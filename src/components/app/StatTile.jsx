/** Small labelled number tile (Revenue / Expenses / Profit / Records). */
export default function StatTile({ label, value, tone }) {
  const color = tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : '';
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] bg-card px-3.5 py-3 shadow-card-sm">
      <span className="text-[10.5px] font-semibold uppercase tracking-[.12em] opacity-55">{label}</span>
      <span className={`lg-num text-[22px] font-semibold leading-none ${color}`}>{value}</span>
    </div>
  );
}
