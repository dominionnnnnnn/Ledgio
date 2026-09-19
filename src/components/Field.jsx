import { useId, useState } from 'react';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';

const INPUT =
  'w-full min-h-[52px] rounded-xl border border-divider bg-card px-3.5 text-base text-ink placeholder:text-ink/40 outline-none transition-colors focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent';

/** Label + control + optional error, in the v2 form style. */
export function Field({ label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <span className="mb-[5px] block text-xs font-semibold text-ink/70">{label}</span>}
      {children}
      {error ? (
        <div role="alert" className="mt-[7px] flex items-center gap-[7px] text-[12.5px] font-medium text-bad">
          <CircleAlert size={15} strokeWidth={1.6} className="flex-none" />
          {error}
        </div>
      ) : (
        hint && <div className="mt-[7px] text-[12.5px] text-ink/55">{hint}</div>
      )}
    </div>
  );
}

/** Optional leading icon (a lucide component) sits inside the box on the left. */
function Lead({ icon: Icon }) {
  return (
    <Icon
      size={17}
      strokeWidth={1.6}
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/45"
    />
  );
}

export function TextInput({ label, error, hint, icon, className = '', ...props }) {
  const id = useId();
  return (
    <Field label={<label htmlFor={id}>{label}</label>} error={error} hint={hint} className={className}>
      <div className="relative">
        {icon && <Lead icon={icon} />}
        <input
          id={id}
          className={`${INPUT} ${icon ? 'pl-10' : ''} ${error ? 'border-bad' : ''}`}
          aria-invalid={!!error}
          {...props}
        />
      </div>
    </Field>
  );
}

export function PasswordInput({ label = 'Password', error, hint, icon, className = '', ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <Field label={<label htmlFor={id}>{label}</label>} error={error} hint={hint} className={className}>
      <div className="relative">
        {icon && <Lead icon={icon} />}
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`${INPUT} pr-[52px] ${icon ? 'pl-10' : ''} ${error ? 'border-bad' : ''}`}
          aria-invalid={!!error}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-[7px] grid size-[38px] place-items-center rounded-xl border-0 bg-transparent text-ink/60 hover:bg-tint-soft"
        >
          {show ? <EyeOff size={19} strokeWidth={1.5} /> : <Eye size={19} strokeWidth={1.5} />}
        </button>
      </div>
    </Field>
  );
}

export function SelectInput({ label, error, children, className = '', ...props }) {
  const id = useId();
  return (
    <Field label={<label htmlFor={id}>{label}</label>} error={error} className={className}>
      <select id={id} className={`${INPUT} px-3`} {...props}>
        {children}
      </select>
    </Field>
  );
}