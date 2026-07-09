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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFF8ED 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,163,64,0.22) 0%, rgba(244,163,64,0.08) 35%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-md bg-[#FFF8ED] rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#1B4332] px-8 pt-10 pb-8 text-center relative">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#F4A340] rounded-2xl rotate-12 shadow-lg flex items-center justify-center">
            <div className="w-10 h-10 bg-[#FFF8ED] rounded-lg grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 -rotate-12">
              {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
                <span key={i} className={`rounded-full ${active ? 'bg-[#D64550]' : ''}`} />
              ))}
            </div>
          </div>
          <h1 className="text-3xl text-[#FFF8ED] tracking-tight" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
            BoardGame Café
          </h1>
          <p className="text-[#F4A340] text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Where every roll tells a story
          </p>
          {table && (
            <div className="mt-3 inline-block bg-[#F4A340]/20 border border-[#F4A340]/40 text-[#F4A340] text-xs font-semibold px-3 py-1.5 rounded-full">
              Checking in for Table {table}
            </div>
          )}
        </div>

        <div className="px-8 pt-6">
          <div className="relative bg-[#E8DFC8] rounded-full p-1 flex">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#D64550] rounded-full shadow transition-transform duration-300 ease-out"
              style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
            />
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
                  mode === m ? 'text-[#FFF8ED]' : 'text-[#3D2817]'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#3D2817] mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Alex Rivera"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DFC8] bg-white text-[#3D2817] placeholder-[#B8AC94] focus:outline-none focus:border-[#F4A340] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#3D2817] mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DFC8] bg-white text-[#3D2817] placeholder-[#B8AC94] focus:outline-none focus:border-[#F4A340] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D2817] mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DFC8] bg-white text-[#3D2817] placeholder-[#B8AC94] focus:outline-none focus:border-[#F4A340] transition-colors"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#3D2817] mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DFC8] bg-white text-[#3D2817] placeholder-[#B8AC94] focus:outline-none focus:border-[#F4A340] transition-colors"
              />
            </div>
          )}

          {error && (
            <div className="bg-[#D64550]/10 border border-[#D64550]/30 text-[#D64550] text-sm px-4 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D64550] hover:bg-[#C43A44] disabled:opacity-60 text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#FFF8ED]/40 border-t-[#FFF8ED] rounded-full animate-spin" />
            ) : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}