import { useState, useEffect } from 'react';
import { signup, login, storeAuth, storeIsStaff } from '../api';
import CafeBackground from '../components/CafeBackground';

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

      const roles = payload.roles || [];
      const isStaff = payload.user === 'Administrator' || roles.includes('Cafe Staff');
      storeIsStaff(isStaff);

      if (isStaff) {
        window.location.href = '/staff';
      } else {
        window.location.href = table ? `/checkin?table=${table}` : '/checkin';
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const holes = Array.from({ length: 18 });

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      <CafeBackground />
      <div className="box-settle w-full max-w-md relative">
        {/* BOX LID */}
        <div
          className="rounded-t-2xl px-8 pt-10 pb-8 relative overflow-hidden"
          style={{ backgroundColor: '#1B4332' }}
        >
          {/* dot-grid texture, matches the site background */}
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: 'radial-gradient(circle, #F4A340 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* warm glow behind the title */}
          <div
            className="absolute -top-16 -left-10 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(244,163,64,0.20) 0%, transparent 70%)' }}
          />

          {/* corner ribbon banner */}
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-10">
            <div
              className="absolute shadow-md flex items-center justify-center"
              style={{
                top: 24,
                right: -52,
                width: 200,
                padding: '5px 0',
                backgroundColor: '#F4A340',
                transform: 'rotate(45deg)',
              }}
            >
              <span
                className="text-[10px] font-bold tracking-[0.2em]"
                style={{ color: '#1B4332', fontFamily: "'Space Mono', monospace" }}
              >
                EST. 2026
              </span>
            </div>
          </div>

          <p
            className="text-xs tracking-[0.3em] uppercase mb-3 relative z-10"
            style={{ color: '#F4A340', fontFamily: "'Space Mono', monospace" }}
          >
            A Table Game Experience
          </p>

          <h1
            className="text-5xl mb-4 pr-14 relative z-10"
            style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.01em', lineHeight: 1 }}
          >
            <span className="block" style={{ color: '#FFF8ED' }}>BOARDGAME</span>
            <span className="block mt-2.5" style={{ color: '#F4A340' }}>CAFÉ</span>
          </h1>

          <p className="text-sm max-w-[70%] relative z-10" style={{ color: 'rgba(255,248,237,0.75)', fontFamily: "'Karla', sans-serif" }}>
            Pull up a chair. Pick your game. We'll keep score.
          </p>

          {/* Spec strip, like a box-back panel */}
          <div className="mt-6 relative z-10">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 2 ? 5 : 4,
                    height: i === 2 ? 5 : 4,
                    backgroundColor: '#F4A340',
                    opacity: i === 2 ? 0.9 : 0.35,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
              {['PARTY: 1–8', 'SESSION: YOU DECIDE', 'SKILL: ALL WELCOME'].map((spec) => (
                <span
                  key={spec}
                  className="text-[10px] tracking-wider uppercase"
                  style={{ color: 'rgba(255,248,237,0.55)', fontFamily: "'Space Mono', monospace" }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {table && (
            <div
              className="mt-5 inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wide relative z-10"
              style={{ backgroundColor: '#F4A340', color: '#1B4332', fontFamily: "'Space Mono', monospace" }}
            >
              TABLE {table} · CHECKING IN
            </div>
          )}

          {/* Hero illustration: the classic Wikimedia/Cburnett chess knight (CC-BY-SA/GFDL), recolored to theme */}
          <svg
            viewBox="0 0 45 45"
            className="absolute bottom-20 -right-2 w-44 h-44 pointer-events-none z-10"
          >
            <g style={{ fill: 'none', fillRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round' }} transform="translate(0,0.3)">
              <path
                d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
                style={{ fill: '#F4A340', stroke: '#F4A340', strokeWidth: 1.5 }}
              />
              <path
                d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
                style={{ fill: '#F4A340', stroke: '#F4A340', strokeWidth: 1.5 }}
              />
              <path
                d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
                style={{ fill: '#1B4332', stroke: '#1B4332', strokeWidth: 1.5 }}
              />
              <path
                d="M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z"
                transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
                style={{ fill: '#1B4332', stroke: '#1B4332', strokeWidth: 1.5 }}
              />
              <path
                d="M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z"
                style={{ fill: '#1B4332', stroke: 'none' }}
              />
            </g>
          </svg>
        </div>

        {/* PERFORATED TEAR LINE */}
        <div className="relative h-4" style={{ backgroundColor: '#1B4332' }}>
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed"
            style={{ borderColor: 'rgba(244,163,64,0.35)' }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3">
            {holes.map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: 'rgba(11,35,24,0.55)' }}
              />
            ))}
          </div>
        </div>

        {/* PUNCH-OUT FORM CARD */}
        <div className="rounded-b-2xl px-8 pb-8 pt-6 shadow-2xl" style={{ backgroundColor: '#FFF8ED' }}>
          <div className="flex rounded-lg overflow-hidden border-2 mb-6" style={{ borderColor: '#1B4332' }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  backgroundColor: mode === m ? '#1B4332' : 'transparent',
                  color: mode === m ? '#FFF8ED' : '#1B4332',
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
                  style={{ color: '#1B4332', fontFamily: "'Space Mono', monospace" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1B4332] placeholder-[#A8A090] focus:outline-none transition-colors"
                  style={{ borderColor: '#E3D9C0' }}
                  onFocus={(e) => (e.target.style.borderColor = '#F4A340')}
                  onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
                />
              </div>
            )}

            <div>
              <label
                className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: '#1B4332', fontFamily: "'Space Mono', monospace" }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1B4332] placeholder-[#A8A090] focus:outline-none transition-colors"
                style={{ borderColor: '#E3D9C0' }}
                onFocus={(e) => (e.target.style.borderColor = '#F4A340')}
                onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: '#1B4332', fontFamily: "'Space Mono', monospace" }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1B4332] placeholder-[#A8A090] focus:outline-none transition-colors"
                style={{ borderColor: '#E3D9C0' }}
                onFocus={(e) => (e.target.style.borderColor = '#F4A340')}
                onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label
                  className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: '#1B4332', fontFamily: "'Space Mono', monospace" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border-2 bg-white text-[#1B4332] placeholder-[#A8A090] focus:outline-none transition-colors"
                  style={{ borderColor: '#E3D9C0' }}
                  onFocus={(e) => (e.target.style.borderColor = '#F4A340')}
                  onBlur={(e) => (e.target.style.borderColor = '#E3D9C0')}
                />
              </div>
            )}

            {error && (
              <div
                className="text-sm px-4 py-2.5 rounded-lg font-medium border-2"
                style={{ backgroundColor: '#FBEAEA', borderColor: '#D64550', color: '#D64550' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide"
              style={{
                backgroundColor: loading ? '#6B8F7C' : '#D64550',
                color: '#FFF8ED',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#FFF8ED]/40 border-t-[#FFF8ED] rounded-full animate-spin" />
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
