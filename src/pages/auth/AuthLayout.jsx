import { Screen } from '../../components/Screen';
import BrandMark from '../../components/BrandMark';
import Button from '../../components/Button';

/**
 * Shared frame for sign up / log in / forgot / reset:
 * brand tile, title, intro, form fields, then the main button pinned low with a text link under it.
 */
export default function AuthLayout({ title, body, onSubmit, cta, busy, formError, alt, children, afterFields }) {
  return (
    <Screen>
      <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col">
        <div className="mb-[22px]">
          <BrandMark size={52} />
        </div>
        <h1 className="m-0 font-heading text-[32px] font-semibold leading-[1.08]">{title}</h1>
        <p className="mb-[22px] mt-2 text-pretty text-[15px] leading-relaxed opacity-70">{body}</p>

        <div className="flex flex-col gap-3.5">{children}</div>
        {afterFields}

        {formError && (
          <div
            role="alert"
            className="mt-4 rounded-[14px] bg-bad-soft px-3.5 py-2.5 text-[13.5px] font-medium text-bad"
          >
            {formError}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-6">
          {cta && (
            <Button type="submit" block disabled={busy}>
              {busy ? 'Please wait…' : cta}
            </Button>
          )}
          {alt}
        </div>
      </form>
    </Screen>
  );
}
