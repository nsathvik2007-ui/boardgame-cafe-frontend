import { useState, useEffect } from 'react';
import { signup, login, storeAuth } from '../api';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [table, setTable] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTable(params.get('table'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.email.includes('@')) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (mode === 'signup') {
      if (!form.fullName.trim()) return 'Full name is required.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data =
        mode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await signup({ email: form.email, full_name: form.fullName, password: form.password });

      const payload = data && data.message;
      if (!payload || !payload.api_key || !payload.api_secret) {
        throw new Error('Unexpected server response. Please try again.');
      }

      storeAuth(payload.api_key, payload.api_secret);
      window.location.href = table ? `/checkin?table=${table}` : '/checkin';
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const holes = Array.from({ length: 18 });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundColor: '#0F1035',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(242,183,5,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(176,32,42,0.10) 0%, transparent 45%)',
      }}
    >
      <div className="box-settle w-full max-w-md">
        {/* BOX LID */}
        <div
          className="rounded-t-2xl px-8 pt-10 pb-8 relative overflow-hidden"
          style={{ backgroundColor: '#1A1B4B' }}
        >
          {/* corner stamp */}
          <div
            className="absolute top-5 right-5 w-12 h-12 rounded-full border-2 flex items-center justify-center text-center z-10"
            style={{ borderColor: '#F2B705' }}
          >
            <span
              className="text-[8px] leading-tight tracking-wider"
              style={{ color: '#F2B705', fontFamily: "'Space Mono', monospace" }}
            >
              EST.<br />2026
            </span>
          </div>

          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: '#F2B705', fontFamily: "'Space Mono', monospace" }}
          >
            A Table Game Experience
          </p>

          <h1
            className="text-5xl mb-4 pr-14"
            style={{ color: '#FCF6E8', fontFamily: "'Anton', sans-serif", letterSpacing: '0.01em', lineHeight: 1 }}
          >
            <span className="block">BOARDGAME</span>
            <span className="block mt-2.5">CAFÉ</span>
          </h1>

          <p className="text-sm max-w-[70%] relative z-10" style={{ color: '#C9CAE8', fontFamily: "'Karla', sans-serif" }}>
            Pull up a chair. Pick your game. We'll keep score.
          </p>

          {/* Spec strip, like a box-back panel */}
          <div
            className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 pt-4 border-t relative z-10"
            style={{ borderColor: 'rgba(252,246,232,0.15)' }}
          >
            {['PARTY: 1–8', 'SESSION: YOU DECIDE', 'SKILL: ALL WELCOME'].map((spec) => (
              <span
                key={spec}
                className="text-[10px] tracking-wider uppercase"
                style={{ color: '#8E90C4', fontFamily: "'Space Mono', monospace" }}
              >
                {spec}
              </span>
            ))}
          </div>

          {table && (
            <div
              className="mt-5 inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wide relative z-10"
              style={{ backgroundColor: '#F2B705', color: '#1A1B4B', fontFamily: "'Space Mono', monospace" }}
            >
              TABLE {table} · CHECKING IN
            </div>
          )}

          {/* Engraved-line illustration: die + meeple, bleeding off the corner */}
          <svg
            viewBox="0 0 140 140"
            className="absolute -bottom-4 -right-4 w-36 h-36 opacity-80 pointer-events-none"
            style={{ color: '#F2B705' }}
          >
            {/* isometric die */}
            <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round">
              <path d="M35 38 L62 24 L89 38 L62 52 Z" />
              <path d="M35 38 L35 68 L62 82 L62 52 Z" />
              <path d="M89 38 L89 68 L62 82 L62 52 Z" />
              {/* pips, top face */}
              <circle cx="62" cy="38" r="2.1" fill="currentColor" stroke="none" />
              <circle cx="50" cy="33" r="2.1" fill="currentColor" stroke="none" />
              <circle cx="74" cy="43" r="2.1" fill="currentColor" stroke="none" />
              {/* shading hatch, left face */}
              <path d="M39 44 L46 48 M39 51 L46 55 M39 58 L46 62" strokeWidth="1" opacity="0.55" />
            </g>
            {/* meeple */}
            <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity="0.9">
              <path d="M108 18c6 0 10 4.5 10 10 0 3.8-2.2 7-5.4 8.6l10.6 9.2c3.8 3.8 6 9 6 14.4l-3.8 15.2h-6.8l-2.3 12.8h-16.6l-2.3-12.8h-6.8L94.6 60.2c0-5.4 2.2-10.6 6-14.4l10.6-9.2c-3.2-1.6-5.4-4.8-5.4-8.6 0-5.5 4-10 10-10z" />
            </g>
          </svg>
        </div>

        {/* PERFORATED TEAR LINE */}
        <div className="relative h-4" style={{ backgroundColor: '#1A1B4B' }}>
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed"
            style={{ borderColor: '#4A4B7A' }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3">
            {holes.map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: '#0F1035' }}
              />
            ))}
          </div>
        </div>

        {/* PUNCH-OUT FORM CARD */}
        <div className="rounded-b-2xl px-8 pb-8 pt-6 shadow-2xl" style={{ backgroundColor: '#FCF6E8' }}>
          <div className="flex rounded-lg overflow-hidden border-2 mb-6" style={{ borderColor: '#1A1B4B' }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  backgroundColor: mode === m ? '#1A1B4B' : 'transparent',
                  color: mode === m ? '#FCF6E8' : '#1A1B4B',
                }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: "'Karla', sans-serif" }}>
            {mode === 'signup' && (
              <div>
                <label
                  className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: '#1A1B4B', fontFamily: "'Space Mono', monospace" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1A1B4B] placeholder-[#A8A090] focus:outline-none transition-colors"
                  style={{ borderColor: '#E3D9C0' }}
                  onFocus={(e) => (e.target.style.borderColor = '#F2B705')}
                  onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
                />
              </div>
            )}

            <div>
              <label
                className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: '#1A1B4B', fontFamily: "'Space Mono', monospace" }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1A1B4B] placeholder-[#A8A090] focus:outline-none transition-colors"
                style={{ borderColor: '#E3D9C0' }}
                onFocus={(e) => (e.target.style.borderColor = '#F2B705')}
                onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: '#1A1B4B', fontFamily: "'Space Mono', monospace" }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1A1B4B] placeholder-[#A8A090] focus:outline-none transition-colors"
                style={{ borderColor: '#E3D9C0' }}
                onFocus={(e) => (e.target.style.borderColor = '#F2B705')}
                onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label
                  className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: '#1A1B4B', fontFamily: "'Space Mono', monospace" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1A1B4B] placeholder-[#A8A090] focus:outline-none transition-colors"
                  style={{ borderColor: '#E3D9C0' }}
                  onFocus={(e) => (e.target.style.borderColor = '#F2B705')}
                  onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
                />
              </div>
            )}

            {error && (
              <div
                className="text-sm px-4 py-2.5 rounded-lg font-medium border-2"
                style={{ backgroundColor: '#FBEAEA', borderColor: '#B0202A', color: '#B0202A' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide"
              style={{
                backgroundColor: loading ? '#8E90C4' : '#B0202A',
                color: '#FCF6E8',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#FCF6E8]/40 border-t-[#FCF6E8] rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'Log In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
