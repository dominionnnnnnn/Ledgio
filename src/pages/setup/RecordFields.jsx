import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, Lock, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { CURRENCIES } from '../../lib/config';
import {
  ALWAYS_REQUIRED,
  FIELD_HINTS,
  FIELD_LIBRARY,
  LOCKED_FIELDS,
  MONEY_FIELDS,
  defaultFieldsFor,
  defaultRequired,
} from '../../lib/fields';
import { Screen } from '../../components/Screen';
import { BackBar } from '../../components/app/Header';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';

function FieldRow({ name, required, onToggleRequired, onRemove, first }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: name,
  });
  const locked = LOCKED_FIELDS.includes(name);
  const reqLocked = ALWAYS_REQUIRED.includes(name);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex min-h-14 items-center gap-[11px] bg-card px-3.5 py-1.5 ${first ? '' : 'border-t border-divider'} ${
        isDragging ? 'z-10 shadow-card' : ''
      }`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Drag to reorder ${name}`}
        className="-ml-1 grid size-8 touch-none place-items-center rounded-lg border-0 bg-transparent text-ink/40 hover:bg-tint-soft"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </button>
      <span className="mr-auto text-[15px] font-medium">{name}</span>
      <button
        type="button"
        onClick={onToggleRequired}
        disabled={reqLocked}
        aria-pressed={required}
        className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[.06em] disabled:cursor-default disabled:opacity-100 ${
          required ? 'border-transparent bg-accent text-on-accent' : 'border-divider bg-transparent text-ink'
        }`}
      >
        Required
      </button>
      {locked ? (
        <span className="grid size-[30px] place-items-center text-ink/35" title="Always on — needed for profit">
          <Lock size={14} strokeWidth={1.6} />
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="grid size-[30px] place-items-center rounded-full border-0 bg-transparent text-ink/45 hover:bg-tint-soft"
        >
          <X size={16} strokeWidth={1.6} />
        </button>
      )}
    </div>
  );
}

export default function RecordFields() {
  const { business } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const editing = business.fields?.length > 0; // opened from inside the app vs first-time setup

  const [fields, setFields] = useState(() => (editing ? business.fields : defaultFieldsFor(business.type)));
  const [required, setRequired] = useState(() =>
    editing ? { ...business.required, ...defaultRequired() } : defaultRequired(),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const symbol = CURRENCIES.find((c) => c.code === business.currency)?.symbol ?? '';

  function toggle(name) {
    if (LOCKED_FIELDS.includes(name)) return;
    setFields((f) => (f.includes(name) ? f.filter((x) => x !== name) : [...f, name]));
  }

  function onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      setFields((f) => arrayMove(f, f.indexOf(active.id), f.indexOf(over.id)));
    }
  }

  async function save() {
    setBusy(true);
    setError('');
    const req = Object.fromEntries(fields.filter((f) => required[f]).map((f) => [f, true]));
    const write = updateDoc(doc(db, 'businesses', business.id), {
      fields,
      required: req,
      updatedAt: serverTimestamp(),
    });
    if (!navigator.onLine) {
      // Queued offline; it syncs later.
      toast('Record fields saved on this phone');
      navigate('/app', { replace: true });
      return;
    }
    try {
      await write;
      toast('Record fields saved');
      navigate('/app', { replace: true });
    } catch {
      setError('We could not save your fields. Try again.');
      setBusy(false);
    }
  }

  const content = (
    <>
      {editing ? null : (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[.14em] text-accent-700">Last step</div>
          <h1 className="m-0 mt-2 font-heading text-[30px] font-semibold leading-[1.08]">Your record fields</h1>
        </div>
      )}

      <p className="m-0 text-pretty text-[14.5px] leading-relaxed opacity-70">
        Pick the things you write down for each day's work. You can change this later.
      </p>

      <div className="flex flex-col gap-4">
        {FIELD_LIBRARY.map((cat) => (
          <div key={cat.group}>
            <div className="mb-[9px] text-[10.5px] font-semibold uppercase tracking-[.13em] opacity-45">
              {cat.group}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {cat.fields.map((name) => {
                const on = fields.includes(name);
                const locked = LOCKED_FIELDS.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggle(name)}
                    aria-pressed={on}
                    disabled={locked}
                    className={`lg-tap min-h-9 flex-none rounded-full border px-[15px] py-[9px] text-[13px] font-semibold leading-none disabled:cursor-default disabled:opacity-100 ${
                      on
                        ? 'border-transparent bg-accent text-on-accent shadow-card-sm'
                        : 'border-divider bg-card text-ink'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-2.5 flex items-baseline gap-2">
          <h2 className="m-0 mr-auto font-heading text-[22px] font-semibold">Your record</h2>
          <span className="text-xs opacity-50">{fields.length} fields · drag to reorder</span>
        </div>
        <div className="overflow-hidden rounded-[20px] bg-card shadow-card">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={fields} strategy={verticalListSortingStrategy}>
              {fields.map((name, i) => (
                <FieldRow
                  key={name}
                  name={name}
                  first={i === 0}
                  required={!!required[name]}
                  onToggleRequired={() => setRequired((r) => ({ ...r, [name]: !r[name] }))}
                  onRemove={() => toggle(name)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <p className="mb-0 mt-2 flex items-center gap-1.5 text-xs opacity-55">
          <Lock size={12} strokeWidth={1.6} /> Worker, Date, Revenue and Expense are always on — profit is worked out
          from them.
        </p>
      </section>

      <section>
        <h2 className="m-0 mb-2.5 font-heading text-[22px] font-semibold">Live preview</h2>
        <div className="flex flex-col gap-3 rounded-[20px] bg-card p-4 shadow-card">
          {fields.map((name) => (
            <div key={name}>
              <span className="mb-[5px] block text-xs font-semibold text-ink/70">
                {name}
                {required[name] ? ' *' : ''}
              </span>
              <div className="flex min-h-[46px] items-center rounded-xl bg-rail px-3.5 text-[14.5px] opacity-50">
                {MONEY_FIELDS.includes(name) ? `${symbol} ${FIELD_HINTS[name]}` : FIELD_HINTS[name]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad">
          {error}
        </div>
      )}

      <Button block size="lg" className="text-lg" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save my record fields'}
      </Button>
    </>
  );

  // First-time setup: full-screen step. Later (from the app): inside the app frame.
  if (!editing) return <Screen className="gap-5">{content}</Screen>;
  return (
    <>
      <BackBar title="Record fields" top />
      <div className="flex flex-col gap-5 px-4 pb-7 pt-1 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-0 lg:pt-0">
        {content}
      </div>
    </>
  );
}
