import { useState, useEffect } from 'react';
import { getAvailableGames, getFirstAvailableCopy, checkoutGame, getStoredAuth } from '../api';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingOut, setCheckingOut] = useState(null);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSession(params.get('session'));

    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret) {
      window.location.href = '/login';
      return;
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
    <div className="min-h-screen bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-[#1B4332] px-6 py-6 text-center border-b border-[#F4A340]/20">
        <div className="w-12 h-12 mx-auto mb-2 bg-[#F4A340] rounded-xl rotate-12 shadow-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-[#FFF8ED] rounded-md grid grid-cols-3 grid-rows-3 gap-0.5 p-1 -rotate-12">
            {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
              <span key={i} className={`rounded-full ${active ? 'bg-[#D64550]' : ''}`} />
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
          <div className="grid sm:grid-cols-2 gap-4">
            {games.map((game) => (
              <div
                key={game.name}
                className="bg-[#FFF8ED] rounded-2xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      {game.game_name}
                    </h3>
                    <span className="shrink-0 text-xs font-semibold bg-[#1B4332]/10 text-[#1B4332] px-2.5 py-1 rounded-full">
                      {game.category}
                    </span>
                  </div>

                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#8A7967] mb-3">
                     <span>👥 {game.min_players}-{game.max_players} players</span>
                                       <span>⏱ {game.avg_play_time_minutes} min</span>
                                       <span>📊 {game.complexity_rating}</span>
                                       </div>
                           <div className="text-[#3D2817] font-bold text-lg mb-3">
                                   ₹{game.rental_price}
                                        </div>

                  <div
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${
                      game.available_copies > 0
                        ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                        : 'bg-[#D64550]/10 text-[#D64550]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${game.available_copies > 0 ? 'bg-[#2D6A4F]' : 'bg-[#D64550]'}`} />
                    {game.available_copies > 0
                      ? `${game.available_copies} copy${game.available_copies > 1 ? 'ies' : ''} available`
                      : 'All copies checked out'}
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout(game)}
                  disabled={game.available_copies === 0 || checkingOut === game.name}
                  className="w-full py-3 bg-[#D64550] hover:bg-[#C43A44] disabled:bg-[#B8AC94] disabled:cursor-not-allowed text-[#FFF8ED] font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {checkingOut === game.name ? (
                    <span className="w-4 h-4 border-2 border-[#FFF8ED]/40 border-t-[#FFF8ED] rounded-full animate-spin" />
                  ) : game.available_copies === 0 ? (
                    'Unavailable'
                  ) : (
                    'Check Out This Game'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}