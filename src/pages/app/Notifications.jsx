import { useNavigate } from 'react-router-dom';
import { Bell, CalendarX2, Crown, MessageSquareText, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { markAllRead, markRead } from '../../lib/data';
import { today, toISO, addDays } from '../../lib/dates';
import { BackBar } from '../../components/app/Header';
import { useAppShell } from '../../components/app/AppLayout';
import EmptyState from '../../components/app/EmptyState';

const KIND = {
  reply: { icon: MessageSquareText, cls: 'bg-tint text-accent-800' },
  record: { icon: CalendarX2, cls: 'bg-bad-soft text-bad' },
  worker: { icon: TrendingUp, cls: 'bg-ok-soft text-ok' },
  plan: { icon: Crown, cls: 'bg-tint text-accent-800' },
};

function when(ts) {
  const d = ts?.toDate?.() ?? new Date();
  const iso = toISO(d);
  const time = d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (iso === today()) return { group: 'Today', at: `Today · ${time}` };
  if (iso === addDays(today(), -1)) return { group: 'Yesterday', at: `Yesterday · ${time}` };
  return { group: 'Earlier', at: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) };
}

export default function Notifications() {
  const { business } = useAuth();
  const { notifs } = useAppShell();
  const navigate = useNavigate();
  const list = notifs?.data ?? [];
  const unreadIds = list.filter((n) => n.unread).map((n) => n.id);

  const groups = ['Today', 'Yesterday', 'Earlier']
    .map((g) => ({ label: g, items: list.map((n) => ({ ...n, ...when(n.createdAt) })).filter((n) => n.group === g) }))
    .filter((g) => g.items.length);

  function open(n) {
    if (n.unread) markRead(business.id, n.id);
    if (n.link) navigate(n.link);
  }

  return (
    <>
      <BackBar title="Notifications" top />
      <div className="flex flex-col gap-3.5 px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-0">
        {unreadIds.length > 0 && (
          <div className="flex items-center gap-2.5 rounded-[18px] bg-tint px-3.5 py-3 text-accent-800">
            <span className="mr-auto text-[13.5px] font-semibold">{unreadIds.length} new since you last looked</span>
            <button
              onClick={() => markAllRead(business.id, unreadIds)}
              className="flex-none whitespace-nowrap rounded-full border-0 bg-card px-3 py-2 text-[12.5px] font-semibold text-inherit shadow-card-sm"
            >
              Mark all read
            </button>
          </div>
        )}

        {notifs?.loading ? (
          [0, 1, 2].map((i) => <i key={i} className="lg-sk block h-[92px] rounded-[20px]" />)
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nothing new"
            body="Replies to your tickets and weekly business alerts will show up here."
          />
        ) : (
          groups.map((g) => (
            <section key={g.label}>
              <div className="mb-2.5 mt-1 text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-45">
                {g.label}
              </div>
              <div className="flex flex-col gap-[9px]">
                {g.items.map((n) => {
                  const k = KIND[n.kind] ?? KIND.plan;
                  const Icon = k.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => open(n)}
                      className={`lg-tap flex w-full gap-[13px] rounded-[20px] border-0 bg-card p-3.5 text-left text-ink ${
                        n.unread
                          ? 'shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--color-accent)_45%,transparent),var(--lg-sh)]'
                          : 'shadow-card-sm'
                      }`}
                    >
                      <span className={`grid size-10 flex-none place-items-center rounded-[14px] ${k.cls}`}>
                        <Icon size={19} strokeWidth={1.6} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-pretty text-[15px] font-semibold leading-snug">{n.title}</span>
                        {n.body && (
                          <span className="text-pretty text-[13.5px] leading-normal opacity-70">{n.body}</span>
                        )}
                        <span className="flex items-center gap-2 text-[11.5px]">
                          <span className="opacity-50">{n.at}</span>
                          {n.cta && <span className="font-semibold text-accent-700">{n.cta}</span>}
                        </span>
                      </span>
                      {n.unread && <i className="mt-1 size-[9px] flex-none self-start rounded-full bg-accent" />}
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
