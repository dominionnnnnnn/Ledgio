import { Crown } from 'lucide-react';

/** Shown when a free-plan limit is reached. */
export default function LimitNotice({ title, body }) {
  return (
    <div className="flex flex-col gap-2 rounded-[20px] bg-gradient-to-br from-tint to-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-accent-800">
        <Crown size={17} strokeWidth={1.6} />
        <span className="text-[11px] font-semibold uppercase tracking-[.1em]">Free plan limit</span>
      </div>
      <div className="font-heading text-xl font-semibold">{title}</div>
      <p className="m-0 text-[13.5px] leading-relaxed opacity-70">{body}</p>
      <span className="self-start rounded-full bg-rail px-3 py-1.5 text-xs font-semibold opacity-80">
        Premium coming soon
      </span>
    </div>
  );
}
