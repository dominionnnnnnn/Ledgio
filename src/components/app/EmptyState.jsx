/** Card with a round icon, title, text and an optional action. */
export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-[22px] py-[30px] text-center shadow-card">
      <div className="grid size-[76px] place-items-center rounded-full bg-tint text-accent-800">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <div className="font-heading text-[23px] font-semibold">{title}</div>
      <p className="m-0 max-w-[260px] text-pretty text-[14.5px] leading-relaxed opacity-65">{body}</p>
      {action}
    </div>
  );
}
