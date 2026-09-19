import { initials, tint } from '../../lib/avatar';

/** Round initials avatar (or photo) in the worker's stable colour. */
export default function Avatar({ id, name, photoUrl, size = 46, className = '' }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  if (photoUrl) {
    return <img src={photoUrl} alt="" style={style} className={`flex-none rounded-full object-cover ${className}`} />;
  }
  const [bg, fg] = tint(id);
  return (
    <span
      aria-hidden="true"
      style={{ ...style, background: bg, color: fg }}
      className={`grid flex-none place-items-center rounded-full font-heading font-semibold ${className}`}
    >
      {initials(name)}
    </span>
  );
}
