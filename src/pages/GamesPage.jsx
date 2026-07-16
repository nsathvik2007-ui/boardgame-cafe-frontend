import { useState, useEffect } from 'react';
import { getAvailableGames, getFirstAvailableCopy, checkoutGame, getSession, getStoredAuth } from '../api';
import JourneyPath from '../components/JourneyPath';
import GameCard from '../components/GameCard';
import CafeBackground from '../components/CafeBackground';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingOut, setCheckingOut] = useState(null);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);
  const [table, setTable] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');
    setSession(sessionId);
    setTable(params.get('table'));

    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret) {
      window.location.href = '/login';
      return;
    }

    if (!params.get('table') && sessionId) {
      getSession({ sessionId, apiKey, apiSecret })
        .then((data) => setTable(data.data.table))
        .catch(() => {});
    }

    getAvailableGames({ apiKey, apiSecret })
      .then((data) => {
        setGames(data.message || []);
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Could not load games.');
        setStatus('error');
      });
  }, []);

  const handleCheckout = async (game) => {
    setCheckingOut(game.name);
    setToast('');
    const { apiKey, apiSecret } = getStoredAuth();

    try {
      const copyRes = await getFirstAvailableCopy({ gameTitle: game.name, apiKey, apiSecret });
      const copyId = copyRes.message;

      await checkoutGame({ customerSession: session, gameCopy: copyId, apiKey, apiSecret });

      setToast(`${game.game_name} checked out! Enjoy your game.`);
      setGames((prev) =>
        prev.map((g) =>
          g.name === game.name ? { ...g, available_copies: g.available_copies - 1 } : g
        )
      );
    } catch (err) {
      setToast(err.message || 'Could not check out this game.');
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CafeBackground />
      {/* Header */}
      <div className="relative bg-[#1B4332] px-6 py-6 text-center border-b border-[#F4A340]/20">
        {table && (
          <button
            onClick={() => (window.location.href = `/checkin?table=${table}`)}
            className="absolute top-6 left-4 flex items-center gap-1.5 text-sm font-medium text-[#FFF8ED]/80 hover:text-[#FFF8ED] transition-colors"
          >
            <span className="text-lg leading-none">←</span> Back
          </button>
        )}
        <div className="w-12 h-12 mx-auto mb-2 bg-[#F4A340] rounded-xl rotate-12 shadow-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-[#FFF8ED] rounded-md grid grid-cols-3 grid-rows-3 gap-0.5 p-1 -rotate-12">
            {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
              <span key={i} className={`rounded-full ${active ? 'bg-[#FF5A3C] shadow-[0_0_2px_rgba(255,90,60,0.6)]' : ''}`} />
            ))}
          </div>
        </div>
        <h1 className="text-2xl text-[#FFF8ED]" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
          Game Library
        </h1>
        <p className="text-[#F4A340] text-sm mt-0.5">Pick something to play at your table</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="max-w-3xl mx-auto mt-4 px-4">
          <div className="bg-[#FFF8ED] border border-[#F4A340]/40 text-[#3D2817] text-sm px-4 py-3 rounded-xl shadow-lg text-center font-medium">
            {toast}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <JourneyPath currentStep={1} />

        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#F4A340]/30 border-t-[#F4A340] rounded-full animate-spin" />
            <p className="text-[#FFF8ED]/80">Loading the library...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-[#FFF8ED] font-medium">{errorMsg}</p>
          </div>
        )}

        {status === 'ready' && games.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-[#FFF8ED] font-medium">No games in the library yet.</p>
          </div>
        )}

        {status === 'ready' && games.length > 0 && (
          <div className="flex flex-wrap gap-6 justify-center">
            {games.map((game, i) => (
              <GameCard
                key={game.name}
                game={game}
                index={i}
                onCheckout={handleCheckout}
                checkingOut={checkingOut}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}