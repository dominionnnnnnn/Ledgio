import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChartColumn,
  Crown,
  Headset,
  LayoutDashboard,
  ListChecks,
  LogOut,
  NotebookText,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications, useUsage } from '../../lib/data';
import { useAlerts } from '../../lib/alerts';
import { thisMonth } from '../../lib/dates';
import { limitsFor } from '../../lib/config';
import { BUSINESS_TYPES } from '../../lib/fields';
import { useDesktop } from '../../hooks/useDesktop';
import BrandMark from '../BrandMark';
import { useToast } from '../Toast';
import Modal from './Modal';
import ThemeSwitch from './ThemeSwitch';
import RecordForm from '../../pages/app/RecordForm';
import WorkerForm from '../../pages/app/WorkerForm';

const ShellContext = createContext({
  openMenu: () => {},
  unread: 0,
  notifs: null,
  addRecord: () => {},
  addWorker: () => {},
  desktop: false,
});
export const useAppShell = () => useContext(ShellContext);

// Desktop top-bar titles, first match wins.
const TITLES = [
  ['/app', 'Dashboard', 'How the business is doing right now'],
  ['/app/records', 'Records', 'Every day’s work, month by month'],
  ['/app/records/new', 'Add record', 'Write down a piece of work'],
  ['/app/records/:id/edit', 'Edit record', 'Change what was written down'],
  ['/app/records/:id', 'Record', 'One piece of work'],
  ['/app/workers', 'Workers', 'Your team and how each one is doing'],
  ['/app/workers/new', 'Add worker', 'Someone new on the team'],
  ['/app/workers/:id/edit', 'Edit worker', 'Details, truck and status'],
  ['/app/workers/:id', 'Worker', 'One worker’s records and performance'],
  ['/app/reports', 'Reports', 'Totals and charts for any period'],
  ['/app/fields', 'Record fields', 'What you write down for each piece of work'],
  ['/app/notifications', 'Notifications', 'Alerts and replies'],
  ['/app/support', 'Customer support', 'We usually reply within one working day'],
  ['/app/support/:id', 'Ticket', 'Your conversation with support'],
  ['/app/business', 'Business profile', 'Your business, appearance and account'],
];

