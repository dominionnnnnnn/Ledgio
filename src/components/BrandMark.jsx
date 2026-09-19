/** The "L" tile used on auth screens and in the top bar. Shows the business logo when given. */
export default function BrandMark({ letter = 'L', logoUrl, size = 44 }) {
  const style = { width: size, height: size, borderRadius: Math.round(size * 0.35), fontSize: Math.round(size * 0.46) };
  if (logoUrl) {
    return <img src={logoUrl} alt="" style={style} className="flex-none object-cover shadow-card-sm" />;
  }
  return (
    <div
      style={style}
      className="grid flex-none place-items-center bg-accent font-heading font-semibold text-on-accent shadow-card-sm"
    >
      {letter}
    </div>
  );
}
