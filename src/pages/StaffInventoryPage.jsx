import { useState, useEffect } from 'react';
import { getCheckedOutGames, returnGame, getStoredAuth, getIsStaff, clearAuth } from '../api';
import CafeBackground from '../components/CafeBackground';

export default function StaffInventoryPage() {
  const [checkouts, setCheckouts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [actingOn, setActingOn] = useState(null);

  useEffect(() => {
    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret || !getIsStaff()) {
      window.location.href = '/login';
      return;
    }

    loadCheckouts();
  }, []);

  const loadCheckouts = () => {
    const { apiKey, apiSecret } = getStoredAuth();
    getCheckedOutGames({ apiKey, apiSecret })
      .then((data) => {
        setCheckouts(data.message || []);
        setStatus('ready');
      })
      .catch((err) => {
        clearAuth();
        setErrorMsg(err.message || 'Could not load checked-out games.');
        setStatus('error');
      });
  };

  const handleReturn = async (checkout, pieceCheckStatus) => {
    setActingOn(checkout.name);
    const { apiKey, apiSecret } = getStoredAuth();
    try {
      await returnGame({ gameCheckout: checkout.name, pieceCheckStatus, apiKey, apiSecret });
      loadCheckouts();
    } catch (err) {
      setErrorMsg(err.message || 'Could not process the return.');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CafeBackground />

      <div className="relative bg-[#1B4332] px-6 py-6 border-b border-[#F4A340]/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => (window.location.href = '/staff')}
            className="flex items-center gap-1.5 text-sm font-medium text-[#FFF8ED]/80 hover:text-[#FFF8ED] transition-colors"
          >
            <span className="text-lg leading-none">←</span> Back
          </button>
          <div className="text-center">
            <h1 className="text-xl text-[#FFF8ED]" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
              🎲 Inventory Check
            </h1>
          </div>
          <div className="w-14" />
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#F4A340]/30 border-t-[#F4A340] rounded-full animate-spin" />
            <p className="text-[#FFF8ED]/80">Loading checked-out games...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-[#FFF8ED] font-medium mb-2">{errorMsg}</p>
            <a href="/login" className="text-[#F4A340] underline text-sm">Back to login</a>
          </div>
        )}

        {status === 'ready' && checkouts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-[#FFF8ED] font-medium">Every copy is back on the shelf.</p>
          </div>
        )}

        {status === 'ready' && checkouts.length > 0 && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-[#D64550]/10 border border-[#D64550]/30 text-[#D64550] text-sm px-4 py-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {checkouts.map((checkout) => (
              <div key={checkout.name} className="bg-[#FFF8ED] rounded-2xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[#E8DFC8]">
                  <span className="font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    Table {checkout.table}
                  </span>
                  <span className="text-xs text-[#8A7967]">
                    since {new Date(checkout.checkout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="px-5 py-4">
                  <h3 className="font-bold text-lg text-[#3D2817] mb-0.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {checkout.game_title}
                  </h3>
                  <p className="text-xs text-[#8A7967] mb-4">
                    Copy {checkout.copy_code} · {checkout.customer}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReturn(checkout, 'Verification Complete')}
                      disabled={actingOn === checkout.name}
                      className="flex-1 bg-[#2D6A4F] hover:bg-[#255a42] disabled:opacity-60 text-[#FFF8ED] text-sm font-bold py-2.5 rounded-xl transition-colors"
                    >
                      {actingOn === checkout.name ? 'Saving...' : '✓ All Pieces Present'}
                    </button>
                    <button
                      onClick={() => handleReturn(checkout, 'Missing Pieces')}
                      disabled={actingOn === checkout.name}
                      className="flex-1 bg-[#D64550] hover:bg-[#C43A44] disabled:opacity-60 text-[#FFF8ED] text-sm font-bold py-2.5 rounded-xl transition-colors"
                    >
                      {actingOn === checkout.name ? 'Saving...' : '⚠ Missing Pieces'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
