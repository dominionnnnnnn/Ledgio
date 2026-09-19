import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_TYPES } from '../../lib/fields';
import BrandMark from '../BrandMark';
import { useAppShell } from './AppLayout';

const iconBtn =
  'lg-tap relative grid size-10 flex-none place-items-center rounded-[14px] border-0 bg-rail text-ink hover:bg-tint';

/** Home top bar: business logo + name, notifications bell, menu. */
export function HomeHeader() {
  const { business } = useAuth();
  const { openMenu, unread } = useAppShell();
  const navigate = useNavigate();
  const typeLabel = BUSINESS_TYPES.find((t) => t.value === business.type)?.label;
  return (
    <header className="flex items-center gap-3 px-4 pb-3 pt-2.5 lg:hidden">
      <div className="mr-auto flex min-w-0 items-center gap-[11px]">
        <BrandMark size={40} letter={business.name[0]?.toUpperCase()} logoUrl={business.logoUrl} />
        <div className="flex min-w-0 flex-col leading-[1.15]">
          <span className="truncate font-heading text-[19px] font-semibold">{business.name}</span>
          {typeLabel && <span className="text-[11.5px] opacity-55">{typeLabel}</span>}
        </div>
      </div>
      <button className={iconBtn} aria-label="Notifications" onClick={() => navigate('/app/notifications')}>
        <Bell size={19} strokeWidth={1.6} />
        {unread > 0 && (
          <i className="absolute right-2 top-[7px] size-[9px] rounded-full bg-bad shadow-[0_0_0_2px_var(--lg-bg)]" />
        )}
      </button>
      <button className={iconBtn} aria-label="Menu" onClick={openMenu}>
        <Menu size={19} strokeWidth={1.6} />
      </button>
    </header>
  );
}

/**
 * Inner screens: back button + title, optional action on the right.
 * Desktop shows the title in the top bar instead: `top` pages (reached from the sidebar)
 * hide this bar entirely; sub-pages keep a small back link and the action.
 */
export function BackBar({ title, to, action, top = false }) {
  const navigate = useNavigate();
  const back = () => (to ? navigate(to) : window.history.length > 1 ? navigate(-1) : navigate('/app'));
  return (
    <header className={`flex items-center gap-3 px-4 pb-3 pt-2.5 lg:px-0 lg:pb-4 lg:pt-0 ${top ? 'lg:hidden' : ''}`}>
      <button className={`${iconBtn} lg:hidden`} aria-label="Back" onClick={back}>
        <ChevronLeft size={20} strokeWidth={1.6} />
      </button>
      <button
        onClick={back}
        className="hidden items-center gap-1 rounded-full border-0 bg-transparent py-1.5 pl-1 pr-3 text-sm font-semibold text-accent-700 hover:bg-tint-soft lg:flex"
      >
        <ChevronLeft size={17} strokeWidth={1.8} /> Back
      </button>
      <h1 className="m-0 mr-auto truncate font-heading text-[23px] font-semibold lg:hidden">{title}</h1>
      <span className="hidden flex-1 lg:block" />
      {action}
    </header>
  );
}
