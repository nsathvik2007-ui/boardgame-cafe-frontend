// Static decorative background shared by every post-login page:
// dot grid + a board-trail path + scattered game pieces, all motionless.
export default function CafeBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, #F4A340 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,163,64,0.18) 0%, rgba(244,163,64,0.06) 35%, transparent 70%)',
        }}
      />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <path
          d="M -50 700 C 200 600, 300 800, 500 650 S 800 400, 950 500 S 1250 300, 1400 380 S 1650 250, 1750 300"
          fill="none"
          stroke="#F4A340"
          strokeWidth="2"
          strokeDasharray="6 10"
          opacity="0.35"
        />
        <circle cx="244" cy="694" r="6" fill="#F4A340" opacity="0.7" />
        <circle cx="500" cy="650" r="5" fill="#F4A340" opacity="0.6" />
        <circle cx="950" cy="500" r="6" fill="#F4A340" opacity="0.7" />
        <circle cx="1400" cy="380" r="5" fill="#F4A340" opacity="0.6" />
        <circle cx="1594" cy="351" r="6" fill="#F4A340" opacity="0.7" />
      </svg>

      <svg className="absolute opacity-[0.55]" style={{ top: '8%', left: '10%', width: 110, transform: 'rotate(-12deg)' }} viewBox="0 0 100 100">
        <rect x="20" y="20" width="60" height="60" rx="14" fill="none" stroke="#F4A340" strokeWidth="6" />
        <circle cx="38" cy="38" r="5.5" fill="#F4A340" />
        <circle cx="62" cy="62" r="5.5" fill="#F4A340" />
        <circle cx="50" cy="50" r="5.5" fill="#F4A340" />
      </svg>
      <svg className="absolute opacity-[0.55]" style={{ top: '62%', left: '5%', width: 90, transform: 'rotate(18deg)' }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="34" fill="none" stroke="#F4A340" strokeWidth="6" />
      </svg>
      <svg className="absolute opacity-[0.55]" style={{ top: '16%', left: '82%', width: 100, transform: 'rotate(-8deg)' }} viewBox="0 0 100 60">
        <rect x="8" y="6" width="42" height="48" rx="5" fill="#F4A340" transform="rotate(-8 29 30)" />
      </svg>
      <svg className="absolute opacity-[0.55]" style={{ top: '70%', left: '80%', width: 95, transform: 'rotate(10deg)' }} viewBox="0 0 100 100">
        <path d="M50 6 L90 30 L90 70 L50 94 L10 70 L10 30 Z" fill="none" stroke="#F4A340" strokeWidth="6" />
      </svg>
      <svg className="absolute opacity-[0.55]" style={{ top: '40%', left: '46%', width: 80, transform: 'rotate(-16deg)' }} viewBox="0 0 100 100">
        <rect x="15" y="15" width="70" height="70" rx="16" fill="none" stroke="#F4A340" strokeWidth="6" />
        <circle cx="35" cy="35" r="6.5" fill="#F4A340" />
        <circle cx="65" cy="65" r="6.5" fill="#F4A340" />
      </svg>
    </div>
  );
}
