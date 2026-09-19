// Worker avatar colours from the v2 design: [background, text] per theme.
const LIGHT = [
  ['#e6eef7', '#375a7e'],
  ['#f4ece0', '#7a5b31'],
  ['#e5f1ea', '#2f6b4f'],
  ['#f6e9ee', '#7c4055'],
  ['#ecebf6', '#4a4574'],
  ['#e6f1f3', '#2f5f66'],
];
const DARK = [
  ['#2a3a4b', '#c6dcf1'],
  ['#3a3328', '#ecd9bd'],
  ['#24382f', '#bfe3cf'],
  ['#3a2a30', '#efc9d3'],
  ['#2f2e40', '#d2cdf0'],
  ['#26383b', '#c3e1e5'],
];

/** Stable colour index from an id, so a worker keeps the same colour everywhere. */
export function tintIndex(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 6;
}

export function tint(id) {
  const dark = document.documentElement.dataset.theme === 'dark';
  return (dark ? DARK : LIGHT)[tintIndex(id)];
}

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
