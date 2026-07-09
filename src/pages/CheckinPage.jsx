import { useState, useEffect } from 'react';
import { checkin, getStoredAuth } from '../api';

export default function CheckinPage() {
  const [status, setStatus] = useState('loading'); // loading | success | error | no-table
  const [session, setSession] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [table, setTable] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    setTable(tableParam);

    if (!tableParam) {
      setStatus('no-table');
      return;
    }

    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret) {
      window.location.href = `/login?table=${tableParam}`;
      return;
    }

    checkin({ table: tableParam, apiKey, apiSecret })
      .then((data) => {
        const payload = data && data.message;
        if (!payload) throw new Error('Unexpected server response.');
        setSession(payload);
        setStatus('success');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Could not check you in. Please try again.');
        setStatus('error');
      });
  }, []);

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
        <div className="bg-[#1B4332] px-8 pt-10 pb-8 text-center">
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
        </div>

        <div className="px-8 py-10 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
          {status === 'loading' && (
            <>
              <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#E8DFC8] border-t-[#D64550] rounded-full animate-spin" />
              <p className="text-[#3D2817] font-medium">Checking you in{table ? ` at Table ${table}` : ''}...</p>
            </>
          )}

          {status === 'no-table' && (
            <>
              <div className="text-5xl mb-4">🎲</div>
              <h2 className="text-xl font-bold text-[#3D2817] mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                No table found
              </h2>
              <p className="text-[#8A7967] text-sm">
                Please scan the QR code at your table to check in.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">😕</div>
              <h2 className="text-xl font-bold text-[#3D2817] mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                Check-in failed
              </h2>
              <p className="text-[#D64550] text-sm bg-[#D64550]/10 border border-[#D64550]/30 rounded-xl px-4 py-2.5">
                {errorMsg}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 w-full bg-[#D64550] hover:bg-[#C43A44] text-[#FFF8ED] font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                Try Again
              </button>
            </>
          )}

          {status === 'success' && session && (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-[#3D2817] mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                You're checked in!
              </h2>
              <p className="text-[#8A7967] text-sm mb-6">
                Table {session.table} · Party of {session.party_size}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = `/games?session=${session.name}`)}
                  className="w-full bg-[#D64550] hover:bg-[#C43A44] text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🎲</span> Browse Games
                </button>

                <button
                  onClick={() => (window.location.href = `/food?session=${session.name}`)}
                  className="w-full bg-[#1B4332] hover:bg-[#163a2a] text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🍴</span> Order Food
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}