function UsageCard({ usage, limits }) {
  return (
    <div className="flex flex-col gap-[9px] rounded-[20px] bg-gradient-to-br from-tint to-card p-[15px] shadow-card">
      <div className="flex items-center gap-2 text-accent-800">
        <Crown size={16} strokeWidth={1.6} />
        <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-ink/65">Free plan</span>
      </div>
      <span className="text-[12.5px] leading-normal opacity-70">
        {usage.count} of {limits.recordsPerMonth} records used this month. Up to {limits.workers} workers.
      </span>
      <div className="h-1.5 overflow-hidden rounded-full bg-rail">
        <i
          className={`block h-full rounded-full ${usage.count >= limits.recordsPerMonth ? 'bg-bad' : 'bg-accent'}`}
          style={{ width: `${Math.min(100, (usage.count / limits.recordsPerMonth) * 100)}%` }}
        />
      </div>
      <div className="grid h-10 place-items-center rounded-full bg-rail font-heading text-[15px] font-semibold opacity-80">
        Premium coming soon
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[52px] items-center gap-[13px] rounded-2xl border-0 bg-transparent px-3 text-left text-[15.5px] font-medium text-ink hover:bg-tint-soft"
    >
      <span className="grid size-[34px] flex-none place-items-center rounded-xl bg-tint text-accent-800">
        <Icon size={18} strokeWidth={1.6} />
      </span>
      {label}
      {badge > 0 && (
        <span className="ml-auto grid h-[22px] min-w-[22px] place-items-center rounded-full bg-bad px-[7px] text-xs font-semibold text-on-accent">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Mobile: slide-in menu from the right. */
function SlideMenu({ onClose, unread, usage }) {
  const { business, user, logout } = useAuth();
  const navigate = useNavigate();
  const limits = limitsFor(business.plan);
  const go = (to) => {
    onClose();
    navigate(to);
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#0f1319]/50 lg:hidden" onClick={onClose}>
      <nav
        aria-label="Menu"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[300px] max-w-[86vw] animate-[lg-slide_.26s_cubic-bezier(.4,0,.2,1)_both] flex-col overflow-y-auto bg-bg shadow-[-20px_0_50px_rgba(15,19,25,.3)]"
      >
        <div className="flex items-center gap-3 px-[18px] pb-4 pt-[max(20px,env(safe-area-inset-top))]">
          <BrandMark size={42} letter={business.name[0]?.toUpperCase()} logoUrl={business.logoUrl} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-heading text-lg font-semibold">{business.name}</span>
            <span className="truncate text-[11.5px] opacity-55">{user.email}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto grid size-9 flex-none place-items-center rounded-xl border-0 bg-transparent text-ink/60 hover:bg-tint-soft"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 px-3">
          <MenuItem icon={Building2} label="Business profile" onClick={() => go('/app/business')} />
          <MenuItem icon={NotebookText} label="Records" onClick={() => go('/app/records')} />
          <MenuItem icon={Users} label="Workers" onClick={() => go('/app/workers')} />
          <MenuItem icon={Bell} label="Notifications" onClick={() => go('/app/notifications')} badge={unread} />
          <MenuItem icon={ChartColumn} label="Reports" onClick={() => go('/app/reports')} />
          <MenuItem icon={ListChecks} label="Record fields setup" onClick={() => go('/app/fields')} />
          <MenuItem icon={Headset} label="Customer support" onClick={() => go('/app/support')} />
        </div>
        <div className="mx-3.5 mb-[max(18px,env(safe-area-inset-bottom))] mt-auto flex flex-col gap-3 pt-6">
          <ThemeSwitch />
          <UsageCard usage={usage} limits={limits} />
          <button
            onClick={logout}
            className="flex h-[50px] items-center justify-center gap-[9px] rounded-full border border-bad/40 bg-bad-soft font-heading text-base font-semibold text-bad"
          >
            <LogOut size={18} strokeWidth={1.6} />
            Log out
          </button>
        </div>
      </nav>
    </div>
  );
}

const NAV = [
  { to: '/app', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/records', icon: NotebookText, label: 'Records' },
  { to: '/app/workers', icon: Users, label: 'Workers' },
  { to: '/app/reports', icon: ChartColumn, label: 'Reports' },
  { to: '/app/fields', icon: SlidersHorizontal, label: 'Record fields' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/app/support', icon: Headset, label: 'Support' },
];

/** Desktop: fixed left sidebar. */
function Sidebar({ unread, usage, onAddRecord }) {
  const { business, logout } = useAuth();
  const typeLabel = BUSINESS_TYPES.find((t) => t.value === business.type)?.label;
  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] flex-none flex-col border-r border-divider px-4 py-5 lg:flex">
      <NavLink to="/app/business" className="mb-5 flex items-center gap-3 px-1 text-ink no-underline">
        <BrandMark size={40} letter={business.name[0]?.toUpperCase()} logoUrl={business.logoUrl} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-heading text-[19px] font-semibold">{business.name}</span>
          {typeLabel && <span className="text-[11.5px] opacity-55">{typeLabel}</span>}
        </div>
      </NavLink>
      <button
        onClick={onAddRecord}
        className="lg-tap mb-5 flex h-[54px] items-center justify-center gap-2.5 rounded-2xl border-0 bg-accent font-heading text-[17px] font-semibold text-on-accent shadow-[0_8px_22px_color-mix(in_srgb,var(--color-accent)_38%,transparent)]"
      >
        <span className="grid size-6 place-items-center rounded-full bg-on-accent/20">
          <Plus size={16} strokeWidth={2} />
        </span>
        Add Record
      </button>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, end, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] font-medium no-underline ${
                isActive ? 'bg-tint font-semibold text-ink' : 'text-ink/80 hover:bg-tint-soft'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.6} className="opacity-75" />
            {label}
            {badge && unread > 0 && (
              <span className="ml-auto grid h-[22px] min-w-[22px] place-items-center rounded-full bg-bad px-[7px] text-xs font-semibold text-on-accent">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <UsageCard usage={usage} limits={limitsFor(business.plan)} />
        <ThemeSwitch />
        <button
          onClick={logout}
          className="flex h-11 items-center gap-3 rounded-[14px] border-0 bg-transparent px-3 text-[15px] font-medium text-ink/80 hover:bg-bad-soft hover:text-bad"
        >
          <LogOut size={18} strokeWidth={1.6} /> Log out
        </button>
      </div>
    </aside>
  );
}

/** Desktop: page title, search, bell, account. */
function TopBar({ unread }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const match = TITLES.find(([pattern]) => matchPath({ path: pattern, end: true }, pathname));
  const [, title, subtitle] = match ?? [null, '', ''];
  return (
    <header className="sticky top-0 z-20 hidden items-center gap-4 border-b border-divider bg-bg/90 px-8 py-4 backdrop-blur lg:flex">
      <div className="mr-auto flex min-w-0 flex-col">
        <h1 className="m-0 truncate font-heading text-[28px] font-semibold leading-tight">{title}</h1>
        {subtitle && <span className="truncate text-[13px] opacity-55">{subtitle}</span>}
      </div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/app/records${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
        }}
        className="flex h-11 w-[280px] items-center gap-2.5 rounded-full bg-card px-4 shadow-card-sm"
      >
        <Search size={17} strokeWidth={1.6} className="flex-none opacity-50" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search records"
          className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink/40"
        />
      </form>
      <NavLink
        to="/app/notifications"
        aria-label="Notifications"
        className="relative grid size-11 place-items-center rounded-[14px] bg-rail text-ink hover:bg-tint"
      >
        <Bell size={19} strokeWidth={1.6} />
        {unread > 0 && (
          <i className="absolute right-2.5 top-2 size-[9px] rounded-full bg-bad shadow-[0_0_0_2px_var(--lg-bg)]" />
        )}
      </NavLink>
      <NavLink
        to="/app/business"
        aria-label="Business profile"
        className="grid size-11 place-items-center rounded-full bg-tint font-heading text-base font-semibold uppercase text-accent-800 no-underline"
      >
        {user.email?.[0] ?? '?'}
      </NavLink>
    </header>
  );
}

/** Frame for every signed-in screen. Phone: single column + slide menu. Desktop: sidebar + top bar. */
export default function AppLayout() {
  const { business } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null); // { kind: 'record' | 'worker', worker? }
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const desktop = useDesktop();

  const usage = useUsage(business.id, thisMonth());
  const notifs = useNotifications(business.id);
  const unread = (notifs.data ?? []).filter((n) => n.unread).length;
  useAlerts(business, usage.count, usage.loading);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeModal = useCallback(() => setModal(null), []);

  // Add Record / Add Worker: modals on desktop, full screens on phones.
  const addRecord = useCallback(
    (workerId) => {
      if (desktop) setModal({ kind: 'record', worker: workerId });
      else navigate(`/app/records/new${workerId ? `?worker=${workerId}` : ''}`);
    },
    [desktop, navigate],
  );
  const addWorker = useCallback(() => {
    const limit = limitsFor(business.plan).workers;
    if ((business.workerCount ?? 0) >= limit) {
      toast(`The free plan allows ${limit} workers`);
      return;
    }
    if (desktop) setModal({ kind: 'worker' });
    else navigate('/app/workers/new');
  }, [business.plan, business.workerCount, desktop, navigate, toast]);

  useEffect(() => {
    setMenuOpen(false);
    setModal(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ShellContext.Provider value={{ openMenu, unread, notifs, addRecord, addWorker, desktop }}>
      <div className="lg:flex">
        <Sidebar unread={unread} usage={usage} onAddRecord={() => addRecord()} />
        <div className="min-w-0 flex-1">
          <TopBar unread={unread} />
          <main className="mx-auto min-h-dvh w-full max-w-[480px] pt-[env(safe-area-inset-top)] lg:min-h-0 lg:max-w-[1200px] lg:px-8 lg:pb-10 lg:pt-6">
            <Outlet />
          </main>
        </div>
      </div>
      {menuOpen && <SlideMenu onClose={closeMenu} unread={unread} usage={usage} />}
      {modal?.kind === 'record' && (
        <Modal title="Add record" onClose={closeModal} width="max-w-4xl">
          <RecordForm embedded presetWorker={modal.worker} onDone={closeModal} />
        </Modal>
      )}
      {modal?.kind === 'worker' && (
        <Modal title="Add worker" onClose={closeModal} width="max-w-xl">
          <WorkerForm embedded onDone={closeModal} />
        </Modal>
      )}
    </ShellContext.Provider>
  );
}
