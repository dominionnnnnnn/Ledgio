import { Crown } from 'lucide-react';

/** Gold crown pill shown next to the business name on Premium. */
export default function PremiumBadge({ compact = false, className = '' }) {
  return (
    <span
      title="Premium"
      className={`inline-flex flex-none items-center gap-1 rounded-full bg-gold-soft font-semibold uppercase tracking-[.06em] text-gold ${
        compact ? 'size-[22px] justify-center' : 'px-2 py-0.5 text-[10.5px]'
      } ${className}`}
    >
      <Crown size={compact ? 13 : 12} strokeWidth={2} />
      {!compact && 'Premium'}
    </span>
  );
}
