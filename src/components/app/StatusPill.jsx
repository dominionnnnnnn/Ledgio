const STYLES = {
  answered: 'bg-ok-soft text-ok',
  closed: 'bg-rail text-ink/70',
  open: 'bg-tint text-accent-800',
};

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[.05em] ${STYLES[status] ?? STYLES.open}`}
    >
      {status}
    </span>
  );
}
