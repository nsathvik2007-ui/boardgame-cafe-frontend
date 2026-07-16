const ICONS = {
  Strategy: { color: '#F4A340', svg: (c) => (
    <path d="M50 4 L88 24 L72 50 L28 50 L12 24 Z" fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
  )},
  Cooperative: { color: '#2D6A4F', svg: (c) => (
    <>
      <circle cx="35" cy="26" r="13" fill="none" stroke={c} strokeWidth="1.8" />
      <circle cx="65" cy="26" r="13" fill="none" stroke={c} strokeWidth="1.8" />
      <path d="M46 26 H54" stroke={c} strokeWidth="1.8" />
    </>
  )},
  Card: { color: '#F4A340', svg: () => (
    <>
      <rect x="26" y="16" width="22" height="30" rx="3" fill="#F4A340" transform="rotate(-8 37 31)" />
      <rect x="43" y="12" width="22" height="30" rx="3" fill="#D64550" transform="rotate(4 54 27)" />
      <rect x="58" y="18" width="22" height="30" rx="3" fill="#2D6A4F" transform="rotate(14 69 33)" />
    </>
  )},
  Party: { color: '#D64550', svg: (c) => (
    <>
      <path d="M50 10 V22 M28 20 L37 28 M72 20 L63 28 M18 42 L30 40 M82 42 L70 40" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="50" cy="40" r="4" fill={c} />
      <circle cx="34" cy="36" r="2.5" fill={c} />
      <circle cx="66" cy="36" r="2.5" fill={c} />
    </>
  )},
  Family: { color: '#A9744F', svg: (c) => (
    <>
      <path d="M32 46 Q32 30 40 30 Q48 30 48 46 Z" fill="none" stroke={c} strokeWidth="1.8" />
      <circle cx="40" cy="20" r="7" fill="none" stroke={c} strokeWidth="1.8" />
      <path d="M58 46 Q58 36 64 36 Q70 36 70 46 Z" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="64" cy="30" r="5" fill="none" stroke={c} strokeWidth="1.6" />
    </>
  )},
  'War/Warfare': { color: '#3D2817', svg: (c) => (
    <>
      <path d="M22 22 L58 58 M78 22 L42 58" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 18 L26 26 M74 18 L82 26" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </>
  )},
};

export default function GameIcon({ category, size = 60, className = '' }) {
  const icon = ICONS[category] || ICONS.Strategy;
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className={className} aria-hidden="true">
      {icon.svg(icon.color)}
    </svg>
  );
}

export function categoryColor(category) {
  return (ICONS[category] || ICONS.Strategy).color;
}