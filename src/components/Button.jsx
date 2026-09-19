/**
 * Ledgio pill buttons.
 *   primary   — solid accent, the main action on a screen
 *   secondary — card surface
 *   ghost     — text only
 *   danger    — soft red
 */
const VARIANTS = {
  primary: 'bg-accent text-on-accent shadow-card font-heading font-semibold hover:bg-accent-600',
  secondary: 'bg-card text-ink shadow-card-sm font-heading font-semibold hover:bg-tint-soft',
  ghost: 'bg-transparent text-accent-700 font-semibold hover:bg-tint-soft',
  danger: 'bg-bad-soft text-bad font-heading font-semibold border border-bad/30 hover:bg-bad-soft/70',
};
const SIZES = {
  lg: 'h-14 px-6 text-[19px]',
  md: 'h-[52px] px-6 text-[17px]',
  sm: 'h-10 px-4 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'lg',
  block = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`lg-tap inline-flex items-center justify-center gap-2 rounded-full border-0 ${VARIANTS[variant]} ${
        SIZES[size]
      } ${block ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
