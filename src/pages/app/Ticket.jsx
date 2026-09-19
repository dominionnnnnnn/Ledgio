import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { replyToTicket, setTicketStatus, useTicket, useTicketMessages } from '../../lib/data';
import { settle } from '../../lib/settle';
import { initials } from '../../lib/avatar';
import { BackBar } from '../../components/app/Header';
import StatusPill from '../../components/app/StatusPill';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import { shortWhen } from './Support';

function stamp(ts) {
  const d = ts?.toDate?.() ?? new Date();
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
}

export default function Ticket() {
  const { id } = useParams();
  const { business } = useAuth();
  const toast = useToast();
  const ticket = useTicket(business.id, id);
  const msgs = useTicketMessages(business.id, id);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  if (ticket.loading) return <LoadingScreen />;
  if (!ticket.data) {
    return (
      <>
        <BackBar title="Ticket" to="/app/support" />
        <p className="px-5 opacity-70">This ticket was not found.</p>
      </>
    );
  }
  const t = ticket.data;
  const closed = t.status === 'closed';

  async function reply() {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      await settle(replyToTicket(business.id, id, body.slice(0, 2000)).done);
      setText('');
    } catch {
      toast('Could not send. Try again.');
    }
    setBusy(false);
  }

  async function toggleClosed() {
    try {
      await settle(setTicketStatus(business.id, id, closed ? 'open' : 'closed').done);
      toast(closed ? 'Ticket reopened' : 'Ticket closed');
    } catch {
      toast('Could not update the ticket. Try again.');
    }
  }

  return (
    <>
      <BackBar title="Ticket" to="/app/support" />
      <div className="flex flex-col gap-3.5 px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-0">
        <section className="flex flex-col gap-2 rounded-3xl bg-card p-[18px] shadow-card">
          <span className="flex items-center gap-2">
            <StatusPill status={t.status} />
            <span className="text-[11.5px] font-semibold opacity-50">{t.ref}</span>
          </span>
          <h2 className="m-0 font-heading text-[25px] font-semibold leading-tight">{t.subject}</h2>
          <span className="text-[12.5px] opacity-55">
            {t.category} · opened {shortWhen(t.createdAt)}
          </span>
          {t.screenshotUrl && (
            <a
              href={t.screenshotUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1.5 self-start text-[13px] font-semibold text-accent-700 no-underline"
            >
              <ImageIcon size={15} strokeWidth={1.6} /> View screenshot
            </a>
          )}
        </section>

        {(msgs.data ?? []).map((m) => {
          const mine = m.from === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col gap-2 rounded-[20px] p-4 ${mine ? 'bg-rail' : 'bg-card shadow-card-sm'}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-[26px] place-items-center rounded-full font-heading text-[11px] font-semibold ${
                    mine ? 'bg-card text-ink' : 'bg-accent text-on-accent'
                  }`}
                >
                  {mine ? initials(business.name) : 'LS'}
                </span>
                <span className="mr-auto text-sm font-semibold">{mine ? 'You' : 'Ledgio Support'}</span>
                <span className="text-[11.5px] opacity-50">{stamp(m.createdAt)}</span>
              </div>
              <p className="m-0 whitespace-pre-wrap text-[15px] leading-relaxed">{m.text}</p>
            </div>
          );
        })}

        {!closed && (
          <textarea
            rows={3}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add to this ticket…"
            className="w-full rounded-[20px] border border-divider bg-card px-4 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-ink/40 focus:border-accent"
          />
        )}
        <div className="flex gap-2.5">
          {!closed && (
            <Button size="md" className="flex-1" onClick={reply} disabled={busy || !text.trim()}>
              {busy ? 'Sending…' : 'Send reply'}
            </Button>
          )}
          <Button variant="secondary" size="md" className={closed ? 'flex-1' : ''} onClick={toggleClosed}>
            {closed ? 'Reopen ticket' : 'Close'}
          </Button>
        </div>
      </div>
    </>
  );
}
