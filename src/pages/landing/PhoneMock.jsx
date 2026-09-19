import { Menu, NotebookText, Plus, Receipt, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react';

/** Static picture of the app's home screen for the landing hero. Illustrative numbers only. */
export function SummaryMock({ compact = false }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-[linear-gradient(162deg,var(--color-tint),var(--color-tint-soft)_55%,var(--color-card))] p-4 shadow-card">
      {!compact && (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 rounded-xl bg-card/65 p-[3px] text-[10.5px] font-semibold">
            <span className="flex-1 py-1.5 text-center opacity-55">Today</span>
            <span className="flex-1 rounded-[9px] bg-card py-1.5 text-center shadow-card-sm">This Week</span>
            <span className="flex-1 py-1.5 text-center opacity-55">Month</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-card px-2 py-1.5 text-[10px] font-semibold text-accent-800 shadow-card-sm">
            <Users size={12} strokeWidth={1.7} /> 2 workers
          </span>
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[.13em] opacity-60">
          <TrendingUp size={11} strokeWidth={1.7} /> Revenue · this week
        </span>
        <span className="lg-num text-[34px] font-semibold leading-none">₦1,145,000</span>
      </div>
      <div className="h-px bg-ink/10" />
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[.13em] opacity-60">
          <Wallet size={11} strokeWidth={1.7} /> Profit
        </span>
        <span className="lg-num text-[34px] font-semibold leading-none text-ok">₦606,500</span>
      </div>
      <div className="flex gap-1.5 text-[10.5px]">
        <span className="flex flex-1 items-center gap-1.5 rounded-full bg-card px-2.5 py-1.5 shadow-card-sm">
          <Receipt size={11} strokeWidth={1.7} className="opacity-60" />
          <span className="opacity-65">Expenses</span>
          <strong className="lg-num ml-auto text-bad">₦538k</strong>
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1.5 shadow-card-sm">
          <NotebookText size={11} strokeWidth={1.7} className="opacity-60" />
          <strong>8</strong>
          <span className="opacity-65">records</span>
        </span>
      </div>
    </div>
  );
}

function WorkerRow({ initials, name, count, profit, bg, fg }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-card p-2.5 shadow-card-sm">
      <span
        className="grid size-9 place-items-center rounded-full font-heading text-sm font-semibold"
        style={{ background: bg, color: fg }}
      >
        {initials}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[13px] font-semibold">{name}</span>
        <span className="text-[10.5px] opacity-60">
          {count} records · <strong className="text-ok">{profit}</strong> profit
        </span>
      </div>
    </div>
  );
}

export default function PhoneMock() {
  return (
    <div
      aria-hidden="true"
      className="w-[330px] rounded-[48px] bg-[#0f1319] p-[10px] shadow-[0_30px_70px_rgba(20,26,34,.32),inset_0_0_0_1px_rgba(255,255,255,.08)]"
    >
      <div className="flex flex-col gap-3.5 overflow-hidden rounded-[39px] bg-bg px-3.5 pb-6 pt-3 text-ink">
        <div className="flex items-center px-2 text-[11px] font-semibold opacity-80">
          <span className="mr-auto">9:41</span>
          <span className="flex gap-1">
            <i className="block h-2.5 w-4 rounded-[3px] border-[1.4px] border-current" />
            <i className="block h-2.5 w-5 rounded-[4px] border-[1.4px] border-current bg-[linear-gradient(90deg,currentColor_72%,transparent_72%)]" />
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent font-heading text-base font-semibold text-on-accent">
            K
          </span>
          <div className="mr-auto flex flex-col leading-tight">
            <span className="font-heading text-[16px] font-semibold">Kalu &amp; Sons</span>
            <span className="text-[10px] opacity-55">Haulage · Lagos</span>
          </div>
          <span className="grid size-8 place-items-center rounded-xl bg-rail">
            <Menu size={15} strokeWidth={1.7} />
          </span>
        </div>
        <SummaryMock />
        <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent font-heading text-[17px] font-semibold text-on-accent shadow-card">
          <span className="grid size-6 place-items-center rounded-full bg-on-accent/20">
            <Plus size={15} strokeWidth={2} />
          </span>
          Add Record
        </div>
        <div className="flex items-center">
          <span className="mr-auto font-heading text-lg font-semibold">Workers</span>
          <span className="grid size-7 place-items-center rounded-lg bg-tint text-accent-800">
            <UserPlus size={14} strokeWidth={1.7} />
          </span>
        </div>
        <WorkerRow initials="MD" name="Musa Danjuma" count={4} profit="₦378,000" bg="#e6eef7" fg="#375a7e" />
        <WorkerRow initials="CO" name="Chidi Okonkwo" count={4} profit="₦228,500" bg="#f4ece0" fg="#7a5b31" />
      </div>
    </div>
  );
}
